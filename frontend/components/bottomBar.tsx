// components/bottomBar.tsx
import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  Platform, Pressable,
} from "react-native";
import { useRouter, usePathname } from "expo-router";
import { Image } from 'expo-image';
import PieChart from "react-native-expo-pie-chart";

export default function BottomBar() {
  const router = useRouter();
  const pathname = usePathname();
  const isActive = (name: string) => pathname.includes(name);

  return (
    <View style={styles.container}>
      {/* Left buttons */}
      <View style={styles.sideGroup}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push("/(tabs)/home")}
        >
          <Image
            source={require("@/assets/images/home.png")}
            style={[styles.icon, isActive("/home") && styles.activeIcon]}
          />
          <Text style={[styles.label, isActive("/home") && styles.activeLabel]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push("/(tabs)/tasks")}
        >
          <Image
            source={require("@/assets/images/tasks.png")}
            style={[styles.icon, isActive("/tasks") && styles.activeIcon, {width: 28, height: 'auto', aspectRatio: 1, margin: -2}]}
          />
          <Text style={[styles.label, isActive("/tasks") && styles.activeLabel]}>List</Text>
        </TouchableOpacity>
      </View>

      {/* Middle cat icon */}
        <TouchableOpacity
          style={[
            styles.centerIconContainer,
            isActive("/pet") ? styles.activeCatShadow : styles.inactiveCatShadow,
          ]}
          onPress={() => router.push("/(tabs)/pet")}
          android_ripple={{color: '#00000020', borderless: false, foreground: true, radius: 35}}
        >
            <PieChart rotation={-90} zeroTotalCircleColor={'#ECECEC'} style={styles.creditChart} data={[{
                color: '#1CC282',
                count: 750,
                key: 'creditsCollected'
            }, {
                color: '#ECECEC',
                count: 250,
                key: 'creditsNeeded'
            }]} length={80}> </PieChart>
          <Image
            source={require("@/assets/images/catWhiteCircle.png")}
            style={styles.centerIcon}
          />
        </TouchableOpacity>

      {/* Right buttons */}
      <View style={styles.sideGroup}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push("/(tabs)/insights")}
        >
          <Image
            source={require("@/assets/images/insights.png")}
            style={[styles.icon, isActive("/insight") && styles.activeIcon]}
          />
          <Text style={[styles.label, isActive("/insight") && styles.activeLabel]}>Insights</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push("/(tabs)/profile")}
        >
          <Image
            source={require("@/assets/images/profile.png")}
            style={[styles.icon, isActive("/profile") && styles.activeIcon]}
          />
          <Text style={[styles.label, isActive("/profile") && styles.activeLabel]}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 80,
      activeLabel: { color: "#000", fontWeight: "900" },
      activeIcon: { opacity: 1, color: "#000" },
      backgroundColor: "#ECECEC",
    // borderTopLeftRadius: 20,
    // borderTopRightRadius: 20,
    paddingBottom: Platform.OS === "ios" ? 24 : 12,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  sideGroup: {
    flexDirection: "row",
    width: "40%",
    justifyContent: "space-around",
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "flex-end",
    height: 60,
    width: 60,
  },
  icon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
    opacity: 0.6,
  },
  activeIcon: {
    opacity: 1,
  },
  label: {
    fontSize: 12,
    color: "#000",
    marginTop: 4,
  },
  centerIconContainer: {
    position: "absolute",
    top: -34,
    left: "50%",
    transform: [{ translateX: -34 }],
    backgroundColor: "#ECECEC",
    borderRadius: 50,
    padding: 6,
    elevation: 6,
  },
  centerIcon: {
      position: 'absolute',
      top: 6,
      left: 6,
    width: 68,
    height: 68,
    resizeMode: "contain",
      zIndex: 10,
      backgroundColor: 'white',
      borderRadius: 40
  },
    inactiveCatShadow: {
        shadowColor: "#fff",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 6,
        elevation: 6,
    },
    activeCatShadow: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 6,
        elevation: 6,
    },
    creditChart: {
        position: 'absolute',
        top: -80,
        // padding: 3,
        zIndex: 9
    }
});
