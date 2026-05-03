import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Day } from '../../../common/enums/day.enum';
import { Nurse } from './nurse.entity';

@Entity('NurseSchedule')
export class NurseSchedule extends BaseEntity {
  @PrimaryGeneratedColumn('identity')
  nurseScheduleId: number;

  @ManyToOne(() => Nurse, (nurse) => nurse.schedules, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'nurseId' })
  nurse: Nurse;

  @Column({ type: 'enum', enum: Day })
  day: Day;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;
}
