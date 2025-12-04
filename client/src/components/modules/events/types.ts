export type FilterState = {
  selected_tags: string[];
};

export type DailyViewMode = 'list' | 'calendar';
export type CalendarMode = 'day' | 'week';

export interface EventLayoutPosition {
  column: number;
  totalColumns: number;
}

export interface EventStyles {
  top: number;
  height: number;
}

export interface HourLabel {
  value: number;
  display: string;
}
