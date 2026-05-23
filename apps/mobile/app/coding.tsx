import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { Card, Panel } from "../src/components/card";
import { Screen } from "../src/components/screen";
import { runMobileCode } from "../src/lib/api";

const defaultCode = [
  "export function solve(nums: number[]) {",
  "  return nums.reduce((sum, value) => sum + value, 0);",
  "}"
].join("\n");

export default function CodingScreen() {
  const [code, setCode] = useState(defaultCode);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    try {
      const response = await runMobileCode(code);
      setResult(response.data.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen title="Live coding" subtitle="Run the same interview test cases used by the realtime web room.">
      <View className="gap-3">
        <Panel>
          <TextInput
            value={code}
            onChangeText={setCode}
            multiline
            autoCapitalize="none"
            className="min-h-48 rounded-md bg-background p-3 font-mono text-sm text-foreground"
            placeholderTextColor="#99a3b3"
          />
          <TouchableOpacity onPress={run} className="mt-3 rounded-md bg-primary p-3">
            <Text className="text-center font-bold text-[#062016]">{loading ? "Running..." : "Run tests"}</Text>
          </TouchableOpacity>
        </Panel>
        {result ? <Card title="Runner output" detail={result} /> : null}
        <Card title="Collaboration" value="Socket.IO" detail="Presence and code patches are synchronized through Redis-backed rooms." />
      </View>
    </Screen>
  );
}
