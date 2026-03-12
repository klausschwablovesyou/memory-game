import { Module } from "@danet/core";
import { RealtimeService } from "./realtime.service.ts";

@Module({
  injectables: [RealtimeService],
})
export class RealtimeModule {}
