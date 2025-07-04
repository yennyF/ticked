"use client";

import { Fragment, use, useRef, DragEvent, useEffect } from "react";
import { AppContext } from "../../AppContext";
import TaskTrack from "./TaskTrack";
import GroupName from "./GroupName";
import { Group } from "@/app/repositories/types";
import { DropIndicator, useDrop } from "./useDrop";
import TaskName from "./TaskName";
import { useTaskStore } from "@/app/stores/TaskStore";
import TaskDummyItem from "./TaskDummyItem";
import GroupTrack from "./GroupTrack";

export default function GroupItem({ group }: { group: Group }) {
  const appContext = use(AppContext);
  if (!appContext) {
    throw new Error("CalendarList must be used within a AppProvider");
  }
  const { totalDays } = appContext;

  const tasks = useTaskStore((s) => s.tasksByGroup[group.id]);
  const updateTask = useTaskStore((s) => s.updateTask);
  const moveTask = useTaskStore((s) => s.moveTask);

  // const dropIndicatorRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const ref = useRef<HTMLDivElement>(null);
  const { handleDrop, handleDragOver, handleDragLeave } = useDrop(
    ref,
    (e: DragEvent, el: HTMLElement) => {
      const taskId = e.dataTransfer.getData("taskId");
      if (!taskId) return;

      const beforeId = el.dataset.beforeId;
      if (beforeId === "-2") {
        updateTask(taskId, { groupId: undefined });
      } else {
        updateTask(taskId, { groupId: group.id });
        if (beforeId === "-1") {
          moveTask(taskId, null);
        } else if (beforeId !== taskId) {
          moveTask(taskId, beforeId ?? null);
        }
      }
    }
  );

  useEffect(() => {
    console.log("GroupItem rendered", group.name);
  });

  return (
    <div
      ref={ref}
      className="app-GroupItem w-full"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <DropIndicator
        beforeId={"-2"}
        level={0}
        // ref={(el) => {
        //   dropIndicatorRefs.current[task.id] = el;
        // }}
      />
      <div className="flex h-[40px]">
        <div className="sticky left-0 z-[9] flex w-[200px] items-center">
          <GroupName group={group} />
        </div>
        <div className="sticky left-[200px] flex">
          {totalDays.map((date) => (
            <GroupTrack
              key={date.toLocaleDateString()}
              date={date}
              tasks={tasks}
            />
          ))}
        </div>
      </div>

      <TaskDummyItem group={group} />

      {tasks?.map((task) => (
        <Fragment key={task.id}>
          <DropIndicator
            beforeId={task.id}
            level={1}
            // ref={(el) => {
            //   dropIndicatorRefs.current[task.id] = el;
            // }}
          />
          <div className="flex h-[40px] items-center">
            <TaskName task={task} level={1} />
            <div className="sticky left-[200px] flex">
              {totalDays.map((date) => (
                <TaskTrack
                  key={date.toLocaleDateString()}
                  date={date}
                  task={task}
                />
              ))}
            </div>
          </div>
        </Fragment>
      ))}
      <DropIndicator
        level={1}
        // ref={(el) => {
        //   dropIndicatorRefs.current[task.id] = el;
        // }}
      />
    </div>
  );
}
