import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CurrentUserId } from '../../../common/decorators/current-user-id.decorator';
import { RequiredRole } from '../../../common/decorators/required-role.decorator';
import { UserRole } from '../../user/enums/user-role.enum';
import { FilterDoctorScheduleDto } from '../dtos/filter-doctor-schedule.dto';
import { UpsertDoctorScheduleDto } from '../dtos/upsert-doctor-schedule.dto';
import { DoctorSchedule } from '../entities/doctor-schedule.entity';
import { DoctorScheduleService } from '../services/doctor-schedule.service';

@Controller('doctors/schedules')
@ApiTags('Doctor-Schedule')
@ApiBearerAuth()
export class DoctorScheduleController {
  constructor(private readonly doctorScheduleService: DoctorScheduleService) {}

  @RequiredRole(UserRole.User)
  @Get()
  @ApiQuery({ name: 'doctorId', required: false, type: String })
  @ApiQuery({ name: 'day', required: false, type: String })
  @ApiQuery({ name: 'startTime', required: false, type: String })
  @ApiQuery({ name: 'endTime', required: false, type: String })
  async findAll(
    @Query() filterDoctorScheduleDto: FilterDoctorScheduleDto,
  ): Promise<DoctorSchedule[]> {
    return this.doctorScheduleService.findBy(filterDoctorScheduleDto);
  }

  @RequiredRole(UserRole.CareTeam)
  @Put()
  async update(
    @Body() upsertDoctorScheduleDto: UpsertDoctorScheduleDto,
  ): Promise<void> {
    return await this.doctorScheduleService.upsert(upsertDoctorScheduleDto);
  }

  @RequiredRole(UserRole.CareTeam)
  @Put('me')
  async updateMe(
    @CurrentUserId() userId: string,
    @Body() upsertDoctorScheduleDto: UpsertDoctorScheduleDto,
  ): Promise<void> {
    return await this.doctorScheduleService.upsertByUserId(
      userId,
      upsertDoctorScheduleDto,
    );
  }

  @RequiredRole(UserRole.Admin)
  @Delete()
  @ApiQuery({ name: 'doctorId', required: true, type: String })
  async deleteByDoctorId(@Query('doctorId') doctorId: string): Promise<void> {
    return await this.doctorScheduleService.deleteByDoctorId(doctorId);
  }

  @RequiredRole(UserRole.Admin)
  @Delete(':doctorScheduleId')
  async deleteById(
    @Param('doctorScheduleId') doctorScheduleId: number,
  ): Promise<void> {
    return await this.doctorScheduleService.delete(doctorScheduleId);
  }
}
