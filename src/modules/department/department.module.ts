import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from '../employee/entities/employee.entity';
import { DepartmentController } from './controllers/department.controller';
import { Department } from './entities/department.entity';
import { DepartmentService } from './services/department.service';

@Module({
  imports: [TypeOrmModule.forFeature([Department, Employee])],
  controllers: [DepartmentController],
  providers: [DepartmentService],
  exports: [DepartmentService, TypeOrmModule],
})
export class DepartmentModule {}
