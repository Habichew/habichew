import {MMKV, Mode} from "react-native-mmkv";
import {Habit, Task, User} from "@/context/UserContext";
import {Dispatcher} from "undici";
import HttpMethod = Dispatcher.HttpMethod;

export class CacheHandler {
    static storage = new MMKV({
        id: `user-storage`,
        encryptionKey: 'pogo',
        mode: Mode.MULTI_PROCESS,
        readOnly: false
    });

    public static getHasChangedOffline(): boolean {
        return !!CacheHandler.storage.getBoolean('hasChangedOffline');
    }

    public static setHasChangedOffline(hasChangedOffline: boolean) {
        CacheHandler.storage.set('hasChangedOffline', hasChangedOffline);
    }

    private static addToQueue(method: HttpMethod, entity: Habit | Task | User) {
        let queueStr: string | undefined = CacheHandler.storage.getString('requestQueue');
        if (queueStr != null) {
            let queue: {method: HttpMethod, entity: Habit | Task | User}[] = JSON.parse(queueStr);
            queue.push({method, entity});
            CacheHandler.storage.set('requestQueue', JSON.stringify(queue));
        }
    }

    private static loadQueue() {
        return CacheHandler.storage.getString('requestQueue');
    }

    private static clearQueue() {
        CacheHandler.storage.delete('requestQueue');
    }

    static updateHabit(h: Habit) {
        const habitsStr = CacheHandler.storage.getString('habits');
        if (habitsStr) {
            const habits: Habit[] = JSON.parse(habitsStr);
            let newHabits: Habit[] = habits;
            habits.forEach((habit, index) => {
                if (habit.userHabitId === h.userHabitId) {
                    newHabits[index] = h;
                }
            });
            CacheHandler.storage.set('habits', JSON.stringify(newHabits));
        }
        this.setHasChangedOffline(true);
        this.addToQueue('PATCH', h);
    }

    static completeHabit(h: Habit) {
        console.log("complete cached habit", h);
        const habitsStr = CacheHandler.storage.getString('habits');
        if (habitsStr) {
            const habitsArr: Habit[] = JSON.parse(habitsStr);
            let newHabits: Habit[] = habitsArr;
            newHabits.forEach((habit, index) => {
                if (habit.userHabitId === h.userHabitId) {
                    h.isArchived = 1;
                    newHabits[index] = h;
                    // TODO: complete every task in habit
                    let habitTasks = CacheHandler.storage.getString('tasks');
                    if (habitTasks) {
                        let habitTasksJSON: Task[] =  JSON.parse(habitTasks);
                        habitTasksJSON.forEach((task) => {
                            if (task.habitId === h.userHabitId) {
                                this.completeTask(task);
                            }
                        })
                    }
                }
            });
            CacheHandler.storage.set('habits', JSON.stringify(newHabits));
            const cachedUserStr: string | undefined = CacheHandler.storage.getString('user');
            let cachedUserObj: User;
            if (cachedUserStr) {
                cachedUserObj = JSON.parse(cachedUserStr);
                if (cachedUserObj?.credits) cachedUserObj.credits += 10; // TODO: replace with backend algorithm (taskService.calculateTaskCredit)
                CacheHandler.storage.set('user', JSON.stringify(cachedUserObj));
            }
        }
        this.setHasChangedOffline(true);
        this.addToQueue('PATCH', h)
    }

    static saveHabits(habits: Habit[]) {
        console.log("caching habits");
        CacheHandler.storage.set('habits', JSON.stringify(habits));
    }

    static loadHabits() {
        console.log("loading cached habits");
        return CacheHandler.storage.getString('habits');
    }

    static updateTask(t: Task) {
        const tasksStr = CacheHandler.storage.getString('tasks');
        if (tasksStr) {
            const tasksArr: Task[] = JSON.parse(tasksStr);
            let newTasks: Task[] = tasksArr;
            tasksArr.forEach((task, index) => {
                if (task.userTaskId === t.userTaskId) {
                    newTasks[index] = t;
                }
            });
            CacheHandler.storage.set('tasks', JSON.stringify(newTasks));
        }
        this.setHasChangedOffline(true);
        this.addToQueue('PATCH', t);
    }

    static completeTask(t: Task) {
        console.log("complete cached task", t);
        const tasksStr = CacheHandler.storage.getString('tasks');
        if (tasksStr) {
            const tasksArr: Task[] = JSON.parse(tasksStr);
            let newTasks: Task[] = tasksArr;
            tasksArr.forEach((task, index) => {
                if (task.userTaskId === t.userTaskId) {
                    t.completed = true;
                    newTasks[index] = t;
                }
            });
            CacheHandler.storage.set('tasks', JSON.stringify(newTasks));
            const cachedUserStr: string | undefined = CacheHandler.storage.getString('user');
            let cachedUserObj: User;
            if (cachedUserStr) {
                cachedUserObj = JSON.parse(cachedUserStr);
                if (cachedUserObj?.credits) cachedUserObj.credits += 10; // TODO: replace with backend algorithm (taskService.calculateTaskCredit)
                CacheHandler.storage.set('user', JSON.stringify(cachedUserObj));
            }
        }
        this.setHasChangedOffline(true);
        this.addToQueue('PATCH', t);
    }

    static saveTasks(mapped: any[]) {
        console.log("caching mapped tasks");
        CacheHandler.storage.set('tasks', JSON.stringify(mapped));
    }

    static loadTasks() {
        console.log("loading cached tasks");
        return CacheHandler.storage.getString('tasks');
    }

    static saveUser(user: User) {
        console.log("caching user", user)
        CacheHandler.storage.set('user', JSON.stringify(user));
    }

    static loadUser() {
        console.log("loading cached user");
        return CacheHandler.storage.getString('user');
    }

    static clearUserCache() {
        CacheHandler.storage.delete('user');
        CacheHandler.storage.delete('tasks');
        CacheHandler.storage.delete('habits');
    }
}