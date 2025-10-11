import React, {useEffect, useRef, useState} from "react";
import {
    Dimensions,
    FlatList,
    Image, Pressable, RefreshControl,
    Text,
    TextInput,
    TouchableOpacity,
    Vibration,
    View, Linking, Platform, ActivityIndicator
} from "react-native";
import {useRouter} from "expo-router";
import {Ionicons} from "@expo/vector-icons";
import {Habit, Task, useUser} from "@/context/UserContext";
import ItemModal from "@/components/ui/modals/HabitModal";
import {RiveRef} from "rive-react-native";
import {ScaledSheet} from "react-native-size-matters";
import {SystemBars} from "react-native-edge-to-edge";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import Animated, {
    Easing,
    SharedValue,
    useAnimatedStyle,
    withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import {AndroidHaptics} from "expo-haptics";
import {useRoute} from "@react-navigation/core";
import AnimatedPet from "@/components/AnimatedPet";
import HabitsList from "@/components/ui/lists/HabitsList";
import ConfirmDeleteModal from "@/components/ui/modals/ConfirmDeleteModal";

const Home = () => {
    /**
     * Returns the Home screen.
     */

    const {
        user,
        habits,
        tasks,
        loadHabits,
        addHabit,
        completeHabit,
        updateHabit,
        completeHabitTasks,
        deleteHabit,
        addTask,
        loadTasks,
    } = useUser();
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredHabits, setFilteredHabits] = useState(habits);
    const [modalVisible, setModalVisible] = useState(false);
    const [editHabit, setEditHabit] = useState<Partial<Habit> | null>(null);
    const [toDeleteHabit, setToDeleteHabit] = useState<Partial<Habit> | null>(
        null,
    );
    const [showArchivedHabits, setShowArchivedHabits] = useState<boolean>(false);
    const [artboardName, setArtboardName] = useState<string>("Indoor");

    const habitId = editHabit?.userHabitId; // number
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const riveRef = useRef<RiveRef>(null);
    const swipeRef = useRef<any>(null);
    const tiRef = useRef<any>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);

    const [credits, setCredits] = useState<number>(0);

    const flatListRef = useRef(null);
    const route = useRoute();

    let row: any[] = [];


    useEffect(() => {
        if (user) {
            setRefreshing(true);
            loadHabits().then(() => {
                loadTasks().then(() => {

                    const ONE_MINUTE = 60 * 1000;

                    // TODO: Change pet animation based on time since task was last completed
                    // if (user.taskLastCompleted && (Date.now() - new Date(user.taskLastCompleted).getTime()) > 0.5 * ONE_MINUTE) {
                    //     riveRef.current?.setInputState('State Machine 1', 'Overdue', true);
                    // } else {
                    //     riveRef.current?.setInputState('State Machine 1', 'Overdue', false);
                    //     riveRef.current?.setInputState('State Machine 1', 'HappyTime', 45);
                    // }

                    if (user?.credits && user.credits > credits) {
                        // TODO: Fix background update
                        // console.log('current credit', user.credits);
                        // setCredits(user?.credits);
                        // let newArtboardName = "";
                        // if (user.credits > 100) {
                        //     newArtboardName = "Scene2";
                        // }
                        // else if (user.credits > 50) {
                        //     newArtboardName = "Scene1";
                        // }
                        // else {
                        //     newArtboardName = "Indoor";
                        // }
                        //
                        // console.log('new artboard name', newArtboardName);
                        // setArtboardName(newArtboardName);

                        // TODO: reset all states before randomizing
                        // riveRef.current?.setInputState('State Machine 1', 'NightTime', false);
                        // riveRef.current?.setInputState('State Machine 1', 'Overdue', false);
                        // riveRef.current?.setInputState('State Machine 1', 'ShouldTravel', false);
                    } else {
                        let rng = Math.random() * 3;
                        console.log('rng', rng);
                        switch (Math.floor(rng)) {
                            case 0:
                                // Sleeping
                                console.log('trigger sleeping animation');
                                riveRef.current?.setInputState('State Machine 1', 'NightTime', true);
                                riveRef.current?.setInputState('State Machine 1', 'Overdue', false);
                                riveRef.current?.setInputState('State Machine 1', 'ShouldTravel', false);
                                break;
                            case 1:
                                // Hungry
                                console.log('trigger hungry animation');
                                riveRef.current?.setInputState('State Machine 1', 'Overdue', true);
                                riveRef.current?.setInputState('State Machine 1', 'ShouldTravel', false);
                                riveRef.current?.setInputState('State Machine 1', 'NightTime', false);
                                break;
                            case 2:
                                // Travel
                                console.log('trigger travel animation');
                                riveRef.current?.setInputState('State Machine 1', 'ShouldTravel', true);
                                riveRef.current?.setInputState('State Machine 1', 'Overdue', false);
                                riveRef.current?.setInputState('State Machine 1', 'NightTime', false);

                        }
                    }
                    setRefreshing(false);
                    // await loadStuff();
                    // riveRef.current?.setInputState('State Machine 1', 'HabitTicked', true);
                });
            });
        }
    }, [user]);

    useEffect(() => {
        if (user?.credits && user.credits > credits) {
            console.log('current credit', user.credits);
            setCredits(user?.credits);
            let newArtboardName = "";
            if (user.credits > 100) {
                newArtboardName = "Scene2";
            } else if (user.credits > 50) {
                newArtboardName = "Scene1";
            } else {
                newArtboardName = "Indoor";
            }

            console.log('new artboard name', newArtboardName);
            setArtboardName(newArtboardName);
        }
    }, [route]);

    useEffect(() => {
        const newHabits = habits.filter((h) =>
            h.habitTitle?.toLowerCase().includes(searchTerm.toLowerCase()),
        );
        // console.log("newHabits", habits);
        setFilteredHabits(newHabits);
    }, [searchTerm, habits]);

    function closeHabits(): void {
        for (let h of row) {
            h?.close();
        }
    }

    const handleSave = async (data: any) => {
        if (editHabit) {
            await updateHabit({...data, userHabitId: editHabit.userHabitId});
        } else {
            const addedHabit: any = await addHabit(user!.id.toString(), data);
            const userHabitId = addedHabit.habit.userHabitId;
            if (data.tasks && data.tasks.length > 0) {
                for (let task of data.tasks) {
                    let newTask: Task = {
                        taskTitle: task,
                        dueAt: data.dueAt || null,
                        habitId: userHabitId,
                    };
                    await addTask(newTask);
                    console.log(
                        "added new task",
                        newTask,
                        "for habit with id",
                        userHabitId,
                    );
                }
            }
        }
        await loadHabits();
        // @ts-ignore
        flatListRef.current.scrollToEnd({animated: true});
    };

    const config = {
        duration: 500,
        easing: Easing.bezier(0.5, 0.01, 0, 1),
    };

    const style = useAnimatedStyle(() => {
        return {
            backgroundColor: withTiming("#000000aa", config),
        };
    });

    return (
        <View style={{flex: 1, backgroundColor: '#DAB7FF', marginTop: -insets.top}}>
            {modalVisible ? <Animated.View style={[styles.overlay, style]}/> : null}
            {showConfirmDelete ?
                <ConfirmDeleteModal
                    swipeRef={swipeRef}
                    closeHabits={closeHabits}
                    toDeleteHabit={toDeleteHabit}
                    setToDeleteHabit={setToDeleteHabit}
                    setShowConfirmDelete={setShowConfirmDelete}
                /> : null}
            <SystemBars style={'dark'}/>
            <AnimatedPet
                artboardName={artboardName}
                riveRef={riveRef}
                setEditHabit={setEditHabit}
                setModalVisible={setModalVisible}
            />
            <View style={styles.habitContainer}>
                <View style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    marginBottom: 12,
                    marginHorizontal: 15
                }}>
                    <View style={{
                        flexDirection: 'row',
                        backgroundColor: '#fff',
                        borderRadius: 20,
                        paddingHorizontal: 16,
                        flexBasis: 200,
                        flexGrow: 1
                    }}>
                        <Ionicons name='search-outline' size={20} style={{alignSelf: 'center'}}></Ionicons>
                        <TextInput ref={tiRef} placeholder="Search habit" placeholderTextColor="#888" value={searchTerm}
                                   onChangeText={setSearchTerm} style={{width: '100%', padding: 10}}/>
                    </View>
                    <TouchableOpacity onPress={() => {
                        console.log("set showArchivedHabits to", !showArchivedHabits);
                        if (Platform.OS === 'android') {
                            Haptics.performAndroidHapticsAsync(showArchivedHabits ? AndroidHaptics.Toggle_On : AndroidHaptics.Toggle_Off);
                        } else {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
                        }
                        setShowArchivedHabits(!showArchivedHabits);
                    }} style={{padding: 2, paddingVertical: 8, marginHorizontal: 4, borderRadius: 20}}>
                        <Ionicons name={showArchivedHabits ? 'archive' : 'archive-outline'} size={20}
                                  style={{alignSelf: 'center', paddingHorizontal: 12}}/>
                    </TouchableOpacity>
                </View>
                <HabitsList
                    flatListRef={flatListRef}
                    filteredHabits={filteredHabits}
                    showArchivedHabits={showArchivedHabits}
                    refreshing={refreshing}
                    setToDeleteHabit={setToDeleteHabit}
                    setShowConfirmDelete={setShowConfirmDelete}
                    setEditHabit={setEditHabit}
                    setModalVisible={setModalVisible}
                    row={row}
                    riveRef={riveRef}/>


            </View>
            <ItemModal visible={modalVisible} initialData={editHabit ?? undefined}
                       onClose={() => {
                           setModalVisible(false);
                           closeHabits()
                       }} onSave={handleSave} onDelete={deleteHabit}
                       habitId={habitId}/>
        </View>
    );
};

const styles = ScaledSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: '#000000aa',
        justifyContent: 'flex-end',
        alignItems: 'center',
        position: "absolute",
        height: "100%",
        width: "100%",
        zIndex: 2
    },
    habitContainer: {flex: 1, marginBottom: 80, marginTop: 15},
});

export default Home;
