/**
 * Feedback and hint type definitions for WordPal.
 */

/** Response from the AI feedback engine */
export interface FeedbackResponse {
  correct: boolean;
  message: string;
  errorType?: string;
  suggestedSentence?: string;
}

/** Request payload for POST /api/feedback */
export interface FeedbackRequest {
  sentence: string;
  exerciseId: string;
}

/** Request payload for POST /api/hints */
export interface HintRequest {
  exerciseId: string;
  placedBlocks: string[];
  hintNumber: 1 | 2;
}

/** Response from the hint API */
export interface HintResponse {
  hint: string;
  hintsRemaining: number;
}

/** Props for the FeedbackPanel component */
export interface FeedbackPanelProps {
  status: 'idle' | 'loading' | 'success' | 'error' | 'unavailable';
  feedback: FeedbackResponse | null;
  onRetry: () => void;
}
