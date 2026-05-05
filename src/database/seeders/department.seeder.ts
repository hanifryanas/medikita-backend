import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Seeder } from 'nestjs-seeder';
import { Repository } from 'typeorm';
import { Department } from '../../modules/department/entities/department.entity';

const DEPARTMENT_SEED: Pick<
  Department,
  | 'typeCode'
  | 'displayName'
  | 'isFeatured'
  | 'isClinical'
  | 'isClinic'
  | 'isActive'
>[] = [
  // Operational units
  {
    typeCode: 'frontoffice',
    displayName: 'Front Office',
    isFeatured: false,
    isClinical: false,
    isClinic: false,
    isActive: true,
  },
  {
    typeCode: 'backoffice',
    displayName: 'Back Office',
    isFeatured: false,
    isClinical: false,
    isClinic: false,
    isActive: true,
  },
  {
    typeCode: 'services',
    displayName: 'Support Services',
    isFeatured: false,
    isClinical: false,
    isClinic: false,
    isActive: true,
  },
  // Clinical support units that do not run an outpatient clinic
  {
    typeCode: 'laboratory',
    displayName: 'Laboratory',
    isFeatured: false,
    isClinical: true,
    isClinic: false,
    isActive: true,
  },
  {
    typeCode: 'pharmacy',
    displayName: 'Pharmacy',
    isFeatured: false,
    isClinical: true,
    isClinic: false,
    isActive: true,
  },
  {
    typeCode: 'radiology',
    displayName: 'Radiology',
    isFeatured: false,
    isClinical: true,
    isClinic: false,
    isActive: true,
  },
  {
    typeCode: 'emergency',
    displayName: 'ER',
    isFeatured: true,
    isClinical: true,
    isClinic: false,
    isActive: true,
  },
  {
    typeCode: 'generalsurgery',
    displayName: 'Operating Theatre',
    isFeatured: true,
    isClinical: true,
    isClinic: false,
    isActive: true,
  },

  // Clinic departments (poli) that run an outpatient clinic where patients can book consultation appointments
  {
    typeCode: 'cardiology',
    displayName: 'Heart Center',
    isFeatured: true,
    isClinical: true,
    isClinic: true,
    isActive: true,
  },
  {
    typeCode: 'dermatology',
    displayName: 'Skin & Aesthetic',
    isFeatured: true,
    isClinical: true,
    isClinic: true,
    isActive: true,
  },
  {
    typeCode: 'pediatrics',
    displayName: 'Children Care',
    isFeatured: true,
    isClinical: true,
    isClinic: true,
    isActive: true,
  },
  {
    typeCode: 'neurology',
    displayName: 'Neuroscience Center',
    isFeatured: true,
    isClinical: true,
    isClinic: true,
    isActive: true,
  },
  {
    typeCode: 'orthopedics',
    displayName: 'Bone, Joint, & Mobility Center',
    isFeatured: false,
    isClinical: true,
    isClinic: true,
    isActive: true,
  },
  {
    typeCode: 'obgyn',
    displayName: "Women's Health & Maternity Care",
    isFeatured: false,
    isClinical: true,
    isClinic: true,
    isActive: true,
  },
  {
    typeCode: 'oncology',
    displayName: 'Comprehensive Cancer Center',
    isFeatured: false,
    isClinical: true,
    isClinic: true,
    isActive: true,
  },
  {
    typeCode: 'otolaryngology',
    displayName: 'ENT (Ear, Nose, & Throat) Care',
    isFeatured: false,
    isClinical: true,
    isClinic: true,
    isActive: true,
  },
  {
    typeCode: 'ophthalmology',
    displayName: 'Eye Center',
    isFeatured: false,
    isClinical: true,
    isClinic: true,
    isActive: true,
  },
  {
    typeCode: 'urology',
    displayName: 'Urology Center',
    isFeatured: false,
    isClinical: true,
    isClinic: true,
    isActive: true,
  },
  {
    typeCode: 'internist',
    displayName: 'Internist & Adult Care Center',
    isFeatured: false,
    isClinical: true,
    isClinic: true,
    isActive: true,
  },
  {
    typeCode: 'psychiatry',
    displayName: 'Mental Health & Wellness',
    isFeatured: false,
    isClinical: true,
    isClinic: true,
    isActive: true,
  },
  {
    typeCode: 'physiatry',
    displayName: 'Physical Medicine & Rehabilitation',
    isFeatured: false,
    isClinical: true,
    isClinic: true,
    isActive: true,
  },
  {
    typeCode: 'pulmonology',
    displayName: 'Respiratory Care',
    isFeatured: false,
    isClinical: true,
    isClinic: true,
    isActive: true,
  },
  {
    typeCode: 'endocrinology',
    displayName: 'Diabetes, Thyroid & Hormone Care',
    isFeatured: false,
    isClinical: true,
    isClinic: true,
    isActive: true,
  },
];

@Injectable()
export class DepartmentSeeder implements Seeder {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
  ) {}

  async seed() {
    const existingCount = await this.departmentRepository.count();
    if (existingCount > 0) return;

    await this.departmentRepository.save(
      DEPARTMENT_SEED.map((department) =>
        this.departmentRepository.create(department),
      ),
    );
  }

  async drop() {
    await this.departmentRepository.delete({});
  }
}
