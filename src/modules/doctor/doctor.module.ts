import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from '../appointment/entities/appointment.entity';
import { DepartmentModule } from '../department/department.module';
import { EmployeeModule } from '../employee/employee.module';
import { DoctorScheduleController } from './controllers/doctor-schedule.controller';
import { DoctorController } from './controllers/doctor.controller';
import { DoctorSchedule } from './entities/doctor-schedule.entity';
import { Doctor } from './entities/doctor.entity';
import { DoctorScheduleService } from './services/doctor-schedule.service';
import { DoctorService } from './services/doctor.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Doctor, DoctorSchedule, Appointment]),
    DepartmentModule,
    EmployeeModule,
  ],
  providers: [DoctorService, DoctorScheduleService],
  controllers: [DoctorScheduleController, DoctorController],
})
export class DoctorModule {}
