import type { ReactNode } from "react";
import { Text, View } from "react-native";

export function Card({ title, value, detail }: { title: string; value?: string; detail?: string }) {
  return (
    <View className="rounded-lg border border-[#2f3746] bg-card p-4">
      <Text className="text-sm text-mutedForeground">{title}</Text>
      {value ? <Text className="mt-2 text-2xl font-bold text-foreground">{value}</Text> : null}
      {detail ? <Text className="mt-2 text-sm leading-5 text-mutedForeground">{detail}</Text> : null}
    </View>
  );
}

export function Panel({ children }: { children: ReactNode }) {
  return <View className="rounded-lg border border-[#2f3746] bg-card p-4">{children}</View>;
}
