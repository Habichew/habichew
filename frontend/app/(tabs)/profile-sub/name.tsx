import { useRouter } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { useState } from "react";
import { useUser } from "@/app/context/UserContext";
import { useEffect } from "react";

export default function ChangeName() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const { user, setUser } = useUser();
  const [errorMsg, setErrorMsg] = useState("");

  const handleSave = async () => {
    if (!user || typeof user.id !== "number") {
      Alert.alert("Error", "Invalid user");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/users/${user.id}/username`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ newUsername: firstName }),
        },
      );

      if (response.ok) {
        setUser({ ...user, username: firstName }); // local update
        setFirstName("");
        Alert.alert("Success", "Name updated");
        router.push("../profile");
      } else {
        const data = await response.json();
        Alert.alert("Update failed", data.error || "Unknown error");
      }
    } catch (error) {
      console.error("Update error:", error);
      Alert.alert("Error", "Something went wrong");
    }
  };

  useEffect(() => {
    setFirstName("");
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <TouchableOpacity
        onPress={() => router.push("/(tabs)/profile")}
        style={styles.backBtn}
      >
        <Text style={styles.backText}>{"<"}</Text>
      </TouchableOpacity>

      <Text style={styles.title}>CHANGE NAME</Text>

      <TextInput
        style={styles.input}
        placeholder="New Name"
        placeholderTextColor="#999"
        value={firstName}
        onChangeText={setFirstName}
      />

      <TouchableOpacity
        onPress={handleSave}
        style={[styles.saveBtn, { opacity: firstName.trim() ? 1 : 0.6 }]}
        disabled={!firstName.trim()}
      >
        <Text style={styles.saveText}>SAVE</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 24 },
  backBtn: { marginTop: 16 },
  backText: { fontSize: 24, fontWeight: "bold" },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
  },
  input: {
    height: 48,
    backgroundColor: "#F2F2F2",
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 14,
    marginBottom: 20,
  },
  saveBtn: {
    backgroundColor: "#222",
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: "center",
    marginTop: 10,
  },
  saveText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  error: {
  color: "red",
  marginBottom: 12,
  fontSize: 13,
  textAlign: "center",
},

});
