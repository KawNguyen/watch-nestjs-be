import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class CreateSupportRequestDto {
  @ApiProperty({
    description: 'Email of the user creating the support request',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Phone number of the user (optional)',
    example: '123-456-7890',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  subject: string;
  
  @ApiProperty({
    description: 'Message content of the support request',
    example: 'I need help with my order.',
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}
