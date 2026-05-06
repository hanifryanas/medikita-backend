import { fakerID_ID as faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Seeder } from 'nestjs-seeder';
import { Repository } from 'typeorm';
import { PatientInsurance } from '../../modules/patient/entities/patient-insurance.entity';
import { Patient } from '../../modules/patient/entities/patient.entity';
import { InsuranceProviderType } from '../../modules/patient/enums/insurance-provider.enum';
import { UserPatient } from '../../modules/user/entities/user-patient.entity';
import { User } from '../../modules/user/entities/user.entity';
import { UserRelationship } from '../../modules/user/enums/user-relationship.enum';
import { generateUser } from './functions';

@Injectable()
export class PatientSeeder implements Seeder {
  private generatedPatientUsers: Partial<User>[] = Array.from(
    { length: 50 },
    () => generateUser({ includeAddress: true }),
  );

  private generatedPatientInsurances: Partial<PatientInsurance>[] = Array.from(
    { length: 50 },
    (): Partial<PatientInsurance> => {
      return {
        insuranceProvider: faker.helpers.arrayElement(
          Object.values(InsuranceProviderType),
        ),
        policyNumber: faker.string.alphanumeric(10).toUpperCase(),
      };
    },
  );

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(PatientInsurance)
    private readonly patientInsuranceRepository: Repository<PatientInsurance>,
    @InjectRepository(UserPatient)
    private readonly userPatientRepository: Repository<UserPatient>,
  ) {}

  async seed() {
    const existingPatientCount = await this.patientRepository.count();
    const hasExistingPatients = existingPatientCount > 0;
    if (hasExistingPatients) return;

    const createdPatientUsers = await Promise.all(
      this.generatedPatientUsers.map(
        async (user) =>
          await this.userRepository.save(this.userRepository.create(user)),
      ),
    );

    const createPatients: Partial<Patient>[] = createdPatientUsers.map(
      (user) => ({
        identityNumber: user.identityNumber,
        firstName: user.firstName,
        lastName: user.lastName,
        gender: user.gender,
        phoneNumber: user.phoneNumber,
        dateOfBirth: user.dateOfBirth,
        address: user.address,
      }),
    );

    // Sequential to avoid race in PatientSubscriber when seeding the very
    // first MedicalRecordCounter row.
    const createdPatients: Patient[] = [];
    for (const patient of createPatients) {
      const saved = await this.patientRepository.save(
        this.patientRepository.create(patient),
      );
      createdPatients.push(saved);
    }

    await Promise.all(
      createdPatientUsers.map((user, index) =>
        this.userPatientRepository.save(
          this.userPatientRepository.create({
            userId: user.userId,
            patientId: createdPatients[index].patientId,
            ordinal: 1,
            relationship: UserRelationship.Self,
          }),
        ),
      ),
    );

    this.generatedPatientInsurances.forEach((insurance, index) => {
      insurance.patient = createdPatients[index % createdPatients.length];
    });

    await Promise.all(
      this.generatedPatientInsurances.map(
        async (insurance) =>
          await this.patientInsuranceRepository.save(
            this.patientInsuranceRepository.create(insurance),
          ),
      ),
    );
  }

  drop() {
    return this.userRepository.delete(this.generatedPatientUsers);
  }
}
