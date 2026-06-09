import React, { useEffect, useState, useCallback } from "react";
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

const BASE_LOGS_KEY = "bloom_daily_logs";

type DayLog = {
  id: string;
  date: string;   // "YYYY-MM-DD"
  mood: string;
  energy: string;
  stress: string;
  note: string;
};

export default function HistoryScreen() {
  const { darkMode } = useTheme();
  const { user } = useAuth();

  // per-user key, same pattern as LogScreen
  const logsKey = user ? `${BASE_LOGS_KEY}_${user.uid}` : BASE_LOGS_KEY;

  const [logs, setLogs] = useState<DayLog[]>([]);
  const [loading, setLoading] = useState(true);

  const background = darkMode ? "#000000" : "#F5F7FB";
  const cardBg = darkMode ? "#111111" : "#FFFFFF";
  const titleColor = darkMode ? "#FFFFFF" : "#23404E";
  const subtitleColor = darkMode ? "#A6A6A6" : "#66737D";
  const textColor = darkMode ? "#EDEDED" : "#23404E";
  const subText = darkMode ? "#A0A0A0" : "#66737D";
  const barTrack = darkMode ? "#222222" : "#E0E7EF";
  const barFillMood = darkMode ? "#FFCA28" : "#FFB300";
  const barFillEnergy = darkMode ? "#42A5F5" : "#1E88E5";
  const barFillStress = darkMode ? "#EF5350" : "#E53935";

  // load logs from storage
  const loadLogs = useCallback(async () => {
    try {
      setLoading(true);
      const raw = await AsyncStorage.getItem(logsKey);
      if (raw) {
        const parsed: DayLog[] = JSON.parse(raw);
        // store sorted newest → oldest
        const sorted = [...parsed].sort((a, b) => {
          if (a.date === b.date) {
            return b.id.localeCompare(a.id);
          }
          return b.date.localeCompare(a.date);
        });
        setLogs(sorted);
      } else {
        setLogs([]);
      }
    } catch (e) {
      console.log("Error loading history logs", e);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [logsKey]);

  // 1) when component mounts / user changes
  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  // 2) whenever History tab comes into focus
  useFocusEffect(
    useCallback(() => {
      loadLogs();
    }, [loadLogs])
  );

  // 📊 ALL logs from the last 7 days (not grouped by date)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 6); // today + previous 6 days

  function parseDate(dateStr: string) {
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  const last7Logs = logs
    .filter((log) => {
      const d = parseDate(log.date);
      return d >= sevenDaysAgo && d <= today;
    })
    .sort((a, b) => {
      if (a.date === b.date) {
        // same day → newest log first
        return b.id.localeCompare(a.id);
      }
      // newer dates first
      return b.date.localeCompare(a.date);
    });

  const renderRow = ({ item }: { item: DayLog }) => {
    const mood = Number(item.mood) || 0;
    const energy = Number(item.energy) || 0;
    const stress = Number(item.stress) || 0;

    const moodWidth = `${Math.min(10, Math.max(0, mood)) * 10}%`;
    const energyWidth = `${Math.min(10, Math.max(0, energy)) * 10}%`;
    const stressWidth = `${Math.min(10, Math.max(0, stress)) * 10}%`;

    return (
      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <Text style={[styles.date, { color: textColor }]}>{item.date}</Text>
        <Text style={[styles.line, { color: subText }]}>
          Mood: <Text style={styles.bold}>{mood || "-"} / 10</Text> · Energy:{" "}
          <Text style={styles.bold}>{energy || "-"} / 10</Text> · Stress:{" "}
          <Text style={styles.bold}>{stress || "-"} / 10</Text>
        </Text>

        {/* mini bars */}
        <View style={styles.barRow}>
          <Text style={[styles.barLabel, { color: subText }]}>Mood</Text>
          <View style={[styles.barTrack, { backgroundColor: barTrack }]}>
            <View
              style={[
                styles.barFill,
                { width: moodWidth, backgroundColor: barFillMood },
              ]}
            />
          </View>
        </View>

        <View style={styles.barRow}>
          <Text style={[styles.barLabel, { color: subText }]}>Energy</Text>
          <View style={[styles.barTrack, { backgroundColor: barTrack }]}>
            <View
              style={[
                styles.barFill,
                { width: energyWidth, backgroundColor: barFillEnergy },
              ]}
            />
          </View>
        </View>

        <View style={styles.barRow}>
          <Text style={[styles.barLabel, { color: subText }]}>Stress</Text>
          <View style={[styles.barTrack, { backgroundColor: barTrack }]}>
            <View
              style={[
                styles.barFill,
                { width: stressWidth, backgroundColor: barFillStress },
              ]}
            />
          </View>
        </View>

        {item.note ? (
          <Text style={[styles.note, { color: subText }]}>{item.note}</Text>
        ) : null}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: background }]}>
      <Text style={[styles.title, { color: titleColor }]}>
        History & Insights 📈
      </Text>
      <Text style={[styles.subtitle, { color: subtitleColor }]}>
        Last 7 days of mood, energy, and stress (all entries).
      </Text>

      {loading ? (
        <Text style={{ marginTop: 16, marginLeft: 16, color: subtitleColor }}>
          Loading history…
        </Text>
      ) : last7Logs.length === 0 ? (
        <Text style={{ marginTop: 20, marginLeft: 16, color: subtitleColor }}>
          No logs in the last 7 days. Save a log on the{" "}
          <Text style={{ fontWeight: "600" }}>Log</Text> tab.
        </Text>
      ) : (
        <FlatList
          data={last7Logs}
          keyExtractor={(item) => item.id}
          renderItem={renderRow}
          contentContainerStyle={{
            paddingTop: 8,
            paddingBottom: 80,
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginLeft: 16,
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 12,
    marginLeft: 16,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginTop: 14,
    marginHorizontal: 8,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  date: {
    fontWeight: "700",
    marginBottom: 4,
  },
  line: {
    marginBottom: 8,
    fontSize: 13,
  },
  bold: {
    fontWeight: "600",
  },
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  barLabel: {
    width: 60,
    fontSize: 12,
  },
  barTrack: {
    flex: 1,
    height: 8,
    borderRadius: 999,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 999,
  },
  note: {
    marginTop: 8,
    fontSize: 12,
  },
});
