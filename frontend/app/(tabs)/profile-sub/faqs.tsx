import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import React from "react";

export default function FAQs() {
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
      <Text style={styles.title}>FAQs</Text>

      <View style={styles.qaBlock}>
        <Text style={styles.question}>
          1.{" "}
          <Text style={styles.bold}>
            How many devices can I use with my account?
          </Text>
        </Text>
        <Text style={styles.answer}>
          You can log in to your account on multiple devices. We recommend
          keeping your account credentials safe and not sharing them with others
          to protect your data.
        </Text>
      </View>

      <View style={styles.qaBlock}>
        <Text style={styles.question}>
          2. <Text style={styles.bold}>How long will my data be stored?</Text>
        </Text>
        <Text style={styles.answer}>
          Your data will be securely stored as long as your account is active.
          You can request to access, export, or delete your data at any time by
          contacting our support team.
        </Text>
      </View>

      <View style={styles.qaBlock}>
        <Text style={styles.question}>
          3. <Text style={styles.bold}>How does the virtual pet grow?</Text>
        </Text>
        <Text style={styles.answer}>
          Right now, you can unlock postcards with pet stories as you complete
          tasks. Our full growth system and in-app pet store are under
          development — stay tuned for more ways to care for and customize your
          pet soon!
        </Text>
      </View>

      <View style={styles.qaBlock}>
        <Text style={styles.question}>
          4.{" "}
          <Text style={styles.bold}>
            What should I do if the app doesn’t work properly?
          </Text>
        </Text>
        <Text style={styles.answer}>
          If you encounter technical issues, please try restarting the app or
          updating it to the latest version. If the problem continues, feel free
          to contact us through <Text style={styles.bold}>[support email]</Text>{" "}
          — we’re here to help!
        </Text>
      </View>
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
  qaBlock: { marginBottom: 20 },
  question: { fontSize: 15, marginBottom: 4 },
  bold: { fontWeight: "bold" },
  answer: { color: "#333", lineHeight: 20 },
});
