import { Module } from '@nestjs/common';

import { PrismaModule } from 'src/prisma/prisma.module';
import { AssetService } from './asset.service';
import { AssetController } from './asset.controller';

@Module({
  controllers: [AssetController],
  providers: [AssetService],
  imports: [PrismaModule],
  exports: [AssetService],
})
export class AssetModule {}
