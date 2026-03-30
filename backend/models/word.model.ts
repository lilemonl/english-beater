export interface Word {
  id: string;
  word: string;
  phonetic: string;
  pos: string;
  translation: string;
  example?: string;
  level: string;
  sentiment?: string;
  theme?: string;
}
