"use client";

import YearItem from "./YearItem";
import { useTrackStore } from "@/app/stores/TrackStore";
import { eachYearOfInterval } from "date-fns";

export default function Header() {
  const startDate = useTrackStore((s) => s.startDate);
  const endDate = useTrackStore((s) => s.endDate);

  const totalYears = eachYearOfInterval({
    start: startDate,
    end: endDate,
  });

  return (
    <div className="calendar-header sticky top-[70px] z-10 flex w-fit">
      <div
        className="sticky left-[50px] z-10 flex items-end bg-[var(--background)]"
        style={{ width: "var(--width-name)" }}
      />
      <div className="sticky left-[250px] flex w-fit bg-[var(--background)]">
        {totalYears.map((date) => (
          <YearItem key={date.getFullYear()} date={date} />
        ))}
      </div>
    </div>
  );
}
