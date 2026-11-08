import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { TeamEntity } from '../../teams/entities/team.entity.js';
import { BaseEntity } from '../../../common/entities/base.entity.js';
// import { TaskAssignmentEntity } from '../../tasks/entities/task-assignment.entity';

export enum MemberRole {
  LEAD = 'LEAD',
  DEVELOPER = 'DEVELOPER',
  QA = 'QA',
  DESIGNER = 'DESIGNER',
}

@Entity('members')
export class MemberEntity extends BaseEntity {
  @Column({ name: 'team_id', type: 'uuid' })
  teamId: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  email: string;

  @Column({ type: 'enum', enum: MemberRole, default: MemberRole.DEVELOPER })
  role: MemberRole;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @ManyToOne(() => TeamEntity, (team) => team.members, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'team_id' })
  team: TeamEntity;

//   @OneToMany(() => TaskAssignmentEntity, (assignment) => assignment.member)
//   assignments: TaskAssignmentEntity[];
}