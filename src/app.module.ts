import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { BrandModule } from './brand/brand.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth/jwt-auth.guard';
import { BandMaterialModule } from './band-material/band-material.module';
import { MovementModule } from './movement/movement.module';
import { RolesGuard } from './auth/guards/roles/roles.guard';
import { MaterialModule } from './material/material.module';
import { WatchModule } from './watch/watch.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { FavoriteModule } from './favorite/favorite.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    BrandModule,
    MaterialModule,
    BandMaterialModule,
    MovementModule,
    WatchModule,
    CloudinaryModule,
    WatchModule,
    FavoriteModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
