import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import {
  Copy,
  Check,
  Sparkles,
  GraduationCap,
  BookOpen,
  Library,
  Utensils,
  Bus,
  Bell,
  Calendar,
  Phone,
  Compass,
  Cpu,
} from "lucide-react";
import { ChatMessage } from "../../types/agent";
import { CardRenderer } from "../cards/CardRenderer";
import LoadingAnimation from "../../assets/횃불이ai로딩애니메이션.gif";

interface MessageBubbleProps {
  message: ChatMessage;
  onChipClick?: (chipText: string) => void;
  onAction?: (actionId: string) => void;
  onConfirmAction?: (payload: Record<string, any>) => void;
}

/**
 * AI 응답에서 자주 나오는 LaTeX 수학/화살표 기호 매핑
 */
const LATEX_SYMBOLS: Record<string, string> = {
  rightarrow: "→",
  to: "→",
  leftarrow: "←",
  gets: "←",
  leftrightarrow: "↔",
  Rightarrow: "⇒",
  Leftarrow: "⇐",
  Leftrightarrow: "⇔",
  pm: "±",
  times: "×",
  div: "÷",
  neq: "≠",
  ne: "≠",
  leq: "≤",
  le: "≤",
  geq: "≥",
  ge: "≥",
  approx: "≈",
  cdot: "·",
  bullet: "•",
  dots: "…",
  cdots: "⋯",
  infty: "∞",
  deg: "°",
};

/**
 * URL 끝에 붙은 문장 부호와 괄호, 따옴표를 분리하여 정제하는 함수
 */
const cleanUrl = (url: string) => {
  let end = url.length;
  while (end > 0 && /[.,!?;:\])"']/.test(url[end - 1])) {
    end--;
  }
  return {
    cleaned: url.substring(0, end),
    rest: url.substring(end),
  };
};

/**
 * 프로토콜(http/https)이 누락된 도메인 URL에 https:// 스킴을 추가하는 함수
 */
const ensureHttpScheme = (url: string) => {
  if (/^https?:\/\//i.test(url)) {
    return url;
  }
  return `https://${url}`;
};

/**
 * 마크다운 링크 및 URL 정규표현식
 */
const COMBINED_LINK_REGEX =
  /\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s가-힣\]()<>"]+)|(?<![a-zA-Z0-9@/])((?:www\.[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*(?:\/[^\s가-힣\]()<>"]*)?|[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.(?:inu\.ac\.kr|ac\.kr|co\.kr|go\.kr|or\.kr|re\.kr|kr|com|org|net|edu|gov|io|ai|app|me|info|biz|site|xyz|dev|page|gle|gl)(?:\/[^\s가-힣\]()<>"]*)?))/g;

/**
 * AI 응답 텍스트를 마크다운 엔진이 잘 해석할 수 있도록 전처리하는 함수 (UNIDORM 규격)
 */
const preprocessMarkdown = (rawText: string): string => {
  if (!rawText) return rawText;

  let text = rawText;

  // 0. URL이 비어 있는 출처 마크다운 링크 항목 제거 ([제목](), - [제목]() 등)
  text = text.replace(
    /^[ \t]*(?:[-*+]|\d+\.)?[ \t]*\[[^\]]*\]\(\s*\)[ \t]*\r?\n?/gm,
    ""
  );
  text = text.replace(/\[[^\]]*\]\(\s*\)/g, "");

  // 1. LaTeX 기호 치환 ($\rightarrow$, $\to$, \rightarrow 등)
  text = text.replace(
    /\$(?:\\?([a-zA-Z]+))\$/g,
    (match, symbol) => LATEX_SYMBOLS[symbol] || match
  );
  text = text.replace(
    /\\(rightarrow|to|leftarrow|gets|leftrightarrow|Rightarrow|Leftarrow|Leftrightarrow|pm|times|div|neq|ne|leq|le|geq|ge|approx|cdot|bullet|dots|cdots|infty|deg)\b/g,
    (match, symbol) => LATEX_SYMBOLS[symbol] || match
  );

  // 2. '=== 섹션 제목 ===' 형태 변환
  text = text.replace(
    /^[ \t]*={3,}[ \t]*(.*?)[ \t]*={3,}[ \t]*$/gm,
    (_, inner) => {
      const trimmed = inner.trim();
      return trimmed ? `\n> **${trimmed}**\n` : "\n---\n";
    }
  );

  // 3. 단독 '===' 구분선이 앞 문장과 합쳐져 H1으로 변환되는 것 방지
  text = text.replace(/(.)\n(={3,}|-{3,})(\n|$)/g, "$1\n\n$2$3");

  // 4. URL/링크 정제
  text = text.replace(
    COMBINED_LINK_REGEX,
    (match, label, link, nakedScheme, nakedDomain) => {
      if (link) {
        const { cleaned, rest } = cleanUrl(link);
        return `[${label}](${ensureHttpScheme(cleaned)})${rest}`;
      } else if (nakedScheme) {
        const { cleaned, rest } = cleanUrl(nakedScheme);
        return `<${cleaned}>${rest}`;
      } else if (nakedDomain) {
        const { cleaned, rest } = cleanUrl(nakedDomain);
        return `[${cleaned}](${ensureHttpScheme(cleaned)})${rest}`;
      }
      return match;
    }
  );

  // 5. HTML 태그가 아닌 한글/일반 텍스트가 담긴 <식별자> 형태 이스케이프 (<학적변동관리> 등)
  text = text.replace(/<([^>/\s]+)>/g, (match, tag) => {
    if (
      /^https?:\/\//i.test(tag) ||
      /^(br|b|i|u|strong|em|code|pre|p|span|div|table|th|td|tr|tbody|thead|ul|ol|li|hr|img|a)$/i.test(
        tag
      )
    ) {
      return match;
    }
    return `&lt;${tag}&gt;`;
  });

  return text;
};

/**
 * 텍스트 노드를 단어 단위로 쪼개어 UNIDORM 페이드인 효과(fade-in-word class)를 적용하는 헬퍼 함수
 */
const wrapTextWithSpans = (children: React.ReactNode): React.ReactNode => {
  if (typeof children === "string") {
    if (!children) return children;
    const words = children.split(/(\s+)/);
    return words.map((word, i) => {
      if (word.trim() === "") {
        return <React.Fragment key={i}>{word}</React.Fragment>;
      }
      return (
        <span key={i} className="fade-in-word">
          {word}
        </span>
      );
    });
  }

  if (Array.isArray(children)) {
    return children.map((child, index) => (
      <React.Fragment key={index}>{wrapTextWithSpans(child)}</React.Fragment>
    ));
  }

  return children;
};

/**
 * 도구 카테고리에 맞는 담백한 아이콘 반환 (Gemini 연동 스타일)
 */
const getToolIcon = (category: string) => {
  switch (category) {
    case "PORTAL":
      return <GraduationCap size={13} className="text-blue-600" />;
    case "LMS":
      return <BookOpen size={13} className="text-indigo-600" />;
    case "LIBRARY":
      return <Library size={13} className="text-sky-600" />;
    case "CAFETERIA":
      return <Utensils size={13} className="text-amber-600" />;
    case "BUS":
      return <Bus size={13} className="text-emerald-600" />;
    case "NOTICE":
      return <Bell size={13} className="text-purple-600" />;
    case "SCHEDULE":
      return <Calendar size={13} className="text-teal-600" />;
    case "DIRECTORY":
      return <Phone size={13} className="text-cyan-600" />;
    case "INU_AI_KNOWLEDGE":
      return <Compass size={13} className="text-blue-500" />;
    default:
      return <Cpu size={13} className="text-slate-500" />;
  }
};

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

  const processedContent = preprocessMarkdown(cleanContent);

  const hasTimeline =
    !isUser &&
    ((message.toolStatuses && message.toolStatuses.length > 0) ||
      message.thinking ||
      (message.isStreaming && !cleanContent));

  return (
    <div
      className={`w-full max-w-[800px] flex gap-3 mb-6 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {/* 사용자 메시지는 우측 말풍선, AI 메시지는 좌측 프로필 없이 넓게 시작 */}
      <div
        className={`flex flex-col ${
          isUser ? "items-end max-w-[85%]" : "items-start w-full max-w-full"
        }`}
      >
        {isUser ? (
          <div className="py-3 px-4.5 rounded-[18px] bg-[#0061ff] text-white text-[15px] font-medium leading-relaxed shadow-sm word-break keep-all">
            {message.content}
          </div>
        ) : (
          <div className="w-full text-slate-800 text-[15px] leading-relaxed">
            {/* 1. Gemini 스타일 담백한 실시간 생각 및 도구 연계 타임라인 */}
            {hasTimeline && (
              <div className="mb-3.5 flex items-start gap-2.5 p-2.5 rounded-2xl bg-white/60 border border-slate-200/60 shadow-2xs backdrop-blur-xs animate-fade-in">
                {/* 횃불이 로딩 애니메이션 GIF (스트리밍 중이고 답변 텍스트 생성 전일 때 표시) */}
                {message.isStreaming && !cleanContent && (
                  <img
                    src={LoadingAnimation}
                    alt="진행 중..."
                    className="w-7 h-7 object-contain mt-0.5 flex-shrink-0"
                  />
                )}

                <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                  {/* 연동 중/완료된 도구 타임라인 목록 */}
                  {message.toolStatuses && message.toolStatuses.length > 0 && (
                    <div className="flex flex-col gap-1">
                      {message.toolStatuses.map((tool) => (
                        <div
                          key={tool.id}
                          className="flex items-center gap-2 text-xs text-slate-700 animate-fade-in"
                        >
                          <div className="w-5 h-5 rounded-md bg-white border border-slate-200/90 flex items-center justify-center flex-shrink-0 shadow-2xs">
                            {getToolIcon(tool.category)}
                          </div>
                          <span className="font-medium tracking-tight truncate">
                            {tool.title}
                          </span>
                          {tool.state === "running" ? (
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse flex-shrink-0" />
                          ) : (
                            <Check
                              size={12}
                              className="text-emerald-600 stroke-[2.5] flex-shrink-0"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* AI 생각/판단 스트리밍 (Thinking process: 살짝 회색 계열의 작은 글씨 문단) */}
                  {message.thinking && (
                    <div className="text-[12px] leading-relaxed text-slate-400 font-normal whitespace-pre-line break-words animate-fade-in border-t border-slate-100/80 pt-1.5 mt-0.5">
                      {message.thinking}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. UNIDORM 마크다운 엔진 & 단어별 페이드인 답변 렌더링 */}
            {cleanContent && (
              <div className="prose prose-slate max-w-none prose-p:my-1.5 prose-p:leading-relaxed prose-headings:my-2.5 prose-headings:font-bold prose-h1:text-xl prose-h2:text-lg prose-h3:text-base prose-h4:text-sm prose-ul:my-1.5 prose-li:my-0.5 prose-table:my-2 prose-table:border-collapse prose-th:bg-slate-100 prose-th:px-3 prose-th:py-1.5 prose-td:px-3 prose-td:py-1.5 prose-blockquote:border-l-4 prose-blockquote:border-blue-400 prose-blockquote:bg-blue-50/50 prose-blockquote:py-1 prose-blockquote:px-3 prose-blockquote:rounded-r-lg">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkBreaks]}
                  components={{
                    p: ({ children }) => <p>{wrapTextWithSpans(children)}</p>,
                    li: ({ children }) => <li>{wrapTextWithSpans(children)}</li>,
                    strong: ({ children }) => <strong>{wrapTextWithSpans(children)}</strong>,
                    em: ({ children }) => <em>{wrapTextWithSpans(children)}</em>,
                    h1: ({ children }) => <h1>{wrapTextWithSpans(children)}</h1>,
                    h2: ({ children }) => <h2>{wrapTextWithSpans(children)}</h2>,
                    h3: ({ children }) => <h3>{wrapTextWithSpans(children)}</h3>,
                    h4: ({ children }) => <h4>{wrapTextWithSpans(children)}</h4>,
                    blockquote: ({ children }) => <blockquote>{wrapTextWithSpans(children)}</blockquote>,
                    table: ({ children, ...props }) => (
                      <div className="overflow-x-auto my-2">
                        <table {...props}>{children}</table>
                      </div>
                    ),
                    a: ({ node, children, href, ...props }) => {
                      if (!href || !href.trim()) return null;
                      return (
                        <a
                          {...props}
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline font-medium hover:text-blue-800 break-all"
                        >
                          {wrapTextWithSpans(children)}
                        </a>
                      );
                    },
                  }}
                >
                  {processedContent}
                </ReactMarkdown>

                {message.isStreaming && (
                  <span className="inline-block w-1.5 h-4 ml-1 bg-blue-600 animate-pulse align-middle" />
                )}
              </div>
            )}

            {/* 3. Generative Cards rendering */}
            {message.cards && message.cards.length > 0 && (
              <div className="mt-3">
                <CardRenderer
                  cards={message.cards}
                  onAction={onAction}
                  onConfirmAction={onConfirmAction}
                />
              </div>
            )}

            {/* 4. Follow-up Suggested Action Chips */}
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

            {/* 5. Bottom Actions: Copy Button */}
            {!message.isStreaming && cleanContent && (
              <div className="mt-2 flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  title="답변 복사"
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-white/60 transition-colors cursor-pointer"
                >
                  {copied ? (
                    <Check size={12} className="text-emerald-500" />
                  ) : (
                    <Copy size={12} />
                  )}
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

