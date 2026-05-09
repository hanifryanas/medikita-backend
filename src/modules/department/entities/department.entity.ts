import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Employee } from '../../employee/entities/employee.entity';

@Entity('Department')
export class Department extends BaseEntity {
  @PrimaryGeneratedColumn()
  departmentId: number;

  /** Lowercased, no-space identifier, e.g. 'frontoffice', 'cardiology'. */
  @Column({ length: 50, unique: true })
  typeCode: string;

  @Column({ length: 100 })
  displayName: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'int', nullable: true })
  featuredOrdinal?: number;

  /** True for medically staffed departments (doctors/nurses provide patient
   *  care). False for non-clinical/operational units such as Front Office and
   *  Back Office. */
  @Column({ default: false })
  isClinical: boolean;

  /** True for departments that run an outpatient clinic (poli) where patients
   *  can book consultation appointments. False for support units (Pharmacy,
   *  Radiology, Front/Back Office) and clinical units that do not run a poli
   *  (ER, Operating Theatre, ICU). */
  @Column({ default: false })
  isClinic: boolean;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Employee, (employee) => employee.department)
  employees?: Employee[];
}
