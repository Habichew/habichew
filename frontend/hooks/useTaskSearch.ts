import { Task } from "../app/context/UserContext";

export const useTaskSearch = (tasks: Task[], keyword: string) => {
  if (!keyword.trim()) return tasks;
  return tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(keyword.toLowerCase()) ||
      (task.description?.toLowerCase().includes(keyword.toLowerCase()) ??
        false),
  );
};
