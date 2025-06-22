import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryController } from './cloudinary.controller'; // Import the controller

@Module({
  imports: [ConfigModule],
  providers: [CloudinaryService],
  controllers: [CloudinaryController], // Add the controller to the module
  exports: [CloudinaryService],
})
export class CloudinaryModule {}