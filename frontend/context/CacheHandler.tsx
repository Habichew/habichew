import {MMKV, Mode} from "react-native-mmkv";
import {Habit, Task, User, CachedRequest} from "@/context/UserContext";

export enum HttpMethod {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    PATCH = 'PATCH',
    DELETE = 'DELETE'
}

/**
 * Manages interactions with local key-value storage.
 */
export class CacheHandler {
    static storage = new MMKV({
        id: `user-storage`,
        encryptionKey: 'pogo',
        mode: Mode.MULTI_PROCESS,
        readOnly: false
    });

    private static hasChangedFlag: boolean = this.hasChangedOffline();  // cache if storage has changed to prevent repeated read operations to storage

    private static hasChangedOffline(): boolean {
        return !!CacheHandler.storage.getBoolean('hasChangedOffline');
    }

    public static getHasChangedOffline(): boolean {
        return this.hasChangedFlag;
    }

    public static setHasChangedOffline(hasChangedOffline: boolean) {
        if (this.hasChangedFlag === hasChangedOffline) {
            return;
        }
        CacheHandler.storage.set('hasChangedOffline', hasChangedOffline);
        this.hasChangedFlag = hasChangedOffline;
    }

    private static addToQueue(method: HttpMethod, entity: Habit | Task | User) {
        let queueStr: string | undefined = CacheHandler.storage.getString('requestQueue');
        if (queueStr != null) {
            let queue: CachedRequest[] = JSON.parse(queueStr);
            queue.push(new CachedRequest(method, entity));
            CacheHandler.storage.set('requestQueue', JSON.stringify(queue));
        }
    }

    public static loadQueue(): CachedRequest[] | null {
        const qStr = CacheHandler.storage.getString('requestQueue');
        if (qStr != null) {
            return JSON.parse(qStr);
        }
        return null;
    }

    private static clearQueue() {
        CacheHandler.storage.delete('requestQueue');
    }

    static addHabit(h: Habit) {
        console.log("caching new habit", h);

        const habitsStr = CacheHandler.storage.getString('habits');
        console.log('habitsStr',  habitsStr);
        let habits: Habit[] = habitsStr ? JSON.parse(habitsStr) : [];
        console.log('habits',  habits);
        h.offlineUserHabitId = habits.length;
        let newHabits: Habit[] = habits;
        newHabits.push(h);
        console.log('new habits',  newHabits);

        CacheHandler.storage.set('habits', JSON.stringify(newHabits));
        this.setHasChangedOffline(true);
        this.addToQueue(HttpMethod.POST, h);
        return h;
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
        this.addToQueue(HttpMethod.PATCH, h);
    }

    static completeHabit(h: Habit) {
        console.log("complete cached habit", h);
        const habitsStr = CacheHandler.storage.getString('habits');
        if (habitsStr) {
            const habitsArr: Habit[] = JSON.parse(habitsStr);
            let newHabits: Habit[] = habitsArr;
            newHabits.forEach((habit, index) => {
                if (habit.offlineUserHabitId === h.offlineUserHabitId) {
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
            console.log('new habitsssss', newHabits);
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
        this.addToQueue(HttpMethod.PATCH, h)
    }

    static saveHabits(habits: Habit[]) {
        console.log("caching habits");
        CacheHandler.storage.set('habits', JSON.stringify(habits));
    }

    static loadHabits() {
        console.log("loading cached habits");
        const habitsStr = CacheHandler.storage.getString('habits');
        return habitsStr ? JSON.parse(habitsStr) : null;
    }

    static addTask(t: Task) {
        console.log("caching new task", t);

        const tasksStr = CacheHandler.storage.getString('tasks');
        console.log('taskssStr',  tasksStr);
        let tasks: Task[] = tasksStr ? JSON.parse(tasksStr) : [];
        console.log('tasks',  tasks);
        t.offlineUserTaskId = tasks.length;
        let newTasks: Task[] = tasks;
        newTasks.push(t);
        console.log('new tasks',  newTasks);

        CacheHandler.storage.set('tasks', JSON.stringify(newTasks));
        this.setHasChangedOffline(true);
        this.addToQueue(HttpMethod.POST, t);
        return t;
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
        this.addToQueue(HttpMethod.PATCH, t);
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
        this.addToQueue(HttpMethod.PATCH, t);
    }

    static saveTasks(mapped: any[]) {
        console.log("caching mapped tasks");
        CacheHandler.storage.set('tasks', JSON.stringify(mapped));
    }

    static deleteTask(t: Task) {
        console.log("delete cached task", t);
        const tasksStr = CacheHandler.storage.getString('tasks');
        if (tasksStr) {
            const tasksArr: Task[] = JSON.parse(tasksStr);
            let newTasks: Task[] = tasksArr;
            tasksArr.forEach((task, index) => {
                if (task.userTaskId === t.userTaskId) {
                    delete newTasks[index];
                }
            });
            CacheHandler.storage.set('tasks', JSON.stringify(newTasks));
        }
        this.setHasChangedOffline(true);
        this.addToQueue(HttpMethod.DELETE, t);
    }

    static loadTasks() {
        console.log("loading cached tasks");
        let tasksStr = CacheHandler.storage.getString('tasks');
        console.log('cached tasks', tasksStr);
        return tasksStr ? JSON.parse(tasksStr) : null;
    }

    static saveUser(user: User) {
        console.log("caching user", user)
        CacheHandler.storage.set('user', JSON.stringify(user));
    }

    static loadUser(): User | null {
        console.log("loading cached user");
        let userStr = CacheHandler.storage.getString('user');
        if (userStr) {
            return JSON.parse(userStr);
        }
        else {
            let user: User = {
                id: undefined,
                username: "default",
                email: undefined
            }
            CacheHandler.storage.set('user', JSON.stringify(user));
            return user;
        }
    }

    static clearUserCache() {
        CacheHandler.storage.delete('user');
        CacheHandler.storage.delete('tasks');
        CacheHandler.storage.delete('habits');
        // CacheHandler.storage.delete('offlineMode');
    }

    static getOfflineMode(): boolean {
        return !!CacheHandler.storage.getBoolean('offlineMode');
    }

    static setOfflineMode(offlineMode: boolean): void {
        CacheHandler.storage.set('offlineMode', offlineMode);
    }

    static getTaskGeneration(): boolean {
        return !!CacheHandler.storage.getBoolean('taskGeneration');
    }

    static setTaskGeneration(taskGeneration: boolean): void {
        CacheHandler.storage.set('taskGeneration', taskGeneration);
    }

    static clearStorage(): void {
        CacheHandler.storage.clearAll();
    }
}