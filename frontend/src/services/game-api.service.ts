import type { CreateGameDto } from "@shared/game/dtos/create-game.dto";
import type { FlipCardDto } from "@shared/game/dtos/flip-card.dto";
import type { Game } from "@shared/game/models/game.model";
import { ApiClientService, apiClientService } from "./api-client.service";

export class GameApiService {
  constructor(private readonly client: ApiClientService) {}

  public createGame(dto: CreateGameDto): Promise<Game> {
    return this.client.post<Game>("/games", dto);
  }

  public getGame(gameId: string): Promise<Game> {
    return this.client.get<Game>(`/games/${gameId}`);
  }

  public flipCard(gameId: string, dto: FlipCardDto): Promise<Game> {
    return this.client.post<Game>(`/games/${gameId}/flip`, dto);
  }

  public restartGame(gameId: string): Promise<Game> {
    return this.client.post<Game>(`/games/${gameId}/restart`);
  }
}

export const gameApiService = new GameApiService(apiClientService);
