import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUserId } from '../../../common/decorators/current-user-id.decorator';
import { RequiredRole } from '../../../common/decorators/required-role.decorator';
import { UserRole } from '../../user/enums/user-role.enum';
import { CloseAppointmentDto } from '../dtos/close-appointment.dto';
import { CreateAppointmentDto } from '../dtos/create-appointment.dto';
import { UpdateAppointmentTimeDto } from '../dtos/update-appointment-time.dto';
import { Appointment } from '../entities/appointment.entity';
import { AppointmentService } from '../services/appoinment.service';

@Controller('appointments')
@ApiTags('Appointment')
@ApiBearerAuth()
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @RequiredRole(UserRole.User)
  @Get('me')
  async findMine(@CurrentUserId() userId: string): Promise<Appointment[]> {
    return this.appointmentService.findByUser(userId);
  }

  @RequiredRole(UserRole.User)
  @Get('patients/:patientId')
  async findByPatient(
    @Param('patientId') patientId: string,
  ): Promise<Appointment[]> {
    return this.appointmentService.findByPatientId(patientId);
  }

  @RequiredRole(UserRole.CareTeam)
  @Get('doctors/:doctorId')
  async findByDoctor(
    @Param('doctorId') doctorId: string,
  ): Promise<Appointment[]> {
    return this.appointmentService.findByDoctorId(doctorId);
  }

  @RequiredRole(UserRole.User)
  @Get(':appointmentId')
  async findById(
    @Param('appointmentId') appointmentId: string,
  ): Promise<Appointment> {
    return this.appointmentService.findById(appointmentId);
  }

  @RequiredRole(UserRole.User)
  @Post()
  async create(
    @Body() createAppointmentDto: CreateAppointmentDto,
  ): Promise<string> {
    return this.appointmentService.create(createAppointmentDto);
  }

  @RequiredRole(UserRole.CareTeam)
  @Put(':appointmentId/close')
  async close(
    @Param('appointmentId') appointmentId: string,
    @Body() closeAppointmentDto: CloseAppointmentDto,
  ): Promise<void> {
    return this.appointmentService.close(appointmentId, closeAppointmentDto);
  }

  @RequiredRole(UserRole.CareTeam)
  @Patch(':appointmentId/check-in')
  async checkIn(@Param('appointmentId') appointmentId: string): Promise<void> {
    return this.appointmentService.checkIn(appointmentId);
  }

  @RequiredRole(UserRole.User)
  @Put(':appointmentId/reschedule')
  async reschedule(
    @Param('appointmentId') appointmentId: string,
    @Body() updateAppointmentTimeDto: UpdateAppointmentTimeDto,
  ): Promise<void> {
    return this.appointmentService.update(
      appointmentId,
      updateAppointmentTimeDto,
    );
  }

  @RequiredRole(UserRole.CareTeam)
  @Delete(':appointmentId')
  async delete(@Param('appointmentId') appointmentId: string): Promise<void> {
    return this.appointmentService.delete(appointmentId);
  }
}
