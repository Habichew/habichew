import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  FlatList,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useUser, Task } from "../context/UserContext";
import TaskModal from "@/components/ui/TaskModal";
import OnboardingProgress from "@/components/ui/OnboardingProgress";

export default function PickTasks() {
  const { habit, habitId } = useLocalSearchParams<{
    habit: string;
    habitId: string;
  }>();
  const router = useRouter();
  const { addTask } = useUser();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskList, setTaskList] = useState<Task[]>([]);
  const [showInfo, setShowInfo] = useState(true);
  const numericHabitId = Number(habitId);
  const STEP_INDEX = 3; // Story=0, Info=1, PickHabit=2, PickTask=3
  const handleBack = () => {
    router.push("../onboarding/PickHabit");
  };
  const handleSaveTask = async (task: Task) => {
    try {
      const newTask = { ...task, habitId: numericHabitId };
      await addTask(newTask);
      setTaskList((prev) => [...prev, newTask]);
      setModalVisible(false);
      setEditingTask(null);
      setShowInfo(false);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to add task");
    }
  };

  const handleGeneratePresetTasks = async () => {
    try {
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/presets/habits/${numericHabitId}/tasks`,
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to fetch preset tasks");
      }

      const data = await res.json();
      const newTasks: Task[] = [];

      for (const task of data) {
        const formatted = {
          title: task.title,
          description: "",
          priority: null,
          dueAt: null,
          credit: 0,
          habitId: numericHabitId,
        };
        await addTask(formatted);
        newTasks.push(formatted);
      }

      setTaskList((prev) => [...prev, ...newTasks]);
      setShowInfo(false);
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", err.message || "Failed to generate tasks");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Text style={styles.arrowText}>{"<"}</Text>
      </TouchableOpacity>

      <Text style={styles.habitText}>{habit}</Text>
      {showInfo && (
        <Text style={styles.info}>
          is too big for me to{"\n"}chew, let’s break it down{"\n"}with just a
          click!
        </Text>
      )}
      <TouchableOpacity
        style={styles.addCustom}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={24} color="#000" />
        <Text style={styles.grayHint}>or use + to add your own</Text>
      </TouchableOpacity>
      {showInfo && (
        <TouchableOpacity
          style={styles.generateBtn}
          onPress={handleGeneratePresetTasks}
        >
          <Text style={styles.generateText}>Generate Tasks</Text>
        </TouchableOpacity>
      )}
      <FlatList
        data={taskList}
        keyExtractor={(item, index) =>
          item.userTaskId?.toString() || `${item.title}-${index}`
        }
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => {
          const dueDate = item.dueAt
            ? new Date(item.dueAt).toLocaleDateString("en-US", {
                day: "2-digit",
                month: "short",
              })
            : "";
          const priorityText = item.priority
            ? `${item.priority.charAt(0).toUpperCase()}${item.priority.slice(1)} Priority`
            : "No Priority";

          return (
            <View style={styles.taskCard}>
              <Text style={styles.taskTitle}>{item.title}</Text>
              {item.description ? (
                <Text style={styles.taskDescription}>{item.description}</Text>
              ) : null}
              <View style={styles.metaRow}>
                <View style={styles.badge}>
                  <Ionicons name="calendar-outline" size={16} color="#000" />
                  <Text style={styles.badgeText}>{dueDate}</Text>
                </View>
                <View style={styles.badge}>
                  <Ionicons name="flag-outline" size={16} color="#000" />
                  <Text style={styles.badgeText}>{priorityText}</Text>
                </View>
                <TouchableOpacity
                  style={styles.pencilBtn}
                  onPress={() => {
                    setEditingTask(item);
                    setModalVisible(true);
                  }}
                >
                  <Ionicons name="pencil" size={18} color="#000" />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      <TaskModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        task={editingTask}
        defaultHabitId={numericHabitId}
      />

      <OnboardingProgress
        index={STEP_INDEX}
        onSkip={() => router.push("../home")}
        onNext={() => router.push("../home")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    paddingTop: 60,
  },
  back: { position: "absolute", left: 20, top: 28 },
  roundBtn: {
    backgroundColor: "#fff",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  roundText: { fontSize: 20, fontWeight: "bold", color: "#000" },
  habitText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  info: {
    color: "#DAB7FF",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 20,
    lineHeight: 28,
    marginVertical: 12,
  },
  addCustom: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 20,
  },
  grayHint: { color: "#ccc", fontWeight: "bold" },
  generateBtn: {
    marginTop: 40,
    backgroundColor: "#DAB7FF",
    borderRadius: 40,
    paddingHorizontal: 40,
    paddingVertical: 16,
  },
  generateText: { fontWeight: "bold", fontSize: 16, color: "#000" },
  nextBtn: { position: "absolute", bottom: 32, right: 32 },
  taskCard: {
    backgroundColor: "#DAB7FF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  taskTitle: { fontSize: 16, fontWeight: "bold", color: "#000" },
  taskDescription: { fontSize: 14, color: "#333", marginTop: 4 },
  taskMeta: { fontSize: 12, color: "#666", marginTop: 8 },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  metaLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 14,
    marginLeft: 6,
    color: "#000",
  },
  pencilBtn: {
    backgroundColor: "#fff",
    padding: 6,
    borderRadius: 6,
    marginLeft: "auto",
  },
  backButton: {
    position: "absolute",
    top: 28,
    left: 24,
    zIndex: 10,
  },

  arrowText: {
    color: "#000",
    fontSize: 24,
    fontWeight: "bold",
    lineHeight: 24,
  },
});
