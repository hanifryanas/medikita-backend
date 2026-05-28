import { Exclude, Expose } from 'class-transformer';
import {
  AfterLoad,
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Schedule } from '../../../common/entities/schedule.entity';
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

  @Expose()
  get fullName(): string | undefined {
    if (!this.employee) return undefined;
    const baseName = this.employee.fullName;
    const prefixed = `dr. ${baseName}`;
    return this.title ? `${prefixed}, ${this.title}` : prefixed;
  }

  /** Indonesian specialist title abbreviation (e.g. 'Sp.JP', 'Sp.OG', 'Sp.A').
   *  Appended to the doctor's name. */
  @Column({ nullable: true, length: 50 })
  title?: string;

  /** Plain-language job title (e.g. 'Cardiologist', 'Pediatrician'). */
  @Column({ nullable: true, length: 100 })
  jobTitle?: string;

  @OneToMany(() => DoctorSchedule, (schedule) => schedule.doctor)
  @Exclude({ toPlainOnly: true })
  schedules?: DoctorSchedule[];

  @AfterLoad()
  private sortSchedulesByCurrentDay(): void {
    if (this.schedules) Schedule.sortByCurrentDayTime(this.schedules);
  }

  @Expose({ groups: ['doctor-day-schedule'], toPlainOnly: true })
  get scheduleDays(): string[] | undefined {
    if (!this.schedules) return undefined;
    const days = this.schedules.map((s) => s.day);
    return Array.from(new Set(days));
  }

  @OneToMany(() => Appointment, (appointment) => appointment.doctor)
  @Exclude({ toPlainOnly: true })
  appointments?: Appointment[];

  @Expose({ groups: ['doctor-patient-count'], toPlainOnly: true })
  get patientCount(): number {
    if (!this.appointments) return 0;

    const now = new Date();
    const patientIds = new Set<string>();
    for (const appointment of this.appointments) {
      if (
        appointment.status === Status.Completed &&
        appointment.endTime &&
        appointment.endTime <= now &&
        appointment.patient?.patientId
      ) {
        patientIds.add(appointment.patient.patientId);
      }
    }
    return patientIds.size;
  }
}
