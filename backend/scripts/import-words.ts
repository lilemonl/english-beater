import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

const sourcePath = path.join(
  __dirname,
  '..',
  '..',
  'docs',
  '综合英语词汇完整手册_26221词全标注-ec69ea25ce.md'
);
const outputPath = path.join(__dirname, '..', 'data', 'words.json');

const levelMap: Record<string, string> = {
  'CET-4词汇': 'CET-4',
  'CET-6词汇': 'CET-6',
  '雅思词汇': 'IELTS',
  '日常英语词汇': 'Daily',
  TOEFL: 'TOEFL'
};

const parseWords = (content: string) => {
  const lines = content.split(/\r?\n/);
  const words: any[] = [];
  let currentLevel = '';
  const seen = new Set<string>();

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

      // read next few lines for details
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

      const key = `${word.toLowerCase()}|${translation}`;
      if (seen.has(key)) continue;
      seen.add(key);

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

    // New dictionary format:
    // ### word
    // - **级别**：CET-4、TOEFL
    // - **释义**：...
    // - **生活化例句**：...
    if (line.startsWith('### ') && !line.startsWith('#### ')) {
      const word = line.replace(/^###\s+/, '').trim();
      if (!word || word.includes('词汇')) continue;

      let rawLevel = '';
      let translation = '';
      let example = '';
      let pos = '';

      for (let j = i + 1; j < i + 8 && j < lines.length; j++) {
        const next = lines[j].trim();
        if (next.startsWith('- **级别**：')) {
          rawLevel = next.replace('- **级别**：', '').trim();
        } else if (next.startsWith('- **释义**：')) {
          translation = next.replace('- **释义**：', '').trim();
          const posMatch = translation.match(/^([a-z]+\.)/i);
          if (posMatch) pos = posMatch[1];
        } else if (next.startsWith('- **生活化例句**：')) {
          example = next.replace('- **生活化例句**：', '').trim();
        } else if (next.startsWith('---')) {
          break;
        }
      }

      if (!translation) continue;

      const levels = rawLevel
        .split(/[、,，]/)
        .map((x) => levelMap[x.trim()] || x.trim())
        .filter(Boolean);
      const level = levels.length ? levels[0] : currentLevel || 'Unknown';

      const key = `${word.toLowerCase()}|${translation}`;
      if (seen.has(key)) continue;
      seen.add(key);

      words.push({
        id: `w${words.length + 1}`,
        word,
        phonetic: '',
        pos,
        translation,
        example,
        level,
        sentiment: 'neutral',
        theme: 'General'
      });
    }
  }

  return words;
};

const run = () => {
  const content = readFileSync(sourcePath, 'utf-8');
  const words = parseWords(content);
  writeFileSync(outputPath, JSON.stringify(words, null, 2), 'utf-8');
  console.log(`[import] exported ${words.length} words to ${outputPath}`);
};

run();
