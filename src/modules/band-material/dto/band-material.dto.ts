import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBandMaterialDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Steel' })
  name: string;
}

export class UpdateBandMaterialDto extends PartialType(CreateBandMaterialDto) {}
