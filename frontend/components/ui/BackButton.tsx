// components/BackButton.tsx
import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useNavigation } from "expo-router";

export default function BackButton() {
  const navigation = useNavigation();

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      console.warn("⚠️ No screen to go back to.");
    }
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handleGoBack}>
      <Text style={styles.icon}>{"<"}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    backgroundColor: "#fff",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    marginTop: 20,
    marginLeft: 16,
  },
  icon: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
});
