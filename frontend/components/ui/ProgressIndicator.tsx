// components/ui/ProgressBar.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function ProgressBar({
  step,
  total,
  showLabel = true,
}: {
  step: number;
  total: number;
  showLabel?: boolean;
}) {
  const percentage = (step / total) * 100;

  return (
    <View style={styles.wrapper}>
      {showLabel && (
        <Text style={styles.text}>
          Step {step} of {total}
        </Text>
      )}
      <View style={styles.barBackground}>
        <View style={[styles.barFill, { width: `${percentage}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: "100%", paddingHorizontal: 24, marginTop: 20 },
  text: { fontSize: 14, fontWeight: "bold", marginBottom: 6, color: "#333" },
  barBackground: {
    height: 8,
    backgroundColor: "#eee",
    borderRadius: 4,
    overflow: "hidden",
  },
  barFill: {
    height: 8,
    backgroundColor: "#DAB7FF",
  },
});
