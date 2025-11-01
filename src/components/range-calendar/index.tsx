import { type DateRange } from 'react-day-picker';

import { Calendar } from '@/components/ui/calendar';
import { useState } from 'react';

interface RangeCalendarProps {
  dateRange?: DateRange | undefined;
  onDateRangeChange?: (range: DateRange | undefined) => void;
}

export function RangeCalendar({
  dateRange: controlledDateRange,
  onDateRangeChange,
}: RangeCalendarProps) {
  const [internalDateRange, setInternalDateRange] = useState<
    DateRange | undefined
  >(undefined);

  const dateRange = controlledDateRange ?? internalDateRange;

  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (onDateRangeChange) {
      onDateRangeChange(range);
    } else {
      setInternalDateRange(range);
    }
  };

  return (
    <div
      className="w-full max-w-full overflow-x-hidden"
      style={{ maxWidth: '100%' }}
    >
      <div
        className="w-full max-w-full flex justify-center"
        style={{ maxWidth: '100%' }}
      >
        <Calendar
          mode="range"
          defaultMonth={dateRange?.from}
          selected={dateRange}
          onSelect={handleDateRangeChange}
          numberOfMonths={1}
          className="rounded-lg border shadow-sm"
          style={{ maxWidth: '100%', width: '100%' }}
        />
      </div>
    </div>
  );
}
