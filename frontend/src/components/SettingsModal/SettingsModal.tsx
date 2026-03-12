import { useGameStore } from "../../store/game-store";
import { gameService } from "../../services/game.service";
import { SettingsForm } from "../SettingsForm/SettingsForm";
import type { GameSettingsValues } from "../SettingsForm/game-settings-values";
import styles from "./SettingsModal.module.css";

export function SettingsModal() {
  const showSettings = useGameStore((state) => state.showSettings);
  const game = useGameStore((state) => state.game);
  const setShowSettings = useGameStore((state) => state.setShowSettings);

  if (!showSettings) return null;

  const handleSave = (values: GameSettingsValues) => {
    setShowSettings(false);
    gameService.startGameWithSettings({
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
    <div className={styles.overlay} onClick={() => setShowSettings(false)}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerRow}>
            <span className={styles.title}>Game settings</span>
            <button
              className={styles.closeButton}
              onClick={() => setShowSettings(false)}
              aria-label="Close"
            >
              &#10005;
            </button>
          </div>
        </div>

        <div className={styles.body}>
          <SettingsForm
            initialValues={{
              username: game?.settings.username ?? "Player",
              cardCount: game?.settings.cardCount ?? 16,
              countdownSeconds: game?.settings.countdownSeconds ?? 60,
              flipBackDelayMs: game?.settings.flipBackDelayMs ?? "",
              maxBadGuesses: game?.settings.maxBadGuesses ?? "",
            }}
            onSubmit={handleSave}
            submitLabel="Save settings"
          />
        </div>
      </div>
    </div>
  );
}
