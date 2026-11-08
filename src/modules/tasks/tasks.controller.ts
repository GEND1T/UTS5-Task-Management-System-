import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  ParseUUIDPipe,
} from '@nestjs/common';
import { TasksService } from './tasks.service.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto.js';
import { AssignMembersDto } from './dto/assign-members.dto.js';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Body() dto: CreateTaskDto) {
    return this.tasksService.createTask(dto);
  }

  @Get(':id')
  getDetail(@Param('id', ParseUUIDPipe) id: string) {
    return this.tasksService.getTaskDetail(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTaskStatusDto,
  ) {
    return this.tasksService.updateStatus(id, dto);
  }

  @Post(':id/assignments')
  assignMembers(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignMembersDto,
  ) {
    return this.tasksService.assignMembers(id, dto);
  }

  @Delete(':id/assignments/:memberId')
  removeAssignment(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('memberId', ParseUUIDPipe) memberId: string,
  ) {
    return this.tasksService.removeAssignment(id, memberId);
  }
}