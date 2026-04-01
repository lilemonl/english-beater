import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card, Tag, Button, Input, Progress, Space, Segmented, Typography, Tooltip } from 'antd';
import { StarOutlined, StarFilled, HeartOutlined, HeartFilled, EditOutlined, ArrowLeftOutlined, SoundOutlined } from '@ant-design/icons';
import { useGameStore } from '../store/gameStore';
import { api } from '../api/client';
import { Word } from '../types';

const { Text } = Typography;
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const ITEM_HEIGHT = 188;
const OVERSCAN = 6;

const WordCard = React.memo(function WordCard({
  word,
  isStarred,
  isFav,
  note,
  onPlay,
  onStar,
  onFav,
  onEditNote
}: {
  word: Word;
  isStarred: boolean;
  isFav: boolean;
  note: string;
  onPlay: (word: string) => void;
  onStar: (word: Word, isStarred: boolean) => void;
  onFav: (word: Word, isFav: boolean) => void;
  onEditNote: (word: Word, note: string) => void;
}) {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow mx-1 my-1" bodyStyle={{ padding: '14px' }}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-baseline gap-2 overflow-hidden">
          <span className="text-2xl font-bold text-slate-800 truncate">{word.word}</span>
          <span className="text-slate-500 text-sm truncate">{word.phonetic}</span>
        </div>
        <Space>
          <Tooltip title="Play pronunciation">
            <Button type="text" shape="circle" icon={<SoundOutlined style={{ color: '#1677ff', fontSize: '18px' }} />} onClick={() => onPlay(word.word)} />
          </Tooltip>
          <Tooltip title="Star this word">
            <Button
              type="text"
              shape="circle"
              icon={isStarred ? <StarFilled style={{ color: '#faad14', fontSize: '18px' }} /> : <StarOutlined style={{ fontSize: '18px' }} />}
              onClick={() => onStar(word, isStarred)}
            />
          </Tooltip>
          <Tooltip title="Favourite this word">
            <Button
              type="text"
              shape="circle"
              icon={isFav ? <HeartFilled style={{ color: '#ff4d4f', fontSize: '18px' }} /> : <HeartOutlined style={{ fontSize: '18px' }} />}
              onClick={() => onFav(word, isFav)}
            />
          </Tooltip>
        </Space>
      </div>

      <div className="mb-3">
        <Tag color="blue">{word.level}</Tag>
        <Text type="secondary" className="mr-2">{word.pos}</Text>
        <Text strong>{word.translation}</Text>
      </div>

      <div className="border-t border-slate-100 pt-2 mt-2">
        <Button type="dashed" size="small" icon={<EditOutlined />} onClick={() => onEditNote(word, note)}>
          {note ? 'Edit Note' : 'Add Note'}
        </Button>
        {note && <div className="bg-yellow-50 p-2 rounded text-sm text-slate-700 border border-yellow-100 mt-2 line-clamp-2">{note}</div>}
      </div>
    </Card>
  );
});

export const Dictionary: React.FC = () => {
  const { setGameState, userData, toggleStar, toggleFavourite, setNote, saveProgress } = useGameStore();
  const [filter, setFilter] = useState<string>('All');
  const [words, setWords] = useState<Word[]>([]);
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState<number>(0);
  const [viewportHeight, setViewportHeight] = useState<number>(640);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await api.getDictionary({ page: 1, pageSize: 2000, q: search.trim() || undefined });
        if (active) {
          setWords(res.list as Word[]);
          setError(null);
        }
      } catch (err) {
        if (active) {
          setError((err as Error).message || 'Failed to load dictionary');
        }
      } finally {
        if (active) setLoading(false);
      }
    }, 200);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [search]);

  const playWord = useCallback((word: string) => {
    if (!('speechSynthesis' in window)) return;
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, []);

  const filteredWords = useMemo(() => {
    if (filter === 'Starred ⭐') return words.filter(w => userData.starred.includes(w.id));
    if (filter === 'Favourited ❤️') return words.filter(w => userData.favourites.includes(w.id));
    if (filter === 'All') return words;
    return words.filter(w => w.level === filter);
  }, [filter, userData, words]);

  const sortedWords = useMemo(() => [...filteredWords].sort((a, b) => a.word.localeCompare(b.word)), [filteredWords]);

  const letterIndexMap = useMemo(() => {
    const map: Record<string, number> = {};
    sortedWords.forEach((word, idx) => {
      const letter = (word.word[0] || '#').toUpperCase();
      if (/^[A-Z]$/.test(letter) && map[letter] === undefined) map[letter] = idx;
    });
    return map;
  }, [sortedWords]);

  const handleStar = useCallback((word: Word, isStarred: boolean) => {
    const next = isStarred ? userData.starred.filter(x => x !== word.id) : [...userData.starred, word.id];
    toggleStar(word.id);
    saveProgress({ starred: next, favourites: userData.favourites, notes: userData.notes });
  }, [saveProgress, toggleStar, userData]);

  const handleFav = useCallback((word: Word, isFav: boolean) => {
    const next = isFav ? userData.favourites.filter(x => x !== word.id) : [...userData.favourites, word.id];
    toggleFavourite(word.id);
    saveProgress({ starred: userData.starred, favourites: next, notes: userData.notes });
  }, [saveProgress, toggleFavourite, userData]);

  const handleEditNote = useCallback((word: Word, current: string) => {
    const next = window.prompt(`Note for ${word.word}`, current);
    if (next === null) return;
    setNote(word.id, next);
    saveProgress({ notes: { ...userData.notes, [word.id]: next } });
  }, [saveProgress, setNote, userData.notes]);

  const scrollToLetter = useCallback((letter: string) => {
    const target = letterIndexMap[letter];
    if (target === undefined) return;
    listRef.current?.scrollTo({ top: target * ITEM_HEIGHT, behavior: 'smooth' });
  }, [letterIndexMap]);

  useEffect(() => {
    const updateViewport = () => {
      if (!listRef.current) return;
      setViewportHeight(listRef.current.clientHeight || 640);
    };
    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  const totalHeight = sortedWords.length * ITEM_HEIGHT;
  const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN);
  const visibleCount = Math.ceil(viewportHeight / ITEM_HEIGHT) + OVERSCAN * 2;
  const endIndex = Math.min(sortedWords.length, startIndex + visibleCount);
  const visibleWords = sortedWords.slice(startIndex, endIndex);

  const learnedCount = new Set([...userData.starred, ...userData.favourites]).size;
  const progressPercent = words.length === 0 ? 0 : Math.round((learnedCount / words.length) * 100);

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800">Dictionary & Progress</h2>
          <Button type="primary" icon={<ArrowLeftOutlined />} onClick={() => setGameState('menu')} size="large" className="w-full md:w-auto">
            Back to Menu
          </Button>
        </div>

        <Card className="mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold mb-1">Learning Progress</h3>
              <p className="text-slate-500 text-sm">Words you have starred or favourited</p>
            </div>
            <div className="w-full md:w-64">
              <Progress percent={progressPercent} status="active" strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }} />
            </div>
          </div>
        </Card>

        <div className="mb-6 overflow-x-auto pb-2 scrollbar-hide">
          <Segmented options={['All', 'CET-4', 'CET-6', 'IELTS', 'Starred ⭐', 'Favourited ❤️']} value={filter} onChange={(val) => setFilter(val as string)} size="large" />
        </div>

        <div className="mb-6">
          <Input allowClear size="large" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search words (supports fuzzy query)" />
        </div>

        <div className="relative">
          {loading && <div className="text-center py-12 text-slate-400">Loading dictionary...</div>}
          {error && <div className="text-center py-12 text-red-500">{error}</div>}

          {!loading && !error && sortedWords.length > 0 && (
            <div
              ref={listRef}
              className="h-[68vh] border rounded-xl bg-white overflow-auto"
              onScroll={(e) => setScrollTop((e.target as HTMLDivElement).scrollTop)}
            >
              <div style={{ height: totalHeight, position: 'relative' }}>
                {visibleWords.map((w, i) => {
                  const index = startIndex + i;
                  const top = index * ITEM_HEIGHT;
                  return (
                    <div key={w.id} style={{ position: 'absolute', top, left: 0, right: 0, height: ITEM_HEIGHT }}>
                      <WordCard
                        word={w}
                        isStarred={userData.starred.includes(w.id)}
                        isFav={userData.favourites.includes(w.id)}
                        note={userData.notes[w.id] || ''}
                        onPlay={playWord}
                        onStar={handleStar}
                        onFav={handleFav}
                        onEditNote={handleEditNote}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!loading && !error && sortedWords.length === 0 && <div className="text-center py-12 text-slate-400">No words found in this category.</div>}

          <div className="hidden md:flex flex-col items-center gap-1 absolute right-[-28px] top-2">
            {LETTERS.map((letter) => {
              const enabled = letterIndexMap[letter] !== undefined;
              return (
                <button
                  key={letter}
                  type="button"
                  onClick={() => scrollToLetter(letter)}
                  disabled={!enabled}
                  className={`text-[10px] leading-none px-1 rounded ${enabled ? 'text-blue-600 hover:bg-blue-50' : 'text-slate-300 cursor-not-allowed'}`}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
