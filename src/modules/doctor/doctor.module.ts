import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from '../employee/entities/employee.entity';
import { EmployeeService } from '../employee/services/employee.service';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/services/user.service';
import { DoctorScheduleController } from './controllers/doctor-schedule.controller';
import { DoctorController } from './controllers/doctor.controller';
import { DoctorSchedule } from './entities/doctor-schedule.entity';
import { Doctor } from './entities/doctor.entity';
import { DoctorScheduleService } from './services/doctor-schedule.service';
import { DoctorService } from './services/doctor.service';

@Module({
  imports: [TypeOrmModule.forFeature([Doctor, DoctorSchedule, Employee, User])],
  providers: [
    DoctorService,
    DoctorScheduleService,
    EmployeeService,
    UserService,
  ],
  controllers: [DoctorController, DoctorScheduleController],
})
export class DoctorModule {}
