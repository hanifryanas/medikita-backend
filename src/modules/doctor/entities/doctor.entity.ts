import { Exclude, Expose } from 'class-transformer';
import {
  Day,
  differenceInCalendarDays,
  getDay,
  nextDay,
  parse,
} from 'date-fns';
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

  /** Indonesian specialist title abbreviation (e.g. 'Sp.JP', 'Sp.OG', 'Sp.A').
   *  Appended to the doctor's name. */
  @Column({ nullable: true, length: 50 })
  title?: string;

  /** Plain-language job title (e.g. 'Cardiologist', 'Pediatrician'). */
  @Column({ nullable: true, length: 100 })
  jobTitle?: string;

  @OneToMany(() => DoctorSchedule, (schedule) => schedule.doctor)
  @Exclude({ toPlainOnly: true })
  @Expose({ groups: ['doctor-full-schedule'], toPlainOnly: true })
  schedules?: DoctorSchedule[];

  @Expose({ toPlainOnly: true })
  get scheduleDays(): DoctorSchedule['day'][] | undefined {
    if (!this.schedules) return undefined;

    const now = new Date();
    const today = getDay(now);
    const distance = (day: DoctorSchedule['day']) => {
      const targetDayIndex = getDay(parse(day, 'EEEE', now)) as Day;
      if (targetDayIndex === today) return 0;
      return differenceInCalendarDays(nextDay(now, targetDayIndex), now);
    };

    const uniqueDays = [...new Set(this.schedules.map((s) => s.day))];
    return uniqueDays.sort((a, b) => distance(a) - distance(b));
  }

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
