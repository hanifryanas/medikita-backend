import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Schedule } from '../../../common/entities/schedule.entity';
import { Nurse } from './nurse.entity';

@Entity('NurseSchedule')
export class NurseSchedule extends Schedule {
  @PrimaryGeneratedColumn('identity')
  nurseScheduleId: number;

  @ManyToOne(() => Nurse, (nurse) => nurse.schedules, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'nurseId' })
  nurse: Nurse;
}
