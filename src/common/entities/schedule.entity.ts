import { Expose } from 'class-transformer';
import {
  Day as DateFnsDay,
  differenceInCalendarDays,
  getDay,
  nextDay,
  parse,
} from 'date-fns';
import { Column } from 'typeorm';
import { Day } from '../enums/day.enum';
import { BaseEntity } from './base.entity';

export abstract class Schedule extends BaseEntity {
  static readonly SLOT_MINUTES = 20;

  @Column({ type: 'enum', enum: Day })
  day: Day;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;

  @Expose({ groups: ['schedule-time-slots'], toPlainOnly: true })
  get timeSlots(): string[] {
    return Schedule.splitIntoTimeSlots(
      this.startTime,
      this.endTime,
      Schedule.SLOT_MINUTES,
    );
  }

  static splitIntoTimeSlots(
    start: string,
    end: string,
    minutes: number = Schedule.SLOT_MINUTES,
  ): string[] {
    if (!start || !end || minutes <= 0) return [];
    const toMinutes = (t: string): number => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };
    const startMin = toMinutes(start);
    const endMin = toMinutes(end);
    const slots: string[] = [];
    for (let cur = startMin; cur + minutes <= endMin; cur += minutes) {
      const h = String(Math.floor(cur / 60)).padStart(2, '0');
      const m = String(cur % 60).padStart(2, '0');
      slots.push(`${h}:${m}`);
    }
    return slots;
  }

  static sortByCurrentDayTime<T extends Schedule>(
    schedules: T[],
    now: Date = new Date(),
  ): T[] {
    if (!schedules || schedules.length === 0) return schedules;

    const today = getDay(now);
    const distanceFromToday = (day: Day): number => {
      // `Day` enum values are lowercase ('monday'); date-fns 'EEEE' wants 'Monday'.
      const capitalized = day.charAt(0).toUpperCase() + day.slice(1);
      const targetDayIndex = getDay(
        parse(capitalized, 'EEEE', now),
      ) as DateFnsDay;
      if (targetDayIndex === today) return 0;
      return differenceInCalendarDays(nextDay(now, targetDayIndex), now);
    };

    return schedules.sort((a, b) => {
      const diff = distanceFromToday(a.day) - distanceFromToday(b.day);
      if (diff !== 0) return diff;
      return a.startTime.localeCompare(b.startTime);
    });
  }
}
