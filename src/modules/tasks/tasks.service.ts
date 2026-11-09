import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { TaskEntity, TaskPriority, TaskStatus } from './entities/task.entity.js';
import { TaskAssignmentEntity } from './entities/task-assignment.entity.js';
import { ProjectEntity, ProjectStatus } from '../projects/entities/project.entity.js';
import { MemberEntity } from '../members/entities/member.entity.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto.js';
import { AssignMembersDto } from './dto/assign-members.dto.js';
import { UpdateAssignmentNoteDto } from './dto/update-assignment-note.dto.js';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TaskEntity)
    private readonly taskRepo: Repository<TaskEntity>,
    @InjectRepository(TaskAssignmentEntity)
    private readonly assignmentRepo: Repository<TaskAssignmentEntity>,
    @InjectRepository(ProjectEntity)
    private readonly projectRepo: Repository<ProjectEntity>,
    @InjectRepository(MemberEntity)
    private readonly memberRepo: Repository<MemberEntity>,
  ) {}

  private validateDueDateAgainstProject(dueDateStr: string, project: ProjectEntity): Date {
    const due = new Date(dueDateStr);
    const start = new Date(project.startDate);
    const end = new Date(project.endDate);
    end.setHours(23, 59, 59, 999);

    if (due < start || due > end) {
      throw new BadRequestException(
        `Tenggat waktu tugas harus berada dalam rentang waktu proyek (${project.startDate} s/d ${project.endDate}).`,
      );
    }
    return due;
  }

  private ensureProjectIsMutable(project: ProjectEntity): void {
    if (
      project.status === ProjectStatus.COMPLETED ||
      project.status === ProjectStatus.ARCHIVED
    ) {
      throw new BadRequestException(
        `Operasi ditolak karena proyek induk berstatus ${project.status}.`,
      );
    }
  }

  async createTask(dto: CreateTaskDto): Promise<TaskEntity> {
    const project = await this.projectRepo.findOne({
      where: { id: dto.projectId },
    });
    if (!project) {
      throw new NotFoundException(`Proyek dengan ID "${dto.projectId}" tidak ditemukan.`);
    }

    this.ensureProjectIsMutable(project);
    const due = this.validateDueDateAgainstProject(dto.dueDate, project);

    const task = this.taskRepo.create({
      ...dto,
      dueDate: due,
    });
    return this.taskRepo.save(task);
  }

  async findAll(filters: {
    projectId?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
  }): Promise<TaskEntity[]> {
    return this.taskRepo.find({
      where: {
        ...(filters.projectId ? { projectId: filters.projectId } : {}),
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.priority ? { priority: filters.priority } : {}),
      },
      relations: {
        project : true, 
        assignments : {
          member : true
        }
      },
      order: { dueDate: 'ASC' },
    });
  }

  async getTaskDetail(taskId: string): Promise<TaskEntity> {
    const task = await this.taskRepo.findOne({
      where: { id: taskId },
      relations: {
        project : true, 
        assignments : {
          member : true
        }
      },
    });
    if (!task) {
      throw new NotFoundException(`Tugas dengan ID "${taskId}" tidak ditemukan.`);
    }
    return task;
  }

  async updateTask(taskId: string, dto: UpdateTaskDto): Promise<TaskEntity> {
    const task = await this.getTaskDetail(taskId);

    this.ensureProjectIsMutable(task.project);

    if (task.status === TaskStatus.DONE || task.status === TaskStatus.CANCELLED) {
      throw new BadRequestException(
        `Detail tugas tidak dapat diubah karena status tugas sudah ${task.status}.`,
      );
    }

    if (dto.dueDate) {
      task.dueDate = this.validateDueDateAgainstProject(dto.dueDate, task.project);
    }
    if (dto.title !== undefined) task.title = dto.title;
    if (dto.description !== undefined) task.description = dto.description;
    if (dto.priority !== undefined) task.priority = dto.priority;

    await this.taskRepo.save(task);
    return this.getTaskDetail(task.id);
  }

  async updateStatus(taskId: string, dto: UpdateTaskStatusDto): Promise<TaskEntity> {
    const task = await this.getTaskDetail(taskId);

    this.ensureProjectIsMutable(task.project);

    const allowedTransitions: Record<TaskStatus, TaskStatus[]> = {
      [TaskStatus.TODO]: [TaskStatus.IN_PROGRESS, TaskStatus.CANCELLED],
      [TaskStatus.IN_PROGRESS]: [
        TaskStatus.IN_REVIEW,
        TaskStatus.TODO,
        TaskStatus.CANCELLED,
      ],
      [TaskStatus.IN_REVIEW]: [TaskStatus.DONE, TaskStatus.IN_PROGRESS],
      [TaskStatus.DONE]: [],
      [TaskStatus.CANCELLED]: [],
    };

    if (!allowedTransitions[task.status].includes(dto.status)) {
      throw new BadRequestException(
        `Transisi status dari ${task.status} ke ${dto.status} tidak diizinkan.`,
      );
    }

    const requiresAssignee = [
      TaskStatus.IN_PROGRESS,
      TaskStatus.IN_REVIEW,
      TaskStatus.DONE,
    ];
    if (requiresAssignee.includes(dto.status) && task.assignments.length === 0) {
      throw new BadRequestException(
        `Tugas wajib memiliki minimal 1 anggota yang ditugaskan sebelum diubah ke ${dto.status}.`,
      );
    }

    task.status = dto.status;
    task.completedAt = dto.status === TaskStatus.DONE ? new Date() : null;

    await this.taskRepo.save(task);
    return this.getTaskDetail(task.id);
  }

  async removeTask(taskId: string): Promise<{ message: string }> {
    const task = await this.getTaskDetail(taskId);

    if (
      task.status === TaskStatus.IN_PROGRESS ||
      task.status === TaskStatus.IN_REVIEW
    ) {
      throw new ConflictException(
        `Tugas "${task.title}" sedang dikerjakan (${task.status}) dan tidak dapat dihapus. Ubah status ke TODO atau CANCELLED terlebih dahulu.`,
      );
    }

    await this.taskRepo.remove(task);
    return { message: `Tugas "${task.title}" berhasil dihapus.` };
  }

  async assignMembers(taskId: string, dto: AssignMembersDto): Promise<TaskEntity> {
    const task = await this.getTaskDetail(taskId);

    this.ensureProjectIsMutable(task.project);

    if (task.status === TaskStatus.DONE || task.status === TaskStatus.CANCELLED) {
      throw new BadRequestException(
        `Penugasan tidak dapat diubah karena status tugas sudah ${task.status}.`,
      );
    }

    const uniqueMemberIds = [...new Set(dto.memberIds)];
    const members = await this.memberRepo.find({
      where: { id: In(uniqueMemberIds) },
    });

    if (members.length !== uniqueMemberIds.length) {
      throw new NotFoundException('Satu atau lebih ID anggota tidak ditemukan.');
    }

    for (const member of members) {
      if (!member.isActive) {
        throw new BadRequestException(
          `Anggota "${member.name}" sedang berstatus nonaktif.`,
        );
      }
      if (member.teamId !== task.project.teamId) {
        throw new BadRequestException(
          `Anggota "${member.name}" bukan bagian dari tim pemilik proyek ini.`,
        );
      }
    }

    const existingMemberIds = new Set(task.assignments.map((a) => a.memberId));
    const newAssignments = uniqueMemberIds
      .filter((memberId) => !existingMemberIds.has(memberId))
      .map((memberId) =>
        this.assignmentRepo.create({
          taskId: task.id,
          memberId,
          notes: dto.notes,
        }),
      );

    if (newAssignments.length > 0) {
      await this.assignmentRepo.save(newAssignments);
    }

    return this.getTaskDetail(task.id);
  }

  async updateAssignmentNote(
    taskId: string,
    memberId: string,
    dto: UpdateAssignmentNoteDto,
  ): Promise<TaskAssignmentEntity> {
    const assignment = await this.assignmentRepo.findOne({
      where: { taskId, memberId },
      relations: {
        member : true, 
        task : true},
    });
    if (!assignment) {
      throw new NotFoundException(
        'Data penugasan anggota pada tugas ini tidak ditemukan.',
      );
    }

    assignment.notes = dto.notes;
    return this.assignmentRepo.save(assignment);
  }

  async removeAssignment(
    taskId: string,
    memberId: string,
  ): Promise<{ message: string }> {
    const task = await this.getTaskDetail(taskId);

    if (task.status === TaskStatus.DONE || task.status === TaskStatus.CANCELLED) {
      throw new BadRequestException(
        `Tidak dapat mencabut penugasan pada tugas yang sudah berstatus ${task.status}.`,
      );
    }

    const assignment = task.assignments.find((a) => a.memberId === memberId);
    if (!assignment) {
      throw new NotFoundException(
        'Anggota tersebut tidak terdaftar pada penugasan tugas ini.',
      );
    }

    // Edge case: Cegah pencabutan anggota terakhir saat tugas sedang IN_PROGRESS / IN_REVIEW
    const isTaskRunning =
      task.status === TaskStatus.IN_PROGRESS ||
      task.status === TaskStatus.IN_REVIEW;

    if (isTaskRunning && task.assignments.length <= 1) {
      throw new BadRequestException(
        `Tidak dapat mencabut anggota terakhir ketika tugas berstatus ${task.status}. Tugaskan anggota pengganti terlebih dahulu atau kembalikan status tugas ke TODO.`,
      );
    }

    await this.assignmentRepo.remove(assignment);
    return {
      message: `Penugasan anggota berhasil dicabut dari tugas "${task.title}".`,
    };
  }
}