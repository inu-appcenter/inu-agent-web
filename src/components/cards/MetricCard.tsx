import React from "react";
import { MetricCardData } from "../../types/agent";
import { Award, ExternalLink } from "lucide-react";

interface Props {
  data: MetricCardData;
}

export const MetricCard: React.FC<Props> = ({ data }) => {
  const getBadgeStyle = (theme?: string) => {
    switch (theme) {
      case "success":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "warning":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "danger":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "primary":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 font-semibold text-slate-800 text-sm md:text-base">
          <Award className="w-4 h-4 text-blue-600" />
          {data.title}
        </div>
        {data.badge && (
          <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${getBadgeStyle(data.badge.theme)}`}>
            {data.badge.text}
          </span>
        )}
      </div>

      {/* Main Metric Highlight */}
      {data.main_metric && (
        <div className="py-3.5">
          <div className="text-xs text-slate-500 mb-1">{data.main_metric.label}</div>
          <div
            className={`font-extrabold text-blue-600 tracking-tight leading-snug break-keep ${
              data.main_metric.value.length > 10 ? "text-xl sm:text-2xl" : "text-3xl"
            }`}
          >
            {data.main_metric.value}
          </div>
        </div>
      )}

      {/* Sub Details Grid (보안 안내 등 단일/긴 항목은 전체 너비로 시원하게 확장) */}
      {data.sub_details && data.sub_details.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
          {data.sub_details.map((item, idx) => {
            const isFullWidth =
              data.sub_details!.length === 1 || (item.value && item.value.length > 25);
            return (
              <div
                key={idx}
                className={`bg-slate-50 p-3 rounded-xl ${
                  isFullWidth ? "sm:col-span-2" : ""
                }`}
              >
                <span className="text-slate-500 font-medium block mb-1">{item.label}</span>
                <span className="font-normal text-slate-700 leading-relaxed block break-keep">
                  {item.value}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Action Link */}
      {data.action_link && (
        <a
          href={data.action_link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
        >
          {data.action_link.label} <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  );
};
