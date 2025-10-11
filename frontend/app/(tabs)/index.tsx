import { useRouter, useRootNavigationState } from "expo-router";
import React, { useEffect } from "react";
import {View, Text, ActivityIndicator} from "react-native";

export default function IndexRedirect() {
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    if (rootNavigationState?.key) {
      requestAnimationFrame(() => {
        router.replace("/auth/sign-in");
      });
    }
  }, [rootNavigationState]);

  return (
    <View>
      <ActivityIndicator size="large"/>
      <Text>Redirecting...</Text>
    </View>
  );
}
