import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Habit, Task, useUser } from "../context/UserContext";
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
import ReanimatedSwipeable from "react-native-gesture-handler/src/components/ReanimatedSwipeable";
import * as Haptics from "expo-haptics";
import { AndroidHaptics } from "expo-haptics";
import { SwipeDirectionTypes } from "react-native-screens";
import { SwipeableRef } from "react-native-gesture-handler/ReanimatedSwipeable";

const screenWidth = Dimensions.get("window").width;
const scale = (value: number) => (screenWidth / 375) * value;

const Home = () => {
  const {
    user,
    habits,
    loadHabits,
    addHabit,
    updateHabit,
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
  const habitId = editHabit?.userHabitId; // number
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const riveRef = useRef<RiveRef>(null);
  const swipeRef = useRef<any>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  let row: Array<any> = [];
  let prevOpenedRow: any;

  useEffect(() => {
    if (user) {
      loadHabits();
      loadTasks();
      console.log("user", user);
      const ONE_MINUTE = 60 * 1000;

      if (
        user.taskLastCompleted &&
        Date.now() - new Date(user.taskLastCompleted).getTime() > 5 * ONE_MINUTE
      ) {
        riveRef.current?.setInputState("State Machine 1", "Overdue", true);
      } else {
        riveRef.current?.setInputState("State Machine 1", "Overdue", false);
        riveRef.current?.setInputState("State Machine 1", "HappyTime", 45);
      }

      // riveRef.current?.setInputState('State Machine 1', 'HabitTicked', true);
    }
  }, [user]);
  useEffect(() => {
    const newHabits = habits.filter((h) =>
      h.habitTitle?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    // console.log("newHabits", newHabits);
    setFilteredHabits(newHabits);
  }, [searchTerm, habits]);

  const handleAdd = () => {
    setEditHabit(null);
    setModalVisible(true);
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
  };
  const handleEdit = (habit: any) => {
    setEditHabit(habit);
    setModalVisible(true);
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
    await updateHabit({ ...habit });
    console.log("trigger animation and complete habit");
    riveRef.current?.setInputState("State Machine 1", "HabitTicked", true);
    riveRef.current?.setInputState("State Machine 1", "Overdue", false);
    await loadHabits();
  };

  function feedPet() {
    riveRef.current?.fireState("State Machine 1", "Feed");
    riveRef.current?.setInputState("State Machine 1", "Overdue", false);
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

  const renderHabit = ({ item, index }) => {
    const progressMap = calculateHabitProgress();
    const percent = progressMap?.[item.userHabitId] ?? 0;
    // console.log("percent", progressMap?.[item.userHabitId]);
    console.log("habit", index);

    function RightAction(prog: SharedValue<number>, drag: SharedValue<number>) {
      const styleAnimation = useAnimatedStyle(() => {
        return {
          transform: [{ translateX: 0 }],
          alignItems: "center",
          justifyContent: "center",
          width: 90,
          borderRadius: 20,
          backgroundColor: "black",
          marginRight: 10,
          paddingRight: 10,
          paddingLeft: 40,
          marginLeft: -50,
          marginBottom: 12,
        };
      });

      return (
        <Animated.View style={styleAnimation}>
          <TouchableOpacity>
            <Ionicons name="pencil-outline" size={20} color="#F8F0F0" />
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
          alignItems: "center",
          justifyContent: "center",
          width: 90,
          marginLeft: 10,
          backgroundColor: "black",
          borderRadius: 20,
          paddingLeft: 10,
          paddingRight: 40,
          marginRight: -50,
          marginBottom: 12,
        };
      });

      return (
        <Animated.View style={styleAnimation}>
          <Ionicons name="trash-outline" size={20} color="#F8F0F0" />
        </Animated.View>
      );
    }

    function handleSwipe(direction: any) {
      if (direction === "left") {
        handleEdit(item);
      } else if (direction === "right") {
        handleShowConfirmDelete(item);
        setShowConfirmDelete(true);
      }
    }

    return (
      <>
        {showArchivedHabits || item.isArchived === 0 ? (
          <ReanimatedSwipeable
            friction={2}
            overshootFriction={8}
            renderRightActions={RightAction}
            renderLeftActions={LeftAction}
            onSwipeableWillOpen={handleSwipe}
            ref={(swipeRef) => (row[index] = swipeRef)}
            containerStyle={{
              width: "100%",
              alignSelf: "center",
              paddingHorizontal: 10,
            }}
          >
            <TouchableOpacity
              style={styles.card}
              onPress={() => handlePressHabit(item)}
              activeOpacity={0.8}
            >
              <View style={styles.headerRow}>
                <Text style={styles.title}>{item.habitTitle}</Text>
                {progressMap?.[item.userHabitId] ||
                progressMap?.[item.userHabitId] === 0 ? (
                  <View style={{ flexDirection: "row" }}>
                    <Text
                      style={{
                        marginLeft: "auto",
                        marginVertical: "auto",
                        marginRight: 5,
                      }}
                    >
                      {percent + "%"}
                    </Text>
                    {percent === 100 && (
                      <TouchableOpacity
                        disabled={!!item.isArchived}
                        onPress={() => handleTickHabit(item)}
                      >
                        <Ionicons
                          name={
                            !item.isArchived
                              ? "ellipse-outline"
                              : "checkmark-circle-outline"
                          }
                          size={28}
                          color="#1CC282"
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                ) : null}
              </View>
              {progressMap?.[item.userHabitId] ||
              progressMap?.[item.userHabitId] === 0 ? (
                <View style={styles.progressBarBackground}>
                  <View
                    style={[styles.progressBarFill, { width: `${percent}%` }]}
                  />
                </View>
              ) : null}
              <View style={styles.tagRow}>
                {item.goalDate ? (
                  <View style={styles.tag}>
                    <Ionicons name="calendar-outline" size={16} color="black" />
                    <Text style={styles.tagText}>
                      {" "}
                      {formatDate(item.goalDate)}
                    </Text>
                  </View>
                ) : null}
                {item.priority ? (
                  <View style={styles.tag}>
                    <Ionicons name="flag-outline" size={16} color="black" />
                    <Text style={styles.tagText}>
                      {" "}
                      {getPriorityLabel(item.priority)}
                    </Text>
                  </View>
                ) : null}
                {item.frequency ? (
                  <View style={styles.tag}>
                    <Ionicons name="time-outline" size={16} color="black" />
                    <Text
                      style={[
                        styles.tagText,
                        !item.frequency && { color: "#000" },
                      ]}
                    >
                      {item.frequency || "Frequency"}
                    </Text>
                  </View>
                ) : null}
                {/* Add a ticking box here */}
                {/* Add completed field in the backend */}
                {/* {percent === 100 && !item.isCompleted && ( */}
              </View>
            </TouchableOpacity>
          </ReanimatedSwipeable>
        ) : null}
      </>
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
    if ((await riveRef.current?.getBooleanState("HabitTicked")) === true) {
      console.log("feed pet");
      feedPet();
    }
  }

  function closeHabits() {
    console.log("close all habits", row);
    for (let h of row) {
      h?.close();
    }
    // console.log('current', swipeRef.current);
    // if (prevOpenedRow && prevOpenedRow !== row[index]) {
    //     prevOpenedRow.close();
    // }
    // prevOpenedRow = row[index];
    // swipeRef.current?.close();
  }

  return (
    <View
      style={{ flex: 1, backgroundColor: "#DAB7FF", marginTop: -insets.top }}
    >
      {modalVisible ? <Animated.View style={[styles.overlay, style]} /> : null}
      {showConfirmDelete && (
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmBox}>
            <Text style={styles.confirmText}>
              Are you sure you want to delete this habit?{"\n"}All related tasks
              will be deleted.
            </Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setShowConfirmDelete(false);
                  console.log("close delete", swipeRef.current);
                  closeHabits();
                }}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={() => {
                  console.log("test delete habit", toDeleteHabit?.userHabitId);
                  if (deleteHabit && toDeleteHabit?.userHabitId) {
                    deleteHabit(toDeleteHabit?.userHabitId);
                    setShowConfirmDelete(false);
                  }
                }}
              >
                <Text style={styles.saveText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
      <SystemBars style={"dark"} />
      <TouchableOpacity
        activeOpacity={0.8}
        style={{ marginBottom: 20, maxWidth: 125, zIndex: 2, flex: 1 }}
      >
        <Text
          onPress={handleAdd}
          style={{
            textAlign: "center",
            backgroundColor: "#1CC282",
            zIndex: 1,
            padding: 10,
            borderRadius: 20,
            fontSize: 16,
            fontWeight: "bold",
            color: "#000",
            bottom: 15,
            fontFamily: "Poppins",
            // marginBottom: -15,
            marginTop:50,
            width: "100%",
          }}
        >
          Add Habit
        </Text>
      </TouchableOpacity>
      {/*<TouchableOpacity onPress={() => handlePetInteraction()}>*/}
      {/*  <Rive*/}
      {/*      artboardName={'Pet'}*/}
      {/*      resourceName='pet'*/}
      {/*      fit={Fit.FitWidth}*/}
      {/*      ref={riveRef}*/}
      {/*      stateMachineName={"State Machine 1"}*/}
      {/*      style={styles.pet}*/}
      {/*  >*/}
      {/*    <TouchableOpacity onPress={handlePetInteraction} style={{width: "100%", height: "100%", zIndex: 1}} activeOpacity={0.8}>*/}
      {/*      <View style={{*/}
      {/*        marginTop: "auto",*/}
      {/*        flexDirection: "row",*/}
      {/*        justifyContent: 'space-between',*/}
      {/*        flexShrink: "auto",*/}
      {/*        marginHorizontal: 20,*/}
      {/*        height: "auto"*/}
      {/*      }}>*/}
      {/*        <TouchableOpacity activeOpacity={0.8}*/}
      {/*                          style={{marginBottom: 20, maxWidth: 125, zIndex: 2, flex: 1}}>*/}
      {/*          <Text onPress={handleAdd} style={{*/}
      {/*            textAlign: "center",*/}
      {/*            backgroundColor: '#1CC282',*/}
      {/*            zIndex: 1,*/}
      {/*            padding: 10,*/}
      {/*            borderRadius: 20,*/}
      {/*            fontSize: 16,*/}
      {/*            fontWeight: 'bold',*/}
      {/*            color: '#000',*/}
      {/*            bottom: 15,*/}
      {/*            fontFamily: "Poppins",*/}
      {/*            marginBottom: -15,*/}
      {/*            width: "100%"*/}
      {/*          }}>Add Habit</Text>*/}
      {/*        </TouchableOpacity>*/}
      {/*        <View style={{flexDirection: "row", marginTop: -10, marginRight: 10, zIndex: 1}}>*/}
      {/*          <Image style={{}} source={require('@/assets/images/credit.png')}/>*/}
      {/*          <Text style={{*/}
      {/*            margin: 3,*/}
      {/*            fontFamily: "Poppins",*/}
      {/*            fontSize: 20*/}
      {/*          }}>{user?.credits ? user.credits : 0}</Text>*/}
      {/*        </View>*/}
      {/*      </View>*/}
      {/*    </TouchableOpacity>*/}
      {/*  </Rive>*/}
      {/*</TouchableOpacity>*/}

      {/*<Image source={require('@/assets/images/previouscat4.png')} style={styles.catImage} resizeMode="contain" />*/}
      <View style={styles.habitContainer}>
        {/*<View style={styles.habitRow}>*/}
        {/*  <Text style={styles.today}>Today</Text>*/}
        {/*</View>*/}
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            alignItems: "center",
            marginBottom: 12,
            marginHorizontal: 15,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              backgroundColor: "#fff",
              borderRadius: 20,
              paddingHorizontal: 16,
              flexBasis: 200,
              flexGrow: 1,
            }}
          >
            <Ionicons
              name="search-outline"
              size={20}
              style={{ alignSelf: "center" }}
            ></Ionicons>
            <TextInput
              placeholder="Search habit"
              placeholderTextColor="#888"
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
          </View>
          <TouchableOpacity
            onPress={() => {
              console.log("set showArchivedHabits to", !showArchivedHabits);
              Haptics.performAndroidHapticsAsync(AndroidHaptics.Confirm).then(
                (r) => setShowArchivedHabits(!showArchivedHabits),
              );
            }}
            style={{
              padding: 2,
              paddingVertical: 8,
              marginHorizontal: 4,
              borderRadius: 20,
            }}
          >
            {showArchivedHabits ? (
              <Ionicons
                name="archive"
                size={20}
                style={{ alignSelf: "center", paddingHorizontal: 12 }}
              />
            ) : (
              <Ionicons
                name="archive-outline"
                size={20}
                style={{ alignSelf: "center", paddingHorizontal: 12 }}
              />
            )}
          </TouchableOpacity>
        </View>
        <FlatList
          style={{ paddingBottom: 10, width: "100%", alignSelf: "center" }}
          data={filteredHabits}
          keyExtractor={(item, index) =>
            item.userHabitId ? String(item.userHabitId) : String(index)
          }
          renderItem={renderHabit}
        />
      </View>
      <ItemModal
        visible={modalVisible}
        initialData={editHabit ?? undefined}
        onClose={() => {
          setModalVisible(false);
          closeHabits();
        }}
        onSave={handleSave}
        onDelete={deleteHabit}
        habitId={habitId}
      />
    </View>
  );
};

const styles = ScaledSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "#000000aa",
    justifyContent: "flex-end",
    alignItems: "center",
    position: "absolute",
    height: "100%",
    width: "100%",
    zIndex: 2,
  },
  container: {
    flex: 1,
    paddingHorizontal: screenWidth > 400 ? 24 : 16,
    paddingTop: scale(60),
    backgroundColor: "#fff",
  },
  catImage: {
    width: "100%",
    height: 180,
    marginBottom: 10,
    zIndex: 0,
    position: "relative",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: scale(12),
  },
  addButton: {
    backgroundColor: "#1CC282",
    color: "white",
    paddingHorizontal: scale(20),
    paddingVertical: scale(8),
    borderRadius: scale(24),
    fontWeight: "bold",
  },
  searchInput: {
    backgroundColor: "#f0f0f0",
    borderRadius: scale(12),
    paddingHorizontal: scale(16),
    paddingVertical: scale(10),
    fontSize: scale(14),
    marginBottom: scale(12),
  },
  habitCard: {
    backgroundColor: "#F6F6F6",
    borderRadius: scale(16),
    padding: scale(14),
    marginBottom: scale(12),
  },
  habitContainer: { flex: 1, marginBottom: 80, marginTop: 15 },
  habitTitle: { fontSize: "10@s", fontWeight: "bold", marginBottom: scale(8) },
  habitRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    marginHorizontal: "5@ms",
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: scale(6),
  },
  editIcon: { fontSize: scale(16), marginLeft: scale(6) },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    width: "100%",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: "15@ms", fontWeight: "bold", color: "#111" },
  pet: {
    width: "100%",
    borderRadius: 20,
    backgroundColor: "white",
    overflow: "hidden",
  },
  progressBarBackground: {
    height: scale(16),
    backgroundColor: "#DCDCDC",
    borderRadius: scale(8),
    marginTop: scale(8),
    marginBottom: scale(12),
    overflow: "hidden",
    width: "100%",
  },
  progressBarFill: {
    height: "100%",
    width: screenWidth * 0.6,
    backgroundColor: "#1CC282",
    borderRadius: scale(8),
  },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: scale(8) },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DCDCDC",
    paddingHorizontal: scale(12),
    paddingVertical: scale(6),
    borderRadius: scale(20),
    marginBottom: scale(4),
  },
  tagText: { fontSize: "11@ms", color: "#000", marginLeft: scale(4) },
  today: { fontSize: "18@ms", fontWeight: "bold", alignSelf: "center" },
  confirmOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#00000088",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 5,
  },
  confirmBox: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 24,
    width: "80%",
    alignItems: "center",
  },
  confirmText: {
    fontSize: 16,
    color: "#000",
    marginBottom: 16,
    textAlign: "center",
  },
  confirmButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  cancelBtn: {
    backgroundColor: "#000",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  cancelText: { fontSize: 20, color: "#dab7ff", fontWeight: "bold" },
  saveBtn: {
    backgroundColor: "#1CC282",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  saveText: { fontSize: 20, color: "#000", fontWeight: "bold", marginRight: 5 },
});

export default Home;
