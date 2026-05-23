import { Link } from "expo-router";
import { Image, Text, View } from "react-native";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/coding", label: "Live coding" },
  { href: "/dsa-arena", label: "DSA arena" },
  { href: "/system-design", label: "System design" },
  { href: "/analytics", label: "Analytics" },
  { href: "/ai-coach", label: "AI coach" }
] as const;

export default function HomeScreen() {
  return (
    <View className="flex-1 gap-6 bg-background px-5 pt-16">
      <View className="rounded-lg border border-[#2f3746] bg-card p-5">
        <Image source={require("../assets/images/logo.png")} resizeMode="cover" className="h-28 w-full rounded-lg" />
        <Text className="mt-3 text-3xl font-bold text-foreground">Mobile command center</Text>
        <Text className="mt-3 text-base leading-6 text-mutedForeground">
          Every section uses the same backend services as web, with demo data pulled through the auth and dashboard APIs.
        </Text>
      </View>
      <View className="gap-3">
        {links.map((item) => (
          <Link key={item.href} href={item.href} className="rounded-lg bg-muted p-4 text-base font-semibold text-foreground">
            {item.label}
          </Link>
        ))}
      </View>
    </View>
  );
}
