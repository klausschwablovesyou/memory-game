import { useGameStore } from "../../store/game-store";
import { gameService } from "../../services/game.service";
import { Logo } from "../Logo/Logo";
import { SettingsForm } from "../SettingsForm/SettingsForm";
import type { GameSettingsValues } from "../SettingsForm/game-settings-values";
import styles from "./GameStart.module.css";

export function GameStart() {
  const isLoading = useGameStore((state) => state.isLoading);
  const error = useGameStore((state) => state.error);

  const handleSubmit = (values: GameSettingsValues) => {
    gameService.startGame({
      username: values.username,
      cardCount: values.cardCount,
      countdownSeconds: values.countdownSeconds,
      flipBackDelayMs:
        values.flipBackDelayMs === "" ? undefined : values.flipBackDelayMs,
      maxBadGuesses:
        values.maxBadGuesses === "" ? undefined : values.maxBadGuesses,
    });
  };

  return (
    <div className={styles.wrapper}>
      <Logo />

      <div className={styles.container}>
        <SettingsForm
          initialValues={{
            username: "",
            cardCount: 16,
            countdownSeconds: 60,
            flipBackDelayMs: "",
            maxBadGuesses: "",
          }}
          onSubmit={handleSubmit}
          submitLabel="Start Game"
          isLoading={isLoading}
          error={error}
        />
      </div>
    </div>
  );
}
