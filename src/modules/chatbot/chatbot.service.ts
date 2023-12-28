/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ForbiddenException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateChatbotDto, CreateGreetingsDto } from './dto/create-chatbot.dto';
import { unlink } from 'fs';
import { customResponseHandler } from 'src/config/helpers';
import {
  CounterQuestionDto,
  CreateChatbotConfigDto,
  UserAssignDto,
} from './dto/ChatbotConfig.dto';
import { EditChatbotDto } from './dto/Edit.Chatbot.dto';
import { Role } from '@prisma/client';
import { async } from 'rxjs';
// import { unlink } from 'fs/promises';

@Injectable()
export class ChatbotService {
  constructor(private prisma: PrismaService) {}
  async create(
    files: Express.Multer.File[],
    createChatbotDto: CreateChatbotDto,
  ) {
    const data: any = {};

    if (files) {
      files.forEach(async (file) => {
        if (file.fieldname === 'icone') {
          data['icone'] = 'Chatbot/icone/' + file.filename;
        } else if (file.fieldname === 'files') {
          data['files'] = data['files'] || [];
          data['files'].push('Chatbot/files/' + file.filename);
        }
      });
    }

    data['isGreetings'] = createChatbotDto.isGreetings;

    if (createChatbotDto.greetingsSMS) {
      data['greetingsSMS'] = data['greetingsSMS'] || [];
      data['greetingsSMS'].push(createChatbotDto.greetingsSMS);
    }
    const greetingsSMSArray = data['greetingsSMS'] || [];
    const config = greetingsSMSArray
      .toString()
      .replace(/[\u0000-\u0019]+/g, '')
      .split(',');
    const response = await this.prisma.chatbot.create({
      data: {
        ...createChatbotDto,
        icone: data['icone'],
        isGreetings: data['isGreetings'],
        files: {
          create: data['files'].map((file) => ({ path: file })),
        },
        greetingsSMS: {
          create: config.map((greeting) => ({
            text: greeting,
          })),
        },
      },
      include: {
        files: true,
        greetingsSMS: true,
      },
    });
    return response;
  }

  async edit(
    chatbotId: number,
    files: Express.Multer.File[],
    editChatbotDto: EditChatbotDto,
  ) {
    const existingChatbot = await this.prisma.chatbot.findUnique({
      where: { id: chatbotId },
      include: {
        files: true,
        greetingsSMS: true,
      },
    });

    if (!existingChatbot) {
      throw new Error(`Chatbot with ID ${chatbotId} not found.`);
    }

    const data: any = {};

    // Handle Icone Update:
    data['icone'] =
      files && files.find((file) => file.fieldname === 'icone')
        ? 'Chatbot/icone/' +
          files.find((file) => file.fieldname === 'icone').filename
        : existingChatbot.icone;

    // Handle GreetingsSMS Update:
    data['greetingsSMS'] =
      editChatbotDto.greetingsSMS !== undefined
        ? editChatbotDto.greetingsSMS.concat(
            existingChatbot.greetingsSMS.map((greeting) => greeting.text),
          )
        : existingChatbot.greetingsSMS.map((greeting) => greeting.text);

    // Handle Files Update:
    const newFiles =
      files && files.length > 0
        ? files
            .filter((file) => file.fieldname === 'files')
            .map((file) => 'Chatbot/files/' + file.filename)
        : [];

    // Process the greetingsSMS array
    const greetingsSMSArray = data['greetingsSMS'] || [];
    const config = greetingsSMSArray
      .toString()
      .replace(/[\u0000-\u0019]+/g, '')
      .split(',');

    const response = await this.prisma.chatbot.update({
      where: { id: chatbotId },
      data: {
        ...editChatbotDto,
        icone: data['icone'],
        files: {
          create: newFiles.map((file) => ({ path: file })),
        },
        greetingsSMS: {
          create: (
            await Promise.all(
              config.map(async (greeting) => {
                const existingGreeting = await this.prisma.greetings.findUnique(
                  {
                    where: { text: greeting },
                  },
                );
                if (!existingGreeting) {
                  return { text: greeting };
                }
                return null;
              }),
            )
          ).filter((greeting) => greeting !== null) as { text: string }[],
        },
      },
    });

    console.log(response);
    return response;
  }

  async findAll({
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
    if (offset < 1) {
      throw new HttpException('Offset/PageNumber must be greater than 0', 500);
    }

    const chatbots = await this.prisma.chatbot.findMany({
      where: {
        OR: [
          {
            name: {
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

    const total = await this.prisma.chatbot.count({
      where: {
        OR: [
          {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
      },
    });

    return {
      data: chatbots,
      meta: {
        page: offset,
        limit,
        total: total,
      },
    };
  }

  async remove(id: number) {
    const existingChatbot = await this.prisma.chatbot.findUnique({
      where: { id },
      include: { files: true },
    });

    if (!existingChatbot) {
      throw new NotFoundException('Chatbot not found');
    }

    const deletedChatbot = await this.prisma.chatbot.delete({
      where: { id },
      include: {
        files: true,
      },
    });

    if (deletedChatbot.icone) {
      unlink(`public/${deletedChatbot.icone}`, (err) => {
        if (err) {
          console.error(`Error deleting file: ${err.message}`);
        } else {
          console.log(`File deleted: ${deletedChatbot.icone}`);
        }
      });
    }
    return customResponseHandler(
      'Chatbot deleted successfully',
      deletedChatbot,
    );
  }
  //get by id
  async findOne(id: number) {
    const chatbot = await this.prisma.chatbot.findUnique({
      where: {
        id,
      },
      include: {
        files: true,
        greetingsSMS: true,
      },
    });

    if (!chatbot) {
      throw new NotFoundException(`Chatbot with ID ${id} not found`);
    }

    return chatbot;
  }
  async createChatbotConfig(
    id: number,
    createChatbotConfigDto: CreateChatbotConfigDto,
  ) {
    try {
      const response = await this.prisma.chatbotConfig.create({
        data: {
          ...createChatbotConfigDto,
          chatbot: {
            connect: {
              id,
            },
          },
        },
      });
      const chatbotWithConfig = await this.prisma.chatbot.findUnique({
        where: {
          id,
        },
        include: {
          chatbotConfigs: true,
        },
      });

      return chatbotWithConfig;
    } catch (error) {
      console.error('Error creating ChatbotConfig:', error);
      throw new Error('Failed to create ChatbotConfig');
    }
  }

  //create CounterQuestion
  async createCounterQuestion(
    id: number,
    counterQuestionDto: CounterQuestionDto,
  ) {
    try {
      const response = await this.prisma.counterQuestion.create({
        data: {
          ...counterQuestionDto,
          chatbot: {
            connect: {
              id,
            },
          },
        },
      });

      const chatbotWithConfigg = await this.prisma.chatbot.findUnique({
        where: {
          id,
        },
        include: {
          counterQuestions: true,
        },
      });

      return chatbotWithConfigg;
    } catch (error) {
      console.error('Error creating ChatbotConfig:', error);
      throw new Error('Failed to create ChatbotConfig');
    }
  }
  async assignUser(id: number, userAssignDto: UserAssignDto) {
    try {
      const response = await this.prisma.userChatbotAssignment.create({
        data: {
          // ...userAssignDto,
          chatbot: {
            connect: {
              id,
            },
          },
          user: {
            connect: {
              email: userAssignDto.userEmail,
            },
          },
        },
      });

      const chatbotWithAssignments = await this.prisma.chatbot.findUnique({
        where: {
          id,
        },
        include: {
          assignments: true,
        },
      });

      return chatbotWithAssignments;
    } catch (error) {
      console.error('Error creating ChatbotConfig:', error);
      throw new Error('Failed to create ChatbotConfig');
    }
  }

  async getChatbotConfig({
    id,
    offset = 1,
    limit = 10,
    sort = 'id',
    order = 'asc',
    search = '',
  }: {
    id: number;
    offset?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    search?: string;
  }) {
    if (offset < 1) {
      throw new HttpException('Offset/PageNumber must be greater than 0', 500);
    }

    const chatbotWithConfig = await this.prisma.chatbotConfig.findMany({
      where: {
        chatbotId: id,
      },
      // include: {
      //   chatbot: true,
      // },
      skip: (offset - 1) * limit,
      take: +limit,
      orderBy: {
        [sort]: order,
      },
    });
    const total = await this.prisma.chatbotConfig.count({
      where: {
        chatbotId: id,
        OR: [
          {
            PromptInput: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            PromptOutput: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
      },
    });
    if (!chatbotWithConfig) {
      throw new NotFoundException(`Chatbot with ID ${id} not found`);
    }
    return {
      data: chatbotWithConfig,
      meta: {
        page: offset,
        limit,
        total: total,
      },
    };
  }

  async getcounterquestion({
    id,
    offset = 1,
    limit = 10,
    sort = 'id',
    order = 'asc',
    search = '',
  }: {
    id: number;
    offset?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    search?: string;
  }) {
    if (offset < 1) {
      throw new HttpException('Offset/PageNumber must be greater than 0', 500);
    }

    const chatbotWithConfig = await this.prisma.counterQuestion.findMany({
      where: {
        chatbotId: id,
      },
      // include: {
      //   chatbot: true,
      // },
      skip: (offset - 1) * limit,
      take: +limit,
      orderBy: {
        [sort]: order,
      },
    });
    const total = await this.prisma.counterQuestion.count({
      where: {
        chatbotId: id,
        OR: [
          {
            text: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
      },
    });
    if (!chatbotWithConfig) {
      throw new NotFoundException(`Chatbot with ID ${id} not found`);
    }
    return {
      data: chatbotWithConfig,
      meta: {
        page: offset,
        limit,
        total: total,
      },
    };
  }

  async removeConfig(id: number) {
    const existingChatbotConfig = await this.prisma.chatbotConfig.findUnique({
      where: { id },
    });

    if (!existingChatbotConfig) {
      throw new NotFoundException('ChatbotConfig not found');
    }

    const deletedChatbotConfig = await this.prisma.chatbotConfig.delete({
      where: { id },
    });

    return customResponseHandler(
      'ChatbotConfig deleted successfully',
      deletedChatbotConfig,
    );
  }

  async removeCounterQuestion(id: number) {
    const existingCounterQuestion =
      await this.prisma.counterQuestion.findUnique({
        where: { id },
      });

    if (!existingCounterQuestion) {
      throw new NotFoundException('CounterQuestion not found');
    }

    const deletedCounterQuestion = await this.prisma.counterQuestion.delete({
      where: { id },
    });

    return customResponseHandler(
      'CounterQuestion deleted successfully',
      deletedCounterQuestion,
    );
  }

  async updateConfig(
    id: number,
    createChatbotConfigDto: CreateChatbotConfigDto,
  ) {
    const existingChatbotConfig = await this.prisma.chatbotConfig.findUnique({
      where: { id },
    });

    if (!existingChatbotConfig) {
      throw new NotFoundException('ChatbotConfig not found');
    }

    const updatedChatbotConfig = await this.prisma.chatbotConfig.update({
      where: { id },
      data: createChatbotConfigDto,
    });

    return customResponseHandler(
      'ChatbotConfig updated successfully',
      updatedChatbotConfig,
    );
  }

  async updateCounterQuestion(
    id: number,
    counterQuestionDto: CounterQuestionDto,
  ) {
    const existingCounterQuestion =
      await this.prisma.counterQuestion.findUnique({
        where: { id },
      });

    if (!existingCounterQuestion) {
      throw new NotFoundException('CounterQuestion not found');
    }

    const updatedCounterQuestion = await this.prisma.counterQuestion.update({
      where: { id },
      data: counterQuestionDto,
    });

    return customResponseHandler(
      'CounterQuestion updated successfully',
      updatedCounterQuestion,
    );
  }

  async getpromittById(id: number) {
    const chatbotWithConfig = await this.prisma.chatbotConfig.findUnique({
      where: {
        id,
      },
      // include: {
      //   chatbot: true,
      // },
    });

    if (!chatbotWithConfig) {
      throw new NotFoundException(`Chatbot with ID ${id} not found`);
    }

    return chatbotWithConfig;
  }

  async getCounterQuestionById(id: number) {
    const chatbotWithConfig = await this.prisma.counterQuestion.findUnique({
      where: {
        id,
      },
      // include: {
      //   chatbot: true,
      // },
    });

    if (!chatbotWithConfig) {
      throw new NotFoundException(`Chatbot with ID ${id} not found`);
    }

    return chatbotWithConfig;
  }

  async getChatotAssignUser({
    id,
    offset = 1,
    limit = 10,
    sort = 'id',
    order = 'asc',
    search = '',
  }: {
    id: number;
    offset?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    search?: string;
  }) {
    if (offset < 1) {
      throw new HttpException('Offset/PageNumber must be greater than 0', 500);
    }

    const chatbotWithuser = await this.prisma.userChatbotAssignment.findMany({
      where: {
        chatbotId: id,
      },
      skip: (offset - 1) * limit,
      take: +limit,
      orderBy: {
        [sort]: order,
      },
    });
    const total = await this.prisma.userChatbotAssignment.count({
      where: {
        chatbotId: id,
        OR: [
          {
            userEmail: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            userEmail: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
      },
    });
    if (!chatbotWithuser) {
      throw new NotFoundException(`Chatbot with ID ${id} not found`);
    }
    return {
      data: chatbotWithuser,
      meta: {
        page: offset,
        limit,
        total: total,
      },
    };
  }
  async removeAssignUser(id: number) {
    const existingAssignUser =
      await this.prisma.userChatbotAssignment.findUnique({
        where: { id },
      });

    if (!existingAssignUser) {
      throw new NotFoundException('AssignUser not found');
    }

    const deletedAssignUser = await this.prisma.userChatbotAssignment.delete({
      where: { id },
    });

    return customResponseHandler(
      'AssignUser deleted successfully',
      deletedAssignUser,
    );
  }
}
