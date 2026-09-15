import React from "react";
import { StatusCardData } from "../../types/agent";
import { Clock, CheckCircle2 } from "lucide-react";

interface Props {
  data: StatusCardData;
  onAction?: (actionId: string) => void;
}

export const StatusCard: React.FC<Props> = ({ data, onAction }) => {
  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 font-semibold text-slate-800 text-sm md:text-base">
          <Clock className="w-4 h-4 text-emerald-600" />
          {data.title}
        </div>
        <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
          {data.status}
        </span>
      </div>

      {data.time_remaining && (
        <div className="py-3 flex items-baseline justify-between">
          <span className="text-xs text-slate-500">남은 시간</span>
          <span className="text-xl font-bold text-slate-800 tracking-tight">
            {data.time_remaining}
          </span>
        </div>
      )}

      {typeof data.progress_percent === "number" && (
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-3">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, data.progress_percent))}%` }}
          />
        </div>
      )}

      {data.primary_action_label && (
        <button
          onClick={() => data.action_id && onAction?.(data.action_id)}
          className="w-full mt-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          {data.primary_action_label}
        </button>
      )}
    </div>
  );
};
