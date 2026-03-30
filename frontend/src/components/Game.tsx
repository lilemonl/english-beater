import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { mockWords } from '../data/mockData';
import { Question, Word } from '../types';

// Simple sound generator using Web Audio API
const playDrumBeat = (volume: number, isError: boolean = false) => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    if (isError) {
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(100, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(10, audioCtx.currentTime + 0.3);
      gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.3);
    } else {
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(150, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.1);
    }
  } catch (e) {
    console.error("Audio API not supported");
  }
};

export const Game: React.FC = () => {
  const { currentRound, currentQuestionIndex, score, combo, volume, submitAnswer } = useGameStore();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedMultiple, setSelectedMultiple] = useState<string[]>([]);
  const [categoryName, setCategoryName] = useState('CET-4 Core Vocabulary');

  // Generate mock questions on mount or round change
  useEffect(() => {
    // In a real app, this would be an API call `GET /api/game/questions`
    const generated: Question[] = [];
    for (let i = 0; i < 10; i++) {
      const isMultiple = i >= 8;
      
      if (!isMultiple) {
        // Single choice: pick 1 correct, 3 wrong
        const correct = mockWords[Math.floor(Math.random() * mockWords.length)];
        const options = [correct];
        while(options.length < 4) {
          const wrong = mockWords[Math.floor(Math.random() * mockWords.length)];
          if (!options.find(o => o.id === wrong.id)) options.push(wrong);
        }
        // Shuffle
        options.sort(() => Math.random() - 0.5);

        generated.push({
          id: `q-${currentRound}-${i}`,
          type: 'single',
          word: correct,
          options,
          correctAnswer: correct.id,
          categoryContext: 'Choose the correct translation'
        });
      } else {
        // Multiple choice: find words with positive sentiment
        const options = [...mockWords].sort(() => Math.random() - 0.5).slice(0, 4);
        const correctIds = options.filter(o => o.sentiment === 'positive').map(o => o.id);
        
        generated.push({
          id: `q-${currentRound}-${i}`,
          type: 'multiple',
          options,
          correctAnswer: correctIds,
          categoryContext: 'Select all words with POSITIVE sentiment'
        });
      }
    }
    setQuestions(generated);
    setSelectedMultiple([]);
  }, [currentRound]);

  if (questions.length === 0) return <div className="text-center p-10">Loading...</div>;

  const currentQ = questions[currentQuestionIndex];
  const isMultiple = currentQ.type === 'multiple';

  const handleSingleClick = (optionId: string) => {
    const isCorrect = optionId === currentQ.correctAnswer;
    playDrumBeat(volume, !isCorrect);
    submitAnswer(isCorrect, currentQ.word);
  };

  const toggleMultiple = (optionId: string) => {
    setSelectedMultiple(prev => 
      prev.includes(optionId) ? prev.filter(id => id !== optionId) : [...prev, optionId]
    );
  };

  const submitMultiple = () => {
    const correctAnswers = currentQ.correctAnswer as string[];
    const isCorrect = 
      selectedMultiple.length === correctAnswers.length &&
      selectedMultiple.every(id => correctAnswers.includes(id));
    
    playDrumBeat(volume, !isCorrect);
    submitAnswer(isCorrect);
    setSelectedMultiple([]);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-slate-800 text-white p-4 shadow-md flex justify-between items-center sticky top-0">
        <div>
          <h1 className="font-bold text-xl text-blue-400">English Beater</h1>
          <p className="text-xs text-slate-400">Current Category: {categoryName}</p>
        </div>
        <div className="flex gap-6 text-sm font-semibold">
          <div className="flex flex-col items-center">
            <span className="text-slate-400">Round</span>
            <span className="text-xl">{currentRound} / 3</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-slate-400">Score</span>
            <span className="text-xl text-yellow-400">{score}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-slate-400">Combo</span>
            <span className={`text-xl ${combo > 2 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
              x{combo}
            </span>
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Progress Bar */}
          <div className="h-2 bg-slate-200 w-full">
            <div 
              className="h-full bg-blue-500 transition-all duration-300" 
              style={{ width: `${((currentQuestionIndex) / 10) * 100}%` }}
            ></div>
          </div>

          <div className="p-8 flex flex-col items-center min-h-[400px]">
            <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
              Question {currentQuestionIndex + 1} of 10 ({isMultiple ? 'Multiple Choice' : 'Single Choice'})
            </span>

            <h2 className="text-2xl font-bold text-slate-800 mb-2 text-center">
              {currentQ.categoryContext}
            </h2>

            {currentQ.word && (
              <div className="text-5xl font-black text-blue-600 my-8 text-center drop-shadow-sm">
                {currentQ.word.word}
                <div className="text-lg font-normal text-slate-400 mt-2">{currentQ.word.phonetic}</div>
              </div>
            )}

            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mt-auto">
              {currentQ.options.map((opt: Word) => {
                const isSelected = selectedMultiple.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    onClick={() => isMultiple ? toggleMultiple(opt.id) : handleSingleClick(opt.id)}
                    className={`
                      p-4 rounded-xl border-2 text-left transition-all duration-200 transform hover:-translate-y-1 hover:shadow-md
                      ${isMultiple && isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-slate-200 bg-white hover:border-blue-300'
                      }
                    `}
                  >
                    {!isMultiple ? (
                      <span className="font-medium text-slate-700">{opt.pos} {opt.translation}</span>
                    ) : (
                      <div className="flex flex-col">
                        <span className="font-bold text-lg">{opt.word}</span>
                        <span className="text-sm text-slate-500">{opt.translation}</span>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {isMultiple && (
              <button 
                onClick={submitMultiple}
                className="mt-8 px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-500 w-full"
              >
                SUBMIT ANSWER
              </button>
            )}
          </div>
        </div>

      </main>
    </div>
  );
};
