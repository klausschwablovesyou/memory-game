import { Injectable } from "@danet/core";
import type { GameInternal } from "./models/game-internal.model.ts";

@Injectable()
export class GameRepository {
  private readonly games = new Map<string, GameInternal>();

  public save(game: GameInternal): void {
    this.games.set(game.id, game);
  }

  public findById(id: string): GameInternal | undefined {
    return this.games.get(id);
  }

  public delete(id: string): void {
    this.games.delete(id);
  }
}
