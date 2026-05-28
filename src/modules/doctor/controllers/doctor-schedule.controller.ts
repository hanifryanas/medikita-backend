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
import { Public } from '../../../common/decorators/public.decorator';
import { RequiredRole } from '../../../common/decorators/required-role.decorator';
import { UserRole } from '../../user/enums/user-role.enum';
import { DoctorScheduleResponseDto } from '../dtos/doctor-schedule-response.dto';
import { FilterDoctorScheduleDto } from '../dtos/filter-doctor-schedule.dto';
import { UpsertDoctorScheduleDto } from '../dtos/upsert-doctor-schedule.dto';
import { DoctorScheduleService } from '../services/doctor-schedule.service';

@Controller('doctors/schedules')
@ApiTags('Doctor-Schedule')
@ApiBearerAuth()
export class DoctorScheduleController {
  constructor(private readonly doctorScheduleService: DoctorScheduleService) {}

  @Public()
  @Get()
  @ApiQuery({ name: 'doctorId', required: false, type: String })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description:
      'Date in stardartDateFormat (yyyy-MM-dd). Provide with endDate to instantiate schedules per concrete date in the range with bookedTimeSlots.',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description:
      'Date in stardartDateFormat (yyyy-MM-dd). Provide together with startDate. Max span: 31 days.',
  })
  async findAll(
    @Query() filterDoctorScheduleDto: FilterDoctorScheduleDto,
  ): Promise<DoctorScheduleResponseDto[]> {
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
