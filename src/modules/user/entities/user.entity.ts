import { ApiHideProperty } from '@nestjs/swagger';
import { hashSync } from 'bcryptjs';
import { Exclude, Expose } from 'class-transformer';
import { differenceInYears } from 'date-fns';
import {
  AfterLoad,
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Employee } from '../../employee/entities/employee.entity';
import { UserGenderType } from '../enums/user-gender.enum';
import { UserRole } from '../enums/user-role.enum';
import { UserPatient } from './user-patient.entity';
import { UserToken } from './user-token.entity';

@Entity('User')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  userId: string;

  @Column({ length: 20, unique: true })
  identityNumber: string;

  @Column({ length: 100, unique: true })
  email: string;

  @Column({ length: 25, unique: true })
  userName: string;

  @Column({ select: false })
  @Exclude({ toPlainOnly: true })
  @ApiHideProperty()
  password: string;

  @Exclude({ toPlainOnly: true })
  @ApiHideProperty()
  private tempPassword?: string;

  @AfterLoad()
  private loadTempPassword(): void {
    this.tempPassword = this.password;
  }

  @BeforeInsert()
  @BeforeUpdate()
  private hashPassword(): void {
    if (this.tempPassword !== this.password) {
      this.password = hashSync(this.password, 10);
    }
  }

  @Column({ length: 25 })
  firstName: string;

  @Column({ length: 25 })
  lastName: string;

  @Column({ nullable: true })
  photoUrl?: string;

  @Column({ type: 'enum', enum: UserGenderType })
  gender: UserGenderType;

  @Column()
  phoneNumber: string;

  @Column({ type: 'date' })
  dateOfBirth: Date;

  @Expose()
  get age(): number {
    return differenceInYears(new Date(), new Date(this.dateOfBirth));
  }

  @OneToOne(() => Employee, (employee) => employee.user)
  employee?: Employee;

  @Expose({ groups: ['user-full'], toPlainOnly: true })
  get isEmployee(): boolean {
    return !!this.employee;
  }

  @OneToMany(() => UserPatient, (userPatient) => userPatient.user)
  userPatients?: UserPatient[];

  @Column({ nullable: true })
  address?: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.User })
  @Expose({ groups: ['user-full'], toPlainOnly: true })
  role: UserRole;

  @Exclude({ toPlainOnly: true })
  @ApiHideProperty()
  @OneToMany(() => UserToken, (token) => token.user)
  tokens?: UserToken[];
}
