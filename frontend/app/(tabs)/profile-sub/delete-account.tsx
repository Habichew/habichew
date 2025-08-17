import React, { useState, useEffect } from "react";
import {
  Modal,
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { useUser } from "@/app/context/UserContext";

export default function DeleteAccountScreen() {
  const router = useRouter();
  const { user, setUser } = useUser();

  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    try {
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/users/${user?.id}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        },
      );

      const data = await res.json();

      if (res.ok) {
        setUser(null);
        router.replace("/auth/sign-in");
      } else {
        console.error("Delete failed:", data.error || "Unknown error");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <>
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

        <Text style={styles.title}>DELETE ACCOUNT</Text>

        <Text style={styles.text}>
          If you delete your account, all your data will be permanently removed.
          This action cannot be undone.
        </Text>

        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => setShowConfirm(true)}
        >
          <Text style={styles.deleteText}>DELETE</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={showConfirm} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Deletion</Text>
            <Text style={styles.modalText}>
              Are you sure you want to delete your account?
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setShowConfirm(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setShowConfirm(false);
                  handleDelete();
                }}
              >
                <Text style={styles.confirmText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
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
  deleteBtn: {
    backgroundColor: "#FF3B30",
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: "center",
    marginTop: 10,
  },
  deleteText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 24,
    borderRadius: 12,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  modalText: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  cancelText: {
    fontSize: 16,
    color: "#999",
    padding: 10,
  },
  confirmText: {
    fontSize: 16,
    color: "#FF3B30",
    padding: 10,
  },
});
