import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { mockWords } from '../data/mockData';

export const Dictionary: React.FC = () => {
  const { setGameState } = useGameStore();
  const [filter, setFilter] = useState('All');

  const categories = ['All', 'CET-4', 'CET-6', 'IELTS', 'Daily'];
  
  const filteredWords = filter === 'All' 
    ? mockWords 
    : mockWords.filter(w => w.level === filter);

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800">Dictionary</h2>
          <button 
            onClick={() => setGameState('menu')}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
          >
            Back to Menu
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-4 py-2 rounded-full font-medium ${
                filter === c ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredWords.map(w => (
            <div key={w.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <div className="flex items-end gap-2 mb-2">
                <span className="text-2xl font-bold text-slate-800">{w.word}</span>
                <span className="text-slate-500 text-sm">{w.phonetic}</span>
                <span className="ml-auto text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-md">
                  {w.level}
                </span>
              </div>
              <p className="font-semibold text-slate-700 mb-1">
                <span className="text-blue-500 mr-2">{w.pos}</span>
                {w.translation}
              </p>
              <p className="text-slate-500 text-sm italic">"{w.example}"</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
