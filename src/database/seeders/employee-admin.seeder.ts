import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Seeder } from 'nestjs-seeder';
import { Repository } from 'typeorm';
import { Department } from '../../modules/department/entities/department.entity';
import { Employee } from '../../modules/employee/entities/employee.entity';
import { User } from '../../modules/user/entities/user.entity';
import { UserGenderType } from '../../modules/user/enums/user-gender.enum';
import { UserRole } from '../../modules/user/enums/user-role.enum';

@Injectable()
export class EmployeeAdminSeeder implements Seeder {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
  ) {}

  async seed() {
    const existingAdminUsers = await this.userRepository.findOne({
      where: { role: UserRole.Admin },
    });
    if (existingAdminUsers) return;

    const departments = await this.departmentRepository.find();

    const employeeUsers: Partial<User>[] = departments.map((department) => ({
      identityNumber: faker.string.numeric(16),
      email: `${department.typeCode}admin@mail.com`,
      userName: `${department.typeCode}admin`,
      password: `${department.typeCode}admin`,
      firstName:
        department.typeCode.charAt(0).toUpperCase() +
        department.typeCode.slice(1),
      lastName: 'Admin',
      gender: faker.helpers.arrayElement(Object.values(UserGenderType)),
      role: UserRole.Admin,
      phoneNumber: `628${faker.string.numeric(10)}`,
      dateOfBirth: faker.date.birthdate({ min: 1970, max: 2000, mode: 'year' }),
    }));

    const createdUsers = await Promise.all(
      employeeUsers.map(
        async (user) =>
          await this.userRepository.save(this.userRepository.create(user)),
      ),
    );

    const employeeAdmins: Partial<Employee>[] = createdUsers.map((user) => {
      const department = departments.find(
        (dept) => `${dept.typeCode}admin` === user.userName,
      )!;
      return {
        user,
        startDate: new Date(),
        departmentId: department.departmentId,
      };
    });

    await Promise.all(
      employeeAdmins.map(
        async (employee) =>
          await this.employeeRepository.save(
            this.employeeRepository.create(employee),
          ),
      ),
    );
  }

  async drop() {
    await this.userRepository.delete({ role: UserRole.Admin });
  }
}
