import { Link } from "expo-router";
import type { ReactNode } from "react";
import { ScrollView, Text, View } from "react-native";

export function Screen({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-5 px-5 pb-10 pt-14">
      <View className="gap-2">
        <Link href="/" className="text-sm font-semibold text-primary">PrepNexo</Link>
        <Text className="text-3xl font-bold text-foreground">{title}</Text>
        <Text className="text-base leading-6 text-mutedForeground">{subtitle}</Text>
      </View>
      {children}
    </ScrollView>
  );
}
