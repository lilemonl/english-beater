import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

const sourcePath = path.join(__dirname, '..', '..', '..', '综合英语词汇学习手册-20a7916a3f.md');
const outputPath = path.join(__dirname, '..', 'data', 'words.json');

const levelMap: Record<string, string> = {
  'CET-4词汇': 'CET-4',
  'CET-6词汇': 'CET-6',
  '雅思词汇': 'IELTS',
  '日常英语词汇': 'Daily'
};

const parseWords = (content: string) => {
  const lines = content.split(/\r?\n/);
  const words: any[] = [];
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

const run = () => {
  const content = readFileSync(sourcePath, 'utf-8');
  const words = parseWords(content);
  writeFileSync(outputPath, JSON.stringify(words, null, 2), 'utf-8');
  console.log(`[import] exported ${words.length} words to ${outputPath}`);
};

run();
