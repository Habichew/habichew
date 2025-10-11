import {Dimensions} from "react-native";


export const scale = (value: number) => (Dimensions.get('window').width / 375) * value;
