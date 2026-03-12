import { Injectable, HttpException } from "@danet/core";
import { GameRepository } from "./game.repository.ts";
import { EMOJI_POOL } from "./emoji-pool.ts";
import type { CreateGameDto } from "@shared/game/dtos/create-game.dto.ts";
import type { GameSettings } from "@shared/game/models/game-settings.model.ts";
import type { Game } from "@shared/game/models/game.model.ts";
import type { TimerState } from "@shared/game/models/timer-state.model.ts";
import type { LastAction } from "@shared/game/types/last-action.ts";
import type { CardInternal } from "./models/card-internal.model.ts";
import type { GameInternal } from "./models/game-internal.model.ts";

@Injectable()
export class GameService {
  constructor(private readonly repository: GameRepository) {}

  public createGame(dto: CreateGameDto): Game {
    if (dto.cardCount % 2 !== 0 || dto.cardCount < 2) {
      throw new HttpException(400, "cardCount must be an even number >= 2");
    }
    if (dto.cardCount / 2 > EMOJI_POOL.length) {
      throw new HttpException(
        400,
        `cardCount cannot exceed ${EMOJI_POOL.length * 2}`,
      );
    }

    const settings: GameSettings = {
      username: dto.username,
      cardCount: dto.cardCount,
      countdownSeconds: dto.countdownSeconds,
      flipBackDelayMs: dto.flipBackDelayMs ?? 1000,
      maxBadGuesses: dto.maxBadGuesses,
    };

    const game: GameInternal = {
      id: crypto.randomUUID(),
      cards: this.generateShuffledCards(dto.cardCount),
      settings,
      state: {
        status: "playing",
        turns: 0,
        badGuesses: 0,
        matchedPairs: 0,
        startTime: Date.now(),
        currentFlipped: [],
      },
    };

    this.repository.save(game);
    return this.toPublicGame(game);
  }

  public getGame(gameId: string): Game {
    const game = this.findOrThrow(gameId);
    this.expireIfTimeUp(game);
    return this.toPublicGame(game);
  }

  public flipCard(gameId: string, cardId: string): Game {
    const game = this.findOrThrow(gameId);
    this.expireIfTimeUp(game);

    if (game.state.status !== "playing") {
      throw new HttpException(400, "Game is already finished");
    }

    const card = game.cards.find((c) => c.id === cardId);
    if (!card) throw new HttpException(404, "Card not found");
    if (card.isMatched) throw new HttpException(400, "Card is already matched");
    if (card.isFaceUp) throw new HttpException(400, "Card is already face up");

    // Clear a pending mismatch before processing the new flip
    if (game.state.currentFlipped.length === 2) {
      for (const id of game.state.currentFlipped) {
        const pending = game.cards.find((c) => c.id === id);
        if (pending && !pending.isMatched) pending.isFaceUp = false;
      }
      game.state.currentFlipped = [];
    }

    card.isFaceUp = true;
    game.state.currentFlipped = [...game.state.currentFlipped, cardId];

    let lastAction: LastAction = "flip";

    if (game.state.currentFlipped.length === 2) {
      const [id1, id2] = game.state.currentFlipped;
      const first = game.cards.find((c) => c.id === id1)!;
      const second = game.cards.find((c) => c.id === id2)!;

      game.state.turns++;

      if (first.pairId === second.pairId) {
        first.isMatched = true;
        second.isMatched = true;
        game.state.matchedPairs++;
        game.state.currentFlipped = [];
        lastAction = "match";

        if (game.state.matchedPairs === game.settings.cardCount / 2) {
          game.state.status = "won";
          game.state.endTime = Date.now();
        }
      } else {
        game.state.badGuesses++;
        lastAction = "mismatch";

        const maxExceeded =
          game.settings.maxBadGuesses !== undefined &&
          game.state.badGuesses >= game.settings.maxBadGuesses;

        if (maxExceeded) {
          game.state.status = "lost";
          game.state.endTime = Date.now();
          first.isFaceUp = false;
          second.isFaceUp = false;
          game.state.currentFlipped = [];
        }
      }
    }

    this.repository.save(game);
    return { ...this.toPublicGame(game), lastAction };
  }

  public getTimerState(gameId: string): TimerState {
    const game = this.findOrThrow(gameId);
    this.expireIfTimeUp(game);
    return {
      remainingSeconds: this.getRemainingSeconds(game),
      status: game.state.status,
    };
  }

  public restartGame(gameId: string): Game {
    const game = this.findOrThrow(gameId);

    game.cards = this.generateShuffledCards(game.settings.cardCount);
    game.state = {
      status: "playing",
      turns: 0,
      badGuesses: 0,
      matchedPairs: 0,
      startTime: Date.now(),
      currentFlipped: [],
    };

    this.repository.save(game);
    return this.toPublicGame(game);
  }

  private findOrThrow(gameId: string): GameInternal {
    const game = this.repository.findById(gameId);
    if (!game) throw new HttpException(404, "Game not found");
    return game;
  }

  private generateShuffledCards(cardCount: number): CardInternal[] {
    const pairCount = cardCount / 2;
    const emojis = [...EMOJI_POOL]
      .sort(() => Math.random() - 0.5)
      .slice(0, pairCount);

    const cards: CardInternal[] = [];
    for (let i = 0; i < emojis.length; i++) {
      const pairId = `pair-${i}`;
      cards.push(
        { id: crypto.randomUUID(), pairId, emoji: emojis[i], isFaceUp: false, isMatched: false },
        { id: crypto.randomUUID(), pairId, emoji: emojis[i], isFaceUp: false, isMatched: false }
      );
    }

    return cards.sort(() => Math.random() - 0.5);
  }

  private getRemainingSeconds(game: GameInternal): number {
    const elapsed = ((game.state.endTime ?? Date.now()) - game.state.startTime) / 1000;
    return Math.max(0, game.settings.countdownSeconds - Math.floor(elapsed));
  }

  private expireIfTimeUp(game: GameInternal): void {
    if (game.state.status === "playing" && this.getRemainingSeconds(game) <= 0) {
      game.state.status = "lost";
      game.state.endTime = Date.now();
      this.repository.save(game);
    }
  }

  private toPublicGame(game: GameInternal): Game {
    return {
      gameId: game.id,
      board: game.cards.map((card) => ({
        id: card.id,
        isFaceUp: card.isFaceUp,
        isMatched: card.isMatched,
        emoji: card.isFaceUp || card.isMatched ? card.emoji : undefined,
      })),
      settings: game.settings,
      state: {
        status: game.state.status,
        turns: game.state.turns,
        badGuesses: game.state.badGuesses,
        matchedPairs: game.state.matchedPairs,
        remainingSeconds: this.getRemainingSeconds(game),
        startTime: game.state.startTime,
        pendingFlipBack: game.state.currentFlipped.length === 2,
      },
    };
  }
}
