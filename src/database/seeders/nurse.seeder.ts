import { fakerID_ID as faker } from '@faker-js/faker';
import { InjectRepository } from '@nestjs/typeorm';
import { Seeder } from 'nestjs-seeder';
import { Repository } from 'typeorm';
import { Day } from '../../common/enums/day.enum';
import { Department } from '../../modules/department/entities/department.entity';
import { Employee } from '../../modules/employee/entities/employee.entity';
import { NurseSchedule } from '../../modules/nurse/entities/nurse-schedule.entity';
import { Nurse } from '../../modules/nurse/entities/nurse.entity';
import { User } from '../../modules/user/entities/user.entity';
import { UserRole } from '../../modules/user/enums/user-role.enum';
import { generateUser } from './functions';

export class NurseSeeder implements Seeder {
  private generatedNurseUsers: Partial<User>[] = Array.from(
    { length: 50 },
    () =>
      generateUser({
        role: [UserRole.Staff, UserRole.Admin],
        includeAddress: true,
      }),
  );

  private generatedNurseEmployeeMap: Map<string, Partial<Employee>> = new Map(
    this.generatedNurseUsers.map((user) => [
      user.userName,
      {
        startDate: faker.date.past({ years: 5 }),
      },
    ]),
  );

  private generatedNurseScheduleMap: Map<string, Partial<NurseSchedule>[]> =
    new Map(
      this.generatedNurseUsers.map((user) => {
        const schedules: Partial<NurseSchedule>[] = [];
        const numberOfSchedules = faker.number.int({ min: 4, max: 5 });
        const days = faker.helpers.arrayElements(
          Object.values(Day),
          numberOfSchedules,
        );
        days.forEach((day) => {
          const startHour = faker.number.int({ min: 0, max: 15 });
          const endHour = startHour + faker.number.int({ min: 8, max: 9 });
          schedules.push({
            day,
            startTime: `${startHour}:00`,
            endTime: `${endHour}:00`,
          });
        });

        return [user.userName, schedules];
      }),
    );

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(Nurse)
    private readonly nurseRepository: Repository<Nurse>,
    @InjectRepository(NurseSchedule)
    private readonly nurseScheduleRepository: Repository<NurseSchedule>,
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
  ) {}

  async seed() {
    const existingNurseCount = await this.nurseRepository.count();
    const hasExistingNurses = existingNurseCount > 0;
    if (hasExistingNurses) return;

    const nurseDepartments = await this.departmentRepository.findBy({
      isClinic: true,
      isActive: true,
    });

    const createdNurseUsers = await Promise.all(
      this.generatedNurseUsers.map(
        async (user) => await this.userRepository.save(user),
      ),
    );

    const createdEmployees = await Promise.all(
      createdNurseUsers.map(async (user) => {
        const employeeData = this.generatedNurseEmployeeMap.get(user.userName);
        const department = faker.helpers.arrayElement(nurseDepartments);
        const employee = this.employeeRepository.create({
          ...employeeData,
          user,
          departmentId: department.departmentId,
        });
        return await this.employeeRepository.save(employee);
      }),
    );

    const createdNurses = await Promise.all(
      createdEmployees.map(async (employee) => {
        const nurse = this.nurseRepository.create({
          employee,
        });
        return await this.nurseRepository.save(nurse);
      }),
    );

    const nurseSchedules: Partial<NurseSchedule>[] = [];
    createdNurses.forEach((nurse) => {
      const schedules = this.generatedNurseScheduleMap.get(
        nurse.employee.user.userName,
      );
      schedules?.forEach((schedule) => {
        nurseSchedules.push({
          ...schedule,
          nurse,
        });
      });
    });

    await Promise.all(
      nurseSchedules.map(
        async (schedule) =>
          await this.nurseScheduleRepository.save(
            this.nurseScheduleRepository.create(schedule),
          ),
      ),
    );
  }

  async drop() {
    await this.userRepository.delete(this.generatedNurseUsers);
  }
}
