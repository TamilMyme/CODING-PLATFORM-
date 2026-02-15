import React, { useState, useMemo } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  FireIcon,
} from "@heroicons/react/24/outline";

interface StreakData {
  date: string; // ISO date string (YYYY-MM-DD)
  count: number; // Number of activities/problems solved on that day
}

interface StreakCalendarProps {
  streakData?: StreakData[];
  currentStreak?: number;
  maxStreak?: number;
  totalSolved?: number;
  className?: string;
}

const StreakCalendar: React.FC<StreakCalendarProps> = ({
  streakData = [],
  currentStreak = 0,
  maxStreak = 0,
  totalSolved = 0,
  className = "",
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Get the first day of the current month
  const firstDayOfMonth = useMemo(() => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  }, [currentDate]);

  // Get the last day of the current month
  const lastDayOfMonth = useMemo(() => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  }, [currentDate]);

  // Get the day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
  const startDayOfWeek = firstDayOfMonth.getDay();

  // Get total days in the month
  const totalDaysInMonth = lastDayOfMonth.getDate();

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const days: Array<{ date: Date | null; streakCount: number }> = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ date: null, streakCount: 0 });
    }

    // Add days of the month
    for (let day = 1; day <= totalDaysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dateStr = date.toISOString().split("T")[0];
      const streakEntry = streakData.find((d) => d.date === dateStr);
      days.push({ date, streakCount: streakEntry?.count || 0 });
    }

    return days;
  }, [currentDate, startDayOfWeek, totalDaysInMonth, streakData]);

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  // Get color based on activity count (LeetCode-style colors)
  const getCellColor = (count: number): string => {
    if (count === 0) return "bg-gray-100";
    if (count >= 1 && count < 3) return "bg-[#9be9a8]";
    if (count >= 3 && count < 5) return "bg-[#40c463]";
    if (count >= 5 && count < 10) return "bg-[#30a14e]";
    return "bg-[#216e39]";
  };

  // Get border color for better visibility
  const getBorderColor = (count: number): string => {
    if (count === 0) return "border-gray-200";
    if (count >= 1 && count < 3) return "border-green-300";
    if (count >= 3 && count < 5) return "border-green-400";
    if (count >= 5 && count < 10) return "border-green-500";
    return "border-green-600";
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <div className="flex items-center gap-1">
            <button
              onClick={goToPreviousMonth}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <button
              onClick={goToNextMonth}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
              aria-label="Next month"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Streak Stats */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg flex items-center justify-center">
              <FireIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Current Streak</p>
              <p className="text-lg font-bold text-gray-900">{currentStreak} days</p>
            </div>
          </div>
          <div className="h-8 w-px bg-gray-200"></div>
          <div>
            <p className="text-xs text-gray-500">Max Streak</p>
            <p className="text-lg font-bold text-gray-900">{maxStreak} days</p>
          </div>
          <div className="h-8 w-px bg-gray-200"></div>
          <div>
            <p className="text-xs text-gray-500">Total Solved</p>
            <p className="text-lg font-bold text-gray-900">{totalSolved}</p>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-5">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day) => (
            <div
              key={day}
              className="text-xs font-medium text-gray-500 text-center py-1"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Cells */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            if (!day.date) {
              return (
                <div
                  key={`empty-${index}`}
                  className="aspect-square"
                />
              );
            }

            const isToday =
              day.date.toDateString() === new Date().toDateString();
            const cellColor = getCellColor(day.streakCount);
            const borderColor = getBorderColor(day.streakCount);

            return (
              <div
                key={day.date.toISOString()}
                className={`aspect-square rounded-md ${cellColor} ${borderColor} border flex items-center justify-center relative group hover:ring-2 hover:ring-orange-300 transition-all cursor-pointer`}
                title={`${day.date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}: ${day.streakCount} problem${day.streakCount !== 1 ? "s" : ""} solved`}
              >
                <span
                  className={`text-xs font-medium ${
                    day.streakCount > 0 ? "text-white" : "text-gray-400"
                  }`}
                >
                  {day.date.getDate()}
                </span>
                {isToday && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border-2 border-white" />
                )}
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  <div className="font-medium">
                    {day.date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                  <div className="text-gray-300">
                    {day.streakCount} problem{day.streakCount !== 1 ? "s" : ""} solved
                  </div>
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <span className="text-xs text-gray-500">Less</span>
          <div className="w-4 h-4 rounded bg-gray-100" />
          <div className="w-4 h-4 rounded bg-[#9be9a8]" />
          <div className="w-4 h-4 rounded bg-[#40c463]" />
          <div className="w-4 h-4 rounded bg-[#30a14e]" />
          <div className="w-4 h-4 rounded bg-[#216e39]" />
          <span className="text-xs text-gray-500">More</span>
        </div>
      </div>
    </div>
  );
};

export default StreakCalendar;
