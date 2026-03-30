export interface Word {
  id: string;
  word: string;
  phonetic: string;
  pos: string; // part of speech: n. v. adj. etc
  translation: string;
  example: string;
  level: string; // e.g., 'CET-4', 'CET-6', 'IELTS'
  theme?: string; // Daily, Work, Tech, etc.
  sentiment?: string; // positive, negative, neutral
}

export type QuestionType = 'single' | 'multiple';

export interface Question {
  id: string;
  type: QuestionType;
  word?: Word; // for single choice
  options: any[]; // translations or words
  correctAnswer: string | string[]; // id of correct option(s)
  categoryContext: string; // e.g. "Find the Verb", "Find the positive word"
}

export type GameState = 'menu' | 'dictionary' | 'playing' | 'result';

export interface GameResultData {
  score: number;
  total: number;
  maxCombo: number;
  mistakes: Word[];
}
