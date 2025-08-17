import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import CustomDropdown from "../../components/ui/select";
import { useUser } from "../context/UserContext";
import OnboardingProgress from "@/components/ui/OnboardingProgress";

export default function PickHabit() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [customHabit, setCustomHabit] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );
  const [presets, setPresets] = useState<any[]>([]);
  const { user, addHabit, loadHabits } = useUser();
  const STEP_INDEX = 2; // Story=0, Info=1, PickHabit=2, PickTask=3
  const userId = user?.id;
  const isFormValid = customHabit;

  const handleBack = () => {
    router.push("../onboarding/info");
  };

  useEffect(() => {
    fetch(process.env.EXPO_PUBLIC_BACKEND_URL + "/presets/categories")
      .then((res) => res.json())
      .then(setCategories)
      .catch(console.error);
  }, []);

  const fetchPresets = async (categoryId: number) => {
    try {
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/presets/categories/${categoryId}/habits`,
      );
      const data = await res.json();
      setPresets(data);
    } catch (err) {
      console.error("Failed to fetch presets", err);
    }
  };

  const handleSubmitHabit = async (habit: string, habitId?: number) => {
    if (!userId) {
      alert("Please log in first");
      return;
    }

    try {
      const payload: any = {
        ...(habitId ? { habitId } : {}),
        customTitle: habit,
      };

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/habits/${userId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to create habit");
      }

      const result = await response.json();
      console.log("Created:", result);

      // optional cleanup
      setModalVisible(false);
      setCustomHabit("");

      router.push({
        pathname: "/onboarding/PickTask",
        params: {
          habit,
          habitId: result.habit.userHabitId,
        },
      });
    } catch (error) {
      console.error("Add habit error:", error);
      alert("Failed to add habit. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Text style={styles.arrowText}>{"<"}</Text>
      </TouchableOpacity>

      <Image
        source={require("../../assets/images/previouscat2.png")}
        style={styles.petImage}
      />

      <Text style={styles.title}>Choose a habit to feed your pet</Text>

      {/* <TouchableOpacity style={styles.dropdownBtn} onPress={() => setShowDropdown(!showDropdown)}>
        <Text style={styles.dropdownText}>{selectedCategoryName}</Text>
        <View style={styles.dropdownArrowCircle}>
          <Text style={styles.dropdownArrow}>▼</Text>
        </View>
      </TouchableOpacity> */}

      <CustomDropdown
        items={categories.map((cat) => ({
          label: cat.name,
          value: String(cat.id),
        }))}
        value={selectedCategoryId ? String(selectedCategoryId) : null}
        setValue={(val) => {
          if (val !== null) {
            const cat = categories.find((c) => String(c.id) === val);
            if (cat) {
              setSelectedCategoryId(cat.id);
              fetchPresets(cat.id);
            }
          }
        }}
        style={{ width: "100%" }}
        placeholder="Choose a category"
      />

      {/* Scrollable habit list with fixed height */}
      <ScrollView style={styles.habitList}>
        {presets.map((habit, idx) => (
          //only update the title to avoid distinguish customHabit or presetHabit
          <TouchableOpacity
            key={idx}
            style={styles.habitItem}
            onPress={() => handleSubmitHabit(habit.title)}
          >
            <Text style={styles.habitText}>{habit.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Add custom habit */}
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addText}>Or add your own</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Add Your Own Habit</Text>
            <TextInput
              value={customHabit}
              onChangeText={setCustomHabit}
              placeholder="Enter a habit"
              placeholderTextColor={"#999"}
              style={styles.modalInput}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, { opacity: isFormValid ? 1 : 0.6 }]}
                onPress={() => handleSubmitHabit(customHabit)}
                disabled={!isFormValid}
              >
                <Text style={styles.submitText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <OnboardingProgress
        index={STEP_INDEX}
        onSkip={() => router.push("/onboarding/PickTask")}
        onNext={() => router.push("/onboarding/PickTask")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  petImage: {
    width: 160,
    height: 160,
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  dropdownBtn: {
    width: "100%",
    backgroundColor: "#eee",
    borderRadius: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "#000",
  },
  dropdownText: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#222",
  },
  dropdownArrowCircle: {
    backgroundColor: "#000",
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  dropdownArrow: {
    color: "#1CC282",
    fontSize: 18,
  },
  dropdownList: {
    position: "absolute",
    width: "100%",
    maxHeight: 80,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    marginBottom: 16,
    paddingVertical: 6,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#333",
  },
  habitList: {
    flexGrow: 0,
    maxHeight: 260,
    width: "100%",
    marginBottom: 20,
  },
  habitItem: {
    backgroundColor: "#f9f9f9",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginVertical: 6,
    marginHorizontal: 4,
  },
  habitText: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#444",
  },
  addBtn: {
    backgroundColor: "#1CC282",
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 40,
    marginTop: "auto",
    marginBottom: 100,
  },
  addText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 16 },
  modalInput: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  cancelText: { padding: 10, color: "#999", fontWeight: "bold" },
  submitText: { color: "#000", fontWeight: "bold" },
  saveBtn: {
    backgroundColor: "#1CC282",
    borderRadius: 24,
    alignItems: "center",
    padding: 10,
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
