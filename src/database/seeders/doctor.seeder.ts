import { fakerID_ID as faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Seeder } from 'nestjs-seeder';
import { DataSource, Repository } from 'typeorm';
import { Day } from '../../common/enums/day.enum';
import { Department } from '../../modules/department/entities/department.entity';
import { DoctorSchedule } from '../../modules/doctor/entities/doctor-schedule.entity';
import { Doctor } from '../../modules/doctor/entities/doctor.entity';
import { Employee } from '../../modules/employee/entities/employee.entity';
import { User } from '../../modules/user/entities/user.entity';
import { UserRole } from '../../modules/user/enums/user-role.enum';
import { generateUser } from './functions';

/** Maps a department typeCode to the Indonesian specialist title (Sp.XX),
 *  plain-language job title, and the number of doctors to seed for it. */
const DOCTOR_CONFIG_BY_DEPARTMENT: Record<
  string,
  { title: string; jobTitle: string; count: number }
> = {
  cardiology: { title: 'Sp.JP', jobTitle: 'Cardiologist', count: 4 },
  dermatology: { title: 'Sp.KK', jobTitle: 'Dermatologist', count: 5 },
  pediatrics: { title: 'Sp.A', jobTitle: 'Pediatrician', count: 6 },
  neurology: { title: 'Sp.S', jobTitle: 'Neurologist', count: 3 },
  orthopedics: { title: 'Sp.OT', jobTitle: 'Orthopedic Surgeon', count: 4 },
  obgyn: { title: 'Sp.OG', jobTitle: 'Obstetrician-Gynecologist', count: 6 },
  oncology: { title: 'Sp.Onk', jobTitle: 'Oncologist', count: 3 },
  otolaryngology: { title: 'Sp.THT-KL', jobTitle: 'ENT Specialist', count: 3 },
  ophthalmology: { title: 'Sp.M', jobTitle: 'Ophthalmologist', count: 3 },
  urology: { title: 'Sp.U', jobTitle: 'Urologist', count: 3 },
  internist: { title: 'Sp.PD', jobTitle: 'Internist', count: 5 },
  psychiatry: { title: 'Sp.KJ', jobTitle: 'Psychiatrist', count: 4 },
  physiatry: { title: 'Sp.KFR', jobTitle: 'Physiatrist', count: 3 },
  pulmonology: { title: 'Sp.P', jobTitle: 'Pulmonologist', count: 4 },
  endocrinology: { title: 'Sp.PD-KEMD', jobTitle: 'Endocrinologist', count: 4 },
};

/** Flattened plan: one entry per doctor to be seeded. */
const DOCTOR_ASSIGNMENTS: { typeCode: string }[] = Object.entries(
  DOCTOR_CONFIG_BY_DEPARTMENT,
).flatMap(([typeCode, { count }]) =>
  Array.from({ length: count }, () => ({ typeCode })),
);

const DOCTOR_COUNT = DOCTOR_ASSIGNMENTS.length;

function generateSchedules(): Partial<DoctorSchedule>[] {
  const count = faker.number.int({ min: 3, max: 6 });
  const days = faker.helpers.arrayElements(Object.values(Day), count);
  return days.map((day) => {
    const startHour = faker.number.int({ min: 8, max: 14 });
    const endHour = startHour + faker.number.int({ min: 2, max: 4 });
    return { day, startTime: `${startHour}:00`, endTime: `${endHour}:00` };
  });
}

@Injectable()
export class DoctorSeeder implements Seeder {
  private generatedDoctorUsers: Partial<User>[] = Array.from(
    { length: DOCTOR_COUNT },
    () =>
      generateUser({
        role: UserRole.CareTeam,
        includeAddress: true,
      }),
  );

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async seed() {
    await this.dataSource.transaction(async (manager) => {
      const existingCount = await manager.count(Doctor);
      if (existingCount > 0) return;

      const departments = await manager.findBy(Department, {
        isClinic: true,
        isActive: true,
      });
      const departmentByTypeCode = new Map(
        departments.map((d) => [d.typeCode, d]),
      );

      const users = await manager.save(
        User,
        this.generatedDoctorUsers.map((u) => manager.create(User, u)),
      );

      const employees = await manager.save(
        Employee,
        users.map((user, index) => {
          const { typeCode } = DOCTOR_ASSIGNMENTS[index];
          const department = departmentByTypeCode.get(typeCode);
          if (!department) {
            throw new Error(
              `DoctorSeeder: department '${typeCode}' not found. Run DepartmentSeeder first.`,
            );
          }
          const genderPath = user.gender === 'male' ? 'men' : 'women';
          const photoIndex = index % 100;
          return manager.create(Employee, {
            user,
            startDate: faker.date.past({ years: 5 }),
            departmentId: department.departmentId,
            photoUrl: faker.datatype.boolean({ probability: 0.65 })
              ? `https://randomuser.me/api/portraits/${genderPath}/${photoIndex}.jpg`
              : undefined,
          });
        }),
      );

      const doctors = await manager.save(
        Doctor,
        employees.map((employee, index) => {
          const { typeCode } = DOCTOR_ASSIGNMENTS[index];
          const config = DOCTOR_CONFIG_BY_DEPARTMENT[typeCode];
          return manager.create(Doctor, {
            employee,
            title: config.title,
            jobTitle: config.jobTitle,
          });
        }),
      );

      let offset = 0;
      const featuredEmployees = Object.values(
        DOCTOR_CONFIG_BY_DEPARTMENT,
      ).flatMap(({ count }) => {
        const group = employees.slice(offset, offset + count);
        offset += count;
        return group
          .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
          .slice(0, 3)
          .map((employee, index) =>
            Object.assign(employee, { featuredOrdinal: index + 1 }),
          );
      });
      await manager.save(Employee, featuredEmployees);

      const schedules = doctors.flatMap((doctor) =>
        generateSchedules().map((schedule) =>
          manager.create(DoctorSchedule, { ...schedule, doctor }),
        ),
      );
      await manager.save(DoctorSchedule, schedules);

      console.log(`Created ${doctors.length} doctors`);
    });
  }

  async drop() {
    await this.userRepository.delete(this.generatedDoctorUsers);
  }
}
