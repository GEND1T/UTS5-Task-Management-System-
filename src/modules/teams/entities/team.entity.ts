import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity.js';
import { MemberEntity } from '../../members/entities/member.entity.js';
import { ProjectEntity } from '../../projects/entities/project.entity.js';


@Entity('teams')
export class TeamEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @OneToMany(() => MemberEntity, (member) => member.team)
  members: MemberEntity[];

  @OneToMany(() => ProjectEntity, (project) => project.team)
  projects: ProjectEntity[];
}