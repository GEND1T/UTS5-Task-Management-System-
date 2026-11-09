import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MemberEntity } from './entities/member.entity.js';
import { CreateMemberDto } from './dto/create-member.dto.js';
import { UpdateMemberDto } from './dto/update-member.dto.js';
import { TeamsService } from '../teams/teams.service.js';
import { TaskStatus } from '../tasks/entities/task.entity.js';

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(MemberEntity)
    private readonly memberRepo: Repository<MemberEntity>,
    private readonly teamsService: TeamsService,
  ) {}

  async create(dto: CreateMemberDto): Promise<MemberEntity> {
    await this.teamsService.findOneWithRelations(dto.teamId);

    const emailExists = await this.memberRepo.findOne({
      where: { email: dto.email },
    });
    if (emailExists) {
      throw new ConflictException(`Email "${dto.email}" sudah terdaftar.`);
    }

    const member = this.memberRepo.create(dto);
    return this.memberRepo.save(member);
  }

  async findAll(filters: {
    teamId?: string;
    isActive?: string;
  }): Promise<MemberEntity[]> {
    const whereClause: Record<string, unknown> = {};

    if (filters.teamId) {
      whereClause.teamId = filters.teamId;
    }
    if (filters.isActive !== undefined) {
      whereClause.isActive = filters.isActive === 'true';
    }

    return this.memberRepo.find({
      where: whereClause,
      relations: {
        team : true,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<MemberEntity> {
    const member = await this.memberRepo.findOne({
      where: { id },
      relations: {
        team : true,
        assignments : {
          task : true
        } 
      },
    });
    if (!member) {
      throw new NotFoundException(`Anggota dengan ID "${id}" tidak ditemukan.`);
    }
    return member;
  }

  async update(id: string, dto: UpdateMemberDto): Promise<MemberEntity> {
    const member = await this.findOne(id);

    if (dto.email && dto.email !== member.email) {
      const emailExists = await this.memberRepo.findOne({
        where: { email: dto.email },
      });
      if (emailExists) {
        throw new ConflictException(`Email "${dto.email}" sudah digunakan.`);
      }
    }

    Object.assign(member, dto);
    return this.memberRepo.save(member);
  }

  async toggleActiveStatus(id: string, isActive: boolean): Promise<MemberEntity> {
    const member = await this.memberRepo.findOne({
      where: { id },
      relations: {
        assignments : {
          task : {
            assignments : true
          }, 
        }, 
      },
    });
    if (!member) {
      throw new NotFoundException(`Anggota dengan ID "${id}" tidak ditemukan.`);
    }

    // Edge case: Cegah penonaktifan jika anggota adalah satu-satunya assignee di tugas aktif
    if (!isActive) {
      for (const assignment of member.assignments) {
        const task = assignment.task;
        const isTaskRunning =
          task.status === TaskStatus.IN_PROGRESS ||
          task.status === TaskStatus.IN_REVIEW;

        if (isTaskRunning && task.assignments.length <= 1) {
          throw new BadRequestException(
            `Anggota "${member.name}" tidak dapat dinonaktifkan karena merupakan satu-satunya penanggung jawab pada tugas aktif "${task.title}". Tugaskan anggota pengganti terlebih dahulu.`,
          );
        }
      }
    }

    member.isActive = isActive;
    return this.memberRepo.save(member);
  }

  async remove(id: string): Promise<{ message: string }> {
    const member = await this.findOne(id);

    if (member.assignments.length > 0) {
      throw new ConflictException(
        `Anggota "${member.name}" tidak dapat dihapus karena memiliki ${member.assignments.length} riwayat penugasan. Gunakan endpoint PATCH /api/members/${id}/status dengan isActive: false untuk menonaktifkan anggota.`,
      );
    }

    await this.memberRepo.remove(member);
    return { message: `Anggota "${member.name}" berhasil dihapus.` };
  }
}