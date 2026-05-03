import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindOptionsWhere,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { FilterDoctorScheduleDto } from '../dtos/filter-doctor-schedule.dto';
import { UpsertDoctorScheduleDto } from '../dtos/upsert-doctor-schedule.dto';
import { DoctorSchedule } from '../entities/doctor-schedule.entity';

@Injectable()
export class DoctorScheduleService {
  constructor(
    @InjectRepository(DoctorSchedule)
    private readonly doctorScheduleRepository: Repository<DoctorSchedule>,
  ) {}

  async findBy(
    filterDoctorScheduleDto: FilterDoctorScheduleDto,
  ): Promise<DoctorSchedule[]> {
    if (filterDoctorScheduleDto.startTime || filterDoctorScheduleDto.endTime) {
      const filterOption: FindOptionsWhere<DoctorSchedule> = {};

      if (filterDoctorScheduleDto.doctorId) {
        const currentDoctorWhere = (filterOption.doctor ?? {}) as Record<
          string,
          unknown
        >;
        filterOption.doctor = {
          ...currentDoctorWhere,
          doctorId: filterDoctorScheduleDto.doctorId,
        };
      }

      if (filterDoctorScheduleDto.department) {
        const currentDoctorWhere = (filterOption.doctor ?? {}) as Record<
          string,
          unknown
        >;
        const currentEmployeeWhere = (currentDoctorWhere.employee ??
          {}) as Record<string, unknown>;

        filterOption.doctor = {
          ...currentDoctorWhere,
          employee: {
            ...currentEmployeeWhere,
            department: filterDoctorScheduleDto.department,
          },
        };
      }

      if (filterDoctorScheduleDto.day)
        filterOption.day = filterDoctorScheduleDto.day;
      if (filterDoctorScheduleDto.startTime)
        filterOption.startTime = MoreThanOrEqual(
          filterDoctorScheduleDto.startTime,
        );
      if (filterDoctorScheduleDto.endTime)
        filterOption.endTime = LessThanOrEqual(filterDoctorScheduleDto.endTime);

      return await this.doctorScheduleRepository.find({
        where: filterOption,
        relations: { doctor: { employee: { user: true } } },
      });
    }

    return await this.doctorScheduleRepository.findBy(filterDoctorScheduleDto);
  }

  async findByDoctorId(doctorId: string): Promise<DoctorSchedule[]> {
    return await this.doctorScheduleRepository.find({
      where: { doctor: { doctorId } },
      relations: { doctor: { employee: { user: true } } },
    });
  }

  async findOne(doctorScheduleId: number): Promise<DoctorSchedule> {
    const doctorSchedule = await this.doctorScheduleRepository.findOne({
      where: { doctorScheduleId },
    });

    if (!doctorSchedule) {
      throw new NotFoundException(
        `Doctor schedule with ID ${doctorScheduleId} not found`,
      );
    }

    return doctorSchedule;
  }

  async upsert(
    upsertDoctorScheduleDto: UpsertDoctorScheduleDto,
  ): Promise<void> {
    await this.doctorScheduleRepository.manager.transaction(async (manager) => {
      const doctorScheduleRepository = manager.getRepository(DoctorSchedule);

      await doctorScheduleRepository.delete({
        doctor: { doctorId: upsertDoctorScheduleDto.doctorId },
      });

      const schedulesWithDoctor = upsertDoctorScheduleDto.schedules.map(
        (schedule) => ({
          ...schedule,
          doctor: { doctorId: upsertDoctorScheduleDto.doctorId },
        }),
      );

      await doctorScheduleRepository.save(schedulesWithDoctor);
    });
  }

  async upsertByUserId(
    userId: string,
    upsertDoctorScheduleDto: UpsertDoctorScheduleDto,
  ): Promise<void> {
    await this.doctorScheduleRepository.manager.transaction(async (manager) => {
      const doctorScheduleRepository = manager.getRepository(DoctorSchedule);

      await doctorScheduleRepository.delete({
        doctor: { employee: { user: { userId } } },
      });

      const schedulesWithDoctor = upsertDoctorScheduleDto.schedules.map(
        (schedule) => ({
          ...schedule,
          doctor: { employee: { user: { userId } } },
        }),
      );

      await doctorScheduleRepository.save(schedulesWithDoctor);
    });
  }

  async deleteByDoctorId(doctorId: string): Promise<void> {
    const doctorSchedule = await this.doctorScheduleRepository.findOne({
      where: { doctor: { doctorId } },
    });

    if (!doctorSchedule) {
      throw new NotFoundException(
        `Doctor schedule for Doctor ID ${doctorId} not found`,
      );
    }

    await this.doctorScheduleRepository.delete({ doctor: { doctorId } });
  }

  async delete(doctorScheduleId: number): Promise<void> {
    await this.doctorScheduleRepository.delete({ doctorScheduleId });
  }
}
