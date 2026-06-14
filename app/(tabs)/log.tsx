import React, { useEffect, useState } from "react";
import {
  Alert,
  Keyboard,
  ScrollView,
  StyleSheet,
  TextInput,
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
import { useAuth } from "@/context/AuthContext";

const BASE_LOGS_KEY = "bloom_daily_logs";
const SCORES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

type DayLog = {
  id: string;
  date: string;
  mood: string;
  energy: string;
  stress: string;
  note: string;
};

export default function LogScreen() {
  const { user } = useAuth();
  const colors = useBloomColors();
  const logsKey = user ? `${BASE_LOGS_KEY}_${user.uid}` : BASE_LOGS_KEY;

  const [mood, setMood] = useState("");
  const [energy, setEnergy] = useState("");
  const [stress, setStress] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("");
  const [logs, setLogs] = useState<DayLog[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(logsKey);
        setLogs(raw ? JSON.parse(raw) : []);
      } catch (e) {
        console.log("Error loading logs", e);
        setLogs([]);
      }
    })();
  }, [logsKey]);

  async function saveLog() {
    Keyboard.dismiss();

    if (!mood || !energy || !stress) {
      Alert.alert("Finish your check-in", "Choose mood, energy, and stress scores.");
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const newLog: DayLog = {
      id: `${today}_${Date.now()}`,
      date: today,
      mood,
      energy,
      stress,
      note: note.trim(),
    };

    const updated = [newLog, ...logs];
    setLogs(updated);
    await AsyncStorage.setItem(logsKey, JSON.stringify(updated));

    setStatus(
      `Saved: Mood ${mood}/10 (${scoreLabel(Number(mood))}), Energy ${energy}/10 (${scoreLabel(Number(energy))}), Stress ${stress}/10 (${scoreLabel(Number(stress))}).`
    );
    setMood("");
    setEnergy("");
    setStress("");
    setNote("");
  }

  function ScoreRow({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: string;
    onChange: (next: string) => void;
  }) {
    return (
      <View style={styles.scoreBlock}>
        <View style={styles.scoreHeader}>
          <BloomText variant="label">{label}</BloomText>
          <BloomText muted variant="small">
            {value ? `${value}/10 - ${scoreLabel(Number(value))}` : "Choose"}
          </BloomText>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.scoreRow}>
            {SCORES.map((score) => (
              <BloomChip
                key={score}
                label={String(score)}
                active={value === String(score)}
                onPress={() => onChange(String(score))}
                style={styles.scoreChip}
              />
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <BloomScreen>
      <ScrollView
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <BloomText variant="hero">How are you feeling?</BloomText>
        <BloomText muted style={styles.subtitle}>
          A quick check-in helps you notice your patterns.
        </BloomText>

        <BloomCard>
          <ScoreRow label="Mood" value={mood} onChange={setMood} />
          <ScoreRow label="Energy" value={energy} onChange={setEnergy} />
          <ScoreRow label="Stress" value={stress} onChange={setStress} />

          <BloomText variant="label" style={styles.noteLabel}>
            Notes
          </BloomText>
          <TextInput
            style={[
              styles.noteInput,
              {
                borderColor: colors.border,
                backgroundColor: colors.surfaceMuted,
                color: colors.text,
              },
            ]}
            placeholder="What shaped your day?"
            placeholderTextColor={colors.muted}
            multiline
            textAlignVertical="top"
            value={note}
            onChangeText={setNote}
          />

          <BloomButton style={styles.saveButton} onPress={saveLog}>
            Save my check-in
          </BloomButton>
        </BloomCard>

        {status ? (
          <BloomCard muted style={styles.statusCard}>
            <BloomText>{status}</BloomText>
          </BloomCard>
        ) : null}
      </ScrollView>
    </BloomScreen>
  );
}

function scoreLabel(value: number) {
  if (value <= 3) return "low";
  if (value <= 7) return "medium";
  return "high";
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 90,
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 16,
  },
  scoreBlock: {
    marginBottom: 16,
  },
  scoreHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  scoreRow: {
    flexDirection: "row",
    gap: 8,
  },
  scoreChip: {
    minWidth: 38,
  },
  noteLabel: {
    marginTop: 2,
    marginBottom: 8,
  },
  noteInput: {
    minHeight: 104,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    lineHeight: 21,
  },
  saveButton: {
    marginTop: 16,
  },
  statusCard: {
    marginTop: 14,
  },
});
