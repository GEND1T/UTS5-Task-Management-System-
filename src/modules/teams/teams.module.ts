import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamsService } from './teams.service.js';
import { TeamsController } from './teams.controller.js';
import { TeamEntity } from './entities/team.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([TeamEntity])],
  providers: [TeamsService],
  controllers: [TeamsController],
  exports: [TeamsService],
})
export class TeamsModule {}
