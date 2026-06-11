import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doctor } from '../doctor/entities/doctor.entity';
import { Nurse } from '../nurse/entities/nurse.entity';
import { Patient } from '../patient/entities/patient.entity';
import { AppointmentController } from './controllers/appointment.controller';
import { Appointment } from './entities/appointment.entity';
import { AppointmentService } from './services/appointment.service';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment, Doctor, Patient, Nurse])],
  providers: [AppointmentService],
  controllers: [AppointmentController],
})
export class AppointmentModule {}
