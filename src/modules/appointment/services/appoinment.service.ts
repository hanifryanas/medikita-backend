import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  async create(appointmentData: Partial<Appointment>): Promise<string> {
    const newAppointment = this.appointmentRepository.create(appointmentData);

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

  async delete(appointmentId: string): Promise<void> {
    const appointment = await this.findById(appointmentId);

    if (!appointment) {
      throw new NotFoundException(
        `Appointment with ID ${appointmentId} not found`,
      );
    }

    await this.appointmentRepository.remove(appointment);
  }
}
