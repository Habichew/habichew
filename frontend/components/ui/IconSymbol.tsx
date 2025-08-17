import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { OpaqueColorValue, StyleProp, TextStyle } from "react-native";

const MAPPING = {
  "pawprint.fill": "pets",
  "checkmark.circle.fill": "check-circle",
  airplane: "flight",
  "person.fill": "person",
} as const;

type IconSymbolName = keyof typeof MAPPING;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
}) {
  const iconName = MAPPING[name];
  return (
    <MaterialIcons name={iconName} size={size} color={color} style={style} />
  );
}
