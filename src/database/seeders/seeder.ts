import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { seeder } from 'nestjs-seeder';
import { join } from 'path';
import { databaseConfig } from '../../config/database.config';
import { DoctorSchedule } from '../../modules/doctor/entities/doctor-schedule.entity';
import { Doctor } from '../../modules/doctor/entities/doctor.entity';
import { Employee } from '../../modules/employee/entities/employee.entity';
import { NurseSchedule } from '../../modules/nurse/entities/nurse-schedule.entity';
import { Nurse } from '../../modules/nurse/entities/nurse.entity';
import { PatientInsurance } from '../../modules/patient/entities/patient-insurance.entity';
import { Patient } from '../../modules/patient/entities/patient.entity';
import { UserPatient } from '../../modules/user/entities/user-patient.entity';
import { User } from '../../modules/user/entities/user.entity';
import { DoctorSeeder } from './doctor.seeder';
import { EmployeeAdminSeeder } from './employee-admin.seeder';
import { NurseSeeder } from './nurse.seeder';
import { PatientSeeder } from './patient-seeder';
import { UserSuperAdminSeeder } from './user-super-admin.seeder';

seeder({
  imports: [
    ConfigModule.forRoot({
      load: [databaseConfig],
      cache: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        database: configService.get<string>('database.database'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        entities: [
          join(__dirname, '../../modules/**/entities/*.entity{.ts,.js}'),
        ],
        migrationsRun: false,
        synchronize: false,
      }),
    }),
    TypeOrmModule.forFeature([
      User,
      Employee,
      Patient,
      PatientInsurance,
      UserPatient,
      Doctor,
      DoctorSchedule,
      Nurse,
      NurseSchedule,
    ]),
  ],
}).run([
  UserSuperAdminSeeder,
  EmployeeAdminSeeder,
  PatientSeeder,
  DoctorSeeder,
  NurseSeeder,
]);
