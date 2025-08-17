import { useRouter, useRootNavigationState } from "expo-router";
import { useEffect } from "react";
import { View, Text } from "react-native";

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
      <Text>Redirecting...</Text>
    </View>
  );
}
