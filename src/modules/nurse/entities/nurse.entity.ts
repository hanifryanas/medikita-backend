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
}
