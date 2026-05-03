import { Expose } from 'class-transformer';
import { differenceInYears } from 'date-fns';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Appointment } from '../../appointment/entities/appointment.entity';
import { UserPatient } from '../../user/entities/user-patient.entity';
import { UserGenderType } from '../../user/enums/user-gender.enum';
import { UserRelationship } from '../../user/enums/user-relationship.enum';
import { PatientInsurance } from './patient-insurance.entity';

@Entity('Patient')
export class Patient extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  patientId: string;

  @Column({ length: 11, unique: true })
  medicalRecordNumber: string;

  @Column({ length: 20 })
  identityNumber: string;

  @Column({ length: 25 })
  firstName: string;

  @Column({ length: 25 })
  lastName: string;

  @Column({ type: 'enum', enum: UserGenderType })
  gender: UserGenderType;

  @Column()
  phoneNumber: string;

  @Column({ type: 'date' })
  dateOfBirth: Date;

  @Column({ nullable: true })
  address?: string;

  @Expose()
  get age(): number {
    return differenceInYears(new Date(), new Date(this.dateOfBirth));
  }

  @OneToMany(() => UserPatient, (userPatient) => userPatient.patient, {
    cascade: true,
  })
  userPatients?: UserPatient[];

  @OneToMany(() => PatientInsurance, (insurance) => insurance.patient, {
    cascade: true,
  })
  insurances?: PatientInsurance[];

  @OneToMany(() => Appointment, (appointment) => appointment.patient)
  appointments?: Appointment[];

  @Expose({ groups: ['patient-for-user'], toPlainOnly: true })
  relationship?: UserRelationship;

  @Expose({ groups: ['patient-for-user'], toPlainOnly: true })
  ordinal?: number;
}
