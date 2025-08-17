import * as React from "react";
import { View, StyleSheet } from "react-native";
import { TextInput } from "react-native-paper";

export default function CustomInput({
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
}: {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
}) {
  const [focused, setFocused] = React.useState(false);

  return (
    <View style={[styles.wrapper, focused && styles.focused]}>
      <TextInput
        mode="flat"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        underlineColor="transparent"
        activeUnderlineColor="transparent"
        style={styles.input}
        placeholderTextColor="#bbbbbb"
        secureTextEntry={secureTextEntry}
        theme={{
          colors: {
            text: "#000",
            placeholder: "#bbbbbb",
          },
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 16,
    height: 48,
  },
  focused: {
    backgroundColor: "#f2f2f2",
  },
  input: {
    fontSize: 16,
    paddingHorizontal: 16,
    backgroundColor: "transparent",
    fontWeight: "bold",
  },
});
