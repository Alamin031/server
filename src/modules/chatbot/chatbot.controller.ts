/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBasicAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ChatbotService } from './chatbot.service';
import { ChatbotEntity } from './entities/chatbot.entity';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../auth/enums/role.enum';
import { Roles } from '../auth/roles.decorator';
import { ApiFilesMultiFeild } from 'src/decorators/file.decorator';
import { ApiQueryPagination } from 'src/decorators/query-pagination.decorator';
import { ConfigEntity } from './entities/config.entity';
import {
  CounterQuestionDto,
  CreateChatbotConfigDto,
  UserAssignDto,
} from './dto/ChatbotConfig.dto';
import { CounterQuestionEntity } from './entities/counterQuestio.entity';
import { UserRoles } from 'src/decorators/user-roles.decorator';
import { UserAssignEntity } from './entities/assign.entity';

const CustomAPIDOC = {
  icone: {
    type: 'string',
    format: 'binary',
  },
  files: {
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
  },
  name: {
    type: 'string',
  },
  url: {
    type: 'string',
  },
  titel: {
    type: 'string',
  },
  isGreetings: {
    type: 'boolean',
  },

  greetingsSMS: {
    type: 'array',
    example: ['hello', 'hi'],
    items: {
      type: 'string',
    },
  },
};
const EditCustomAPIDOC = {
  icone: {
    type: 'string',
    format: 'binary',
  },
  files: {
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
  },
  name: {
    type: 'string',
  },
  url: {
    type: 'string',
  },
  titel: {
    type: 'string',
  },
  isGreetings: {
    type: 'boolean',
  },
  requiredRole: { type: 'string', example: 'USER' },

  greetingsSMS: {
    type: 'array',
    example: ['hello', 'hi'],
    items: {
      type: 'string',
    },
  },
};

@Controller('chatbot')
@ApiTags('chatbot')
export class ChatbotController {
  constructor(private chatbotService: ChatbotService) {}
  //create chatbot
  @Post()
  @ApiFilesMultiFeild('Chatbot', '/Chatbot', CustomAPIDOC)
  @ApiCreatedResponse({ type: ChatbotEntity })
  async create(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() createChatbotDto: any,
  ) {
    try {
      const result = await this.chatbotService.create(files, createChatbotDto);
      return result;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  //edit chatbot
  @Put(':id')
  @ApiFilesMultiFeild('Chatbot', '/Chatbot', EditCustomAPIDOC)
  @ApiOkResponse({ type: ChatbotEntity })
  async edit(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() editChatbotDto: any,
  ) {
    try {
      const result = await this.chatbotService.edit(id, files, editChatbotDto);
      return result;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  @Get()
  @ApiOkResponse({ type: ChatbotEntity, isArray: true })
  @ApiBasicAuth('access-token')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiQueryPagination()
  @Roles(Role.Admin, Role.User, Role.Editor)
  async findAll(
    @Query()
    query: {
      offset?: number;
      limit?: number;
      sort?: string;
      order?: 'asc' | 'desc';
      search?: string;
    },
    @UserRoles() userRoles: Role[],
  ) {
    let chatbots;
    console.log('userRoles', userRoles);
    if (userRoles && userRoles.includes && userRoles.includes(Role.Admin)) {
      chatbots = await this.chatbotService.findAll({
        offset: +query.offset,
        limit: +query.limit,
        sort: query.sort,
        order: query.order,
        search: query.search,
      });
    } else {
      throw new ForbiddenException('Invalid user role.');
    }
    console.log('chatbots', chatbots);
    return chatbots;
  }

  @Get(':id')
  @ApiOkResponse({ type: ChatbotEntity })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.chatbotService.findOne(id);
  }

  @Delete(':id')
  @ApiOkResponse({ type: ChatbotEntity })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.chatbotService.remove(id);
  }

  @Post(':id/config')
  @ApiCreatedResponse({ type: ConfigEntity })
  async createChatbotConfig(
    @Param('id', ParseIntPipe) id: number,
    @Body() createChatbotConfigDto: CreateChatbotConfigDto,
  ) {
    try {
      console.log('createChatbotConfigDto:', createChatbotConfigDto);
      const result = await this.chatbotService.createChatbotConfig(
        id,
        createChatbotConfigDto,
      );
      return result;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  @Post(':id/counterquestion')
  @ApiCreatedResponse({ type: ConfigEntity })
  async createCounterQuestion(
    @Param('id', ParseIntPipe) id: number,
    @Body() counterQuestionDto: CounterQuestionDto,
  ) {
    try {
      const result = await this.chatbotService.createCounterQuestion(
        id,
        counterQuestionDto,
      );
      return result;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  @Post(':id/assignUser')
  @ApiCreatedResponse({ type: ConfigEntity })
  async assignUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() userAssignDto: UserAssignDto,
  ) {
    try {
      const result = await this.chatbotService.assignUser(id, userAssignDto);
      return result;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  @Get(':id/config')
  @ApiOkResponse({ type: ConfigEntity })
  @ApiQueryPagination()
  async getChatbotConfig(
    @Param('id', ParseIntPipe) id: number,
    @Query()
    query: {
      offset?: number;
      limit?: number;
      sort?: string;
      order?: 'asc' | 'desc';
      search?: string;
    },
  ) {
    try {
      const result = await this.chatbotService.getChatbotConfig({
        id,
        ...query,
      });
      return result;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  @Get(':id/counterquestion')
  @ApiOkResponse({ type: ConfigEntity })
  @ApiQueryPagination()
  async getcounterquestion(
    @Param('id', ParseIntPipe) id: number,
    @Query()
    query: {
      offset?: number;
      limit?: number;
      sort?: string;
      order?: 'asc' | 'desc';
      search?: string;
    },
  ) {
    try {
      const result = await this.chatbotService.getcounterquestion({
        id,
        ...query,
      });
      return result;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  @Delete(':id/promit')
  @ApiOkResponse({ type: ConfigEntity })
  async removeConfig(@Param('id', ParseIntPipe) id: number) {
    return await this.chatbotService.removeConfig(id);
  }

  @Delete(':id/question')
  @ApiOkResponse({ type: CounterQuestionEntity })
  async removeCounterQuestion(@Param('id', ParseIntPipe) id: number) {
    return await this.chatbotService.removeCounterQuestion(id);
  }

  @Delete(':id/assignUser')
  @ApiOkResponse({ type: UserAssignEntity })
  async removeAssignUser(@Param('id', ParseIntPipe) id: number) {
    return await this.chatbotService.removeAssignUser(id);
  }

  @Put(':id/promitt')
  @ApiOkResponse({ type: ConfigEntity })
  async updateConfig(
    @Param('id', ParseIntPipe) id: number,
    @Body() createChatbotConfigDto: CreateChatbotConfigDto,
  ) {
    return await this.chatbotService.updateConfig(id, createChatbotConfigDto);
  }

  @Put(':id/questio')
  @ApiOkResponse({ type: CounterQuestionEntity })
  async updateCounterQuestion(
    @Param('id', ParseIntPipe) id: number,
    @Body() counterQuestionDto: CounterQuestionDto,
  ) {
    return await this.chatbotService.updateCounterQuestion(
      id,
      counterQuestionDto,
    );
  }

  @Get(':id/getpromittById')
  @ApiOkResponse({ type: ConfigEntity })
  async getpromittById(@Param('id', ParseIntPipe) id: number) {
    return await this.chatbotService.getpromittById(id);
  }

  @Get(':id/getCounterQuestionById')
  @ApiOkResponse({ type: CounterQuestionEntity })
  async getCounterQuestionById(@Param('id', ParseIntPipe) id: number) {
    return await this.chatbotService.getCounterQuestionById(id);
  }
  @Get(':id/chatbotuser')
  @ApiOkResponse({ type: UserAssignEntity })
  @ApiQueryPagination()
  async getChatotAssignUser(
    @Param('id', ParseIntPipe) id: number,
    @Query()
    query: {
      offset?: number;
      limit?: number;
      sort?: string;
      order?: 'asc' | 'desc';
      search?: string;
    },
  ) {
    try {
      const result = await this.chatbotService.getChatotAssignUser({
        id,
        ...query,
      });
      return result;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
