import { format } from 'date-fns';

export const standardDateFormat = 'yyyy-MM-dd';
export const yearMonthFormat = 'yyyyMM';

export const formatDate = (
  dateOrString: Date | string,
  formatString: string = standardDateFormat,
): string => {
  const date =
    typeof dateOrString === 'string' ? new Date(dateOrString) : dateOrString;
  return format(date, formatString);
};
