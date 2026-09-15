import { useRef, useEffect } from "react";
import { Header } from "./components/chat/Header";
import { QuickPrompts } from "./components/chat/QuickPrompts";
import { MessageBubble } from "./components/chat/MessageBubble";
import { PromptInput } from "./components/chat/PromptInput";
import { useAgentStream } from "./hooks/useAgentStream";

export default function App() {
  const { messages, isLoading, clientTenant, sendMessage, resetChat } = useAgentStream();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-screen w-full bg-[#f8fafc]">
      {/* Top Navigation */}
      <Header clientTenant={clientTenant} onReset={resetChat} />

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto px-4 md:px-8 py-4">
        <div className="max-w-3xl mx-auto min-h-full flex flex-col justify-between">
          {messages.length === 0 ? (
            <div className="my-auto">
              <QuickPrompts onSelect={sendMessage} />
            </div>
          ) : (
            <div className="space-y-4 pb-6">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </main>

      {/* Bottom Input */}
      <footer className="w-full bg-gradient-to-t from-[#f8fafc] via-[#f8fafc]/95 to-transparent pt-2">
        <PromptInput onSend={sendMessage} isLoading={isLoading} />
      </footer>
    </div>
  );
}
