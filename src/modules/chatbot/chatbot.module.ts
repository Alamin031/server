import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';

@Module({
  // imports: [MulterModule.register(multerOptions)],
  controllers: [ChatbotController],
  providers: [ChatbotService, PrismaService],
})
export class ChatbotModule {}
