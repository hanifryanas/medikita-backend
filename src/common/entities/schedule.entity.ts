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
  @Column({ type: 'enum', enum: Day })
  day: Day;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;

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
