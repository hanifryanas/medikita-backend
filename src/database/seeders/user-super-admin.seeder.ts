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
    private readonly dataSource: DataSource,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async seed() {
    await this.dataSource.transaction(async (manager) => {
      const existing = await manager.findOne(User, {
        where: { userName: this.superAdminUser.userName },
      });
      if (existing) return;

      const backOffice = await manager.findOneOrFail(Department, {
        where: { typeCode: 'backoffice' },
      });

      const user = await manager.save(
        User,
        manager.create(User, this.superAdminUser),
      );

      await manager.save(
        Employee,
        manager.create(Employee, {
          user,
          startDate: new Date(),
          departmentId: backOffice.departmentId,
        }),
      );
    });
  }

  async drop() {
    await this.userRepository.delete({
      userName: this.superAdminUser.userName,
    });
  }
}
