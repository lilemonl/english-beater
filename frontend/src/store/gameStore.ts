import { create } from 'zustand';
import { GameState, GameResultData, Word } from '../types';

interface StoreState {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  
  // Game session states
  currentRound: number;
  currentQuestionIndex: number;
  score: number;
  combo: number;
  maxCombo: number;
  mistakes: Word[];
  volume: number; // 0.0 to 1.0

  startGame: () => void;
  submitAnswer: (isCorrect: boolean, word?: Word) => void;
  endGame: () => void;
  resetGame: () => void;
}

const BASE_VOLUME = 0.4;
const MAX_VOLUME = 1.0;
const VOLUME_STEP = 0.1;

export const useGameStore = create<StoreState>((set) => ({
  gameState: 'menu',
  setGameState: (state) => set({ gameState: state }),

  currentRound: 1,
  currentQuestionIndex: 0,
  score: 0,
  combo: 0,
  maxCombo: 0,
  mistakes: [],
  volume: BASE_VOLUME,

  startGame: () => set({
    gameState: 'playing',
    currentRound: 1,
    currentQuestionIndex: 0,
    score: 0,
    combo: 0,
    maxCombo: 0,
    mistakes: [],
    volume: BASE_VOLUME,
  }),

  submitAnswer: (isCorrect, word) => set((state) => {
    let newCombo = state.combo;
    let newMaxCombo = state.maxCombo;
    let newScore = state.score;
    let newVolume = state.volume;
    let newMistakes = [...state.mistakes];

    if (isCorrect) {
      newCombo += 1;
      if (newCombo > newMaxCombo) newMaxCombo = newCombo;
      newScore += 10 + newCombo * 2; // bonus points for combo
      newVolume = Math.min(MAX_VOLUME, newVolume + VOLUME_STEP);
    } else {
      newCombo = 0;
      newVolume = Math.max(BASE_VOLUME - 0.2, 0.2); // drop volume
      if (word && !newMistakes.find(w => w.id === word.id)) {
        newMistakes.push(word);
      }
    }

    let nextIndex = state.currentQuestionIndex + 1;
    let nextRound = state.currentRound;
    
    if (nextIndex >= 10) {
      nextIndex = 0;
      nextRound += 1;
    }

    if (nextRound > 3) {
      return {
        combo: newCombo,
        maxCombo: newMaxCombo,
        score: newScore,
        volume: newVolume,
        mistakes: newMistakes,
        gameState: 'result'
      };
    }

    return {
      combo: newCombo,
      maxCombo: newMaxCombo,
      score: newScore,
      volume: newVolume,
      mistakes: newMistakes,
      currentQuestionIndex: nextIndex,
      currentRound: nextRound,
    };
  }),

  endGame: () => set({ gameState: 'result' }),
  resetGame: () => set({ gameState: 'menu' })
}));
