// app/(tabs)/index.tsx
import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../context/ThemeContext";

const HABITS_KEY = "bloom_habits_v2";

// 🎮 Level-based habits
const initialHabits = [
  // LEVEL 1 – FOUNDATIONS
  {
    id: "l1_water",
    name: "Drink water (5oz / small bottle)",
    level: 1 as const,
    streak: 3,
    count: 0,
  },
  {
    id: "l1_sleep",
    name: "Sleep before 12 AM (7–8 hrs)",
    level: 1 as const,
    streak: 4,
    count: 0,
  },
  {
    id: "l1_reading",
    name: "Reading (10–15 minutes)",
    level: 1 as const,
    streak: 2,
    count: 0,
  },
  {
    id: "l1_movement",
    name: "Movement (walk / gym / sports)",
    level: 1 as const,
    streak: 1,
    count: 0,
  },
  {
    id: "l1_breath",
    name: "Breathing / mindfulness (3–5 min)",
    level: 1 as const,
    streak: 1,
    count: 0,
  },

  // LEVEL 2 – LIFESTYLE UPGRADES
  {
    id: "l2_meal",
    name: "Healthy meal (balanced plate)",
    level: 2 as const,
    streak: 2,
    count: 0,
  },
  {
    id: "l2_skincare",
    name: "Skincare routine (AM or PM)",
    level: 2 as const,
    streak: 1,
    count: 0,
  },
  {
    id: "l2_plan",
    name: "Plan your day (2 minutes)",
    level: 2 as const,
    streak: 3,
    count: 0,
  },
  {
    id: "l2_screen_break",
    name: "Screen break (15 min, no phone)",
    level: 2 as const,
    streak: 1,
    count: 0,
  },
  {
    id: "l2_vitamins",
    name: "Take vitamins / supplements",
    level: 2 as const,
    streak: 2,
    count: 0,
  },

  // LEVEL 3 – HIGH-VALUE DISCIPLINE
  {
    id: "l3_skill",
    name: "Skill learning (10–15 min)",
    level: 3 as const,
    streak: 1,
    count: 0,
  },
  {
    id: "l3_tidy",
    name: "Tidy space (2-minute reset)",
    level: 3 as const,
    streak: 1,
    count: 0,
  },
  {
    id: "l3_fresh_air",
    name: "Step outside for fresh air",
    level: 3 as const,
    streak: 1,
    count: 0,
  },
  {
    id: "l3_no_social",
    name: "No social media window",
    level: 3 as const,
    streak: 1,
    count: 0,
  },
  {
    id: "l3_podcast",
    name: "Educational podcast / audio",
    level: 3 as const,
    streak: 1,
    count: 0,
  },
];

type Habit = (typeof initialHabits)[number];

const BLOOM_TIPS = [
  "💧 Even mild dehydration can hurt focus and memory. Keep a water bottle nearby.",
  "😴 A consistent sleep schedule beats one ‘perfect’ night. Try sleeping/waking at similar times.",
  "🍽️ Balanced meals with protein, healthy fats and fiber keep your energy steadier than sugar snacks.",
  "🚶‍♂️ Even a 5–10 minute walk can boost mood and clear your head when you feel stuck.",
  "🧠 Tiny habits done daily beat big goals you never start. Aim for 5–10 minute actions.",
  "📵 Turning off screens 20–30 minutes before bed can help you fall asleep faster.",
  "🧘‍♂️ Three slow deep breaths can calm your nervous system when you feel stressed.",
  "🥤Link water to habits: drink a few sips whenever you sit down to study or check your phone.",
];

export default function HomeScreen() {
  const { darkMode } = useTheme();

  const background = darkMode ? "#000000" : "#F5F7FB";
  const cardBg = darkMode ? "#1A1A1A" : "#FFFFFF";
  const titleColor = darkMode ? "#FFFFFF" : "#23404E";
  const subtitleColor = darkMode ? "#A6A6A6" : "#66737D";
  const habitTextColor = darkMode ? "#EDEDED" : "#23404E";
  const streakColor = darkMode ? "#BBBBBB" : "#66737D";
  const tipBorder = darkMode ? "#444444" : "#D0E4F5";
  const xpTrack = darkMode ? "#222222" : "#E0E7EF";
  const xpFill = darkMode ? "#66BB6A" : "#2E7D32";
  const tapHighlight = darkMode ? "#184D2A" : "#D6F5DD";

  const [habits, setHabits] = useState<Habit[]>(initialHabits);
  const [loading, setLoading] = useState(true);
  const [tipIndex, setTipIndex] = useState(0);
  const [selectedLevel, setSelectedLevel] = useState<1 | 2 | 3 | 4>(1);
  const [highlightedIds, setHighlightedIds] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(HABITS_KEY);
        if (raw) {
          const parsed: Habit[] = JSON.parse(raw);
          setHabits(parsed);
        } else {
          setHabits(initialHabits);
        }
      } catch (e) {
        console.log("Error loading habits", e);
        setHabits(initialHabits);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Rotate tips every 30s
  useEffect(() => {
    if (BLOOM_TIPS.length === 0) return;
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % BLOOM_TIPS.length);
    }, 30_000);
    return () => clearInterval(interval);
  }, []);

  async function saveHabits(next: Habit[]) {
    setHabits(next);
    try {
      await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(next));
    } catch (e) {
      console.log("Error saving habits", e);
    }
  }

  // Completion: % of habits that have count > 0 today
  const completedHabits = habits.filter((h) => (h.count ?? 0) > 0).length;
  const totalHabits = habits.length || 1;
  const completionPercent = Math.round((completedHabits / totalHabits) * 100);

  // Healthiness bar = total actions
  const totalActions = habits.reduce((sum, h) => sum + (h.count ?? 0), 0);
  const healthiness = totalActions;
  const fullBarAt = 20;
  const healthinessPercent = Math.max(
    0,
    Math.min(healthiness / fullBarAt, 1)
  );

  const visibleHabits: Habit[] =
    selectedLevel === 4
      ? []
      : habits.filter((h) => h.level === selectedLevel);

  function incrementHabit(id: string) {
    const updated = habits.map((h) =>
      h.id === id ? { ...h, count: (h.count ?? 0) + 1 } : h
    );
    saveHabits(updated);

    setHighlightedIds((prev) =>
      prev.includes(id) ? prev : [...prev, id]
    );
    setTimeout(() => {
      setHighlightedIds((prev) => prev.filter((x) => x !== id));
    }, 150);
  }

  function resetToday() {
    const reset = habits.map((h) => ({ ...h, count: 0 }));
    saveHabits(reset);
  }

  function handleTipPress() {
    if (BLOOM_TIPS.length === 0) return;
    setTipIndex((prev) => (prev + 1) % BLOOM_TIPS.length);
  }

  const renderHabit = ({ item }: { item: Habit }) => {
    const isHighlighted = highlightedIds.includes(item.id);

    return (
      <TouchableOpacity
        style={[
          styles.habitCard,
          { backgroundColor: isHighlighted ? tapHighlight : cardBg },
        ]}
        activeOpacity={0.9}
        onPress={() => incrementHabit(item.id)}
      >
        <View>
          <Text style={[styles.habitName, { color: habitTextColor }]}>
            {item.name}
          </Text>
          <Text style={[styles.habitStreak, { color: streakColor }]}>
            🔥 Streak: {item.streak} days
          </Text>
          <Text style={[styles.habitCount, { color: streakColor }]}>
            Today: {item.count ?? 0} times
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  function renderLevelTabs() {
    const levels = [
      { id: 1 as const, label: "Level 1" },
      { id: 2 as const, label: "Level 2" },
      { id: 3 as const, label: "Level 3" },
      { id: 4 as const, label: "Level 4" },
    ];

    return (
      <View style={styles.levelTabsRow}>
        {levels.map((lvl) => {
          const isActive = selectedLevel === lvl.id;
          return (
            <TouchableOpacity
              key={lvl.id}
              onPress={() => setSelectedLevel(lvl.id)}
              style={[
                styles.levelTab,
                {
                  borderColor: isActive
                    ? xpFill
                    : darkMode
                    ? "#333333"
                    : "#D0D7E2",
                  backgroundColor: isActive
                    ? darkMode
                      ? "#143D1E"
                      : "#E3F4E7"
                    : darkMode
                    ? "#111111"
                    : "#FFFFFF",
                },
              ]}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: isActive
                    ? darkMode
                      ? "#A5E7B4"
                      : "#1B5E20"
                    : subtitleColor,
                }}
              >
                {lvl.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: background }}>
      <FlatList
        data={loading ? [] : visibleHabits}
        keyExtractor={(item) => item.id}
        renderItem={renderHabit}
        ListHeaderComponent={
          <View>
            {/* 🌱 Bloom tip */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleTipPress}
              style={[
                styles.tipCard,
                { backgroundColor: cardBg, borderColor: tipBorder },
              ]}
            >
              <Text style={[styles.tipLabel, { color: subtitleColor }]}>
                Bloom tip
              </Text>
              <Text style={[styles.tipText, { color: habitTextColor }]}>
                {BLOOM_TIPS[tipIndex]}
              </Text>
            </TouchableOpacity>

            <Text style={[styles.appTitle, { color: titleColor }]}>
              Bloom 🌱
            </Text>
            <Text style={[styles.subtitle, { color: subtitleColor }]}>
              Self-care habit tracker
            </Text>

            <View style={[styles.dashboardCard, { backgroundColor: cardBg }]}>
              <View style={styles.headerRow}>
                <View>
                  <Text
                    style={[styles.sectionTitle, { color: titleColor }]}
                  >
                    Today
                  </Text>
                  <Text
                    style={[styles.completionText, { color: xpFill }]}
                  >
                    Completion: {completionPercent}%
                  </Text>
                  <Text
                    style={[styles.smallText, { color: subtitleColor }]}
                  >
                    Tap a habit each time you do it. Levels = how advanced
                    the habit is.
                  </Text>
                </View>
              </View>

              {/* 🎮 Healthiness bar + tiny reset on the right */}
              <View style={styles.xpContainer}>
                <View style={styles.xpHeaderRow}>
                  <Text
                    style={[styles.xpLabel, { color: subtitleColor }]}
                  >
                    Healthiness bar
                  </Text>
                  <View style={styles.xpRightRow}>
                    <Text
                      style={[styles.xpValue, { color: titleColor }]}
                    >
                      {healthiness} actions today
                    </Text>
                    <TouchableOpacity
                      style={styles.resetTiny}
                      onPress={resetToday}
                    >
                      <Text style={styles.resetTinyText}>Reset</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View
                  style={[
                    styles.xpTrack,
                    { backgroundColor: xpTrack },
                  ]}
                >
                  <View
                    style={[
                      styles.xpFill,
                      {
                        width: `${healthinessPercent * 100}%`,
                        backgroundColor: xpFill,
                      },
                    ]}
                  />
                </View>
              </View>

              {/* Level tabs */}
              {renderLevelTabs()}
            </View>

            {selectedLevel === 4 && (
              <View
                style={[
                  styles.comingSoonCard,
                  { backgroundColor: cardBg },
                ]}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: titleColor,
                    marginBottom: 4,
                  }}
                >
                  Level 4
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: subtitleColor,
                    marginBottom: 6,
                  }}
                >
                  Coming soon…
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: subtitleColor,
                  }}
                >
                  Advanced routines like deeper sleep tracking, structured
                  workouts, and more mental health tools will unlock here.
                </Text>
              </View>
            )}

            {!loading && selectedLevel !== 4 && (
              <Text
                style={[
                  styles.sectionTitleOutside,
                  { marginTop: 16, color: titleColor },
                ]}
              >
                Today&apos;s Habits – Level {selectedLevel}
              </Text>
            )}

            {loading && (
              <Text style={{ marginTop: 16, color: subtitleColor }}>
                Loading habits…
              </Text>
            )}
          </View>
        }
        ListFooterComponent={
          !loading ? (
            <Text
              style={{
                marginTop: 16,
                marginBottom: 40,
                marginLeft: 16,
                marginRight: 16,
                fontSize: 13,
                color: subtitleColor,
              }}
            >
              Total healthy actions today:{" "}
              <Text
                style={{ fontWeight: "700", color: titleColor }}
              >
                {healthiness}
              </Text>
            </Text>
          ) : null
        }
        contentContainerStyle={{
          paddingTop: 32,
          paddingHorizontal: 20,
          paddingBottom: 80,
          flexGrow: 1,
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  appTitle: {
    fontSize: 28,
    fontWeight: "700",
    marginLeft: 16,
    marginTop: 12,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
    marginLeft: 16,
  },
  dashboardCard: {
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  sectionTitleOutside: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
    marginLeft: 16,
  },
  completionText: {
    fontSize: 20,
    fontWeight: "700",
  },
  smallText: {
    fontSize: 12,
    marginTop: 4,
    maxWidth: 280,
  },
  habitCard: {
    marginTop: 10,
    marginHorizontal: 8,
    borderRadius: 14,
    padding: 12,
  },
  habitName: {
    fontSize: 16,
    fontWeight: "500",
  },
  habitStreak: {
    fontSize: 12,
    marginTop: 2,
  },
  habitCount: {
    fontSize: 12,
    marginTop: 2,
  },
  resetChip: {
    backgroundColor: "#E3F2FD",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  resetChipText: {
    fontSize: 12,
    color: "#1565C0",
    fontWeight: "600",
  },
  tipCard: {
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  tipLabel: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },
  levelTabsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
  },
  levelTab: {
    flex: 1,
    marginHorizontal: 3,
    borderRadius: 999,
    borderWidth: 1,
    paddingVertical: 6,
    alignItems: "center",
  },
  xpContainer: {
    marginTop: 12,
  },
  xpHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  xpRightRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  xpLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  xpValue: {
    fontSize: 12,
    fontWeight: "600",
    marginRight: 8,
  },
  xpTrack: {
    height: 8,
    borderRadius: 999,
    overflow: "hidden",
  },
  xpFill: {
    height: "100%",
    borderRadius: 999,
  },
  resetTiny: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#90CAF9",
  },
  resetTinyText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1565C0",
  },
  comingSoonCard: {
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
  },
});
