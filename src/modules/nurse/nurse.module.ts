import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepartmentModule } from '../department/department.module';
import { EmployeeModule } from '../employee/employee.module';
import { NurseScheduleController } from './controllers/nurse-schedule.controller';
import { NurseController } from './controllers/nurse.controller';
import { NurseSchedule } from './entities/nurse-schedule.entity';
import { Nurse } from './entities/nurse.entity';
import { NurseScheduleService } from './services/nurse-schedule.service';
import { NurseService } from './services/nurse.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Nurse, NurseSchedule]),
    DepartmentModule,
    EmployeeModule,
  ],
  providers: [NurseService, NurseScheduleService],
  controllers: [NurseScheduleController, NurseController],
})
export class NurseModule {}
