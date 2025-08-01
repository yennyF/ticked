"use client";

import {
  format,
  eachDayOfInterval,
  endOfMonth,
  startOfMonth,
  isBefore,
  isAfter,
} from "date-fns";
import DayItem from "./DayItem";
import { useTrackStore } from "@/app/stores/TrackStore";

interface MonthItemProps {
  date: Date;
}

export default function MonthItem({ date }: MonthItemProps) {
  const startDate = useTrackStore((s) => s.startDate);
  const endDate = useTrackStore((s) => s.endDate);

  const totalDays = eachDayOfInterval({
    start: isAfter(startOfMonth(date), startDate)
      ? startOfMonth(date)
      : startDate,
    end: isBefore(endOfMonth(date), endDate) ? endOfMonth(date) : endDate,
  });

  return (
    <div className="month-item w-fit">
      <div className="sticky left-[250px] w-fit bg-[var(--background)] px-[14px] text-xl font-bold">
        {format(date, "MMMM")}
      </div>
      <div className="days mt-4 flex">
        {totalDays.map((date) => (
          <DayItem key={date.toLocaleDateString()} date={date} />
        ))}
      </div>
    </div>
  );
}
