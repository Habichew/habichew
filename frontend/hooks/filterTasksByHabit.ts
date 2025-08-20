import { Task } from "@/context/UserContext";

export const filterTasksByHabit = (tasks: Task[], habitId: string | null) => {
  if (!habitId) return tasks;
  return tasks.filter((task) => task.habitId === habitId);
};
