import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Inject, Injectable } from '@nestjs/common';
import googleAuthConfig from '../config/google-auth.config';
import { ConfigType } from '@nestjs/config';
import { AuthService } from './../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(googleAuthConfig.KEY)
    private googleConfiguration: ConfigType<typeof googleAuthConfig>,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: googleConfiguration.clientId || '',
      clientSecret: googleConfiguration.clientSecret || '',
      callbackURL: googleConfiguration.callbackURL,
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
      // const user = {
      //   email: profile.emails?.[0]?.value || '',
      //   firstName: profile._json?.given_name || '',
      //   lastName: profile._json?.family_name || '',
      //   picture: profile._json?.picture || '',
      //   password: '',
      // };

      const user = await this.authService.validateGoogleUser({
        email: profile.emails?.[0]?.value || '',
        profile: {
          firstName: profile._json?.given_name || '',
          lastName: profile._json?.family_name || '',
          avatar: profile._json?.picture || '',
        },
        password: '',
      });

      done(null, user);
    } catch (error) {
      console.error('Google Strategy Validation Error:', error);
      done(error, false);
    }
  }
}
