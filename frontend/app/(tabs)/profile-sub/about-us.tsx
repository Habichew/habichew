import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import React from "react";

export default function About() {
  const router = useRouter();

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
      <Text style={styles.title}>About Us</Text>

      <Text style={styles.text}>
        We’re a small team dedicated to making habits easier to keep. Our app
        brings together smart AI task breakdowns and a virtual pet that grows as
        you do.
      </Text>
      <Text style={styles.text}>
        We believe productivity can feel warm, playful, and personal — not just
        another to-do list. Let’s make progress fun!
      </Text>
      <Text style={styles.text}>
        Contact us: <Text style={styles.bold}>[email]</Text>
      </Text>
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
  text: { fontSize: 14, color: "#333", marginBottom: 20, lineHeight: 22 },
  bold: { fontWeight: "bold" },
});
