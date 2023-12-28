/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { customResponseHandler } from 'src/config/helpers';
import { UpdateAssetDto } from './dto/update-asset.dto';
import * as fs from 'fs';
import { userWithRole } from 'src/types/types';
import * as sharp from 'sharp';
import { extname } from 'path';

@Injectable()
export class AssetService {
  constructor(private prisma: PrismaService) {}

  async create(files: Express.Multer.File[], user: userWithRole) {
    const newFiles = await Promise.all(
      files.map(async (file) => {
        const extName = extname(file.originalname).slice(1);
        const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(extName);

        const metadata = isImage ? await sharp(file.path).metadata() : null;
        const sizeTag =
          file.size <= 1024
            ? 'image/small'
            : file.size <= 1024 * 1024
              ? 'image/medium'
              : 'image/large';

        console.log(file);

        const response = await this.prisma.asset.create({
          data: {
            fileType: isImage ? 'image' : extName,
            tags: isImage
              ? ['image', file.mimetype, sizeTag]
              : [`type/${extName}`],
            height: isImage ? metadata.height : null,
            width: isImage ? metadata.width : null,
            slug: file.filename,
            fileName: 'assets/' + file.filename,
            mimeType: file.mimetype,
            fileSize: file.size,
            isImage,
          },
        });

        return response;
      }),
    );
    await this.prisma.$disconnect();
    return customResponseHandler('Asset created successfully', newFiles);
  }

  async mapSingleFileData(file: Express.Multer.File, user?: userWithRole) {
    const extName = extname(file.originalname).slice(1);
    const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(extName);

    const metadata = isImage ? await sharp(file.path).metadata() : null;
    const sizeTag =
      file.size <= 1024
        ? 'image/small'
        : file.size <= 1024 * 1024
          ? 'image/medium'
          : 'image/large';

    const fileData: {
      fileType: string;
      tags: string[];
      height: number | null;
      width: number | null;
      slug: string;
      fileName: string;
      mimeType: string;
      fileSize: number;
      isImage: boolean;
      createdBy?: number;
    } = {
      fileType: isImage ? 'image' : extName,
      tags: isImage ? ['image', file.mimetype, sizeTag] : [`type/${extName}`],
      height: isImage ? metadata.height : null,
      width: isImage ? metadata.width : null,
      slug: file.filename,
      fileName: file.path.replace('public', ''),
      mimeType: file.mimetype,
      fileSize: file.size,
      isImage,
    };

    if (user?.id) {
      fileData.createdBy = user.id;
    }

    return fileData;
  }

  async mapFileData(files: Express.Multer.File[], user: userWithRole) {
    const newFiles = await Promise.all(
      files.map(async (file) => {
        const extName = extname(file.originalname).slice(1);
        const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(extName);

        const metadata = isImage ? await sharp(file.path).metadata() : null;
        const sizeTag =
          file.size <= 1024
            ? 'image/small'
            : file.size <= 1024 * 1024
              ? 'image/medium'
              : 'image/large';

        return {
          fileType: isImage ? 'image' : extName,
          tags: isImage
            ? ['image', file.mimetype, sizeTag]
            : [`type/${extName}`],
          height: isImage ? metadata.height : null,
          width: isImage ? metadata.width : null,
          slug: file.filename,
          fileName: file.path.replace('public', ''),
          mimeType: file.mimetype,
          fileSize: file.size,
          isImage,
          createdBy: user.id,
        };
      }),
    );

    return newFiles;
  }
  async mapVehicleFile(file: Express.Multer.File, user: userWithRole) {
    const extName = extname(file.originalname).slice(1);
    const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(extName);

    const metadata = isImage ? await sharp(file.path).metadata() : null;
    const sizeTag =
      file.size <= 1024
        ? 'image/small'
        : file.size <= 1024 * 1024
          ? 'image/medium'
          : 'image/large';

    const fileProperty = {
      fileType: isImage ? 'image' : extName,
      tags: isImage ? ['image', file.mimetype, sizeTag] : [`type/${extName}`],
      height: isImage ? metadata.height : null,
      width: isImage ? metadata.width : null,
      slug: file.filename,
      fileName: file.path.replace('public', ''),
      mimeType: file.mimetype,
      fileSize: file.size,
      isImage,
      createdBy: user.id,
    };

    return fileProperty;
  }

  async mapArFiles(file: Express.Multer.File, user: userWithRole) {
    const extName = extname(file.originalname).slice(1);
    const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(extName);

    return {
      create: {
        fileType: isImage ? 'image' : extName,
        tags: [`type/${extName}`],

        slug: file.filename,
        fileName: file.path.replace('public', ''),
        mimeType: file.mimetype,
        fileSize: file.size,
        isImage,
        createdBy: user.id,
      },
    };
  }

  async mapFiles(files: Express.Multer.File[], user: userWithRole) {
    const newFiles = await Promise.all(
      files.map(async (file) => {
        const extName = extname(file.originalname).slice(1);
        const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(extName);

        const metadata = isImage ? await sharp(file.path).metadata() : null;
        const sizeTag =
          file.size <= 1024
            ? 'image/small'
            : file.size <= 1024 * 1024
              ? 'image/medium'
              : 'image/large';

        // {
        //   name: 'carImage',
        //   file: {
        //     create: assets,
        //   },
        // }

        return {
          type: file.fieldname,
          asset: {
            create: {
              fileType: isImage ? 'image' : extName,
              tags: isImage
                ? ['image', file.mimetype, sizeTag]
                : [`type/${extName}`],
              height: isImage ? metadata.height : null,
              width: isImage ? metadata.width : null,
              slug: file.filename,
              fileName: file.path.replace('public', ''),
              mimeType: file.mimetype,
              fileSize: file.size,
              isImage,
              createdBy: user.id,
            },
          },

          // {
          //   fileType: isImage ? 'image' : extName,
          //   tags: isImage
          //     ? ['image', file.mimetype, sizeTag]
          //     : [`type/${extName}`],
          //   height: isImage ? metadata.height : null,
          //   width: isImage ? metadata.width : null,
          //   slug: file.filename,
          //   fileName: file.path.replace('public', ''),
          //   mimeType: file.mimetype,
          //   fileSize: file.size,
          //   isImage,
          //   createdBy: user.id,
          // }
        };
      }),
    );

    return newFiles;
  }

  findAll() {
    return this.prisma.asset.findMany();
  }

  findOneById(id: number) {
    return this.prisma.asset.findUnique({
      where: { id },
    });
  }
  findOneBySlug(slug: string) {
    return this.prisma.asset.findFirst({
      where: { slug },
    });
  }

  async update(id: number, updateAssetDto: UpdateAssetDto) {
    const response = await this.prisma.asset.update({
      where: { id },
      data: updateAssetDto,
    });

    if (updateAssetDto.fileName) {
      fs.rename(
        `${__dirname}/../../../public/assets/${response.fileName}`,
        `${__dirname}/../../../public/assets/${updateAssetDto.fileName}`,
        function (err) {
          if (err) throw new NotFoundException(err.message);
          console.log('File Renamed!');
        },
      );
    }

    return customResponseHandler('Asset updated successfully', response);
  }

  async remove(id: number) {
    await this.prisma.asset.delete({
      where: { id },
    });
    return customResponseHandler('Asset deleted successfully');
  }
}
