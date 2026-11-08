import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity.js';
import { TaskEntity } from './task.entity.js';
import { MemberEntity } from '../../members/entities/member.entity.js';

@Entity('task_assignments')
@Unique(['taskId', 'memberId'])
export class TaskAssignmentEntity extends BaseEntity {
  @Column({ name: 'task_id', type: 'uuid' })
  taskId: string;

  @Column({ name: 'member_id', type: 'uuid' })
  memberId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  notes: string;

  @ManyToOne(() => TaskEntity, (task) => task.assignments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task: TaskEntity;

  @ManyToOne(() => MemberEntity, (member) => member.assignments, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'member_id' })
  member: MemberEntity;
}