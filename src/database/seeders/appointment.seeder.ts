import { fakerID_ID as faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';
import { Seeder } from 'nestjs-seeder';
import { DataSource } from 'typeorm';
import { Schedule } from '../../common/entities/schedule.entity';
import { Day } from '../../common/enums/day.enum';
import { Status } from '../../common/enums/status.enum';
import { Appointment } from '../../modules/appointment/entities/appointment.entity';
import { Doctor } from '../../modules/doctor/entities/doctor.entity';
import { Nurse } from '../../modules/nurse/entities/nurse.entity';
import { Patient } from '../../modules/patient/entities/patient.entity';

const APPOINTMENT_COUNT = 1500;
/** Date window: from PAST_DAYS in the past to FUTURE_DAYS in the future. */
const PAST_DAYS = 60;
const FUTURE_DAYS = 30;
/** Probability that an appointment is placed in the past window. */
const PAST_RATIO = 0.8;

const DAY_TO_INDEX: Record<Day, number> = {
  [Day.Sunday]: 0,
  [Day.Monday]: 1,
  [Day.Tuesday]: 2,
  [Day.Wednesday]: 3,
  [Day.Thursday]: 4,
  [Day.Friday]: 5,
  [Day.Saturday]: 6,
};

const CONCERNS = [
  'High fever for the past 3 days accompanied by chills.',
  'Chest pain on the left side, especially during physical activity.',
  'Persistent throbbing headache that does not improve.',
  'Productive cough lasting more than two weeks.',
  'Shortness of breath when climbing stairs.',
  'Itching and red rash on the arm.',
  'Heartburn and nausea after meals.',
  'Routine follow-up for blood pressure and cholesterol.',
  'Knee joint pain while walking.',
  'Consultation regarding recent laboratory results.',
  'Child has a fever along with mild diarrhea.',
  'Difficulty sleeping and excessive anxiety.',
  'Routine second-trimester pregnancy check-up.',
  'Blurred vision over the past several weeks.',
  'Ringing in the ears and decreased hearing.',
];

const DIAGNOSES = [
  'Acute upper respiratory tract infection',
  'Stage 1 hypertension',
  'Acute gastritis',
  'Migraine without aura',
  'Contact dermatitis',
  'Acute pharyngitis',
  'Mild bronchial asthma',
  'Type 2 diabetes mellitus',
  'Knee osteoarthritis',
  'Iron deficiency anemia',
];

const ROOM_FLOOR_MIN = 2;
const ROOM_FLOOR_MAX = 5;
const ROOMS_PER_FLOOR = 20;

function randomRoom(): string {
  const floor = faker.number.int({ min: ROOM_FLOOR_MIN, max: ROOM_FLOOR_MAX });
  const room = faker.number.int({ min: 1, max: ROOMS_PER_FLOOR });
  return `${floor}${room.toString().padStart(2, '0')}`;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/** Returns a Date whose weekday matches `day`, biased to the past or future
 *  window per `isPast`. */
function pickDateForDay(day: Day, now: Date, isPast: boolean): Date {
  const targetIndex = DAY_TO_INDEX[day];
  const minOffset = isPast ? -PAST_DAYS : 1;
  const maxOffset = isPast ? 0 : FUTURE_DAYS;
  // Collect candidate dates in the chosen window that match the weekday.
  const candidates: Date[] = [];
  for (let offset = minOffset; offset <= maxOffset; offset++) {
    const candidate = new Date(now);
    candidate.setDate(candidate.getDate() + offset);
    if (candidate.getDay() === targetIndex) {
      candidates.push(candidate);
    }
  }
  return faker.helpers.arrayElement(candidates);
}

@Injectable()
export class AppointmentSeeder implements Seeder {
  constructor(private readonly dataSource: DataSource) {}

  async seed(): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const existingCount = await manager.count(Appointment);
      if (existingCount > 0) return;

      const doctors = await manager.find(Doctor, {
        relations: { employee: true, schedules: true },
      });
      const doctorsWithSchedules = doctors.filter(
        (d) => d.schedules && d.schedules.length > 0,
      );

      if (doctorsWithSchedules.length === 0) {
        console.warn(
          'AppointmentSeeder: no doctors with schedules found, skipping.',
        );
        return;
      }

      const nurses = await manager.find(Nurse, {
        relations: { employee: true },
      });
      const nursesByDepartment = new Map<number, Nurse[]>();
      for (const nurse of nurses) {
        const departmentId = nurse.employee?.departmentId;
        if (!departmentId) continue;
        const bucket = nursesByDepartment.get(departmentId) ?? [];
        bucket.push(nurse);
        nursesByDepartment.set(departmentId, bucket);
      }

      const patients = await manager.find(Patient);
      if (patients.length === 0) {
        console.warn('AppointmentSeeder: no patients found, skipping.');
        return;
      }

      const now = new Date();
      const appointments: Appointment[] = [];

      for (let i = 0; i < APPOINTMENT_COUNT; i++) {
        const doctor = faker.helpers.arrayElement(doctorsWithSchedules);
        const schedule = faker.helpers.arrayElement(doctor.schedules);

        const startMin = timeToMinutes(schedule.startTime);
        const endMin = timeToMinutes(schedule.endTime);
        const slotMinutes = Schedule.SLOT_MINUTES;
        const slotCount = Math.floor((endMin - startMin) / slotMinutes);
        if (slotCount <= 0) continue;

        const slotIndex = faker.number.int({ min: 0, max: slotCount - 1 });
        const slotStartMin = startMin + slotIndex * slotMinutes;

        const isPast = faker.datatype.boolean({ probability: PAST_RATIO });
        const date = pickDateForDay(schedule.day, now, isPast);
        const startTime = new Date(date);
        startTime.setHours(
          Math.floor(slotStartMin / 60),
          slotStartMin % 60,
          0,
          0,
        );
        const endTime = new Date(startTime.getTime() + slotMinutes * 60_000);

        let status: Status;
        if (endTime < now) {
          status = faker.helpers.weightedArrayElement([
            { value: Status.Completed, weight: 40 },
            { value: Status.Cancelled, weight: 1 },
          ]);
        } else {
          status = faker.helpers.weightedArrayElement([
            { value: Status.Incompleted, weight: 60 },
            { value: Status.Cancelled, weight: 1 },
          ]);
        }

        const patient = faker.helpers.arrayElement(patients);

        const departmentId = doctor.employee?.departmentId;
        const departmentNurses = departmentId
          ? (nursesByDepartment.get(departmentId) ?? [])
          : [];
        const assignedNurses =
          departmentNurses.length > 0
            ? faker.helpers.arrayElements(
                departmentNurses,
                faker.number.int({
                  min: 1,
                  max: Math.min(2, departmentNurses.length),
                }),
              )
            : [];

        const isCompleted = status === Status.Completed;

        appointments.push(
          manager.create(Appointment, {
            status,
            startTime,
            endTime,
            patient,
            doctor,
            nurses: assignedNurses,
            concern: faker.helpers.arrayElement(CONCERNS),
            diagnosis: isCompleted
              ? faker.helpers.arrayElement(DIAGNOSES)
              : undefined,
            notes:
              isCompleted && faker.datatype.boolean({ probability: 0.5 })
                ? faker.lorem.sentence()
                : undefined,
            room: randomRoom(),
          }),
        );
      }

      await manager.save(Appointment, appointments);
      console.log(`Created ${appointments.length} appointments`);
    });
  }

  async drop(): Promise<void> {
    // Use raw TRUNCATE with CASCADE so the join table (AppointmentNurse)
    // is cleared too. `repository.delete({})` is a no-op in TypeORM 0.3.
    await this.dataSource.query(
      'TRUNCATE TABLE "Appointment" RESTART IDENTITY CASCADE',
    );
  }
}
