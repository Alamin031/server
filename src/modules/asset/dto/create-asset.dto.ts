import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { StatusOption } from 'src/types/types';

class CreateAssetDto {
  @IsString()
  @ApiProperty()
  name: string;

  @IsEnum(StatusOption)
  @IsOptional()
  @ApiProperty({
    description: 'status',
    example: StatusOption.Published,
  })
  status: StatusOption;
}

export { CreateAssetDto };
