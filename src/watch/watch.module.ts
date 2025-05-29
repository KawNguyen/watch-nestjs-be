import { Module } from '@nestjs/common';
import { WatchService } from './watch.service';
import { WatchController } from './watch.controller';

@Module({
  providers: [WatchService],
  controllers: [WatchController]
})
export class WatchModule {}
