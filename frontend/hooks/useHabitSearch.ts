import { Habit } from "../app/context/UserContext";

export const useHabitSearch = (habits: Habit[], keyword: string) => {
  if (!keyword.trim()) return habits;
  return habits.filter((habit) =>
    habit.name.toLowerCase().includes(keyword.toLowerCase()),
  );
};
