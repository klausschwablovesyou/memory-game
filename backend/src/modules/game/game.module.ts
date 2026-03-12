import { Module } from "@danet/core";
import { RealtimeModule } from "@backend/modules/realtime/realtime.module.ts";
import { GameController } from "./game.controller.ts";
import { GameRealtimeController } from "./game-realtime.controller.ts";
import { GameService } from "./game.service.ts";
import { GameRepository } from "./game.repository.ts";
import { GameTimerService } from "./game-timer.service.ts";

@Module({
  imports: [RealtimeModule],
  controllers: [GameController, GameRealtimeController],
  injectables: [GameService, GameRepository, GameTimerService],
})
export class GameModule {}
