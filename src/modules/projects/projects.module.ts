import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsService } from './projects.service.js';
import { ProjectsController } from './projects.controller.js';
import { TeamsModule } from '../teams/teams.module.js';
import { ProjectEntity } from './entities/project.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectEntity]), forwardRef(() => TeamsModule)],
  providers: [ProjectsService],
  controllers: [ProjectsController],
})
export class ProjectsModule {}
