import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { useTheme } from "../context/ThemeContext";

export default function AiScreen() {
  const { darkMode } = useTheme();

  const [goal, setGoal] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const background = darkMode ? "#000000" : "#F5F7FB";
  const cardBg = darkMode ? "#111111" : "#FFFFFF";
  const titleColor = darkMode ? "#FFFFFF" : "#23404E";
  const subtitleColor = darkMode ? "#A6A6A6" : "#66737D";
  const inputBorder = darkMode ? "#444444" : "#CCD6DD";
  const inputText = darkMode ? "#EEEEEE" : "#333333";
  const placeholderColor = darkMode ? "#777777" : "#999999";
  const resultBorder = darkMode ? "#4CAF50" : "#2E7D32";
  const resultTextColor = darkMode ? "#EDEDED" : "#23404E";

  async function getAiTips() {
    Keyboard.dismiss(); // 👈 Auto-hide keyboard

    if (!goal.trim()) {
      setResponse("Please type a goal first 🙂");
      return;
    }

    // Safety filter
    const forbidden = [
      "gun","weapon","shoot","kill","drugs","suicide","sex","porn",
      "hack","fraud","scam","casino","gamble","bet"
    ];
    const lowered = goal.toLowerCase();
    if (forbidden.some((w) => lowered.includes(w))) {
      setResponse("🚫 Bloom AI can only help with healthy habits & self-care.");
      return;
    }

    setLoading(true);
    setResponse("Bloom coach is thinking… 🤖⏳");

    setTimeout(() => {
      setLoading(false);
      setResponse(generateTip(goal));
    }, 700);
  }

  function generateTip(input: string): string {
    const g = input.toLowerCase();

    if (g.includes("sleep"))
      return "😴 Try setting a fixed sleep schedule and avoiding screens 30 minutes before bed.";

    if (g.includes("water") || g.includes("hydrate"))
      return "💧 Drink one full glass of water when you wake up for an easy hydration win.";

    if (g.includes("stress") || g.includes("anxiety"))
      return "🧘 Take 3 deep slow breaths to quickly reduce your stress level.";

    if (g.includes("gym") || g.includes("exercise"))
      return "🏋️ Start small: 10 minutes of activity daily beats one big workout a week.";

    if (g.includes("focus") || g.includes("study"))
      return "📚 Try a 25min focus + 5min break cycle. It boosts productivity.";

    return "🌱 Pick one tiny daily action related to your goal. Small steps build habits fast.";
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: background }]}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.title, { color: titleColor }]}>AI Suggestions 🤖</Text>
          <Text style={[styles.subtitle, { color: subtitleColor }]}>
            Tell Bloom what you want to improve.
          </Text>

          <TextInput
            style={[
              styles.input,
              { borderColor: inputBorder, backgroundColor: cardBg, color: inputText },
            ]}
            placeholder="Example: Improve my sleep + drink more water"
            placeholderTextColor={placeholderColor}
            value={goal}
            onChangeText={setGoal}
            multiline
            blurOnSubmit
            returnKeyType="done"
            onSubmitEditing={Keyboard.dismiss}
          />

          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.6 }]}
            onPress={getAiTips}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Thinking…" : "Get Tips"}
            </Text>
          </TouchableOpacity>

          {response !== "" && (
            <ScrollView
              style={[
                styles.resultBox,
                { backgroundColor: cardBg, borderColor: resultBorder },
              ]}
            >
              <Text style={[styles.resultText, { color: resultTextColor }]}>
                {response}
              </Text>
            </ScrollView>
          )}
        </ScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 40,
  },
  title: { fontSize: 26, fontWeight: "700", marginLeft: 16 },
  subtitle: { marginTop: 4, marginBottom: 16, marginLeft: 16 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    minHeight: 80,
    textAlignVertical: "top",
    fontSize: 15,
    marginBottom: 12,
  },
  button: {
    marginTop: 12,
    backgroundColor: "#2E7D32",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  resultBox: {
    marginTop: 16,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  resultText: { fontSize: 15, lineHeight: 22 },
});
