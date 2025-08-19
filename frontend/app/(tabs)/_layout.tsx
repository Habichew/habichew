// app/(tabs)/_layout.tsx
import { Tabs, useRouter } from "expo-router";
import React from "react";
import {View, StyleSheet, ScrollView, Dimensions} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BottomBar from "@/components/bottomBar";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function TabLayout() {
  const router = useRouter();

  return (
    <GestureHandlerRootView>
      <View
        style={[
          styles.container,
          {

          },
        ]}
      >
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: { display: "none" },
          }}
        >
          <Tabs.Screen name="home" />
          <Tabs.Screen name="tasks" />
          <Tabs.Screen name="pet" />
          <Tabs.Screen name="insights" />
          <Tabs.Screen name="profile" />
        </Tabs>
        <BottomBar></BottomBar>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export const TabletWidth: number = 768;
export const BigPhoneWidth: number = 360;
export const ScreenWidth: number = Dimensions.get('window').width;
export const ScreenHeight: number = Dimensions.get('window').height;