import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";

export default function PolicyScreen() {
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

      <Text style={styles.title}>Policy</Text>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Privacy Policy</Text>

        <Text style={styles.paragraph}>
          We respect and protect your personal information.{"\n"}
          When you use this app, we may collect:
        </Text>

        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>
            • Your account information (e.g., email, nickname)
          </Text>
          <Text style={styles.bulletItem}>
            • Device information and usage data (e.g., actions, task progress)
          </Text>
          <Text style={styles.bulletItem}>
            • Information you provide to generate personalized plans (e.g.,
            habits, tasks)
          </Text>
        </View>

        <Text style={styles.paragraph}>We collect this data to:</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>
            • Provide AI-assisted task breakdowns and virtual pet growth
            features
          </Text>
          <Text style={styles.bulletItem}>
            • Improve our services, design better motivational tools
          </Text>
          <Text style={styles.bulletItem}>
            • Ensure security and prevent misuse
          </Text>
        </View>

        <Text style={styles.paragraph}>
          We do not sell or rent your personal information to unrelated third
          parties. If we need to share data with trusted partners (e.g., cloud
          storage, analytics providers), we will take reasonable security
          measures.
        </Text>

        <Text style={styles.paragraph}>
          If you are under 18, please use this app only with the consent of a
          parent or legal guardian.
        </Text>

        <Text style={styles.paragraph}>
          You have the right to access, modify, or delete your personal data at
          any time.
        </Text>

        <Text style={styles.paragraph}>
          If you have questions, please contact us at{" "}
          <Text style={styles.bold}>[contact email]</Text>.
        </Text>

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
          Terms of Use
        </Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>
            • You agree to use this app only for lawful and proper purposes.
          </Text>
          <Text style={styles.bulletItem}>
            • Do not misuse AI features or upload illegal or harmful content.
          </Text>
          <Text style={styles.bulletItem}>
            • All virtual pet designs, AI-generated content, and app materials
            are the property of the developer.
          </Text>
          <Text style={styles.bulletItem}>
            • This app does not provide medical or psychological treatment. Its
            motivational features are for productivity support only.
          </Text>
          <Text style={styles.bulletItem}>
            • We are not liable for any direct or indirect loss caused by using
            this app, to the extent permitted by law.
          </Text>
          <Text style={styles.bulletItem}>
            • If you violate these terms, we reserve the right to suspend or
            terminate your account.
          </Text>
        </View>
      </ScrollView>
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
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#000",
  },
  paragraph: {
    fontSize: 14,
    color: "#333",
    lineHeight: 22,
    marginBottom: 12,
  },
  bulletList: {
    marginBottom: 16,
    paddingLeft: 10,
  },
  bulletItem: {
    fontSize: 14,
    color: "#333",
    lineHeight: 22,
    marginBottom: 6,
  },
  bold: {
    fontWeight: "bold",
  },
});
