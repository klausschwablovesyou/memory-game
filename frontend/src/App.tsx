import { useGameStore } from "./store/game-store";
import { GameStart } from "./components/GameStart/GameStart";
import { GameHeader } from "./components/GameHeader/GameHeader";
import { GameBoard } from "./components/GameBoard/GameBoard";
import { GameOver } from "./components/GameOver/GameOver";
import { SettingsModal } from "./components/SettingsModal/SettingsModal";
import styles from "./App.module.css";

export function App() {
  const game = useGameStore((state) => state.game);

  if (!game) {
    return (
      <div className={styles.container}>
        <GameStart />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <GameHeader />
      <GameBoard />
      <GameOver />
      <SettingsModal />
    </div>
  );
}
