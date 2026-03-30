import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';

export const MainMenu: React.FC = () => {
  const { startGame, setGameState } = useGameStore();
  const [selectingLevel, setSelectingLevel] = useState(false);

  if (selectingLevel) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white px-4">
        <h1 className="text-3xl font-extrabold mb-8 text-blue-400 text-center">Select Level</h1>
        <p className="text-slate-400 mb-8 text-center text-sm">Start from CET-4 to build your foundation</p>
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button 
            onClick={() => startGame('CET-4')}
            className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl shadow-lg active:scale-95 transition-transform"
          >
            CET-4 (Foundation)
          </button>
          <button 
            onClick={() => startGame('CET-6')}
            className="w-full py-4 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-xl shadow-lg active:scale-95 transition-transform"
          >
            CET-6 (Intermediate)
          </button>
          <button 
            onClick={() => startGame('IELTS')}
            className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg active:scale-95 transition-transform"
          >
            IELTS (Advanced)
          </button>
          <button 
            onClick={() => setSelectingLevel(false)}
            className="w-full py-3 mt-4 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl shadow-lg active:scale-95 transition-transform"
          >
            BACK
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white px-4">
      <h1 className="text-5xl md:text-6xl font-extrabold mb-4 tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 text-center">
        English Beater
      </h1>
      <p className="text-lg md:text-xl mb-12 text-slate-300 text-center">Feel the rhythm of vocabulary!</p>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button 
          onClick={() => setSelectingLevel(true)}
          className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg active:scale-95 transition-transform text-lg"
        >
          START GAME
        </button>
        <button 
          onClick={() => setGameState('dictionary')}
          className="w-full py-4 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl shadow-lg active:scale-95 transition-transform text-lg"
        >
          DICTIONARY
        </button>
      </div>
    </div>
  );
};
