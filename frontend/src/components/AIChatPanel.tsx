import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { aiService } from "../services/ai.service.ts";
import { MessageSquare, X, Send, Mic, MicOff, Volume2, VolumeX, ArrowRight, Sparkles } from "lucide-react";
import { useToast } from "../components/Toast.tsx";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  imageUrls: string[];
  moq: number;
  supplier: {
    id: string;
    businessName: string;
  };
}

interface ChatMessage {
  sender: "user" | "ai";
  text: string;
  products?: Product[];
}

interface AIChatPanelProps {
  onSelectProduct?: (product: Product) => void;
}

export const AIChatPanel: React.FC<AIChatPanelProps> = ({ onSelectProduct }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "ai",
      text: "Hi! I am your FabricFlow AI Assistant. 🌟 Try asking me to find fabrics, compare items, or check MOQs. E.g., 'Compare Cotton and Silk' or 'Show me Denim under 300'. How can I help you?",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeakingEnabled, setIsSpeakingEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Create a ref for handleSend to avoid stale closures in speech callbacks
  const handleSendRef = useRef<any>(null);

  const toggleListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showToast("Speech recognition is not supported in this browser.", "error");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    } else {
      try {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = "en-US";

        rec.onstart = () => {
          setIsListening(true);
        };

        rec.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setInputText(transcript);
            if (handleSendRef.current) {
              handleSendRef.current(transcript);
            }
          }
        };

        rec.onerror = (event: any) => {
          console.error("Speech Recognition Error:", event.error);
          setIsListening(false);
          if (event.error === "not-allowed") {
            showToast("Microphone permission denied. Please allow microphone access in your browser settings.", "error");
          } else if (event.error === "no-speech") {
            // Silence no-speech error as it's common if user pauses
            console.log("No speech detected.");
          } else if (event.error === "audio-capture") {
            showToast("Microphone not found. Please connect a microphone and try again.", "error");
          } else if (event.error === "network") {
            showToast("Network Error: Chrome Speech Recognition requires a stable internet connection and access to Google Speech servers. Please verify your connection or try typing.", "error");
          } else {
            showToast(`Speech recognition error: ${event.error}`, "error");
          }
        };

        rec.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = rec;
        rec.start();
      } catch (err: any) {
        console.error("Failed to start speech recognition:", err);
        showToast("Failed to start voice search. Please try again.", "error");
        setIsListening(false);
      }
    }
  };

  const handleSend = async (textToSend = inputText) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = { sender: "user", text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setLoading(true);

    try {
      const res = await aiService.chatWithAI(textToSend);
      const aiMsg: ChatMessage = {
        sender: "ai",
        text: res.reply,
        products: res.products,
      };

      setMessages((prev) => [...prev, aiMsg]);

      // Speak response if enabled
      if (isSpeakingEnabled) {
        speakText(res.reply);
      }

      // If structured filters exist, serialize and navigate!
      if (res.filters) {
        const params = new URLSearchParams();
        if (res.filters.category) params.set("category", res.filters.category);
        if (res.filters.maxPrice) params.set("maxPrice", res.filters.maxPrice.toString());
        if (res.filters.maxMoq) params.set("maxMoq", res.filters.maxMoq.toString());
        if (res.filters.color) params.set("color", res.filters.color);
        if (res.filters.search) params.set("search", res.filters.search);

        const query = params.toString();
        if (query) {
          navigate(`/marketplace?${query}`);
        }
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "Oops, I encountered an issue retrieving that. Please try again!" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Sync ref with handleSend (defined above, avoiding TDZ error)
  useEffect(() => {
    handleSendRef.current = handleSend;
  }, [handleSend]);

  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel(); // Stop current speech
      const cleanText = text.replace(/[*#|`\-]/g, "");
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Floating Toggle Button (Small and Compact Labeled Pill) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-11 items-center gap-2 rounded-full bg-teal-700 hover:bg-teal-800 text-white px-4 shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 group"
          id="ai-assistant-toggle"
        >
          <Sparkles className="h-4.5 w-4.5 group-hover:rotate-12 transition-transform duration-300" />
          <span className="text-xs font-bold whitespace-nowrap">Ask Fabric AI</span>
        </button>
      )}

      {/* Chat Window Panel - Light Premium Theme */}
      {isOpen && (
        <div className="flex h-[550px] w-88 flex-col rounded-2xl bg-white border border-slate-200 text-slate-800 shadow-2xl overflow-hidden transition-all duration-300 md:w-[400px]">
          {/* Header */}
          <div className="flex items-center justify-between bg-teal-700 p-4 border-b border-teal-800 text-white">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                <Sparkles className="h-4.5 w-4.5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-xs leading-none">FabricFlow AI Assistant</h4>
                <p className="text-[9px] text-teal-100 mt-1">Natural B2B Fabric Sourcing</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setIsSpeakingEnabled(!isSpeakingEnabled);
                  if (isSpeakingEnabled) window.speechSynthesis.cancel();
                }}
                className="p-1.5 rounded-lg text-teal-100 hover:bg-white/10 hover:text-white transition-colors"
                title={isSpeakingEnabled ? "Disable Voice" : "Enable Voice"}
              >
                {isSpeakingEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-teal-100 hover:bg-white/10 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Conversation Bubble Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 scrollbar-thin">
            {messages.map((msg, index) => (
              <div key={index} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-teal-700 text-white rounded-tr-none shadow-xs"
                      : "bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-xs"
                  }`}
                >
                  <div className="whitespace-pre-line font-medium">
                    {msg.text}
                  </div>
                </div>

                {/* Horizontal product cards inside Chat */}
                {msg.sender === "ai" && msg.products && msg.products.length > 0 && (
                  <div className="mt-3 flex w-full gap-2 overflow-x-auto pb-2 pt-1 scrollbar-thin">
                    {msg.products.map((prod) => (
                      <div
                        key={prod.id}
                        className="w-40 flex-shrink-0 rounded-xl bg-white border border-slate-200 p-2.5 hover:border-teal-700 transition-colors shadow-xs"
                      >
                        <img
                          src={prod.imageUrls[0] || "https://images.unsplash.com/photo-1574169208507-84376144848b?w=400"}
                          alt={prod.name}
                          className="h-20 w-full rounded-lg object-cover border border-slate-100"
                        />
                        <div className="mt-2">
                          <h5 className="font-bold text-[11px] text-slate-900 truncate" title={prod.name}>{prod.name}</h5>
                          <p className="text-[9px] text-slate-400 truncate">{prod.category}</p>
                          <div className="mt-1.5 flex items-center justify-between">
                            <span className="text-[11px] font-extrabold text-teal-700">₹{prod.price}/m</span>
                            <span className="text-[9px] text-slate-400 font-bold">MOQ {prod.moq}m</span>
                          </div>
                          <button
                            onClick={() => {
                              if (onSelectProduct) {
                                onSelectProduct(prod);
                              } else {
                                navigate(`/marketplace?category=${prod.category}&search=${encodeURIComponent(prod.name)}`);
                              }
                            }}
                            className="mt-2.5 flex w-full items-center justify-center gap-1 rounded-lg bg-slate-50 hover:bg-teal-700 hover:text-white py-1.5 text-[9px] font-bold text-slate-700 transition-all border border-slate-200 hover:border-teal-700"
                          >
                            View Details
                            <ArrowRight className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center space-x-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-white border border-slate-200 animate-pulse">
                  <Sparkles className="h-3.5 w-3.5 text-teal-600 animate-spin" />
                </div>
                <div className="flex space-x-1">
                  <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]"></div>
                  <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]"></div>
                  <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-3 border-t border-slate-200 bg-white flex items-center space-x-2">
            <button
              onClick={toggleListening}
              className={`p-2 rounded-xl transition-all duration-300 border ${
                isListening ? "bg-red-500 text-white animate-pulse border-red-500" : "bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-700"
              }`}
              title={isListening ? "Listening..." : "Voice Input"}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={isListening ? "Listening..." : "Ask about fabrics..."}
              className="flex-1 rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-teal-600 focus:outline-none"
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputText.trim() || loading}
              className="p-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:bg-slate-100 disabled:text-slate-400 text-white transition-colors cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
