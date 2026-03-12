import { Controller, Get, Post, Body, Param } from "@danet/core";
import { GameService } from "./game.service.ts";
import type { CreateGameDto } from "@shared/game/dtos/create-game.dto.ts";
import type { FlipCardDto } from "@shared/game/dtos/flip-card.dto.ts";
import type { Game } from "@shared/game/models/game.model.ts";

@Controller("games")
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post()
  public createGame(@Body() dto: CreateGameDto): Game {
    return this.gameService.createGame(dto);
  }

  @Get(":gameId")
  public getGame(@Param("gameId") gameId: string): Game {
    return this.gameService.getGame(gameId);
  }

  @Post(":gameId/flip")
  public flipCard(
    @Param("gameId") gameId: string,
    @Body() dto: FlipCardDto
  ): Game {
    return this.gameService.flipCard(gameId, dto.cardId);
  }

  @Post(":gameId/restart")
  public restartGame(@Param("gameId") gameId: string): Game {
    return this.gameService.restartGame(gameId);
  }
}
