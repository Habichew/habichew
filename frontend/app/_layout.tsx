// app/_layout.tsx
import React from "react";
import { useFonts } from "expo-font";
import { Slot, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { UserProvider } from "@/context/UserContext";
import { Platform, View, StyleSheet } from "react-native";
import * as NavigationBar from "expo-navigation-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function RootLayout() {
    const [fontsLoaded] = useFonts({
        Poppins: require("@/assets/fonts/Poppins-Regular.ttf"),
        PoppinsBold: require("@/assets/fonts/Poppins-SemiBold.ttf"),
        PoppinsLight: require("@/assets/fonts/Poppins-Light.ttf"),
        Lalezar: require("@/assets/fonts/Lalezar-Regular.ttf"),
    });

    const insets = useSafeAreaInsets();

    React.useEffect(() => {
        if (fontsLoaded) {
            SplashScreen.hideAsync();
        }
        if (Platform.OS === "android") {
            NavigationBar.setStyle("dark");
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) {
        return null;
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <UserProvider>
                {/* Safe area and background color */}
                <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
                    <Slot />
                </View>
            </UserProvider>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
    },
});