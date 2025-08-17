import { Task } from "../app/context/UserContext";

export const calculateHabitProgress = (habitId: string, tasks: Task[]) => {
  const related = tasks.filter((t) => t.habitId === habitId);
  if (related.length === 0) return 0;
  const completed = related.filter((t) => t.completed).length;
  return Math.round((completed / related.length) * 100);
};
