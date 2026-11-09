import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksController } from './tasks.controller.js';
import { TasksService } from './tasks.service.js';
import { TaskEntity } from './entities/task.entity.js';
import { TaskAssignmentEntity } from './entities/task-assignment.entity.js';
import { ProjectEntity } from '../projects/entities/project.entity.js';
import { MemberEntity } from '../members/entities/member.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TaskEntity,
      TaskAssignmentEntity,
      ProjectEntity,
      MemberEntity,
    ]),
  ],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}