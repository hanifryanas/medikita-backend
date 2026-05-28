import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Matches } from 'class-validator';

export class FilterDoctorScheduleDto {
  @IsOptional()
  @IsString()
  doctorId?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  departmentId?: number;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'startDate must be in yyyy-MM-dd format',
  })
  startDate?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'endDate must be in yyyy-MM-dd format',
  })
  endDate?: string;
}
