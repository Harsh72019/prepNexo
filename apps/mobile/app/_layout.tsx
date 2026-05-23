import { Stack } from "expo-router";
import "../global.css";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#171c28" },
        headerTintColor: "#f8fafc",
        contentStyle: { backgroundColor: "#0f131d" }
      }}
    />
  );
}
