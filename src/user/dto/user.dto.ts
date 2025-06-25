import {
  IsString,
  IsEmail,
  IsOptional,
  IsNotEmpty,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserGender } from '@prisma/client';

export class AddressDto {
  @ApiProperty({ example: '123 Nguyễn Trãi' })
  @IsString()
  @IsNotEmpty()
  street: string;

  @ApiProperty({ example: 'Quận 1' })
  @IsString()
  @IsNotEmpty()
  district: string;

  @ApiProperty({ example: 'Phường Bến Thành' })
  @IsString()
  @IsNotEmpty()
  ward: string;

  @ApiProperty({ example: 'TP. Hồ Chí Minh' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'Việt Nam' })
  @IsString()
  @IsNotEmpty()
  country: string;
}

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @ValidateNested()
  @Type(() => AddressDto)
  addresses?: AddressDto;
}

export class UpdateUserDto {
  @ApiProperty({ example: 'Jane' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Smith' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiPropertyOptional({ example: 'Gender' })
  @IsString()
  @IsOptional()
  gender?: UserGender;

  @ApiPropertyOptional({ example: '0912345678' })
  @IsString()
  @IsOptional()
  phone?: string;

  // @ApiPropertyOptional({ type: [AddressDto] })
  // @ValidateNested()
  // @IsOptional()
  // @Type(() => AddressDto)
  // addresses?: AddressDto[];
}

export class ChangePasswordDto {
  @ApiProperty({ example: 'currentPassword123' })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({ example: 'newPassword123' })
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}

export class ChangeAvatarDto {
  @ApiPropertyOptional({ example: 'https://example.com/new-avatar.jpg' })
  @IsString()
  @IsOptional()
  avatar?: string;
}
  
export class GetAllUserDto {
  @ApiProperty({ description: 'Page', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @ApiProperty({ description: 'Limit', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;

  @ApiProperty({
    description: 'Search keyword (e.g. firstName, lastName, email)',
    required: false,
  })
  @IsOptional()
  @IsString()
  keyword?: string;
}
