import { formatDate } from 'date-fns';
import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';
import { formatSequence, yearMonthFormat } from '../../../common/functions';
import { MedicalRecordCounter } from '../entities/medical-record-counter.entity';
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

    const medicalRecordCounterRepository =
      event.manager.getRepository(MedicalRecordCounter);

    // Pessimistic row lock serializes concurrent inserts on the same month.
    let counter = await medicalRecordCounterRepository.findOne({
      where: { yearMonth },
      lock: { mode: 'pessimistic_write' },
    });

    if (counter) {
      counter.lastSequence += 1;
    } else {
      counter = medicalRecordCounterRepository.create({
        yearMonth,
        lastSequence: 1,
      });
    }
    await medicalRecordCounterRepository.save(counter);

    const sequence = formatSequence(
      counter.lastSequence,
      MEDICAL_RECORD_SEQUENCE_DIGITS,
    );
    event.entity.medicalRecordNumber = `${yearMonth}${sequence}`;
  }
}
