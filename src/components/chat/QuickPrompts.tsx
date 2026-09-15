import React from "react";
import { Utensils, Bus, Clock, BookOpen } from "lucide-react";

interface Props {
  onSelect: (prompt: string) => void;
}

export const QuickPrompts: React.FC<Props> = ({ onSelect }) => {
  const suggestions = [
    {
      icon: <Utensils className="w-4 h-4 text-orange-500" />,
      title: "오늘 학식 메뉴",
      prompt: "오늘 학생식당 점심 메뉴 알려줘",
    },
    {
      icon: <Bus className="w-4 h-4 text-blue-500" />,
      title: "셔틀버스 도착 시간",
      prompt: "지금 셔틀버스 언제 오는지 알려줘",
    },
    {
      icon: <Clock className="w-4 h-4 text-emerald-500" />,
      title: "LMS 마감 예정 과제",
      prompt: "이번 주 마감인 사이버캠퍼스 과제 있어?",
    },
    {
      icon: <BookOpen className="w-4 h-4 text-purple-500" />,
      title: "열람실 좌석 현황",
      prompt: "학술정보관 열람실 좌석 잔여석 현황 알려줘",
    },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto py-8 px-4 text-center">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
          안녕하세요! 저는 챗불이예요 🎓
        </h2>
        <p className="text-xs md:text-sm text-slate-500 mt-1">
          인천대 학생 생활, 학사 규정, 학식, 버스, 과제 등 무엇이든 물어보세요!
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
        {suggestions.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(item.prompt)}
            className="p-4 bg-white border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/40 rounded-2xl shadow-sm hover:shadow transition-all group flex items-start gap-3"
          >
            <div className="p-2 rounded-xl bg-slate-50 group-hover:bg-white transition-colors">
              {item.icon}
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                {item.title}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                "{item.prompt}"
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
