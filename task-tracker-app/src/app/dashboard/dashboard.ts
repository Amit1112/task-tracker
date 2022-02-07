export interface Note {
  id: number;
  title: string;
  summary?: string;
  labels: number[];
  startDate: number;
  endDate: number;
  duration?: number;
  formattedDate?: string
}

export interface NoteLabel {
  id: number;
  text: string;
}

export interface FilterOption {
  id: number;
  text: string;
}
