// src/database/seed.ts
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from '../app.module.js';
import { TeamEntity } from '../modules/teams/entities/team.entity.js';
import { MemberEntity, MemberRole } from '../modules/members/entities/member.entity.js';
import { ProjectEntity, ProjectStatus } from '../modules/projects/entities/project.entity.js';
import { TaskEntity, TaskPriority, TaskStatus } from '../modules/tasks/entities/task.entity.js';
import { TaskAssignmentEntity } from '../modules/tasks/entities/task-assignment.entity.js';

// UUID v4 statis agar langsung cocok dengan file pengujian api-tests.http
export const SEED_IDS = {
  teamAlpha: '11111111-1111-4111-8111-111111111101',
  teamBeta: '11111111-1111-4111-8111-111111111102',
  teamEmpty: '11111111-1111-4111-8111-111111111103',

  memberAlphaLead: '22222222-2222-4222-8222-222222222201',
  memberAlphaDev: '22222222-2222-4222-8222-222222222202',
  memberAlphaInactive: '22222222-2222-4222-8222-222222222203',
  memberBetaDev: '22222222-2222-4222-8222-222222222204',
  memberAlphaUnassigned: '22222222-2222-4222-8222-222222222205',

  projectAlphaActive: '33333333-3333-4333-8333-333333333301',
  projectAlphaCompleted: '33333333-3333-4333-8333-333333333302',
  projectAlphaPlanned: '33333333-3333-4333-8333-333333333303',

  taskInProgressSingleAssignee: '44444444-4444-4444-8444-444444444401',
  taskTodoUnassigned: '44444444-4444-4444-8444-444444444402',
  taskDoneLocked: '44444444-4444-4444-8444-444444444403',
};

async function runSeed() {
  console.log('Memulai proses seeding database Task Management System...');
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  try {
    // 1. Bersihkan seluruh tabel secara berurutan
    await dataSource.query(
      'TRUNCATE TABLE task_assignments, tasks, projects, members, teams RESTART IDENTITY CASCADE;',
    );

    const teamRepo = dataSource.getRepository(TeamEntity);
    const memberRepo = dataSource.getRepository(MemberEntity);
    const projectRepo = dataSource.getRepository(ProjectEntity);
    const taskRepo = dataSource.getRepository(TaskEntity);
    const assignmentRepo = dataSource.getRepository(TaskAssignmentEntity);

    // 2. Seed Data Teams
    await teamRepo.save([
      {
        id: SEED_IDS.teamAlpha,
        name: 'Engineering Alpha',
        description: 'Tim pengembang layanan inti dan arsitektur backend',
      },
      {
        id: SEED_IDS.teamBeta,
        name: 'Product Design Beta',
        description: 'Tim desain antarmuka dan pengalaman pengguna',
      },
      {
        id: SEED_IDS.teamEmpty,
        name: 'Tim Cadangan Kosong',
        description: 'Tim tanpa anggota dan proyek untuk uji fitur hapus',
      },
    ]);

    // 3. Seed Data Members
    await memberRepo.save([
      {
        id: SEED_IDS.memberAlphaLead,
        teamId: SEED_IDS.teamAlpha,
        name: 'Afin Aditya',
        email: 'afin.lead@alpha.dev',
        role: MemberRole.LEAD,
        isActive: true,
      },
      {
        id: SEED_IDS.memberAlphaDev,
        teamId: SEED_IDS.teamAlpha,
        name: 'Budi Santoso',
        email: 'budi.dev@alpha.dev',
        role: MemberRole.DEVELOPER,
        isActive: true,
      },
      {
        id: SEED_IDS.memberAlphaInactive,
        teamId: SEED_IDS.teamAlpha,
        name: 'Citra Lestari',
        email: 'citra.qa@alpha.dev',
        role: MemberRole.QA,
        isActive: false,
      },
      {
        id: SEED_IDS.memberBetaDev,
        teamId: SEED_IDS.teamBeta,
        name: 'Dimas Pratama',
        email: 'dimas.ui@beta.dev',
        role: MemberRole.DESIGNER,
        isActive: true,
      },
      {
        id: SEED_IDS.memberAlphaUnassigned,
        teamId: SEED_IDS.teamAlpha,
        name: 'Eka Putra',
        email: 'eka.new@alpha.dev',
        role: MemberRole.DEVELOPER,
        isActive: true,
      },
    ]);

    // 4. Seed Data Projects
    await projectRepo.save([
      {
        id: SEED_IDS.projectAlphaActive,
        teamId: SEED_IDS.teamAlpha,
        name: 'Pengembangan API Task Management',
        description: 'Implementasi backend proyek dengan NestJS dan TypeORM',
        status: ProjectStatus.ACTIVE,
        startDate: '2026-11-01',
        endDate: '2026-12-31',
      },
      {
        id: SEED_IDS.projectAlphaCompleted,
        teamId: SEED_IDS.teamAlpha,
        name: 'Migrasi Database Legacy',
        description: 'Proyek yang sudah selesai untuk uji penguncian tugas',
        status: ProjectStatus.COMPLETED,
        startDate: '2026-09-01',
        endDate: '2026-10-15',
      },
      {
        id: SEED_IDS.projectAlphaPlanned,
        teamId: SEED_IDS.teamAlpha,
        name: 'Rencana Integrasi WebSocket',
        description: 'Proyek kosong berstatus PLANNED untuk uji hapus proyek',
        status: ProjectStatus.PLANNED,
        startDate: '2026-12-01',
        endDate: '2026-12-30',
      },
    ]);

    // 5. Seed Data Tasks
    await taskRepo.save([
      {
        id: SEED_IDS.taskInProgressSingleAssignee,
        projectId: SEED_IDS.projectAlphaActive,
        title: 'Implementasi Validasi Aturan Bisnis',
        description: 'Menyusun logika validasi lintas tim dan state machine',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        dueDate: new Date('2026-11-25T17:00:00.000Z'),
        completedAt: null,
      },
      {
        id: SEED_IDS.taskTodoUnassigned,
        projectId: SEED_IDS.projectAlphaActive,
        title: 'Pembuatan Dokumentasi Endpoint API',
        description: 'Tugas baru yang belum memiliki penugasan anggota',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        dueDate: new Date('2026-12-10T17:00:00.000Z'),
        completedAt: null,
      },
      {
        id: SEED_IDS.taskDoneLocked,
        projectId: SEED_IDS.projectAlphaActive,
        title: 'Inisialisasi Skema Entitas TypeORM',
        description: 'Tugas yang sudah selesai dan terkunci dari perubahan',
        status: TaskStatus.DONE,
        priority: TaskPriority.URGENT,
        dueDate: new Date('2026-11-05T17:00:00.000Z'),
        completedAt: new Date('2026-11-04T15:30:00.000Z'),
      },
    ]);

    // 6. Seed Data TaskAssignments
    await assignmentRepo.save([
      {
        taskId: SEED_IDS.taskInProgressSingleAssignee,
        memberId: SEED_IDS.memberAlphaLead,
        notes: 'Penanggung jawab utama arsitektur validasi service',
      },
      {
        taskId: SEED_IDS.taskDoneLocked,
        memberId: SEED_IDS.memberAlphaLead,
        notes: 'Merancang struktur ERD dan relasi tabel',
      },
      {
        taskId: SEED_IDS.taskDoneLocked,
        memberId: SEED_IDS.memberAlphaDev,
        notes: 'Menulis kelas entitas dan dekorator TypeORM',
      },
    ]);

    console.log('Seeding berhasil diselesaikan!');
  } catch (error) {
    console.error('Terjadi kegagalan saat seeding:', error);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

runSeed();