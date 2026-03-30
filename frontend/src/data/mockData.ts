import { Word } from '../types';

export const mockWords: Word[] = [
  {
    id: "w1", word: "abandon", phonetic: "/əˈbændən/", pos: "v. / n.", translation: "放弃；抛弃；放纵",
    example: "They had to abandon their car in the snow.", level: "CET-4", theme: "Daily", sentiment: "negative"
  },
  {
    id: "w2", word: "ability", phonetic: "/əˈbɪləti/", pos: "n.", translation: "能力；才能",
    example: "She has the ability to solve complex problems.", level: "CET-4", theme: "Work", sentiment: "positive"
  },
  {
    id: "w3", word: "abnormal", phonetic: "/æbˈnɔːrml/", pos: "adj.", translation: "反常的；不正常的",
    example: "The weather has been abnormal this year.", level: "CET-4", theme: "Daily", sentiment: "negative"
  },
  {
    id: "w4", word: "absorb", phonetic: "/əbˈzɔːrb/", pos: "v.", translation: "吸收；吸引；同化",
    example: "Plants absorb sunlight through their leaves.", level: "CET-4", theme: "Science", sentiment: "neutral"
  },
  {
    id: "w5", word: "abundant", phonetic: "/əˈbʌndənt/", pos: "adj.", translation: "丰富的；充裕的",
    example: "The region has abundant natural resources.", level: "CET-4", theme: "Science", sentiment: "positive"
  },
  {
    id: "w6", word: "acknowledge", phonetic: "/əkˈnɒlɪdʒ/", pos: "v.", translation: "承认；致谢；告知收到",
    example: "The company finally acknowledged its mistake.", level: "CET-6", theme: "Work", sentiment: "neutral"
  },
  {
    id: "w7", word: "advocate", phonetic: "/ˈædvəkeɪt/", pos: "v. / n.", translation: "提倡；拥护；提倡者",
    example: "He advocates environmental protection.", level: "CET-6", theme: "Work", sentiment: "positive"
  },
  {
    id: "w8", word: "bleak", phonetic: "/bliːk/", pos: "adj.", translation: "荒凉的；凄凉的；黯淡的",
    example: "The economic outlook looks bleak.", level: "CET-6", theme: "Daily", sentiment: "negative"
  },
  {
    id: "w9", word: "catastrophe", phonetic: "/kəˈtæstrəfi/", pos: "n.", translation: "大灾难；大祸",
    example: "The earthquake was a major catastrophe.", level: "CET-6", theme: "News", sentiment: "negative"
  },
  {
    id: "w10", word: "crucial", phonetic: "/ˈkruːʃl/", pos: "adj.", translation: "至关重要的；决定性的",
    example: "It is crucial to adopt personalized teaching methods.", level: "IELTS", theme: "Academic", sentiment: "positive"
  },
  {
    id: "w11", word: "bargain", phonetic: "/ˈbɑːɡɪn/", pos: "n. / v.", translation: "便宜货；交易；讨价还价",
    example: "I got a great bargain at the sale.", level: "Daily", theme: "Shopping", sentiment: "positive"
  },
  {
    id: "w12", word: "budget", phonetic: "/ˈbʌdʒɪt/", pos: "n. / v. / adj.", translation: "预算；做预算",
    example: "We need to budget carefully for our vacation.", level: "Daily", theme: "Money", sentiment: "neutral"
  }
];

export const getWordsByCategory = (categoryType: string, categoryValue: string) => {
  return mockWords.filter(w => {
    if (categoryType === 'pos') return w.pos.includes(categoryValue);
    if (categoryType === 'sentiment') return w.sentiment === categoryValue;
    return true;
  });
};
