import React, { useEffect, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';

type Grade = 'A' | 'B' | 'C' | 'D' | 'E';

const getGradeByScore = (score: number): Grade => {
  if (score >= 420) return 'A';
  if (score >= 320) return 'B';
  if (score >= 230) return 'C';
  if (score >= 150) return 'D';
  return 'E';
};

const gradeStyle: Record<Grade, { panel: string; title: string; desc: string; tone: number[] }> = {
  A: {
    panel: 'from-amber-400 via-yellow-300 to-orange-300',
    title: 'text-amber-900',
    desc: 'Outstanding rhythm and accuracy.',
    tone: [523, 659, 784]
  },
  B: {
    panel: 'from-emerald-400 via-teal-300 to-lime-300',
    title: 'text-emerald-900',
    desc: 'Great control, keep the streak going.',
    tone: [440, 554, 659]
  },
  C: {
    panel: 'from-sky-400 via-cyan-300 to-blue-300',
    title: 'text-blue-900',
    desc: 'Solid performance with room to improve.',
    tone: [392, 494, 587]
  },
  D: {
    panel: 'from-indigo-400 via-violet-300 to-purple-300',
    title: 'text-indigo-900',
    desc: 'You are building momentum, keep practicing.',
    tone: [330, 392, 440]
  },
  E: {
    panel: 'from-rose-400 via-pink-300 to-fuchsia-300',
    title: 'text-rose-900',
    desc: 'Good start. Next round will be better.',
    tone: [262, 294, 330]
  }
};

const playSettlementTone = (freqs: number[]) => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    freqs.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      const startAt = audioCtx.currentTime + idx * 0.15;
      gain.gain.setValueAtTime(0.001, startAt);
      gain.gain.exponentialRampToValueAtTime(0.2, startAt + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, startAt + 0.22);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(startAt);
      osc.stop(startAt + 0.24);
    });
  } catch (e) {
    console.error('Settlement audio unavailable');
  }
};

export const GameResult: React.FC = () => {
  const { score, maxCombo, mistakes, setGameState } = useGameStore();
  const grade = useMemo(() => getGradeByScore(score), [score]);
  const style = gradeStyle[grade];

  useEffect(() => {
    playSettlementTone(style.tone);
  }, [style]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4 md:p-8">
      <h2 className="text-3xl md:text-4xl font-bold mb-6 md:mb-8 text-yellow-400">Game Over</h2>

      <div className={`bg-gradient-to-br ${style.panel} p-6 md:p-8 rounded-2xl w-full max-w-md shadow-2xl mb-6 md:mb-8 flex flex-col gap-4 text-center`}>
        <div>
          <p className="text-xs md:text-sm uppercase tracking-widest text-slate-700">Grade</p>
          <p className={`text-6xl md:text-7xl font-black ${style.title}`}>{grade}</p>
          <p className="text-sm text-slate-700 mt-1">{style.desc}</p>
        </div>
        <div>
          <p className="text-slate-700 text-xs md:text-sm uppercase tracking-widest">Final Score</p>
          <p className="text-4xl md:text-5xl font-black text-slate-900">{score}</p>
        </div>
        <div>
          <p className="text-slate-700 text-xs md:text-sm uppercase tracking-widest">Max Combo</p>
          <p className="text-2xl md:text-3xl font-bold text-slate-900">{maxCombo}</p>
        </div>
      </div>

      {mistakes.length > 0 && (
        <div className="w-full max-w-md bg-slate-800 p-4 md:p-6 rounded-2xl mb-6 md:mb-8">
          <h3 className="text-lg md:text-xl font-bold mb-4 text-red-400 border-b border-slate-700 pb-2">Needs Review ({mistakes.length})</h3>
          <div className="max-h-48 overflow-y-auto pr-2 flex flex-col gap-3">
            {mistakes.map((w, i) => (
              <div key={i} className="flex flex-col bg-slate-700 p-3 rounded-lg">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="font-bold text-base md:text-lg text-white">{w.word}</span>
                  <span className="text-slate-400 text-xs md:text-sm">{w.pos}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button 
        onClick={() => setGameState('menu')}
        className="w-full max-w-xs px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg active:scale-95 transition-transform"
      >
        BACK TO MENU
      </button>
    </div>
  );
};
