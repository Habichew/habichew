import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useUser, Task } from "../context/UserContext";
import TaskModal from "../../components/ui/TaskModal";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { RiveRef } from "rive-react-native";
import React, {useEffect, useRef, useState} from 'react';
import {Dimensions, View, Text, StyleSheet, Image, Pressable, TouchableOpacity, TextInput, ActivityIndicator, FlatList} from 'react-native';
import { useUser, Task } from '../context/UserContext';
import TaskModal from '../../components/ui/TaskModal';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import Rive, {Fit, RiveRef} from "rive-react-native";
import {AndroidHaptics} from 'expo-haptics';
import Animated, {Easing, SharedValue, useAnimatedStyle, withTiming,} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import SwipeableFlatList, {SwipeableFlatListRef} from 'rn-gesture-swipeable-flatlist';

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
          <Pressable onPress={() => handleEdit(item)} style={[styles.taskCard, { backgroundColor: isCompleted ? '#e6e6e6' : '#DAB7FF' }]}>
                  <View
                      style={[
                          styles.taskCard,
                          { backgroundColor: isCompleted ? "#e6e6e6" : "#DAB7FF" },
                      ]}
                  >
                      <View style={styles.flexOne}>
                          <Text style={styles.taskTitle}>{item.title}</Text>
                          {item.description ? (
                              <Text style={styles.taskDescription}>{item.description}</Text>
                          ) : null}
                          <View style={styles.metaRow}>
                              {item.dueAt ? (
                                  <View style={styles.badge}>
                                      <Ionicons
                                          name="calendar-outline"
                                          size={16}
                                          color="#000"
                                      />
                                      <Text style={styles.badgeText}>
                                          {item.dueAt
                                              ? new Date(item.dueAt).toLocaleDateString("en-US", {
                                                  day: "2-digit",
                                                  month: "short",
                                              })
                                              : ""}
                                      </Text>
                                  </View>
                              ) : (
                                  ""
                              )}
                              {item.priority ? (
                                  <View style={styles.badge}>
                                      <Ionicons name="flag-outline" size={16} color="#000" />
                                      <Text style={styles.badgeText}>
                                          {item.priority
                                              ? `${item.priority.charAt(0).toUpperCase()}${item.priority.slice(1)} Priority`
                                              : "No Priority"}
                                      </Text>
                                  </View>
                              ) : (
                                  ""
                              )}
                              <TouchableOpacity
                                  style={[styles.pencil]}
                                  onPress={() => handleEdit(item)}
                              >
                                  <Ionicons name="pencil" size={20} color="#333" />
                              </TouchableOpacity>
                              <TouchableOpacity
                                  style={[
                                      styles.tickBox,
                                      isCompleted && styles.tickBoxCompleted,
                                  ]}
                                  onPress={() => toggleCompleted(item)}
                              >
                                  <Ionicons
                                      name="checkmark"
                                      size={16}
                                      color={isCompleted ? "#000" : "#999"}
                                  />
                              </TouchableOpacity>
                          </View>
                      </View>
                  </View>
          </Pressable>
    );
  }

  async function handleSwipe( direction: any, swipeable: any) {
    console.log("vibrate");
    await Haptics.performAndroidHapticsAsync(AndroidHaptics.Gesture_Start);
    if (direction === 'right') {
      console.log('toggle compe')
      await toggleCompleted(swipeable);
    }
  }

  function LeftActionNew(item: any) {
      // console.log('showLeftProgress:', prog.value);
      // console.log('appliedTranslation:', drag.value);
      // console.log('click', prog.value < 0.5 ? 10 : 0);

    return (
        <>
          {!item.completed ? <Animated.View style={styles.leftAction}>
            <Pressable onPress={() => toggleCompleted(item)}>
              <Ionicons name="checkmark-done-outline" size={24} color="black"/>
            </Pressable>
          </Animated.View> : null}
        </>

    );
  }

  function LeftAction(prog: SharedValue<number>, drag: SharedValue<number>) {
    const styleAnimation = useAnimatedStyle(() => {
      // console.log('showLeftProgress:', prog.value);
      // console.log('appliedTranslation:', drag.value);
      // console.log('click', prog.value < 0.5 ? 10 : 0);

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
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={24} color="#000" />
        </TouchableOpacity>
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

      <SwipeableFlatList
        data={filteredTasks}
        ref={flatListRef}
        keyExtractor={(item) =>
          item.userTaskId?.toString() || Math.random().toString()
        }
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={renderTask}
        renderLeftActions={LeftActionNew}
        enableOpenMultipleRows={false}
        swipeableProps={{
          friction: 2,
          overshootFriction: 8,
          onSwipeableOpen: async (direction, swipeable) => {console.log('swipeeee'); handleSwipe(direction, swipeable)}
        }}
      />

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

const styles = StyleSheet.create({
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
    marginVertical: 6,
    alignItems: "center",
    justifyContent: "space-between",
  },
  flexOne: { flex: 1 },
  taskTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
    color: "#000",
  },
  taskDescription: { fontSize: 14, color: "#333", marginBottom: 6 },
  metaRow: { flexDirection: "row", gap: 12, marginTop: 4 },
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
        marginHorizontal: 20,
        marginRight: -Dimensions.get('window').width + 80,
        width: Dimensions.get('window').width - 40
    }
});
