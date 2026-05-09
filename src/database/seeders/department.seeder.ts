import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Seeder } from 'nestjs-seeder';
import { DataSource, Repository } from 'typeorm';
import { Department } from '../../modules/department/entities/department.entity';

const DEPARTMENT_SEED: Partial<Department>[] = [
  // Operational units
  {
    typeCode: 'frontoffice',
    displayName: 'Front Office',
    isClinical: false,
    isClinic: false,
    isActive: true,
  },
  {
    typeCode: 'backoffice',
    displayName: 'Back Office',
    isClinical: false,
    isClinic: false,
    isActive: true,
  },
  {
    typeCode: 'services',
    displayName: 'Support Services',
    isClinical: false,
    isClinic: false,
    isActive: true,
  },
  // Clinical support units that do not run an outpatient clinic
  {
    typeCode: 'laboratory',
    displayName: 'Laboratory',
    isClinical: true,
    isClinic: false,
    isActive: true,
  },
  {
    typeCode: 'pharmacy',
    displayName: 'Pharmacy',
    isClinical: true,
    isClinic: false,
    isActive: true,
  },
  {
    typeCode: 'radiology',
    displayName: 'Radiology',
    isClinical: true,
    isClinic: false,
    isActive: true,
  },
  {
    typeCode: 'emergency',
    displayName: 'ER',
    isClinical: true,
    isClinic: false,
    isActive: true,
  },
  {
    typeCode: 'generalsurgery',
    displayName: 'Operating Theatre',
    isClinical: true,
    isClinic: false,
    isActive: true,
  },

  // Clinic departments (poli) that run an outpatient clinic where patients can book consultation appointments
  {
    typeCode: 'cardiology',
    displayName: 'Heart Center',
    description:
      'Expert diagnosis and treatment for heart and cardiovascular conditions.',
    featuredOrdinal: 2,
    isClinical: true,
    isClinic: true,
    isActive: true,
  },
  {
    typeCode: 'dermatology',
    displayName: 'Skin & Aesthetic',
    description:
      'Specialized care for skin conditions, cosmetic treatments, and aesthetic procedures.',
    featuredOrdinal: 3,
    isClinical: true,
    isClinic: true,
    isActive: true,
  },
  {
    typeCode: 'pediatrics',
    displayName: 'Children Care',
    description:
      'Dedicated medical care for infants, children, and adolescents.',
    featuredOrdinal: 4,
    isClinical: true,
    isClinic: true,
    isActive: true,
  },
  {
    typeCode: 'neurology',
    displayName: 'Neuroscience Center',
    isClinical: true,
    isClinic: true,
    isActive: true,
  },
  {
    typeCode: 'orthopedics',
    displayName: 'Bone, Joint, & Mobility Center',
    isClinical: true,
    isClinic: true,
    isActive: true,
  },
  {
    typeCode: 'obgyn',
    displayName: "Women's Health & Maternity Care",
    description:
      'Comprehensive care for pregnancy, childbirth, and reproductive health.',
    featuredOrdinal: 1,
    isClinical: true,
    isClinic: true,
    isActive: true,
  },
  {
    typeCode: 'oncology',
    displayName: 'Comprehensive Cancer Center',
    isClinical: true,
    isClinic: true,
    isActive: true,
  },
  {
    typeCode: 'otolaryngology',
    displayName: 'ENT (Ear, Nose, & Throat) Care',
    isClinical: true,
    isClinic: true,
    isActive: true,
  },
  {
    typeCode: 'ophthalmology',
    displayName: 'Eye Center',
    isClinical: true,
    isClinic: true,
    isActive: true,
  },
  {
    typeCode: 'urology',
    displayName: 'Urology Center',
    isClinical: true,
    isClinic: true,
    isActive: true,
  },
  {
    typeCode: 'internist',
    displayName: 'Internist & Adult Care Center',
    isClinical: true,
    isClinic: true,
    isActive: true,
  },
  {
    typeCode: 'psychiatry',
    displayName: 'Mental Health & Wellness',
    isClinical: true,
    isClinic: true,
    isActive: true,
  },
  {
    typeCode: 'physiatry',
    displayName: 'Physical Medicine & Rehabilitation',
    isClinical: true,
    isClinic: true,
    isActive: true,
  },
  {
    typeCode: 'pulmonology',
    displayName: 'Respiratory Care',
    isClinical: true,
    isClinic: true,
    isActive: true,
  },
  {
    typeCode: 'endocrinology',
    displayName: 'Diabetes, Thyroid & Hormone Care',
    isClinical: true,
    isClinic: true,
    isActive: true,
  },
];

@Injectable()
export class DepartmentSeeder implements Seeder {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
  ) {}

  async seed() {
    await this.dataSource.transaction(async (manager) => {
      const existingCount = await manager.count(Department);
      if (existingCount > 0) return;

      await manager.save(
        Department,
        DEPARTMENT_SEED.map((dept) => manager.create(Department, dept)),
      );

      console.log(`Created ${DEPARTMENT_SEED.length} departments`);
    });
  }

  async drop() {
    await this.departmentRepository.delete({});
  }
}
