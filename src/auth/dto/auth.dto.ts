import { IsString, IsEmail, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AddressDto, UserProfileDto } from '../../user/dto/user.dto';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'John' })
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Doe' })
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ example: 'johndoe@gmail.com' })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'password' })
  password: string;

  @ValidateNested()
  @Type(() => UserProfileDto)
  profile?: UserProfileDto;

  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;
}

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ example: 'EMAIL' })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'PASSWORD' })
  password: string;
}

export class VerifyOtpDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ example: 'EMAIL' })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'OTP' })
  otp: string;
}
