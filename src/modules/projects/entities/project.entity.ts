import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity.js';
import { TeamEntity } from '../../teams/entities/team.entity.js';
// import { BaseEntity } from '../../../common/entities/base.entity';
// import { TeamEntity } from '../../teams/entities/team.entity';
// import { TaskEntity } from '../../tasks/entities/task.entity';

export enum ProjectStatus {
  PLANNED = 'PLANNED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}

@Entity('projects')
export class ProjectEntity extends BaseEntity {
  @Column({ name: 'team_id', type: 'uuid' })
  teamId: string;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: ProjectStatus, default: ProjectStatus.PLANNED })
  status: ProjectStatus;

  @Column({ name: 'start_date', type: 'date' })
  startDate: string;

  @Column({ name: 'end_date', type: 'date' })
  endDate: string;

  @ManyToOne(() => TeamEntity, (team) => team.projects, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'team_id' })
  team: TeamEntity;

//   @OneToMany(() => BaseEntity, (task) => task.project)
//   tasks: TaskEntity[];
}