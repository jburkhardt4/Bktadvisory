import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Copy, Check, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface AIChatbotProps {
  currentPage: 'home' | 'estimator' | 'quote';
  onInsertPrompt?: (prompt: string) => void;
}

export function AIChatbot({ currentPage, onInsertPrompt }: AIChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [hasGreeted, setHasGreeted] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial greeting based on page
  useEffect(() => {
    if (!hasGreeted) {
      const greeting = currentPage === 'estimator'
        ? "Hi there! 👋 I'm here to help you with the Tech Project Estimator. The more detail, documentation, and structure you provide in the form's description, the more accurate your timeline and estimate will be! Would you like me to help you draft a structured project description?"
        : "Hello! 👋 Welcome to BKT Advisory. I'm your AI assistant. How can I help you today?";

      setMessages([{
        id: '1',
        text: greeting,
        sender: 'bot',
        timestamp: new Date(),
      }]);
      setHasGreeted(true);
    }
  }, [currentPage, hasGreeted]);

  // Reset greeting when page changes
  useEffect(() => {
    setHasGreeted(false);
  }, [currentPage]);

  const generateProjectPrompt = () => {
    const prompt = `**PROJECT SCOPE & OBJECTIVES**
• What are your primary business goals for this project?
• What specific problems are you trying to solve?
• What does success look like for this implementation?

**CURRENT INFRASTRUCTURE**
• What CRM or systems are you currently using?
• What integrations do you already have in place?
• What data sources need to be connected?

**PAIN POINTS & CHALLENGES**
• What processes are manual that need automation?
• What bottlenecks exist in your current workflow?
• What compliance or security requirements must be met?

**DESIRED AUTOMATIONS & INTEGRATIONS**
• What systems need to talk to each other?
• What workflows should be automated?
• What third-party tools must be integrated?

**DELIVERABLES & REQUIREMENTS**
• What specific features or functionality do you need?
• What reports, dashboards, or analytics are required?
• What user roles and permissions are needed?

**STAKEHOLDERS & DECISION-MAKERS**
• Who are the key stakeholders involved?
• Who will be using this system daily?
• Who has final approval authority?

**TIMELINE & CONSTRAINTS**
• What is your ideal project start date?
• Are there any hard deadlines (e.g., fiscal year end)?
• What is your budget range for this project?

**ADDITIONAL CONTEXT**
• Are there any regulatory requirements?
• What is your preferred deployment model (cloud, on-premise, hybrid)?
• Any other relevant information that would help us scope this accurately?`;

    return prompt;
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Simple response logic
    setTimeout(() => {
      let botResponse = '';

      const lowerInput = inputValue.toLowerCase();

      if (lowerInput.includes('prompt') || lowerInput.includes('description') || lowerInput.includes('generate') || lowerInput.includes('help')) {
        const generatedPrompt = generateProjectPrompt();
        botResponse = `Great! Here's a comprehensive project description template that will help ensure an accurate estimate. You can copy this and fill in your specific details:\n\n${generatedPrompt}\n\n${onInsertPrompt ? 'Click "Use This Prompt" to insert it into the estimator form!' : 'Copy this template and paste it into the Project Description field in the estimator.'}`;
      } else if (lowerInput.includes('estimate') || lowerInput.includes('cost') || lowerInput.includes('price')) {
        botResponse = "The estimator calculates costs based on your selected tools, integrations, and team configuration. For the most accurate estimate, be sure to include a detailed project description and select all relevant options. Would you like me to help you draft a comprehensive project description?";
      } else if (lowerInput.includes('timeline') || lowerInput.includes('how long')) {
        botResponse = "Project timelines are calculated based on total hours and team capacity. More complex projects with multiple integrations will naturally take longer. A detailed project description helps us provide a more accurate timeline. Need help structuring your project details?";
      } else if (lowerInput.includes('calendly') || lowerInput.includes('book') || lowerInput.includes('call') || lowerInput.includes('meeting')) {
        botResponse = "You can book a strategy call with John directly using the 'Book Strategy Call' button in the navigation, or click any of the 'Let's Talk' or 'Schedule Appointment' buttons throughout the site. All calls are scheduled via Calendly for your convenience!";
      } else {
        botResponse = "I'm here to help! I can:\n\n• Generate detailed project description prompts for accurate estimates\n• Answer questions about the estimator process\n• Help you understand pricing and timelines\n• Guide you through booking a strategy call\n\nWhat would you like help with?";
      }

      const botMessage: Message = {
        id: Date.now().toString() + '-bot',
        text: botResponse,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    }, 500);
  };

  const handleCopy = (text: string, messageId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(messageId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUsePrompt = (text: string) => {
    if (onInsertPrompt) {
      const promptStart = text.indexOf('**PROJECT SCOPE');
      const promptText = promptStart !== -1 ? text.substring(promptStart) : text;
      onInsertPrompt(promptText);
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 ${
          isOpen ? 'bg-slate-700' : 'bg-gradient-to-r from-blue-600 to-indigo-600'
        }`}
        aria-label="AI Assistant"
      >
        {isOpen ? (
          <X size={24} className="text-white" />
        ) : (
          <div className="relative">
            <MessageCircle size={24} className="text-white" />
            <Sparkles size={12} className="absolute -top-1 -right-1 text-yellow-300 animate-pulse" />
          </div>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[400px] max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="text-white">AI Assistant</h3>
                <p className="text-blue-100 text-sm">Here to help you succeed</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-800'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
                  
                  {/* Copy and Use Prompt buttons for bot messages */}
                  {message.sender === 'bot' && message.text.includes('**PROJECT SCOPE') && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-slate-200">
                      <button
                        onClick={() => handleCopy(message.text, message.id)}
                        className="flex items-center gap-1 text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
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
                          onClick={() => handleUsePrompt(message.text)}
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
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-slate-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
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
