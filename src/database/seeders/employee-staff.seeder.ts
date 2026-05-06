import { fakerID_ID as faker_ID } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Seeder } from 'nestjs-seeder';
import { Repository } from 'typeorm';
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
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
  ) {}

  async seed() {
    const existingStaffCount = await this.employeeRepository
      .createQueryBuilder('employee')
      .leftJoin('employee.user', 'user')
      .leftJoin('employee.doctor', 'doctor')
      .leftJoin('employee.nurse', 'nurse')
      .where('user.role = :role', { role: UserRole.Staff })
      .andWhere('doctor.doctorId IS NULL')
      .andWhere('nurse.nurseId IS NULL')
      .andWhere('employee.jobTitle IS NOT NULL')
      .getCount();
    if (existingStaffCount > 0) return;

    const departments = await this.departmentRepository.findBy({
      isClinic: false,
      isActive: true,
    });
    if (departments.length === 0) return;

    // ER is treated as a complex department, so we intentionally increase its
    // share in staff distribution (dispatcher, transport, ambulance, etc).
    const emergencyDepartment = departments.find(
      (department) => department.typeCode === 'emergency',
    );
    const departmentPool = [...departments];
    if (emergencyDepartment) {
      departmentPool.push(emergencyDepartment, emergencyDepartment);
    }

    const createdUsers = await Promise.all(
      this.generatedStaffUsers.map(async (user) =>
        this.userRepository.save(this.userRepository.create(user)),
      ),
    );

    const createdEmployees = await Promise.all(
      createdUsers.map(async (user, index) => {
        const department = departmentPool[index % departmentPool.length];
        const mappedTitles = JOB_TITLES_BY_DEPARTMENT[department.typeCode];
        const jobTitle = mappedTitles
          ? faker_ID.helpers.arrayElement(mappedTitles)
          : 'Administrative Staff';

        return this.employeeRepository.save(
          this.employeeRepository.create({
            user,
            startDate: faker_ID.date.past({ years: 8 }),
            departmentId: department.departmentId,
            jobTitle,
          }),
        );
      }),
    );

    console.log(`Created ${createdEmployees.length} staff employees`);
  }

  async drop() {
    await this.userRepository.delete(this.generatedStaffUsers);
  }
}
