import { IsString, IsEmail, IsOptional, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class AddressDto {
  @IsString()
  @IsNotEmpty()
  street: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsString()
  @IsOptional()
  postalCode?: string;
}

export class UserProfileDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  bio?: string;
}

export class CreateUserDto {

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @ValidateNested()
  @Type(() => UserProfileDto)
  profile?: UserProfileDto;

  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;
}

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @ValidateNested()
  @IsOptional()
  @Type(() => UserProfileDto)
  profile?: UserProfileDto;

  @ValidateNested()
  @IsOptional()
  @Type(() => AddressDto)
  address?: AddressDto;
}