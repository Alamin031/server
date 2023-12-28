import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBasicAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CustomerService } from './customer.service';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '../auth/enums/role.enum';
import { ApiQueryPagination } from 'src/decorators/query-pagination.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserEntity } from '../users/entities/user.entity';

@Controller('Customer')
@ApiTags('Customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get('findAllUser')
  @ApiOkResponse({ type: UserEntity, isArray: true })
  @ApiBasicAuth('access-token')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.User)
  @ApiQueryPagination()
  async findAllViewer(
    @Query()
    query: {
      offset?: number;
      limit?: number;
      sort?: string;
      order?: 'asc' | 'desc';
      search?: string;
    },
  ) {
    const users = await this.customerService.findAllViewer({
      offset: +query.offset,
      limit: +query.limit,
      sort: query.sort,
      order: query.order,
      search: query.search,
    });
    return users;
  }
}
