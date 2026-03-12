import { Module } from "@danet/core";
import { GameModule } from "./modules/game/game.module.ts";
import { RealtimeModule } from "./modules/realtime/realtime.module.ts";

@Module({
  imports: [RealtimeModule, GameModule],
})
export class AppModule {}
