// app/profile/send-feedback.tsx
import { useRouter } from "expo-router";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useEffect, useState } from "react";

export default function SendFeedback() {
  const router = useRouter();
  const [comments, setComments] = useState("");
  useEffect(() => {
    setComments("");
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

      <Text style={styles.title}>SEND FEEDBACK</Text>
      <Text style={styles.text}>
        Would you mind taking a second to tell us how we can make Habichew
        better for you?
      </Text>

      <TextInput
        style={styles.inputLarge}
        placeholder="Thoughts And Comments"
        placeholderTextColor="#999"
        multiline
        value={comments}
        onChangeText={setComments}
      />
      <TouchableOpacity
        onPress={() => router.push("/(tabs)/profile")}
        style={styles.saveBtn}
      >
        <Text style={styles.saveText}>{"Submit"}</Text>
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
  text: { fontSize: 14, color: "#333", marginBottom: 12, lineHeight: 22 },
  bold: { fontWeight: "bold" },
  inputLarge: {
    height: 180,
    borderRadius: 8,
    backgroundColor: "#F2F2F2",
    padding: 16,
    fontSize: 14,
    textAlignVertical: "top",
    marginBottom: 24,
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
