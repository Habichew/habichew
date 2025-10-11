import { Task } from "@/context/UserContext";

export const useTaskSearch = (tasks: Task[], keyword: string) => {
  if (!keyword.trim()) return tasks;
  return tasks.filter(
    (task) =>
      task.taskTitle.toLowerCase().includes(keyword.toLowerCase()) ||
      (task.description?.toLowerCase().includes(keyword.toLowerCase()) ??
        false),
  );
};
