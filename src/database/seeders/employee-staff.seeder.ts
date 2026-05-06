import { fakerID_ID as faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Seeder } from 'nestjs-seeder';
import { DataSource, IsNull, Not, Repository } from 'typeorm';
import { Department } from '../../modules/department/entities/department.entity';
import { Employee } from '../../modules/employee/entities/employee.entity';
import { User } from '../../modules/user/entities/user.entity';
import { UserRole } from '../../modules/user/enums/user-role.enum';
import { generateUser } from './functions';

const STAFF_COUNT = 50;

const JOB_TITLES_BY_DEPARTMENT: Record<string, string[]> = {
  frontoffice: ['Registration Officer', 'Patient Service Officer'],
  backoffice: ['Administrative Officer', 'Billing Staff'],
  services: ['General Service Staff', 'Operations Staff'],
  laboratory: ['Laboratory Analyst', 'Laboratory Assistant'],
  pharmacy: ['Pharmacy Technician', 'Pharmacy Assistant'],
  radiology: ['Radiology Technician', 'Radiology Operator'],
  emergency: [
    'ER Unit Coordinator',
    'Emergency Admin Staff',
    'Ambulance Driver',
    'ER Dispatcher',
    'Patient Transport Staff',
    'Emergency Registration Officer',
  ],
  generalsurgery: ['Surgical Unit Coordinator', 'OT Administrative Staff'],
};

@Injectable()
export class EmployeeStaffSeeder implements Seeder {
  private generatedStaffUsers: Partial<User>[] = Array.from(
    { length: STAFF_COUNT },
    (_, index) =>
      generateUser({
        role: UserRole.Staff,
        index,
        includeAddress: true,
        birthYearRange: { min: 1970, max: 2002 },
      }),
  );

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async seed() {
    await this.dataSource.transaction(async (manager) => {
      const existingStaffCount = await manager.count(Employee, {
        where: {
          user: { role: UserRole.Staff },
          doctor: { doctorId: IsNull() },
          nurse: { nurseId: IsNull() },
          jobTitle: Not(IsNull()),
        },
        relations: { user: true, doctor: true, nurse: true },
      });
      if (existingStaffCount > 0) return;

      const departments = await manager.findBy(Department, {
        isClinic: false,
        isActive: true,
      });
      if (departments.length === 0) return;

      const emergencyDepartment = departments.find(
        (department) => department.typeCode === 'emergency',
      );
      const departmentPool = [...departments];
      if (emergencyDepartment) {
        departmentPool.push(emergencyDepartment, emergencyDepartment);
      }

      const users = await manager.save(
        User,
        this.generatedStaffUsers.map((u) => manager.create(User, u)),
      );

      const employees = await manager.save(
        Employee,
        users.map((user, index) => {
          const department = departmentPool[index % departmentPool.length];
          const mappedTitles = JOB_TITLES_BY_DEPARTMENT[department.typeCode];
          const jobTitle = mappedTitles
            ? faker.helpers.arrayElement(mappedTitles)
            : 'Administrative Staff';

          return manager.create(Employee, {
            user,
            startDate: faker.date.past({ years: 8 }),
            departmentId: department.departmentId,
            jobTitle,
          });
        }),
      );

      console.log(`Created ${employees.length} staff employees`);
    });
  }

  async drop() {
    await this.userRepository.delete(this.generatedStaffUsers);
  }
}
