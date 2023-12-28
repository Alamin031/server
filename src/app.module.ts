import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';

import { AssetModule } from './modules/asset/asset.module';
import { CustomerModule } from './modules/customers/customer.module';
import { ChatbotModule } from './modules/chatbot/chatbot.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveStaticOptions: { index: false },
    }),

    PrismaModule,
    AuthModule,
    UsersModule,

    AssetModule,
    CustomerModule,
    ChatbotModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
