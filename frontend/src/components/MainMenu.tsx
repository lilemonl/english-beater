import React from 'react';
import { useGameStore } from '../store/gameStore';

export const MainMenu: React.FC = () => {
  const { startGame, setGameState } = useGameStore();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white">
      <h1 className="text-6xl font-extrabold mb-4 tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
        English Beater
      </h1>
      <p className="text-xl mb-12 text-slate-300">Feel the rhythm of vocabulary!</p>

      <div className="flex flex-col gap-4 w-64">
        <button 
          onClick={startGame}
          className="px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-transform transform hover:scale-105"
        >
          START GAME
        </button>
        <button 
          onClick={() => setGameState('dictionary')}
          className="px-6 py-4 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl shadow-lg transition-transform transform hover:scale-105"
        >
          DICTIONARY
        </button>
      </div>
    </div>
  );
};
