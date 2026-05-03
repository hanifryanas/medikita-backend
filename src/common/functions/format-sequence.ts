const sequenceFormatterCache = new Map<number, Intl.NumberFormat>();

export const formatSequence = (value: number, digits: number): string => {
  let formatter = sequenceFormatterCache.get(digits);
  if (!formatter) {
    formatter = new Intl.NumberFormat('en-US', {
      minimumIntegerDigits: digits,
      useGrouping: false,
    });
    sequenceFormatterCache.set(digits, formatter);
  }
  return formatter.format(value);
};
