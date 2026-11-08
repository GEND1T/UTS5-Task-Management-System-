import { forwardRef, Module } from '@nestjs/common';
import { ProjectsService } from './projects.service.js';
import { ProjectsController } from './projects.controller.js';
import { TeamsModule } from '../teams/teams.module.js';

@Module({
  imports: [forwardRef(() => TeamsModule)],
  providers: [ProjectsService],
  controllers: [ProjectsController],
})
export class ProjectsModule {}
