import { AnalyticsEvent } from '../types';

export interface IAnalyticsTracker {
  track(event: AnalyticsEvent): void;
}
