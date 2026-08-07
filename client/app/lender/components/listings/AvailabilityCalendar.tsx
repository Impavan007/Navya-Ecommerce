'use client';

import { useState } from 'react';

interface AvailabilityCalendarProps {
  blockedDates: string[];
  onDateToggle: (date: string) => void;
  bookedDates?: string[];
  className?: string;
}

export default function AvailabilityCalendar({
  blockedDates,
  onDateToggle,
  bookedDates = [],
  className = ''
}: AvailabilityCalendarProps) {
  const [currentDate, setCurrentDate] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);

    const days = [];
    const today = new Date();
    const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = formatDate(year, month, day);
      const isBlocked = blockedDates.includes(dateString);
      const isBooked = bookedDates.includes(dateString);
      const isPast = isCurrentMonth && day < today.getDate();
      const isToday = isCurrentMonth && day === today.getDate(); // Keep for logic if needed, but style might just be standard

      let cellClass = 'h-10 w-full flex items-center justify-center text-sm font-medium cursor-pointer transition-colors font-poppins ';

      if (isPast) {
        cellClass += 'text-[#A8A8A8] cursor-not-allowed bg-transparent ';
      } else if (isBooked) {
        cellClass += 'bg-gray-100 text-gray-400 cursor-not-allowed ';
      } else if (isBlocked) {
        cellClass += 'bg-[#D92D20] text-white hover:bg-red-700 '; // Red for blocked
      } else {
        cellClass += 'bg-white text-gray-900 hover:bg-gray-50 '; // White for available
      }

      days.push(
        <button
          key={day}
          onClick={() => !isPast && !isBooked && onDateToggle(dateString)}
          className={cellClass}
          disabled={isPast || isBooked}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className={`w-full max-w-2xl mx-auto p-4 sm:p-8 font-Poppins  ${className}`}>
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-2 hover:bg-black/5 transition-colors cursor-pointer rounded-full"
        >
          <i className="ri-arrow-left-s-line w-6 h-6 flex items-center justify-center text-gray-900"></i>
        </button>

        <h3 className="text-xl font-poppins font-bold text-gray-900">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>

        <button
          onClick={() => navigateMonth('next')}
          className="p-2 hover:bg-black/5 transition-colors cursor-pointer rounded-full"
        >
          <i className="ri-arrow-right-s-line w-6 h-6 flex items-center justify-center text-[#000000] font-poppins"></i>
        </button>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 gap-4 mb-4 text-center">
        {dayNames.map(day => (
          <div key={day} className="text-xs font-medium text-[#3D1126] font-poppins uppercase tracking-wide">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-4 mb-8">
        {renderCalendar()}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-8 text-sm">
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 bg-[#D92D20]"></div>
          <span className="text-gray-900 font-poppins">Blocked Dates</span>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 bg-white border border-gray-100"></div>
          <span className="text-gray-900 font-poppins">Available Dates</span>
        </div>
      </div>
    </div>
  );
}