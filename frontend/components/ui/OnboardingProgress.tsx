// components/ui/OnboardingProgress.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from "react-native";

type Props = {
  index: number; // 0-based: Story=0, Info=1, PickHabit=2, PickTask=3
  total?: number; // kept for compatibility (ignored)
  count?: number; // default 4
  onSkip?: () => void;
  onNext?: () => void;
  skipLabel?: string; // default "Skip"
  nextLabel?: string; // default "Next"
  fixed?: boolean; // default true
  backgroundColor?: string; // default "#eee"
  activeColor?: string; // default "#000"
  inactiveColor?: string; // default "#bbb"
  dotSize?: number; // default 8
  dotSpacing?: number; // default 4
  style?: ViewStyle;
  textStyle?: TextStyle;
};

export default function OnboardingProgress({
  index,
  total, // not used
  count = 4, // always 4 dots for the whole onboarding
  onSkip,
  onNext,
  skipLabel = "Skip",
  nextLabel = "Next",
  fixed = true,
  backgroundColor = "#eee",
  activeColor = "#000",
  inactiveColor = "#bbb",
  dotSize = 8,
  dotSpacing = 4,
  style,
  textStyle,
}: Props) {
  const dots = Math.max(1, count);
  const activeDot = clamp(index, 0, dots - 1);

  return (
    <View
      style={[styles.bar, fixed && styles.fixed, { backgroundColor }, style]}
    >
      <TouchableOpacity
        onPress={onSkip}
        disabled={!onSkip}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={[styles.navText, textStyle]}>{skipLabel}</Text>
      </TouchableOpacity>

      <View style={styles.dotsRow}>
        {Array.from({ length: dots }).map((_, i) => (
          <View
            key={i}
            style={{
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              marginHorizontal: dotSpacing,
              backgroundColor: i === activeDot ? activeColor : inactiveColor,
            }}
          />
        ))}
      </View>

      <TouchableOpacity
        onPress={onNext}
        disabled={!onNext}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={[styles.navText, textStyle]}>{nextLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

const styles = StyleSheet.create({
  bar: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  fixed: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  navText: { fontSize: 16, fontWeight: "bold", color: "#000" },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});
