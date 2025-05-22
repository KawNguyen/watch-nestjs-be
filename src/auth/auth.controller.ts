import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, VerifyOtpDto } from './dto/auth.dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ status: 201, description: 'Registration successful' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto.email, registerDto.password);
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify OTP code' })
  @ApiResponse({ status: 200, description: 'OTP verified successfully' })
  @ApiResponse({ status: 401, description: 'Invalid OTP' })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOtp(verifyOtpDto.email, verifyOtpDto.otp);
  }

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Get('google')
  @ApiOperation({ summary: 'Google OAuth2 Login' })
  @ApiResponse({ status: 200, description: 'Redirect to Google login page' })
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {
    // This route will be handled by Passport.js
    
  }

  @Get('google/callback')
  @ApiOperation({ summary: 'Google OAuth2 Callback' })
  @ApiResponse({ status: 200, description: 'Login successful with Google' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req) {
    try{
      return await this.authService.googleLogin(req.user);
    }catch(error){
      console.error(error);
      return error;
    }
  }
}