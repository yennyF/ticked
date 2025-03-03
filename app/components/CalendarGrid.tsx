"use client";

import { use, useEffect, useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isToday,
} from "date-fns";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { getHabitTrack, GroupedHabitTrack } from "../api";
import { AppContext } from "../AppContext";

const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];

export default function CalendarGrid() {
  const appContext = use(AppContext);
  if (!appContext) {
    throw new Error("CalendarGrid must be used within a AppProvider");
  }
  const { habits } = appContext;

  const [currentDate, setCurrentDate] = useState(new Date());
  const [groupedHabitTrack, setHabitHistory] = useState<GroupedHabitTrack>({});

  useEffect(() => {
    (async () => {
      setHabitHistory(await getHabitTrack());
    })();
  }, []);

  const startOfCurrentMonth = startOfMonth(currentDate);
  const endOfCurrentMonth = endOfMonth(currentDate);

  const startOfWeekDate = startOfWeek(startOfCurrentMonth);
  const endOfWeekDate = endOfWeek(endOfCurrentMonth);
  const totalDays = eachDayOfInterval({
    start: startOfWeekDate,
    end: endOfWeekDate,
  });

  const today = () => {
    setCurrentDate(new Date());
  };

  const previousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const monthName = format(currentDate, "MMMM yyyy");

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center">
      <div className="h-[550px] w-fit">
        <div className="flex h-20 w-full items-center justify-between gap-5">
          <h2 className="font-bold">{monthName}</h2>
          <div className="flex gap-3">
            <button onClick={today}>Today</button>
            <button className="button-icon" onClick={previousMonth}>
              <ChevronLeftIcon />
            </button>
            <button className="button-icon" onClick={nextMonth}>
              <ChevronRightIcon />
            </button>
          </div>
        </div>

        <div
          className="grid grid-cols-7 gap-3 text-neutral-400"
          style={{ gridTemplateColumns: "repeat(7, min-content)" }}
        >
          {dayLabels.map((day, index) => (
            <div
              key={index}
              className="calendar-day calendar-day-header h-10 w-14 text-center"
            >
              {day}
            </div>
          ))}
        </div>

        <div
          className="grid grid-cols-7 gap-3 text-neutral-400"
          style={{ gridTemplateColumns: "repeat(7, min-content)" }}
        >
          {totalDays.map((day, index) => {
            const record = groupedHabitTrack[day.toLocaleDateString()] || {};
            const tickedHabits = habits.filter(
              (habit) => record.habits?.[habit.id] === true
            );
            const percentage = tickedHabits.length / habits.length;

            return (
              <div
                key={index}
                className={`calendar-day relative grid h-14 w-14 place-items-center rounded-full text-black ${isToday(day) ? "outline" : ""}`}
              >
                <div
                  className={`absolute -z-10 h-full w-full rounded-full bg-[var(--accent)]`}
                  style={{
                    opacity: percentage,
                  }}
                ></div>
                {format(day, "d")}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
