import { readFileSync } from 'fs';
import path from 'path';
import { Word } from '../models/word.model';

let cachedWords: Word[] | null = null;

const wordsFilePath = path.join(__dirname, '..', 'data', 'words.json');

export const loadWords = (): Word[] => {
  if (cachedWords) return cachedWords;

  try {
    const raw = readFileSync(wordsFilePath, 'utf-8');
    cachedWords = JSON.parse(raw) as Word[];
  } catch (err) {
    console.error('[dictionary] failed to load words.json', err);
    cachedWords = [];
  }

  return cachedWords;
};

interface QueryOptions {
  level?: string;
  pos?: string;
  sentiment?: string;
  theme?: string;
  q?: string;
  page?: number;
  pageSize?: number;
}

export const queryWords = (options: QueryOptions) => {
  const words = loadWords();
  const {
    level,
    pos,
    sentiment,
    theme,
    q,
    page = 1,
    pageSize = 20
  } = options;

  const filtered = words.filter((w) => {
    if (level && w.level !== level) return false;
    if (pos && !w.pos.includes(pos)) return false;
    if (sentiment && w.sentiment !== sentiment) return false;
    if (theme && w.theme !== theme) return false;
    if (q && !(`${w.word} ${w.translation}`.toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  });

  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const list = filtered.slice(start, end);

  return {
    list,
    total: filtered.length,
    page,
    pageSize
  };
};
