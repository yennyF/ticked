import { create } from "zustand";
import { Task } from "../repositories/types";
import { db } from "../repositories/db";
import { immer } from "zustand/middleware/immer";

export const UNGROUPED_KEY = "_ungrouped";

type State = {
  dummyTask: Task | undefined;
  tasksByGroup: Record<string, Task[]>;
};

type Action = {
  loadTasks: () => Promise<void>;
  addTask: (task: Task) => Promise<boolean>;
  updateTask: (
    id: string,
    task: Partial<Pick<Task, "name" | "groupId">>
  ) => Promise<boolean>;
  deleteTask: (id: string) => Promise<boolean>;
  moveTask: (id: string, beforeId: string | null) => boolean;
  setDummyTask: (task: Task | undefined) => void;
  getTaskLength: () => number;
  findTaskById: (id: string) => Task | undefined;
};

export const useTaskStore = create<State & Action, [["zustand/immer", never]]>(
  immer((set, get) => ({
    dummyTask: undefined,
    tasksByGroup: {},

    loadTasks: async () => {
      const tasks = await db.tasks.toArray();
      const tasksByGroup = tasks.reduce<Record<string, Task[]>>((acc, task) => {
        const key = task.groupId ?? UNGROUPED_KEY;
        (acc[key] ??= []).push(task);
        return acc;
      }, {});

      set(() => ({ tasksByGroup }));
    },
    addTask: async (task: Task) => {
      set((state) => {
        const key = task.groupId ?? UNGROUPED_KEY;
        (state.tasksByGroup[key] ??= []).unshift(task);
      });

      try {
        await db.tasks.add(task);
      } catch (error) {
        console.error("Error adding task:", error);
        return false;
      }
      return true;
    },
    updateTask: async (
      id: string,
      task: Partial<Pick<Task, "name" | "groupId">>
    ) => {
      set((state) => {
        const key = task.groupId ?? UNGROUPED_KEY;
        const target = state.tasksByGroup[key]?.find((t) => t.id === id);
        if (!target) return;
        Object.assign(target, task);
      });

      try {
        await db.tasks.update(id, task);
      } catch (error) {
        console.error("Error renaming task:", error);
        return false;
      }
      return true;
    },
    deleteTask: async (id: string) => {
      set((state) => {
        const task = get().findTaskById(id);
        if (!task) return;

        const key = task.groupId ?? UNGROUPED_KEY;
        const index = state.tasksByGroup[key]?.findIndex((h) => h.id === id);
        if (index < 0) return;
        state.tasksByGroup[key].splice(index, 1);
      });

      try {
        await db.tasks.delete(id);
      } catch (error) {
        console.error("Error deleting task:", error);
        return false;
      }
      return true;
    },
    moveTask: (id: string, beforeId: string | null) => {
      if (beforeId === id) return true;

      set((state) => {
        if (!state.tasks) return;

        let index = state.tasks.findIndex((h) => h.id === id);
        if (index < 0) return;

        const task = state.tasks[index];

        let deletedTasks = state.tasks.splice(index, 1);
        if (beforeId === null) {
          state.tasks.push(...deletedTasks);
        } else {
          const beforeIndex = state.tasks.findIndex(
            (task) => task.id === beforeId
          );
          state.tasks.splice(beforeIndex, 0, ...deletedTasks);
        }

        const key = task.groupId ?? UNGROUPED_KEY;
        index = state.tasksByGroup[key].findIndex((h) => h.id === id);
        if (index < 0) return;

        deletedTasks = state.tasksByGroup[key].splice(index, 1);
        if (beforeId === null) {
          state.tasksByGroup[key].push(...deletedTasks);
        } else {
          const beforeIndex = state.tasksByGroup[key].findIndex(
            (task) => task.id === beforeId
          );
          state.tasksByGroup[key].splice(beforeIndex, 0, ...deletedTasks);
        }
      });

      return true;
    },
    setDummyTask: (task: Task | undefined) => set(() => ({ dummyTask: task })),
    getTaskLength: () => {
      return Object.values(get().tasksByGroup).reduce(
        (total, tasks) => total + tasks.length,
        0
      );
    },
    findTaskById: (id: string) => {
      const { tasksByGroup } = get();
      for (const tasks of Object.values(tasksByGroup)) {
        const found = tasks.find((task) => task.id === id);
        if (found) return found;
      }
      return undefined; // not found
    },
  }))
);
