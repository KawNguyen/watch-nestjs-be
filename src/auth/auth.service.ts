import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { CreateUserDto } from 'src/user/dto/user.dto';

@Injectable()
export class AuthService {
  private transporter;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private userService: UserService,
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async loginAdmin(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.role !== 'ADMIN') {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const accessToken = await this.generateToken(user.id, email, user.role);

    await this.prisma.session.create({
      data: {
        token: accessToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        user: {
          connect: { id: user.id },
        },
      },
    });

    return {
      message: 'Login successfully',
      accessToken,
    };
  }

  async checkAuth(token: string) {
    const session = await this.prisma.session.findUnique({
      where: { token },
    });
    if (!session) {
      throw new UnauthorizedException('Session not found');
    }
    return { authenticated: true, id: session.id };
  }

  async register(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
  ) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new UnauthorizedException('Email này đã được đăng ký');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 3 * 60 * 1000);

    const user = await this.prisma.user.create({
      data: {
        profile: {
          create: {
            firstName,
            lastName,
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
      message: 'Please check your mail for OTP',
      id: user.id,
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
      throw new UnauthorizedException('OTP is invalid or has expired');
    }

    await this.prisma.user.update({
      where: { email },
      data: { otp: null, otpExpiry: null },
    });

    const accessToken = await this.generateToken(
      user.id,
      user.email,
      user.role,
    );

    return {
      message: 'Login successfully',
      accessToken,
    };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Email or password is incorrect');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 3 * 60 * 1000);

    await this.prisma.user.update({
      where: { email },
      data: {
        otp,
        otpExpiry,
      },
    });

    await this.sendOtpEmail(email, otp);

    return { message: 'Please check your mail for OTP' };
  }

  private async sendOtpEmail(email: string, otp: string) {
    await this.transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'OTP Verification',
      text: `Your OTP is: ${otp}, expires in 3 minutes`,
    });
  }

  async loginGoogle(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        profile: {
          select: {
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const accessToken = await this.generateToken(user?.id, email, user?.role);

    return {
      message: 'Login successfully with Google',
      accessToken,
    };
  }

  async validateGoogleUser(googleUser: CreateUserDto) {
    const user = await this.userService.findByEmail(googleUser.email);
    if (!user) return this.userService.create(googleUser);
    return user;
  }

  async generateToken(id: string, email: string, role: string) {
    const payload = { id, email, role };
    return this.jwtService.signAsync(payload);
  }

  async logout(id: string) {
    const user = await this.prisma.user.update({
      where: { id },
      data: { accessToken: null },
    });

    await this.prisma.session.deleteMany({
      where: { id },
    });

    return user;
  }
}
