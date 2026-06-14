import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

import {
  BloomCard,
  BloomScreen,
  BloomText,
  useBloomColors,
} from "@/components/bloom-ui";
import { useAuth } from "@/context/AuthContext";

const BASE_LOGS_KEY = "bloom_daily_logs";

type DayLog = {
  id: string;
  date: string;
  mood: string;
  energy: string;
  stress: string;
  note: string;
};

export default function HistoryScreen() {
  const { user } = useAuth();
  const colors = useBloomColors();
  const logsKey = user ? `${BASE_LOGS_KEY}_${user.uid}` : BASE_LOGS_KEY;

  const [logs, setLogs] = useState<DayLog[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true);
      const raw = await AsyncStorage.getItem(logsKey);
      const parsed: DayLog[] = raw ? JSON.parse(raw) : [];
      setLogs(
        [...parsed].sort((a, b) =>
          a.date === b.date ? b.id.localeCompare(a.id) : b.date.localeCompare(a.date)
        )
      );
    } catch (e) {
      console.log("Error loading history logs", e);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [logsKey]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  useFocusEffect(
    useCallback(() => {
      loadLogs();
    }, [loadLogs])
  );

  const last7Logs = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);

    return logs.filter((log) => {
      const d = parseLocalDate(log.date);
      return d >= sevenDaysAgo && d <= today;
    });
  }, [logs]);

  const averages = useMemo(() => {
    const count = last7Logs.length || 1;
    const sum = last7Logs.reduce(
      (acc, log) => ({
        mood: acc.mood + Number(log.mood || 0),
        energy: acc.energy + Number(log.energy || 0),
        stress: acc.stress + Number(log.stress || 0),
      }),
      { mood: 0, energy: 0, stress: 0 }
    );

    return {
      mood: last7Logs.length ? (sum.mood / count).toFixed(1) : "-",
      energy: last7Logs.length ? (sum.energy / count).toFixed(1) : "-",
      stress: last7Logs.length ? (sum.stress / count).toFixed(1) : "-",
    };
  }, [last7Logs]);

  const trendMessage = useMemo(() => {
    if (last7Logs.length < 2) {
      return "Save more check-ins to unlock trend feedback.";
    }

    const newest = last7Logs[0];
    const oldest = last7Logs[last7Logs.length - 1];
    const moodDelta = Number(newest.mood) - Number(oldest.mood);
    const energyDelta = Number(newest.energy) - Number(oldest.energy);
    const stressDelta = Number(newest.stress) - Number(oldest.stress);

    if (stressDelta < 0) return "Your stress is trending lower. Nice progress.";
    if (moodDelta > 0) return "Your mood is trending up this week.";
    if (energyDelta > 0) return "Your energy is improving compared with earlier logs.";
    return "Your week is steady. Keep checking in to spot patterns.";
  }, [last7Logs]);

  const renderRow = ({ item }: { item: DayLog }) => {
    const mood = Number(item.mood) || 0;
    const energy = Number(item.energy) || 0;
    const stress = Number(item.stress) || 0;

    return (
      <BloomCard style={styles.logCard}>
        <BloomText variant="section">{formatDate(item.date)}</BloomText>
        <View style={styles.metricsRow}>
          <Metric label="Mood" value={mood} color={colors.accent} />
          <Metric label="Energy" value={energy} color={colors.primary} />
          <Metric label="Stress" value={stress} color={colors.danger} />
        </View>
        {item.note ? (
          <BloomText muted style={styles.note}>
            {item.note}
          </BloomText>
        ) : null}
      </BloomCard>
    );
  };

  function Metric({
    label,
    value,
    color,
  }: {
    label: string;
    value: number;
    color: string;
  }) {
    return (
      <View style={styles.metric}>
        <BloomText muted variant="small">
          {label}
        </BloomText>
        <BloomText variant="label">{value || "-"}/10</BloomText>
        <BloomText muted variant="small">
          {value ? scoreLabel(value) : "no score"}
        </BloomText>
        <View style={[styles.barTrack, { backgroundColor: colors.surfaceMuted }]}>
          <View
            style={[
              styles.barFill,
              { width: `${Math.min(Math.max(value, 0), 10) * 10}%`, backgroundColor: color },
            ]}
          />
        </View>
      </View>
    );
  }

  return (
    <BloomScreen>
      <FlatList
        data={loading ? [] : last7Logs}
        keyExtractor={(item) => item.id}
        renderItem={renderRow}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <BloomText variant="hero">Your Patterns</BloomText>
            <BloomText muted style={styles.subtitle}>
              A calm look at your last 7 days.
            </BloomText>

            <BloomCard style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Summary label="Mood" value={averages.mood} />
                <Summary label="Energy" value={averages.energy} />
                <Summary label="Stress" value={averages.stress} />
              </View>
            </BloomCard>

            <BloomCard muted style={styles.trendCard}>
              <BloomText variant="label" muted>
                What Bloom notices
              </BloomText>
              <BloomText>{trendMessage}</BloomText>
            </BloomCard>

            {loading ? (
              <BloomText muted style={styles.emptyText}>
                Loading history...
              </BloomText>
            ) : last7Logs.length === 0 ? (
              <BloomCard muted style={styles.emptyCard}>
                <BloomText variant="section">No logs yet</BloomText>
                <BloomText muted>
                  Save a check-in on the Log tab to start seeing trends.
                </BloomText>
              </BloomCard>
            ) : (
              <BloomText variant="section" style={styles.sectionHeading}>
                Recent reflections
              </BloomText>
            )}
          </View>
        }
        contentContainerStyle={styles.content}
      />
    </BloomScreen>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryItem}>
      <BloomText variant="title">{value}</BloomText>
      <BloomText muted variant="small">
        Avg {label}
      </BloomText>
    </View>
  );
}

function parseLocalDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDate(dateStr: string) {
  return parseLocalDate(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
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
  summaryCard: {
    marginBottom: 12,
  },
  trendCard: {
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryItem: {
    flex: 1,
  },
  sectionHeading: {
    marginBottom: 2,
  },
  emptyText: {
    marginTop: 12,
  },
  emptyCard: {
    marginTop: 4,
  },
  logCard: {
    marginTop: 10,
  },
  metricsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  metric: {
    flex: 1,
  },
  barTrack: {
    height: 7,
    borderRadius: 999,
    overflow: "hidden",
    marginTop: 6,
  },
  barFill: {
    height: "100%",
    borderRadius: 999,
  },
  note: {
    marginTop: 12,
  },
});
