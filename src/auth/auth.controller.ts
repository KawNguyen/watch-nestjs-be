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
import { LocalAuthGuard } from './guards/local-auth/local-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ status: 201, description: 'Registration successful' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(
      registerDto.firstName,
      registerDto.lastName,
      registerDto.email,
      registerDto.password,
    );
  }

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
      secure: true,
      sameSite: 'strict',
      maxAge: 3600000 * 24,
    });

    res
      .status(200)
      .json({ message: 'OTP verified successfully', userId: response.userId });
  }

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Res() res, @Body() loginDto: LoginDto) {
    await this.authService.login(loginDto.email, loginDto.password);

    // res.cookie('accessToken', response.user.accessToken, {
    //   httpOnly: true,
    //   secure: false,
    //   sameSite: 'strict',
    //   maxAge: 3600000 * 1,
    // });

    // res.status(200).json({ message: 'Login successful' });
  }

  @Post('logout')
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  @HttpCode(HttpStatus.OK)
  async logout(@Res() res) {
    res.clearCookie('accessToken');
    res.status(200).json({ message: 'Logout successful' });
  }

  @Get('google/login')
  @ApiOperation({ summary: 'Google OAuth2 Login' })
  @ApiResponse({ status: 200, description: 'Redirect to Google login page' })
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {}

  @Get('google/callback')
  @ApiOperation({ summary: 'Google OAuth2 Callback' })
  @ApiResponse({ status: 200, description: 'Login successful with Google' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req, @Res() res) {
    const response = await this.authService.loginGoogle(req.user.email);

    res.cookie('accessToken', response.user.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 3600000,
    });

    res.redirect(`http://localhost:3001`);
  }
}
