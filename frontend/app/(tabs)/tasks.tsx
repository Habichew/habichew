import React, { useEffect, useRef, useState } from "react";
import {Dimensions, View, Text, StyleSheet, Image, Pressable, TouchableOpacity, TextInput, ActivityIndicator, FlatList} from 'react-native';
import { useUser, Task } from "../context/UserContext";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import TaskModal from '../../components/ui/TaskModal';
import Rive, {Fit, RiveRef} from "rive-react-native";
import {AndroidHaptics} from 'expo-haptics';
import Animated, {Easing, SharedValue, useAnimatedStyle, withTiming,} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import SwipeableFlatList, {SwipeableFlatListRef} from 'rn-gesture-swipeable-flatlist';
import {ScaledSheet} from "react-native-size-matters";

export default function Tasks() {
  const screenWidth = Dimensions.get('window').width;

  const { user, tasks, loadTasks, updateTask } = useUser();
  const { habitId, habitName } = useLocalSearchParams();
  const numericHabitId = habitId ? parseInt(habitId as string) : undefined;

  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [searchText, setSearchText] = useState((habitName as string) || "");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isHabitFilterLocked, setIsHabitFilterLocked] = useState(true);
  const [hasEverEnteredHabit, setHasEverEnteredHabit] = useState(false);
  const [showEmptyPrompt, setShowEmptyPrompt] = useState(false);
  const [lastFilteredHabitId, setLastFilteredHabitId] = useState<number | null>(
    null,
  );
  const [loadingTasks, setLoadingTasks] = useState<boolean>(false);

  const riveRef = useRef<RiveRef>(null);
  const swipeRef = useRef<any>(null);

  let row: Array<any> = [];
  const flatListRef = useRef<SwipeableFlatListRef<any> | null>(null);

    const closeAllOpenRows = () => {
        flatListRef.current?.closeAnyOpenRows();
    };

  //When the page regains focus and there is no habitId parameter, clear the filter
  useFocusEffect(
    React.useCallback(() => {
      if (!habitId) {
        setSearchText("");
        setIsHabitFilterLocked(false);
        setLastFilteredHabitId(null);
      }
    }, [habitId]),
  );

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    if (numericHabitId && numericHabitId !== lastFilteredHabitId) {
      setSearchText(habitName as string);
      setIsHabitFilterLocked(true);
      setLastFilteredHabitId(numericHabitId);
    }
  }, [numericHabitId]);

  function sortTasks(tasks: Task[]) {
    return tasks.sort((a: Task, b: Task) => {
      if (!a.completed && b.completed) return -1;
      else if (a.completed && !b.completed) return 1;
      else return 0;
    });
  }

  useEffect(() => {
    let filtered = tasks.filter(t => {
      if (isHabitFilterLocked && numericHabitId) return t.habitId === numericHabitId;
      return t.title.toLowerCase().includes(searchText.toLowerCase());
    });
    filtered = sortTasks(filtered);
    setFilteredTasks(filtered);

    if (isHabitFilterLocked && numericHabitId && filtered.length === 0) {
      setShowEmptyPrompt(true);
    } else {
      setShowEmptyPrompt(false);
    }
  }, [tasks, searchText, numericHabitId, isHabitFilterLocked]);

//When the page regains focus and there is no habitId parameter, clear the filter
  useFocusEffect(
    React.useCallback(() => {
      if (!habitId) {
        setSearchText('');
        setIsHabitFilterLocked(false);
        setLastFilteredHabitId(null);
      }
    }, [habitId])
  );

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setModalVisible(true);
  };

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  const toggleCompleted = async (task: Task) => {
    if (!user || !task.userTaskId) return;
    const updatedTask: Task = {
      ...task,
      completed: !Boolean(task.completed),
      priority: task.priority || null,
      credit: task.credit ?? 0,
      description: task.description ?? "",
      dueAt: task.dueAt ? formatDate(task.dueAt) : undefined,
    };
    await updateTask(updatedTask);
    //loadTasks();
    console.log("updating input state");
    setFilteredTasks(sortTasks(tasks));
  };

  function handleGenerateTasks() {
    if (!habitName) return alert("Please enter a habit name.");
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append(
      "Authorization",
      "Bearer " + process.env.EXPO_PUBLIC_OPENAI_API_KEY,
    );

    const raw = JSON.stringify({
      model: "gpt-4.1",
      messages: [
        {
          role: "user",
          content:
            "In short sentences, break down this habit into a bulleted list of max. 6 tasks that are directly executable: '" +
            habitName +
            "'. Only respond with a bulleted list",
        },
      ],
    });

    const requestOptions: RequestInit = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    // setGeneratedTasks(["Find a private or comfortable space", "Acknowledge your emotions", "Allow your feelings to flow without holding back", "Breathe deeply and steadily", "Use tissues or a cloth if needed", "Take time afterwards to rest or reflect"]);
    setLoadingTasks(true);
    fetch("https://api.openai.com/v1/chat/completions", requestOptions)
      .then((response) => response.json())
      .then((result) => {
        console.log(result);
        let newTasks = result.choices[0].message.content;
        newTasks = newTasks.split("\n").map((t: string) => {
          if (t.startsWith("- ")) {
            return t.slice(2);
          }
          return t;
        });
        setFilteredTasks(newTasks);
        console.log("set generated tasks", newTasks, "length", newTasks.length);
        setLoadingTasks(false);
        setShowEmptyPrompt(false);
      })
      .catch((error) => {
        console.error(error);
        setLoadingTasks(false);
      });
  }

  const renderTask = ({ item, index }) => {
    const isCompleted = item.completed === true;
    const ddl = item.dueAt;

    async function handleSwipe( direction: any) {
      console.log("vibrate");
      await Haptics.performAndroidHapticsAsync(AndroidHaptics.Gesture_Start);
      if (direction === 'right') {
        await toggleCompleted(item);
      }
    }

    return (
        <View style={{borderRadius: 16, backgroundColor: 'white', zIndex: 3, marginBottom: 10}}>
        <Pressable onPress={() => handleEdit(item)} style={[styles.taskCard, { backgroundColor: isCompleted ? '#e6e6e6' : '#DAB7FF' }]}  android_ripple={{color: '#00000020', borderless: true, foreground: false, radius: 300}}>
            <View style={styles.flexOne}>
              <TouchableOpacity disabled={!!item.completed}
                                onPress={() => toggleCompleted(item)}
                                style={{ padding: 5, margin: -5}}>
                <Ionicons
                    name={!item.completed ? "ellipse-outline" : "checkmark-circle-outline"}
                    size={24} color="black"/>
              </TouchableOpacity>
            </View>
            <View style={styles.flexTwo}>
              <Text style={[styles.taskTitle, {textDecorationLine: item.completed ? 'line-through' : 'none'}]}>{item.title}</Text>
              {item.description ? <Text style={styles.taskDescription}>{item.description}</Text> : null}
              <View style={styles.metaRow}>
                { item.dueAt ?
                    <View style={styles.badge}>
                      <Ionicons name="calendar-outline" size={16} color="#000" />
                      <Text style={styles.badgeText}>
                        {item.dueAt ? new Date(item.dueAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short' }) : ''}
                      </Text>
                    </View> : ""
                }
                { item.priority ?
                    <View style={styles.badge}>
                      <Ionicons name="flag-outline" size={16} color="#000"/>
                      <Text style={styles.badgeText}>
                        {item.priority
                            ? `${item.priority.charAt(0).toUpperCase()}${item.priority.slice(1)}`
                            : 'No Priority'}
                      </Text>
                    </View>
                    : ""
                }
              </View>
            </View>
          </Pressable>
        </View>
    );
  }

  async function handleSwipe( direction: any, swipeable: any) {
    console.log("vibrate");
    await Haptics.performAndroidHapticsAsync(AndroidHaptics.Gesture_Start);
    if (direction === 'right') {
      await toggleCompleted(swipeable);
    }
  }

  return (
    <View style={styles.container}>

      <View style={styles.topBar}>
        <TextInput
          style={styles.search}
          placeholder={
            isHabitFilterLocked && numericHabitId
              ? `Tasks belonged to ${habitName}`
              : "Search Taskname"
          }
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={(text) => {
            if (isHabitFilterLocked) setIsHabitFilterLocked(false);
            setSearchText(text);
          }}
        />
      </View>

      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Task List</Text>
        {habitId ? <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={24} color="#000" />
        </TouchableOpacity> : null}
      </View>

      {showEmptyPrompt &&
        (loadingTasks ? (
          <ActivityIndicator size={"large"} />
        ) : (
          <View style={{ alignItems: "center", marginTop: 40 }}>
            <Text
              style={{ textAlign: "center", fontSize: 14, marginBottom: 20 }}
            >
              You don’t have any task for the habit{"\n"}
              Generate tasks with just a click or use + to add your own !
            </Text>
            <TouchableOpacity
              style={styles.generateBtn}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.generateText}>Generate Tasks</Text>
            </TouchableOpacity>
          </View>
        ))}

      <FlatList
        data={filteredTasks}
        ref={flatListRef}
        keyExtractor={(item) =>
          item.userTaskId?.toString() || Math.random().toString()
        }
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={renderTask}
        enableOpenMultipleRows={false}
        swipeableProps={{
          friction: 2,
          overshootFriction: 8,
          onSwipeableOpen: async (direction, swipeable) => {console.log('swipeeee'); handleSwipe(direction, swipeable)}
        }}
        style={{marginHorizontal: -40, paddingHorizontal: 25}}
      />

      {modalVisible ? <Animated.View style={[styles.overlay]}/> : null}
      <TaskModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setEditingTask(null);
        }}
        onSave={() => {
          setModalVisible(false);
          setEditingTask(null);
          setShowEmptyPrompt(false); // once added the task, hide the prompt
        }}
        task={editingTask}
        defaultHabitId={numericHabitId}
      />
    </View>
  );
}

const styles = ScaledSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: "absolute",
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width,
    zIndex: 2
  },
  container: { flex: 1, padding: 24, backgroundColor: "#fff" },
  topBar: { marginBottom: 16 },
  search: {
    backgroundColor: "#F1F1F1",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: "#000",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { fontWeight: "bold", fontSize: 20 },
  taskCard: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 16,
    // marginVertical: 6,
    alignItems: "center",
    justifyContent: "space-between",
  },
  flexTwo: {flex: 2, marginLeft: 15, marginVertical: 'auto', paddingVertical: 0, textAlign: 'center', alignSelf: 'center'},
  taskTitle: {
    fontWeight: "normal",
    fontSize: "13@ms0.2",
    // marginBottom: 4,
    color: "#000"
  },
  taskDescription: { fontSize: 14, color: "#333", marginBottom: 6 },
  metaRow: { flexDirection: "row", gap: 12, marginTop: 8 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  badgeText: { fontSize: 14, marginLeft: 6, color: "#000" },
  iconGroup: { flexDirection: "column", alignItems: "center", gap: 10 },
  pencil: { position: "absolute", right: 0, top: 4 },
  tickBox: { padding: 6, backgroundColor: "#fff", borderRadius: 6 },
  tickBoxCompleted: { backgroundColor: "#fff" },
  generateBtn: {
    marginTop: 20,
    backgroundColor: "#DAB7FF",
    borderRadius: 40,
    paddingHorizontal: 40,
    paddingVertical: 12,
  },
  generateText: { fontWeight: "bold", fontSize: 16, color: "#000" },
    leftAction: {
        transform: [{ translateX: 0 }],
        alignItems: 'flex-start',
        justifyContent: 'center',
        backgroundColor: '#1CC282',
        borderRadius: 16,
        paddingHorizontal: 20,
        marginVertical: 6,
        paddingRight: 40,
        marginRight: -Dimensions.get('window').width + 70,
        width: Dimensions.get('window').width
    }
});
