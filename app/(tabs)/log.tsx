import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

const LOGS_KEY = "bloom_daily_logs"; // fallback if somehow no user

type DayLog = {
  id: string;
  date: string;
  mood: string;
  energy: string;
  stress: string;
  note: string;
};

export default function LogScreen() {
  const { darkMode } = useTheme();
  const { user } = useAuth();

  // 🔑 per-user key (so each account has its own logs)
  const logsKey = user ? `bloom_daily_logs_${user.uid}` : LOGS_KEY;

  const background = darkMode ? "#000000" : "#F5F7FB";
  const cardBg = darkMode ? "#111111" : "#FFFFFF";
  const titleColor = darkMode ? "#FFFFFF" : "#23404E";
  const subtitleColor = darkMode ? "#A6A6A6" : "#66737D";
  const inputBorder = darkMode ? "#444444" : "#CCD6DD";
  const inputText = darkMode ? "#EEEEEE" : "#333333";
  const placeholderColor = darkMode ? "#777777" : "#999999";
  const resetBorder = "#D32F2F";
  const resetText = darkMode ? "#FF6F6F" : "#D32F2F";

  const [mood, setMood] = useState("");
  const [energy, setEnergy] = useState("");
  const [stress, setStress] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("");
  const [logs, setLogs] = useState<DayLog[]>([]);

  // Load logs whenever the active user (and thus logsKey) changes
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(logsKey);
        if (raw) {
          setLogs(JSON.parse(raw));
        } else {
          setLogs([]);
        }
      } catch (e) {
        console.log("Error loading logs", e);
        setLogs([]);
      }
    })();
  }, [logsKey]);

  async function saveLog() {
    Keyboard.dismiss();

    const today = new Date().toISOString().slice(0, 10);

    const newLog: DayLog = {
      id: today + "_" + Date.now(),
      date: today,
      mood,
      energy,
      stress,
      note,
    };

    const updated = [newLog, ...logs];
    setLogs(updated);
    await AsyncStorage.setItem(logsKey, JSON.stringify(updated));

    setStatus("✅ Daily log saved!");
    setMood("");
    setEnergy("");
    setStress("");
    setNote("");
  }

  async function clearLogs() {
    Alert.alert("Reset all logs?", "This will delete all logs forever.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reset",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem(logsKey);
          setLogs([]);
          setStatus("🧹 All logs cleared.");
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: background }]}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          <Text style={[styles.title, { color: titleColor }]}>Daily Log 📝</Text>
          <Text style={[styles.subtitle, { color: subtitleColor }]}>
            Track how you feel today.
          </Text>

          {/* MOOD */}
          <Text style={[styles.label, { color: titleColor }]}>Mood (1–10)</Text>
          <TextInput
            style={[
              styles.input,
              { borderColor: inputBorder, backgroundColor: cardBg, color: inputText },
            ]}
            placeholder="e.g., 7"
            placeholderTextColor={placeholderColor}
            keyboardType="numeric"
            value={mood}
            onChangeText={setMood}
            returnKeyType="next"
          />

          {/* ENERGY */}
          <Text style={[styles.label, { color: titleColor }]}>Energy (1–10)</Text>
          <TextInput
            style={[
              styles.input,
              { borderColor: inputBorder, backgroundColor: cardBg, color: inputText },
            ]}
            placeholder="e.g., 6"
            placeholderTextColor={placeholderColor}
            keyboardType="numeric"
            value={energy}
            onChangeText={setEnergy}
            returnKeyType="next"
          />

          {/* STRESS */}
          <Text style={[styles.label, { color: titleColor }]}>Stress (1–10)</Text>
          <TextInput
            style={[
              styles.input,
              { borderColor: inputBorder, backgroundColor: cardBg, color: inputText },
            ]}
            placeholder="e.g., 4"
            placeholderTextColor={placeholderColor}
            keyboardType="numeric"
            value={stress}
            onChangeText={setStress}
            returnKeyType="next"
          />

          {/* NOTES */}
          <Text style={[styles.label, { color: titleColor }]}>Notes</Text>
          <TextInput
            style={[
              styles.input,
              {
                borderColor: inputBorder,
                backgroundColor: cardBg,
                color: inputText,
                minHeight: 80,
              },
            ]}
            placeholder="Anything that affected your day..."
            placeholderTextColor={placeholderColor}
            multiline
            textAlignVertical="top"
            value={note}
            onChangeText={setNote}
            returnKeyType="done"
            blurOnSubmit
            onSubmitEditing={Keyboard.dismiss}
          />

          <TouchableOpacity style={styles.button} onPress={saveLog}>
            <Text style={styles.buttonText}>Save Log</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.resetButton, { borderColor: resetBorder, backgroundColor: cardBg }]}
            onPress={clearLogs}
          >
            <Text style={[styles.resetButtonText, { color: resetText }]}>
              Reset / Clear All Logs
            </Text>
          </TouchableOpacity>

          {status !== "" && (
            <Text style={[styles.status, { color: titleColor }]}>{status}</Text>
          )}
        </ScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 32 },
  title: { fontSize: 26, fontWeight: "700", marginLeft: 16 },
  subtitle: { marginTop: 4, marginBottom: 16, marginLeft: 16 },
  label: { marginTop: 10, marginLeft: 8, marginBottom: 4, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 8,
    marginBottom: 12,
  },
  button: {
    marginTop: 18,
    marginHorizontal: 8,
    backgroundColor: "#2E7D32",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: { color: "white", fontSize: 16, fontWeight: "600" },
  resetButton: {
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 12,
    marginHorizontal: 8,
    alignItems: "center",
  },
  resetButtonText: { fontWeight: "600" },
  status: { marginTop: 12, marginLeft: 8, fontWeight: "500" },
});
