import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: 'http://localhost:3000/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      // Kiểm tra và xử lý dữ liệu an toàn hơn
      const user = {
        email: profile.emails?.[0]?.value || '',
        firstName: profile._json?.given_name || '',
        lastName: profile._json?.family_name || '',
        picture: profile._json?.picture || '',
      };

      done(null, user);
    } catch (error) {
      console.error('Google Strategy Validation Error:', error);
      done(error, false);
    }
  }
}
