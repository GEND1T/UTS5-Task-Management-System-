import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskEntity } from './entities/task.entity.js';
import { TaskAssignmentEntity } from './entities/task-assignment.entity.js';
import { ProjectEntity } from '../projects/entities/project.entity.js';
import { MemberEntity } from '../members/entities/member.entity.js';
import { TasksController } from './tasks.controller.js';
import { TasksService } from './tasks.service.js';

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
  exports:[TasksService],
})
export class TasksModule {}