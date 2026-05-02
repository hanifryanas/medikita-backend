import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Patient } from '../../patient/entities/patient.entity';
import { User } from './user.entity';

@Entity('UserPatient')
export class UserPatient extends BaseEntity {
  @PrimaryColumn('uuid')
  userId: string;

  @PrimaryColumn('uuid')
  patientId: string;

  @Column({ type: 'int' })
  ordinal: number;

  @ManyToOne(() => User, (user) => user.userPatients, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Patient, (patient) => patient.userPatients, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'patientId' })
  patient: Patient;
}
