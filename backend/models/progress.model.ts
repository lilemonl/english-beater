export interface Progress {
  userId: string;
  starred: string[];
  favourites: string[];
  notes: Record<string, string>;
  updatedAt: string;
}
