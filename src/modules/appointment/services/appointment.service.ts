import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from '../../doctor/entities/doctor.entity';
import { Nurse } from '../../nurse/entities/nurse.entity';
import { Patient } from '../../patient/entities/patient.entity';
import { CloseAppointmentDto } from '../dtos/close-appointment.dto';
import { CreateAppointmentDto } from '../dtos/create-appointment.dto';
import { Appointment } from '../entities/appointment.entity';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
  ) {}

  async findById(appointmentId: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { appointmentId },
    });

    if (!appointment) {
      throw new NotFoundException(
        `Appointment with ID ${appointmentId} not found`,
      );
    }

    return appointment;
  }

  async findByUser(userId: string): Promise<Appointment[]> {
    const appointments = await this.appointmentRepository.find({
      where: { patient: { userPatients: { userId } } },
    });

    if (!appointments || appointments.length === 0) {
      throw new NotFoundException(
        `No appointments found for User ID ${userId}`,
      );
    }

    return appointments;
  }

  async findByPatientId(patientId: string): Promise<Appointment[]> {
    const appointments = await this.appointmentRepository.find({
      where: { patient: { patientId } },
    });

    if (!appointments || appointments.length === 0) {
      throw new NotFoundException(
        `No appointments found for Patient ID ${patientId}`,
      );
    }

    return appointments;
  }

  async findByDoctorId(doctorId: string): Promise<Appointment[]> {
    const appointments = await this.appointmentRepository.find({
      where: { doctor: { doctorId } },
    });

    if (!appointments || appointments.length === 0) {
      throw new NotFoundException(
        `No appointments found for Doctor ID ${doctorId}`,
      );
    }

    return appointments;
  }

  async findBy(
    field: keyof Appointment,
    value: Appointment[keyof Appointment],
  ): Promise<Appointment[]> {
    const appointments = await this.appointmentRepository.find({
      where: { [field]: value },
    });

    if (!appointments || appointments.length === 0) {
      throw new NotFoundException(`Appointments with ${field} not found`);
    }

    return appointments;
  }

  async create(createAppointmentDto: CreateAppointmentDto): Promise<string> {
    const { patientId, doctorId, ...rest } = createAppointmentDto;

    const newAppointment = this.appointmentRepository.create({
      ...rest,
      patient: { patientId } as Patient,
      doctor: { doctorId } as Doctor,
    });

    const createdAppointment =
      await this.appointmentRepository.save(newAppointment);

    if (!createdAppointment) {
      throw new BadRequestException('Failed to create appointment');
    }

    return createdAppointment.appointmentId;
  }

  async update(
    appointmentId: string,
    updateData: Partial<Appointment>,
  ): Promise<void> {
    const appointment = await this.findById(appointmentId);

    await this.appointmentRepository.save({ ...appointment, ...updateData });
  }

  async checkIn(appointmentId: string): Promise<void> {
    const appointment = await this.findById(appointmentId);

    if (appointment.checkInTime) {
      throw new BadRequestException(
        `Appointment ${appointmentId} is already checked in`,
      );
    }

    await this.appointmentRepository.save({
      ...appointment,
      checkInTime: new Date(),
    });
  }

  async close(
    appointmentId: string,
    closeAppointmentDto: CloseAppointmentDto,
  ): Promise<void> {
    const appointment = await this.findById(appointmentId);

    const merged: Appointment = {
      ...appointment,
      ...closeAppointmentDto,
    } as Appointment;

    if (closeAppointmentDto.nurseIds !== undefined) {
      merged.nurses = closeAppointmentDto.nurseIds.map(
        (nurseId) => ({ nurseId }) as Nurse,
      );
    }

    await this.appointmentRepository.save(merged);
  }

  async delete(appointmentId: string): Promise<void> {
    const appointment = await this.findById(appointmentId);

    await this.appointmentRepository.remove(appointment);
  }
}
