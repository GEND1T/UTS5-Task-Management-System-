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
import { AssignMembersDto } from './dto/assign-members.dto.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto.js';


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

  // FITUR 2 & 3: Membuat tugas dengan validasi status proyek & rentang due_date
  async createTask(dto: CreateTaskDto): Promise<TaskEntity> {
    const project = await this.projectRepo.findOne({ where: { id: dto.projectId } });
    if (!project) throw new NotFoundException('Proyek tidak ditemukan.');

    if (
      project.status === ProjectStatus.COMPLETED ||
      project.status === ProjectStatus.ARCHIVED
    ) {
      throw new BadRequestException(
        `Tidak dapat membuat tugas baru pada proyek berstatus ${project.status}.`,
      );
    }

    const due = new Date(dto.dueDate);
    const start = new Date(project.startDate);
    const end = new Date(project.endDate);
    end.setHours(23, 59, 59, 999);

    if (due < start || due > end) {
      throw new BadRequestException(
        `Tenggat waktu tugas harus berada dalam rentang proyek (${project.startDate} s/d ${project.endDate}).`,
      );
    }

    const task = this.taskRepo.create({
      ...dto,
      dueDate: due,
    });
    return this.taskRepo.save(task);
  }

  // FITUR 4: Menugaskan satu atau beberapa anggota dengan validasi aturan bisnis
  async assignMembers(taskId: string, dto: AssignMembersDto): Promise<TaskEntity> {
    const task = await this.taskRepo.findOne({
      where: { id: taskId },
      relations: {
        project : true,
        assignments: true},
    });
    if (!task) throw new NotFoundException('Tugas tidak ditemukan.');

    // Aturan 1: Tugas DONE atau CANCELLED terkunci dari perubahan penugasan
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

    // Aturan 2 & 3: Anggota harus aktif dan berasal dari tim yang sama dengan pemilik proyek
    for (const member of members) {
      if (!member.isActive) {
        throw new BadRequestException(`Anggota "${member.name}" sedang berstatus nonaktif.`);
      }
      if (member.teamId !== task.project.teamId) {
        throw new BadRequestException(
          `Anggota "${member.name}" bukan bagian dari tim yang mengelola proyek ini.`,
        );
      }
    }

    // Aturan 4: Cegah duplikasi penugasan pada tugas yang sama
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

  // FITUR 3: Mengatur status tugas dengan State Machine & syarat minimal 1 assignee
  async updateStatus(taskId: string, dto: UpdateTaskStatusDto): Promise<TaskEntity> {
    const task = await this.taskRepo.findOne({
      where: { id: taskId },
      relations: {
        assignments: true
      },
    });
    if (!task) throw new NotFoundException('Tugas tidak ditemukan.');

    const allowedTransitions: Record<TaskStatus, TaskStatus[]> = {
      [TaskStatus.TODO]: [TaskStatus.IN_PROGRESS, TaskStatus.CANCELLED],
      [TaskStatus.IN_PROGRESS]: [TaskStatus.IN_REVIEW, TaskStatus.TODO, TaskStatus.CANCELLED],
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
    if (dto.status === TaskStatus.DONE) {
      task.completedAt = new Date();
    }

    await this.taskRepo.save(task);
    return this.getTaskDetail(task.id);
  }

  // FITUR 5: Menampilkan detail tugas beserta daftar anggota yang ditugaskan
  async getTaskDetail(taskId: string): Promise<TaskEntity> {
    const task = await this.taskRepo.findOne({
      where: { id: taskId },
      relations: {
        project: true,
        assignments: {
            member: true // Ini otomatis me-load 'assignments' dan 'assignments.member'
            }
        },
    });
    if (!task) throw new NotFoundException('Tugas tidak ditemukan.');
    return task;
  }

  async removeAssignment(taskId: string, memberId: string): Promise<void> {
    const assignment = await this.assignmentRepo.findOne({
      where: { taskId, memberId },
    });
    if (!assignment) {
      throw new NotFoundException('Data penugasan anggota tidak ditemukan pada tugas ini.');
    }
    await this.assignmentRepo.remove(assignment);
  }
}