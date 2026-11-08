import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamsService } from './teams.service.js';
import { TeamsController } from './teams.controller.js';
import { ProjectsModule } from '../projects/projects.module.js';
import { TeamEntity } from './entities/team.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([TeamEntity]), forwardRef(() => ProjectsModule)],
  providers: [TeamsService],
  controllers: [TeamsController],
  exports: [TeamsService],
})
export class TeamsModule {}
