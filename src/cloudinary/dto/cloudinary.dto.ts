import { ApiProperty } from '@nestjs/swagger';

export class ImageUrlResponseDto {
  @ApiProperty()
  imageUrl: string;
}

export class MultipleImageUrlsResponseDto {
  @ApiProperty({ type: [String] })
  imageUrls: string[];
}
