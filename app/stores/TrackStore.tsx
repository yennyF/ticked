import { create } from "zustand";
import { LocaleDateString } from "../repositories/types";
import { db } from "../repositories/db";
import {
  notifyCreateError,
  notifyDeleteError,
  notifyLoadError,
} from "../components/Notification";
import { eachDayOfInterval, subDays } from "date-fns";
import { midnightUTC, midnightUTCstring } from "../util";

type State = {
  unlock: boolean;
  startDate: Date;
  endDate: Date;
  totalDays: Date[];
  // Store date strings for reliable value-based Set comparison
  tasksByDate: Record<LocaleDateString, Set<string>> | undefined;
};

type Action = {
  setUnlock: (unlock: boolean) => void;
  destroyTracks: () => void;
  initTracks: () => Promise<void>;
  loadMorePrevTracks: () => Promise<void>;
  addTrack: (date: Date, taskId: string) => void;
  addTracks: (date: Date, taskIds: string[]) => void;
  deleteTrack: (date: Date, taskId: string) => void;
  deleteTracks: (date: Date, taskIds: string[]) => void;
};

export const useTrackStore = create<State & Action>((set, get) => ({
  unlock: false,
  setUnlock: (unlock: boolean) => {
    set(() => ({ unlock }));
  },

  tasksByDate: undefined,
  startDate: new Date(),
  endDate: new Date(),
  totalDays: [],

  destroyTracks: async () => {
    set(() => ({
      unlock: false,
      asksByDate: undefined,
      totalDays: [],
    }));
  },
  initTracks: async () => {
    const endDate = new Date();
    const startDate = subDays(endDate, 60);

    const totalDays = eachDayOfInterval({
      start: startDate,
      end: endDate,
    });
    const tasksByDate: Record<LocaleDateString, Set<string>> = {};

    try {
      await db.tracks
        .where("date")
        .between(midnightUTC(startDate), midnightUTC(endDate), true, true)
        .each((track) => {
          const dateString = track.date.toLocaleDateString();
          (tasksByDate[dateString] ??= new Set()).add(track.taskId);
        });

      set(() => ({ tasksByDate, startDate, endDate, totalDays }));
    } catch (error) {
      console.error("Error initialing tasks:", error);
      notifyLoadError();
    }
  },
  loadMorePrevTracks: async () => {
    const startDate = subDays(get().startDate, 30);
    const totalDays = eachDayOfInterval({
      start: startDate,
      end: get().endDate,
    });
    const tasksByDate = { ...get().tasksByDate };

    try {
      await db.tracks
        .where("date")
        .between(
          midnightUTC(startDate),
          midnightUTC(get().endDate),
          true,
          false
        )
        .each((track) => {
          const dateString = track.date.toLocaleDateString();
          (tasksByDate[dateString] ??= new Set()).add(track.taskId);
        });

      // console.log(await timeoutPromise(2000));

      set(() => ({ tasksByDate, startDate, totalDays }));
    } catch (error) {
      console.error("Error loading more tasks:", error);
      notifyLoadError();
    }
  },
  addTrack: async (date: Date, taskId: string) => {
    const dateString = midnightUTCstring(date);
    date = midnightUTC(date);

    set((state) => {
      const tasksByDate = { ...state.tasksByDate };
      tasksByDate[dateString] = new Set(tasksByDate[dateString]);
      tasksByDate[dateString].add(taskId);
      return { tasksByDate };
    });

    try {
      await db.tracks.add({ taskId, date });
    } catch (error) {
      console.error("Error checking task:", error);
      notifyCreateError();
    }
  },
  addTracks: async (date: Date, taskIds) => {
    const dateString = midnightUTCstring(date);
    set((state) => {
      const tasksByDate = { ...state.tasksByDate };
      tasksByDate[dateString] = new Set(state.tasksByDate?.[dateString]);
      taskIds.forEach((taskId) => tasksByDate[dateString].add(taskId));
      return { tasksByDate };
    });

    try {
      date = midnightUTC(date);
      await db.tracks.bulkAdd(taskIds.map((taskId) => ({ taskId, date })));
    } catch (error) {
      console.error("Error checking tasks:", error);
      notifyCreateError();
    }
  },
  deleteTrack: async (date: Date, taskId: string) => {
    const dateString = midnightUTCstring(date);
    date = midnightUTC(date);

    set((state) => {
      if (!state.tasksByDate) return {};

      const tasksByDate = { ...state.tasksByDate };
      tasksByDate[dateString] = new Set(state.tasksByDate[dateString]);
      tasksByDate[dateString].delete(taskId);
      return { tasksByDate };
    });

    try {
      await db.tracks.delete([taskId, date]);
    } catch (error) {
      console.error("Error checking task:", error);
      notifyDeleteError();
    }
  },
  deleteTracks: async (date: Date, taskIds: string[]) => {
    const dateString = midnightUTCstring(date);
    date = midnightUTC(date);

    set((state) => {
      if (!state.tasksByDate) return {};

      const tasksByDate = { ...state.tasksByDate };
      tasksByDate[dateString] = new Set(state.tasksByDate?.[dateString]);
      taskIds.forEach((taskId) => tasksByDate[dateString].delete(taskId));
      return { tasksByDate };
    });

    try {
      await db.tracks.bulkDelete(taskIds.map((taskId) => [taskId, date]));
    } catch (error) {
      console.error("Error checking tasks:", error);
      notifyDeleteError();
    }
  },
}));
