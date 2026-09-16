import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { Copy, Check, Sparkles } from "lucide-react";
import { ChatMessage } from "../../types/agent";
import { CardRenderer } from "../cards/CardRenderer";
import ChatbotLogo from "../../assets/chatbot-logo.svg";

interface MessageBubbleProps {
  message: ChatMessage;
  onChipClick?: (chipText: string) => void;
  onAction?: (actionId: string) => void;
  onConfirmAction?: (payload: Record<string, any>) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onChipClick,
  onAction,
  onConfirmAction,
}) => {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  // Extract [CHIPS: ...] from assistant response
  const rawContent = message.content || "";
  let cleanContent = rawContent;
  let chips: string[] = [];

  const chipsMatch = rawContent.match(/\[CHIPS:\s*([^\]]+)\]/i);
  if (chipsMatch) {
    cleanContent = rawContent.replace(/\[CHIPS:\s*([^\]]+)\]/i, "").trim();
    chips = chipsMatch[1]
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(cleanContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`w-full max-w-[800px] flex gap-3 mb-6 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200/80 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
          <img src={ChatbotLogo} alt="챗불이" className="w-6 h-6 object-contain" />
        </div>
      )}

      <div
        className={`flex flex-col ${
          isUser ? "items-end max-w-[82%]" : "items-start w-full max-w-full"
        }`}
      >
        {isUser ? (
          <div className="py-3 px-4.5 rounded-[18px] bg-[#0061ff] text-white text-[15px] font-medium leading-relaxed shadow-sm word-break keep-all">
            {message.content}
          </div>
        ) : (
          <div className="w-full text-slate-800 text-[15px] leading-relaxed">
            {/* Markdown rendered assistant answer */}
            <div className="prose prose-slate max-w-none prose-p:my-1.5 prose-p:leading-relaxed prose-headings:my-2 prose-headings:font-bold prose-h3:text-base prose-h4:text-sm prose-ul:my-1.5 prose-li:my-0.5 prose-table:my-2 prose-table:border-collapse prose-th:bg-slate-100 prose-th:px-3 prose-th:py-1.5 prose-td:px-3 prose-td:py-1.5 prose-blockquote:border-l-4 prose-blockquote:border-blue-400 prose-blockquote:bg-blue-50/50 prose-blockquote:py-1 prose-blockquote:px-3 prose-blockquote:rounded-r-lg">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkBreaks]}
                components={{
                  a: ({ node, ...props }) => (
                    <a
                      {...props}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline font-medium hover:text-blue-800"
                    />
                  ),
                }}
              >
                {cleanContent}
              </ReactMarkdown>

              {message.isStreaming && (
                <span className="inline-block w-1.5 h-4 ml-1 bg-blue-600 animate-pulse align-middle" />
              )}
            </div>

            {/* Generative Cards rendering */}
            {message.cards && message.cards.length > 0 && (
              <CardRenderer
                cards={message.cards}
                onAction={onAction}
                onConfirmAction={onConfirmAction}
              />
            )}

            {/* Follow-up Suggested Action Chips */}
            {chips.length > 0 && (
              <div className="mt-4 pt-2 flex flex-wrap gap-2">
                {chips.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => onChipClick?.(chip)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 hover:bg-blue-50 text-slate-700 hover:text-blue-600 border border-slate-200/90 hover:border-blue-300 text-xs font-medium shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                  >
                    <Sparkles size={11} className="text-blue-500" />
                    {chip}
                  </button>
                ))}
              </div>
            )}

            {/* Bottom Actions: Copy Button */}
            {!message.isStreaming && cleanContent && (
              <div className="mt-2 flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  title="답변 복사"
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-white/60 transition-colors"
                >
                  {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                  <span>{copied ? "복사됨" : "복사"}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
