import React from "react";
import { Utensils, Bus, Clock, GraduationCap, Phone, BookOpen } from "lucide-react";

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
      title: "등하교 버스 도착 시간",
      prompt: "인천대입구역 버스 언제 와?",
    },
    {
      icon: <Clock className="w-4 h-4 text-emerald-500" />,
      title: "이러닝(LMS) 과제 일정",
      prompt: "이번 주 마감인 이러닝 과제 있어?",
    },
    {
      icon: <GraduationCap className="w-4 h-4 text-purple-500" />,
      title: "졸업 요건 및 학사 규정",
      prompt: "컴퓨터공학과 졸업 요건 알려줘",
    },
    {
      icon: <Phone className="w-4 h-4 text-sky-500" />,
      title: "학과 사무실(과사) 연락처",
      prompt: "컴공 과사 전화번호 알려줘",
    },
    {
      icon: <BookOpen className="w-4 h-4 text-indigo-500" />,
      title: "도서관 열람실 좌석",
      prompt: "도서관 열람실 좌석 남아있어?",
    },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto py-6 px-4 text-center">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
          안녕하세요! 저는 챗불이예요 🎓
        </h2>
        <p className="text-xs md:text-sm text-slate-500 mt-1">
          학식, 등하교 버스, 이러닝 과제, 졸업 요건, 과사 번호 등 무엇이든 물어보세요!
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
        {suggestions.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(item.prompt)}
            className="p-3.5 bg-white border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/40 rounded-2xl shadow-xs hover:shadow transition-all group flex items-start gap-3"
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

