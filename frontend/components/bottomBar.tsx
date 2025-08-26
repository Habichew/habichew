// components/bottomBar.tsx
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  Platform, Pressable,
} from "react-native";
import { useRouter, usePathname } from "expo-router";
import { Image } from 'expo-image';
import {postcardImgs} from "@/constants/PostcardData";
import PieChart from "react-native-expo-pie-chart";
import {useUser} from "@/context/UserContext";

export default function BottomBar() {
  const router = useRouter();
  const pathname = usePathname();
  const isActive = (name: string) => pathname.includes(name);
  const {user} = useUser();
  const userCredits = user?.credits;

  // handle unlock
  const sortedPostcards = [...postcardImgs].sort((a, b) => a.unlockScore - b.unlockScore);

  // find last and next postcards
  const lastPostcard = [...sortedPostcards].reverse().find(p => p.unlockScore <= userCredits) ?? sortedPostcards[0];
  const nextPostcard = sortedPostcards.find(p => p.unlockScore > lastPostcard.unlockScore) ?? null;

  // boundary protection
  const lowerBound = lastPostcard.unlockScore;
  const upperBound = nextPostcard?.unlockScore ?? lowerBound + 100; // fallback

  const totalNeededInStage = upperBound - lowerBound;
  const progressInThisStage = Math.max(userCredits - lowerBound, 0);
  const remaining = totalNeededInStage - progressInThisStage;

/*  console.log('[bottomBar.tsx] Progress in the stage: ',progressInThisStage);
  console.log('[bottomBar.tsx] Remaining credits in the stage: ',remaining);*/

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
            source={require("@/assets/images/Desk_alt.png")}
            style={[styles.icon, isActive("/tasks") && styles.activeIcon]}
          />
          <Text style={[styles.label, isActive("/tasks") && styles.activeLabel]}>List</Text>
        </TouchableOpacity>
      </View>

      {/* Middle cat icon */}
        <Pressable
          style={[
            styles.centerIconContainer,
            isActive("/pet") ? styles.activeCatShadow : styles.inactiveCatShadow,
          ]}
          onPress={() => router.push("/(tabs)/pet")}
          android_ripple={{color: '#00000020', borderless: false, foreground: true, radius: 33}}
        >
          <Image
            source={require("@/assets/images/catWhiteCircle.png")}
            style={styles.centerIcon}
          />
          <PieChart
              rotation={-90}
              zeroTotalCircleColor={'#ECECEC'}
              style={styles.creditChart}
              data={[
                {
                  color: '#1CC282',
                  count: progressInThisStage,
                  key: 'creditsCollected'
                },
                {
                  color: '#ECECEC',
                  count: remaining,
                  key: 'creditsNeeded'
                }
              ]}
              length={80}
          />

        </Pressable>

      {/* Right buttons */}
      <View style={styles.sideGroup}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push("/(tabs)/insights")}
        >
          <Image
            source={require("@/assets/images/Chart.png")}
            style={[styles.icon, isActive("/insight") && styles.activeIcon]}
          />
          <Text style={[styles.label, isActive("/insight") && styles.activeLabel]}>Insights</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push("/(tabs)/profile")}
        >
          <Image
            source={require("@/assets/images/User_alt.png")}
            style={[styles.icon, isActive("/profile") && styles.activeIcon]}
          />
          <Text style={[styles.label, isActive("/profile") && styles.activeLabel]}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { borderWidth:1, borderColor:'#eee', flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", height: 80, backgroundColor: "#fff", paddingBottom: Platform.OS === "ios" ? 24 : 12, position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 10 },
  sideGroup: { flexDirection: "row", width: "40%", justifyContent: "space-around" },
  tabItem: { alignItems: "center", justifyContent: "flex-end", height: 60, width: 60 },
  icon: { width: 28, height: 28, resizeMode: "contain", opacity: 0.6 },
  activeIcon: { opacity: 1, color: "#000" },
  label: { fontSize: 12, color: "#aaa", marginTop: 4 },
  activeLabel: { color: "#000", fontWeight: "900" },
  centerIconContainer: {   position: "absolute",
  top: -40,               
  left: "50%",
  transform: [{ translateX: -40 }],
  width: 80,           
  height: 80,
  borderRadius: 40,
  backgroundColor: "#ECECEC",
  justifyContent: "center",
  alignItems: "center",
  elevation: 6, },
  centerIcon: { width: 68, height: 68, resizeMode: "contain", position: 'absolute', zIndex: 10, borderWidth: StyleSheet.hairlineWidth, borderRadius: 90, borderColor: '#00000010' },
  inactiveCatShadow: {
  shadowColor: "#fff",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.8,
  shadowRadius: 6,
  elevation: 6,},
  activeCatShadow: {
  shadowColor: "#1CC282", shadowOffset: { width: 0, height: 5 }, shadowOpacity: 1, shadowRadius: 6, elevation: 6,},
  creditChart: { position: 'absolute', top: 0, left: 0, width: 80, height: 80, zIndex: 5 }, 
});
