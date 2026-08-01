export interface AnalyticsEvent {
  name: string;
  category?: string;
  properties?: Record<string, unknown>;
  timestamp?: number;
}
