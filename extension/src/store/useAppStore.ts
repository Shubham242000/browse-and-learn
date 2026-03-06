import { create } from "zustand";

type UIState =
  | "idle"
  | "detecting"
  | "rating"
  | "streaming"
  | "done"
  | "error";

interface SummaryResult {
  summary: {
    bullets: string[];
    post: string;
    analogy: string;
  };
  signal: {
    confidence: "high" | "medium" | "low";
    caveat?: string;
  };
  meta: {
    topicsUsed: string[];
    missingRatings: string[];
  };
}

interface AppState {
  uiState: UIState;
  pageText: string;
  detectedTopics: string[];
  skills: Record<string, number>;
  missingTopics: string[];
  streamingText: string;
  finalResult: SummaryResult | null;
  error: string | null;

  setUIState: (state: UIState) => void;
  setPageText: (text: string) => void;
  setDetectedTopics: (topics: string[]) => void;
  setSkills: (skills: Record<string, number>) => void;
  setMissingTopics: (topics: string[]) => void;
  appendStream: (chunk: string) => void;
  setFinalResult: (result: SummaryResult) => void;
  setError: (err: string | null) => void;
  resetStream: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  uiState: "idle",
  pageText: "",
  detectedTopics: [],
  skills: {},
  missingTopics: [],
  streamingText: "",
  finalResult: null,
  error: null,

  setUIState: (uiState) => set({ uiState }),
  setPageText: (pageText) => set({ pageText }),
  setDetectedTopics: (detectedTopics) => set({ detectedTopics }),
  setSkills: (skills) => set({ skills }),
  setMissingTopics: (missingTopics) => set({ missingTopics }),
  appendStream: (chunk) =>
    set((state) => ({ streamingText: state.streamingText + chunk })),
  setFinalResult: (finalResult) => set({ finalResult }),
  setError: (error) => set({ error }),
  resetStream: () => set({ streamingText: "", finalResult: null }),
}));