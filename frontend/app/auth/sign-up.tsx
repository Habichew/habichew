import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import Checkbox from "expo-checkbox";
import CustomInput from "@/components/ui/input";
import { useUser } from "../context/UserContext";

export default function SignUpScreen() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const isFormValid = username && agree && email && password;
  const { setUser } = useUser();
  const handleSignUp = async () => {
    if (!agree) {
      alert("Please agree to the terms.");
      return;
    }

    if (!email || !password) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const response = await fetch(
        process.env.EXPO_PUBLIC_BACKEND_URL + "/users/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, email, password }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);

        alert("Registration successful!");
        router.replace("../onboarding/launch");
      } else {
        alert(`Registration failed: ${data.error || "Unknown error"}`);
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Let’s get{"\n"}you started!</Text>

      <View style={styles.formContainer}>
        <CustomInput
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
        />

        <CustomInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
        />

        <CustomInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
        />

        <View style={styles.checkboxContainer}>
          <Checkbox
            value={agree}
            onValueChange={setAgree}
            color={agree ? "#000" : undefined}
          />
          <Text style={styles.checkboxLabel}>
            {" "}
            I agree with the Terms & Conditions
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.button, { opacity: isFormValid ? 1 : 0.6 }]}
          onPress={handleSignUp}
          disabled={!isFormValid}
        >
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 80,
  },
  title: {
    fontSize: 60,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 60,
    color: "#000",
  },
  formContainer: {
    flex: 1,
    width: "100%",
    backgroundColor: "#DAB7FF",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingVertical: 60,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  input: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 12,
    fontSize: 16,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  checkboxLabel: {
    fontSize: 13,
    marginLeft: 8,
    color: "#000",
  },
  button: {
    backgroundColor: "#1CC282",
    paddingVertical: 14,
    paddingHorizontal: 60,
    borderRadius: 25,
    marginTop: 20,
  },
  buttonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
});
