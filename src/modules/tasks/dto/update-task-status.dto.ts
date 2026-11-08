import { IsEnum, IsNotEmpty } from 'class-validator';
import { TaskStatus } from '../entities/task.entity.js';

export class UpdateTaskStatusDto {
  @IsEnum(TaskStatus, { message: 'Status tugas tidak valid.' })
  @IsNotEmpty({ message: 'Status tugas wajib diisi.' })
  status: TaskStatus;
}