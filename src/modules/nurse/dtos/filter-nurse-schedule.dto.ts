import { PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { NurseSchedule } from '../entities/nurse-schedule.entity';

export class FilterNurseScheduleDto extends PartialType(NurseSchedule) {
  @IsOptional()
  @IsString()
  nurseId?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  departmentId?: number;
}
