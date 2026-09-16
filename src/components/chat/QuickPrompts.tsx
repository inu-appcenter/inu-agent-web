import React, { useState } from "react";
import {
  Utensils,
  Bus,
  Laptop,
  BookOpen,
  GraduationCap,
  Phone,
  BellRing,
  CalendarDays,
  ArrowLeft,
  ChevronRight,
  Sparkles,
  Send,
} from "lucide-react";

interface Props {
  onSelect: (prompt: string) => void;
}

interface TaskExample {
  title: string;
  prompt: string;
  description: string;
}

interface DomainCategory {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  colorClass: {
    bg: string;
    text: string;
    border: string;
    hoverBg: string;
  };
  icon: React.ReactNode;
  tasks: TaskExample[];
}

export const QuickPrompts: React.FC<Props> = ({ onSelect }) => {
  const [selectedDomainId, setSelectedDomainId] = useState<string | null>(null);

  const domains: DomainCategory[] = [
    {
      id: "CAFETERIA",
      title: "학식 / 식당 메뉴",
      subtitle: "학생식당, 1·2기숙사, 27호관, 사범대 식단",
      description: "캠퍼스 내 주요 식당의 실시간 조식·중식·석식 메뉴와 특정 요일의 식단표를 조회합니다.",
      badge: "실시간 메뉴",
      colorClass: {
        bg: "bg-orange-50",
        text: "text-orange-600",
        border: "border-orange-100",
        hoverBg: "hover:bg-orange-50/40",
      },
      icon: <Utensils className="w-5 h-5 text-orange-500" />,
      tasks: [
        {
          title: "오늘 학생식당 점심 메뉴",
          prompt: "오늘 학생식당 점심 메뉴 알려줘",
          description: "학생식당의 백반 및 일품 메뉴를 실시간으로 확인합니다.",
        },
        {
          title: "제1기숙사 식당 저녁 메뉴",
          prompt: "오늘 1기숙사 식당 저녁 메뉴 뭐야?",
          description: "기숙사 거주 학생 및 일반 이용자를 위한 석식 운영 메뉴를 조회합니다.",
        },
        {
          title: "내일 27호관 식당 메뉴 미리보기",
          prompt: "내일 27호관 식당 학식 메뉴 보여줘",
          description: "내일 날짜의 27호관 식당 중식/석식 메뉴를 미리 확인합니다.",
        },
        {
          title: "사범대 식당 이번 주 식단",
          prompt: "사범대 식당 이번 주 식단 알려줘",
          description: "사범대학 식당의 주간 메뉴 일정을 한눈에 안내받습니다.",
        },
      ],
    },
    {
      id: "BUS",
      title: "등하교 버스 도착 정보",
      subtitle: "인천대입구역, 자연대, 공대 버스",
      description: "인팁(INTIP) 서비스 대상 주요 정류소 및 연계 노선의 실시간 버스 도착 예정 시간과 잔여 정류소 수를 제공합니다.",
      badge: "실시간 BIS",
      colorClass: {
        bg: "bg-blue-50",
        text: "text-blue-600",
        border: "border-blue-100",
        hoverBg: "hover:bg-blue-50/40",
      },
      icon: <Bus className="w-5 h-5 text-blue-500" />,
      tasks: [
        {
          title: "인천대입구역 2번출구 버스",
          prompt: "인천대입구역 2번출구 버스 도착 정보 알려줘",
          description: "지하철역에서 캠퍼스로 진입하는 순환 및 시내버스 실시간 현황을 확인합니다.",
        },
        {
          title: "송도 캠퍼스 셔틀버스 도착 시간",
          prompt: "지금 송도 캠퍼스 셔틀버스 언제 와?",
          description: "캠퍼스 내부 주요 정류소의 셔틀버스 실시간 도착 정보를 조회합니다.",
        },
        {
          title: "자연과학대학 정류소 버스",
          prompt: "자연대 정류장 버스 도착 예정 시간 보여줘",
          description: "자연과학대학 앞 정류소에 진입하는 노선별 실시간 도착 목록을 확인합니다.",
        },
        {
          title: "공과대학 정류소 도착 예정",
          prompt: "공대 앞 버스 몇 분 뒤에 도착해?",
          description: "공대 앞 정류소에 가장 먼저 도착하는 버스 정보를 확인합니다.",
        },
      ],
    },
    {
      id: "LMS",
      title: "이러닝(LMS) 과제 및 강의",
      subtitle: "마감 과제, 수강 강좌, 출석 현황",
      description: "학생 기기의 개인화 연동(Zero-Knowledge)을 통해 마감 임박 과제, 수강 과목 목록, 출석 현황을 안전하게 확인합니다.",
      badge: "기기 연동",
      colorClass: {
        bg: "bg-emerald-50",
        text: "text-emerald-600",
        border: "border-emerald-100",
        hoverBg: "hover:bg-emerald-50/40",
      },
      icon: <Laptop className="w-5 h-5 text-emerald-500" />,
      tasks: [
        {
          title: "이번 주 마감 임박 과제",
          prompt: "이번 주 마감인 이러닝 과제 있어?",
          description: "제출 기한이 얼마 남지 않은 과제 목록과 마감 시각을 확인합니다.",
        },
        {
          title: "수강 중인 강좌 목록",
          prompt: "이번 학기 내가 수강하는 강의 목록 보여줘",
          description: "현재 학기 등록되어 수강 중인 이러닝 강좌 목록을 확인합니다.",
        },
        {
          title: "미제출 과제 점검",
          prompt: "이러닝(LMS) 미제출 과제 확인해줘",
          description: "아직 제출하지 않은 이러닝 과제가 있는지 안전하게 점검합니다.",
        },
        {
          title: "미수강 온라인 강의 영상",
          prompt: "이러닝 출석 안 한 강의 영상 있어?",
          description: "출석 인정 기한 내에 시청해야 하는 온라인 동영상 강의를 확인합니다.",
        },
      ],
    },
    {
      id: "LIBRARY",
      title: "학산도서관 열람실 & 스터디룸",
      subtitle: "실시간 잔여 좌석, 즉시 배정, 스터디룸 예약",
      description: "학산도서관 열람실의 실시간 잔여 좌석을 확인하고, 원하는 좌석이나 스터디룸 배정 신청 카드를 바로 호출합니다.",
      badge: "대화형 카드 배정",
      colorClass: {
        bg: "bg-indigo-50",
        text: "text-indigo-600",
        border: "border-indigo-100",
        hoverBg: "hover:bg-indigo-50/40",
      },
      icon: <BookOpen className="w-5 h-5 text-indigo-500" />,
      tasks: [
        {
          title: "열람실 실시간 잔여 좌석 현황",
          prompt: "학산도서관 열람실 잔여 좌석 현황 알려줘",
          description: "제1열람실, 제2열람실, 힐링존 등의 실시간 잔여 좌석 수를 확인합니다.",
        },
        {
          title: "제1열람실 좌석 배정 신청",
          prompt: "제1열람실 35번 좌석 배정해줘",
          description: "대화창에 좌석 배정 확인 카드를 띄워 앱에서 즉시 도서관 시스템에 배정합니다.",
        },
        {
          title: "도서관 3층 열람실 빈자리",
          prompt: "도서관 3층 열람실 빈자리 몇 개 남아있어?",
          description: "특정 층수나 구역의 열람실 좌석 현황을 파악합니다.",
        },
        {
          title: "스터디룸 목록 및 예약 신청",
          prompt: "도서관 스터디룸 예약 가능한 곳 있어?",
          description: "이용 가능한 스터디룸 목록을 확인하고 예약 확인 카드를 요청합니다.",
        },
      ],
    },
    {
      id: "INU_AI",
      title: "졸업 요건 & 학사 규정 (INU AI)",
      subtitle: "학칙 기반 졸업학점, 조기졸업, 복수전공, 전과",
      description: "인천대학교 공식 학칙 및 학사 규정 지식베이스(RAG)를 바탕으로 신뢰할 수 있는 규정 근거 조항과 함께 명확하게 답변합니다.",
      badge: "공식 지식베이스",
      colorClass: {
        bg: "bg-purple-50",
        text: "text-purple-600",
        border: "border-purple-100",
        hoverBg: "hover:bg-purple-50/40",
      },
      icon: <GraduationCap className="w-5 h-5 text-purple-500" />,
      tasks: [
        {
          title: "학과별 졸업 요건 및 인증 규정",
          prompt: "컴퓨터공학과 졸업 요건 자세히 알려줘",
          description: "단과대/학과별 졸업 최소 학점, 전공 이수 요건, 졸업인증 규정을 확인합니다.",
        },
        {
          title: "복수전공 / 부전공 신청 자격",
          prompt: "복수전공 신청 자격이랑 이수 기준이 어떻게 돼?",
          description: "복수전공 이수를 위한 신청 시기, 평점 기준, 이수 학점을 학칙 규정 기반으로 안내합니다.",
        },
        {
          title: "조기졸업 자격 조건",
          prompt: "조기졸업 하려면 학점이랑 조건이 뭐야?",
          description: "조기졸업을 위한 이수 학기, 평점평균 기준, 이수 학점 조건을 확인합니다.",
        },
        {
          title: "전과(소속변경) 지원 기준",
          prompt: "전과(소속변경) 신청 시기랑 지원 자격 알려줘",
          description: "타 학과로 전과하기 위한 지원 자격 및 제한 사항 규정을 확인합니다.",
        },
        {
          title: "일반휴학 / 복학 학칙 규정",
          prompt: "일반휴학 최대 몇 학기까지 가능해?",
          description: "학칙에 명시된 휴학 가능 학기 수와 신청 기한을 정확히 안내받습니다.",
        },
      ],
    },
    {
      id: "DIRECTORY",
      title: "교내 연락처 & 학과 사무실",
      subtitle: "과사 위치, 교수님 연구실, 행정부서 전화번호",
      description: "교내 학과 사무실(과사), 단과대학 행정실, 교수님 연구실 및 주요 교내 부서의 전화번호와 위치 정보를 조회합니다.",
      badge: "캠퍼스 주소록",
      colorClass: {
        bg: "bg-sky-50",
        text: "text-sky-600",
        border: "border-sky-100",
        hoverBg: "hover:bg-sky-50/40",
      },
      icon: <Phone className="w-5 h-5 text-sky-500" />,
      tasks: [
        {
          title: "컴퓨터공학과 사무실(과사)",
          prompt: "컴공 과사 전화번호 알려줘",
          description: "학과사무실 전화번호, 위치(호관 및 호실), 공식 이메일을 확인합니다.",
        },
        {
          title: "정보기술대학 단과대 행정실",
          prompt: "정보기술대학 행정실 연락처 뭐야?",
          description: "단과대학 행정실 전화번호 및 위치 정보를 조회합니다.",
        },
        {
          title: "학생지원과 장학팀 연락처",
          prompt: "학생지원과 장학팀 전화번호 알려줘",
          description: "장학금 문의 및 학생 지원 부서의 공식 연락처를 안내받습니다.",
        },
        {
          title: "경영학과 학과사무실 위치",
          prompt: "경영학과 학과사무실 어디에 있어?",
          description: "해당 학과가 위치한 캠퍼스 건물 번호와 호실 정보를 확인합니다.",
        },
      ],
    },
    {
      id: "WATCH_REMINDER",
      title: "스마트 감시 & 맞춤 알림",
      subtitle: "힐링존 빈자리 감시, 정시 학식·버스 푸시 예약",
      description: "열람실·힐링존에 빈자리가 나면 실시간 푸시로 알려주는 감시 작업과 원하는 시간에 정보를 받는 맞춤 알림을 관리합니다.",
      badge: "실시간 감시 / 푸시",
      colorClass: {
        bg: "bg-amber-50",
        text: "text-amber-600",
        border: "border-amber-100",
        hoverBg: "hover:bg-amber-50/40",
      },
      icon: <BellRing className="w-5 h-5 text-amber-500" />,
      tasks: [
        {
          title: "힐링존 빈자리 실시간 감시 등록",
          prompt: "힐링존 자리 나면 알림 걸어줘",
          description: "인기 좌석인 힐링존에 빈자리가 생길 때까지 실시간으로 감시하고 푸시를 보냅니다.",
        },
        {
          title: "제1열람실 빈자리 감시",
          prompt: "제1열람실 빈자리 생기면 알려줘",
          description: "열람실 만석 시 빈자리가 나오면 모바일 푸시 알림을 받도록 등록합니다.",
        },
        {
          title: "매일 점심 학식 알림 예약",
          prompt: "매일 오전 11시 30분에 학식 알림 맞춰줘",
          description: "지정한 시간에 오늘의 학식 메뉴를 푸시 메시지로 발송하도록 예약합니다.",
        },
        {
          title: "내 감시 및 알림 작업 확인",
          prompt: "내가 등록한 스마트 감시 작업 목록 보여줘",
          description: "현재 활성화되어 백그라운드에서 실행 중인 감시 작업 목록을 확인합니다.",
        },
      ],
    },
    {
      id: "SCHEDULE_WEATHER",
      title: "학사일정 & 캠퍼스 날씨",
      subtitle: "수강신청, 시험기간, 실시간 송도 날씨·미세먼지",
      description: "공식 학사일정(수강신청, 시험, 종강 등)과 기상청 관측 송도 캠퍼스 실시간 날씨 정보를 확인합니다.",
      badge: "학사일정 / 기상청",
      colorClass: {
        bg: "bg-teal-50",
        text: "text-teal-600",
        border: "border-teal-100",
        hoverBg: "hover:bg-teal-50/40",
      },
      icon: <CalendarDays className="w-5 h-5 text-teal-500" />,
      tasks: [
        {
          title: "이번 달 주요 학사일정",
          prompt: "이번 달 학사일정 뭐 있어?",
          description: "이번 달에 예정된 수강신청, 등록금 납부, 공휴일 일정을 확인합니다.",
        },
        {
          title: "중간고사 / 기말고사 시험 기간",
          prompt: "중간고사 시험 기간 언제부터야?",
          description: "학사일정에 등록된 정규 고사 시험 일정을 안내받습니다.",
        },
        {
          title: "송도 캠퍼스 실시간 날씨 및 미세먼지",
          prompt: "오늘 송도 캠퍼스 날씨랑 미세먼지 어때?",
          description: "기온, 하늘 상태, 강수 확률, 미세먼지 농도를 실시간으로 확인합니다.",
        },
        {
          title: "다음 학기 개강일 및 수강신청",
          prompt: "다음 학기 수강신청 기간이랑 개강일 알려줘",
          description: "학사일정 DB를 조회하여 다음 학기 핵심 일정을 확인합니다.",
        },
      ],
    },
  ];

  const currentDomain = domains.find((d) => d.id === selectedDomainId);

  // 1. 도메인 상세 작업 예시 목록 화면
  if (currentDomain) {
    return (
      <div className="w-full max-w-2xl mx-auto py-3 px-2 text-left animate-in fade-in duration-200">
        {/* 상단 뒤로가기 바 */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200/80">
          <button
            onClick={() => setSelectedDomainId(null)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-white bg-slate-100/80 border border-slate-200 transition-colors shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            전체 도메인 목록
          </button>
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80">
            {currentDomain.badge}
          </span>
        </div>

        {/* 도메인 헤더 안내 */}
        <div className="flex items-start gap-3.5 mb-5 p-4 rounded-2xl bg-white/90 border border-slate-200/90 shadow-2xs backdrop-blur-xs">
          <div className={`p-2.5 rounded-xl ${currentDomain.colorClass.bg} border ${currentDomain.colorClass.border} shrink-0`}>
            {currentDomain.icon}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
              {currentDomain.title}
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {currentDomain.description}
            </p>
          </div>
        </div>

        {/* 세부 작업 예시 카드 그리드 */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              수행 가능한 작업 예시
            </span>
            <span className="text-[11px] text-slate-400">카드를 누르면 바로 질문됩니다</span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {currentDomain.tasks.map((task, idx) => (
              <button
                key={idx}
                onClick={() => onSelect(task.prompt)}
                className="w-full text-left p-4 bg-white hover:bg-blue-50/40 border border-slate-200/80 hover:border-blue-300 rounded-2xl shadow-2xs hover:shadow-xs transition-all group flex items-start justify-between gap-3 cursor-pointer"
              >
                <div className="space-y-1 pr-2">
                  <div className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    {task.title}
                  </div>
                  <div className="text-xs font-medium text-blue-700/90 bg-blue-50/70 inline-block px-2 py-0.5 rounded-md border border-blue-100/60">
                    "{task.prompt}"
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 leading-normal">
                    {task.description}
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-slate-50 group-hover:bg-blue-600 group-hover:text-white text-slate-400 transition-colors shrink-0 mt-1">
                  <Send className="w-3.5 h-3.5" />
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-3 text-center border-t border-slate-100">
          <p className="text-[11px] text-slate-400">
            💡 위 예시 외에도 해당 도메인과 관련된 구체적인 내용을 아래 입력창에 직접 질문하셔도 됩니다.
          </p>
        </div>
      </div>
    );
  }

  // 2. 초기 메인 도메인 카드 그리드 화면
  return (
    <div className="w-full max-w-2xl mx-auto py-4 px-2 text-center animate-in fade-in duration-200">
      {/* 챗불이 환영 인사 */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center justify-center gap-2">
          <span>안녕하세요! 저는 챗불이예요</span>
          <span className="text-2xl">🎓</span>
        </h2>
        <p className="text-xs md:text-sm text-slate-500 mt-1.5 max-w-md mx-auto leading-relaxed">
          궁금한 캠퍼스 도메인을 선택하면 에이전트가 실제로 수행할 수 있는 다양한 구체적 작업들을 확인하실 수 있어요.
        </p>
      </div>

      {/* 8대 도메인 카드 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
        {domains.map((item) => (
          <button
            key={item.id}
            onClick={() => setSelectedDomainId(item.id)}
            className={`p-3.5 bg-white border border-slate-200/80 hover:border-blue-300 ${item.colorClass.hoverBg} rounded-2xl shadow-2xs hover:shadow-xs transition-all group flex items-center justify-between gap-3 cursor-pointer`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={`p-2.5 rounded-xl ${item.colorClass.bg} border ${item.colorClass.border} group-hover:bg-white transition-colors shrink-0`}>
                {item.icon}
              </div>
              <div className="min-w-0 pr-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                    {item.title}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                  {item.subtitle}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 group-hover:text-blue-600 shrink-0 pl-1 transition-colors">
              <span className="hidden sm:inline text-[10px] text-slate-400 font-normal">
                {item.tasks.length}개 예시
              </span>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
