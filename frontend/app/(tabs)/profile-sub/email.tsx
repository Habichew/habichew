import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { useUser } from "@/app/context/UserContext";
import { useEffect } from "react";

export default function ChangeEmailScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const { user, setUser } = useUser();
  const isFormValid = email && confirmEmail;

  const handleSave = async () => {
    if (email.trim() === "" || confirmEmail.trim() === "") {
      setErrorMsg("Please fill in both fields");
      return;
    }

    if (email !== confirmEmail) {
      setErrorMsg("Emails do not match");
      return;
    }

    if (!user || typeof user.id !== "number") {
      setErrorMsg("Invalid user");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/users/${user.id}/email`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ newEmail: email }),
        },
      );

      if (response.ok) {
        setUser({ ...user, email });
        setEmail("");
        setConfirmEmail("");
        setErrorMsg("");
        router.push("/(tabs)/profile");
      } else {
        const data = await response.json();
        setErrorMsg(data.error || "Email is registered");
      }
    } catch (error) {
      console.error("Fetch failed:", error);
      setErrorMsg("Network error");
    }
  };

  useEffect(() => {
    setEmail("");
    setConfirmEmail("");
    setErrorMsg("");
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

      <Text style={styles.title}>CHANGE EMAIL</Text>

      <TextInput
        placeholder="New email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholderTextColor="#999"
      />

      <TextInput
        placeholder="Confirm email"
        style={styles.input}
        value={confirmEmail}
        onChangeText={setConfirmEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholderTextColor="#999"
      />

      {errorMsg !== "" && <Text style={styles.error}>{errorMsg}</Text>}

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
    height: 48,
    backgroundColor: "#F2F2F2",
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 14,
    marginBottom: 20,
  },
  error: {
    color: "red",
    marginBottom: 12,
    fontSize: 13,
    textAlign: "center",
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
