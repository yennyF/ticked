"use client";

import clsx from "clsx";
import { RefObject } from "react";

interface DropIndicatorProps {
  ref?: RefObject<HTMLInputElement>;
  groupId: string | null;
  beforeId?: string;
  afterId?: string;
}

export default function DropIndicatorTask({
  ref,
  groupId,
  beforeId,
  afterId,
}: DropIndicatorProps) {
  return (
    <div
      ref={ref}
      className={clsx(
        "app-DropIndicatorTask drop-indicator sticky left-[80px] flex w-[160px] items-center opacity-0"
      )}
      data-sort="task"
      data-group-id={groupId}
      data-before-id={beforeId}
      data-after-id={afterId}
    >
      <div className="h-2 w-2 rounded-full bg-[var(--gray)]" />
      <div className="h-0.5 flex-1 bg-[var(--gray)]" />
    </div>
  );
}
