import type { Game } from "@shared/game/models/game.model";

export type GameStoreState = {
  game: Game | null;
  displayedSeconds: number;
  isLoading: boolean;
  isFlipLocked: boolean;
  error: string | null;
  showSettings: boolean;
  setGame: (game: Game | null) => void;
  setDisplayedSeconds: (seconds: number) => void;
  setIsLoading: (loading: boolean) => void;
  setIsFlipLocked: (locked: boolean) => void;
  setError: (error: string | null) => void;
  setShowSettings: (show: boolean) => void;
};
