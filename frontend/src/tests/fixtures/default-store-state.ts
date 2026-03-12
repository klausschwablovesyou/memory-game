import type { GameStoreState } from "../../store/game-store-state";

export const defaultStoreState: Partial<GameStoreState> = {
  game: null,
  displayedSeconds: 0,
  isLoading: false,
  isFlipLocked: false,
  error: null,
  showSettings: false,
};
