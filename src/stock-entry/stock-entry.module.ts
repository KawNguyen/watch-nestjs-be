import { Module } from '@nestjs/common';
import { StockEntryService } from './stock-entry.service';
import { StockEntryController } from './stock-entry.controller';

@Module({
  providers: [StockEntryService],
  controllers: [StockEntryController],
})
export class StockEntryModule {}
