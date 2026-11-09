import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberEntity } from './entities/member.entity.js';
import { MembersController } from './members.controller.js';
import { MembersService } from './members.service.js';
import { TeamsModule } from '../teams/teams.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([MemberEntity]), TeamsModule],
  controllers: [MembersController],
  providers: [MembersService],
  exports: [MembersService],
})
export class MembersModule {}