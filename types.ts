export interface Company {
  name: string;
  series: string;
  industry: string;
  location: string;
  h1b_likelihood: 'High' | 'Medium' | 'Low' | 'Unknown';
  roles: string[];
  website: string;
  description: string;
  reasoning: string; // Why specifically listed (e.g., "Recently raised $100M Series C")
}

export interface ResearchState {
  seriesC: Company[];
  seriesD: Company[];
  seriesE: Company[];
  lateStage: Company[];
  isSearching: boolean;
  currentStage: string; // e.g., "Searching Series C..."
  error: string | null;
}

export type SeriesCategory = 'seriesC' | 'seriesD' | 'seriesE' | 'lateStage';

export const SERIES_LABELS: Record<SeriesCategory, string> = {
  seriesC: 'Series C',
  seriesD: 'Series D',
  seriesE: 'Series E',
  lateStage: 'Late Stage / Pre-IPO',
};