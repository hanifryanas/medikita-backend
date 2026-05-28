import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  differenceInCalendarDays,
  eachDayOfInterval,
  isValid,
  parse,
} from 'date-fns';
import { Between, FindOptionsWhere, In, Not, Repository } from 'typeorm';
import { Schedule } from '../../../common/entities/schedule.entity';
import { Day } from '../../../common/enums/day.enum';
import { Status } from '../../../common/enums/status.enum';
import {
  formatDate,
  stardartDateFormat,
} from '../../../common/functions/format-date';
import { Appointment } from '../../appointment/entities/appointment.entity';
import { DoctorScheduleResponseDto } from '../dtos/doctor-schedule-response.dto';
import { FilterDoctorScheduleDto } from '../dtos/filter-doctor-schedule.dto';
import { UpsertDoctorScheduleDto } from '../dtos/upsert-doctor-schedule.dto';
import { DoctorSchedule } from '../entities/doctor-schedule.entity';

const DAY_TO_WEEKDAY: Record<Day, number> = {
  [Day.Sunday]: 0,
  [Day.Monday]: 1,
  [Day.Tuesday]: 2,
  [Day.Wednesday]: 3,
  [Day.Thursday]: 4,
  [Day.Friday]: 5,
  [Day.Saturday]: 6,
};

const MAX_RANGE_DAYS = 31;

@Injectable()
export class DoctorScheduleService {
  constructor(
    @InjectRepository(DoctorSchedule)
    private readonly doctorScheduleRepository: Repository<DoctorSchedule>,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
  ) {}

  async findBy(
    filterDoctorScheduleDto: FilterDoctorScheduleDto,
  ): Promise<DoctorScheduleResponseDto[]> {
    const range = this.resolveDateRange(filterDoctorScheduleDto);

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

    if (filterDoctorScheduleDto.departmentId) {
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
          departmentId: filterDoctorScheduleDto.departmentId,
        },
      };
    }

    const results = await this.doctorScheduleRepository.find({
      where: filterOption,
      relations: { doctor: true },
      select: {
        doctorScheduleId: true,
        day: true,
        startTime: true,
        endTime: true,
        doctor: { doctorId: true },
      },
    });
    const sortedResults = Schedule.sortByCurrentDayTime(results);

    if (!range) {
      return sortedResults.map((schedule) => this.toResponseDto(schedule));
    }

    const bookedByDoctorAndDate = await this.loadBookedSlots(
      sortedResults,
      range.startDate,
      range.endDate,
    );

    const schedulesByWeekday = new Map<number, DoctorSchedule[]>();
    for (const schedule of sortedResults) {
      const weekday = DAY_TO_WEEKDAY[schedule.day];
      const list = schedulesByWeekday.get(weekday) ?? [];
      list.push(schedule);
      schedulesByWeekday.set(weekday, list);
    }

    const dtos: DoctorScheduleResponseDto[] = [];
    const dates = eachDayOfInterval({
      start: range.startDate,
      end: range.endDate,
    });
    for (const date of dates) {
      const matchingSchedules = schedulesByWeekday.get(date.getDay());
      if (!matchingSchedules) continue;
      const formattedDate = formatDate(date);
      for (const schedule of matchingSchedules) {
        const bookedSet =
          bookedByDoctorAndDate.get(
            `${schedule.doctor.doctorId}:${formattedDate}`,
          ) ?? new Set<string>();
        dtos.push(this.toResponseDto(schedule, formattedDate, bookedSet));
      }
    }
    return dtos;
  }

  private resolveDateRange(
    filterDoctorScheduleDto: FilterDoctorScheduleDto,
  ): { startDate: Date; endDate: Date } | undefined {
    const { startDate, endDate } = filterDoctorScheduleDto;
    if (!startDate && !endDate) return undefined;
    if (!startDate || !endDate) {
      throw new BadRequestException(
        'startDate and endDate must be provided together',
      );
    }
    const start = parse(startDate, stardartDateFormat, new Date());
    const end = parse(endDate, stardartDateFormat, new Date());
    if (!isValid(start) || !isValid(end)) {
      throw new BadRequestException(
        'startDate and endDate must be valid dates',
      );
    }
    if (start > end) {
      throw new BadRequestException('startDate must be on or before endDate');
    }
    const spanDays = differenceInCalendarDays(end, start) + 1;
    if (spanDays > MAX_RANGE_DAYS) {
      throw new BadRequestException(
        `Date range cannot exceed ${MAX_RANGE_DAYS} days`,
      );
    }
    return { startDate: start, endDate: end };
  }

  private async loadBookedSlots(
    schedules: DoctorSchedule[],
    startDate: Date,
    endDate: Date,
  ): Promise<Map<string, Set<string>>> {
    const bookedMap = new Map<string, Set<string>>();
    if (schedules.length === 0) return bookedMap;

    const doctorIds = Array.from(
      new Set(schedules.map((s) => s.doctor.doctorId)),
    );

    const appointments = await this.appointmentRepository.find({
      where: {
        doctor: { doctorId: In(doctorIds) },
        status: Not(Status.Cancelled),
        date: Between(startDate, endDate),
      },
      relations: { doctor: true },
    });

    for (const appointment of appointments) {
      const formattedDate = formatDate(appointment.date);
      const key = `${appointment.doctor.doctorId}:${formattedDate}`;
      const set = bookedMap.get(key) ?? new Set<string>();
      set.add(appointment.timeSlot);
      bookedMap.set(key, set);
    }

    return bookedMap;
  }

  private toResponseDto(
    schedule: DoctorSchedule,
    formattedDate?: string,
    bookedSet?: Set<string>,
  ): DoctorScheduleResponseDto {
    const timeSlots = Schedule.splitIntoTimeSlots(
      schedule.startTime,
      schedule.endTime,
      Schedule.SLOT_MINUTES,
    );

    return {
      doctorScheduleId: schedule.doctorScheduleId,
      day: schedule.day,
      doctor: { doctorId: schedule.doctor.doctorId },
      ...(formattedDate && { date: formattedDate }),
      timeSlots,
      bookedTimeSlots: Array.from(bookedSet ?? new Set<string>()),
    };
  }

  async findByDoctorId(doctorId: string): Promise<DoctorSchedule[]> {
    const results = await this.doctorScheduleRepository.find({
      where: { doctor: { doctorId } },
      relations: { doctor: { employee: { user: true } } },
    });
    return Schedule.sortByCurrentDayTime(results);
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
