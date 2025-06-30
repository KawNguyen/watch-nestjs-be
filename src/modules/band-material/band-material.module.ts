import { Module } from '@nestjs/common';
import { BandMaterialService } from './band-material.service';
import { BandMaterialController } from './band-material.controller';

@Module({
  providers: [BandMaterialService],
  controllers: [BandMaterialController],
})
export class BandMaterialModule {}
