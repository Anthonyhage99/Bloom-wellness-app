// app/(tabs)/achievements.tsx
import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../context/ThemeContext";
import { useFocusEffect } from "@react-navigation/native";

const HABITS_KEY = "bloom_habits_v2";

type Habit = {
  id: string;
  name: string;
  level: 1 | 2 | 3;
  streak: number;
  count?: number; // times done today
};

type Achievement = {
  id: string;
  title: string;
  description: string;
  points: number;
  emoji: string;
  isUnlocked: (habits: Habit[]) => boolean;
};

export default function AchievementsScreen() {
  const { darkMode } = useTheme();

  const background = darkMode ? "#000000" : "#F5F7FB";
  const cardBg = darkMode ? "#111111" : "#FFFFFF";
  const titleColor = darkMode ? "#FFFFFF" : "#23404E";
  const subtitleColor = darkMode ? "#A6A6A6" : "#66737D";
  const borderColor = darkMode ? "#333333" : "#E0E7EF";
  const unlockedBg = darkMode ? "#16391F" : "#E5F7EB";
  const lockedBg = darkMode ? "#151515" : "#F4F5F7";
  const rankTrack = darkMode ? "#222222" : "#E0E7EF";
  const rankFill = darkMode ? "#FFC107" : "#FFA000";

  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔔 toast state for new medals
  const [lastUnlocked, setLastUnlocked] = useState<Achievement | null>(null);
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);
  const [showToast, setShowToast] = useState(false);

  // 🔁 Reload habits whenever Medals tab is focused
  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      setLoading(true);

      (async () => {
        try {
          const raw = await AsyncStorage.getItem(HABITS_KEY);
          if (!isActive) return;

          if (raw) {
            const parsed: Habit[] = JSON.parse(raw);
            setHabits(parsed);
          } else {
            setHabits([]);
          }
        } catch (e) {
          console.log("Error loading habits for achievements", e);
          if (isActive) setHabits([]);
        } finally {
          if (isActive) setLoading(false);
        }
      })();

      return () => {
        isActive = false;
      };
    }, [])
  );

  // Helper: get counts for specific habits
  const getCount = (id: string) =>
    habits.find((h) => h.id === id)?.count ?? 0;

  const water = getCount("l1_water");
  const sleep = getCount("l1_sleep");
  const reading = getCount("l1_reading");
  const movement = getCount("l1_movement");
  const breathing = getCount("l1_breath");

  const totalActions = habits.reduce(
    (sum, h) => sum + (h.count ?? 0),
    0
  );

  // 🎖️ Define ~20 achievements
  const ACHIEVEMENTS: Achievement[] = [
    // Water line
    {
      id: "water_1",
      title: "First Sip 💧",
      description: "Tap 'Drink water' at least 1 time today.",
      points: 10,
      emoji: "💧",
      isUnlocked: () => water >= 1,
    },
    {
      id: "water_2",
      title: "Mini Hydrator 🧊",
      description: "Tap 'Drink water' at least 2 times today.",
      points: 15,
      emoji: "🥤",
      isUnlocked: () => water >= 2,
    },
    {
      id: "water_5",
      title: "Hydration Habit 💦",
      description: "Tap 'Drink water' 5 times in one day.",
      points: 20,
      emoji: "💦",
      isUnlocked: () => water >= 5,
    },
    {
      id: "water_10",
      title: "Water Warrior ⚔️",
      description: "Tap 'Drink water' 10 times in one day.",
      points: 25,
      emoji: "🌊",
      isUnlocked: () => water >= 10,
    },
    {
      id: "water_50",
      title: "H2O Beast Mode 🐉",
      description: "Tap 'Drink water' 50 times in one day.",
      points: 40,
      emoji: "🚰",
      isUnlocked: () => water >= 50,
    },

    // Sleep
    {
      id: "sleep_1",
      title: "Sleep Attempt 😴",
      description: "Tap the sleep habit at least once today.",
      points: 10,
      emoji: "😴",
      isUnlocked: () => sleep >= 1,
    },
    {
      id: "sleep_2",
      title: "Sleep Guardian 🌙",
      description: "Tap the sleep habit 2+ times today.",
      points: 20,
      emoji: "🌙",
      isUnlocked: () => sleep >= 2,
    },

    // Reading
    {
      id: "reading_1",
      title: "Page Turner 📖",
      description: "Tap the reading habit at least once today.",
      points: 10,
      emoji: "📖",
      isUnlocked: () => reading >= 1,
    },
    {
      id: "reading_3",
      title: "Bookworm Mode 🐛",
      description: "Tap the reading habit 3+ times today.",
      points: 20,
      emoji: "📚",
      isUnlocked: () => reading >= 3,
    },

    // Movement
    {
      id: "movement_1",
      title: "Moved Today 🚶‍♂️",
      description: "Tap the movement habit at least once today.",
      points: 10,
      emoji: "🚶‍♂️",
      isUnlocked: () => movement >= 1,
    },
    {
      id: "movement_3",
      title: "Athlete in Progress 🏃",
      description: "Tap the movement habit 3+ times today.",
      points: 20,
      emoji: "🏃",
      isUnlocked: () => movement >= 3,
    },

    // Breathing / mindfulness
    {
      id: "breathing_1",
      title: "Breathing Space 🌬️",
      description: "Tap the breathing habit at least once today.",
      points: 10,
      emoji: "🌬️",
      isUnlocked: () => breathing >= 1,
    },
    {
      id: "breathing_3",
      title: "Zen Mode 🧘",
      description: "Tap the breathing habit 3+ times today.",
      points: 20,
      emoji: "🧘",
      isUnlocked: () => breathing >= 3,
    },

    // Combos
    {
      id: "combo_chill",
      title: "Chill & Refuel 😌",
      description: "5x water + 1x sleep habit in a day.",
      points: 30,
      emoji: "🛏️",
      isUnlocked: () => water >= 5 && sleep >= 1,
    },
    {
      id: "combo_balanced",
      title: "Balanced Human 🧘",
      description: "5x water + 1x sleep + 1x reading in a day.",
      points: 40,
      emoji: "⚖️",
      isUnlocked: () => water >= 5 && sleep >= 1 && reading >= 1,
    },
    {
      id: "mind_body",
      title: "Mind–Body Sync 🧠💪",
      description: "1x movement + 1x breathing habit in a day.",
      points: 25,
      emoji: "🧠",
      isUnlocked: () => movement >= 1 && breathing >= 1,
    },
    {
      id: "all_online",
      title: "All Systems Online 🌈",
      description: "Use water, sleep, reading, movement & breathing once.",
      points: 50,
      emoji: "🌈",
      isUnlocked: () =>
        water >= 1 &&
        sleep >= 1 &&
        reading >= 1 &&
        movement >= 1 &&
        breathing >= 1,
    },

    // Total actions
    {
      id: "grind_mode",
      title: "Grind Mode 🔥",
      description: "Do 20 total healthy actions in one day.",
      points: 35,
      emoji: "🔥",
      isUnlocked: () => totalActions >= 20,
    },
    {
      id: "tap_machine",
      title: "Tap Machine 🤖",
      description: "Do 50 total healthy actions in one day.",
      points: 50,
      emoji: "🤖",
      isUnlocked: () => totalActions >= 50,
    },
    {
      id: "ultra_grinder",
      title: "Ultra Grinder 💎",
      description: "Do 100 total healthy actions in one day.",
      points: 70,
      emoji: "💎",
      isUnlocked: () => totalActions >= 100,
    },
  ];

  const unlockedCount = ACHIEVEMENTS.filter((a) =>
    a.isUnlocked(habits)
  ).length;
  const totalAchievements = ACHIEVEMENTS.length;

  // 🔍 Watch for newly unlocked medals + show toast
  useEffect(() => {
    if (loading) return;

    const newlyUnlocked = ACHIEVEMENTS.filter((a) =>
      a.isUnlocked(habits)
    );
    const newIds = newlyUnlocked.map((a) => a.id);

    const justUnlocked = newlyUnlocked.filter(
      (a) => !unlockedIds.includes(a.id)
    );

    setUnlockedIds(newIds);

    if (justUnlocked.length > 0) {
      const first = justUnlocked[0];
      setLastUnlocked(first);
      setShowToast(true);

      const timeout = setTimeout(() => {
        setShowToast(false);
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [habits, loading]); // eslint-disable-line react-hooks/exhaustive-deps

  const rankInfo = useMemo(() => {
    const ratio =
      totalAchievements === 0 ? 0 : unlockedCount / totalAchievements;

    if (unlockedCount === 0) {
      return {
        label: "Not Healthy (yet) 😴",
        subtitle: "Start with one tiny habit today.",
      };
    } else if (ratio < 0.25) {
      return {
        label: "Warming Up 🔥",
        subtitle: "You’ve started. Keep stacking easy wins.",
      };
    } else if (ratio < 0.5) {
      return {
        label: "Getting Healthier 💪",
        subtitle: "Your healthy actions are adding up.",
      };
    } else if (ratio < 0.75) {
      return {
        label: "Blooming Healthy 🌱",
        subtitle: "Your habits are starting to look serious.",
      };
    } else if (ratio < 1) {
      return {
        label: "Almost Super Healthy ⭐",
        subtitle: "Just a few more medals to max out.",
      };
    } else {
      return {
        label: "Super Healthy 🏆",
        subtitle: "You unlocked every medal. Elite wellness status.",
      };
    }
  }, [unlockedCount, totalAchievements]);

  const rankPercent =
    totalAchievements === 0 ? 0 : Math.min(unlockedCount / totalAchievements, 1);

  const renderAchievement = ({ item }: { item: Achievement }) => {
    const unlocked = item.isUnlocked(habits);

    return (
      <View
        style={[
          styles.achievementCard,
          {
            backgroundColor: unlocked ? unlockedBg : lockedBg,
            borderColor: borderColor,
            opacity: unlocked ? 1 : 0.6,
          },
        ]}
      >
        <View style={styles.achievementHeader}>
          <Text style={styles.achievementEmoji}>{item.emoji}</Text>
          <Text
            style={[
              styles.achievementTitle,
              { color: titleColor },
            ]}
          >
            {item.title}
          </Text>
        </View>

        <Text
          style={[
            styles.achievementDescription,
            { color: subtitleColor },
          ]}
        >
          {item.description}
        </Text>

        <View style={styles.achievementFooter}>
          <Text
            style={[
              styles.pointsText,
              { color: subtitleColor },
            ]}
          >
            {item.points} pts
          </Text>
          <Text
            style={{
              fontSize: 12,
              fontWeight: "600",
              color: unlocked ? "#4CAF50" : subtitleColor,
            }}
          >
            {unlocked ? "Unlocked ✅" : "Locked 🔒"}
          </Text>
        </View>
      </View>
    );
  };

  const showEmpty = !loading && habits.length === 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: background }]}>
      {/* 🏅 Toast for new medal – at bottom above tab bar */}
      {showToast && lastUnlocked && (
        <View
          style={[
            styles.toast,
            { backgroundColor: darkMode ? "#16391F" : "#E6F7EB" },
          ]}
        >
          <Text style={[styles.toastTitle, { color: titleColor }]}>
            🏅 New medal unlocked!
          </Text>
          <Text style={[styles.toastText, { color: subtitleColor }]}>
            {lastUnlocked.emoji} {lastUnlocked.title}
          </Text>
        </View>
      )}

      <FlatList
        data={ACHIEVEMENTS}
        keyExtractor={(item) => item.id}
        renderItem={renderAchievement}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 20,
          paddingTop: 32,
          paddingBottom: 40,
        }}
        ListHeaderComponent={
          <View style={{ marginBottom: 16 }}>
            {/* TOP RANK BAR */}
            <View
              style={[
                styles.rankCard,
                { backgroundColor: cardBg, borderColor },
              ]}
            >
              <Text style={[styles.rankLabel, { color: titleColor }]}>
                Health Rank
              </Text>
              <Text
                style={[
                  styles.rankTitle,
                  { color: titleColor },
                ]}
              >
                {rankInfo.label}
              </Text>
              <Text
                style={[
                  styles.rankSubtitle,
                  { color: subtitleColor },
                ]}
              >
                {rankInfo.subtitle}
              </Text>

              <View style={styles.rankProgressRow}>
                <Text
                  style={[
                    styles.rankProgressText,
                    { color: subtitleColor },
                  ]}
                >
                  Medals: {unlockedCount}/{totalAchievements}
                </Text>
              </View>

              <View
                style={[
                  styles.rankTrack,
                  { backgroundColor: rankTrack },
                ]}
              >
                <View
                  style={[
                    styles.rankFill,
                    {
                      width: `${rankPercent * 100}%`,
                      backgroundColor: rankFill,
                    },
                  ]}
                />
              </View>
            </View>

            {showEmpty && (
              <Text
                style={{
                  marginTop: 8,
                  marginHorizontal: 4,
                  fontSize: 13,
                  color: subtitleColor,
                }}
              >
                No habit data yet. Start tapping habits on the Home tab to begin
                unlocking medals.
              </Text>
            )}

            <Text
              style={{
                marginTop: 16,
                marginLeft: 4,
                marginBottom: 8,
                fontSize: 16,
                fontWeight: "600",
                color: titleColor,
              }}
            >
              Daily Medals 🎖️
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  rankCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
  },
  rankLabel: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  rankTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  rankSubtitle: {
    fontSize: 13,
    marginBottom: 8,
  },
  rankProgressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  rankProgressText: {
    fontSize: 12,
    fontWeight: "500",
  },
  rankTrack: {
    height: 8,
    borderRadius: 999,
    overflow: "hidden",
  },
  rankFill: {
    height: "100%",
    borderRadius: 999,
  },
  achievementCard: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  achievementHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  achievementEmoji: {
    fontSize: 20,
    marginRight: 6,
  },
  achievementTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  achievementDescription: {
    fontSize: 13,
    marginTop: 2,
    marginBottom: 8,
  },
  achievementFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pointsText: {
    fontSize: 12,
    fontWeight: "500",
  },
  toast: {
    position: "absolute",
    bottom: 70, // 👈 just above bottom tabs
    left: 20,
    right: 20,
    zIndex: 20,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 5,
  },
  toastTitle: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 2,
  },
  toastText: {
    fontSize: 13,
  },
});
