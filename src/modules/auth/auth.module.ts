import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategy/jwt.strategy';
import { GoogleStrategy } from './strategy/google.strategy';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import googleAuthConfig from './config/google-auth.config';
import { UserService } from 'src/modules/user/user.service';
import jwtConfig from './config/jwt.config';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    MailModule,
    PassportModule,
    CloudinaryModule,
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(googleAuthConfig),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    GoogleStrategy,
    PrismaService,
    UserService,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
