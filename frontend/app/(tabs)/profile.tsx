// app/(tabs)/Profile.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useUser } from "@/app/context/UserContext";
import BottomBar from "@/components/bottomBar";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useUser(); // use user data

  const navigateTo = (screen: string) => {
    router.push(`./profile-sub/${screen}`);
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    router.replace("../auth/sign-in");
  };

  const handleDelete = () => {
    navigateTo("delete-account");
  };

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Avatar & Name */}
        <View style={styles.header}>
          {/* <Image source={require('@/assets/images/purplecat.png')} style={styles.avatar} /> */}
          <Text style={styles.name}>{user?.username || "Unknown User"}</Text>
        </View>

        {/* Section: My Profile */}
        <Text style={styles.sectionTitle}>My Profile</Text>
        <ProfileItem
          label="Email"
          value={user?.email || "no@email.com"}
          onPress={() => navigateTo("email")}
        />
        <ProfileItem
          label="Name"
          value={user?.username || "No Name"}
          onPress={() => navigateTo("name")}
        />
        <ProfileItem
          label="Change psw"
          onPress={() => navigateTo("change-psw")}
        />
        <ProfileItem label="Delete Account" onPress={handleDelete} />

        {/* Section: Support */}
        <Text style={styles.sectionTitle}>Support</Text>
        <ProfileItem
          label="Send Feedback"
          onPress={() => navigateTo("send-feedback")}
        />
        <ProfileItem label="FAQs" onPress={() => navigateTo("faqs")} />
        <ProfileItem label="About Us" onPress={() => navigateTo("about-us")} />
        <ProfileItem label="Policy" onPress={() => navigateTo("policy")} />

        {/* Logout button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
}

function ProfileItem({
  label,
  value,
  onPress,
}: {
  label: string;
  value?: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.item}>
      <View>
        <Text style={styles.label}>{label}</Text>
        {value && <Text style={styles.value}>{value}</Text>}
      </View>
      <Text style={styles.arrow}>{">"}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    paddingHorizontal: 24,
    paddingBottom: 20,
    backgroundColor: "#fff",
  },
  header: {
    alignItems: "center",
    marginBottom: 15,
  },
  avatar: {
    width: 60,
    height: 60,
    resizeMode: "contain",
    marginBottom: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 8,
    color: "#D9D9D9",
  },
  item: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 15,
    color: "#000",
  },
  value: {
    fontSize: 13,
    color: "#888",
    marginTop: 4,
  },
  arrow: {
    fontSize: 18,
    color: "#888",
  },
  logoutBtn: {
    marginTop: 15,
    backgroundColor: "#D9D9D9",
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: "center",
  },
  logoutText: {
    fontSize: 16,
    color: "#000",
    fontWeight: "bold",
  },
});
