import { fakerID_ID as faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Seeder } from 'nestjs-seeder';
import { DataSource, Repository } from 'typeorm';
import { Department } from '../../modules/department/entities/department.entity';
import { Employee } from '../../modules/employee/entities/employee.entity';
import { User } from '../../modules/user/entities/user.entity';
import { UserGenderType } from '../../modules/user/enums/user-gender.enum';
import { UserRole } from '../../modules/user/enums/user-role.enum';

@Injectable()
export class EmployeeAdminSeeder implements Seeder {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async seed() {
    await this.dataSource.transaction(async (manager) => {
      const existingAdmin = await manager.findOne(User, {
        where: { role: UserRole.Admin },
      });
      if (existingAdmin) return;

      const departments = await manager.find(Department);
      if (departments.length === 0) return;

      const users = await manager.save(
        User,
        departments.map((department) =>
          manager.create(User, {
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
            dateOfBirth: faker.date.birthdate({
              min: 1970,
              max: 2000,
              mode: 'year',
            }),
          }),
        ),
      );

      await manager.save(
        Employee,
        users.map((user) => {
          const department = departments.find(
            (dept) => `${dept.typeCode}admin` === user.userName,
          );
          return manager.create(Employee, {
            user,
            startDate: new Date(),
            departmentId: department.departmentId,
            photoUrl: faker.datatype.boolean({ probability: 0.65 })
              ? faker.image.avatar()
              : undefined,
          });
        }),
      );

      console.log(`Created ${users.length} admin employees`);
    });
  }

  async drop() {
    await this.userRepository.delete({ role: UserRole.Admin });
  }
}
