"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addMonths, subMonths, eachDayOfInterval, isSameMonth, isSameDay, parseISO, isBefore, startOfDay, isAfter, addDays } from "date-fns";

type SimpleCalendarProps = {
  rentalDays?: number;
  onRangeChange?: (range: { startDate: Date; endDate: Date } | null) => void;
  blockedDates?: Array<{ start_date: string; end_date: string }>;
};

export default function SimpleCalendar({ rentalDays = 4, onRangeChange, blockedDates = [] }: SimpleCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const prevRentalDaysRef = useRef(rentalDays);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Convert blocked dates to intervals for range checking
  const blockedIntervals = useMemo(() => {
    return blockedDates.map(blocked => ({
      start: parseISO(blocked.start_date),
      end: parseISO(blocked.end_date)
    }));
  }, [blockedDates]);

  // Convert blocked dates to a flat array of date strings for quick lookup
  // Also includes 2 days buffer after each blocked period
  const blockedDateStrings = useMemo(() => {
    const dates: string[] = [];
    blockedDates.forEach(blocked => {
      const start = parseISO(blocked.start_date);
      const end = parseISO(blocked.end_date);

      // Add the blocked period itself
      const days = eachDayOfInterval({ start, end });
      days.forEach(day => {
        dates.push(format(day, 'yyyy-MM-dd'));
      });

      // Add 2 days buffer after the blocked period
      for (let i = 1; i <= 2; i++) {
        const bufferDay = addDays(end, i);
        dates.push(format(bufferDay, 'yyyy-MM-dd'));
      }
    });
    return dates;
  }, [blockedDates]);

  // Check if a date is blocked
  const isDateBlocked = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return blockedDateStrings.includes(dateStr);
  };

  // Check if a date is in the past
  const isDatePast = (date: Date) => {
    return isBefore(startOfDay(date), startOfDay(new Date()));
  };

  // Check if there are any blocked dates in a date range
  const hasBlockedDatesInRange = (startDate: Date, endDate: Date) => {
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    return days.some(day => isDateBlocked(day));
  };

  // Get the maximum available rental days from a start date
  const getMaxAvailableDaysFromDate = (startDate: Date) => {
    let maxDays = 0;
    let currentDate = new Date(startDate);

    // Check up to 30 days maximum
    for (let i = 0; i < 30; i++) {
      if (isDateBlocked(currentDate) || isDatePast(currentDate)) {
        break;
      }
      maxDays++;
      currentDate = addDays(currentDate, 1);
    }

    return maxDays;
  };

  // Get blocked date information for tooltip
  const getBlockedDateInfo = (date: Date) => {
    const blockedInterval = blockedIntervals.find(interval =>
      date >= interval.start && date <= interval.end
    );

    if (blockedInterval) {
      return {
        start: format(blockedInterval.start, 'MMM dd, yyyy'),
        end: format(blockedInterval.end, 'MMM dd, yyyy')
      };
    }
    return null;
  };

  // Generate calendar days for current month
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    return days.map(day => ({
      date: day,
      dayNumber: format(day, 'd'),
      isCurrentMonth: isSameMonth(day, currentDate),
      isBlocked: isDateBlocked(day) || isDatePast(day),
      isSelected: selectedStartDate ? isSameDay(day, selectedStartDate) : false,
      blockedInfo: isDateBlocked(day) ? getBlockedDateInfo(day) : null,
    }));
  }, [currentDate, blockedDateStrings, selectedStartDate, blockedIntervals]);

  // Calculate end date based on rental days
  const selectedEndDate = useMemo(() => {
    if (!selectedStartDate) return null;

    const endDate = new Date(selectedStartDate);
    endDate.setDate(endDate.getDate() + rentalDays - 1);
    endDate.setHours(0, 0, 0, 0);

    // Check if the calculated end date crosses blocked dates
    if (hasBlockedDatesInRange(selectedStartDate, endDate)) {
      // Find the actual available end date
      let availableEndDate = new Date(selectedStartDate);
      let daysAdded = 0;

      while (daysAdded < rentalDays) {
        const nextDate = addDays(selectedStartDate, daysAdded);
        if (isDateBlocked(nextDate) || isDatePast(nextDate)) {
          break;
        }
        availableEndDate = nextDate;
        daysAdded++;
      }

      return availableEndDate;
    }

    return endDate;
  }, [selectedStartDate, rentalDays]);

  // Check if a day is in the selected range
  const isInRange = (date: Date) => {
    if (!selectedStartDate || !selectedEndDate) return false;
    const dateStr = format(date, 'yyyy-MM-dd');
    const startStr = format(selectedStartDate, 'yyyy-MM-dd');
    const endStr = format(selectedEndDate, 'yyyy-MM-dd');
    return dateStr >= startStr && dateStr <= endStr;
  };

  // Handle day click
  const handleDayClick = (day: { date: Date; isCurrentMonth: boolean; isBlocked: boolean }) => {
    if (!day.isCurrentMonth || day.isBlocked) return;

    const startDate = new Date(day.date);
    startDate.setHours(0, 0, 0, 0);

    // Check if the requested rental period is available
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + rentalDays - 1);
    endDate.setHours(0, 0, 0, 0);

    if (hasBlockedDatesInRange(startDate, endDate)) {
      const maxAvailableDays = getMaxAvailableDaysFromDate(startDate);
      if (maxAvailableDays < rentalDays) {
        // Show tooltip or notification about unavailable dates
        console.warn(`Only ${maxAvailableDays} days available from selected start date`);
        // You could show a toast notification here
        return;
      }
    }

    setSelectedStartDate(startDate);
    onRangeChange?.({ startDate, endDate });
  };

  // Handle day hover for tooltip
  const handleDayHover = (day: { date: Date; isBlocked: boolean; blockedInfo: any }, event: React.MouseEvent) => {
    if (day.isBlocked && day.blockedInfo) {
      setHoveredDate(day.date);
      setTooltipPosition({ x: event.clientX, y: event.clientY });
      setTooltipVisible(true);
    } else {
      setTooltipVisible(false);
    }
  };

  // Handle mouse leave from day
  const handleDayLeave = () => {
    setTooltipVisible(false);
  };

  // Update tooltip position on mouse move
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (tooltipVisible) {
        setTooltipPosition({ x: e.clientX, y: e.clientY });
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [tooltipVisible]);

  // Reset selection when rental days change
  useEffect(() => {
    const prevDays = prevRentalDaysRef.current;
    if (prevDays !== undefined && prevDays !== rentalDays) {
      if (selectedStartDate) {
        const startDate = new Date(selectedStartDate);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + rentalDays - 1);
        endDate.setHours(0, 0, 0, 0);

        // Check if new range is valid
        if (!hasBlockedDatesInRange(startDate, endDate)) {
          onRangeChange?.({ startDate, endDate });
        } else {
          // If not valid, clear selection
          setSelectedStartDate(null);
          onRangeChange?.(null);
        }
      } else {
        onRangeChange?.(null);
      }
    }
    prevRentalDaysRef.current = rentalDays;
  }, [rentalDays, selectedStartDate, onRangeChange]);

  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="relative w-full max-w-[500px] mx-auto bg-[#F1F1F1] p-6 ">
      {/* Blocked Dates Tooltip */}
      {tooltipVisible && hoveredDate && (
        <div
          ref={tooltipRef}
          className="fixed z-50 bg-gray-900 text-white text-xs px-3 py-2  shadow-lg max-w-xs pointer-events-none"
          style={{
            left: `${tooltipPosition.x + 10}px`,
            top: `${tooltipPosition.y + 10}px`,
          }}
        >
          <div className="font-semibold mb-1">Unavailable Dates</div>
          {(() => {
            const blockedInfo = getBlockedDateInfo(hoveredDate);
            return blockedInfo ? (
              <div>
                <div>From: {blockedInfo.start}</div>
                <div>To: {blockedInfo.end}</div>
              </div>
            ) : (
              <div>This date is unavailable</div>
            );
          })()}
          <div className="mt-1 text-gray-300 text-xs">
            Cannot select blocked dates
          </div>
        </div>
      )}

      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-8 px-2">
        <button
          onClick={() => setCurrentDate(subMonths(currentDate, 1))}
          className="p-2 hover:bg-gray-200 rounded-full transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="#18181B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <h2 className="text-[18px] font-bold text-[#18181B]">
          {format(currentDate, 'MMMM yyyy')}
        </h2>

        <button
          onClick={() => setCurrentDate(addMonths(currentDate, 1))}
          className="p-2 hover:bg-gray-200  transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18L15 12L9 6" stroke="#18181B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Days of Week */}
      <div className="grid grid-cols-7 mb-4">
        {daysOfWeek.map((day, index) => (
          <div key={index} className="text-center">
            <span className="text-[14px] text-[#71717A] font-medium">
              {day}
            </span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-y-4">
        {calendarDays.map((day, index) => {
          const isStart = selectedStartDate && isSameDay(day.date, selectedStartDate);
          const isEnd = selectedEndDate && isSameDay(day.date, selectedEndDate);
          const inRange = isInRange(day.date);
          const selected = isStart || isEnd || inRange;

          let containerClasses = "h-10 w-full flex items-center justify-center relative";
          let textClasses = "z-10 text-[16px] font-medium transition-colors duration-200";
          let bgClasses = "absolute inset-0";

          if (!day.isCurrentMonth) {
            textClasses += " text-[#D4D4D8]"; // Light gray for other month
          } else if (day.isBlocked) {
            textClasses += " text-[#A1A1AA] line-through"; // Gray line-through for blocked
          } else if (isStart || isEnd) {
            textClasses += " text-white";
          } else if (inRange) {
            textClasses += " text-[#18181B]";
          } else {
            textClasses += " text-[#18181B] group-hover:bg-[#E4E4E7] rounded-full";
          }

          // Background Logic
          if (day.isCurrentMonth && !day.isBlocked) {
            if (isStart) {
              bgClasses += " bg-[#1A1A1A] "; // Dark background start
              if (rentalDays === 1) bgClasses += " ";
            } else if (isEnd) {
              bgClasses += " bg-[#1A1A1A] "; // Dark background end
            } else if (inRange) {
              bgClasses += " bg-[#F3D6DC]"; // Pink background for range
            } else {
              bgClasses = "hidden"; // No background for unselected
            }
          } else {
            bgClasses = "hidden";
          }

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleDayClick(day)}
              onMouseEnter={(e) => handleDayHover(day, e)}
              onMouseLeave={handleDayLeave}
              disabled={day.isBlocked}
              className={`group ${containerClasses}`}
            >
              <div className={bgClasses}></div>
              <span className={textClasses}>{day.dayNumber}</span>

              {/* Blocked Indicator Dot */}
              {day.isBlocked && day.isCurrentMonth && (
                <div className="absolute bottom-1 w-1 h-1 bg-red-400 rounded-full"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}