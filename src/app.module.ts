import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { TeamsModule } from './modules/teams/teams.module.js';
import { MembersModule } from './modules/members/members.module.js';
import { ProjectsModule } from './modules/projects/projects.module.js';
import { TasksModule } from './modules/tasks/tasks.module.js';


@Module({
  imports: [TeamsModule, MembersModule, ProjectsModule, TasksModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
