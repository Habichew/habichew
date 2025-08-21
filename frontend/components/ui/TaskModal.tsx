import React, { useState, useEffect } from "react";
import {Modal,View,Text,TextInput,TouchableOpacity,StyleSheet,Platform,TouchableWithoutFeedback} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useUser, Task } from "@/context/UserContext";
import { webDateInputWrapper, webDateInput } from "./webDateStyles";
import CustomDropdown from "./select";
import {ScaledSheet} from "react-native-size-matters";

interface TaskModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  task?: Task | null;
  defaultHabitId?: number;
}

const formatDate = (input: string | Date): string => {
  const d = typeof input === "string" ? new Date(`${input}T00:00:00`) : input;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hour = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  const sec = String(d.getSeconds()).padStart(2, "0");
  return `${y}-${m}-${day} ${hour}:${min}:${sec}`;
};

export default function TaskModal({
  visible,
  onClose,
  onSave,
  task,
  defaultHabitId,
}: TaskModalProps) {
  const { addTask, updateTask, deleteTask, user } = useUser();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState<string | null>(null); // yyyy-mm-dd
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [priority, setPriority] = useState<"Low" | "Medium" | "High" | null>(
    null,
  );
  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDescription(task.description ?? null);
      setDueDate(task.dueAt?.substring(0, 10) ?? null);
      if (
        task.priority ?
        ["low", "medium", "high"].includes(task.priority.toLowerCase()) : null
      ) {
        const capitalized =
          task.priority.charAt(0).toUpperCase() +
          task.priority.slice(1).toLowerCase();
        setPriority(capitalized as "Low" | "Medium" | "High");
      } else {
        setPriority(null);
      }
    } else {
      setTitle("");
      setDescription(null);
      setDueDate(null);
      setPriority(null);
    }
  }, [task, visible]);

  const handleSave = async () => {
    if (!user) return;
    if (!title.trim()) {
      alert("Please enter a task title.");
      return;
    }

    const formattedTask = {
      ...(task?.userTaskId ? { userTaskId: task.userTaskId } : {}),
      title,
      description: description?.trim() || null,
      dueAt: dueDate ? formatDate(dueDate) : null,
      priority: priority
        ? (priority.toLowerCase() as "low" | "medium" | "high")
        : null,
      habitId: task?.habitId ?? defaultHabitId ?? null,
      credit: 20,
    };

    if (task) {
      await updateTask(formattedTask as Task, false);
    } else {
      await addTask(formattedTask as Task);
    }

    onSave(formattedTask as Task);
  };

  const handleDelete = async () => {
    if (task?.userTaskId) {
      await deleteTask(task.userTaskId);
      onClose();
    }
  };

  const renderDateInput = () => {
    if (Platform.OS === "web") {
      return (
        <View style={[webDateInputWrapper, { marginBottom: 16 }]}>
          <input
            type="date"
            value={dueDate ?? ""}
            onChange={(e) => setDueDate(e.target.value)}
            style={{
              ...webDateInput,
              color: dueDate ? "#000" : "#bbb",
            }}
          />
        </View>
      );
    } else {
      return (
        <>

          <TouchableOpacity style={styles.dateInput} onPress={() => setShowDatePicker(true)}>
            <Ionicons name="calendar-outline" size={20} color={'#000'} />
            <Text
              style={[
                styles.dateText,
                { color: dueDate ? '#000' : '#bbb' }
              ]}
            >
              {dueDate ? new Date(dueDate).toDateString() : 'Due Date'}
            </Text>
          </TouchableOpacity>

          {showDatePicker ? (
            <DateTimePicker
              mode="date"
              value={dueDate ? new Date(dueDate) : new Date()}
              onChange={(_, selected) => {
                setShowDatePicker(false);
                if (selected) {
                  const y = selected.getFullYear();
                  const m = String(selected.getMonth() + 1).padStart(2, "0");
                  const d = String(selected.getDate()).padStart(2, "0");
                  setDueDate(`${y}-${m}-${d}`);
                }
              }}
            />
          ) : null }
        </>
      );
    }
  };

  return (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <TouchableOpacity onPress={onClose}
                              activeOpacity={1}
                              style={styles.overlay}>
      <View>
        <TouchableWithoutFeedback>
          <View style={styles.container}>
            <View style={styles.rowEnd}>
              {task ? (
                <TouchableOpacity onPress={handleDelete}>
                  <Text><Ionicons name="trash-outline" size={20} color="#888" /></Text>
                </TouchableOpacity>
              ) : null }
            </View>

          <TextInput
            placeholder="Task Title"
            placeholderTextColor="#bbbbbb"
            style={[styles.input, styles.titleInput]}
            value={title}
            onChangeText={setTitle}
          />

            <View style={{ marginBottom: 16 }}>
              <TextInput
                placeholder="Description"
                placeholderTextColor="#bbbbbb"
                style={[styles.input, styles.textArea]}
                value={description ?? ""}
                onChangeText={(val) => setDescription(val || null)}
                multiline
              />
            </View>

            {/* Priority */}
            <View style={{ zIndex: 11, marginBottom: 6 }}>
              <CustomDropdown
                zIndex={9}
                zIndexInverse={8}
                items={[
                  { label: "Low", value: "Low" },
                  { label: "Medium", value: "Medium" },
                  { label: "High", value: "High" },
                ]}
                value={priority}
                setValue={(val) => setPriority(val as "Low" | "Medium" | "High")}
                placeholder="Priority"
                style={{marginBottom: -10, }}
              />
            </View>

            {/* DatePicker after Priority ，higher zIndex  */}
            <View style={{ zIndex: 10, marginBottom: 16 }}>
              {renderDateInput()}
            </View>


            <View style={styles.footerButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveText}>{task ? "Save" : "Create"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = ScaledSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: "absolute",
    height: "100%",
    width: "100%",
    zIndex: 2,
  },
  container: { backgroundColor: "#DAB7FF", borderRadius: 20, padding: 20, width: "100%", borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  rowEnd: { alignItems: "flex-end" },
  input: {     elevation: 4,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 4,backgroundColor: "#fff", borderRadius: 16, padding: 12, marginTop: 12, fontSize: "13@ms0.2", color: "#000", fontWeight: 'bold' },
  textArea: { height: 100, textAlignVertical: "top", fontSize: "13@ms0.2" },
  rowGap: { flexDirection: "row", justifyContent: "space-between", marginTop: 12, gap: 8 },
  dateInput: {
    elevation: 4,
    shadowOffset: {width: 0, height: 5},
    shadowOpacity: 0.15,
    shadowRadius: 4,
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingLeft: 18,
    minHeight: "40@ms0.3",
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'start',
  },
  dateText: { fontSize: "13@ms0.2", fontWeight: 'bold', color: '#bbb', fontSize: "13@ms0.2", marginLeft: "10@ms0.5"},
  priorityOption: { fontSize: 14, color: "#bbb", paddingVertical: 4 },
  selected: { color: "#000", fontWeight: "bold" },
  footerButtons: { flexDirection: "row", justifyContent: "space-between", marginTop: 24, zIndex: 1 },
  cancelBtn: { backgroundColor: "#000", paddingVertical: 12, paddingHorizontal: 30, borderRadius: 30, zIndex: 1 },
  cancelText: { color: "#fff", fontWeight: "bold", fontSize: 16, zIndex: 1 },
  saveBtn: { backgroundColor: "#1CC282", paddingVertical: 12, paddingHorizontal: 30, borderRadius: 30, zIndex: 1 },
  saveText: { fontWeight: "bold", fontSize: 16, color: "#000", zIndex: 1 },
  titleInput: {minHeight: "50@ms0.3", paddingLeft: "16@ms0.5", fontSize: "16@ms0.2", fontWeight: 'bold'}
});

