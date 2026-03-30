import React from 'react';
import { useGameStore } from '../store/gameStore';

export const GameResult: React.FC = () => {
  const { score, maxCombo, mistakes, setGameState } = useGameStore();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4 md:p-8">
      <h2 className="text-3xl md:text-4xl font-bold mb-6 md:mb-8 text-yellow-400">Game Over</h2>
      
      <div className="bg-slate-800 p-6 md:p-8 rounded-2xl w-full max-w-md shadow-2xl mb-6 md:mb-8 flex flex-col gap-4 text-center">
        <div>
          <p className="text-slate-400 text-xs md:text-sm uppercase tracking-widest">Final Score</p>
          <p className="text-4xl md:text-5xl font-black text-blue-400">{score}</p>
        </div>
        <div>
          <p className="text-slate-400 text-xs md:text-sm uppercase tracking-widest">Max Combo</p>
          <p className="text-2xl md:text-3xl font-bold text-purple-400">{maxCombo}</p>
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
                <span className="text-slate-300 text-sm">{w.translation}</span>
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
