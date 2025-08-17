import { useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
} from "react-native";
import { useState } from "react";
import CustomDropdown from "@/components/ui/select";
import CustomInput from "@/components/ui/input";
import OnboardingProgress from "@/components/ui/OnboardingProgress";

export default function InfoScreen1() {
  const router = useRouter();
  const [pronoun, setPronoun] = useState<string | null>(null);
  const [pace, setPace] = useState<string | null>(null);
  const [name, setName] = useState("");
  //explicit step index for the 4-step onboarding
  const STEP_INDEX = 1; // Story=0, Info=1, PickHabit=2, PickTask=3

  // const isFormValid = pronoun && pace && name;
  const isFormValid = pace && name;

  const handleBack = () => {
    router.push("../onboarding/story");
  };

  const handleContinue = () => {
    if (!isFormValid) return;
    router.push("/onboarding/PickHabit");
  };

  const pronounOptions = [
    { label: "She/Her", value: "she" },
    { label: "He/Him", value: "he" },
    { label: "They/Them", value: "they" },
  ];

  const paceOptions = [
    { label: "Fast", value: "fast" },
    { label: "Medium", value: "medium" },
    { label: "Slow", value: "slow" },
  ];

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Text style={styles.arrowText}>{"<"}</Text>
      </TouchableOpacity>

      <Image
        source={require("@/assets/images/purplecat.png")}
        style={styles.backgroundImage}
        resizeMode="contain"
      />
      <View style={{ marginVertical: "auto" }}>
        <Text style={styles.heading}>Let’s get to know you!</Text>

        <CustomDropdown
          items={paceOptions}
          value={pace}
          setValue={setPace}
          placeholder="Select your pace of work"
          zIndex={2}
          zIndexInverse={1}
        />
        <CustomInput
          placeholder="Enter Pet Name"
          value={name}
          onChangeText={setName}
        />

        <TouchableOpacity
          style={[styles.button, { opacity: isFormValid ? 1 : 0.6 }]}
          onPress={handleContinue}
          disabled={!isFormValid}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>

      <OnboardingProgress
        index={STEP_INDEX}
        onSkip={() => router.push("/onboarding/PickHabit")}
        onNext={() => router.push("/onboarding/PickHabit")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#D9D9D9",
    padding: 24,
  },
  backgroundImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
    top: "-8%",
    right: "-25%",
  },
  heading: {
    alignSelf: "center",
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 20,
    marginTop: 250,
    color: "#000",
  },
  button: {
    backgroundColor: "#000",
    borderRadius: 24,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  backArrow: {
    fontSize: 24,
    color: "#000",
  },
  backButton: {
    position: "absolute",
    top: 28,
    left: 24,
    zIndex: 10,
  },

  arrowText: {
    color: "#000",
    fontSize: 24,
    fontWeight: "bold",
    lineHeight: 24,
  },
});
