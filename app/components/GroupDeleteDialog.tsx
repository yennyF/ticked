"use client";

import { Dialog } from "radix-ui";
import { useEffect, useState } from "react";
import { Group } from "../repositories/types";
import { useGroupStore } from "../stores/GroupStore";

interface GroupDeleteDialogProps {
  children: React.ReactNode;
  group: Group;
  onOpenChange?: (open: boolean) => void;
}

export default function GroupDeleteDialog({
  children,
  group,
  onOpenChange,
}: GroupDeleteDialogProps) {
  const deleteGroup = useGroupStore((s) => s.deleteGroup);

  const [open, setOpen] = useState(false);

  useEffect(() => {
    onOpenChange?.(open);
  }, [onOpenChange, open]);

  const handleDeleteConfirm = async () => {
    await deleteGroup(group.id);
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      {open && (
        <Dialog.Portal>
          <Dialog.Overlay className="overlay">
            <Dialog.Content className="dialog-content">
              <Dialog.Title className="dialog-title">
                Delete Confirmation
              </Dialog.Title>
              <Dialog.Description className="dialog-description">
                Are you sure you want to delete &quot;{group.name}&quot;?
                <br />
                <br />
                <span className="text-red-600">
                  This action cannot be undone and all associated data will be
                  permanently removed.
                </span>
              </Dialog.Description>
              <div className="dialog-bottom">
                <Dialog.Close>
                  <div className="button-cancel" onClick={handleDeleteConfirm}>
                    Yes, delete
                  </div>
                </Dialog.Close>
                <Dialog.Close>
                  <div className="button-accept">Keep</div>
                </Dialog.Close>
              </div>
            </Dialog.Content>
          </Dialog.Overlay>
        </Dialog.Portal>
      )}
    </Dialog.Root>
  );
}
