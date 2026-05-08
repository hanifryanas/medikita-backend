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

const DOCTOR_COUNT = 50;

/** Maps a department typeCode to the Indonesian specialist title (Sp.XX)
 *  and plain-language job title for doctors assigned to that department. */
const DOCTOR_TITLE_BY_DEPARTMENT: Record<
  string,
  { title: string; jobTitle: string }
> = {
  cardiology: { title: 'Sp.JP', jobTitle: 'Cardiologist' },
  dermatology: { title: 'Sp.KK', jobTitle: 'Dermatologist' },
  pediatrics: { title: 'Sp.A', jobTitle: 'Pediatrician' },
  neurology: { title: 'Sp.S', jobTitle: 'Neurologist' },
  orthopedics: { title: 'Sp.OT', jobTitle: 'Orthopedic Surgeon' },
  obgyn: { title: 'Sp.OG', jobTitle: 'Obstetrician-Gynecologist' },
  oncology: { title: 'Sp.Onk', jobTitle: 'Oncologist' },
  otolaryngology: { title: 'Sp.THT-KL', jobTitle: 'ENT Specialist' },
  ophthalmology: { title: 'Sp.M', jobTitle: 'Ophthalmologist' },
  urology: { title: 'Sp.U', jobTitle: 'Urologist' },
  internist: { title: 'Sp.PD', jobTitle: 'Internist' },
  psychiatry: { title: 'Sp.KJ', jobTitle: 'Psychiatrist' },
  physiatry: { title: 'Sp.KFR', jobTitle: 'Physiatrist' },
  pulmonology: { title: 'Sp.P', jobTitle: 'Pulmonologist' },
  endocrinology: { title: 'Sp.PD-KEMD', jobTitle: 'Endocrinologist' },
};

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

      const users = await manager.save(
        User,
        this.generatedDoctorUsers.map((u) => manager.create(User, u)),
      );

      const employees = await manager.save(
        Employee,
        users.map((user, index) => {
          const department = faker.helpers.arrayElement(departments);
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
        employees.map((employee) => {
          const department = departments.find(
            (d) => d.departmentId === employee.departmentId,
          );
          const titles = department
            ? DOCTOR_TITLE_BY_DEPARTMENT[department.typeCode]
            : undefined;
          return manager.create(Doctor, {
            employee,
            title: titles?.title,
            jobTitle: titles?.jobTitle,
          });
        }),
      );

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
