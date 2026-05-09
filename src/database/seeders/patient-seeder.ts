import { fakerID_ID as faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Seeder } from 'nestjs-seeder';
import { DataSource, Repository } from 'typeorm';
import { PatientInsurance } from '../../modules/patient/entities/patient-insurance.entity';
import { Patient } from '../../modules/patient/entities/patient.entity';
import { InsuranceProviderType } from '../../modules/patient/enums/insurance-provider.enum';
import { UserPatient } from '../../modules/user/entities/user-patient.entity';
import { User } from '../../modules/user/entities/user.entity';
import { UserRelationship } from '../../modules/user/enums/user-relationship.enum';
import { generateUser } from './functions';

const PATIENT_COUNT = 150;

@Injectable()
export class PatientSeeder implements Seeder {
  private generatedPatientUsers: Partial<User>[] = Array.from(
    { length: PATIENT_COUNT },
    (_, i) => generateUser({ includeAddress: true, index: i }),
  );

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async seed() {
    await this.dataSource.transaction(async (manager) => {
      const existingCount = await manager.count(Patient);
      if (existingCount > 0) return;

      const users = await manager.save(
        User,
        this.generatedPatientUsers.map((user) => manager.create(User, user)),
      );

      const patients = await manager.save(
        Patient,
        users.map((user) =>
          manager.create(Patient, {
            identityNumber: user.identityNumber,
            firstName: user.firstName,
            lastName: user.lastName,
            gender: user.gender,
            phoneNumber: user.phoneNumber,
            dateOfBirth: user.dateOfBirth,
            address: user.address,
          }),
        ),
      );

      await manager.save(
        UserPatient,
        users.map((user, index) =>
          manager.create(UserPatient, {
            userId: user.userId,
            patientId: patients[index].patientId,
            ordinal: 1,
            relationship: UserRelationship.Self,
          }),
        ),
      );

      await manager.save(
        PatientInsurance,
        patients.map((patient) =>
          manager.create(PatientInsurance, {
            patient,
            insuranceProvider: faker.helpers.arrayElement(
              Object.values(InsuranceProviderType),
            ),
            policyNumber: faker.string.alphanumeric(10).toUpperCase(),
          }),
        ),
      );
    });
  }

  drop() {
    return this.userRepository.delete(this.generatedPatientUsers);
  }
}
