// src/modules/teams/teams.service.ts
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamEntity } from './entities/team.entity.js';
import { CreateTeamDto } from './dto/create-team.dto.js';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(TeamEntity)
    private readonly teamRepo: Repository<TeamEntity>,
  ) {}

  async create(dto: CreateTeamDto): Promise<TeamEntity> {
    const existing = await this.teamRepo.findOne({ where: { name: dto.name } });
    if (existing) throw new ConflictException('Nama tim sudah digunakan.');
    const team = this.teamRepo.create(dto);
    return this.teamRepo.save(team);
  }

//   async findOneWithRelations(id: string): Promise<TeamEntity> {
//     const team = await this.teamRepo.findOne({
//       where: { id },
//       relations: ['members', 'projects'],
//     });
//     if (!team) throw new NotFoundException('Tim tidak ditemukan.');
//     return team;
//   }
}