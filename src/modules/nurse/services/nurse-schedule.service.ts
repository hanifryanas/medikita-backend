import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { FilterNurseScheduleDto } from '../dtos/filter-nurse-schedule.dto';
import { UpsertNurseScheduleDto } from '../dtos/upsert-nurse-schedule.dto';
import { NurseSchedule } from '../entities/nurse-schedule.entity';

@Injectable()
export class NurseScheduleService {
  constructor(
    @InjectRepository(NurseSchedule)
    private readonly nurseScheduleRepository: Repository<NurseSchedule>,
  ) {}

  async findBy(
    filterNurseScheduleDto: FilterNurseScheduleDto,
  ): Promise<NurseSchedule[]> {
    if (filterNurseScheduleDto.nurseId || filterNurseScheduleDto.department) {
      const filterOption: FindOptionsWhere<NurseSchedule> = {};

      if (filterNurseScheduleDto.nurseId) {
        const currentNurseWhere = (filterOption.nurse ?? {}) as Record<
          string,
          unknown
        >;
        filterOption.nurse = {
          ...currentNurseWhere,
          nurseId: filterNurseScheduleDto.nurseId,
        };
      }

      if (filterNurseScheduleDto.department) {
        const currentNurseWhere = (filterOption.nurse ?? {}) as Record<
          string,
          unknown
        >;
        const currentEmployeeWhere = (currentNurseWhere.employee ??
          {}) as Record<string, unknown>;
        filterOption.nurse = {
          ...currentNurseWhere,
          employee: {
            ...currentEmployeeWhere,
            department: filterNurseScheduleDto.department,
          },
        };
      }

      if (filterNurseScheduleDto.day)
        filterOption.day = filterNurseScheduleDto.day;
      if (filterNurseScheduleDto.startTime)
        filterOption.startTime = filterNurseScheduleDto.startTime;
      if (filterNurseScheduleDto.endTime)
        filterOption.endTime = filterNurseScheduleDto.endTime;

      return await this.nurseScheduleRepository.find({
        where: filterOption,
        relations: { nurse: { employee: { user: true } } },
      });
    }

    return await this.nurseScheduleRepository.findBy(filterNurseScheduleDto);
  }

  async findByNurseId(nurseId: string): Promise<NurseSchedule[]> {
    return await this.nurseScheduleRepository.find({
      where: { nurse: { nurseId } },
      relations: { nurse: { employee: { user: true } } },
    });
  }

  async findOne(nurseScheduleId: number): Promise<NurseSchedule> {
    const nurseSchedule = await this.nurseScheduleRepository.findOne({
      where: { nurseScheduleId },
    });

    if (!nurseSchedule) {
      throw new NotFoundException(
        `Nurse schedule with ID ${nurseScheduleId} not found`,
      );
    }

    return nurseSchedule;
  }

  async upsert(upsertNurseScheduleDto: UpsertNurseScheduleDto): Promise<void> {
    await this.nurseScheduleRepository.manager.transaction(async (manager) => {
      const nurseScheduleRepository = manager.getRepository(NurseSchedule);

      await nurseScheduleRepository.delete({
        nurse: { nurseId: upsertNurseScheduleDto.nurseId },
      });

      const schedulesWithNurse = upsertNurseScheduleDto.schedules.map(
        (schedule) => ({
          ...schedule,
          nurse: { nurseId: upsertNurseScheduleDto.nurseId },
        }),
      );

      await nurseScheduleRepository.save(schedulesWithNurse);
    });
  }

  async upsertByUserId(
    userId: string,
    upsertNurseScheduleDto: UpsertNurseScheduleDto,
  ): Promise<void> {
    await this.nurseScheduleRepository.manager.transaction(async (manager) => {
      const nurseScheduleRepository = manager.getRepository(NurseSchedule);

      await nurseScheduleRepository.delete({
        nurse: { employee: { user: { userId } } },
      });

      const schedulesWithNurse = upsertNurseScheduleDto.schedules.map(
        (schedule) => ({
          ...schedule,
          nurse: { employee: { user: { userId } } },
        }),
      );

      await nurseScheduleRepository.save(schedulesWithNurse);
    });
  }

  async deleteByNurseId(nurseId: string): Promise<void> {
    const nurseSchedule = await this.nurseScheduleRepository.findOne({
      where: { nurse: { nurseId } },
    });

    if (!nurseSchedule) {
      throw new NotFoundException(
        `Nurse schedule for Nurse ID ${nurseId} not found`,
      );
    }

    await this.nurseScheduleRepository.delete({ nurse: { nurseId } });
  }

  async delete(nurseScheduleId: number): Promise<void> {
    const nurseSchedule = await this.nurseScheduleRepository.findOne({
      where: { nurseScheduleId },
    });

    if (!nurseSchedule) {
      throw new NotFoundException(
        `Nurse schedule with ID ${nurseScheduleId} not found`,
      );
    }

    await this.nurseScheduleRepository.delete({ nurseScheduleId });
  }
}
