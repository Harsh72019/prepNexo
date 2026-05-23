import { View } from "react-native";
import { Card } from "../src/components/card";
import { Screen } from "../src/components/screen";

export default function SystemDesignScreen() {
  return (
    <Screen title="System design" subtitle="Collaborative canvas and Gemini critique are live on web, with shared backend contracts.">
      <View className="gap-3">
        <Card title="Canvas sync" value="Realtime" detail="Infrastructure block updates are broadcast to every participant in the design room." />
        <Card title="AI critique" value="Gemini" detail="The AI service evaluates architecture notes for scalability, reliability, data model, and tradeoffs." />
      </View>
    </Screen>
  );
}
