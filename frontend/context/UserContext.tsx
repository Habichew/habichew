// frontend/context/UserContext.tsx
import React, {createContext, ReactNode, useContext, useState} from "react";
import {Alert} from "react-native";
import {CacheHandler, HttpMethod} from "@/context/CacheHandler";

const backendUrl = process.env.BACKEND_URL;

export class CachedRequest {
    private method: HttpMethod;
    private entity: Habit | Task | User;

    constructor(method: HttpMethod, entity: Habit | Task | User) {
        this.method = method;
        this.entity = entity;
    }

    public getMethod(): HttpMethod {
        return this.method;
    }

    public setMethod(method: HttpMethod) {
        this.method = method;
    }

    public getEntity(): Habit | Task | User {
        return this.entity;
    }

    public setEntity(entity: Habit | Task | User) {
        this.entity = entity;
    }
}

export type User = {
    id?: number;
    email?: string;
    username: string;
    profileImg?: string;
    mood?: string | null;
    petId?: number | null;
    credits?: number;
    tasksNum?: number;
    taskLastCompleted?: string | null;
};

const isUser: (o: any) => o is User = (o: any): o is User => {
    return o && o.hasOwnProperty("email") && typeof o.phrase === "string";
}

export type Habit = {
    userHabitId?: number;
    offlineUserHabitId?: number; // needed to create habits offline without clashing with database ids when syncing with servers
    habitTitle: string;
    goalDate?: string | null;
    startDate: string;
    priority?: number | null;
    frequency?: string | null;
    isArchived?: number;
};

const isHabit: (o: any) => o is Habit = (o: any): o is Habit => {
    return o && o.hasOwnProperty("habitTitle") && typeof o.phrase === "string";
}

export type Task = {
    userTaskId?: number;
    offlineUserTaskId?: number;
    taskTitle: string;  // renamed from 'title' to make type guarding easier
    description?: string | null;
    completed?: boolean;
    credit?: number;
    priority?: "low" | "medium" | "high" | null;
    dueAt?: string | null;
    //Habitid is used here because of the previous confusion,
    habitId?: number;
    createdAt?: string;
    completedAt?: string;
};

const isTask: (o: any) => o is Task = (o: any): o is Task => {
    return o && o.hasOwnProperty("taskTitle") && typeof o.phrase === "string";
}

export type Pet = {
    id?: string;
    name: string;
    mood?: string;
    personality?: string;
    level?: number;
    hunger?: number;
    createdAt?: string;
};

export type Mood = {
    userId: number;
    moodTypeId: number;
    note: string | null;
    moodDate: string;
};

export type MoodType = {
    id: number;
    label: string;
    colorCode: string;
};

type UserDataContextType = {
    user: User | null;
    setUser: (user: User | null) => void;
    updateUser: (user: User) => void;
    clearUser: () => void;

    habits: Habit[];
    tasks: Task[];
    pet: Pet | null;
    moods: Mood[];
    moodTypes: MoodType[];
    setHabits: (h: Habit[]) => void;
    setTasks: (t: Task[]) => void;
    setPet: (p: Pet) => void;
    setMoods: (mood: Mood[]) => void;

    loadHabits: () => Promise<void>;
    loadTasks: () => Promise<void>;
    loadPet: () => Promise<void>;
    loadMoods: () => Promise<void>;
    loadMoodTypes: () => Promise<void>;
    loadUser: () => Promise<void>;

    addHabit: (userId: string, h: Habit) => Promise<void>;
    completeHabit: (h: Habit) => Promise<void>;
    updateHabit: (h: Habit) => Promise<void>;
    completeHabitTasks: (h: Habit) => Promise<void>;
    deleteHabit: (userHabitId: number) => Promise<void>;

    addTask: (t: Task) => Promise<void>;
    updateTask: (t: Task) => Promise<void>;
    completeTask: (t: Task) => Promise<void>;

    createPet: (p: Pet) => Promise<void>;

    calculateHabitProgress: () => Record<number, number>;

    deleteTask: (userTaskId: number) => Promise<void>;

    addMood: (m: Mood) => Promise<void>;

    synchronise: () => Promise<void>;

    offlineMode: boolean;
    setOfflineMode: (offlineMode: boolean) => void;

    taskGeneration: boolean;
    setTaskGeneration: (generateTasks: boolean) => void;
};

const UserDataContext = createContext<UserDataContextType | undefined>(
    undefined,
);

export const UserProvider = ({children}: { children: ReactNode }) => {
    const [user, setUserState] = useState<User | null>(null);
    const [habits, setHabits] = useState<Habit[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [pet, setPet] = useState<Pet | null>(null);
    const [moods, setMoods] = useState<Mood[]>([]);
    const [moodTypes, setMoodTypes] = useState<MoodType[]>([]);
    const [offlineMode, setOfflineMode] = useState<boolean>(CacheHandler.getOfflineMode());
    const [taskGeneration, setTaskGeneration] = useState<boolean>(CacheHandler.getTaskGeneration());

    const setUser = (user: User | null) => {
        setUserState(user);
    };

    const clearUser = () => {
        setUserState(null);
        setHabits([]);
        setTasks([]);
        setPet(null);
        setMoods([]);
        setMoodTypes([]);
    };

    // ----------------- User Log --------------------
    const loadUser = async () => {
        console.log('loading cache', user === null || offlineMode);
        if (user === null || offlineMode) {
            console.log('loading cached user');
            loadCachedUser();
            return;
        }

        try {
            const response = await fetch(
                `${process.env.EXPO_PUBLIC_BACKEND_URL}/users/${user?.id}`,
                {
                    method: "GET",
                    headers: {"Content-Type": "application/json"}
                },
            );

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || "Failed to update user");
            }

            const data = await response.json();
            setUser(data[0]);
            console.log("Retrieved user successfully:", data[0]);

            // reload habit table
            // await loadHabits();
        } catch (error) {
            console.error("Failed to update user:", error);
        }

        function loadCachedUser() {
            // load cached user (if they exist)
            const cachedUser = CacheHandler.loadUser();
            if (cachedUser) {
                console.log("setting cached user", cachedUser);
                setUser(cachedUser);
            }
        }
    }

    const updateUser = async (user: User) => {
        if (!user) return;

        try {
            const response = await fetch(
                `${process.env.EXPO_PUBLIC_BACKEND_URL}/user/${user.id}`,
                {
                    method: "PATCH",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({
                        email: user.email,
                        username: user.username,
                        petId: user.petId,
                        credits: user.credits
                    }),
                },
            );

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || "Failed to update user");
            }

            const data = await response.json();
            console.log("Habit updated successfully:", data);

            // reload habit table
            await loadHabits();
        } catch (error) {
            console.error("Failed to update user:", error);
        }
    };

    // ----------------- Habit Logic -----------------
    const loadHabits = async () => {
        if (!user || offlineMode) {
            console.log('loading cached habits');
            loadCachedHabits();
            return;
        }

        function loadCachedHabits() {
            // load cached habits (if they exist)
            const cachedHabits = CacheHandler.loadHabits();
            if (cachedHabits) {
                console.log("setting cached habits", cachedHabits);
                setHabits(cachedHabits);
            }
        }

        try {
            const res = await fetch(
                `${process.env.EXPO_PUBLIC_BACKEND_URL}/habits/${user.id}`,
            );
            const data = await res.json();
            setHabits(data);

        } catch (err) {
            console.error("Failed to load habits:", err);
        }
    };

    const addHabit = async (userId: string | undefined, habit: Habit) => {
        if (!user || offlineMode) {
            habit.isArchived = 0;
            const addedHabit = CacheHandler.addHabit(habit);
            console.log('added habit', addedHabit);
            return addedHabit;
            // await loadHabits();
        }

        try {
            const payload = {
                customTitle: habit.habitTitle,
                priority: habit.priority ?? null,
                startDate: habit.startDate,
                goalDate: habit.goalDate ?? null,
                frequency: habit.frequency ?? null,
            };
            const response = await fetch(
                `${process.env.EXPO_PUBLIC_BACKEND_URL}/habits/${userId}`,
                {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify(payload),
                },
            );

            if (!response.ok) throw new Error("Failed to add habit");
            const data = await response.json();
            console.log("Habit added:", data);
            await loadHabits();
            return data;
        } catch (error) {
            console.error("Add habit failed:", error);
        }
    };

    const updateHabit = async (habit: Habit) => {
        if (!user || !habit.userHabitId) return;

        try {
            const response = await fetch(
                `${process.env.EXPO_PUBLIC_BACKEND_URL}/habits/${user.id}/${habit.userHabitId}`,
                {
                    method: "PATCH",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({
                        customTitle: habit.habitTitle,
                        priority: habit.priority,
                        startDate: habit.startDate.slice(0, 10),
                        goalDate: habit.goalDate?.slice(0, 10),
                        frequency: habit.frequency,
                        isArchived: habit.isArchived,
                    }),
                },
            );

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || "Failed to update habit");
            }

            const data = await response.json();
            console.log("Habit updated successfully:", data);

            // reload habit table
            await loadHabits();
        } catch (error) {
            console.error("Failed to update habit:", error);
        }
    };

    const completeHabit = async (habit: Habit) => {
        console.log("complete habit", habit);
        if (!habit.userHabitId) return;
        else if (!user || offlineMode) {
            completeCachedHabit(habit);
            await loadHabits();
            return;
        }

        function completeCachedHabit(habit: Habit) {
            CacheHandler.completeHabit(habit);
        }

        try {
            const res = await fetch(
                `${process.env.EXPO_PUBLIC_BACKEND_URL}/habits/${user.id}/${habit.userHabitId}/completed`,
                {
                    method: "PATCH",
                    headers: {"Content-Type": "application/json"},
                },
            );

            if (res.ok) {
                await loadHabits();
                // await loadUser();
            } else {
                const err = await res.json();
                console.error("Failed to complete habit:", err);
            }
        } catch (err) {
            console.error(" Failed to complete habit:", err);
        }
    }

    const completeHabitTasks = async (habit: Habit) => {
        if (!user || !habit.userHabitId) return;

        const habitTasks = tasks.filter(
            (t) => t.habitId === habit.userHabitId
        );

        for (let task of habitTasks) {
            task.completed = true;
            await completeTask(task);
        }
        console.log('completed all tasks of habit', habit.userHabitId);
    };

    const deleteHabit = async (userHabitId: number) => {
        if (!user) return;
        try {
            const res = await fetch(
                `${process.env.EXPO_PUBLIC_BACKEND_URL}/habits/${user.id}/${userHabitId}`,
                {
                    method: "DELETE",
                    headers: {"Content-Type": "application/json"},
                },
            );
            if (res.ok) {
                await loadHabits();
            } else {
                const errData = await res.json();
                console.error("Delete failed:", errData.message);
            }
        } catch (err) {
            console.error("Failed to delete habit:", err);
        }
    };

    // ----------------- Task Logic -----------------
    const loadTasks = async () => {

        if (!user || offlineMode) {
            loadCachedTasks();
            return;
        }

        function loadCachedTasks() {
            // load cached tasks (if they exist)
            const cachedTasks = CacheHandler.loadTasks();
            console.log('setting cached tasks', cachedTasks);
            setTasks(cachedTasks ? cachedTasks : []);
        }

        try {
            const res = await fetch(
                `${process.env.EXPO_PUBLIC_BACKEND_URL}/users/${user.id}/tasks`,
            );
            const data = await res.json();
            const mapped = data.map((t: any) => {
                const habit = habits.find((h) => h.userHabitId === t.userHabitId);
                return {
                    userTaskId: t.userTaskId,
                    habitId: t.userHabitId,
                    title: t.taskTitle,
                    description: t.description,
                    priority: t.priority,
                    dueAt: t.dueAt,
                    credit: t.credit,
                    completed: !!Number(t.completed), //transfer to boolean
                    habitTitle: habit?.habitTitle || "",
                    completedAt: t.completedAt,
                };
            });
            setTasks(mapped);
            CacheHandler.saveTasks(mapped); // cache tasks
        } catch (err) {
            console.error("Failed to load tasks:", err);
            loadCachedTasks();
        }
    };

    // return habitId → % map
    const calculateHabitProgress = (): Record<number, number> => {
        const progressMap: Record<number, any> = {};
        console.log('calculating habit progress for tasks', tasks);
        const grouped = tasks.reduce(
            (acc, t) => {
                if (!t.habitId) return acc;
                if (!acc[t.habitId]) acc[t.habitId] = [];
                acc[t.habitId].push(t);
                return acc; //FIXME
            },
            {} as Record<number, Task[]>,
        );

        console.log('groups', grouped);

        for (const habitId in grouped) {
            const all = grouped[habitId];
            const done = all.filter((t) => !!t.completed).length;
            const percent =
                all.length === 0 ? 0 : Math.round((done / all.length) * 100);
            progressMap[+habitId] = {percent: percent, all: all.length, done: done};
        }
        console.log('progress', progressMap);
        return progressMap;
    };

    const addTask = async (t: Task) => {
        if (!user || offlineMode) {
            t.completed = false;
            const addedTask: Task = CacheHandler.addTask(t);
            console.log('added task', addedTask);
            await loadTasks();
            return;
        }

        const payload = {
            task: {
                customTitle: t.taskTitle,
                taskId: null,
                userHabitId: t.habitId,
                description: t.description,
                priority: t.priority,
                dueAt: t.dueAt,
                credit: t.credit,
            },
        };

        console.log("Payload to send:", payload);

        try {
            const res = await fetch(
                `${process.env.EXPO_PUBLIC_BACKEND_URL}/users/${user.id}/tasks`,
                {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify(payload),
                },
            );

            if (res.ok) {
                await loadTasks();
            } else {
                const err = await res.json();
                console.error("Failed to add task:", err);
            }
        } catch (err) {
            console.error("Error adding task:", err);
        }
    };

    const updateTask = async (t: Task) => {
        if (!t.userTaskId) return;
        else if (!user || offlineMode) {
            CacheHandler.updateTask(t);
            return;
        }

        const payload = {
            task: {
                customTitle: t.taskTitle,
                description: t.description ?? "",
                priority: t.priority || null,
                dueAt: t.dueAt || null,
                credit: t.credit ?? 0,
                completed: t.completed === true,
            },
        };

        try {
            const res = await fetch(
                `${process.env.EXPO_PUBLIC_BACKEND_URL}/users/${user.id}/tasks/${t.userTaskId}`,
                {
                    method: "PATCH",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify(payload),
                },
            );

            if (!res.ok) {
                const err = await res.json();
                console.error("Failed to update task:", err);
                CacheHandler.updateTask(t);
            }
        } catch (err) {
            console.error(" Failed to update task:", err);
            CacheHandler.updateTask(t);
        }
        await loadTasks();
    };

    const completeTask = async (t: Task) => {
        if (!t.userTaskId) return;
        else if (!user || offlineMode) {
            CacheHandler.completeTask(t);
            return;
        }

        try {
            const res = await fetch(
                `${process.env.EXPO_PUBLIC_BACKEND_URL}/users/${user.id}/tasks/${t.userTaskId}/completed`,
                {
                    method: "PATCH",
                    headers: {"Content-Type": "application/json"},
                },
            );

            if (!res.ok) {
                const err = await res.json();
                console.error("Failed to complete task:", err);
                CacheHandler.completeTask(t);
            }
        } catch (err) {
            console.error(" Failed to complete task:", err);
            CacheHandler.completeTask(t);
        }
        await loadTasks();
    };

    const deleteTask = async (userTaskId: number) => {
        if (!user || offlineMode) {
            // TODO: delete task in offline mode
            return;
        }
        try {
            const res = await fetch(
                `${process.env.EXPO_PUBLIC_BACKEND_URL}/users/${user.id}/tasks/${userTaskId}`,
                {
                    method: "DELETE",
                },
            );
            if (res.ok) await loadTasks();
        } catch (err) {
            console.error("Failed to delete task:", err);
        }
    };

    // -----------------
    // Pet Logic
    const loadPet = async () => {
        if (!user) {
            console.log("no user found");
            return;
        }
        console.log("load user's pet");
        try {
            const response = await fetch(
                `${process.env.EXPO_PUBLIC_BACKEND_URL}/users/${user.id}/pet`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                },
            );
            const petData = await response.json();

            if (response.ok) {
                setPet(petData[0]);
                console.log("loaded pet", petData);
            } else {
                Alert.alert("Missing input", "Please enter email and password");
            }
        } catch (error) {
            Alert.alert("Error", "Failed to connect to the server");
        }
    };

    const createPet = async (p: Pet) => {
        if (!user) {
            console.log("no user found");
            return;
        }

        try {
            const payload = {
                pet: {
                    name: p.name,
                    level: p.level
                },
            };

            const response = await fetch(
                `${process.env.EXPO_PUBLIC_BACKEND_URL}/users/${user.id}/pet`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                },
            );
            const petData = await response.json();

            if (response.ok) {
                // setPet(petData[0]);
                console.log("loaded pet", petData);
            } else {
                // Alert.alert("Missing input", "Please enter email and password");
                Alert.alert("Error", "Pet creation failed");
            }
        } catch (error) {
            Alert.alert("Error", "Failed to connect to the server");
        }
    }

    // ----------------- Mood Logic -----------------
    const loadMoods = async () => {
        if (!user) return;
        try {
            const res = await fetch(
                `${process.env.EXPO_PUBLIC_BACKEND_URL}/moods/${user.id}`,
            );
            const data = await res.json();
            console.log("moods", data);
            setMoods(data);
        } catch (err) {
            console.error("Failed to load moods:", err);
        }
    };

    const addMood = async (m: Mood) => {
        if (!user) return;

        const payload = {
            mood: {
                userId: m.userId,
                moodTypeId: m.moodTypeId,
                note: m.note,
                moodDate: m.moodDate,
            },
        };

        console.log("Payload to send:", payload);

        try {
            const res = await fetch(
                `${process.env.EXPO_PUBLIC_BACKEND_URL}/users/${user.id}/tasks`,
                {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify(payload),
                },
            );

            if (res.ok) {
                await loadTasks();
            } else {
                const err = await res.json();
                console.error("Failed to add task:", err);
            }
        } catch (err) {
            console.error("Error adding task:", err);
        }
    };

    const loadMoodTypes = async () => {
        if (!user) return;
        try {
            const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/moods`);
            const data = await res.json();
            console.log("mood types", data);
            setMoodTypes(data);
        } catch (err) {
            console.error("Failed to load mood types:", err);
        }
    };

    async function sendCachedHabitRequest(habit: Habit, method: HttpMethod) {
        if (!user) return;
        switch (method) {
            case 'DELETE':
                if (habit.userHabitId) await deleteHabit(habit.userHabitId);
                break;
            case 'PATCH':
                await updateHabit(habit);
                break;
            case 'POST':
                await addHabit(user.id?.toString(), habit);
                break;
        }
    }

    async function sendCachedTaskRequest(task: Task, method: HttpMethod) {
        switch (method) {
            case HttpMethod.DELETE:
                if (task.userTaskId) await deleteTask(task.userTaskId);
                break;
            case HttpMethod.PATCH:
                await updateTask(task);
                break;
            case HttpMethod.POST:
                await addTask(task);
                break;
        }
    }

    async function sendCachedUserRequest(user: User, method: HttpMethod) {
        switch (method) {
            // deleting user while offline should not be possible
            case HttpMethod.PATCH:
                break;
            case HttpMethod.POST:
                break;
        }
    }

    const sendCachedRequest = async (request: CachedRequest) => {
        if (!user) return;
        console.log('sending cached entity to user', user.id);
        const entity = request.getEntity();
        const method = request.getMethod();

        if (isHabit(entity)) {
            await sendCachedHabitRequest(entity, method);
        } else if (isTask(entity)) {
            await sendCachedTaskRequest(entity, method);
        } else if (isUser(entity)) {
            await sendCachedUserRequest(entity, method);
        }
    }

    const synchronise = async () => {
        if (!user || !CacheHandler.getHasChangedOffline()) return;
        // TODO: synchronise local storage and server if out of sync
        // get every request from request queue
        let queue: CachedRequest[] | null = CacheHandler.loadQueue();
        queue?.forEach(request => {
            // send request to server
            sendCachedRequest(request);
        });
    }

    return (
        <UserDataContext.Provider
            value={{
                user,
                setUser,
                updateUser,
                clearUser,
                habits,
                tasks,
                pet,
                moods,
                moodTypes,
                setHabits,
                setTasks,
                setPet,
                setMoods,
                loadHabits,
                loadTasks,
                calculateHabitProgress,
                loadPet,
                loadMoods,
                loadMoodTypes,
                loadUser,
                addHabit,
                completeHabit,
                updateHabit,
                completeHabitTasks,
                deleteHabit,
                addTask,
                updateTask,
                completeTask,
                deleteTask,
                addMood,
                createPet,
                synchronise,
                offlineMode,
                setOfflineMode,
                taskGeneration,
                setTaskGeneration
            }}
        >
            {children}
        </UserDataContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserDataContext);
    if (!context) throw new Error("useUser must be used within UserProvider");
    return context;
};
