import React from "react";
import { View, StyleSheet } from "react-native";

const ProgressBar = ({ progress }: { progress: number }) => {
  return (
    <View style={styles.container}>
      <View style={[styles.fill, { width: `${progress}%` }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 10,
    backgroundColor: "#eee",
    borderRadius: 5,
    overflow: "hidden",
    marginVertical: 6,
  },
  fill: {
    height: "100%",
    backgroundColor: "#DAB7FF",
  },
});

export default ProgressBar;
