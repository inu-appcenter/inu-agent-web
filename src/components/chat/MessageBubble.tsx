import React from "react";
import { ChatMessage } from "../../types/agent";
import { Sparkles, User, Loader2 } from "lucide-react";
import { CardRenderer } from "../cards/CardRenderer";

interface Props {
  message: ChatMessage;
  onAction?: (actionId: string) => void;
  onConfirmAction?: (payload: Record<string, any>) => void;
}

export const MessageBubble: React.FC<Props> = ({ message, onAction, onConfirmAction }) => {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 my-4 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div
        className={`w-7 h-7 md:w-8 md:h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
          isUser
            ? "bg-slate-800 text-white"
            : "bg-gradient-to-tr from-blue-600 to-indigo-600 text-white"
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
      </div>

      {/* Bubble Content */}
      <div className={`max-w-[88%] md:max-w-[75%] space-y-2 ${isUser ? "text-right" : "text-left"}`}>
        <div
          className={`inline-block p-4 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? "bg-blue-600 text-white font-medium rounded-tr-sm shadow-sm"
              : "bg-white text-slate-800 border border-slate-200/80 rounded-tl-sm shadow-sm"
          }`}
        >
          {message.content ? (
            <div className="whitespace-pre-wrap break-words">{message.content}</div>
          ) : message.isStreaming ? (
            <div className="flex items-center gap-2 text-slate-400 py-0.5">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span className="text-xs font-medium">비서가 생각 중입니다...</span>
            </div>
          ) : null}

          {/* Blinking Cursor during token streaming */}
          {message.isStreaming && message.content && (
            <span className="animate-cursor" />
          )}
        </div>

        {/* Attached Cards */}
        {message.cards && message.cards.length > 0 && (
          <div className="text-left w-full">
            <CardRenderer
              cards={message.cards}
              onAction={onAction}
              onConfirmAction={onConfirmAction}
            />
          </div>
        )}
      </div>
    </div>
  );
};
