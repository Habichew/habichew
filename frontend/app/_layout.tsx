// app/_layout.tsx
import React from "react";
import { useFonts } from "expo-font";
import { Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { UserProvider } from "./context/UserContext";
import { Platform } from "react-native";
import * as NavigationBar from "expo-navigation-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Poppins: require("@/assets/fonts/Poppins-Regular.ttf"),
    PoppinsBold: require("@/assets/fonts/Poppins-SemiBold.ttf"),
    PoppinsLight: require("@/assets/fonts/Poppins-Light.ttf"),
    Lalezar: require("@/assets/fonts/Lalezar-Regular.ttf"),
  });

  React.useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
    if (Platform.OS === "android") {
      // Set the navigation bar style
      NavigationBar.setStyle("dark");
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView>
      <UserProvider>
        <Slot
          screenOptions={{
            headerStyle: {
              backgroundColor: "#DAB7FF",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontWeight: "bold",
            },
            headerBackVisible: true,
            headerShown: true,
            headerTitleAlign: "center",
          }}
        />
      </UserProvider>
    </GestureHandlerRootView>
  );
}
