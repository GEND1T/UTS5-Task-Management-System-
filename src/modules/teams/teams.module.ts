import { forwardRef, Module } from '@nestjs/common';
import { TeamsService } from './teams.service.js';
import { TeamsController } from './teams.controller.js';
import { ProjectsModule } from '../projects/projects.module.js';

@Module({
  imports: [forwardRef(() => ProjectsModule)],
  providers: [TeamsService],
  controllers: [TeamsController],
  exports: [TeamsService]
})
export class TeamsModule {}
