import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { Question, Word } from '../types';
import { api } from '../api/client';

// Simple sound generator using Web Audio API
const playDrumBeat = (volume: number, isError: boolean = false) => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    if (isError) {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(10, audioCtx.currentTime + 0.6);
      
      gain.gain.setValueAtTime(volume * 0.5, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
    } else {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, audioCtx.currentTime);
      // Slower decay for a more resonant, longer drum sound (0.8s)
      osc.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.8);
      
      gain.gain.setValueAtTime(volume, audioCtx.currentTime);
      gain.gain.setTargetAtTime(volume * 0.5, audioCtx.currentTime + 0.1, 0.2); // Sustain the sound slightly
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);

      const clickOsc = audioCtx.createOscillator();
      const clickGain = audioCtx.createGain();
      clickOsc.connect(clickGain);
      clickGain.connect(audioCtx.destination);
      
      clickOsc.type = 'square';
      clickOsc.frequency.setValueAtTime(800, audioCtx.currentTime);
      clickGain.gain.setValueAtTime(volume * 0.2, audioCtx.currentTime);
      clickGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
      
      clickOsc.start();
      clickOsc.stop(audioCtx.currentTime + 0.1);
    }
  } catch (e) {
    console.error("Audio API not supported");
  }
};

export const Game: React.FC = () => {
  const { currentRound, currentQuestionIndex, score, combo, volume, selectedLevel, submitAnswer, resetGame } = useGameStore();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedMultiple, setSelectedMultiple] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const loadQuestions = async () => {
      try {
        setLoading(true);
        const res = await api.getQuestions({ level: selectedLevel, round: currentRound });
        if (active) {
          setQuestions(res.questions as Question[]);
          setSelectedMultiple([]);
          setError(null);
        }
      } catch (err) {
        if (active) {
          setError((err as Error).message || 'Failed to load questions');
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    loadQuestions();
    return () => {
      active = false;
    };
  }, [currentRound, selectedLevel]);

  if (loading) return <div className="text-center p-10">Loading...</div>;
  if (error) return <div className="text-center p-10 text-red-500">{error}</div>;
  if (questions.length === 0) return <div className="text-center p-10">No questions found.</div>;

  const currentQ = questions[currentQuestionIndex];
  const isMultiple = currentQ.type === 'multiple';

  const handleSingleClick = (optionId: string) => {
    const isCorrect = currentQ.correctAnswerIds.includes(optionId);
    playDrumBeat(volume, !isCorrect);
    submitAnswer(isCorrect, currentQ.word as Word);
  };

  const toggleMultiple = (optionId: string) => {
    setSelectedMultiple(prev => 
      prev.includes(optionId) ? prev.filter(id => id !== optionId) : [...prev, optionId]
    );
  };

  const submitMultiple = () => {
    const correctAnswers = currentQ.correctAnswerIds;
    const isCorrect = 
      selectedMultiple.length === correctAnswers.length &&
      selectedMultiple.every(id => correctAnswers.includes(id));
    
    playDrumBeat(volume, !isCorrect);
    submitAnswer(isCorrect);
    setSelectedMultiple([]);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 fade-in">
      <header className="bg-slate-800 text-white p-3 md:p-4 shadow-md relative sticky top-0">
        <div className="flex justify-between items-center pb-1">
          <div className="flex items-center gap-2 md:gap-4">
            <button onClick={() => { if(window.confirm('Are you sure you want to quit? Your current game progress will be lost.')) resetGame(); }} className="text-slate-400 hover:text-white transition-colors flex items-center justify-center bg-slate-700 p-1.5 md:p-2 rounded-lg" title="Quit Game">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </button>
            <div>
              <h1 className="font-bold text-base md:text-xl text-blue-400 leading-none">English Beater 🥁</h1>
              <p className="text-[10px] md:text-xs text-slate-400 mt-1">Level: <span className="font-bold text-green-400">{selectedLevel}</span></p>
            </div>
          </div>
          <div className="flex gap-3 md:gap-6 text-xs md:text-sm font-semibold">
            <div className="text-center"><span className="block text-slate-400 text-[10px] md:text-xs">Round</span>{currentRound}/3</div>
            <div className="text-center"><span className="block text-slate-400 text-[10px] md:text-xs">Score</span><span className="text-yellow-400 font-bold">{score}</span></div>
            <div className="text-center"><span className="block text-slate-400 text-[10px] md:text-xs">Combo</span>
              <span className={combo > 2 ? "text-red-400 animate-pulse inline-block font-bold" : "text-white font-bold"}>x{combo}</span>
            </div>
          </div>
        </div>
        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 h-1 bg-slate-700 w-full">
          <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${(currentQuestionIndex / 10) * 100}%` }}></div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="flex-1 flex flex-col items-center justify-start p-3 md:p-4 md:justify-center overflow-y-auto">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden mb-4">
          <div className="p-4 md:p-8 flex flex-col items-center min-h-[350px] md:min-h-[400px]">
            <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] md:text-xs font-bold uppercase mb-4 md:mb-6">
              第 {currentQuestionIndex + 1} 题（{isMultiple ? '多选' : '单选'}）
            </span>

            <h2 className="text-lg md:text-2xl font-bold text-slate-800 mb-2 text-center">
              {currentQ.prompt}
            </h2>

            {currentQ.word && (
              <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 md:p-5 my-4 md:my-6">
                <div className="text-xs text-slate-500 mb-1">中文释义</div>
                <div className="text-lg md:text-xl font-bold text-slate-800">{currentQ.word.translation || '-'}</div>
                <div className="text-xs text-slate-500 mt-3 mb-1">英文释义/语境</div>
                <div className="text-sm md:text-base text-slate-700 italic">
                  {currentQ.word.example || `The target word is pronounced as ${currentQ.word.phonetic || 'N/A'}.`}
                </div>
              </div>
            )}

            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mt-auto">
              {currentQ.options.map((opt: Word) => {
                const isSelected = selectedMultiple.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    onClick={() => isMultiple ? toggleMultiple(opt.id) : handleSingleClick(opt.id)}
                    className={`
                      p-3 md:p-4 rounded-xl border-2 text-left transition-all active:scale-95
                      ${isMultiple && isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-slate-200 bg-white hover:border-blue-300'
                      }
                    `}
                  >
                    {!isMultiple ? (
                      <span className="text-base md:text-lg font-bold text-slate-700">
                        {opt.word}
                      </span>
                    ) : (
                      <div className="flex flex-col">
                        <span className="font-bold text-base md:text-lg">{opt.word}</span>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {isMultiple && (
              <button 
                onClick={submitMultiple}
                className="mt-6 md:mt-8 px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-500 w-full active:scale-95 transition-colors"
              >
                提交答案
              </button>
            )}
          </div>
        </div>

      </main>
    </div>
  );
};
