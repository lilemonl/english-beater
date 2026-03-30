import { Word } from '../models/word.model';
import { loadWords } from './dictionary.service';

export interface QuestionOption {
  id: string;
  word: string;
  translation: string;
  pos?: string;
}

export interface Question {
  id: string;
  type: 'single' | 'multiple';
  prompt: string;
  word?: {
    id: string;
    word: string;
    phonetic: string;
  };
  options: QuestionOption[];
  correctAnswerIds: string[];
}

const shuffle = <T>(arr: T[]) => arr.sort(() => Math.random() - 0.5);

const pickRandom = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

const pickRandomUnique = <T>(arr: T[], count: number) => {
  const copy = [...arr];
  const result: T[] = [];
  while (result.length < count && copy.length > 0) {
    const idx = Math.floor(Math.random() * copy.length);
    result.push(copy.splice(idx, 1)[0]);
  }
  return result;
};

const buildSingleQuestion = (pool: Word[], index: number): Question => {
  const correct = pickRandom(pool);
  const options = pickRandomUnique(
    pool.filter((w) => w.id !== correct.id),
    3
  );

  const allOptions = shuffle([correct, ...options]).map((w) => ({
    id: w.id,
    word: w.word,
    translation: w.translation
  }));

  return {
    id: `single-${index}-${Date.now()}`,
    type: 'single',
    prompt: 'Choose the correct translation',
    word: {
      id: correct.id,
      word: correct.word,
      phonetic: correct.phonetic,
      translation: correct.translation,
      pos: correct.pos
    },
    options: allOptions,
    correctAnswerIds: [correct.id]
  };
};

const buildMultipleQuestion = (pool: Word[], index: number): Question => {
  const options = pickRandomUnique(pool, 4);
  let correct = options.filter((o) => o.sentiment === 'positive' || o.sentiment === 'neutral');

  if (correct.length === 0) {
    correct = pickRandomUnique(options, 2);
  }

  return {
    id: `multiple-${index}-${Date.now()}`,
    type: 'multiple',
    prompt: 'Select all positive/neutral words',
    options: options.map((w) => ({
      id: w.id,
      word: w.word,
      translation: w.translation,
      pos: w.pos
    })),
    correctAnswerIds: correct.map((w) => w.id)
  };
};

export const generateQuestions = (level?: string) => {
  const words = loadWords();
  const levelPool = level ? words.filter((w) => w.level === level) : words;
  const pool = levelPool.length >= 4 ? levelPool : words;

  const questions: Question[] = [];
  for (let i = 0; i < 10; i++) {
    if (i < 8) {
      questions.push(buildSingleQuestion(pool, i));
    } else {
      questions.push(buildMultipleQuestion(pool, i));
    }
  }

  return questions;
};
