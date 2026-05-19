import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Schedule } from '../../../common/entities/schedule.entity';
import { Doctor } from './doctor.entity';

@Entity('DoctorSchedule')
export class DoctorSchedule extends Schedule {
  @PrimaryGeneratedColumn('identity')
  doctorScheduleId: number;

  @ManyToOne(() => Doctor, (doctor) => doctor.schedules, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'doctorId' })
  doctor: Doctor;
}
