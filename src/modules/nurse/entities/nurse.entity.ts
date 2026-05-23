import { Expose } from 'class-transformer';
import {
  AfterLoad,
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Schedule } from '../../../common/entities/schedule.entity';
import { Status } from '../../../common/enums/status.enum';
import { Appointment } from '../../appointment/entities/appointment.entity';
import { Employee } from '../../employee/entities/employee.entity';
import { NurseSchedule } from './nurse-schedule.entity';

@Entity('Nurse')
export class Nurse extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  nurseId: string;

  @OneToOne(() => Employee, (employee) => employee.nurse, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Expose()
  get fullName(): string {
    if (!this.employee) return '';
    const baseName = this.employee.fullName;
    const prefixed = `Ns. ${baseName}`;
    return this.title ? `${prefixed}, ${this.title}` : prefixed;
  }

  @Column({ nullable: true, length: 50 })
  title?: string;

  @OneToMany(() => NurseSchedule, (schedule) => schedule.nurse)
  @Expose({ groups: ['nurse-schedule'], toPlainOnly: true })
  schedules?: NurseSchedule[];

  @AfterLoad()
  private sortSchedulesByCurrentDay(): void {
    if (this.schedules) Schedule.sortByCurrentDayTime(this.schedules);
  }

  @Expose({ groups: ['nurse-day-schedule'], toPlainOnly: true })
  get scheduleDays(): string[] | undefined {
    if (!this.schedules) return undefined;
    const days = this.schedules.map((s) => s.day);
    return Array.from(new Set(days));
  }

  @ManyToMany(() => Appointment, (appointment) => appointment.nurses)
  appointments?: Appointment[];

  @Expose({ toPlainOnly: true })
  get isAvailable(): boolean | undefined {
    if (!this.schedules || this.schedules.length === 0) return undefined;

    const now = new Date();
    const day = now.toLocaleString('en-US', {
      weekday: 'long',
    }) as unknown as NurseSchedule['day'];
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
