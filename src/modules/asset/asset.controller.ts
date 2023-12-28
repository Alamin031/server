import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  NotFoundException,
  UploadedFiles,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBasicAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/enums/role.enum';

import { AssetService } from './asset.service';
import { AssetEntity } from './entities/asset.entity';

import { ApiFiles } from 'src/decorators/file.decorator';
import { anyFileFilter } from 'src/middleware/uploader';

import { GetUser } from 'src/decorators/User';

import { UpdateAssetDto } from './dto/update-asset.dto';
import { userWithRole } from 'src/types/types';

const CustomAPIDOC = {};

@Controller('asset')
@ApiTags('asset')
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @Post()
  @ApiBasicAuth('access-token')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.User)
  @ApiFiles('file', '/assets', 20, CustomAPIDOC, true, anyFileFilter)
  @ApiCreatedResponse({ type: AssetEntity })
  async create(
    @UploadedFiles() files: Express.Multer.File[],
    @GetUser() user: userWithRole,
  ) {
    return await this.assetService.create(files, user);
  }

  @Get()
  @ApiOkResponse({ type: AssetEntity, isArray: true })
  // @ApiBasicAuth('access-token')
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  // @Roles(Role.User)
  async findAll() {
    const models = await this.assetService.findAll();
    return models;
  }

  @Get('id/:id')
  @ApiOkResponse({ type: AssetEntity })
  async findOneById(@Param('id', ParseIntPipe) id: number) {
    const response = await this.assetService.findOneById(id);

    if (response) return response;
    else throw new NotFoundException('Asset not found');
  }
  @Get('slug/:slug')
  @ApiOkResponse({ type: AssetEntity })
  async findOneBySlug(@Param('slug') slug: string) {
    const response = await this.assetService.findOneBySlug(slug);

    if (response) return response;
    else throw new NotFoundException('Asset not found');
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAssetDto: UpdateAssetDto,
  ) {
    const response = await this.assetService.update(id, updateAssetDto);

    if (response) return response;
    else throw new NotFoundException('Model not found');
  }

  @Delete(':id')
  @ApiOkResponse({ type: AssetEntity })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.assetService.remove(id);
  }
}
