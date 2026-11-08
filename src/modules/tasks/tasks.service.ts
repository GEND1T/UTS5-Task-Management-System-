import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { TaskEntity, TaskStatus } from './entities/task.entity.js';
import { TaskAssignmentEntity } from './entities/task-assignment.entity.js';
import { ProjectEntity, ProjectStatus } from '../projects/entities/project.entity.js';
import { MemberEntity } from '../members/entities/member.entity.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { AssignMembersDto } from './dto/assign-members.dto.js';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto.js';

@Injectable()
export class TasksService {}
