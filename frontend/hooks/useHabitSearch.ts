import { Habit } from "@/context/UserContext";

export const useHabitSearch = (habits: Habit[], keyword: string) => {
  if (!keyword.trim()) return habits;
  return habits.filter((habit: Habit) =>
    habit.habitTitle.toLowerCase().includes(keyword.toLowerCase()),
  );
};
