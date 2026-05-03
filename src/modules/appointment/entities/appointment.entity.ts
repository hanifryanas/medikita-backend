import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Status } from '../../../common/enums/status.enum';
import { Doctor } from '../../doctor/entities/doctor.entity';
import { Nurse } from '../../nurse/entities/nurse.entity';
import { Patient } from '../../patient/entities/patient.entity';

@Entity('Appointment')
export class Appointment extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  appointmentId: string;

  @Column({ type: 'enum', enum: Status, default: Status.Incompleted })
  status: Status;

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp' })
  endTime: Date;

  @ManyToOne(() => Patient, (patient) => patient.appointments, { eager: true })
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @ManyToOne(() => Doctor, (doctor) => doctor.appointments, { eager: true })
  @JoinColumn({ name: 'doctorId' })
  doctor: Doctor;

  @ManyToMany(() => Nurse, (nurse) => nurse.appointments)
  @JoinTable({
    name: 'AppointmentNurse',
    joinColumn: {
      name: 'appointmentId',
      referencedColumnName: 'appointmentId',
    },
    inverseJoinColumn: { name: 'nurseId', referencedColumnName: 'nurseId' },
  })
  nurses?: Nurse[];

  @Column({ type: 'text' })
  concern: string;

  @Column({ type: 'text', nullable: true })
  diagnosis?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'text', nullable: true })
  room?: string;
}
