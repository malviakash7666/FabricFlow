import React, { useState, useEffect, useRef } from "react";
import { aiService } from "../services/ai.service.ts";
import { MessageSquare, X, Send, Mic, MicOff, Volume2, VolumeX, ArrowRight, Sparkles } from "lucide-react";

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

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
      };

      rec.onerror = (event: any) => {
        console.error("Speech Recognition Error:", event.error);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
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
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "Oops, I encountered an issue retrieving that. Please try again!" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel(); // Stop current speech
      // Clean markdown tags for nicer speaking
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
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 group"
          id="ai-assistant-toggle"
        >
          <Sparkles className="h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
        </button>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="flex h-[600px] w-96 flex-col rounded-2xl bg-slate-900 border border-slate-800 text-white shadow-2xl overflow-hidden transition-all duration-300 md:w-[420px]">
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-violet-900 to-indigo-950 p-4 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600/40">
                <Sparkles className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">FabricFlow AI Assistant</h4>
                <p className="text-[10px] text-slate-400">Natural Sourcing & Comparison</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setIsSpeakingEnabled(!isSpeakingEnabled);
                  if (isSpeakingEnabled) window.speechSynthesis.cancel();
                }}
                className={`p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors`}
                title={isSpeakingEnabled ? "Disable Text to Speech" : "Enable Text to Speech"}
              >
                {isSpeakingEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Conversation Bubble Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
            {messages.map((msg, index) => (
              <div key={index} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-indigo-600 text-white rounded-tr-none"
                      : "bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-none"
                  }`}
                >
                  {/* Handle comparison table markdown parsing in a simple way */}
                  <div className="whitespace-pre-line text-xs font-normal">
                    {msg.text}
                  </div>
                </div>

                {/* If AI returned products, show them as horizontal cards */}
                {msg.sender === "ai" && msg.products && msg.products.length > 0 && (
                  <div className="mt-3 flex w-full gap-2 overflow-x-auto pb-2 pt-1 scrollbar-thin">
                    {msg.products.map((prod) => (
                      <div
                        key={prod.id}
                        className="w-44 flex-shrink-0 rounded-xl bg-slate-950 border border-slate-800 p-2 hover:border-violet-600 transition-colors"
                      >
                        <img
                          src={prod.imageUrls[0] || "https://images.unsplash.com/photo-1574169208507-84376144848b?w=400"}
                          alt={prod.name}
                          className="h-20 w-full rounded-lg object-cover"
                        />
                        <div className="mt-2">
                          <h5 className="font-semibold text-xs truncate" title={prod.name}>{prod.name}</h5>
                          <p className="text-[10px] text-slate-400 truncate">{prod.category}</p>
                          <div className="mt-1 flex items-center justify-between">
                            <span className="text-xs font-bold text-violet-400">₹{prod.price}/m</span>
                            <span className="text-[9px] text-slate-500">MOQ {prod.moq}m</span>
                          </div>
                          {onSelectProduct && (
                            <button
                              onClick={() => onSelectProduct(prod)}
                              className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg bg-slate-800 hover:bg-violet-600 py-1 text-[10px] font-semibold text-white transition-colors"
                            >
                              View Details
                              <ArrowRight className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center space-x-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-800 border border-slate-700 animate-pulse">
                  <Sparkles className="h-3.5 w-3.5 text-slate-500" />
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
          <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center space-x-2">
            <button
              onClick={toggleListening}
              className={`p-2 rounded-xl transition-all duration-300 ${
                isListening ? "bg-red-500 text-white animate-pulse" : "bg-slate-800 text-slate-400 hover:text-white"
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
              placeholder={isListening ? "Listening to your voice..." : "Ask AI about fabrics..."}
              className="flex-1 rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600"
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputText.trim() || loading}
              className="p-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-slate-800 disabled:text-slate-600 text-white transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
