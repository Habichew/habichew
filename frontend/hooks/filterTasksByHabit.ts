import { Task } from "../app/context/UserContext";

export const filterTasksByHabit = (tasks: Task[], habitId: string | null) => {
  if (!habitId) return tasks;
  return tasks.filter((task) => task.habitId === habitId);
};
