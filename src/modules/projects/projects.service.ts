import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectEntity, ProjectStatus } from './entities/project.entity.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import { TeamsService } from '../teams/teams.service.js';
import { TaskStatus } from '../tasks/entities/task.entity.js';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(ProjectEntity)
    private readonly projectRepo: Repository<ProjectEntity>,
    private readonly teamsService: TeamsService,
  ) {}

  async create(dto: CreateProjectDto): Promise<ProjectEntity> {
    await this.teamsService.findOneWithRelations(dto.teamId);

    if (new Date(dto.endDate) < new Date(dto.startDate)) {
      throw new BadRequestException(
        'Tanggal selesai proyek tidak boleh mendahului tanggal mulai.',
      );
    }

    const project = this.projectRepo.create(dto);
    return this.projectRepo.save(project);
  }

  async findAll(filters: {
    teamId?: string;
    status?: ProjectStatus;
  }): Promise<ProjectEntity[]> {
    return this.projectRepo.find({
      where: {
        ...(filters.teamId ? { teamId: filters.teamId } : {}),
        ...(filters.status ? { status: filters.status } : {}),
      },
      relations: {
        team : true, 
        tasks : true
      },
      order: { createdAt: 'DESC' },
    }); 
  }

  async findOne(id: string): Promise<ProjectEntity> {
    const project = await this.projectRepo.findOne({
      where: { id },
      relations: {
        team : true, 
        tasks: {
          assignments: {
            member: true
          }
        }
      },
    });
    if (!project) {
      throw new NotFoundException(`Proyek dengan ID "${id}" tidak ditemukan.`);
    }
    return project;
  }

  async update(id: string, dto: UpdateProjectDto): Promise<ProjectEntity> {
    const project = await this.findOne(id);

    const newStartStr = dto.startDate ?? project.startDate;
    const newEndStr = dto.endDate ?? project.endDate;
    const newStart = new Date(newStartStr);
    const newEnd = new Date(newEndStr);
    newEnd.setHours(23, 59, 59, 999);

    if (newEnd < newStart) {
      throw new BadRequestException(
        'Tanggal selesai proyek tidak boleh mendahului tanggal mulai.',
      );
    }

    // Edge case 1: Pastikan perubahan tanggal proyek tidak membuat dueDate tugas keluar jalur
    if (dto.startDate || dto.endDate) {
      for (const task of project.tasks) {
        const taskDue = new Date(task.dueDate);
        if (taskDue < newStart || taskDue > newEnd) {
          throw new BadRequestException(
            `Rentang tanggal proyek tidak dapat diubah karena tugas "${task.title}" memiliki tenggat waktu (${taskDue.toISOString().split('T')[0]}) di luar rentang baru (${newStartStr} s/d ${newEndStr}).`,
          );
        }
      }
    }

    // Edge case 2: Proyek tidak boleh COMPLETED jika masih ada tugas yang belum DONE / CANCELLED
    if (dto.status === ProjectStatus.COMPLETED) {
      const unfinishedTasks = project.tasks.filter(
        (t) =>
          t.status !== TaskStatus.DONE && t.status !== TaskStatus.CANCELLED,
      );
      if (unfinishedTasks.length > 0) {
        throw new BadRequestException(
          `Proyek tidak dapat diubah menjadi COMPLETED karena masih terdapat ${unfinishedTasks.length} tugas yang belum selesai.`,
        );
      }
    }

    Object.assign(project, dto);
    return this.projectRepo.save(project);
  }

  async remove(id: string): Promise<{ message: string }> {
    const project = await this.findOne(id);

    const hasActiveOrDoneTasks = project.tasks.some(
      (t) =>
        t.status === TaskStatus.IN_PROGRESS ||
        t.status === TaskStatus.IN_REVIEW ||
        t.status === TaskStatus.DONE,
    );

    if (hasActiveOrDoneTasks) {
      throw new ConflictException(
        `Proyek "${project.name}" tidak dapat dihapus karena memiliki tugas yang sedang dikerjakan atau sudah selesai. Ubah status proyek menjadi ARCHIVED sebagai gantinya.`,
      );
    }

    await this.projectRepo.remove(project);
    return { message: `Proyek "${project.name}" beserta draf tugas di dalamnya berhasil dihapus.` };
  }
}