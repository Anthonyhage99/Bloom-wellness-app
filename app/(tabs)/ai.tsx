import React, { useEffect, useState } from "react";
import {
  Keyboard,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  BloomButton,
  BloomCard,
  BloomChip,
  BloomScreen,
  BloomText,
  useBloomColors,
} from "@/components/bloom-ui";

const QUICK_TOPICS = ["Water", "Food", "Fitness", "Sleep", "Stress", "Focus"];
const QUICK_PROMPTS = [
  "What should I eat before the gym?",
  "Give me a quick workout",
  "I feel stressed",
  "How can I sleep better?",
];
const COACH_HISTORY_KEY = "bloom_ai_coach_history";

type CoachMode = "Gentle" | "Strict" | "Motivational";
type CoachHistoryItem = {
  question: string;
  answer: string;
};

export default function AiScreen() {
  const colors = useBloomColors();
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<CoachMode>("Gentle");
  const [history, setHistory] = useState<CoachHistoryItem[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(COACH_HISTORY_KEY);
        setHistory(raw ? JSON.parse(raw) : []);
      } catch (e) {
        console.log("Error loading AI Coach history", e);
      }
    })();
  }, []);

  async function getCoachTips() {
    Keyboard.dismiss();

    if (!question.trim()) {
      setResponse(
        "Ask me anything about food, fitness, water, sleep, stress, focus, or healthy routines."
      );
      return;
    }

    const lowered = question.toLowerCase();
    const forbidden = [
      "gun",
      "weapon",
      "shoot",
      "kill",
      "drugs",
      "suicide",
      "sex",
      "porn",
      "hack",
      "fraud",
      "scam",
      "casino",
      "gamble",
      "bet",
    ];

    if (forbidden.some((word) => lowered.includes(word))) {
      setResponse("AI Coach can only help with healthy habits and self-care.");
      return;
    }

    setLoading(true);
    setResponse("Thinking of a simple next step...");

    setTimeout(() => {
      const answer = generateAdvice(question, mode);
      setLoading(false);
      setResponse(answer);
      saveHistory(question, answer);
    }, 450);
  }

  async function saveHistory(prompt: string, answer: string) {
    const next = [{ question: prompt.trim(), answer }, ...history].slice(0, 3);
    setHistory(next);
    try {
      await AsyncStorage.setItem(COACH_HISTORY_KEY, JSON.stringify(next));
    } catch (e) {
      console.log("Error saving AI Coach history", e);
    }
  }

  function generateAdvice(input: string, selectedMode: CoachMode): string {
    const text = input.toLowerCase();
    const prefix =
      selectedMode === "Gentle"
        ? "Gentle coach:"
        : selectedMode === "Strict"
          ? "Strict coach:"
          : "Motivational coach:";
    const closer =
      selectedMode === "Gentle"
        ? "Keep it small and doable."
        : selectedMode === "Strict"
          ? "Do it today before you negotiate with yourself."
          : "You can stack this win right now.";

    if (matches(text, ["water", "hydrate", "hydration", "thirsty"])) {
      return `Water advice. ${prefix} Drink a glass when you wake up, then take a few sips every time you switch tasks. If plain water is boring, add lemon, cucumber, or ice. ${closer}`;
    }

    if (matches(text, ["food", "eat", "meal", "diet", "nutrition", "hungry"])) {
      return `Food advice. ${prefix} Build meals around protein, fiber, and color. Example: eggs or chicken, rice or potatoes, and a fruit or vegetable. ${closer}`;
    }

    if (matches(text, ["snack", "craving", "sugar", "chips"])) {
      return `Snack advice. ${prefix} Try a snack with protein or fiber first: Greek yogurt, nuts, fruit, eggs, or a turkey sandwich. ${closer}`;
    }

    if (matches(text, ["fitness", "gym", "workout", "exercise", "run", "lift"])) {
      return `Fitness advice. ${prefix} Do 10 minutes today: walk, stretch, push-ups, or one easy gym circuit. Consistency beats destroying yourself once a week. ${closer}`;
    }

    if (matches(text, ["sleep", "tired", "bed", "wake", "insomnia"])) {
      return `Sleep advice. ${prefix} Pick one wind-down cue tonight. Dim lights, put your phone away, and do the same 10-minute routine before bed. ${closer}`;
    }

    if (matches(text, ["stress", "anxiety", "overwhelmed", "worried"])) {
      return `Stress advice. ${prefix} Do a 60-second reset. Inhale for 4, hold for 2, exhale for 6. Then write one thing you can control right now and do only that first. ${closer}`;
    }

    if (matches(text, ["focus", "study", "homework", "productive", "procrastinate"])) {
      return `Focus advice. ${prefix} Set a 25-minute timer, choose one task, and put your phone out of reach. When the timer ends, take a real 5-minute break. ${closer}`;
    }

    if (matches(text, ["skin", "skincare", "face", "acne"])) {
      return `Skincare advice. ${prefix} Keep the routine boring and repeatable: gentle cleanser, moisturizer, and sunscreen in the morning. Do not add five new products at once. ${closer}`;
    }

    if (matches(text, ["habit", "routine", "consistent", "discipline"])) {
      return `Habit advice. ${prefix} Make the habit smaller until it feels almost too easy. Two minutes daily is better than a huge plan you avoid. Attach it to something you already do. ${closer}`;
    }

    return `AI Coach answer. ${prefix} Choose one healthy action that takes under two minutes and do it today. Ask about water, food, fitness, sleep, stress, focus, or routines for more specific advice. ${closer}`;
  }

  function matches(text: string, words: string[]) {
    return words.some((word) => text.includes(word));
  }

  return (
    <BloomScreen>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <BloomText variant="hero">AI Coach</BloomText>
          <BloomText muted style={styles.subtitle}>
            Ask for a small next step in food, fitness, sleep, stress, water,
            or focus.
          </BloomText>

          <BloomCard>
            <BloomText variant="section">What do you want help with?</BloomText>
            <BloomText muted style={styles.cardCopy}>
              {
                'Try questions like "How can I drink more water?", "What should I eat before the gym?", or "How do I focus better?"'
              }
            </BloomText>

            <View style={styles.quickRow}>
              {QUICK_TOPICS.map((item) => (
                <BloomChip
                  key={item}
                  label={item}
                  active={question.toLowerCase().includes(item.toLowerCase())}
                  onPress={() => setQuestion(item)}
                />
              ))}
            </View>

            <BloomText variant="label" style={styles.modeLabel}>
              Coach mood
            </BloomText>
            <View style={styles.quickRow}>
              {(["Gentle", "Strict", "Motivational"] as CoachMode[]).map(
                (item) => (
                  <BloomChip
                    key={item}
                    label={item}
                    active={mode === item}
                    onPress={() => setMode(item)}
                  />
                )
              )}
            </View>

            <BloomText variant="label" style={styles.modeLabel}>
              Quick prompts
            </BloomText>
            <View style={styles.promptStack}>
              {QUICK_PROMPTS.map((prompt) => (
                <BloomButton
                  key={prompt}
                  variant="secondary"
                  style={styles.promptButton}
                  onPress={() => setQuestion(prompt)}
                >
                  {prompt}
                </BloomButton>
              ))}
            </View>

            <BloomText variant="label" style={styles.inputLabel}>
              Your question
            </BloomText>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.surfaceMuted,
                  color: colors.text,
                },
              ]}
              placeholder="Ask about water, meals, workouts, sleep, stress..."
              placeholderTextColor={colors.muted}
              value={question}
              onChangeText={setQuestion}
              multiline
              textAlignVertical="top"
            />

            <BloomButton
              style={styles.button}
              onPress={getCoachTips}
              disabled={loading}
            >
              {loading ? "Thinking..." : "Ask AI Coach"}
            </BloomButton>
          </BloomCard>

          {response ? (
            <BloomCard muted style={styles.responseCard}>
              <BloomText variant="label" muted>
                Coach note
              </BloomText>
              <BloomText style={styles.responseText}>{response}</BloomText>
            </BloomCard>
          ) : null}

          {history.length > 0 ? (
            <BloomCard style={styles.historyCard}>
              <BloomText variant="section">Recent coach notes</BloomText>
              {history.map((item, index) => (
                <View key={`${item.question}-${index}`} style={styles.historyItem}>
                  <BloomText variant="label">{item.question}</BloomText>
                  <BloomText muted variant="small">
                    {item.answer}
                  </BloomText>
                </View>
              ))}
            </BloomCard>
          ) : null}
        </ScrollView>
      </TouchableWithoutFeedback>
    </BloomScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 90,
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 16,
  },
  cardCopy: {
    marginTop: 6,
  },
  quickRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
  },
  modeLabel: {
    marginTop: 16,
  },
  promptStack: {
    gap: 8,
    marginTop: 10,
  },
  promptButton: {
    minHeight: 42,
  },
  inputLabel: {
    marginTop: 18,
    marginBottom: 8,
  },
  input: {
    minHeight: 116,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    lineHeight: 21,
  },
  button: {
    marginTop: 16,
  },
  responseCard: {
    marginTop: 14,
  },
  responseText: {
    marginTop: 6,
  },
  historyCard: {
    marginTop: 14,
  },
  historyItem: {
    marginTop: 12,
  },
});
