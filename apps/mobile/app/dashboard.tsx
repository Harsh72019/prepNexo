import { Text, View } from "react-native";
import { Card } from "../src/components/card";
import { Screen } from "../src/components/screen";
import { useDemoDashboard } from "../src/hooks/use-demo-dashboard";

export default function DashboardScreen() {
  const { data, error, loading } = useDemoDashboard();

  return (
    <Screen title="Dashboard" subtitle="Readiness, streaks, recent activity, and roadmap from the live API.">
      {loading ? <Text className="text-mutedForeground">Loading dashboard...</Text> : null}
      {error ? <Text className="text-red-400">{error}</Text> : null}
      {data ? (
        <View className="gap-3">
          {data.metrics.map((metric) => (
            <Card key={metric.label} title={metric.label} value={metric.value} detail={metric.delta} />
          ))}
          {data.roadmap.slice(0, 3).map((item) => (
            <Card key={item.id} title={item.title} detail={item.description} />
          ))}
        </View>
      ) : null}
    </Screen>
  );
}
