import { Injectable } from '@nestjs/common';

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(MemberEntity)
    private readonly memberRepo: Repository<MemberEntity>,
    private readonly teamsService: TeamsService,
  ) {}

  async create(dto: CreateMemberDto): Promise<MemberEntity> {
    await this.teamsService.findOneWithRelations(dto.teamId);
    const emailExists = await this.memberRepo.findOne({ where: { email: dto.email } });
    if (emailExists) throw new ConflictException('Email anggota sudah terdaftar.');

    const member = this.memberRepo.create(dto);
    return this.memberRepo.save(member);
  }

  async toggleActiveStatus(id: string, isActive: boolean): Promise<MemberEntity> {
    const member = await this.memberRepo.findOne({ where: { id } });
    if (!member) throw new NotFoundException('Anggota tidak ditemukan.');
    member.isActive = isActive;
    return this.memberRepo.save(member);
  }
}
