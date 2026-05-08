import { fakerID_ID as faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Seeder } from 'nestjs-seeder';
import { DataSource, Repository } from 'typeorm';
import { Day } from '../../common/enums/day.enum';
import { Department } from '../../modules/department/entities/department.entity';
import { Employee } from '../../modules/employee/entities/employee.entity';
import { NurseSchedule } from '../../modules/nurse/entities/nurse-schedule.entity';
import { Nurse } from '../../modules/nurse/entities/nurse.entity';
import { User } from '../../modules/user/entities/user.entity';
import { UserRole } from '../../modules/user/enums/user-role.enum';
import { generateUser } from './functions';

const NURSE_COUNT = 50;

function generateSchedules(): Partial<NurseSchedule>[] {
  const count = faker.number.int({ min: 4, max: 5 });
  const days = faker.helpers.arrayElements(Object.values(Day), count);
  return days.map((day) => {
    const startHour = faker.number.int({ min: 0, max: 15 });
    const endHour = startHour + faker.number.int({ min: 8, max: 9 });
    return { day, startTime: `${startHour}:00`, endTime: `${endHour}:00` };
  });
}

@Injectable()
export class NurseSeeder implements Seeder {
  private generatedNurseUsers: Partial<User>[] = Array.from(
    { length: NURSE_COUNT },
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
      const existingCount = await manager.count(Nurse);
      if (existingCount > 0) return;

      const departments = await manager.findBy(Department, {
        isClinic: true,
        isActive: true,
      });

      const users = await manager.save(
        User,
        this.generatedNurseUsers.map((u) => manager.create(User, u)),
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

      const nurses = await manager.save(
        Nurse,
        employees.map((employee) => manager.create(Nurse, { employee })),
      );

      const schedules = nurses.flatMap((nurse) =>
        generateSchedules().map((schedule) =>
          manager.create(NurseSchedule, { ...schedule, nurse }),
        ),
      );
      await manager.save(NurseSchedule, schedules);

      console.log(`Created ${nurses.length} nurses`);
    });
  }

  async drop() {
    await this.userRepository.delete(this.generatedNurseUsers);
  }
}
