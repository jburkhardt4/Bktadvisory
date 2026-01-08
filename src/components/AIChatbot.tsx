import { useState, useEffect, useRef } from "react";
import {
  MessageCircle,
  X,
  Send,
  Copy,
  Check,
  Sparkles,
  Loader2,
} from "lucide-react";
import { projectId, publicAnonKey } from "../utils/supabase/info";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  isJson?: boolean;
  showActionButtons?: boolean; // New flag to control Copy/Use This Prompt buttons
}

interface AIChatbotProps {
  currentPage: "home" | "estimator" | "quote";
  currentStep?: number;
  formData?: any;
  onInsertPrompt?: (prompt: string) => void;
  onAutofill?: (data: any) => void;
  aiActionTrigger?: { type: 'generate' | 'autofill', timestamp: number } | null;
}

export function AIChatbot({
  currentPage,
  currentStep = 1,
  formData,
  onInsertPrompt,
  onAutofill,
  aiActionTrigger,
}: AIChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [hasGreeted, setHasGreeted] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Initial greeting based on page
  useEffect(() => {
    if (!hasGreeted) {
      const greeting =
        currentPage === "estimator"
          ? "Hi there! 👋 I'm here to help you with the Tech Project Estimator. I can help you draft a structured project description to get the most accurate estimate. Just tell me about your project goals!"
          : "Hello! 👋 Welcome to BKT Advisory. I'm your AI assistant. I can help you scope your project, answer questions about our services, or guide you through the estimation process.";

      setMessages([
        {
          id: "1",
          text: greeting,
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
      setHasGreeted(true);
    }
  }, [currentPage, hasGreeted]);

  // Reset greeting when page changes
  useEffect(() => {
    setHasGreeted(false);
  }, [currentPage]);

  // Handle external AI triggers
  useEffect(() => {
    if (aiActionTrigger) {
      setIsOpen(true);
      if (aiActionTrigger.type === 'generate') {
        handleGenerateFromSelections();
      } else if (aiActionTrigger.type === 'autofill') {
        handleAutofillFromDescription();
      }
    }
  }, [aiActionTrigger]);

  // Auto-resize textarea and adjust padding for scrollbar
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to auto to correctly calculate scrollHeight
    textarea.style.height = "auto";
    
    const maxHeight = 88; // Approx 4 lines
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);
    
    textarea.style.height = `${newHeight}px`;
    
    // Check if scrollbar is needed (content exceeds max height)
    // We compare scrollHeight against maxHeight. 
    // Note: scrollHeight includes padding. 
    const isScrollable = textarea.scrollHeight > maxHeight;
    
    textarea.style.overflowY = isScrollable ? "auto" : "hidden";
    
    // Reduce left padding (16px default) by scrollbar width (6px) -> 10px
    // to keep visual balance when scrollbar appears
    textarea.style.paddingLeft = isScrollable ? "10px" : "16px";
    
  }, [inputValue]);

  const handleSendMessage = async (textOverride?: string, showActionButtons: boolean = false) => {
    const text = typeof textOverride === "string" ? textOverride : inputValue;
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Prepare payload for API
      const payload = {
        current_page: currentPage,
        current_date: new Date().toLocaleDateString(),
        project_goals: userMessage.text,
      };

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-defb8dbd/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          // If it's not JSON, it's likely a server runtime error (HTML/text)
          throw new Error(`Server Error (${response.status}): ${errorText.substring(0, 200)}`);
        }
        
        throw new Error(errorData.details || errorData.error || `Server Error: ${response.status}`);
      }

      const data = await response.json();

      let botText = data.content || "";
      let isJson = false;
      let parsedJson = null;

      // Try to detect and parse JSON from the response text
      try {
        let jsonStr = botText.trim();
        
        // Handle markdown code blocks which o1 often uses
        const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (codeBlockMatch) {
          jsonStr = codeBlockMatch[1].trim();
        }

        // Simple check if it looks like JSON
        if (jsonStr.startsWith('{') || jsonStr.startsWith('[')) {
          parsedJson = JSON.parse(jsonStr);
          isJson = true;
          
          // If it's a configuration object for autofill
          if (parsedJson.selectedCRMs || parsedJson.selectedClouds || parsedJson.selectedIntegrations) {
            botText = "I've analyzed your project description and found the following configuration. Would you like to apply these to your estimator?";
            // Auto-apply if it's an autofill request? 
            // The user said "Action: ... update the Step 2 & 3 checkboxes."
            // So we'll apply it and also show a message.
            if (onAutofill) {
              onAutofill(parsedJson);
              botText = "✅ **Estimator Updated!** I've automatically selected the CRMs, Clouds, and Tools based on your description.\n\n" + 
                        "**Configuration Applied:**\n" +
                        (parsedJson.selectedCRMs?.length ? `- **CRMs:** ${parsedJson.selectedCRMs.join(', ')}\n` : "") +
                        (parsedJson.selectedClouds?.length ? `- **Clouds:** ${parsedJson.selectedClouds.join(', ')}\n` : "") +
                        (parsedJson.selectedIntegrations?.length ? `- **Integrations:** ${parsedJson.selectedIntegrations.join(', ')}\n` : "") +
                        (parsedJson.selectedAITools?.length ? `- **AI Tools:** ${parsedJson.selectedAITools.join(', ')}\n` : "") +
                        (parsedJson.additionalModules?.length ? `- **Modules:** ${parsedJson.additionalModules.join(', ')}\n` : "");
            }
          } else {
            // Convert other JSON to readable markdown for the chat
            botText =
              `**PROJECT SCOPE**\n\n` +
              Object.entries(parsedJson)
                .map(([key, value]) => {
                  const formattedKey = key
                    .replace(/_/g, " ")
                    .toUpperCase();
                  return `**${formattedKey}**\n${value}`;
                })
                .join("\n\n");
          }
        }
      } catch (e) {
        // Not JSON, continue with original text
      }

      const botMessage: Message = {
        id: Date.now().toString() + "-bot",
        text: botText,
        sender: "bot",
        timestamp: new Date(),
        isJson: isJson,
        showActionButtons: showActionButtons, // Use the parameter passed in
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        id: Date.now().toString() + "-error",
        text: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
        sender: "bot",
        timestamp: new Date(),
        isJson: false,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (text: string, messageId: string) => {
    try {
      // Try modern Clipboard API first
      await navigator.clipboard.writeText(text);
      setCopiedId(messageId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      // Fallback to older method if Clipboard API is blocked
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
        setCopiedId(messageId);
        setTimeout(() => setCopiedId(null), 2000);
      } catch (fallbackErr) {
        console.error('Failed to copy text:', fallbackErr);
        // Still show the copied state to indicate the attempt
        setCopiedId(messageId);
        setTimeout(() => setCopiedId(null), 1000);
      }
    }
  };

  const handleUsePrompt = (text: string) => {
    if (onInsertPrompt) {
      onInsertPrompt(text);
      setIsOpen(false);
    }
  };

  const handleGenerateFromSelections = () => {
    if (!formData) return;
    const prompt = `Write a comprehensive project description based on these configurations: 
      - CRMs: ${formData.selectedCRMs.join(', ') || 'None selected'}
      - Clouds: ${formData.selectedClouds.join(', ') || 'None selected'}
      - Integrations: ${formData.selectedIntegrations.join(', ') || 'None selected'}
      - AI Tools: ${formData.selectedAITools.join(', ') || 'None selected'}
      - Modules: ${formData.additionalModules.join(', ') || 'None selected'}
      
      Format it as a professional project overview for BKT Advisory.`;
    handleSendMessage(prompt, true); // Pass true to show action buttons
  };

  const handleAutofillFromDescription = () => {
    if (!formData?.projectDescription?.trim()) {
      setIsOpen(true); // Open chat when empty
      handleSendMessage("I'd like to autofill the estimator, but the project description is empty. Can you please provide details using this format?\n\n- **Systems:** (e.g. Salesforce, Slack)\n- **Pain Points:** (e.g. manual data entry)\n- **Goals:** (e.g. automate lead routing)\n- **Users:** (e.g. 50 sales reps)");
      return;
    }

    // Check for critical information in the project description
    const description = formData.projectDescription.toLowerCase();
    const hasSystems = /salesforce|dynamics|gohighlevel|hubspot|monday|zoho|crm|slack|asana|jira|github|google|microsoft|zoom|docusign|make|zapier|n8n|mulesoft|cloud|integration/i.test(description);
    const hasPainPoints = /pain|challenge|issue|problem|difficulty|struggle|bottleneck|manual|inefficient/i.test(description);
    const hasGoals = /goal|outcome|objective|want|need|require|automate|improve|increase|reduce|streamline/i.test(description);
    const hasAutomations = /automate|automation|workflow|integrate|integration|connect|sync/i.test(description);
    const hasDeliverables = /deliver|deliverable|requirement|feature|functionality|capability|module/i.test(description);
    
    const missingCriticalInfo = [];
    if (!hasSystems) missingCriticalInfo.push('**Current systems/infrastructure**');
    if (!hasPainPoints) missingCriticalInfo.push('**Pain points/challenges**');
    if (!hasGoals) missingCriticalInfo.push('**Desired outcomes & goals**');
    if (!hasAutomations) missingCriticalInfo.push('**Required automations/integrations**');
    if (!hasDeliverables) missingCriticalInfo.push('**Key deliverables/requirements**');

    // If critical info is missing, open the chat and ask for it
    if (missingCriticalInfo.length > 0) {
      setIsOpen(true); // Open chat to request missing info
      const missingList = missingCriticalInfo.join('\n• ');
      handleSendMessage(`I'd like to autofill your estimator, but I need more information. Please add details about:\n\n• ${missingList}\n\nOptionally, you can also include:\n• Timeline & budget constraints\n\nThis will help me provide a more accurate configuration!`);
      return;
    }

    // If all critical info is present, autofill silently (don't open chat)
    const prompt = `Parse the following project description and return ONLY a JSON object containing the matching configurations. 
      Description: "${formData.projectDescription}"
      
      Use these keys: selectedCRMs, selectedClouds, selectedIntegrations, selectedAITools, additionalModules.
      
      Valid options for CRMs: Salesforce, Dynamics 365, GoHighLevel, HubSpot, Monday.com, Zoho.
      Valid Clouds: Sales Cloud, Service Cloud, Marketing Cloud, Commerce Cloud, Financial Services Cloud, Experience Cloud, Agentforce.
      Valid Integrations: Slack, Asana, Jira, GitHub, Google Workspace, Microsoft 365, Zoom, DocuSign, Make.com, Zapier, n8n, MuleSoft.
      Valid AI Tools: OpenAI ChatGPT, Gemini, Copilot, Claude.
      Valid Modules: Reporting and Dashboards, Workflow Automation, Custom Development, Lead Management, Data Migration, User Training.`;
    
    // Don't open chat - just send the message silently
    handleSendMessage(prompt, true); // Pass true to show action buttons
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 ${
          isOpen
            ? "bg-slate-700"
            : "bg-gradient-to-r from-blue-600 to-indigo-600"
        }`}
        aria-label="AI Assistant"
      >
        {isOpen ? (
          <X size={24} className="text-white" />
        ) : (
          <div className="relative">
            <MessageCircle size={24} className="text-white" />
            <Sparkles
              size={12}
              className="absolute -top-1 -right-1 text-yellow-300 animate-pulse"
            />
          </div>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[400px] max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden min-h-0">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="text-white">AI Assistant</h3>
                <p className="text-blue-100 text-sm">
                  Powered by OpenAI gpt-4.1
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 bg-slate-50 overscroll-contain chat-scroll-area [-webkit-overflow-scrolling:touch]">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    message.sender === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-white border border-slate-200 text-slate-800"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.text}
                  </p>

                  {/* Copy and Use Prompt buttons for bot messages that look like scopes */}
                  {message.sender === "bot" &&
                    message.showActionButtons && (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-slate-200">
                        <button
                          onClick={() =>
                            handleCopy(message.text, message.id)
                          }
                          className="flex items-center gap-1 text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-slate-700"
                        >
                          {copiedId === message.id ? (
                            <>
                              <Check size={14} />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy size={14} />
                              Copy
                            </>
                          )}
                        </button>
                        {onInsertPrompt && (
                          <button
                            onClick={() =>
                              handleUsePrompt(message.text)
                            }
                            className="flex items-center gap-1 text-xs px-3 py-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
                          >
                            <Sparkles size={14} />
                            Use This Prompt
                          </button>
                        )}
                      </div>
                    )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 flex items-center gap-2 text-slate-500">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-slate-200">
            {/* Quick Prompts */}
            <div className="mb-3 flex flex-wrap gap-2">
              {(currentPage === "estimator"
                ? (currentStep >= 2 
                    ? [
                        "Write Project Description based on my configurations.",
                        "Autofill the Project Estimator from my Project Description.",
                      ]
                    : []
                  )
                : [
                    "Schedule a call with John Burkhardt.",
                    "Guide me through the Project Estimator and get a Quote.",
                    "Please write me a project description.",
                  ]
              ).map((prompt, i) => {
                const isPrimaryAI = 
                  prompt === "Write Project Description based on my configurations." || 
                  prompt === "Autofill the Project Estimator from my Project Description.";
                
                return (
                  <button
                    key={i}
                    onClick={() => {
                      if (prompt === "Write Project Description based on my configurations.") {
                        handleGenerateFromSelections();
                      } else if (prompt === "Autofill the Project Estimator from my Project Description.") {
                        handleAutofillFromDescription();
                      } else {
                        handleSendMessage(prompt);
                      }
                    }}
                    disabled={isLoading}
                    className={`text-xs px-3 py-1.5 rounded-full transition-all text-left border flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed ${
                      isPrimaryAI
                        ? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300 hover:scale-[1.02] active:scale-[0.98] shadow-sm font-medium"
                        : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {isPrimaryAI && <Sparkles size={12} className="text-blue-500 animate-pulse" />}
                    {prompt}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSendMessage())
                }
                placeholder="Describe your project..."
                disabled={isLoading}
                rows={1}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 resize-none overflow-hidden min-h-[40px] max-h-[88px] chat-scroll-area"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}