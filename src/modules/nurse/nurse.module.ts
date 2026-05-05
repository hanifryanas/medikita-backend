import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepartmentModule } from '../department/department.module';
import { Employee } from '../employee/entities/employee.entity';
import { EmployeeService } from '../employee/services/employee.service';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/services/user.service';
import { NurseScheduleController } from './controllers/nurse-schedule.controller';
import { NurseController } from './controllers/nurse.controller';
import { NurseSchedule } from './entities/nurse-schedule.entity';
import { Nurse } from './entities/nurse.entity';
import { NurseScheduleService } from './services/nurse-schedule.service';
import { NurseService } from './services/nurse.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Nurse, NurseSchedule, Employee, User]),
    DepartmentModule,
  ],
  providers: [NurseService, NurseScheduleService, EmployeeService, UserService],
  controllers: [NurseController, NurseScheduleController],
})
export class NurseModule {}
