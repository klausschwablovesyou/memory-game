import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SettingsForm } from "../SettingsForm/SettingsForm";
import type { GameSettingsValues } from "../SettingsForm/game-settings-values";
import { defaultSettings } from "../../tests/fixtures/default-settings";

const defaultValues: GameSettingsValues = {
  username: defaultSettings.username,
  cardCount: defaultSettings.cardCount,
  countdownSeconds: defaultSettings.countdownSeconds,
  flipBackDelayMs: "",
  maxBadGuesses: "",
};

describe("SettingsForm", () => {
  it("renders all form fields", () => {
    render(
      <SettingsForm
        initialValues={defaultValues}
        onSubmit={vi.fn()}
        submitLabel="Start Game"
      />,
    );

    expect(screen.getByText("Username")).toBeInTheDocument();
    expect(screen.getByText("Number of cards")).toBeInTheDocument();
    expect(screen.getByText("Countdown time (sec.)")).toBeInTheDocument();
    expect(screen.getByText("Flip-back delay (ms, optional)")).toBeInTheDocument();
    expect(screen.getByText("Max mistakes (optional)")).toBeInTheDocument();
  });

  it("renders submit button with provided label", () => {
    render(
      <SettingsForm
        initialValues={defaultValues}
        onSubmit={vi.fn()}
        submitLabel="Start Game"
      />,
    );

    expect(screen.getByRole("button", { name: "Start Game" })).toBeInTheDocument();
  });

  it("shows Saving... when isLoading", () => {
    render(
      <SettingsForm
        initialValues={defaultValues}
        onSubmit={vi.fn()}
        submitLabel="Start Game"
        isLoading={true}
      />,
    );

    const button = screen.getByRole("button", { name: "Saving..." });
    expect(button).toBeDisabled();
  });

  it("displays error message", () => {
    render(
      <SettingsForm
        initialValues={defaultValues}
        onSubmit={vi.fn()}
        submitLabel="Start Game"
        error="Something went wrong"
      />,
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("calls onSubmit with form values", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <SettingsForm
        initialValues={{ ...defaultValues, username: "Alice" }}
        onSubmit={onSubmit}
        submitLabel="Start Game"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Start Game" }));

    expect(onSubmit).toHaveBeenCalledWith({
      username: "Alice",
      cardCount: defaultSettings.cardCount,
      countdownSeconds: defaultSettings.countdownSeconds,
      flipBackDelayMs: "",
      maxBadGuesses: "",
    });
  });

  it("updates username on input change", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <SettingsForm
        initialValues={{ ...defaultValues, username: "" }}
        onSubmit={onSubmit}
        submitLabel="Start"
      />,
    );

    await user.type(document.getElementById("username")!, "Bob");
    await user.click(screen.getByRole("button", { name: "Start" }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ username: "Bob" }),
    );
  });

  it("renders initial values in inputs", () => {
    render(
      <SettingsForm
        initialValues={{
          username: "Alice",
          cardCount: 8,
          countdownSeconds: 30,
          flipBackDelayMs: 500,
          maxBadGuesses: 3,
        }}
        onSubmit={vi.fn()}
        submitLabel="Save"
      />,
    );

    expect(document.getElementById("username")).toHaveValue("Alice");
    expect(document.getElementById("cardCount")).toHaveValue(8);
    expect(document.getElementById("countdownSeconds")).toHaveValue(30);
    expect(document.getElementById("flipBackDelayMs")).toHaveValue(500);
    expect(document.getElementById("maxBadGuesses")).toHaveValue(3);
  });
});
