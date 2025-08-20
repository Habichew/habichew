import React, {Ref, RefObject, useRef, useState} from "react";
import DropDownPicker from "react-native-dropdown-picker";
import { Text, StyleSheet, View, ViewStyle, TextStyle, Pressable } from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import {Ionicons} from "@expo/vector-icons";

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
  loading,
    ref,
    iconName
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
  loading?: boolean;
  ref?: RefObject<any>;
  iconName?: string;
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
        // placeholder={placeholder || "Select an option"}
        placeholder={
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {iconName && (
                <Ionicons
                    name={iconName}
                    size={24}
                    color="black"
                    style={{ marginRight: 8 }}
                />
            )}
            <Text style={styles.placeholder}>
              {placeholder || "Select an option"}
            </Text>
          </View>
        }
        style={styles.dropdown}
        textStyle={styles.text}
        dropDownContainerStyle={styles.dropdownContainer}
        listItemLabelStyle={styles.text}
        placeholderStyle={styles.placeholder}
        showArrowIcon={true}
        zIndex={zIndex}
        props={{activeOpacity: 0.8}}
        zIndexInverse={zIndexInverse}
        loading={loading}
        controller={(instance:any) => {if (ref) ref.current = instance}}
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
    minHeight: "40@ms0.3",
    marginBottom: 15,
    elevation: 4,
    shadowColor: "#000 ",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  dropdownContainer: {
    borderRadius: 16,
    backgroundColor: "#fff",
    borderWidth: 0,
    shadowColor: "#000",
    elevation: 4,
    shadowOffset: { width: 3, height: -5 },
  shadowOpacity: 0.15,
  shadowRadius: 4,
  },
  text: {
    fontSize: "13@ms0.2",
    fontWeight: "bold",
    color: "#000",
  },
  placeholder: {
    // textAlign:'center',
    fontWeight: "bold",
    color: "#bbb",
    fontSize: "13@ms0.2",
    paddingLeft: '3@ms0.5',
    alignSelf: "center",
    width: 'auto'
  },
  arrow: {
    tintColor: "#DAB7FF",
  },
});
