import { formatDate } from 'date-fns';
import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';
import { formatSequence, yearMonthFormat } from '../../../common/functions';
import { Patient } from '../entities/patient.entity';

const MEDICAL_RECORD_SEQUENCE_DIGITS = 6;

@EventSubscriber()
export class PatientSubscriber implements EntitySubscriberInterface<Patient> {
  listenTo() {
    return Patient;
  }

  async beforeInsert(event: InsertEvent<Patient>): Promise<void> {
    if (event.entity.medicalRecordNumber) return;

    const yearMonth = formatDate(new Date(), yearMonthFormat);

    // Atomic upsert + increment to handle concurrent inserts safely.
    const result: { lastSequence: number }[] = await event.manager.query(
      `INSERT INTO "MedicalRecordCounter" ("yearMonth", "lastSequence")
       VALUES ($1, 1)
       ON CONFLICT ("yearMonth")
       DO UPDATE SET "lastSequence" = "MedicalRecordCounter"."lastSequence" + 1
       RETURNING "lastSequence"`,
      [yearMonth],
    );
    const lastSequence = result[0].lastSequence;

    const sequence = formatSequence(
      lastSequence,
      MEDICAL_RECORD_SEQUENCE_DIGITS,
    );
    event.entity.medicalRecordNumber = `${yearMonth}${sequence}`;
  }
}
