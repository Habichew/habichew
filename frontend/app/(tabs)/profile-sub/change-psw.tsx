import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { useUser } from "@/app/context/UserContext";

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const isFormValid = currentPassword && newPassword && confirmPassword;

  useEffect(() => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setErrorMsg("");
  }, []);

  const handleSave = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMsg("Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("New passwords do not match");
      return;
    }

    if (!user || typeof user.id !== "number") {
      setErrorMsg("Invalid user");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/users/${user.id}/password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            oldPassword: currentPassword,
            newPassword: newPassword,
          }),
        },
      );

      if (response.ok) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setErrorMsg("");
        router.push("/(tabs)/profile");
      } else {
        const data = await response.json();
        setErrorMsg(data.message || "Failed to update password");
      }
    } catch (err) {
      console.error("Password update error:", err);
      setErrorMsg("Server error");
    }
  };

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

      <Text style={styles.title}>CHANGE PASSWORD</Text>

      <TextInput
        placeholder="Current password"
        style={styles.input}
        secureTextEntry
        value={currentPassword}
        onChangeText={setCurrentPassword}
        placeholderTextColor="#999"
      />
      <TextInput
        placeholder="New password"
        style={styles.input}
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
        placeholderTextColor="#999"
      />
      <TextInput
        placeholder="Confirm new password"
        style={styles.input}
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholderTextColor="#999"
      />

      {errorMsg !== "" && (
        <Text style={{ color: "red", textAlign: "center", marginBottom: 10 }}>
          {errorMsg}
        </Text>
      )}

      <TouchableOpacity
        style={[
          styles.saveBtn,
          { opacity: isFormValid ? 1 : 0.6 },
        ]}
        onPress={handleSave}
        disabled={!isFormValid}
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
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: "#f9f9f9",
    fontSize: 14,
    color: "#333",
  },
  saveBtn: {
    backgroundColor: "#1C1C1E",
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: "center",
    marginTop: 10,
  },
  saveText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
});
