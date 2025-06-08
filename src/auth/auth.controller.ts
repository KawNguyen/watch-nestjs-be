import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, VerifyOtpDto } from './dto/auth.dto';
import { GoogleAuthGuard } from './guards/google-auth/google-auth.guard';
import { ConfigService } from '@nestjs/config';
import { Public } from './decorators/public.decorators';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Public()
  @Post('sign-in')
  @ApiOperation({ summary: 'Sign-in in FE ADMIN' })
  @ApiResponse({ status: 200, description: 'Sign-in successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async signIn(@Body() loginDto: LoginDto, @Res() res) {
    const response = await this.authService.loginAdmin(
      loginDto.email,
      loginDto.password,
    );

    res.cookie('accessToken', response.accessToken, {
      httpOnly: true,
      // secure: this.configService.get('NODE_ENV') === 'production',
      secure: false,
      sameSite: 'strict',
      maxAge: 3600000 * 24,
    });

    res.status(200).json({ message: response.message });
  }

  @ApiOperation({ summary: 'Check authentication status' })
  @Get('check-auth')
  @ApiResponse({ status: 200, description: 'User is authenticated' })
  @ApiResponse({ status: 401, description: 'User is not authenticated' })
  async checkAuth(@Req() req, @Res() res) {
    const user = await this.authService.checkAuth(req.cookies.accessToken);
    if (user) {
      res.status(200).json({ message: 'User is authenticated', user });
    } else {
      res.status(401).json({ message: 'User is not authenticated' });
    }
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ status: 201, description: 'Registration successful' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async register(@Body() registerDto: RegisterDto, @Res() res) {
    const response = await this.authService.register(
      registerDto.firstName,
      registerDto.lastName,
      registerDto.email,
      registerDto.password,
    );

    res.status(202).json({
      message: response.message,
    });
  }

  @Public()
  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify OTP code' })
  @ApiResponse({ status: 200, description: 'OTP verified successfully' })
  @ApiResponse({ status: 401, description: 'Invalid OTP' })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto, @Res() res) {
    const response = await this.authService.verifyOtp(
      verifyOtpDto.email,
      verifyOtpDto.otp,
    );

    res.cookie('accessToken', response.accessToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: 3600000 * 24,
    });

    res.status(200).json({ message: 'OTP verified successfully' });
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Res() res, @Body() loginDto: LoginDto) {
    const response = await this.authService.login(
      loginDto.email,
      loginDto.password,
    );

    res.status(202).json({ message: response.message });
  }

  @Post('logout')
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  @HttpCode(HttpStatus.OK)
  async logout(@Res() res) {
    res.clearCookie('accessToken');
    res.status(200).json({ message: 'Logout successful' });
  }

  @Public()
  @Get('google/login')
  @ApiOperation({ summary: 'Google OAuth2 Login' })
  @ApiResponse({ status: 200, description: 'Redirect to Google login page' })
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {}

  @Public()
  @Get('google/callback')
  @ApiOperation({ summary: 'Google OAuth2 Callback' })
  @ApiResponse({ status: 200, description: 'Login successful with Google' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req, @Res() res) {
    const response = await this.authService.loginGoogle(req.user.email);

    res.cookie('accessToken', response.accessToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: 3600000,
    });

    res.redirect(`http://localhost:3000`);
  }
}
