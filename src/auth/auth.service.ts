import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  private transporter;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async register(email: string, password: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new UnauthorizedException('The email is already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    const user = await this.prisma.user.create({
      data: {
        profile: {
          create: {
            name: email.split('@')[0],
          },
        },
        email,
        password: hashedPassword,
        otp,
        otpExpiry,
      },
    });

    await this.sendOtpEmail(email, otp);

    return {
      message:
        'Registration successful. Please check your email for verification.',
      userId: user.userId,
    };
  }

  async verifyOtp(email: string, otp: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (
      !user ||
      user.otp !== otp ||
      !user.otpExpiry ||
      new Date() > user.otpExpiry
    ) {
      throw new UnauthorizedException('Invalid or expired OTP ');
    }

    await this.prisma.user.update({
      where: { email },
      data: { otp: null, otpExpiry: null },
    });

    const token = this.jwtService.sign({
      userId: user.userId,
      email: user.email,
    });

    return { token, user: { ...user, password: undefined } };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = this.jwtService.sign({
      userId: user.userId,
      email: user.email,
    });

    return { token };
  }

  private async sendOtpEmail(email: string, otp: string) {
    await this.transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'OTP Verification Code',
      text: `Your OTP code is: ${otp}. This code will expire in 10 minutes.`,
    });
  }

  async googleLogin(user: any) {
    if (!user) {
      throw new UnauthorizedException('No user from Google');
    }

    let existingUser = await this.prisma.user.findUnique({
      where: { email: user.email },
    });

    if (!existingUser) {
      existingUser = await this.prisma.user.create({
        data: {
          email: user.email,
          password: '', // Google users don't need password
          profile: {
            create: {
              name: `${user.firstName} ${user.lastName}`,
              avatar: user.picture,
            },
          },
        },
      });
    }

    const token = this.jwtService.sign({
      userId: existingUser.userId,
      email: existingUser.email,
    });

    return { token };
  }
}
