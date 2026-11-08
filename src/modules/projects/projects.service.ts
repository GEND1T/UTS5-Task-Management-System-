import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectEntity } from './entities/project.entity.js';
import { TeamsService } from '../teams/teams.service.js';
import { CreateProjectDto } from './dto/create-project.dto.js';

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
      throw new BadRequestException('Tanggal selesai proyek tidak boleh mendahului tanggal mulai.');
    }
    const project = this.projectRepo.create(dto);
    return this.projectRepo.save(project);
  }

  async findOne(id: string): Promise<ProjectEntity> {
    const project = await this.projectRepo.findOne({
      where: { id },
      relations: {
        team: true,
        tasks: true},
    });
    if (!project) throw new NotFoundException('Proyek tidak ditemukan.');
    return project;
  }
}