import { Expose } from 'class-transformer';
import { differenceInDays } from 'date-fns';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Department } from '../../department/entities/department.entity';
import { Doctor } from '../../doctor/entities/doctor.entity';
import { Nurse } from '../../nurse/entities/nurse.entity';
import { User } from '../../user/entities/user.entity';

@Entity('Employee')
export class Employee extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  employeeId: string;

  @OneToOne(() => User, (user) => user.employee, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Expose()
  get fullName(): string {
    if (!this.user) return '';
    const baseName = `${this.user.firstName} ${this.user.lastName}`;
    if (!this.doctor) return baseName;
    const prefixed = `dr. ${baseName}`;
    return this.doctor.title ? `${prefixed}, ${this.doctor.title}` : prefixed;
  }

  @OneToOne(() => Nurse, (nurse) => nurse.employee)
  nurse?: Nurse;

  @OneToOne(() => Doctor, (doctor) => doctor.employee)
  doctor?: Doctor;

  @Column({ type: 'varchar', nullable: true })
  photoUrl?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  jobTitle?: string;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  retirementDate?: Date;

  @Expose()
  get employmentDuration(): string {
    const laterDate = this.retirementDate
      ? new Date(this.retirementDate)
      : new Date();
    const days = differenceInDays(laterDate, this.startDate);

    const years = Math.floor(days / 365);
    const months = Math.floor((days % 365) / 30);
    const remainingDays = days % 30;

    let result = '';
    if (years > 0) {
      result += `${years} year(s) `;
    }

    if (months > 0) {
      result += `${months} month(s) `;
    }

    if (remainingDays > 0) {
      result += `${remainingDays} day(s)`;
    }

    return result.trim();
  }

  @Column({ type: 'int' })
  departmentId: number;

  @ManyToOne(() => Department, (department) => department.employees)
  @JoinColumn({ name: 'departmentId' })
  department: Department;
}
