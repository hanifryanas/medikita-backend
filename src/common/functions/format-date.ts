import { format } from 'date-fns';

export const stardartDateFormat = 'yyyy-MM-dd';
export const yearMonthFormat = 'yyyyMM';

export const formatDate = (
  dateOrString: Date | string,
  formatString: string = stardartDateFormat,
): string => {
  const date =
    typeof dateOrString === 'string' ? new Date(dateOrString) : dateOrString;
  return format(date, formatString);
};
