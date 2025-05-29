import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMovementDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({example: 'Automatic'})
  name: string;
} 

export class UpdateMovementDto extends PartialType(CreateMovementDto) {} 
