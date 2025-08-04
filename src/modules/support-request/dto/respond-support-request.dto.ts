import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class RespondSupportRequestDto {
  @ApiProperty({
    description: 'Response message for the support request',
    example: 'Thank you for reaching out. We will get back to you shortly.',
  })
  @IsString()
  @IsNotEmpty()
  response: string;
}
