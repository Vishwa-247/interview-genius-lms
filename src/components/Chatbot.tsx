
import { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import GlassMorphism from "./ui/GlassMorphism";

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
}

const Chatbot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "👋 Hi there! I'm your InterviewGenius assistant. How can I help you today?",
      sender: "bot",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: new Date()
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    
    // Simulate API call to Gemini
    // In a real app, you would call your Gemini Edge Function here
    setTimeout(() => {
      const responses = [
        "I'd be happy to help you with that! What specific topics are you interested in?",
        "You can generate study materials by going to the Course Generator page and entering your topic of interest.",
        "The Mock Interview feature helps you practice for job interviews with AI-generated questions tailored to your role and experience.",
        "If you're preparing for a job interview, I recommend starting with our interview preparation course generator.",
        "You can access your saved courses and interviews from the Dashboard page.",
        "Feel free to ask me any other questions about how to use InterviewGenius!"
      ];
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: responses[Math.floor(Math.random() * responses.length)],
        sender: "bot",
        timestamp: new Date()
      };
      
      setMessages((prev) => [...prev, botMessage]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <GlassMorphism className="h-[500px] flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.sender === "user"
                  ? "bg-primary text-white"
                  : "bg-white/10 dark:bg-black/10"
              }`}
            >
              <p>{message.content}</p>
              <p className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/10 dark:bg-black/10 rounded-lg p-3">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t border-border">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            className="flex-1 px-4 py-2 bg-white/20 dark:bg-black/20 border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            disabled={isLoading || !input.trim()}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </GlassMorphism>
  );
};

export default Chatbot;
