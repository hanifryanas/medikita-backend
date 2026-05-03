import { Expose } from 'class-transformer';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Status } from '../../../common/enums/status.enum';
import { Appointment } from '../../appointment/entities/appointment.entity';
import { Employee } from '../../employee/entities/employee.entity';
import { DoctorSchedule } from './doctor-schedule.entity';

@Entity('Doctor')
export class Doctor extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  doctorId: string;

  @OneToOne(() => Employee, (employee) => employee.doctor, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column({ nullable: true, length: 50 })
  title?: string;

  @OneToMany(() => DoctorSchedule, (schedule) => schedule.doctor)
  schedules?: DoctorSchedule[];

  @OneToMany(() => Appointment, (appointment) => appointment.doctor)
  appointments?: Appointment[];

  @Expose({ toPlainOnly: true })
  get isAvailable(): boolean | undefined {
    if (!this.schedules || this.schedules.length === 0) return undefined;

    const now = new Date();
    const day = now.toLocaleString('en-US', {
      weekday: 'long',
    }) as unknown as DoctorSchedule['day'];
    const currentTime = now.toTimeString().slice(0, 5);

    const isScheduled = this.schedules.some(
      (s) =>
        s.day === day && currentTime >= s.startTime && currentTime <= s.endTime,
    );

    const hasOngoingAppointment = this.appointments?.some(
      (a) =>
        a.status === Status.Incompleted &&
        a.startTime <= now &&
        a.endTime >= now,
    );

    return isScheduled && !hasOngoingAppointment;
  }
}
