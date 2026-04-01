import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { Word } from '../models/word.model';

let cachedWords: Word[] | null = null;

const wordsFilePath = path.join(__dirname, '..', 'data', 'words.json');
const markdownCandidates = [
  path.join(__dirname, '..', '..', '..', '综合英语词汇学习手册-20a7916a3f.md'),
  path.join(__dirname, '..', 'data', '综合英语词汇学习手册-20a7916a3f.md')
];

const levelMap: Record<string, string> = {
  'CET-4词汇': 'CET-4',
  'CET-6词汇': 'CET-6',
  '雅思词汇': 'IELTS',
  '日常英语词汇': 'Daily'
};

const parseWordsFromMarkdown = (content: string): Word[] => {
  const lines = content.split(/\r?\n/);
  const words: Word[] = [];
  let currentLevel = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('## ')) {
      const title = line.replace('## ', '').trim();
      currentLevel = levelMap[title] || currentLevel;
      continue;
    }

    if (line.startsWith('#### ')) {
      const match = line.match(/^####\s+([A-Za-z-']+)\s+\/([^/]+)\/\s*(⭐+)?/);
      if (!match) continue;

      const word = match[1];
      const phonetic = `/${match[2]}/`;
      let pos = '';
      let translation = '';
      let example = '';

      for (let j = i + 1; j < i + 6 && j < lines.length; j++) {
        const next = lines[j].trim();
        if (next.startsWith('**词性**')) {
          pos = next.replace('**词性**：', '').trim();
        } else if (next.startsWith('**中文释义**')) {
          translation = next.replace('**中文释义**：', '').trim();
        } else if (next.startsWith('**例句**')) {
          example = next.replace('**例句**：', '').trim();
        } else if (next === '') {
          break;
        }
      }

      words.push({
        id: `w${words.length + 1}`,
        word,
        phonetic,
        pos,
        translation,
        example,
        level: currentLevel || 'Unknown',
        sentiment: 'neutral',
        theme: 'General'
      });
    }
  }

  return words;
};

const loadFromMarkdown = (): Word[] => {
  for (const candidate of markdownCandidates) {
    try {
      const raw = readFileSync(candidate, 'utf-8');
      const parsed = parseWordsFromMarkdown(raw);
      if (parsed.length > 0) {
        writeFileSync(wordsFilePath, JSON.stringify(parsed, null, 2), 'utf-8');
        return parsed;
      }
    } catch (err) {
      // try next candidate
    }
  }
  return [];
};

export const loadWords = (): Word[] => {
  if (cachedWords) return cachedWords;

  try {
    const raw = readFileSync(wordsFilePath, 'utf-8');
    cachedWords = JSON.parse(raw) as Word[];
  } catch (err) {
    console.error('[dictionary] failed to load words.json', err);
    cachedWords = [];
  }

  if (!cachedWords || cachedWords.length < 50) {
    const parsed = loadFromMarkdown();
    if (parsed.length > 0) {
      cachedWords = parsed;
    }
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

const normalize = (text: string) => text.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]/g, '');

const isSubsequence = (needle: string, haystack: string) => {
  let i = 0;
  let j = 0;
  while (i < needle.length && j < haystack.length) {
    if (needle[i] === haystack[j]) i += 1;
    j += 1;
  }
  return i === needle.length;
};

const fuzzyMatch = (query: string, target: string) => {
  const q = normalize(query);
  const t = normalize(target);
  if (!q) return true;
  if (!t) return false;
  if (t.includes(q)) return true;
  return q.length >= 2 && isSubsequence(q, t);
};

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
    if (q && !fuzzyMatch(q, `${w.word} ${w.translation} ${w.example || ''}`)) return false;
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
