import { Progress } from '../models/progress.model';

const store = new Map<string, Progress>();

const defaultProgress = (userId: string): Progress => ({
  userId,
  starred: [],
  favourites: [],
  notes: {},
  updatedAt: new Date().toISOString()
});

export const getProgress = (userId: string) => {
  return store.get(userId) ?? defaultProgress(userId);
};

export const saveProgress = (userId: string, payload: Partial<Progress>) => {
  const current = getProgress(userId);

  const merged: Progress = {
    ...current,
    starred: payload.starred ? Array.from(new Set(payload.starred)) : current.starred,
    favourites: payload.favourites ? Array.from(new Set(payload.favourites)) : current.favourites,
    notes: payload.notes ? { ...current.notes, ...payload.notes } : current.notes,
    updatedAt: new Date().toISOString()
  };

  store.set(userId, merged);
  return merged;
};
