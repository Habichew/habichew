import React, { useState } from "react";
import DropDownPicker from "react-native-dropdown-picker";
import { Text, StyleSheet, View, ViewStyle, TextStyle, Pressable } from "react-native";
import { ScaledSheet } from "react-native-size-matters";

type Option = {
  label: string;
  value: string;
};

export default function CustomDropdown({
  items,
  value,
  setValue,
  placeholder,
  zIndex = 2,
  zIndexInverse = 1,
  style = {},
}: {
  items: Option[];
  value: string | null;
  setValue: (val: string | null) => void;
  placeholder?: string;
  zIndex?: number;
  zIndexInverse?: number;
  backgroundColor?: string;
  textColor?: string;
  placeholderColor?: string;
  style?: ViewStyle;
}) {
  const [open, setOpen] = useState(false);

  return (
    <View style={[styles.wrapper, { zIndex }, style]}>
      <DropDownPicker
        open={open}
        value={value}
        items={items}
        setOpen={setOpen}
        setValue={(valOrCallback) => {
          if (typeof valOrCallback === "function") {
            const result = valOrCallback(value);
            setValue(result);
          } else {
            setValue(valOrCallback);
          }
        }}
        placeholder={placeholder || "Select an option"}
        style={styles.dropdown}
        textStyle={styles.text}
        dropDownContainerStyle={styles.dropdownContainer}
        listItemLabelStyle={styles.text}
        placeholderStyle={styles.placeholder}
        showArrowIcon={true}
        zIndex={zIndex}
        props={{activeOpacity: 0.8}}
        zIndexInverse={zIndexInverse}
      />
    </View>
  );
}

const styles = ScaledSheet.create({
  wrapper: {},
  dropdown: {
    borderRadius: 24,
    borderWidth: 0,
    backgroundColor: "#fff",
    shadowColor: "#000",
    minHeight: "40@ms",
    marginBottom: 15,
    elevation: 4,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  dropdownContainer: {
    borderRadius: 16,
    backgroundColor: "#fff",
    shadowColor: "#000",
    borderWidth: 0,
    elevation: 4,
    shadowOffset: { width: 3, height: -5 },
  shadowOpacity: 0.15,
  shadowRadius: 4,
  },
  text: {
    fontSize: "16@s",
    fontWeight: "bold",
    color: "#000",
  },
  placeholder: {
    // textAlign:'center',
    fontWeight: "bold",
    color: "#bbb",
    fontSize: "14@s",
    paddingLeft: 8
  },
  arrow: {
    tintColor: "#DAB7FF",
  },
});
