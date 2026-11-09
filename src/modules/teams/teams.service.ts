import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamEntity } from './entities/team.entity.js';
import { CreateTeamDto } from './dto/create-team.dto.js';
import { UpdateTeamDto } from './dto/update-team.dto.js';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(TeamEntity)
    private readonly teamRepo: Repository<TeamEntity>,
  ) {}

  async create(dto: CreateTeamDto): Promise<TeamEntity> {
    const existing = await this.teamRepo.findOne({ where: { name: dto.name } });
    if (existing) {
      throw new ConflictException(`Nama tim "${dto.name}" sudah digunakan.`);
    }
    const team = this.teamRepo.create(dto);
    return this.teamRepo.save(team);
  }

  async findAll(): Promise<TeamEntity[]> {
    return this.teamRepo.find({
      relations: {
        members : true, 
        projects : true
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findOneWithRelations(id: string): Promise<TeamEntity> {
    const team = await this.teamRepo.findOne({
      where: { id },
      relations: {
        members : true,
        projects : true
      },
    });
    if (!team) {
      throw new NotFoundException(`Tim dengan ID "${id}" tidak ditemukan.`);
    }
    return team;
  }

  async update(id: string, dto: UpdateTeamDto): Promise<TeamEntity> {
    const team = await this.findOneWithRelations(id);

    if (dto.name && dto.name !== team.name) {
      const nameExists = await this.teamRepo.findOne({
        where: { name: dto.name },
      });
      if (nameExists) {
        throw new ConflictException(`Nama tim "${dto.name}" sudah digunakan.`);
      }
    }

    Object.assign(team, dto);
    return this.teamRepo.save(team);
  }

  async remove(id: string): Promise<{ message: string }> {
    const team = await this.findOneWithRelations(id);

    if (team.members.length > 0 || team.projects.length > 0) {
      throw new ConflictException(
        `Tim "${team.name}" tidak dapat dihapus karena masih memiliki ${team.members.length} anggota dan ${team.projects.length} proyek aktif.`,
      );
    }

    await this.teamRepo.remove(team);
    return { message: `Tim "${team.name}" berhasil dihapus.` };
  }
}