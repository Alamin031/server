import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CustomerService {
  constructor(private prisma: PrismaService) {}

  async findAllViewer({
    offset = 1,
    limit = 10,
    sort = 'id',
    order = 'asc',
    search = '',
  }: {
    offset?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    search?: string;
  }) {
    if (offset < 1)
      throw new HttpException('Offset/PageNumber must be greater than 0', 500);

    const users = await this.prisma.user.findMany({
      where: {
        role: 'USER',
        OR: [
          {
            username: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            email: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
      },

      skip: (offset - 1) * limit,
      take: limit,
      orderBy: {
        [sort]: order,
      },
    });

    const total = await this.prisma.user.count({
      where: {
        role: 'USER',
        OR: [
          {
            username: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            email: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
      },
    });

    return {
      data: users,
      meta: {
        page: offset,
        limit,
        total: total,
      },
    };
  }
}
