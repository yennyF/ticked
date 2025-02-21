"use client";

import { Dialog } from "radix-ui";
import { ChangeEvent, use, useEffect, useState } from "react";
import { AppContext } from "../AppContext";

interface AddHabitProps {
  children: React.ReactNode;
}

export default function AddHabit({ children }: AddHabitProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      {open && (
        <Dialog.Portal>
          <Dialog.Overlay className="overlay">
            <Content setOpen={setOpen} />
          </Dialog.Overlay>
        </Dialog.Portal>
      )}
    </Dialog.Root>
  );
}

interface ContentProps {
  setOpen: (open: boolean) => void;
}

function Content({ setOpen }: ContentProps) {
  const appContext = use(AppContext);
  if (!appContext) {
    throw new Error("DialogContent must be used within a AppProvider");
  }
  const { habits, addHabit } = appContext;

  const [habitInput, setHabitInput] = useState("");
  const [isDuplicated, setIsDuplicated] = useState(false);

  useEffect(() => {
    if (habits.includes(habitInput)) {
      setIsDuplicated(true);
    } else {
      setIsDuplicated(false);
    }
  }, [habitInput, habits]);

  const handleHabitInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setHabitInput(event.target.value);
  };

  const handleSaveClick = () => {
    if (addHabit(habitInput)) {
      setOpen(false);
    }
  };

  return (
    <Dialog.Content className="dialog-content flex flex-col justify-center gap-8">
      <Dialog.Title className="hidden">Add Habit</Dialog.Title>
      <Dialog.Description className="">Enter a new habit</Dialog.Description>
      <fieldset className="flex flex-col gap-2">
        <input
          type="text"
          value={habitInput}
          onChange={handleHabitInputChange}
          placeholder="New habit"
          className="basis-full"
        ></input>
        <div className="text-xs text-red-500">
          {isDuplicated ? "This habit already exists" : "\u00A0"}
        </div>
      </fieldset>
      <div className="flex justify-center gap-3">
        <Dialog.Close>
          <div className="button-main">Cancel</div>
        </Dialog.Close>
        <button
          className="button-main flex-none"
          onClick={handleSaveClick}
          disabled={habitInput.length === 0 || isDuplicated}
        >
          Save
        </button>
      </div>
    </Dialog.Content>
  );
}
