import React from "react";
import { ComponentCardData } from "../../types/agent";
import {
  BookOpen,
  GraduationCap,
  FileText,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  KeyRound,
  Bell,
  Clock,
  Users,
  Smartphone,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { handleAppNavigation, isMobileAppEnvironment } from "../../utils/navigation";
import { openIntipAppOrStore } from "../../utils/appLauncher";

interface Props {
  data: ComponentCardData;
  onAction?: (actionId: string) => void;
  onConfirmAction?: (payload: Record<string, any>) => void;
  onRetry?: (query?: string) => void;
  lastUserQuery?: string;
}

export const ComponentCard: React.FC<Props> = ({
  data,
  onAction,
  onConfirmAction,
  onRetry,
  lastUserQuery,
}) => {
  const type = data.type?.toUpperCase() || "";
  const cardData = data.data || {};

  // 1. 도서관 열람실 잔여 좌석 목록 카드 (LIBRARY_ROOMS)
  if (type === "LIBRARY_ROOMS" || type === "LIBRARY_SEATS") {
    const rawRooms = Array.isArray(cardData.rooms)
      ? cardData.rooms
      : Array.isArray(cardData)
      ? cardData
      : [];

    return (
      <div className="w-full bg-white rounded-2xl border border-blue-100/80 shadow-sm p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 font-semibold text-slate-800 text-sm md:text-base">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <span>학산도서관 실시간 열람실 좌석</span>
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
            실시간 현황
          </span>
        </div>

        <div className="divide-y divide-slate-50 py-1">
          {rawRooms.length === 0 ? (
            <div className="py-4 text-center text-xs text-slate-400">
              열람실 정보를 불러오는 중이거나 운영 시간이 아닙니다.
            </div>
          ) : (
            rawRooms.slice(0, 8).map((room: any, idx: number) => {
              const name = room.name || `열람실 ${idx + 1}`;
              const total =
                room.total_seats ??
                room.seats?.total ??
                room.totalSeats ??
                0;
              const available =
                room.available_seats ??
                room.seats?.available ??
                room.availableSeats ??
                0;
              const occupied =
                room.occupied_seats ??
                room.seats?.occupied ??
                room.occupiedSeats ??
                Math.max(0, total - available);

              const percent = total > 0 ? Math.round((occupied / total) * 100) : 0;
              const isFull = available <= 0 && total > 0;
              const isBusy = percent >= 80;

              const badgeColor = isFull
                ? "bg-rose-50 text-rose-600 border-rose-100"
                : isBusy
                ? "bg-amber-50 text-amber-600 border-amber-100"
                : "bg-emerald-50 text-emerald-600 border-emerald-100";
              const badgeText = isFull ? "만석" : isBusy ? "혼잡" : "여유";

              const roomUrl = room.id
                ? `/services/library?roomId=${room.id}&tab=seats`
                : "/services/library";

              return (
                <div
                  key={room.id ?? idx}
                  onClick={() => handleAppNavigation(roomUrl)}
                  className="py-2.5 px-2 hover:bg-blue-50/40 rounded-xl transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs md:text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                      {name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${badgeColor}`}
                      >
                        {badgeText}
                      </span>
                      <span className="text-xs font-bold text-slate-700">
                        잔여 <span className="text-blue-600">{available}</span> / {total}석
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                    </div>
                  </div>

                  {/* 좌석 점유율 프로그레스 바 */}
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isFull
                          ? "bg-rose-500"
                          : isBusy
                          ? "bg-amber-500"
                          : "bg-blue-500"
                      }`}
                      style={{ width: `${Math.min(100, percent)}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {data.link && (
          <div className="pt-2.5 mt-1 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => handleAppNavigation(data.link?.route || "/services/library")}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 py-1 px-2.5 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <span>{data.link.label || "학산도서관 바로가기"}</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    );
  }

  // 2. 도서관 좌석 배정 확인 카드 (LIBRARY_SEAT_CONFIRM)
  if (type === "LIBRARY_SEAT_CONFIRM") {
    const rName = cardData.roomName || "열람실";
    const sNo = cardData.seatNo ? `${cardData.seatNo}번 ` : "";
    const roomId = cardData.roomId;

    const handleConfirm = () => {
      const payload = {
        action: "RESERVE_SEAT",
        roomId,
        roomName: rName,
        seatNo: cardData.seatNo,
      };

      if (onConfirmAction) {
        onConfirmAction(payload);
      } else if (onAction) {
        onAction("lib_reserve_action");
      }

      // 모바일 웹뷰 네이티브 브릿지 호출 (도서관 계정 SSO 연동 세션으로 즉시 배정)
      const seatId = cardData.seatId || cardData.seatNo || 1;
      const instruction = {
        action_id: `act_reserve_seat_${seatId}_${Date.now()}`,
        auth_domain: "LIBRARY",
        protocol: "HTTP_REST",
        request: {
          url: "https://lib.inu.ac.kr/pyxis-api/1/api/seat-charges",
          method: "POST",
          body: {
            seatId: Number(seatId),
            smufMethodCode: "MOBILE",
          },
        },
      };

      if ((window as any).ReactNativeWebView) {
        (window as any).ReactNativeWebView.postMessage(
          JSON.stringify({
            type: "executeAgentAction",
            payload: { instruction },
            requestId: instruction.action_id,
          })
        );
      } else if (typeof window !== "undefined" && window.parent && window.parent !== window) {
        window.parent.postMessage(
          {
            type: "EXECUTE_AGENT_ACTION",
            instruction,
            requestId: instruction.action_id,
          },
          "*"
        );
      }
    };

    return (
      <div className="w-full bg-white rounded-2xl border border-blue-200 shadow-sm p-5 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 font-semibold text-slate-800 text-sm md:text-base pb-2 border-b border-slate-100">
          <CheckCircle2 className="w-5 h-5 text-blue-600" />
          <span>학산도서관 좌석 배정 신청 확인</span>
        </div>

        <div className="py-3">
          <div className="text-xs text-slate-500 mb-1">신청 대상 좌석</div>
          <div className="text-base font-bold text-slate-800">
            {rName} <span className="text-blue-600">{sNo}좌석</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed mt-2 bg-blue-50/60 p-2.5 rounded-xl border border-blue-100/60">
            버튼을 누르면 INTIP 앱 내 보안 세션(백그라운드 웹뷰)을 통해 학산도서관 좌석 배정이 즉시 신청됩니다.
          </p>
        </div>

        <div className="flex gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={handleConfirm}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>확인 및 배정 신청하기</span>
          </button>
        </div>
      </div>
    );
  }

  // 2-B. 스터디룸 예약 확인 카드 (LIBRARY_STUDY_ROOM_CONFIRM)
  if (type === "LIBRARY_STUDY_ROOM_CONFIRM") {
    const roomName = cardData.roomName || "스터디룸";
    const date = cardData.date || "오늘";
    const beginTime = cardData.beginTime || "";
    const endTime = cardData.endTime || "";
    const timeStr = beginTime && endTime ? `${beginTime} ~ ${endTime}` : beginTime || "이용 시간 미정";

    const handleStudyConfirm = () => {
      const instruction = {
        action_id: `act_reserve_study_room_${cardData.roomId || 9}_${Date.now()}`,
        auth_domain: "LIBRARY",
        protocol: "HTTP_REST",
        request: {
          url: "https://lib.inu.ac.kr/pyxis-api/1/api/room-charges",
          method: "POST",
          body: {
            roomId: cardData.roomId || 9,
            roomUseSectionId: 1,
            beginTime: `${date} ${beginTime}`,
            endTime: `${date} ${endTime}`,
            companionCnt: 1,
            patronMessage: "학습 및 회의",
            smufMethodCode: "MOBILE",
          },
        },
      };

      if ((window as any).ReactNativeWebView) {
        (window as any).ReactNativeWebView.postMessage(
          JSON.stringify({
            type: "executeAgentAction",
            payload: { instruction },
            requestId: instruction.action_id,
          })
        );
      } else if (typeof window !== "undefined" && window.parent && window.parent !== window) {
        window.parent.postMessage(
          {
            type: "EXECUTE_AGENT_ACTION",
            instruction,
            requestId: instruction.action_id,
          },
          "*"
        );
      }
    };

    return (
      <div className="w-full bg-white rounded-2xl border border-indigo-200 shadow-sm p-5 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 font-semibold text-slate-800 text-sm md:text-base pb-2 border-b border-slate-100">
          <CheckCircle2 className="w-5 h-5 text-indigo-600" />
          <span>학산도서관 스터디룸 예약 신청 확인</span>
        </div>

        <div className="py-3">
          <div className="text-xs text-slate-500 mb-1">예약 대상 스터디룸</div>
          <div className="text-base font-bold text-slate-800">
            {roomName} <span className="text-indigo-600">({timeStr})</span>
          </div>
          <div className="text-xs text-slate-600 mt-1">예약 날짜: {date}</div>
          <p className="text-xs text-slate-600 leading-relaxed mt-2 bg-indigo-50/60 p-2.5 rounded-xl border border-indigo-100/60">
            버튼을 누르면 INTIP 앱 내 보안 세션을 통해 학산도서관 스터디룸 예약이 즉시 접수됩니다.
          </p>
        </div>

        <div className="flex gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={handleStudyConfirm}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>확인 및 예약 신청하기</span>
          </button>
        </div>
      </div>
    );
  }

  // 2-C. 도서관 스터디룸 목록 카드 (LIBRARY_STUDY_ROOMS)
  if (type === "LIBRARY_STUDY_ROOMS") {
    const rawRooms = Array.isArray(cardData.rooms)
      ? cardData.rooms
      : Array.isArray(cardData)
      ? cardData
      : [];
    const notice = cardData.notice || "스터디룸 예약은 1회 최대 2시간 가능합니다. (이용 시작 20분 내 입실 필수)";

    return (
      <div className="w-full bg-white rounded-2xl border border-indigo-100/80 shadow-sm p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 font-semibold text-slate-800 text-sm md:text-base">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <span>학산도서관 스터디룸</span>
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
            예약 가능
          </span>
        </div>

        <p className="text-[11px] text-slate-500 bg-slate-50 rounded-lg p-2 my-2.5">
          💡 {notice}
        </p>

        <div className="divide-y divide-slate-50 py-1">
          {rawRooms.length === 0 ? (
            <div className="py-4 text-center text-xs text-slate-400">
              스터디룸 정보를 불러오는 중입니다.
            </div>
          ) : (
            rawRooms.map((room: any, idx: number) => {
              const name = room.name || `스터디룸 ${idx + 1}`;
              const location = room.location || "학산도서관";
              const quota = room.quota || "정원 미정";
              const tags = Array.isArray(room.tags) ? room.tags : [];
              const roomUrl = room.id
                ? `/services/library?roomId=${room.id}&tab=study`
                : "/services/library?tab=study";

              return (
                <div
                  key={room.id ?? idx}
                  onClick={() => handleAppNavigation(roomUrl)}
                  className="py-2.5 px-2 hover:bg-indigo-50/40 rounded-xl transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs md:text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                        {name}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {location}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50/80 px-2 py-0.5 rounded-md border border-indigo-100/60">
                        {quota}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                    </div>
                  </div>

                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {tags.map((tag: string, tIdx: number) => (
                        <span
                          key={tIdx}
                          className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {data.link && (
          <div className="pt-2.5 mt-1 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => handleAppNavigation(data.link?.route || "/services/library?tab=study")}
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 py-1 px-2.5 rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer"
            >
              <span>{data.link.label || "스터디룸 전체보기"}</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    );
  }

  // 3. 학적 정보 카드 (ACADEMIC_INFO)
  if (type === "ACADEMIC_INFO") {
    const studentName =
      cardData.koreanName ||
      cardData.name ||
      cardData.studentName ||
      cardData.korNm ||
      "학우님";
    const studentId =
      cardData.studentId ||
      cardData.id ||
      cardData.stdNo ||
      cardData.hakbeon ||
      (cardData.entryYear ? `${cardData.entryYear}학번` : "");
    const department =
      cardData.departmentName ||
      cardData.department ||
      cardData.dept ||
      cardData.major ||
      cardData.deptName ||
      "";
    const college = cardData.collegeName || cardData.colgNm || "";
    const status =
      cardData.enrollmentStatus ||
      cardData.status ||
      cardData.academicStatus ||
      "재학";
    const subStatus =
      cardData.latestEnrollmentChange || cardData.flSchregModGbn || "";
    const credits =
      cardData.acquiredCredits ||
      cardData.totalCredits ||
      cardData.credits ||
      "";
    const gpa =
      cardData.gradeAverage || cardData.gpa || cardData.mrksAvg || "";
    const semester =
      cardData.completedSemesterCount ||
      cardData.completedSemesterName ||
      (cardData.grade ? `${cardData.grade}학년` : "");
    const advisor =
      cardData.advisorProfessorName ||
      cardData.advisor ||
      cardData.profNm ||
      "";

    const displayAffiliation = [college, department].filter(Boolean).join(" ");
    const badgeText =
      subStatus && subStatus !== status ? `${status} · ${subStatus}` : status;

    return (
      <div className="w-full bg-white rounded-2xl border border-indigo-100 shadow-sm p-5 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 font-semibold text-slate-800 text-sm md:text-base">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span>학적 기본 정보</span>
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
            {badgeText}
          </span>
        </div>

        <div className="pt-3 pb-2 border-b border-slate-50">
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-slate-900 text-base">{studentName}</span>
            {studentId && (
              <span className="text-xs text-slate-400 font-medium">{studentId}</span>
            )}
          </div>
          {displayAffiliation && (
            <div className="text-xs text-slate-500 mt-0.5">
              {displayAffiliation}
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 py-3 text-center">
          <div className="bg-slate-50/80 rounded-xl p-2.5">
            <span className="text-[10px] text-slate-400 block mb-0.5 font-medium">취득 학점</span>
            <span className="font-bold text-slate-800 text-xs md:text-sm">
              {credits ? `${credits}학점` : "-"}
            </span>
          </div>
          <div className="bg-slate-50/80 rounded-xl p-2.5">
            <span className="text-[10px] text-slate-400 block mb-0.5 font-medium">평점 평균</span>
            <span className="font-bold text-indigo-600 text-xs md:text-sm">
              {gpa ? `${gpa}` : "-"}
            </span>
          </div>
          <div className="bg-slate-50/80 rounded-xl p-2.5">
            <span className="text-[10px] text-slate-400 block mb-0.5 font-medium">이수 학기</span>
            <span className="font-bold text-slate-800 text-xs md:text-sm">
              {semester || "-"}
            </span>
          </div>
        </div>

        {advisor && (
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50/50 text-indigo-900 text-xs font-medium my-1">
            <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span>지도교수: {advisor} 교수님</span>
          </div>
        )}

        {data.link && (
          <div className="pt-2 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => handleAppNavigation(data.link?.route || "/mypage")}
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 py-1 px-2.5 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              <span>{data.link.label || "학적 정보 상세보기"}</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    );
  }

  // 4. LMS 과제 카드 (LMS_ASSIGNMENTS)
  if (type === "LMS_ASSIGNMENTS") {
    const events = Array.isArray(cardData.events)
      ? cardData.events
      : Array.isArray(cardData)
      ? cardData
      : [];

    return (
      <div className="w-full bg-white rounded-2xl border border-emerald-100 shadow-sm p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 font-semibold text-slate-800 text-sm md:text-base">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <span>이러닝(LMS) 과제 및 일정</span>
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
            총 {events.length}건
          </span>
        </div>

        <div className="divide-y divide-slate-50 py-1">
          {events.length === 0 ? (
            <div className="py-4 text-center text-xs text-slate-400">
              마감 예정인 과제나 일정이 없습니다.
            </div>
          ) : (
            events.slice(0, 5).map((ev: any, idx: number) => {
              const name = ev.name || ev.title || "과제";
              const cName = ev.course?.fullname || ev.courseName || "";
              const due = ev.formattedtime || ev.timedue || ev.dueDate || "마감 예정";
              const url = ev.url || "https://lms.inu.ac.kr";

              return (
                <div
                  key={idx}
                  onClick={() => handleAppNavigation(url)}
                  className="py-2.5 px-2 hover:bg-emerald-50/40 rounded-xl transition-colors cursor-pointer group flex items-center justify-between"
                >
                  <div className="pr-3">
                    <div className="text-xs md:text-sm font-medium text-slate-800 group-hover:text-emerald-600 transition-colors line-clamp-1">
                      {name}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {cName && `${cName} · `}
                      <span className="text-rose-500 font-medium">{due}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-500 transition-colors shrink-0" />
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  // 5. 포털 계정 연동 안내 카드 (PORTAL_AUTH_REQUIRED / LMS_AUTH_REQUIRED 공통)
  if (type === "PORTAL_AUTH_REQUIRED" || type === "LMS_AUTH_REQUIRED") {
    const isApp = isMobileAppEnvironment(cardData.clientContext);

    const handleOpenModalOrPage = () => {
      // 1) 모바일 네이티브 브릿지 (앱 직송)
      if ((window as any).ReactNativeWebView) {
        (window as any).ReactNativeWebView.postMessage(
          JSON.stringify({
            type: "navigateTo",
            payload: { path: "/mypage/portal", url: "/mypage/portal" },
          })
        );
        (window as any).ReactNativeWebView.postMessage(
          JSON.stringify({ type: "openPortalAccountModal" })
        );
      }
      // 2) 부모창 iframe 통신 (inu-portal-web)
      if (typeof window !== "undefined" && window.parent && window.parent !== window) {
        window.parent.postMessage(
          {
            type: "INTIP_NAVIGATE",
            url: "/mypage/portal",
          },
          "*"
        );
        window.parent.postMessage({ type: "OPEN_PORTAL_ACCOUNT_MODAL" }, "*");
      }
      // 3) 자체 내비게이션 및 창 이벤트
      handleAppNavigation("/mypage/portal");
      window.dispatchEvent(new CustomEvent("openPortalAccountModal"));
    };

    // 5-A. 모바일 앱 환경이 아닌 경우 (Non-App / Web Browser)
    if (!isApp) {
      return (
        <div className="w-full bg-white rounded-2xl border border-blue-100 shadow-sm p-5 hover:shadow-md transition-shadow">
          <div className="flex flex-col items-center text-center pb-3 border-b border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0061ff] flex items-center justify-center mb-2.5 shadow-2xs">
              <Smartphone className="w-6 h-6 stroke-[2]" />
            </div>
            <div className="font-bold text-slate-800 text-base md:text-lg mb-1">
              INTIP 모바일 앱 전용 기능이에요
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-md">
              포털 계정 연동은 기기 보안 저장소(KeyStore)를 이용하므로 INTIP 모바일 앱 환경에서만 등록하고 이용할 수 있어요.
            </p>
          </div>

          <div className="my-3.5 p-3.5 bg-slate-50/80 rounded-xl border border-slate-100 text-left">
            <div className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>연동 시 이용 가능한 기능</span>
            </div>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside pl-0.5">
              <li><strong className="text-slate-700">기본 학적 정보</strong> (취득 학점, 성적, 학적 상태를 조회해요)</li>
              <li><strong className="text-slate-700">이러닝 LMS</strong> (과제 마감 알림과 수강 강좌를 확인해요)</li>
              <li><strong className="text-slate-700">학산도서관</strong> (열람실 좌석 배정 및 스터디룸을 예약해요)</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <button
              type="button"
              onClick={() => openIntipAppOrStore("mypage/portal")}
              className="w-full py-2.5 px-4 bg-[#0061ff] hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <Smartphone className="w-4 h-4" />
              <span>앱 열기 및 설치</span>
            </button>

            {onRetry && (
              <button
                type="button"
                onClick={() => onRetry(lastUserQuery)}
                className="w-full py-2 px-4 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>연동 완료 후 다시 질문하기</span>
              </button>
            )}
          </div>

          <div className="text-[11px] text-slate-400 text-center mt-2.5">
            이 폰에서 직접 작업이 수행돼요.
          </div>
        </div>
      );
    }

    // 5-B. 모바일 앱 환경인 경우 (App Environment & Not Linked)
    return (
      <div className="w-full bg-white rounded-2xl border border-rose-100 shadow-sm p-5 hover:shadow-md transition-shadow">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
            <KeyRound className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="font-bold text-slate-800 text-sm md:text-base mb-1">
              포털 계정 연동이 필요해요
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              학적 정보, 이러닝(LMS) 과제, 도서관 이용을 위해 최초 1회 포털 계정 연동이 필요합니다. 입력하신 정보는 기기 보안 영역(KeyStore)에만 안전하게 보관됩니다.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-3 mt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={handleOpenModalOrPage}
            className="w-full py-2.5 px-4 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
          >
            <KeyRound className="w-4 h-4" />
            <span>포털 계정 연동하기</span>
          </button>

          {onRetry && (
            <button
              type="button"
              onClick={() => onRetry(lastUserQuery)}
              className="w-full py-2 px-4 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
              <span>연동 완료 후 다시 질문하기</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // 6. 연동된 계정의 일시적 학적 조회 실패 안내 카드 (ACADEMIC_FETCH_FAILED)
  if (type === "ACADEMIC_FETCH_FAILED") {
    const detail = cardData.message || "포털 또는 학교 ERP 응답을 확인하지 못했습니다.";
    return (
      <div className="w-full bg-white rounded-2xl border border-amber-200 shadow-sm p-5 hover:shadow-md transition-shadow">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <KeyRound className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="font-bold text-slate-800 text-sm md:text-base mb-1">
              연동된 포털에서 학적 정보를 가져오지 못했어요
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-1">
              계정 연동은 정상 유지되어 있습니다. 잠시 후 같은 질문을 다시 보내주세요. 계속되면 포털 로그인 상태 또는 학교 ERP 시스템을 확인해 주세요.
            </p>
            <p className="text-[11px] text-slate-400">{detail}</p>
          </div>
        </div>
      </div>
    );
  }

  // 7. 실시간 빈자리 감시(스나이퍼) 결과 카드 (CAMPUS_WATCH_RESULT)
  if (type === "CAMPUS_WATCH_RESULT") {
    const targetName = cardData.targetName || "힐링존";
    const remainingMinutes = cardData.remainingMinutes || cardData.job?.remainingMinutes || 90;

    return (
      <div className="w-full bg-white rounded-2xl border border-blue-200 shadow-sm p-5 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 font-semibold text-slate-800 text-sm md:text-base">
            <Bell className="w-4 h-4 text-blue-600" />
            <span>실시간 빈자리 감시 시작</span>
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 animate-pulse">
            감시 중
          </span>
        </div>

        <div className="py-3">
          <div className="text-base font-bold text-slate-800 mb-1">
            {targetName} 빈자리 스나이퍼
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            서버가 실시간으로 안전하게 감시 중입니다. 빈자리가 발생하는 즉시 푸시 알림을 보내드릴게요!
          </p>
          <div className="flex items-center gap-1.5 mt-2.5 text-xs text-amber-600 bg-amber-50/60 p-2 rounded-xl">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span>최대 감시 시간: 약 {remainingMinutes}분 (만료 시 자동 종료)</span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            onClick={() => handleAppNavigation("/mypage/notification/smart-watch")}
            className="w-full py-2.5 px-4 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>감시 목록 및 관리 페이지 열기</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // 8. 기기 로컬 감시 등록 카드 (LOCAL_WATCH_ACTION)
  if (type === "LOCAL_WATCH_ACTION") {
    const targetName = cardData.targetName || "좌석";
    const handleRegisterLocal = () => {
      const payload = {
        watchType: cardData.watchType || "SPECIFIC_SEAT_SNIPER",
        roomId: cardData.roomId,
        roomName: targetName,
        seatNo: cardData.seatNo,
        durationMinutes: cardData.durationMinutes || 90,
      };
      if ((window as any).ReactNativeWebView) {
        (window as any).ReactNativeWebView.postMessage(
          JSON.stringify({ type: "registerLocalWatchJob", payload })
        );
      }
      if (typeof window !== "undefined" && window.parent && window.parent !== window) {
        window.parent.postMessage({ type: "REGISTER_LOCAL_WATCH_JOB", payload }, "*");
      }
    };

    return (
      <div className="w-full bg-white rounded-2xl border border-indigo-200 shadow-sm p-5 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 font-semibold text-slate-800 text-sm md:text-base pb-3 border-b border-slate-100">
          <Bell className="w-4 h-4 text-indigo-600" />
          <span>기기 내 빈자리 감시 ({targetName})</span>
        </div>
        <p className="text-xs text-slate-600 py-3 leading-relaxed">
          {targetName}의 빈자리를 앱에서 백그라운드로 감시합니다. 아래 버튼을 눌러 기기 알림을 활성화하세요.
        </p>
        <button
          onClick={handleRegisterLocal}
          className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
        >
          <Bell className="w-4 h-4" />
          <span>기기 감시 등록하기</span>
        </button>
      </div>
    );
  }

  // 9. 기본 Fallback
  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
      <div className="flex items-center gap-2 font-semibold text-slate-800 text-sm pb-2 border-b border-slate-100">
        <AlertCircle className="w-4 h-4 text-blue-600" />
        <span>{data.type || "컴포넌트 안내"}</span>
      </div>
      <div className="py-2 text-xs text-slate-600">
        {data.link ? (
          <button
            onClick={() => handleAppNavigation(data.link?.route || "")}
            className="text-blue-600 underline font-medium hover:text-blue-800"
          >
            {data.link.label || "바로가기"}
          </button>
        ) : (
          JSON.stringify(cardData)
        )}
      </div>
    </div>
  );
};
