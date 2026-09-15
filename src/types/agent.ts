export type Role = "user" | "assistant" | "system";

export interface CardBadge {
  text: string;
  theme?: "primary" | "success" | "warning" | "danger" | "neutral";
}

export interface MetricCardItem {
  label: string;
  value: string;
  highlight?: boolean;
}

export interface MetricCardData {
  card_type: "METRIC_CARD";
  title: string;
  badge?: CardBadge;
  main_metric?: MetricCardItem;
  sub_details?: MetricCardItem[];
  action_link?: { label: string; url: string };
}

export interface StatusCardData {
  card_type: "STATUS_CARD";
  title: string;
  status: string;
  progress_percent?: number;
  time_remaining?: string;
  primary_action_label?: string;
  action_id?: string;
}

export interface ListItemData {
  title: string;
  subtitle?: string;
  tag?: string;
  link?: string;
}

export interface ListCardData {
  card_type: "LIST_CARD";
  title: string;
  items: ListItemData[];
  footer_text?: string;
}

export interface ActionCardData {
  card_type: "ACTION_CARD";
  title: string;
  description: string;
  confirm_label: string;
  cancel_label?: string;
  action_payload: Record<string, any>;
}

export type GenerativeCard =
  | MetricCardData
  | StatusCardData
  | ListCardData
  | ActionCardData;

export interface ClientActionRequest {
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  params?: Record<string, any>;
  body?: any;
}

export interface ClientActionInstruction {
  action_id: string;
  auth_domain: "LIBRARY" | "PORTAL" | "LMS" | "NONE";
  protocol: "HTTP_REST" | "NEXACRO_SSV";
  request: ClientActionRequest;
  extraction_rules?: Record<string, any>;
}

export interface ClientActionResult {
  action_id: string;
  success: boolean;
  status_code?: number;
  data?: any;
  error_code?: string;
  error_message?: string;
}

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  cards?: GenerativeCard[];
  actionInstruction?: ClientActionInstruction;
  isStreaming?: boolean;
  timestamp: string;
}
