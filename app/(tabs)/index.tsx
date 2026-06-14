import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

import {
  BloomCard,
  BloomChip,
  BloomScreen,
  BloomText,
  useBloomColors,
} from "@/components/bloom-ui";
import { useAuth } from "@/context/AuthContext";

const BASE_HABITS_KEY = "bloom_habits_v2";
const PROFILE_NAME_KEY = "bloom_profile_name";

const initialHabits = [
  { id: "l1_water", icon: "💧", name: "Drink water", detail: "5 oz or small bottle", level: 1 as const, streak: 0, count: 0 },
  { id: "l1_sleep", icon: "🌙", name: "Sleep before midnight", detail: "Aim for 7-8 hours", level: 1 as const, streak: 0, count: 0 },
  { id: "l1_reading", icon: "📖", name: "Read", detail: "10-15 minutes", level: 1 as const, streak: 0, count: 0 },
  { id: "l1_movement", icon: "🚶", name: "Move your body", detail: "Walk, gym, or sports", level: 1 as const, streak: 0, count: 0 },
  { id: "l1_breath", icon: "🧘", name: "Mindful breathing", detail: "3-5 quiet minutes", level: 1 as const, streak: 0, count: 0 },
  { id: "l2_meal", icon: "🥗", name: "Balanced meal", detail: "Protein, fiber, color", level: 2 as const, streak: 0, count: 0 },
  { id: "l2_skincare", icon: "✨", name: "Skincare routine", detail: "AM or PM", level: 2 as const, streak: 0, count: 0 },
  { id: "l2_plan", icon: "🗓️", name: "Plan your day", detail: "Two-minute reset", level: 2 as const, streak: 0, count: 0 },
  { id: "l2_screen_break", icon: "📵", name: "Screen break", detail: "15 minutes off-phone", level: 2 as const, streak: 0, count: 0 },
  { id: "l2_vitamins", icon: "💊", name: "Take vitamins", detail: "Supplements or meds", level: 2 as const, streak: 0, count: 0 },
  { id: "l3_skill", icon: "🎯", name: "Skill learning", detail: "10-15 focused minutes", level: 3 as const, streak: 0, count: 0 },
  { id: "l3_tidy", icon: "🧹", name: "Tidy space", detail: "Two-minute reset", level: 3 as const, streak: 0, count: 0 },
  { id: "l3_fresh_air", icon: "🌿", name: "Step outside", detail: "Fresh air break", level: 3 as const, streak: 0, count: 0 },
  { id: "l3_no_social", icon: "🔕", name: "No social window", detail: "Protect one focus block", level: 3 as const, streak: 0, count: 0 },
  { id: "l3_podcast", icon: "🎧", name: "Educational audio", detail: "Podcast or lesson", level: 3 as const, streak: 0, count: 0 },
];

type Habit = (typeof initialHabits)[number];
type HabitLevel = 1 | 2 | 3 | 4;
type EditableHabit = Habit & {
  isCustom?: boolean;
  lastCompletedDate?: string;
};

const habitIcons = Object.fromEntries(
  initialHabits.map((habit) => [habit.id, habit.icon])
) as Record<string, string>;

const BLOOM_TIPS = [
  "Keep a water bottle near the place you study most.",
  "A steady sleep schedule beats one perfect night.",
  "Tiny habits are easier to repeat when they take under two minutes.",
  "A short walk can reset your mood faster than waiting it out.",
  "Put your next healthy action where your future self can see it.",
];

export default function HomeScreen() {
  const { user } = useAuth();
  const colors = useBloomColors();
  const habitsKey = user ? `${BASE_HABITS_KEY}_${user.uid}` : BASE_HABITS_KEY;

  const [habits, setHabits] = useState<EditableHabit[]>(initialHabits);
  const [loading, setLoading] = useState(true);
  const [tipIndex, setTipIndex] = useState(0);
  const [selectedLevel, setSelectedLevel] = useState<HabitLevel>(1);
  const [highlightedIds, setHighlightedIds] = useState<string[]>([]);
  const [profileName, setProfileName] = useState("friend");
  const [toast, setToast] = useState("");
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitLevel, setNewHabitLevel] = useState<1 | 2 | 3>(1);
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [editingHabitName, setEditingHabitName] = useState("");

  useEffect(() => {
    let isActive = true;

    (async () => {
      try {
        setLoading(true);
        const raw = await AsyncStorage.getItem(habitsKey);
        if (!isActive) return;
        const nextHabits = raw ? hydrateHabits(JSON.parse(raw)) : initialHabits;
        const resetHabits = resetCountsForNewDay(nextHabits);
        setHabits(resetHabits);
        if (JSON.stringify(nextHabits) !== JSON.stringify(resetHabits)) {
          await AsyncStorage.setItem(habitsKey, JSON.stringify(resetHabits));
        }
      } catch (e) {
        console.log("Error loading habits", e);
        if (isActive) setHabits(initialHabits);
      } finally {
        if (isActive) setLoading(false);
      }
    })();

    return () => {
      isActive = false;
    };
  }, [habitsKey]);

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;

      (async () => {
        try {
          const savedName = await AsyncStorage.getItem(PROFILE_NAME_KEY);
          if (isActive && savedName?.trim()) {
            setProfileName(savedName.trim());
          }
        } catch (e) {
          console.log("Error loading profile name", e);
        }
      })();

      return () => {
        isActive = false;
      };
    }, [])
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % BLOOM_TIPS.length);
    }, 30_000);
    return () => clearInterval(interval);
  }, []);

  async function saveHabits(next: EditableHabit[]) {
    setHabits(next);
    try {
      await AsyncStorage.setItem(habitsKey, JSON.stringify(next));
    } catch (e) {
      console.log("Error saving habits", e);
    }
  }

  const completedHabits = habits.filter((h) => (h.count ?? 0) > 0).length;
  const totalHabits = habits.length || 1;
  const completionPercent = Math.round((completedHabits / totalHabits) * 100);
  const totalActions = habits.reduce((sum, h) => sum + (h.count ?? 0), 0);
  const healthinessPercent = Math.max(0, Math.min(totalActions / 20, 1));
  const remainingHabits = Math.max(0, totalHabits - completedHabits);
  const bestStreak = habits.reduce((best, habit) => Math.max(best, habit.streak), 0);
  const topHabit = [...habits].sort((a, b) => (b.count ?? 0) - (a.count ?? 0))[0];
  const focusHabit =
    habits.find((habit) => (habit.count ?? 0) === 0 && habit.level === selectedLevel) ??
    habits.find((habit) => (habit.count ?? 0) === 0) ??
    habits[0];
  const visibleHabits: EditableHabit[] =
    selectedLevel === 4 ? [] : habits.filter((h) => h.level === selectedLevel);

  function incrementHabit(id: string) {
    const tappedHabit = habits.find((habit) => habit.id === id);
    const today = getDateKey();
    const yesterday = getDateKey(-1);
    const updated = habits.map((h) =>
      h.id === id
        ? {
            ...h,
            count: (h.count ?? 0) + 1,
            streak:
              h.lastCompletedDate === today
                ? h.streak
                : h.lastCompletedDate === yesterday
                  ? h.streak + 1
                  : 1,
            lastCompletedDate: today,
          }
        : h
    );
    saveHabits(updated);
    setToast(`Nice. ${tappedHabit?.name ?? "Habit"} logged.`);

    setHighlightedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setTimeout(() => {
      setHighlightedIds((prev) => prev.filter((x) => x !== id));
    }, 160);
    setTimeout(() => {
      setToast("");
    }, 2200);
  }

  function resetToday() {
    saveHabits(habits.map((h) => ({ ...h, count: 0 })));
  }

  function addCustomHabit() {
    const name = newHabitName.trim();
    if (!name) {
      Alert.alert("Name your habit", "Type a habit name before adding it.");
      return;
    }

    const customHabit: EditableHabit = {
      id: `custom_${Date.now()}`,
      icon: "⭐",
      name,
      detail: "Custom habit",
      level: newHabitLevel,
      streak: 0,
      count: 0,
      isCustom: true,
    };

    saveHabits([...habits, customHabit]);
    setNewHabitName("");
    setToast(`${name} added to Level ${newHabitLevel}.`);
  }

  function startEditingHabit(habit: EditableHabit) {
    setEditingHabitId(habit.id);
    setEditingHabitName(habit.name);
  }

  function saveEditedHabit(id: string) {
    const name = editingHabitName.trim();
    if (!name) {
      Alert.alert("Name required", "Custom habit names cannot be empty.");
      return;
    }

    saveHabits(
      habits.map((habit) => (habit.id === id ? { ...habit, name } : habit))
    );
    setEditingHabitId(null);
    setEditingHabitName("");
  }

  function deleteCustomHabit(id: string) {
    saveHabits(habits.filter((habit) => habit.id !== id));
    if (editingHabitId === id) {
      setEditingHabitId(null);
      setEditingHabitName("");
    }
  }

  const renderHabit = ({ item }: { item: EditableHabit }) => {
    const isHighlighted = highlightedIds.includes(item.id);
    const isEditing = editingHabitId === item.id;

    return (
      <View
        style={[
          styles.habitCard,
          {
            backgroundColor: isHighlighted ? colors.primarySoft : colors.surface,
            borderColor: isHighlighted ? colors.primary : colors.border,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.habitTapArea}
          activeOpacity={0.86}
          onPress={() => !isEditing && incrementHabit(item.id)}
        >
          <View style={styles.habitIcon}>
            <Text style={styles.habitEmoji}>
              {item.icon ?? habitIcons[item.id] ?? "🌱"}
            </Text>
          </View>
          <View style={styles.habitBody}>
            {isEditing ? (
              <TextInput
                style={[
                  styles.inlineInput,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.surfaceMuted,
                    color: colors.text,
                  },
                ]}
                value={editingHabitName}
                onChangeText={setEditingHabitName}
                autoFocus
              />
            ) : (
              <BloomText variant="section">{item.name}</BloomText>
            )}
            <BloomText muted variant="small">
              {item.detail} | {item.streak} day streak
            </BloomText>
          </View>
          <View style={[styles.countPill, { backgroundColor: colors.surfaceMuted }]}>
            <BloomText variant="label">{item.count ?? 0}</BloomText>
          </View>
        </TouchableOpacity>
          {isCustomHabit(item) ? (
          <View style={[styles.customActions, { borderTopColor: colors.border }]}>
            {isEditing ? (
              <TouchableOpacity
                style={styles.customActionButton}
                onPress={() => saveEditedHabit(item.id)}
              >
                <Text style={[styles.customActionText, { color: colors.primary }]}>
                  Save
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.customActionButton}
                onPress={() => startEditingHabit(item)}
              >
                <Text style={[styles.customActionText, { color: colors.primary }]}>
                  Edit
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.customActionButton}
              onPress={() => deleteCustomHabit(item.id)}
            >
              <Text style={[styles.customActionText, { color: colors.danger }]}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <BloomScreen style={styles.screen}>
      <FlatList
        data={loading ? [] : visibleHabits}
        keyExtractor={(item) => item.id}
        renderItem={renderHabit}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <BloomText variant="hero">{getGreeting()}, {profileName}</BloomText>
            <BloomText muted style={styles.subtitle}>
              Let&apos;s make today a little better.
            </BloomText>

            <BloomCard
              style={[
                styles.summaryCard,
                {
                  backgroundColor: colors.primarySoft,
                  borderColor: colors.primary,
                },
              ]}
            >
              <View style={styles.summaryTop}>
                <View>
                  <BloomText variant="label" muted>
                    Today&apos;s progress
                  </BloomText>
                  <BloomText variant="hero" style={{ color: colors.primary }}>
                    {completionPercent}%
                  </BloomText>
                </View>
                <View style={styles.actionsBox}>
                  <BloomText variant="title">{totalActions}</BloomText>
                  <BloomText muted variant="small">
                    actions today
                  </BloomText>
                </View>
              </View>
              <View style={[styles.progressTrack, { backgroundColor: colors.surfaceMuted }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${healthinessPercent * 100}%`,
                      backgroundColor: colors.primary,
                    },
                  ]}
                />
              </View>
              <View style={styles.summaryFooter}>
                <BloomText muted variant="small">
                  {remainingHabits === 0
                    ? "Every habit has a little progress today."
                    : `${remainingHabits} gentle wins still waiting.`}
                </BloomText>
                <TouchableOpacity onPress={resetToday}>
                  <Text style={[styles.resetLink, { color: colors.danger }]}>
                    Reset
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.dashboardStats}>
                <View style={[styles.miniStat, { backgroundColor: colors.surface }]}>
                  <BloomText variant="label">{bestStreak}</BloomText>
                  <BloomText muted variant="small">
                    best streak
                  </BloomText>
                </View>
                <View style={[styles.miniStat, { backgroundColor: colors.surface }]}>
                  <BloomText variant="label">
                    {topHabit ? topHabit.icon ?? "🌱" : "🌱"}
                  </BloomText>
                  <BloomText muted variant="small" style={styles.miniStatText}>
                    {topHabit ? topHabit.name : "favorite"}
                  </BloomText>
                </View>
              </View>
              <View style={[styles.tipStrip, { backgroundColor: colors.surface }]}>
                <BloomText variant="label" muted>
                  Tiny idea
                </BloomText>
                <BloomText style={styles.tipText}>{BLOOM_TIPS[tipIndex]}</BloomText>
              </View>
            </BloomCard>

            <View style={styles.statGrid}>
              <BloomCard muted style={styles.statCard}>
                <BloomText variant="label" muted>
                  Best streak
                </BloomText>
                <BloomText variant="title">{bestStreak} days</BloomText>
              </BloomCard>
              <BloomCard muted style={styles.statCard}>
                <BloomText variant="label" muted>
                  Favorite today
                </BloomText>
                <BloomText variant="section" style={styles.statName}>
                  {topHabit ? `${topHabit.icon ?? "🌱"} ${topHabit.name}` : "None yet"}
                </BloomText>
              </BloomCard>
            </View>

            {focusHabit ? (
              <BloomCard style={styles.focusCard}>
                <BloomText variant="label" muted>
                  Today&apos;s focus
                </BloomText>
                <BloomText variant="section" style={styles.focusTitle}>
                  {(focusHabit.icon ?? "🌱") + " " + focusHabit.name}
                </BloomText>
                <BloomText muted>{focusHabit.detail}</BloomText>
              </BloomCard>
            ) : null}

            {toast ? (
              <BloomCard muted style={styles.toastCard}>
                <BloomText>{toast}</BloomText>
              </BloomCard>
            ) : null}

            <BloomCard muted style={styles.tipCard}>
              <BloomText variant="label" muted>
                Tiny idea
              </BloomText>
              <BloomText style={styles.tipText}>{BLOOM_TIPS[tipIndex]}</BloomText>
            </BloomCard>

            <BloomCard style={styles.customCard}>
              <BloomText variant="section">Create your own habit</BloomText>
              <TextInput
                style={[
                  styles.customInput,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.surfaceMuted,
                    color: colors.text,
                  },
                ]}
                placeholder="Example: Stretch for 5 minutes"
                placeholderTextColor={colors.muted}
                value={newHabitName}
                onChangeText={setNewHabitName}
              />
              <BloomChip label="Add to my day" active onPress={addCustomHabit} />
              <View style={styles.levelRow}>
                {[1, 2, 3].map((level) => (
                  <BloomChip
                    key={level}
                    label={`Level ${level}`}
                    active={newHabitLevel === level}
                    onPress={() => setNewHabitLevel(level as 1 | 2 | 3)}
                    style={styles.levelChip}
                  />
                ))}
              </View>
            </BloomCard>

            <View style={styles.levelRow}>
              {[1, 2, 3, 4].map((level) => (
                <BloomChip
                  key={level}
                  label={`Level ${level}`}
                  active={selectedLevel === level}
                  onPress={() => setSelectedLevel(level as HabitLevel)}
                  style={styles.levelChip}
                />
              ))}
            </View>

            {selectedLevel === 4 ? (
              <BloomCard style={styles.comingSoonCard}>
                <BloomText variant="section">Level 4 is coming soon</BloomText>
                <BloomText muted>
                  Deeper sleep tracking, structured workouts, and more mental
                  health tools can live here later.
                </BloomText>
              </BloomCard>
            ) : (
              <BloomText variant="section" style={styles.sectionHeading}>
                {`Level ${selectedLevel} habits`}
              </BloomText>
            )}

            {loading && (
              <BloomText muted style={styles.loadingText}>
                Loading habits...
              </BloomText>
            )}
          </View>
        }
        contentContainerStyle={styles.content}
      />
    </BloomScreen>
  );
}

function hydrateHabits(saved: EditableHabit[]) {
  return saved.map((habit) => ({
    ...habit,
    icon: habit.icon ?? habitIcons[habit.id] ?? "🌱",
    count: habit.count ?? 0,
    streak: habit.streak ?? 0,
    isCustom: habit.isCustom ?? habit.id.startsWith("custom_"),
  }));
}

function isCustomHabit(habit: EditableHabit) {
  return habit.isCustom || habit.id.startsWith("custom_");
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function resetCountsForNewDay(saved: EditableHabit[]) {
  const today = getDateKey();
  return saved.map((habit) =>
    habit.lastCompletedDate === today ? habit : { ...habit, count: 0 }
  );
}

function getDateKey(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

const styles = StyleSheet.create({
  screen: {
    paddingBottom: 0,
  },
  content: {
    paddingBottom: 90,
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 16,
  },
  summaryCard: {
    marginBottom: 16,
  },
  dashboardStats: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  miniStat: {
    flex: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  miniStatText: {
    marginTop: 2,
  },
  tipStrip: {
    borderRadius: 14,
    padding: 12,
    marginTop: 10,
  },
  statGrid: {
    display: "none",
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
  },
  statName: {
    marginTop: 4,
  },
  focusCard: {
    marginBottom: 16,
  },
  focusTitle: {
    marginTop: 4,
  },
  toastCard: {
    marginBottom: 12,
  },
  summaryTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  actionsBox: {
    alignItems: "flex-end",
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    overflow: "hidden",
    marginTop: 14,
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
  summaryFooter: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  resetLink: {
    fontSize: 12,
    fontWeight: "800",
  },
  tipCard: {
    display: "none",
    marginBottom: 14,
  },
  customCard: {
    marginBottom: 18,
  },
  customInput: {
    minHeight: 46,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    marginTop: 12,
    marginBottom: 10,
  },
  tipText: {
    marginTop: 4,
  },
  levelRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  levelChip: {
    flex: 1,
    paddingHorizontal: 0,
  },
  comingSoonCard: {
    marginBottom: 10,
  },
  sectionHeading: {
    marginBottom: 2,
  },
  loadingText: {
    marginTop: 16,
  },
  habitCard: {
    borderWidth: 1,
    borderRadius: 18,
    marginTop: 12,
    overflow: "hidden",
    shadowColor: "#18332B",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 1,
  },
  habitTapArea: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
  },
  habitIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  habitEmoji: {
    fontSize: 21,
  },
  habitBody: {
    flex: 1,
    paddingRight: 10,
  },
  inlineInput: {
    minHeight: 38,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  customActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    borderTopWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  customActionButton: {
    minHeight: 34,
    minWidth: 68,
    alignItems: "center",
    justifyContent: "center",
  },
  customActionText: {
    fontSize: 12,
    fontWeight: "800",
  },
  countPill: {
    minWidth: 42,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
});
