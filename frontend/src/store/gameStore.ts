import { create } from 'zustand';
import { GameState, Word } from '../types';
import { api } from '../api/client';

interface StoreState {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  authReady: boolean;
  token: string | null;
  openid: string | null;
  
  // Game session states
  currentRound: number;
  currentQuestionIndex: number;
  score: number;
  combo: number;
  maxCombo: number;
  mistakes: Word[];
  volume: number; // 0.0 to 1.0
  selectedLevel: string;
  
  // User Data
  userData: {
    starred: string[];
    favourites: string[];
    notes: Record<string, string>;
  };

  initAuth: () => Promise<void>;
  loadProgress: () => Promise<void>;
  saveProgress: (payload?: {
    starred?: string[];
    favourites?: string[];
    notes?: Record<string, string>;
  }) => Promise<void>;

  startGame: (level: string) => void;
  submitAnswer: (isCorrect: boolean, word?: Word) => void;
  endGame: () => void;
  resetGame: () => void;
  
  // User Data Actions
  toggleStar: (wordId: string) => void;
  toggleFavourite: (wordId: string) => void;
  setNote: (wordId: string, note: string) => void;
}

const BASE_VOLUME = 0.4;
const MAX_VOLUME = 1.0;
const VOLUME_STEP = 0.1;

export const useGameStore = create<StoreState>((set, get) => ({
  gameState: 'login',
  setGameState: (state) => set({ gameState: state }),
  authReady: false,
  token: null,
  openid: null,

  currentRound: 1,
  currentQuestionIndex: 0,
  score: 0,
  combo: 0,
  maxCombo: 0,
  mistakes: [],
  volume: BASE_VOLUME,
  selectedLevel: 'CET-4',
  userData: {
    starred: [],
    favourites: [],
    notes: {}
  },

  initAuth: async () => {
    try {
      const { openid, token } = await api.login('mock');
      set({ openid, token, authReady: true });
      await get().loadProgress();
    } catch (err) {
      console.error('[auth] init failed', err);
      set({ authReady: true });
    }
  },

  loadProgress: async () => {
    const token = get().token;
    if (!token) return;
    try {
      const progress = await api.getProgress(token);
      set({
        userData: {
          starred: progress.starred || [],
          favourites: progress.favourites || [],
          notes: progress.notes || {}
        }
      });
    } catch (err) {
      console.error('[progress] load failed', err);
    }
  },

  saveProgress: async (payload) => {
    const token = get().token;
    if (!token) return;
    const current = get().userData;
    const data = {
      starred: payload?.starred ?? current.starred,
      favourites: payload?.favourites ?? current.favourites,
      notes: payload?.notes ?? current.notes
    };
    try {
      const saved = await api.saveProgress(token, data);
      set({
        userData: {
          starred: saved.starred || [],
          favourites: saved.favourites || [],
          notes: saved.notes || {}
        }
      });
    } catch (err) {
      console.error('[progress] save failed', err);
    }
  },

  toggleStar: (id) => {
    const current = get().userData;
    const next = current.starred.includes(id)
      ? current.starred.filter(x => x !== id)
      : [...current.starred, id];
    set({
      userData: {
        ...current,
        starred: next
      }
    });
  },

  toggleFavourite: (id) => {
    const current = get().userData;
    const next = current.favourites.includes(id)
      ? current.favourites.filter(x => x !== id)
      : [...current.favourites, id];
    set({
      userData: {
        ...current,
        favourites: next
      }
    });
  },

  setNote: (id, text) => {
    const current = get().userData;
    set({
      userData: {
        ...current,
        notes: {
          ...current.notes,
          [id]: text
        }
      }
    });
  },

  startGame: (level) => set({
    gameState: 'playing',
    selectedLevel: level,
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
