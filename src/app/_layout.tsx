import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // यसले माथिको सम्पूर्ण Expo Header / Nav Bar हटाउँछ
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
}
