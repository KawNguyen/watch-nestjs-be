import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMaterialDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Steel' })
  name: string;
} 

export class UpdateMaterialDto extends PartialType(CreateMaterialDto) {} 
