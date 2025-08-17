import React, { useEffect, useState } from "react";
import {
  Dimensions,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Image,
} from "react-native";
import { useSharedValue } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as Calendar from "expo-calendar";
import DateTimePicker, { useDefaultStyles } from "react-native-ui-datepicker";
import BottomBar from "@/components/bottomBar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Carousel, {
  ICarouselInstance,
  Pagination,
} from "react-native-reanimated-carousel";
import { ScaledSheet } from "react-native-size-matters";
import PieChart, { dataItem } from "react-native-expo-pie-chart";
import { Habit, Task, useUser } from "../context/UserContext";

export default function InsightsScreen() {
  const [selectedTab, setSelectedTab] = useState<
    "Today" | "Weekly" | "Monthly"
  >("Weekly");
  const [pieData, setPieData] = useState<
    { color: string; count: number; key: string }[]
  >([]);
  const [completedDays, setCompletedDays] = useState<Date[]>([]);
  const router = useRouter();

  // const moods = [
  //     {name: 'focused', color: 'green', entries: 4},
  //     {name: 'unmotivated', color: 'yellow', entries: 12},
  //     {name: 'distracted', color: 'orange', entries: 4},
  //     {name: 'overwhelmed', color: 'red', entries: 7},
  // ];

  const defaultStyles = useDefaultStyles();

  const {
    user,
    habits,
    loadHabits,
    addHabit,
    updateHabit,
    deleteHabit,
    tasks,
    loadTasks,
    moods,
    loadMoods,
    moodTypes,
    loadMoodTypes,
  } = useUser();

  useEffect(() => {
    (async () => {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status === "granted") {
        const calendars = await Calendar.getCalendarsAsync(
          Calendar.EntityTypes.EVENT,
        );
        console.log("Here are all your calendars:");
        console.log({ calendars });
      }
      loadTasks();
      loadHabits();
      loadMoods();
      loadMoodTypes();
    })();
  }, [user]);
  console.log("insights loading");
  useEffect(() => {
    if (moodTypes.length > 0) {
      setPieData(
        moodTypes.map((moodType) => {
          return {
            color: moodType.colorCode,
            count: getMoodCount(moodType.id),
            key: moodType.label,
          };
        }),
      );
      console.log("pieData", pieData);
    }
    if (tasks.length > 0) {
      // for every task in tasks
      let completedTasks = tasks.filter(
        (task) => task.completed && task.completedAt !== null,
      );
      setCompletedDays(
        completedTasks.map((task) => {
          console.log("completed task", task);
          // @ts-ignore
          return new Date(task.completedAt);
        }),
      );
    }
  }, [moodTypes]);
  console.log("completed days", completedDays);

  const minDate = new Date(2024, 1, 1); // today
  const maxDate = new Date();

  let i = 0,
    j = 0;
  let habitGroups: {
    label: string;
    completedTasks: number;
    allTasks: number;
  }[][] = [];

  function getHabitTasks(habit: Habit) {
    let habitTasks = [];
    for (let t of tasks) {
      if (t.habitId === habit.userHabitId) {
        habitTasks.push(t);
      }
    }
    return habitTasks;
  }

  while (i < habits.length) {
    if (i > 0 && i % 4 === 0) {
      j++;
    }
    if (habitGroups[j] === undefined) habitGroups[j] = [];
    // get all habit's tasks
    const habitTasks = getHabitTasks(habits[i]);
    // get all completed tasks
    let completedTasks = [];
    for (let hTask of habitTasks) {
      if (hTask.completed) {
        completedTasks.push(hTask);
      }
    }
    habitGroups[j].push({
      label: habits[i].habitTitle,
      completedTasks: completedTasks.length,
      allTasks: habitTasks.length,
    });
    i++;
  }

  const insets = useSafeAreaInsets();

  const ref = React.useRef<ICarouselInstance>(null);
  const progress = useSharedValue<number>(0);
  const onPressPagination = (index: number) => {
    ref.current?.scrollTo({
      /**
       * Calculate the difference between the current index and the target index
       * to ensure that the carousel scrolls to the nearest index
       */
      count: index - progress.value,
      animated: true,
    });
  };
  const width = Dimensions.get("window").width;

  const widthAndHeight = 250;

  const series = [
    { value: 430, color: "#fbd203" },
    { value: 321, color: "#ffb300" },
    { value: 185, color: "#ff9100" },
    { value: 123, color: "#ff6c00" },
  ];

  function getMoodTypeById(moodTypeId: number) {
    return moodTypes[moodTypeId];
  }

  function getMoodCount(moodTypeId: number) {
    let cnt = 0;
    moods.forEach((mood) => {
      if (mood.moodTypeId === moodTypeId) {
        cnt++;
      }
    });
    return cnt;
  }

  return (
    <View style={[styles.container]}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Insights</Text>
      </View>
      <StatusBar style="dark" />

      <ScrollView style={styles.container}>
        <View style={styles.calendarContainer}>
          <DateTimePicker
            mode="single"
            enabledDates={(date) =>
              !!completedDays.find((cDay) => {
                // @ts-ignore
                return (
                  cDay.toDateString() ===
                  new Date(date.toString()).toDateString()
                );
              })
            }
            styles={{
              ...defaultStyles,
              disabled: { backgroundColor: "#E4E4E4" },
              disabled_label: { color: "black" },
              days: { padding: 30, paddingTop: 20 },
              day: { backgroundColor: "#dab7ff", margin: 4, borderRadius: 3 },
              day_label: {
                fontWeight: "bold",
                fontFamily: "Poppins",
                fontSize: 13,
              },
              month_selector_label: {
                fontWeight: "bold",
                fontFamily: "Poppins",
                fontSize: 20,
                borderBottomColor: "#1CC282",
                borderBottomWidth: 4,
                borderBottomLeftRadius: 3,
              },
              year_selector_label: {
                fontWeight: "bold",
                fontFamily: "Poppins",
                fontSize: 20,
                borderBottomColor: "#1CC282",
                borderBottomWidth: 4,
                marginLeft: -5,
                paddingLeft: 5,
                borderBottomRightRadius: 3,
              },
              weekdays: { paddingHorizontal: 30, paddingTop: 20 },
              weekday_label: {
                fontWeight: "regular",
                fontFamily: "Poppins",
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: 0.5,
                minHeight: 20,
              },
              header: {
                paddingHorizontal: 50,
              },
            }}
            firstDayOfWeek={1}
            timePicker={false}
            weekdaysFormat={"short"}
          />
        </View>

        {/* Completed Tasks */}
        <View style={styles.completedTasksContainer}>
          <Text
            style={{ fontSize: 20, fontWeight: "bold", fontFamily: "Poppins" }}
          >
            Completed Tasks
          </Text>
        </View>

        {/* Tabs */}
        {/*<View style={styles.tabRow}>*/}
        {/*  {['Today', 'Weekly', 'Monthly'].map(tab => (*/}
        {/*    <TouchableOpacity key={tab} onPress={() => setSelectedTab(tab as any)}>*/}
        {/*      <Text style={[styles.tabText, selectedTab === tab && styles.activeTab]}>*/}
        {/*        {tab}*/}
        {/*      </Text>*/}
        {/*    </TouchableOpacity>*/}
        {/*  ))}*/}
        {/*</View>*/}
        <View style={[styles.container, {}]}>
          {habitGroups.length === 0 ? (
            <Text style={styles.noTasksFound}>No completed tasks found.</Text>
          ) : (
            ""
          )}
          <Carousel
            ref={ref}
            width={width}
            height={width / 2}
            data={habitGroups}
            onProgressChange={progress}
            renderItem={({ index, item }) => (
              <View style={styles.habitGrid}>
                {item.map((habit, hIndex) => (
                  <View key={hIndex} style={styles.habitCard}>
                    <Text>
                      <Text style={styles.habitText}>
                        {habit.label}
                        {"\n"}
                      </Text>
                      <Text style={{ textAlign: "right" }}>
                        <Text style={styles.habitCompletedCount}>
                          {habit.completedTasks}
                        </Text>
                        <Text style={styles.habitAllCount}>
                          /{habit.allTasks}
                        </Text>
                      </Text>
                    </Text>
                  </View>
                ))}
              </View>
            )}
            style={{ minHeight: "100%", marginBottom: 10 }}
            loop={false}
          />
        </View>

        <Pagination.Basic
          progress={progress}
          data={habitGroups}
          dotStyle={{ backgroundColor: "rgba(0,0,0,0.2)", borderRadius: 50 }}
          containerStyle={{ gap: 5, marginTop: 10 }}
          onPress={onPressPagination}
        />

        <View style={styles.moodsContainer}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              fontFamily: "Poppins",
              alignSelf: "center",
            }}
          >
            {" "}
            The Many Moods of Me
          </Text>
          {Array.isArray(moodTypes) ? (
            <View style={styles.chartContainer}>
              <PieChart style={styles.chart} data={pieData} length={200} />
              <View style={styles.legend}>
                {moodTypes.map((moodType, index) => (
                  <View
                    key={"viewParent-" + index}
                    style={{ flexDirection: "row" }}
                  >
                    <View
                      key={"view-" + index}
                      style={{
                        marginVertical: "auto",
                        marginHorizontal: 5,
                        height: 10,
                        width: 10,
                        backgroundColor: moodType.colorCode,
                        borderRadius: 10,
                      }}
                    ></View>
                    <Text key={"text-" + index}>{moodType.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <Text
              style={{
                textAlign: "center",
                justifyContent: "center",
                marginTop: 50,
              }}
            >
              No moods found.
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = ScaledSheet.create({
  container: { flex: 1, backgroundColor: "#DAB7FF", paddingBottom: 20 },
  headerContainer: { backgroundColor: "white", paddingTop: 20 },
  calendarContainer: {
    width: "100%",
    backgroundColor: "white",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingBottom: 30,
  },
  completedTasksContainer: {
    paddingTop: 30,
    alignSelf: "center",
    paddingBottom: 30,
  },
  moodsContainer: {
    paddingTop: 30,
    alignSelf: "center",
    paddingBottom: 30,
    backgroundColor: "white",
    width: "100%",
    minHeight: 450,
    marginTop: 30,
  },
  calendarDates: { backgroundColor: "grey" },
  dayLabelsWrapper: { alignSelf: "center", borderColor: "white" },
  title: {
    fontSize: 15,
    fontFamily: "Poppins",
    fontWeight: "900",
    letterSpacing: 0,
    alignSelf: "center",
    marginVertical: 8,
    marginBottom: 20,
  },
  tabRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
  },
  tabText: {
    fontSize: 14,
    color: "#555",
  },
  activeTab: {
    fontWeight: "bold",
    color: "#000",
    backgroundColor: "#484C59",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  chartRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
    marginHorizontal: 12,
  },
  chartItem: {
    alignItems: "center",
  },
  chartBar: {
    width: 14,
    backgroundColor: "#ccc",
    borderRadius: 4,
    marginBottom: 4,
  },
  chartContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: "6@ms",
    paddingTop: 40,
    gap: 2,
    justifyContent: "space-between",
  },
  chart: {
    width: "100%",
    height: "100%",
  },
  legend: {
    width: "40%",
    paddingVertical: 60,
  },
  dayLabel: {
    fontSize: 10,
    color: "#444",
  },
  habitGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: "16@ms",
    gap: 12,
    justifyContent: "space-between",
    height: "100%",
  },
  habitCard: {
    width: "48%",
    height: "48%",
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  habitText: {
    fontSize: "15@ms",
    fontFamily: "Poppins",
    fontWeight: "bold",
  },
  habitCompletedCount: {
    fontSize: "48@ms",
    fontFamily: "Poppins",
    fontWeight: "bold",
  },
  habitAllCount: {
    fontSize: "16@ms",
    fontFamily: "Poppins",
    fontWeight: "900",
  },
  editBtn: {
    backgroundColor: "#484C59",
    marginTop: 20,
    marginHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  editText: {
    color: "#fff",
    fontWeight: "bold",
  },
  noTasksFound: {
    marginVertical: "auto",
    marginHorizontal: "auto",
  },
  pagerView: {
    minHeight: 225,
  },
  page: {
    justifyContent: "center",
    alignItems: "center",
  },
});
