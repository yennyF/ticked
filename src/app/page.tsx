"use client"

import Calendar from "./calendar";
import { useState } from "react";
import CalendarList from "./calendarList";

export default function Home() {
  const [option, setOption] = useState(1);

  return (
    <div>
      {/* <div className="flex"> */}
        {/* <button className="button-default" onClick={() => setOption(1)}>Calendar</button>
        <button className="button-default"onClick={() => setOption(2)} >Calendar List</button>
        </div>
        {option === 1 ? <Calendar/> : <CalendarList/>} */}
        <CalendarList/>
    </div>
  );
}
