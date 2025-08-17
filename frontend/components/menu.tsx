// components/menu.tsx
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  Image,
  Modal,
} from "react-native";

export default function TopBar() {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <View style={styles.container}>
      {/* Profile button */}
      <TouchableOpacity onPress={() => setShowMenu(!showMenu)}>
        <Image
          source={require("@/assets/images/profile.png")}
          style={styles.icon}
        />
      </TouchableOpacity>

      {/* Home button */}
      <TouchableOpacity onPress={() => router.push("/pet")}>
        <View style={styles.homeContainer}>
          <Image
            source={require("@/assets/images/home.png")}
            style={styles.icon}
          />
        </View>
      </TouchableOpacity>

      {/* Profile Menu */}
      <Modal
        transparent={true}
        visible={showMenu}
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.menuContainer}>
            <Text style={styles.username}>Username</Text>
            <Text style={styles.email}>example@gmail.com</Text>
            <View style={styles.divider} />
            <Text style={styles.menuItem}>Edit Profile</Text>
            <Text style={styles.menuItem}>Insights</Text>
            <Text style={styles.menuItem}>Push Notifications</Text>
            <Text style={styles.menuItem}>Mood-Checkin</Text>
            <Text style={styles.menuItem}>Pet widget</Text>
            <Text style={styles.menuItem}>Help Center</Text>
            <Text style={styles.menuItem}>Report an Issue</Text>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
    backgroundColor: "#fff",
    zIndex: 1000,
  },
  icon: {
    width: 44,
    height: 44,
  },
  homeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  homeText: {
    marginLeft: 6,
    fontWeight: "bold",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    paddingTop: 100,
    paddingLeft: 20,
  },
  menuContainer: {
    width: 220,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  username: {
    fontSize: 16,
    fontWeight: "bold",
  },
  email: {
    fontSize: 12,
    color: "#666",
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: "#ccc",
    marginVertical: 8,
  },
  menuItem: {
    paddingVertical: 6,
    fontSize: 14,
  },
});
