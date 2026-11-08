import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { TeamsModule } from './modules/teams/teams.module.js';

@Module({
  imports: [TeamsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
