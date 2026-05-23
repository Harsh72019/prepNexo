import { Text, View } from "react-native";
import { Card } from "../src/components/card";
import { Screen } from "../src/components/screen";
import { useDemoDashboard } from "../src/hooks/use-demo-dashboard";

export default function DsaArenaScreen() {
  const { data, loading } = useDemoDashboard();
  const dsa = data?.recentActivity.filter((item) => item.kind === "DSA_CONTEST") ?? [];

  return (
    <Screen title="DSA arena" subtitle="Contest performance from recent persisted attempts.">
      {loading ? <Text className="text-mutedForeground">Loading contest history...</Text> : null}
      <View className="gap-3">
        {dsa.map((attempt) => (
          <Card key={attempt.id} title={attempt.title} value={`${attempt.score}%`} detail={attempt.feedbackSummary ?? attempt.topic} />
        ))}
      </View>
    </Screen>
  );
}
