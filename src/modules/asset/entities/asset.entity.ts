import { ApiProperty } from '@nestjs/swagger';
import { Asset } from '@prisma/client';

export class AssetEntity implements Asset {
  @ApiProperty()
  id: number;

  @ApiProperty()
  fileType: string;

  @ApiProperty()
  tags: string[];

  @ApiProperty()
  height: number | null;

  @ApiProperty()
  width: number | null;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  fileName: string;

  @ApiProperty()
  mimeType: string;

  @ApiProperty()
  fileSize: number;

  @ApiProperty()
  isImage: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  createdBy: number | null;

  @ApiProperty()
  accessoriesId: number | null;

  @ApiProperty()
  vehicleId: number | null;

  @ApiProperty()
  vehicleFileid: number | null;

  @ApiProperty()
  dealersId: number | null;

  @ApiProperty()
  filesId: number | null;

  @ApiProperty()
  createdById: number | null;
}
