import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

import {
  BloomCard,
  BloomScreen,
  BloomText,
  useBloomColors,
} from "@/components/bloom-ui";
import { useAuth } from "@/context/AuthContext";

const BASE_HABITS_KEY = "bloom_habits_v2";
const BASE_ACTIVE_DAYS_KEY = "bloom_active_days_v1";

type Habit = {
  id: string;
  name: string;
  level: 1 | 2 | 3;
  streak: number;
  count?: number;
};

type Achievement = {
  id: string;
  icon: string;
  title: string;
  description: string;
  points: number;
  category: string;
  isUnlocked: () => boolean;
};

export default function AchievementsScreen() {
  const { user } = useAuth();
  const colors = useBloomColors();
  const habitsKey = user ? `${BASE_HABITS_KEY}_${user.uid}` : BASE_HABITS_KEY;
  const activeDaysKey = user
    ? `${BASE_ACTIVE_DAYS_KEY}_${user.uid}`
    : BASE_ACTIVE_DAYS_KEY;

  const [habits, setHabits] = useState<Habit[]>([]);
  const [activeDays, setActiveDays] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUnlocked, setLastUnlocked] = useState<Achievement | null>(null);
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);
  const [showToast, setShowToast] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      setLoading(true);

      (async () => {
        try {
          const today = new Date().toISOString().slice(0, 10);
          const [rawHabits, rawActiveDays] = await Promise.all([
            AsyncStorage.getItem(habitsKey),
            AsyncStorage.getItem(activeDaysKey),
          ]);

          const parsedHabits: Habit[] = rawHabits ? JSON.parse(rawHabits) : [];
          const parsedActiveDays: string[] = rawActiveDays
            ? JSON.parse(rawActiveDays)
            : [];
          const nextActiveDays = Array.from(
            new Set([...parsedActiveDays, today])
          ).sort();

          await AsyncStorage.setItem(
            activeDaysKey,
            JSON.stringify(nextActiveDays)
          );

          if (isActive) {
            setHabits(parsedHabits);
            setActiveDays(nextActiveDays);
          }
        } catch (e) {
          console.log("Error loading medals data", e);
          if (isActive) {
            setHabits([]);
            setActiveDays([]);
          }
        } finally {
          if (isActive) setLoading(false);
        }
      })();

      return () => {
        isActive = false;
      };
    }, [activeDaysKey, habitsKey])
  );

  const getCount = useCallback(
    (id: string) => habits.find((h) => h.id === id)?.count ?? 0,
    [habits]
  );

  const water = getCount("l1_water");
  const sleep = getCount("l1_sleep");
  const reading = getCount("l1_reading");
  const movement = getCount("l1_movement");
  const breathing = getCount("l1_breath");
  const meal = getCount("l2_meal");
  const skincare = getCount("l2_skincare");
  const plan = getCount("l2_plan");
  const screenBreak = getCount("l2_screen_break");
  const vitamins = getCount("l2_vitamins");
  const skill = getCount("l3_skill");
  const tidy = getCount("l3_tidy");
  const freshAir = getCount("l3_fresh_air");
  const noSocial = getCount("l3_no_social");
  const podcast = getCount("l3_podcast");

  const level1Done = [water, sleep, reading, movement, breathing].filter(
    (count) => count > 0
  ).length;
  const level2Done = [meal, skincare, plan, screenBreak, vitamins].filter(
    (count) => count > 0
  ).length;
  const level3Done = [skill, tidy, freshAir, noSocial, podcast].filter(
    (count) => count > 0
  ).length;
  const totalActions = habits.reduce((sum, h) => sum + (h.count ?? 0), 0);
  const activeDayCount = activeDays.length;

  const achievements: Achievement[] = useMemo(
    () => [
      {
        id: "water_3",
        icon: "💧",
        title: "Hydration Starter",
        description: "Drink water 3 times today.",
        points: 15,
        category: "Level 1",
        isUnlocked: () => water >= 3,
      },
      {
        id: "sleep_1",
        icon: "🌙",
        title: "Night Reset",
        description: "Complete the sleep habit once today.",
        points: 15,
        category: "Level 1",
        isUnlocked: () => sleep >= 1,
      },
      {
        id: "level1_half",
        icon: "🌱",
        title: "Foundation Builder",
        description: "Complete any 3 Level 1 habits today.",
        points: 30,
        category: "Level 1",
        isUnlocked: () => level1Done >= 3,
      },
      {
        id: "level1_all",
        icon: "🌿",
        title: "Foundation Complete",
        description: "Complete all 5 Level 1 habits today.",
        points: 55,
        category: "Level 1",
        isUnlocked: () => level1Done >= 5,
      },
      {
        id: "meal_plan",
        icon: "🥗",
        title: "Balanced Plate",
        description: "Complete a balanced meal and plan your day.",
        points: 35,
        category: "Level 2",
        isUnlocked: () => meal >= 1 && plan >= 1,
      },
      {
        id: "screen_skincare",
        icon: "✨",
        title: "Evening Upgrade",
        description: "Complete skincare and a screen break today.",
        points: 35,
        category: "Level 2",
        isUnlocked: () => skincare >= 1 && screenBreak >= 1,
      },
      {
        id: "level2_half",
        icon: "🥇",
        title: "Lifestyle Upgrade",
        description: "Complete any 3 Level 2 habits today.",
        points: 45,
        category: "Level 2",
        isUnlocked: () => level2Done >= 3,
      },
      {
        id: "level2_all",
        icon: "💎",
        title: "Level 2 Mastery",
        description: "Complete all 5 Level 2 habits today.",
        points: 75,
        category: "Level 2",
        isUnlocked: () => level2Done >= 5,
      },
      {
        id: "deep_focus",
        icon: "🎯",
        title: "Deep Focus",
        description: "Complete skill learning and no social media today.",
        points: 45,
        category: "Level 3",
        isUnlocked: () => skill >= 1 && noSocial >= 1,
      },
      {
        id: "reset_space",
        icon: "🧹",
        title: "Clear Space",
        description: "Tidy your space and step outside today.",
        points: 45,
        category: "Level 3",
        isUnlocked: () => tidy >= 1 && freshAir >= 1,
      },
      {
        id: "level3_half",
        icon: "🔥",
        title: "Discipline Mode",
        description: "Complete any 3 Level 3 habits today.",
        points: 65,
        category: "Level 3",
        isUnlocked: () => level3Done >= 3,
      },
      {
        id: "level3_all",
        icon: "🏆",
        title: "Level 3 Mastery",
        description: "Complete all 5 Level 3 habits today.",
        points: 100,
        category: "Level 3",
        isUnlocked: () => level3Done >= 5,
      },
      {
        id: "all_levels_sample",
        icon: "🌈",
        title: "All Levels Online",
        description: "Complete at least one habit from each level today.",
        points: 70,
        category: "Combo",
        isUnlocked: () => level1Done >= 1 && level2Done >= 1 && level3Done >= 1,
      },
      {
        id: "complete_10",
        icon: "⚡",
        title: "Ten-Habit Day",
        description: "Complete 10 different habits today.",
        points: 120,
        category: "Combo",
        isUnlocked: () => level1Done + level2Done + level3Done >= 10,
      },
      {
        id: "action_25",
        icon: "💪",
        title: "25 Action Push",
        description: "Do 25 total healthy actions today.",
        points: 90,
        category: "Challenge",
        isUnlocked: () => totalActions >= 25,
      },
      {
        id: "action_50",
        icon: "🚀",
        title: "50 Action Beast",
        description: "Do 50 total healthy actions today.",
        points: 140,
        category: "Challenge",
        isUnlocked: () => totalActions >= 50,
      },
      {
        id: "active_3",
        icon: "📅",
        title: "3-Day Visitor",
        description: "Open Bloom on 3 different days.",
        points: 40,
        category: "Active Days",
        isUnlocked: () => activeDayCount >= 3,
      },
      {
        id: "active_7",
        icon: "🗓️",
        title: "1-Week Active",
        description: "Open Bloom on 7 different days.",
        points: 90,
        category: "Active Days",
        isUnlocked: () => activeDayCount >= 7,
      },
      {
        id: "active_14",
        icon: "📈",
        title: "2-Week Commitment",
        description: "Open Bloom on 14 different days.",
        points: 150,
        category: "Active Days",
        isUnlocked: () => activeDayCount >= 14,
      },
      {
        id: "active_30",
        icon: "👑",
        title: "30-Day Bloom",
        description: "Open Bloom on 30 different days.",
        points: 250,
        category: "Active Days",
        isUnlocked: () => activeDayCount >= 30,
      },
    ],
    [
      activeDayCount,
      freshAir,
      level1Done,
      level2Done,
      level3Done,
      meal,
      noSocial,
      plan,
      screenBreak,
      skincare,
      skill,
      sleep,
      tidy,
      totalActions,
      water,
    ]
  );

  const unlocked = achievements.filter((achievement) => achievement.isUnlocked());
  const unlockedCount = unlocked.length;
  const totalAchievements = achievements.length;
  const totalPoints = unlocked.reduce((sum, achievement) => sum + achievement.points, 0);
  const rankPercent =
    totalAchievements === 0 ? 0 : Math.min(unlockedCount / totalAchievements, 1);

  useEffect(() => {
    if (loading) return;

    const nextUnlocked = achievements.filter((achievement) =>
      achievement.isUnlocked()
    );
    const newIds = nextUnlocked.map((achievement) => achievement.id);
    const justUnlocked = nextUnlocked.filter(
      (achievement) => !unlockedIds.includes(achievement.id)
    );

    setUnlockedIds(newIds);

    if (justUnlocked.length > 0) {
      setLastUnlocked(justUnlocked[0]);
      setShowToast(true);
    }
  }, [achievements, loading, unlockedIds]);

  useEffect(() => {
    if (!showToast) return;

    const timeout = setTimeout(() => {
      setShowToast(false);
      setLastUnlocked(null);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [showToast, lastUnlocked]);

  const rankInfo = useMemo(() => {
    if (unlockedCount < 3) {
      return {
        label: "Very Unhealthy",
        subtitle: "Start with a few small wins to move up.",
      };
    }
    if (unlockedCount < 6) {
      return {
        label: "Unhealthy",
        subtitle: "You are building awareness. Keep stacking basics.",
      };
    }
    if (unlockedCount < 10) {
      return {
        label: "Getting Healthier",
        subtitle: "Your routine is starting to look consistent.",
      };
    }
    if (unlockedCount < 14) {
      return {
        label: "Healthy",
        subtitle: "You are completing habits across multiple levels.",
      };
    }
    if (unlockedCount < 18) {
      return {
        label: "Very Healthy",
        subtitle: "Your habits show strong daily discipline.",
      };
    }
    return {
      label: "Super Healthy",
      subtitle: "You are close to maxing out Bloom's challenge system.",
    };
  }, [unlockedCount]);

  const nextRankInfo = useMemo(() => {
    const rankSteps = [
      { label: "Unhealthy", medals: 3 },
      { label: "Getting Healthier", medals: 6 },
      { label: "Healthy", medals: 10 },
      { label: "Very Healthy", medals: 14 },
      { label: "Super Healthy", medals: 18 },
    ];
    const next = rankSteps.find((step) => unlockedCount < step.medals);

    return next
      ? { label: next.label, remaining: next.medals - unlockedCount }
      : { label: "Max rank reached", remaining: 0 };
  }, [unlockedCount]);

  const renderAchievement = ({ item }: { item: Achievement }) => {
    const isUnlocked = item.isUnlocked();

    return (
      <BloomCard
        style={[
          styles.achievementCard,
          {
            backgroundColor: isUnlocked ? colors.primarySoft : colors.surface,
            opacity: isUnlocked ? 1 : 0.72,
          },
        ]}
      >
        <View style={styles.achievementHeader}>
          <View
            style={[
              styles.medalMark,
              { backgroundColor: isUnlocked ? colors.primary : colors.surfaceMuted },
            ]}
          >
            <Text style={[styles.medalIcon, { opacity: isUnlocked ? 1 : 0.55 }]}>
              {item.icon}
            </Text>
          </View>
          <View style={styles.achievementText}>
            <BloomText variant="section">{item.title}</BloomText>
            <BloomText muted variant="small">
              {item.category} | {item.points} pts
            </BloomText>
          </View>
        </View>
        <BloomText muted style={styles.description}>
          {isUnlocked ? item.description : `Hint: ${item.description}`}
        </BloomText>
      </BloomCard>
    );
  };

  return (
    <BloomScreen>
      {showToast && lastUnlocked ? (
        <BloomCard muted style={styles.toast}>
          <BloomText variant="label">Mini celebration</BloomText>
          <BloomText>New medal unlocked: {lastUnlocked.title}</BloomText>
        </BloomCard>
      ) : null}

      <FlatList
        data={achievements}
        keyExtractor={(item) => item.id}
        renderItem={renderAchievement}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <BloomText variant="hero">Your Wins</BloomText>
            <BloomText muted style={styles.subtitle}>
              Challenges, ranks, and small proof that you showed up.
            </BloomText>

            <BloomCard style={styles.rankCard}>
              <BloomText variant="label" muted>
                Wellness rank
              </BloomText>
              <BloomText variant="title" style={styles.rankTitle}>
                {rankInfo.label}
              </BloomText>
              <BloomText muted>{rankInfo.subtitle}</BloomText>

              <View style={styles.rankStats}>
                <BloomText variant="label">
                  {unlockedCount}/{totalAchievements} medals
                </BloomText>
                <BloomText variant="label">{totalPoints} pts</BloomText>
              </View>
              <View style={[styles.rankTrack, { backgroundColor: colors.surfaceMuted }]}>
                <View
                  style={[
                    styles.rankFill,
                    { width: `${rankPercent * 100}%`, backgroundColor: colors.accent },
                  ]}
                />
              </View>
              <BloomText muted variant="small" style={styles.activeDaysText}>
                Active days: {activeDayCount}
              </BloomText>
              <BloomText muted variant="small" style={styles.activeDaysText}>
                {nextRankInfo.remaining === 0
                  ? "You reached the highest health rank."
                  : `${nextRankInfo.remaining} more medals until ${nextRankInfo.label}.`}
              </BloomText>
            </BloomCard>

            {loading ? (
              <BloomText muted style={styles.loadingText}>
                Loading medals...
              </BloomText>
            ) : habits.length === 0 ? (
              <BloomCard muted style={styles.emptyCard}>
                <BloomText variant="section">No habit data yet</BloomText>
                <BloomText muted>
                  Tap habits on Home to begin unlocking level medals.
                </BloomText>
              </BloomCard>
            ) : (
              <BloomText variant="section" style={styles.sectionHeading}>
                Today&apos;s challenges
              </BloomText>
            )}
          </View>
        }
        contentContainerStyle={styles.content}
      />
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
  rankCard: {
    marginBottom: 16,
  },
  rankTitle: {
    marginTop: 4,
  },
  rankStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
    marginBottom: 8,
  },
  rankTrack: {
    height: 9,
    borderRadius: 999,
    overflow: "hidden",
  },
  rankFill: {
    height: "100%",
    borderRadius: 999,
  },
  activeDaysText: {
    marginTop: 8,
  },
  sectionHeading: {
    marginBottom: 2,
  },
  loadingText: {
    marginTop: 12,
  },
  emptyCard: {
    marginBottom: 12,
  },
  achievementCard: {
    marginTop: 10,
  },
  achievementHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  medalMark: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  medalIcon: {
    fontSize: 20,
  },
  achievementText: {
    flex: 1,
  },
  description: {
    marginTop: 10,
  },
  toast: {
    position: "absolute",
    bottom: 78,
    left: 20,
    right: 20,
    zIndex: 20,
  },
});
