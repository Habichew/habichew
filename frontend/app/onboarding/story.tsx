import { useRouter, useLocalSearchParams } from "expo-router";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import React, { useState } from "react";
import ProgressIndicator from "@/components/ui/ProgressIndicator";
import OnboardingProgress from "@/components/ui/OnboardingProgress";

const storyImages = [
  require("../../assets/story/P1.jpg"),
  require("../../assets/story/P2.jpg"),
  require("../../assets/story/P3.jpg"),
  require("../../assets/story/P4.jpg"),
  require("../../assets/story/P5.jpg"),
  require("../../assets/story/P6.jpg"),
  require("../../assets/story/P7.jpg"),
  require("../../assets/story/P8.jpg"),
  require("../../assets/story/P9.jpg"),
  require("../../assets/story/P10.jpg"),
  require("../../assets/story/P11.jpg"),
  require("../../assets/story/P12.jpg"),
  require("../../assets/story/P13.jpg"),
  require("../../assets/story/P14.jpg"),
];

const storyTexts = [
  [
    "You wake up... weightless.",
    "The window is somehow broken. Systems failing. You feel the emptiness closing in...",
  ],
  ["What is that??"],
  ["A cat!"],
  [
    "“Hey... you’re finally awake! Come here”",
    "Okay...?",
    "Who are you? What happened to me?",
  ],
  [
    "“Your ship got hit by a meteor storm.",
    "Lucky I came by when I did — you were about to run out of power.",
    "This place is a mess... you can’t stay here.”",
  ],
  [
    "“Come with me — my little ship is nearby. It’s small, but cozy!”",
    "Ohhh wait for me!",
  ],
  [""], // pic7
  ["Here we are!"],
  [
    "“I’m a space stray! No name yet.",
    "I used to travel with my kind, but got separated a long time ago.",
    "Now I drift around... looking for bits of energy.”",
  ],
  [
    "“Your ship’s too damaged to fly alone — but together we can fix it.",
    "I know how to find energy out here — but I need your help.”",
  ],
  [
    "“I feed on your goals — sounds weird, huh?”",
    "“You set a goal, I chew it up into tiny tasks.”",
  ],
  ["When you complete each one, it feeds me — and powers up our ships.”"],
  [
    "“So... how about it?",
    "You help me find food, I help you get home — and we explore the stars together.”",
  ],
  ["“Ready to try?", "Let’s set your first big mission — I’m hungry already!”"],
];

export default function StoryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const initialIndex = parseInt(params.index as string) || 0;
  const [index, setIndex] = useState(initialIndex);
  const STEP_INDEX = 0; // Story=0, Info=1, PickHabit=2, PickTask=3

  const handleNext = () => {
    if (index < storyImages.length - 1) {
      setIndex(index + 1);
    } else {
      router.push("/onboarding/info");
    }
  };

  const handleBack = () => {
    if (index === 0) {
      router.push("../onboarding/launch");
    } else {
      setIndex(index - 1);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageSection}>
        <Image source={storyImages[index]} style={styles.image} />
      </View>

      {/* text */}
      <View style={styles.textSection}>
        {storyTexts[index].map((line, i) => (
          <Text key={i} style={styles.line}>
            {line}
          </Text>
        ))}
      </View>

      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Text style={styles.arrowText}>{"<"}</Text>
      </TouchableOpacity>

      <View style={styles.progressWrap}>
        <Text style={styles.pageText}>
          {" "}
          {index + 1} / {storyImages.length}
        </Text>
        <ProgressIndicator
          step={index + 1}
          total={storyImages.length}
          showLabel={false}
        />
      </View>

      <OnboardingProgress
        index={STEP_INDEX}
        onSkip={() => router.push("/onboarding/info")}
        onNext={handleNext}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  imageSection: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  textSection: {
    flex: 0.7,
    backgroundColor: "#fff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 36,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  line: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 12,
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

  bottomNav: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 84,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  skipText: { fontSize: 16, fontWeight: "bold", color: "#000" },
  nextText: { fontSize: 16, fontWeight: "bold", color: "#000" },

  progressWrap: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 24,
  },
  pageText: {
    textAlign: "center",
    fontWeight: "bold",
    color: "#999",
    marginBottom: 6,
  },
});
