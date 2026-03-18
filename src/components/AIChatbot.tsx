import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router";

// Icon components
const MessageCircleIcon = ({ size, className }: { size?: number; className?: string }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

const XIcon = ({ size, className }: { size?: number; className?: string }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const SendIcon = ({ size, className }: { size?: number; className?: string }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const CopyIcon = ({ size, className }: { size?: number; className?: string }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const CheckIcon = ({ size, className }: { size?: number; className?: string }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const SparklesIcon = ({ size, className }: { size?: number; className?: string }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" />
    <path d="M19 17v4" />
    <path d="M3 5h4" />
    <path d="M17 19h4" />
  </svg>
);

const Loader2Icon = ({ size, className }: { size?: number; className?: string }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

import { projectId, publicAnonKey } from "../utils/supabase/info";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  isJson?: boolean;
  showActionButtons?: boolean;
  isCalendarBooking?: boolean;
  calendarDuration?: '15min' | '30min' | '60min' | null;
  isEstimatePrompt?: boolean;
  hideCopy?: boolean;
}

type PageContext = "home" | "work" | "services" | "process" | "about";

export function AIChatbot() {
  const location = useLocation();

  // Derive current page from route
  const getCurrentPage = (): PageContext => {
    const path = location.pathname;
    if (path === '/work') return 'work';
    if (path === '/services') return 'services';
    if (path === '/process') return 'process';
    if (path === '/about') return 'about';
    return 'home';
  };

  const currentPage = getCurrentPage();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingIframeUrl, setBookingIframeUrl] = useState<string | null>(null);
  const [salesforcePromptUsed, setSalesforcePromptUsed] = useState(false);
  const noFollowUpTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup follow-up timer on unmount
  useEffect(() => {
    return () => {
      if (noFollowUpTimerRef.current) {
        clearTimeout(noFollowUpTimerRef.current);
      }
    };
  }, []);

  // Format messages: linkify "Project Estimator" references
  const formatMessageText = (text: string, sender: "user" | "bot") => {
    if (sender !== "bot") return text;

    const regex = /(Tech Project Estimator|Project Estimator)/g;
    const parts = text.split(regex);
    return parts.map((part, index) => {
      if (part === "Tech Project Estimator" || part === "Project Estimator") {
        return (
          <a
            key={index}
            href="https://estimator.bktadvisory.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-blue-600 hover:text-blue-800"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Greeting based on current page
  useEffect(() => {
    if (!hasGreeted) {
      const greetings: Record<PageContext, string> = {
        home: "Hello! 👋 Welcome to BKT Advisory. I can help you learn about our services, discuss your project needs, or guide you to our Project Estimator for an instant quote.",
        work: "Hi there! 👋 Browsing our case studies? I can tell you more about any of these projects, or help you scope a similar engagement.",
        services: "Hi! 👋 Looking at our services? I can help you determine which Salesforce and AI solution is the best fit for your needs.",
        process: "Hi! 👋 Want to learn more about how we work? I can walk you through our process or help you get started with a discovery call.",
        about: "Hi! 👋 I can tell you more about John's background and expertise, or help you schedule a strategy call.",
      };

      setMessages([
        {
          id: "1",
          text: greetings[currentPage],
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

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    const maxHeight = 88;
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = `${newHeight}px`;

    const isScrollable = textarea.scrollHeight > maxHeight;
    textarea.style.overflowY = isScrollable ? "auto" : "hidden";
    textarea.style.paddingLeft = isScrollable ? "10px" : "16px";
  }, [inputValue]);

  const handleSendMessage = async (textOverride?: string) => {
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

    // Handle "Tell me about your Salesforce & AI services." prompt locally
    if (text.trim() === "Tell me about your Salesforce & AI services.") {
      // Mark as used so the button disappears
      setSalesforcePromptUsed(true);
      // Simulate a brief delay for natural feel
      await new Promise((resolve) => setTimeout(resolve, 600));
      const botMessage: Message = {
        id: Date.now().toString() + "-bot",
        text: "At BKT Advisory, our expertise extends far beyond standard Salesforce architecture. With the relentless surge of AI tools and software entering the market, it is easy for operations to become overwhelmed. We step in to turn that complexity into clarity through a creative, strategic lens\u2014leveraging a curated ecosystem of technology partners to build the exact right tech stack for your unique business.\n\nUltimately, we believe the most powerful solutions are often found in their simplest form. By eliminating technical friction, you don\u2019t just recover wasted time and capital\u2014you unlock the freedom to focus entirely on your next stage of growth.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsLoading(false);
      return;
    }

    // Handle "No" response from the estimate prompt flow
    if (text.trim() === "No") {
      await new Promise((resolve) => setTimeout(resolve, 600));
      const noResponseMessage: Message = {
        id: Date.now().toString() + "-bot",
        text: "No worries! Please let me know if you have any other questions or if there is anything else you need.",
        sender: "bot",
        timestamp: new Date(),
        hideCopy: true,
      };
      setMessages((prev) => [...prev, noResponseMessage]);
      setIsLoading(false);

      // Delayed follow-up message after 2.3 seconds
      noFollowUpTimerRef.current = setTimeout(() => {
        const followUpMessage: Message = {
          id: Date.now().toString() + "-bot-followup",
          text: "Well, are you looking for a quick automation, a full Salesforce implementation, or a custom AI workflow? If you share a bit about your current setup, I can suggest a scalable tech stack tailored to your team.",
          sender: "bot",
          timestamp: new Date(),
          hideCopy: true,
        };
        setMessages((prev) => [...prev, followUpMessage]);
      }, 2300);

      return;
    }

    try {
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
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          throw new Error(`Server Error (${response.status}): ${errorText.substring(0, 200)}`);
        }
        throw new Error(errorData.details || errorData.error || `Server Error: ${response.status}`);
      }

      const data = await response.json();

      let botText = data.content || "";
      let isCalendarBooking = false;
      let isEstimatePrompt = false;

      // Check if the response contains the Google Calendar booking URL
      const calendarUrlRegex = /https:\/\/calendar\.google\.com\/calendar\/appointments\/[^\s]+/;
      if (calendarUrlRegex.test(botText)) {
        isCalendarBooking = true;
      }

      // Check if the response is the estimate prompt (asking user to draft a description)
      // The system prompt instructs the AI to respond with this exact phrasing
      if (/would you like me to help you draft a description/i.test(botText)) {
        isEstimatePrompt = true;
        // Strip surrounding quotation marks if present
        botText = botText.replace(/^["'\u201C\u201D]+|["'\u201C\u201D]+$/g, "").trim();
      }

      const botMessage: Message = {
        id: Date.now().toString() + "-bot",
        text: botText,
        sender: "bot",
        timestamp: new Date(),
        isCalendarBooking: isCalendarBooking,
        isEstimatePrompt: isEstimatePrompt,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        id: Date.now().toString() + "-error",
        text: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(messageId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        textArea.remove();
        setCopiedId(messageId);
        setTimeout(() => setCopiedId(null), 2000);
      } catch (fallbackErr) {
        console.error("Failed to copy text:", fallbackErr);
        setCopiedId(messageId);
        setTimeout(() => setCopiedId(null), 1000);
      }
    }
  };

  const openBookingModal = (url: string) => {
    setBookingIframeUrl(url);
    setShowBookingModal(true);
  };

  const closeBookingModal = () => {
    setShowBookingModal(false);
    setBookingIframeUrl(null);
  };

  // Context-aware quick prompts per page
  const getQuickPrompts = (): string[] => {
    switch (currentPage) {
      case 'work':
        return [
          "Tell me about these case studies.",
          "Schedule a call with John.",
          "Get a project estimate.",
        ];
      case 'services':
        return [
          "Which service is right for my needs?",
          "Schedule a call with John.",
          "Get a project estimate.",
        ];
      case 'process':
        return [
          "Walk me through the engagement process.",
          "Schedule a call with John.",
          "Get a project estimate.",
        ];
      case 'about':
        return [
          "Tell me about John's background.",
          "Schedule a call with John.",
          "Get a project estimate.",
        ];
      default:
        return [
          "Tell me about your Salesforce & AI services.",
          "Schedule a call with John.",
          "Get a project estimate.",
        ];
    }
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
          <XIcon size={24} className="text-white" />
        ) : (
          <div className="relative">
            <MessageCircleIcon size={24} className="text-white" />
            <SparklesIcon
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
                <SparklesIcon size={20} />
              </div>
              <div>
                <h3 className="text-white font-bold">AI Assistant</h3>
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
                {message.isCalendarBooking && message.sender === "bot" ? (
                  /* Google Calendar Booking - Inline Service Cards */
                  <div className="w-full max-w-full">
                    <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 mb-4 max-w-[85%]">
                      <p className="text-sm text-slate-800">
                        Certainly! You can book a call with John directly here. Please select your preferred time (15, 30, or 60 mins) and enter your details directly on that page.
                      </p>
                    </div>

                    {/* Service Cards Grid */}
                    <div className="flex flex-wrap gap-2 justify-center w-full">
                      {/* Discovery Call */}
                      <div
                        onClick={() => openBookingModal('https://calendar.app.google/26nkEZE18gENpuGo8')}
                        className="relative flex flex-col justify-between w-[215px] h-[95px] bg-white border border-[#c4c7c5] rounded-lg p-4 cursor-pointer transition-all duration-[280ms] hover:shadow-[0_1px_2px_0_rgba(60,64,67,0.3),0_1px_3px_1px_rgba(60,64,67,0.15)] hover:border-transparent"
                      >
                        <h3 className="text-[15px] font-normal text-[#1f1f1f] mb-1.5 leading-5 -mt-[1px]" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                          Discovery Call
                        </h3>
                        <div className="space-y-0.5 -mt-[2px]">
                          <div className="flex items-center gap-1 text-xs text-[#444746]" style={{ fontFamily: "'Roboto', sans-serif" }}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 -960 960 960" fill="#444746">
                              <path d="M480-240q100 0 170-70t70-170q0-100-70-170t-170-70v240L310-310q35 33 78.5 51.5T480-240Zm0 160q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
                            </svg>
                            <span>15 mins</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-[#444746]" style={{ fontFamily: "'Roboto', sans-serif" }}>
                            <img src="https://ssl.gstatic.com/calendar/images/conferenceproviders/logo_meet_2020q4_192px.svg" className="w-3.5 h-3.5 object-contain" alt="Google Meet" />
                            <span>Google Meet</span>
                          </div>
                        </div>
                      </div>

                      {/* Strategic Planning */}
                      <div
                        onClick={() => openBookingModal('https://calendar.app.google/ybjY5qL32semyiJ88')}
                        className="relative flex flex-col justify-between w-[215px] h-[95px] bg-white border border-[#c4c7c5] rounded-lg p-4 cursor-pointer transition-all duration-[280ms] hover:shadow-[0_1px_2px_0_rgba(60,64,67,0.3),0_1px_3px_1px_rgba(60,64,67,0.15)] hover:border-transparent"
                      >
                        <h3 className="text-[15px] font-normal text-[#1f1f1f] mb-1.5 leading-5 -mt-[1px]" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                          Strategic Planning
                        </h3>
                        <div className="space-y-0.5 -mt-[2px]">
                          <div className="flex items-center gap-1 text-xs text-[#444746]" style={{ fontFamily: "'Roboto', sans-serif" }}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 -960 960 960" fill="#444746">
                              <path d="M480-240q100 0 170-70t70-170q0-100-70-170t-170-70v240L310-310q35 33 78.5 51.5T480-240Zm0 160q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
                            </svg>
                            <span>30 min</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-[#444746]" style={{ fontFamily: "'Roboto', sans-serif" }}>
                            <img src="https://ssl.gstatic.com/calendar/images/conferenceproviders/logo_meet_2020q4_192px.svg" className="w-3.5 h-3.5 object-contain" alt="Google Meet" />
                            <span>Google Meet</span>
                          </div>
                        </div>
                      </div>

                      {/* Workshop */}
                      <div
                        onClick={() => openBookingModal('https://calendar.app.google/SDquXNuRq74gJFq46')}
                        className="relative flex flex-col justify-between w-[215px] h-[95px] bg-white border border-[#c4c7c5] rounded-lg p-4 cursor-pointer transition-all duration-[280ms] hover:shadow-[0_1px_2px_0_rgba(60,64,67,0.3),0_1px_3px_1px_rgba(60,64,67,0.15)] hover:border-transparent"
                      >
                        <h3 className="text-[15px] font-normal text-[#1f1f1f] mb-1.5 leading-5 -mt-[1px]" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                          Workshop
                        </h3>
                        <div className="space-y-0.5 -mt-[2px]">
                          <div className="flex items-center gap-1 text-xs text-[#444746]" style={{ fontFamily: "'Roboto', sans-serif" }}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 -960 960 960" fill="#444746">
                              <path d="M480-240q100 0 170-70t70-170q0-100-70-170t-170-70v240L310-310q35 33 78.5 51.5T480-240Zm0 160q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
                            </svg>
                            <span>60 min</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-[#444746] m-[0px] p-[0px]" style={{ fontFamily: "'Roboto', sans-serif" }}>
                            <img src="https://ssl.gstatic.com/calendar/images/conferenceproviders/logo_meet_2020q4_192px.svg" className="w-3.5 h-3.5 object-contain" alt="Google Meet" />
                            <span>Google Meet</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      message.sender === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-white border border-slate-200 text-slate-800"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {formatMessageText(message.text, message.sender)}
                    </p>

                    {/* Yes/No action buttons for estimate prompt messages */}
                    {message.sender === "bot" && message.isEstimatePrompt && (
                      <div className="flex flex-row gap-2 mt-3 pt-3 border-t border-slate-200">
                        <button
                          onClick={() => handleSendMessage("Yes")}
                          disabled={isLoading}
                          className="flex items-center gap-1 text-xs px-4 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => handleSendMessage("No")}
                          disabled={isLoading}
                          className="flex items-center gap-1 text-xs px-4 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-slate-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          No
                        </button>
                      </div>
                    )}

                    {/* Copy button for bot messages (excluded: welcome message, estimate prompt, calendar booking, short messages) */}
                    {message.sender === "bot" && message.text.length > 80 && message.id !== "1" && !message.isEstimatePrompt && !message.isCalendarBooking && !message.hideCopy && (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-slate-200">
                        <button
                          onClick={() => handleCopy(message.text, message.id)}
                          className="flex items-center gap-1 text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-slate-700"
                        >
                          {copiedId === message.id ? (
                            <>
                              <CheckIcon size={14} />
                              Copied!
                            </>
                          ) : (
                            <>
                              <CopyIcon size={14} />
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 flex items-center gap-2 text-slate-500">
                  <Loader2Icon size={16} className="animate-spin" />
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
              {getQuickPrompts()
                .filter((prompt) => !(salesforcePromptUsed && prompt === "Tell me about your Salesforce & AI services."))
                .map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(prompt)}
                  disabled={isLoading}
                  className="text-xs px-3 py-1.5 rounded-full transition-all text-left border flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 hover:border-slate-300"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSendMessage())
                }
                placeholder="Ask me anything..."
                disabled={isLoading}
                rows={1}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 resize-none overflow-hidden min-h-[40px] max-h-[88px] chat-scroll-area"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <SendIcon size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          onClick={closeBookingModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-[800px] w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {!bookingIframeUrl ? (
              <>
                {/* Header */}
                <div className="flex flex-col items-center p-6 text-center border-b border-slate-200">
                  <img
                    alt="John Burkhardt"
                    src="https://lh3.googleusercontent.com/a-/ALV-UjUKsVkb4rL7QwPkEtDwipBhlu3deHrsCazzdAfDDA_HQI9kdPI=s112-c-mo"
                    className="rounded-full w-16 h-16 object-cover mb-2"
                  />
                  <h2 className="text-2xl font-normal text-slate-900 mb-1">John Burkhardt</h2>
                  <p className="text-sm text-slate-600">Appointments</p>
                </div>

                {/* Service Cards */}
                <div className="p-6 flex flex-wrap gap-4 justify-center">
                  <div
                    onClick={() => openBookingModal('https://calendar.app.google/26nkEZE18gENpuGo8')}
                    className="relative flex flex-col justify-between w-[215px] h-[115px] bg-white border border-slate-300 rounded-lg p-4 cursor-pointer transition-all duration-300 hover:shadow-[0_1px_2px_0_rgba(60,64,67,0.3),0_1px_3px_1px_rgba(60,64,67,0.15)] hover:border-transparent"
                  >
                    <h3 className="text-lg font-normal text-slate-900 mb-1.5 -mt-[1px]">Discovery Call</h3>
                    <div className="space-y-0.5 -mt-[2px]">
                      <div className="flex items-center gap-1 text-[13px] text-slate-600">
                        <svg className="w-[17px] h-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                        <span>15 min</span>
                      </div>
                      <div className="flex items-center gap-1 text-[13px] text-slate-600">
                        <img src="https://ssl.gstatic.com/calendar/images/conferenceproviders/logo_meet_2020q4_192px.svg" className="w-[17px] h-[17px]" alt="Google Meet" />
                        <span>Google Meet</span>
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => openBookingModal('https://calendar.app.google/ybjY5qL32semyiJ88')}
                    className="relative flex flex-col justify-between w-[215px] h-[115px] bg-white border border-slate-300 rounded-lg p-4 cursor-pointer transition-all duration-300 hover:shadow-[0_1px_2px_0_rgba(60,64,67,0.3),0_1px_3px_1px_rgba(60,64,67,0.15)] hover:border-transparent"
                  >
                    <h3 className="text-lg font-normal text-slate-900 mb-1.5 -mt-[1px]">Strategic Planning</h3>
                    <div className="space-y-0.5 -mt-[2px]">
                      <div className="flex items-center gap-1 text-[13px] text-slate-600">
                        <svg className="w-[17px] h-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                        <span>30 min</span>
                      </div>
                      <div className="flex items-center gap-1 text-[13px] text-slate-600">
                        <img src="https://ssl.gstatic.com/calendar/images/conferenceproviders/logo_meet_2020q4_192px.svg" className="w-[17px] h-[17px]" alt="Google Meet" />
                        <span>Google Meet</span>
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => openBookingModal('https://calendar.app.google/SDquXNuRq74gJFq46')}
                    className="relative flex flex-col justify-between w-[215px] h-[115px] bg-white border border-slate-300 rounded-lg p-4 cursor-pointer transition-all duration-300 hover:shadow-[0_1px_2px_0_rgba(60,64,67,0.3),0_1px_3px_1px_rgba(60,64,67,0.15)] hover:border-transparent"
                  >
                    <h3 className="text-lg font-normal text-slate-900 mb-1.5 -mt-[1px]">Workshop</h3>
                    <div className="space-y-0.5 -mt-[2px]">
                      <div className="flex items-center gap-1 text-[13px] text-slate-600">
                        <svg className="w-[17px] h-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                        <span>60 min</span>
                      </div>
                      <div className="flex items-center gap-1 text-[13px] text-slate-600">
                        <img src="https://ssl.gstatic.com/calendar/images/conferenceproviders/logo_meet_2020q4_192px.svg" className="w-[17px] h-[17px]" alt="Google Meet" />
                        <span>Google Meet</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-slate-200 flex justify-end">
                  <button
                    onClick={closeBookingModal}
                    className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </>
            ) : (
              <div className="relative h-[800px] flex items-center justify-center p-6">
                <button
                  onClick={() => setBookingIframeUrl(null)}
                  className="absolute top-3 left-3 z-10 w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-lg hover:bg-slate-100 transition-colors text-slate-600"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={closeBookingModal}
                  className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-lg hover:bg-slate-100 transition-colors text-slate-600 text-2xl font-bold"
                >
                  &times;
                </button>
                <iframe
                  src={bookingIframeUrl}
                  className="w-full h-full border-0 rounded-2xl"
                  title="Google Calendar Booking"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}