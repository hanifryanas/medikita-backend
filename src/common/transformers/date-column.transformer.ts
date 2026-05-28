import { ValueTransformer } from 'typeorm';
import { formatDate } from '../functions/format-date';

/**
 * Normalizes a Postgres `DATE` column to a `yyyy-MM-dd` string in both
 * application code and HTTP responses. Eliminates timezone ambiguity that
 * arises when the pg driver materializes `DATE` as a JS `Date` at local
 * midnight.
 */
export const dateColumnTransformer: ValueTransformer = {
  to: (value?: string | Date | null) => value ?? null,
  from: (value?: string | Date | null) =>
    value == null ? value : formatDate(value),
};
