import {
    View,
    StyleSheet,
    Text,
    Platform, Pressable, Dimensions, TouchableOpacity,
} from "react-native";
import {useRouter} from "expo-router";
import {Habit, useUser} from "@/context/UserContext";
import * as Haptics from "expo-haptics";
import {AndroidHaptics} from "expo-haptics";
import {Ionicons} from "@expo/vector-icons";
import React from "react";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import Animated, {SharedValue, useAnimatedStyle} from "react-native-reanimated";
import {ScaledSheet} from "react-native-size-matters";
const scale = (value: number) => (screenWidth / 375) * value;

interface HabitProps {
    row: any;
    item: any;
    index: any;
    riveRef: any;
    setToDeleteHabit: any;
    setShowConfirmDelete: any;
    setEditHabit: any;
    setModalVisible: any;
    progressMap: any;
    completedTasks: any;
    allTasks: any;
    percent: any;
}

const screenWidth = Dimensions.get("window").width;

export default function
    HabitCard({
                  row,
                  item,
                  index,
                  riveRef,
                  setToDeleteHabit,
                  setShowConfirmDelete,
                  setEditHabit,
                  setModalVisible,
                  progressMap,
                  completedTasks,
                  allTasks,
                  percent,
              }: HabitProps) {
    const router = useRouter();
    const {
        user,
        offlineMode,
        completeHabit,
        updateHabit,
        completeHabitTasks,
    } = useUser();

    function RightAction() {

        const styleAnimation = useAnimatedStyle(() => {
            return {
                transform: [{translateX: 0}],
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
                    <Ionicons name={item.isArchived ? "folder-open-outline" : "pencil-outline"} size={20}
                              color="#F8F0F0"/>
                </TouchableOpacity>
            </Animated.View>
        );
    }

    function LeftAction(prog: SharedValue<number>) {
        const styleAnimation = useAnimatedStyle(() => {
            return {
                transform: [{translateX: 0}],
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

    const handleEdit = (habit: any) => {
        setEditHabit(habit);
        setModalVisible(true);
    };

    const handleUnarchiveHabit = async (habit: Habit) => {
        habit.isArchived = 0;
        await updateHabit(habit);
    };

    async function handleSwipe(direction: any) {
        console.log("vibrate");
        if (Platform.OS === 'android') {
            await Haptics.performAndroidHapticsAsync(AndroidHaptics.Gesture_End);
        } else {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid)
        }
        if (direction === 'left') {
            if (item.isArchived) {
                await handleUnarchiveHabit(item);
            } else {
                handleEdit(item);
            }
        } else if (direction === 'right') {
            console.log('completing/archiving habit');
            await handleTickHabit(item);
        }
    }

    //Add animation here
    const handleTickHabit = async (habit: Habit) => {
        if ((!user || offlineMode) && !habit.userHabitId) habit.userHabitId = -1; // TODO: what should we do if we don't have a userHabitId yet in offline mode? Use a negative ID to separate between offline and online resources?
        if (!habit.userHabitId) return;

        // await updateHabit({ ...habit, isCompleted: true });
        habit.isArchived = 1;

        await completeHabit({...habit});

        // completeHabitTasks(habit);
        console.log("trigger animation and complete habit");
        console.log('set ishappy to false');
        riveRef.current?.setInputState("State Machine 1", "IsHappy", false);
        riveRef.current?.setInputState("State Machine 1", "HabitTicked", true);
        // riveRef.current?.setInputState("State Machine 1", "NightTime", false);
        riveRef.current?.setInputState(
            "State Machine 1", "Overdue", false);
        await completeHabitTasks(habit);
        // await loadHabits();
        // await loadUser();
    };

    const handlePressHabit = (habit: any) => {
        router.push({
            pathname: "./tasks",
            params: {habitId: habit.userHabitId || habit.offlineUserHabitId, habitName: habit.habitTitle},
        });
    };

    function handleShowConfirmDelete(habit: any) {
        setToDeleteHabit(habit);
        setShowConfirmDelete(true);
    }

    const formatDate = (dateStr: string) => {
        if (!dateStr) return "";
        try {
            const d = new Date(dateStr);
            const day = d.getUTCDate();
            const month = d.toLocaleString("default", {month: "short"});
            return `${day} ${month}`;
        } catch {
            return "";
        }
    };

    const getPriorityLabel = (val: string | number) =>
        val === 1 ? "High" : val === 2 ? "Medium" : val === 3 ? "Low" : "Priority";

    function hasTasks() {
        return progressMap?.[item.userHabitId] || progressMap?.[item.userHabitId] === 0
            || progressMap?.[item.offlineUserHabitId] || progressMap?.[item.offlineUserHabitId] === 0;
    }

    return (
        <Swipeable
            friction={2}
            overshootFriction={8}
            leftThreshold={screenWidth * 0.3}
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
            containerStyle={{width: "100%", alignSelf: 'center', marginBottom: 12}}
        >
            <View style={{borderRadius: 16, backgroundColor: 'white', zIndex: 3, marginHorizontal: 10}}>
                <Pressable style={styles.card} onPress={() => handlePressHabit(item)}
                           onLongPress={() => handleShowConfirmDelete(item)}
                           android_ripple={{color: '#00000010', borderless: true, radius: 300}}>
                    <View style={styles.headerRow}>
                        <Text style={styles.title}>{item.habitTitle}</Text>
                        {hasTasks() ? (
                            <View style={{flexDirection: 'row'}}>
                                <Text style={{marginLeft: 'auto', marginVertical: 'auto', marginRight: 5}}>
                                    {completedTasks.toString()}/{allTasks.toString()}
                                </Text>
                            </View>
                        ) : null}
                    </View>
                    {
                        hasTasks() ?
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
                    </View>
                </Pressable>
            </View>
        </Swipeable>
    );
}
const styles = ScaledSheet.create({
    pet: {width: '100%', borderRadius: 20, backgroundColor: 'white', overflow: 'hidden'},
    container: {
        borderWidth: 1,
        borderColor: '#eee',
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
        height: 80,
        backgroundColor: "#fff",
        paddingBottom: Platform.OS === "ios" ? 24 : 12,
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 10
    },
    sideGroup: {flexDirection: "row", width: "40%", justifyContent: "space-around"},
    tabItem: {alignItems: "center", justifyContent: "flex-end", height: 60, width: 60},
    icon: {width: 28, height: 28, resizeMode: "contain", opacity: 0.6},
    activeIcon: {opacity: 1, color: "#000"},
    label: {fontSize: 12, color: "#aaa", marginTop: 4},
    activeLabel: {color: "#000", fontWeight: "900"},
    card: {padding: 16, width: '100%'},
    headerRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
    title: {fontSize: '15@ms', fontWeight: 'bold', color: '#111'},
    centerIconContainer: {
        position: "absolute",
        top: -40,
        left: "50%",
        transform: [{translateX: -40}],
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#ECECEC",
        justifyContent: "center",
        alignItems: "center",
        elevation: 6,
    },
    centerIcon: {
        width: 68,
        height: 68,
        resizeMode: "contain",
        position: 'absolute',
        zIndex: 10,
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: 90,
        borderColor: '#00000010'
    },
    inactiveCatShadow: {
        shadowColor: "#fff",
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.8,
        shadowRadius: 6,
        elevation: 6,
    },
    activeCatShadow: {
        shadowColor: "#1CC282", shadowOffset: {width: 0, height: 5}, shadowOpacity: 1, shadowRadius: 6, elevation: 6,
    },
    creditChart: {position: 'absolute', top: 0, left: 0, width: 80, height: 80, zIndex: 5},
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
});
