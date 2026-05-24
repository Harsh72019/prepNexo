import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { Panel } from "../src/components/card";
import { Screen } from "../src/components/screen";
import { askAiCoach } from "../src/lib/api";

export default function AiCoachScreen() {
  const [message, setMessage] = useState(
    "I would start with requirements and clarify scale.",
  );
  const [reply, setReply] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    try {
      const response = await askAiCoach(message);
      setReply(response.data.text);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen
      title="AI coach"
      subtitle="Interview feedback from the same AI service as web."
    >
      <Panel>
        <TextInput
          value={message}
          onChangeText={setMessage}
          multiline
          className="min-h-24 rounded-md bg-background p-3 text-foreground"
          placeholderTextColor="#99a3b3"
        />
        <TouchableOpacity
          onPress={submit}
          className="mt-3 rounded-md bg-primary p-3"
        >
          <Text className="text-center font-bold text-[#062016]">
            {loading ? "Thinking..." : "Ask AI"}
          </Text>
        </TouchableOpacity>
      </Panel>
      {reply ? (
        <Panel>
          <Text className="text-sm leading-6 text-foreground">{reply}</Text>
        </Panel>
      ) : null}
    </Screen>
  );
}
