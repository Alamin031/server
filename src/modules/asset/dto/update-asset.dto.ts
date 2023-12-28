import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

class UpdateAssetDto {
  @IsString()
  @IsOptional()
  @ApiProperty()
  fileName: string | null;

  @IsString()
  @IsOptional()
  @ApiProperty()
  slug: string | null;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'tag',
    example: ['string', 'string', 'string'],
  })
  tag: string[] | null;
}

export { UpdateAssetDto };
