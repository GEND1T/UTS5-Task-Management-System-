import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { TasksService } from './tasks.service.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto.js';
import { AssignMembersDto } from './dto/assign-members.dto.js';
import { UpdateAssignmentNoteDto } from './dto/update-assignment-note.dto.js';
import { TaskPriority, TaskStatus } from './entities/task.entity.js';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Body() dto: CreateTaskDto) {
    return this.tasksService.createTask(dto);
  }

  @Get()
  findAll(
    @Query('projectId') projectId?: string,
    @Query('status') status?: TaskStatus,
    @Query('priority') priority?: TaskPriority,
  ) {
    return this.tasksService.findAll({ projectId, status, priority });
  }

  @Get(':id')
  getDetail(@Param('id', ParseUUIDPipe) id: string) {
    return this.tasksService.getTaskDetail(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.updateTask(id, dto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTaskStatusDto,
  ) {
    return this.tasksService.updateStatus(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.tasksService.removeTask(id);
  }

  @Post(':id/assignments')
  assignMembers(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignMembersDto,
  ) {
    return this.tasksService.assignMembers(id, dto);
  }

  @Patch(':id/assignments/:memberId')
  updateAssignmentNote(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('memberId', ParseUUIDPipe) memberId: string,
    @Body() dto: UpdateAssignmentNoteDto,
  ) {
    return this.tasksService.updateAssignmentNote(id, memberId, dto);
  }

  @Delete(':id/assignments/:memberId')
  removeAssignment(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('memberId', ParseUUIDPipe) memberId: string,
  ) {
    return this.tasksService.removeAssignment(id, memberId);
  }
}