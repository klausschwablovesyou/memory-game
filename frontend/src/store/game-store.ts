import { create } from "zustand";
import type { GameStoreState } from "./game-store-state";

export const useGameStore = create<GameStoreState>()((set) => ({
  game: null,
  displayedSeconds: 0,
  isLoading: false,
  isFlipLocked: false,
  error: null,
  showSettings: false,
  setGame: (game) => set({ game }),
  setDisplayedSeconds: (displayedSeconds) => set({ displayedSeconds }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setIsFlipLocked: (isFlipLocked) => set({ isFlipLocked }),
  setError: (error) => set({ error }),
  setShowSettings: (showSettings) => set({ showSettings }),
}));
