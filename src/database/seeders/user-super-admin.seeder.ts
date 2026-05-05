import { fakerID_ID as faker } from '@faker-js/faker';
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
export class UserSuperAdminSeeder implements Seeder {
  private superAdminUser: Partial<User> = {
    identityNumber: faker.string.numeric(16),
    email: 'superadmin@mail.com',
    userName: 'superadmin',
    password: 'superadmin',
    firstName: 'Super',
    lastName: 'Admin',
    gender: UserGenderType.Male,
    role: UserRole.SuperAdmin,
    phoneNumber: `628${faker.string.numeric(10)}`,
    dateOfBirth: faker.date.birthdate({ min: 1970, max: 2000, mode: 'year' }),
  };

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
  ) {}

  async seed() {
    const existingSuperAdminUser = await this.userRepository.findOne({
      where: { userName: this.superAdminUser.userName },
    });
    if (existingSuperAdminUser) return;

    const backOfficeDepartment = await this.departmentRepository.findOneOrFail({
      where: { typeCode: 'backoffice' },
    });

    const user = this.userRepository.create(this.superAdminUser);
    const createdUser = await this.userRepository.save(user);

    const superAdminEmployee: Partial<Employee> = {
      user: createdUser,
      startDate: new Date(),
      departmentId: backOfficeDepartment.departmentId,
    };

    const employee = this.employeeRepository.create(superAdminEmployee);
    await this.employeeRepository.save(employee);
  }

  async drop() {
    await this.userRepository.delete({
      userName: this.superAdminUser.userName,
    });
  }
}
