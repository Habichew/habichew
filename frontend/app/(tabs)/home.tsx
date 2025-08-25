import React, { useEffect, useRef, useState } from "react";
import {
    Dimensions,
    FlatList,
    Image, Pressable, RefreshControl,
    Text,
    TextInput,
    TouchableOpacity,
    Vibration,
    View,Linking, Platform
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Habit, Task, useUser } from "@/context/UserContext";
import ItemModal from "@/components/ui/HabitModal";
import Rive, { Fit, RiveRef } from "rive-react-native";
import { ScaledSheet } from "react-native-size-matters";
import { SystemBars } from "react-native-edge-to-edge";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
    Easing,
    SharedValue,
    useAnimatedStyle,
    withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { AndroidHaptics } from "expo-haptics";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import AnimatedNumbers from 'react-native-animated-numbers';

const screenWidth = Dimensions.get("window").width;
const scale = (value: number) => (screenWidth / 375) * value;

const Home = () => {
    const {
        user,
        updateUser,
        loadUser,
        habits,
        loadHabits,
        addHabit,
        completeHabit,
        updateHabit,
        completeHabitTasks,
        deleteHabit,
        calculateHabitProgress,
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

    const flatListRef = useRef(null);

    let row: Array<any> = [];
    let prevOpenedRow: any;

    useEffect(() => {
        if (user) {
            setRefreshing(true);
            loadHabits();
            loadTasks();
            const ONE_MINUTE = 60 * 1000;

            // if (user.taskLastCompleted && (Date.now() - new Date(user.taskLastCompleted).getTime()) > 0.5 * ONE_MINUTE) {
            //     riveRef.current?.setInputState('State Machine 1', 'Overdue', true);
            // } else {
            //     riveRef.current?.setInputState('State Machine 1', 'Overdue', false);
            //     riveRef.current?.setInputState('State Machine 1', 'HappyTime', 45);
            // }

            if (user?.credits) {
                console.log('current credit', user.credits);
                let newArtboardName = "";
                if (user.credits > 100) {
                    newArtboardName = "Scene2";
                }
                else if (user.credits > 50) {
                    newArtboardName = "Scene1";
                }
                else {
                    newArtboardName = "Indoor";
                }

                console.log('new artboard name', newArtboardName);
                setArtboardName(newArtboardName);

                // TODO: reset all states before randomizing
                // riveRef.current?.setInputState('State Machine 1', 'NightTime', false);
                // riveRef.current?.setInputState('State Machine 1', 'Overdue', false);
                // riveRef.current?.setInputState('State Machine 1', 'ShouldTravel', false);
            }

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
            setRefreshing(false);
            // await loadStuff();
            // riveRef.current?.setInputState('State Machine 1', 'HabitTicked', true);
        }
    }, [user]);

    useEffect(() => {
        const newHabits = habits.filter((h) =>
            h.habitTitle?.toLowerCase().includes(searchTerm.toLowerCase()),
        );
        // console.log("newHabits", habits);
        setFilteredHabits(newHabits);
    }, [searchTerm, habits]);

    const handleAdd = () => {
        setEditHabit(null);
        setModalVisible(true);
        if (Platform.OS === 'android') {
            Haptics.performAndroidHapticsAsync(AndroidHaptics.Gesture_Start);
        } else {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        }
    };
    const handleSave = async (data: any) => {
        if (editHabit) {
            await updateHabit({ ...data, userHabitId: editHabit.userHabitId });
        } else {
            const addedHabit: any = await addHabit(user!.id.toString(), data);
            const userHabitId = addedHabit.habit.userHabitId;
            if (data.tasks && data.tasks.length > 0) {
                for (let task of data.tasks) {
                    let newTask: Task = {
                        title: task,
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
        flatListRef?.current.scrollToEnd({animated: true});
    };
    const handleEdit = (habit: any) => {
        setEditHabit(habit);
        setModalVisible(true);
    };

    const handleUnarchiveHabit = async (habit: Habit) => {
        habit.isArchived = 0;
        await updateHabit(habit);
    };

    function handleShowConfirmDelete(habit: any) {
        setToDeleteHabit(habit);
        setShowConfirmDelete(true);
    }

    const handlePressHabit = (habit: any) => {
        router.push({
            pathname: "./tasks",
            params: { habitId: habit.userHabitId, habitName: habit.habitTitle },
        });
    };

    //Add animation here
    const handleTickHabit = async (habit: Habit) => {
        if (!habit.userHabitId) return;
        // await updateHabit({ ...habit, isCompleted: true });
        habit.isArchived = 1;

        await completeHabit({ ...habit });

        // completeHabitTasks(habit);
        console.log("trigger animation and complete habit");
        riveRef.current?.setInputState("State Machine 1", "HabitTicked", true);
        // riveRef.current?.setInputState("State Machine 1", "NightTime", false);
        riveRef.current?.setInputState(
            "State Machine 1", "Overdue", false);
        await completeHabitTasks(habit);

        // await loadHabits();
        // await loadUser();
    };

    async function feedPet() {
        riveRef.current?.fireState("State Machine 1", "Feed");
        riveRef.current?.setInputState("State Machine 1", "HabitTicked", false);
        riveRef.current?.setInputState("State Machine 1", "Overdue", false);
        await loadUser();
    }

    const formatDate = (dateStr: string) => {
        if (!dateStr) return "";
        try {
            const d = new Date(dateStr);
            const day = d.getUTCDate();
            const month = d.toLocaleString("default", { month: "short" });
            return `${day} ${month}`;
        } catch {
            return "";
        }
    };
    const getPriorityLabel = (val: string | number) =>
        val == 1 ? "High" : val == 2 ? "Medium" : val == 3 ? "Low" : "Priority";

    const renderHabit = ({ item, index }: {item: any, index: any}) => {
        const progressMap: Record <number, any> = calculateHabitProgress();
        const percent = progressMap?.[item.userHabitId]?.percent ?? 0;
        const allTasks = progressMap?.[item.userHabitId]?.all ?? 0;
        const completedTasks = progressMap?.[item.userHabitId]?.done ?? 0;
        console.log("percent", progressMap?.[item.userHabitId]);
        // console.log("habit", index);

        function RightAction(prog: SharedValue<number>, drag: SharedValue<number>) {
            const isArchived = item.isArchived;

            const styleAnimation = useAnimatedStyle(() => {
                return {
                    transform: [{ translateX: 0 }],
                    alignItems: "center",
                    justifyContent: "center",
                    width: 180,
                    borderRadius: 20,
                    backgroundColor: "black",
                    marginRight: 10,
                    paddingRight: 10,
                    paddingLeft: 130,
                    marginLeft: -140,
                    height: '100%'
                };
            });

            return (
                <Animated.View style={styleAnimation}>
                    <TouchableOpacity>
                        <Ionicons name={item.isArchived ? "folder-open-outline" : "pencil-outline"} size={20} color="#F8F0F0"/>
                    </TouchableOpacity>
                </Animated.View>
            );
        }

        function LeftAction(prog: SharedValue<number>, drag: SharedValue<number>) {
            const styleAnimation = useAnimatedStyle(() => {
                // console.log('showLeftProgress:', prog.value);
                // console.log('appliedTranslation:', drag.value);
                return {
                    transform: [{ translateX: 0 }],
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    backgroundColor: '#1CC282',
                    width: screenWidth - (prog.value < 0.045 ? 20 : 0),
                    marginLeft: 10,
                    borderRadius: 16,
                    paddingLeft: 20
                };
            });

            return (
                <Animated.View style={styleAnimation}>
                    <Ionicons name="checkmark-done-outline" size={24} color="black"/>
                </Animated.View>
            );
        }

        function handleSwipe( direction: any) {
            console.log("vibrate");
            if (Platform.OS === 'android') {
                Haptics.performAndroidHapticsAsync(AndroidHaptics.Gesture_End);
            } else {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid)
            }
            if (direction === 'left') {
                if (item.isArchived) {
                    handleUnarchiveHabit(item);
                } else {
                    handleEdit(item);
                }
            } else if (direction === 'right') {
                console.log('completing/archiving habit');
                handleTickHabit(item);
            }
        }

        return (
            <Swipeable
                friction={2}
                overshootFriction={8}
                leftThreshold={screenWidth*0.3}
                renderRightActions={RightAction}
                renderLeftActions={!item.isArchived ? LeftAction : undefined}
                onSwipeableWillOpen={handleSwipe}
                onSwipeableOpenStartDrag={() => {
                    if (Platform.OS === 'android') {
                        Haptics.performAndroidHapticsAsync(AndroidHaptics.Gesture_Start)
                    } else {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft)
                    }
                  }
                }
                ref={(swipeRef: any) => row[index] = swipeRef}
                containerStyle={{ width: "100%", alignSelf: 'center', marginBottom: 12}}
            >
                <View style={{borderRadius: 16, backgroundColor: 'white', zIndex: 3, marginHorizontal: 10}}>
                    <Pressable style={styles.card} onPress={() => handlePressHabit(item)} onLongPress={() => handleShowConfirmDelete(item)} android_ripple={{color: '#00000010', borderless: true, radius: 300}}>
                        <View style={styles.headerRow}>
                            <Text style={styles.title}>{item.habitTitle}</Text>
                            {progressMap?.[item.userHabitId] || progressMap?.[item.userHabitId] === 0 ? (
                                <View style={{flexDirection: 'row'}}>
                                    {/*<Text style={{*/}
                                    {/*    marginLeft: 'auto',*/}
                                    {/*    marginVertical: 'auto',*/}
                                    {/*    marginRight: 5*/}
                                    {/*}}>{percent + '%'}</Text>*/}
                                    <Text style={{marginLeft: 'auto', marginVertical: 'auto', marginRight: 5}}>
                                        {completedTasks.toString()}/{allTasks.toString()}
                                    </Text>
                                    {/*{percent === 100 &&*/}
                                    {/*    <TouchableOpacity disabled={!!item.isArchived}*/}
                                    {/*                      onPress={() => handleTickHabit(item)}>*/}
                                    {/*        <Ionicons*/}
                                    {/*            name={!item.isArchived ? "ellipse-outline" : "checkmark-circle-outline"}*/}
                                    {/*            size={28} color="#1CC282"/>*/}
                                    {/*    </TouchableOpacity>}*/}
                                </View>
                            ) : null}
                        </View>
                        {
                            progressMap?.[item.userHabitId] || progressMap?.[item.userHabitId] === 0 ?
                                <View style={styles.progressBarBackground}>
                                    <View style={[styles.progressBarFill, {width: `${percent}%`}]}/>
                                </View> : null
                        }
                        <View style={styles.tagRow}>
                            {item.goalDate ? <View style={styles.tag}><Ionicons name="calendar-outline" size={16}
                                                                                color="black"/><Text
                                style={styles.tagText}> {formatDate(item.goalDate)}</Text></View> : null}
                            {item.priority ?
                                <View style={styles.tag}><Ionicons name="flag-outline" size={16} color="black"/><Text
                                    style={styles.tagText}> {getPriorityLabel(item.priority)}</Text></View> : null}
                            {item.frequency ?
                                <View style={styles.tag}><Ionicons name="time-outline" size={16} color="black"/>
                                    <Text
                                        style={[styles.tagText, !item.frequency && {color: '#000'}]}>{item.frequency || 'Frequency'}</Text>
                                </View> : null}
                            {/* Add a ticking box here */}
                            {/* Add completed field in the backend */}
                            {/* {percent === 100 && !item.isCompleted && ( */}
                        </View>
                    </Pressable>
                </View>
            </Swipeable>

        );
    };

    const handlePlay = (animationName: string) => {
        riveRef.current?.play(animationName);
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

    async function handlePetInteraction() {
        console.log('NightTime', await riveRef.current?.getBooleanState('NightTime'), 'HabitTicked', await riveRef.current?.getBooleanState('HabitTicked'));

        const nightTime: boolean | null | undefined = await riveRef.current?.getBooleanState('NightTime');
        const shouldTravel: boolean | null | undefined = await riveRef.current?.getBooleanState('ShouldTravel');
        const habitTicked: boolean | null | undefined = await riveRef.current?.getBooleanState('HabitTicked');

        if (nightTime) {
            riveRef.current?.setInputState('State Machine 1', 'NightTime', false);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } else if (shouldTravel) {
            riveRef.current?.setInputState('State Machine 1', 'ShouldTravel', false);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } else {
            if (habitTicked) {
                console.log('feed pet');
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                feedPet();
                // setArboardName('Indoor 2');
            } else {
                if (Platform.OS === 'android') {
                    Haptics.performAndroidHapticsAsync(AndroidHaptics.Gesture_Start);
                } else {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
            }
        }

    }

    function closeHabits() {
        // console.log("close all habits", row);
        for (let h of row) {
            h?.close();
        }
    }

    return (
        <View style={{flex: 1, backgroundColor: '#DAB7FF', marginTop: -insets.top}}>
            {modalVisible ? <Animated.View style={[styles.overlay, style]}/> : null}
            {showConfirmDelete ? (
                <View style={styles.confirmOverlay}>
                    <View style={styles.confirmBox}>
                        <Text style={styles.confirmText}>Are you sure you want to delete this
                            habit?{'\n'}All related tasks will be deleted.</Text>
                        <View style={styles.confirmButtons}>
                            <TouchableOpacity style={styles.cancelBtn}
                                              onPress={() => {setShowConfirmDelete(false); console.log('close delete', swipeRef.current); closeHabits();}}><Text
                                style={styles.cancelText}>Cancel</Text></TouchableOpacity>
                            <TouchableOpacity style={styles.saveBtn} onPress={() => {
                                console.log('test delete habit', toDeleteHabit?.userHabitId);
                                if (deleteHabit && toDeleteHabit?.userHabitId) {
                                    deleteHabit(toDeleteHabit?.userHabitId);
                                    setShowConfirmDelete(false);
                                }
                            }}><Text style={styles.saveText}>Delete</Text></TouchableOpacity>
                        </View>
                    </View>
                </View>
            ) : null}
            <SystemBars style={'dark'}/>
            <Rive
                artboardName={artboardName}
                url={Platform.OS === 'ios' ? "https://www.scss.tcd.ie/~nangolem/habichew-animations/pet.riv" : undefined}
                resourceName={Platform.OS === 'android' ? 'pet' : undefined}
                fit={Fit.Cover}
                ref={riveRef}
                stateMachineName={"State Machine 1"}
                style={styles.pet}
                aria-live={'polite'}
                accessible={true}
            >
                <Pressable
                    onPress={() => Linking.openURL("https://habichew.framer.website/")}
                    style={[styles.helpButton, {top: insets.top + 15}]}
                    accessibilityLabel={'Help'}
                >
                    <Text style={styles.helpText}>?</Text>
                </Pressable>
                <Pressable onPress={handlePetInteraction} style={{width: "100%", height: "100%", zIndex: 1, position: 'absolute'}} android_ripple={{color: '#ffffff20', borderless: true, foreground: true, radius: 300}}/>
                <View style={{
                    marginTop: "auto",
                    flexDirection: "row",
                    justifyContent: 'space-between',
                    marginHorizontal: 20,
                    marginVertical: 10,
                    height: "auto",
                    zIndex: 10
                }}>
                    <View style={{width: 125, borderRadius: 20, overflow: 'hidden', marginVertical: 7}}>
                        <Pressable android_ripple={{color: '#ffffff30', borderless: false, foreground: true, radius: 100}} onPress={handleAdd}
                                   style={{maxWidth: 125, zIndex: 4, flex: 1, backgroundColor: '#1CC282', borderRadius: 20 }} accessibilityLabel={'Add Habit'}>
                            <Text  style={{
                                textAlign: "center",
                                justifyContent: 'center',
                                fontSize: 16,
                                fontWeight: 'bold',
                                color: '#000',
                                fontFamily: "Poppins",
                                width: "100%",
                                paddingVertical: 8,
                            }}>Add Habit</Text>
                        </Pressable>
                    </View>

                    <View style={{borderRadius: 20}}>
                        <Pressable android_ripple={{color: '#00000010', borderless: true, foreground: true, radius: 80}} onPress={() => {router.push('/(tabs)/pet');
                            if (Platform.OS === 'android') {
                                Haptics.performAndroidHapticsAsync(AndroidHaptics.Gesture_Start);
                            } else {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            }
                        }}
                                   style={{padding: 10, borderRadius: 20, flexDirection: "row", zIndex: 3}} accessibilityLabel={'Credits'}>
                            <Ionicons name="star" size={30} color="#1CC282" style={{marginVertical: 'auto', marginBottom: 4, marginRight: 6}}/>
                            {/*<Image style={{marginVertical: 'auto', marginBottom: 4, marginRight: 3}} source={require('@/assets/images/credit.png')}/>*/}
                            {/*<Text style={{*/}
                            {/*    fontFamily: "Poppins",*/}
                            {/*    fontSize: 20,*/}
                            {/*    padding: 3,*/}
                            {/*    marginBottom: -5*/}
                            {/*}}>{user?.credits ? user.credits : 0}</Text>*/}
                            <AnimatedNumbers
                                includeComma
                                animateToNumber={user?.credits ? user.credits : 0}
                                fontStyle={{ fontSize: 20 }}
                                containerStyle={{marginVertical: 'auto'}}
                            />
                        </Pressable>
                    </View>

                </View>
            </Rive>
            {/*<Rive*/}
            {/*    url="https://www.scss.tcd.ie/~nangolem/habichew-animations/pet.riv"*/}
            {/*    artboardName="Indoor"*/}
            {/*    stateMachineName="State Machine 1"*/}
            {/*    style={{width: 400, height: 400}}*/}
            {/*/>*/}

            <View style={styles.habitContainer}>
                <View style={{flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginBottom: 12, marginHorizontal: 15}}>
                    <View style={{
                        flexDirection: 'row',
                        backgroundColor: '#fff',
                        borderRadius: 20,
                        paddingHorizontal: 16,
                        flexBasis: 200,
                        flexGrow: 1
                    }}>
                        <Ionicons name='search-outline' size={20} style={{alignSelf: 'center'}} ></Ionicons>
                        <TextInput ref={tiRef} placeholder="Search habit" placeholderTextColor="#888" value={searchTerm}onChangeText={setSearchTerm} style={{width: '100%', padding: 10}}/>
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
                        <Ionicons name={showArchivedHabits ? 'archive' : 'archive-outline'} size={20} style={{alignSelf: 'center', paddingHorizontal: 12}}/>
                        {/*<Text>Completed</Text>*/}
                    </TouchableOpacity>
                </View>
                <FlatList
                    ref={flatListRef}
                    style={{paddingBottom: 10, width: "100%", alignSelf: 'center'}}
                    initialNumToRender={10}
                    data={filteredHabits.filter((h) =>
                        (showArchivedHabits && h.isArchived) || (!showArchivedHabits && ((h.isArchived === 0) || h.isArchived === null)))
                    }
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={async () => {
                            console.log("refresh");
                            await loadHabits()
                        }}/>
                    }
                    keyExtractor={(item, index) => item.userHabitId ? String(item.userHabitId) : String(index)}
                    renderItem={renderHabit}
                />
            </View>
            <ItemModal visible={modalVisible} initialData={editHabit ?? undefined}
                       onClose={() => {setModalVisible(false); closeHabits()}} onSave={handleSave} onDelete={deleteHabit}
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
    container: {
        flex: 1,
        paddingHorizontal: screenWidth > 400 ? 24 : 16,
        paddingTop: scale(60),
        backgroundColor: '#fff'
    },
    catImage: {width: '100%', height: 180, marginBottom: 10, zIndex: 0, position: 'relative'},
    header: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: scale(12)},
    addButton: {
        backgroundColor: '#1CC282',
        color: 'white',
        paddingHorizontal: scale(20),
        paddingVertical: scale(8),
        borderRadius: scale(24),
        fontWeight: 'bold'
    },
    searchInput: {
        backgroundColor: '#f0f0f0',
        borderRadius: scale(12),
        paddingHorizontal: scale(16),
        paddingVertical: scale(10),
        fontSize: scale(14),
        marginBottom: scale(12)
    },
    habitCard: {backgroundColor: '#F6F6F6', borderRadius: scale(16), padding: scale(14), marginBottom: scale(12)},
    habitContainer: {flex: 1, marginBottom: 80, marginTop: 15},
    habitTitle: {fontSize: "10@s", fontWeight: 'bold', marginBottom: scale(8)},
    habitRow: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, marginHorizontal: "5@ms"},
    tagsRow: {flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: scale(6)},
    editIcon: {fontSize: scale(16), marginLeft: scale(6)},
    card: {padding: 16, width: '100%'},
    headerRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
    title: {fontSize: '15@ms', fontWeight: 'bold', color: '#111'},
    pet: {width: '100%', borderRadius: 20, backgroundColor: 'white', overflow: 'hidden'},
    progressBarBackground: {
        height: scale(16),
        backgroundColor: '#DCDCDC',
        borderRadius: scale(8),
        marginTop: scale(8),
        overflow: 'hidden',
        width: '100%'
    },
    progressBarFill: {height: '100%', width: screenWidth * 0.6, backgroundColor: '#1CC282', borderRadius: scale(8)},
    tagRow: {flexDirection: 'row', flexWrap: 'wrap', gap: scale(8), marginTop: 8},
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#DCDCDC',
        paddingHorizontal: scale(12),
        paddingVertical: scale(6),
        borderRadius: scale(20),
        marginBottom: scale(4)
    },
    tagText: {fontSize: '11@ms', color: '#000', marginLeft: scale(4)},
    today: {fontSize: "18@ms", fontWeight: 'bold', alignSelf: 'center'},
    confirmOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#00000088',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 5
    },
    confirmBox: {backgroundColor: '#fff', padding: 24, borderRadius: 24, width: '80%', alignItems: 'center'},
    confirmText: {fontSize: 16, color: '#000', marginBottom: 16, textAlign: 'center'},
    confirmButtons: {flexDirection: 'row', justifyContent: 'space-between', width: '100%'},
    cancelBtn: {backgroundColor: '#000', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24},
    cancelText: {fontSize: 20, color: '#dab7ff', fontWeight: 'bold'},
    saveBtn: {backgroundColor: '#1CC282', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24},
    saveText: {fontSize: 20, color: '#000', fontWeight: 'bold', marginRight: 5},
    helpButton: {
        position: "absolute",
        right: 20,
        width: 30,
        height: 30,
        borderRadius: 20,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.5
    },
    helpText: {
        color: "#000",
        fontSize: 20,
        fontWeight: "bold",
    },
});

export default Home;
