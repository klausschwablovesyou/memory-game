import type { GameSettingsValues } from "./game-settings-values";

export type SettingsFormProps = {
  initialValues: GameSettingsValues;
  onSubmit: (values: GameSettingsValues) => void;
  submitLabel: string;
  isLoading?: boolean;
  error?: string | null;
};
