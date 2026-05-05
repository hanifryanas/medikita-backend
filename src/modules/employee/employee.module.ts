import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepartmentModule } from '../department/department.module';
import { Doctor } from '../doctor/entities/doctor.entity';
import { Nurse } from '../nurse/entities/nurse.entity';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/services/user.service';
import { EmployeeController } from './controllers/employee.controller';
import { Employee } from './entities/employee.entity';
import { EmployeeService } from './services/employee.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Employee, Doctor, Nurse, User]),
    DepartmentModule,
  ],
  controllers: [EmployeeController],
  providers: [EmployeeService, UserService],
})
export class EmployeeModule {}
