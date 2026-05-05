import { PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { DoctorSchedule } from '../entities/doctor-schedule.entity';

export class FilterDoctorScheduleDto extends PartialType(DoctorSchedule) {
  @IsOptional()
  @IsString()
  doctorId?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  departmentId?: number;
}
