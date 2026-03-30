export interface Word {
  id: string;
  word: string;
  phonetic: string;
  pos: string; // part of speech: n. v. adj. etc
  translation: string;
  example?: string;
  level: string; // e.g., 'CET-4', 'CET-6', 'IELTS'
  theme?: string; // Daily, Work, Tech, etc.
  sentiment?: string; // positive, negative, neutral
}

export type QuestionType = 'single' | 'multiple';

export interface QuestionOption {
  id: string;
  word: string;
  translation: string;
  pos?: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  prompt: string;
  word?: {
    id: string;
    word: string;
    phonetic: string;
    translation?: string;
    pos?: string;
  };
  options: QuestionOption[];
  correctAnswerIds: string[];
}

export type GameState = 'login' | 'menu' | 'dictionary' | 'playing' | 'result';

export interface GameResultData {
  score: number;
  total: number;
  maxCombo: number;
  mistakes: Word[];
}
