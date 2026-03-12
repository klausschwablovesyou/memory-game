import { useState } from "react";
import type { GameSettingsValues } from "./game-settings-values";
import type { SettingsFormProps } from "./settings-form-props";
import styles from "./SettingsForm.module.css";

export function SettingsForm({
  initialValues,
  onSubmit,
  submitLabel,
  isLoading,
  error,
}: SettingsFormProps) {
  const [values, setValues] = useState<GameSettingsValues>(initialValues);

  const update = (patch: Partial<GameSettingsValues>) =>
    setValues((prev: GameSettingsValues) => ({ ...prev, ...patch }));

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(values);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <span className={styles.fieldLabel}>Username</span>
        <input
          id="username"
          className={styles.fieldInputWide}
          type="text"
          value={values.username}
          onChange={(e) => update({ username: e.target.value })}
          required
        />
      </div>

      <div className={styles.field}>
        <span className={styles.fieldLabel}>Number of cards</span>
        <input
          id="cardCount"
          className={styles.fieldInput}
          type="number"
          min={2}
          step={2}
          value={values.cardCount}
          onChange={(e) => update({ cardCount: Number(e.target.value) })}
          required
        />
      </div>

      <div className={styles.field}>
        <span className={styles.fieldLabel}>Countdown time (sec.)</span>
        <input
          id="countdownSeconds"
          className={styles.fieldInput}
          type="number"
          min={10}
          value={values.countdownSeconds}
          onChange={(e) =>
            update({ countdownSeconds: Number(e.target.value) })
          }
          required
        />
      </div>

      <div className={styles.field}>
        <span className={styles.fieldLabel}>Flip-back delay (ms, optional)</span>
        <input
          id="flipBackDelayMs"
          className={styles.fieldInput}
          type="number"
          min={100}
          value={values.flipBackDelayMs}
          onChange={(e) =>
            update({
              flipBackDelayMs:
                e.target.value === "" ? "" : Number(e.target.value),
            })
          }
        />
      </div>

      <div className={styles.field}>
        <span className={styles.fieldLabel}>Max mistakes (optional)</span>
        <input
          id="maxBadGuesses"
          className={styles.fieldInput}
          type="number"
          min={1}
          value={values.maxBadGuesses}
          onChange={(e) =>
            update({
              maxBadGuesses:
                e.target.value === "" ? "" : Number(e.target.value),
            })
          }
        />
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <button className={styles.button} type="submit" disabled={isLoading}>
        {isLoading ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
