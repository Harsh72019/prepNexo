import { Text, View } from "react-native";
import { Card } from "../src/components/card";
import { Screen } from "../src/components/screen";
import { useDemoDashboard } from "../src/hooks/use-demo-dashboard";

export default function AnalyticsScreen() {
  const { data, error, loading } = useDemoDashboard();
  const solved = data?.heatmap.reduce((sum, day) => sum + day.problemsSolved, 0) ?? 0;

  return (
    <Screen title="Analytics" subtitle="Topic tracking and practice volume from persisted activity.">
      {loading ? <Text className="text-mutedForeground">Loading analytics...</Text> : null}
      {error ? <Text className="text-red-400">{error}</Text> : null}
      {data ? (
        <View className="gap-3">
          <Card title="Readiness" value={`${data.profile.readinessScore}%`} detail={`${solved} problems solved in recent activity`} />
          {data.topics.map((topic) => (
            <Card key={topic.topic} title={topic.topic} value={`${topic.proficiency}%`} detail={`${topic.gap} point gap to target`} />
          ))}
        </View>
      ) : null}
    </Screen>
  );
}
