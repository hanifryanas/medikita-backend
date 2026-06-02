import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Department } from '../../department/entities/department.entity';
import { Doctor } from '../../doctor/entities/doctor.entity';
import { HomeStatsDto } from '../dtos/home-stats.dto';

@Injectable()
export class HomeService {
  constructor(
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
  ) {}

  async getStats(): Promise<HomeStatsDto> {
    const [doctorCount, clinicDepartmentCount] = await Promise.all([
      this.doctorRepository.count({
        where: { employee: { retirementDate: IsNull() } },
      }),
      this.departmentRepository.count({
        where: { isActive: true, isClinic: true },
      }),
    ]);

    return { doctorCount, clinicDepartmentCount };
  }
}
