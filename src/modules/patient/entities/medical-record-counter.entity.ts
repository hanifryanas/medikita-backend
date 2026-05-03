import { Check, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('MedicalRecordCounter')
@Check('"lastSequence" >= 0 AND "lastSequence" <= 999999')
export class MedicalRecordCounter {
  @PrimaryColumn({ length: 6 })
  yearMonth: string;

  @Column({ type: 'int', default: 0 })
  lastSequence: number;
}
