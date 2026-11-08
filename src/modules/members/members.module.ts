import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembersService } from './members.service.js';
import { MembersController } from './members.controller.js';
import { MemberEntity } from './entities/member.entity.js';
import { TeamsModule } from '../teams/teams.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([MemberEntity]), TeamsModule],
  providers: [MembersService],
  controllers: [MembersController],
})
export class MembersModule {}
