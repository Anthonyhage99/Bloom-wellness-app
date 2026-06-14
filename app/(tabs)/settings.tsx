import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

import {
  BloomButton,
  BloomCard,
  BloomScreen,
  BloomText,
  useBloomColors,
} from "@/components/bloom-ui";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

const BASE_LOGS_KEY = "bloom_daily_logs";
const BASE_HABITS_KEY = "bloom_habits_v2";
const REMINDERS_KEY = "bloom_reminders_enabled";
const PROFILE_NAME_KEY = "bloom_profile_name";

type StoredHabit = {
  count?: number;
  [key: string]: unknown;
};

export default function SettingsScreen() {
  const router = useRouter();
  const colors = useBloomColors();
  const { darkMode, toggleDarkMode } = useTheme();
  const { user, logout } = useAuth();

  const logsKey = user ? `${BASE_LOGS_KEY}_${user.uid}` : BASE_LOGS_KEY;
  const habitsKey = user ? `${BASE_HABITS_KEY}_${user.uid}` : BASE_HABITS_KEY;
  const remindersKey = user ? `${REMINDERS_KEY}_${user.uid}` : REMINDERS_KEY;

  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(remindersKey);
        const savedName = await AsyncStorage.getItem(PROFILE_NAME_KEY);
        setRemindersEnabled(saved === "true");
        if (savedName) setProfileName(savedName);
      } catch (e) {
        console.log("Error loading reminder preference", e);
      }
    })();
  }, [remindersKey]);

  async function updateReminders(next: boolean) {
    setRemindersEnabled(next);
    await AsyncStorage.setItem(remindersKey, String(next));
    setStatus(next ? "Reminder preference saved." : "Reminders turned off.");
  }

  async function saveProfileName() {
    await AsyncStorage.setItem(PROFILE_NAME_KEY, profileName.trim() || "friend");
    setStatus("Profile name saved.");
  }

  async function handleClearLogs() {
    Alert.alert("Clear daily logs?", "This will delete all saved daily check-ins.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem(logsKey);
          setStatus("Daily logs cleared.");
        },
      },
    ]);
  }

  async function handleResetHabits() {
    Alert.alert(
      "Reset today's habits?",
      "This will set every habit count back to zero.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              const raw = await AsyncStorage.getItem(habitsKey);
              if (raw) {
                const parsed = JSON.parse(raw) as StoredHabit[];
                await AsyncStorage.setItem(
                  habitsKey,
                  JSON.stringify(parsed.map((h) => ({ ...h, count: 0 })))
                );
              }
              setStatus("Habit counters reset.");
            } catch (e) {
              console.log("Error resetting habits", e);
              setStatus("Could not reset habits.");
            }
          },
        },
      ]
    );
  }

  async function handleResetAllToday() {
    Alert.alert(
      "Reset all progress today?",
      "This clears check-ins and resets today's habit counters.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset all",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(logsKey);
              const raw = await AsyncStorage.getItem(habitsKey);
              if (raw) {
                const parsed = JSON.parse(raw) as StoredHabit[];
                await AsyncStorage.setItem(
                  habitsKey,
                  JSON.stringify(parsed.map((h) => ({ ...h, count: 0 })))
                );
              }
              setStatus("Today's progress reset.");
            } catch (e) {
              console.log("Error resetting everything", e);
              setStatus("Could not reset everything.");
            }
          },
        },
      ]
    );
  }

  async function handleLogout() {
    try {
      await logout();
      router.replace("/(auth)/login");
    } catch (e) {
      console.log("Error logging out", e);
      setStatus("Could not log out. Try again.");
    }
  }

  return (
    <BloomScreen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <BloomText variant="hero">Your Space</BloomText>
        <BloomText muted style={styles.subtitle}>
          Personalize Bloom and manage your local data.
        </BloomText>

        <BloomCard style={styles.sectionCard}>
          <BloomText variant="section">Personal touches</BloomText>
          <BloomText variant="label" style={styles.inputLabel}>
            Profile name
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
            placeholder="Your name or nickname"
            placeholderTextColor={colors.muted}
            value={profileName}
            onChangeText={setProfileName}
          />
          <BloomButton
            variant="secondary"
            style={styles.saveNameButton}
            onPress={saveProfileName}
          >
            Save name
          </BloomButton>
          <SettingRow
            title="Daily reminders"
            subtitle="Save a reminder preference for future notification support."
            value={remindersEnabled}
            onValueChange={updateReminders}
          />
          <SettingRow
            title="Dark mode"
            subtitle="Use a calmer low-light theme."
            value={darkMode}
            onValueChange={toggleDarkMode}
          />
        </BloomCard>

        <BloomCard style={styles.sectionCard}>
          <BloomText variant="section">Progress controls</BloomText>
          <BloomText muted style={styles.sectionCopy}>
            These actions affect only the current account on this device.
          </BloomText>
          <View style={styles.dangerStack}>
            <BloomButton variant="danger" onPress={handleClearLogs}>
              Clear daily logs
            </BloomButton>
            <BloomButton variant="danger" onPress={handleResetHabits}>
              Reset habit counters
            </BloomButton>
            <BloomButton variant="danger" onPress={handleResetAllToday}>
              Reset all progress today
            </BloomButton>
          </View>
        </BloomCard>

        <BloomCard style={styles.sectionCard}>
          <BloomText variant="section">About Bloom</BloomText>
          <BloomText muted style={styles.sectionCopy}>
            Bloom is a self-care habit tracker for small daily actions, quick
            check-ins, and simple coaching prompts.
          </BloomText>
          <BloomText muted variant="small" style={styles.versionText}>
            Bloom v1.0
          </BloomText>
        </BloomCard>

        {user ? (
          <BloomButton
            variant="secondary"
            style={[styles.logoutButton, { borderColor: colors.danger }]}
            textStyle={{ color: colors.danger }}
            onPress={handleLogout}
          >
            Log out
          </BloomButton>
        ) : null}

        {status ? (
          <BloomCard muted style={styles.statusCard}>
            <BloomText>{status}</BloomText>
          </BloomCard>
        ) : null}
      </ScrollView>
    </BloomScreen>
  );
}

function SettingRow({
  title,
  subtitle,
  value,
  onValueChange,
}: {
  title: string;
  subtitle: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
}) {
  const colors = useBloomColors();

  return (
    <View style={[styles.settingRow, { borderColor: colors.border }]}>
      <View style={styles.settingText}>
        <BloomText variant="label">{title}</BloomText>
        <BloomText muted variant="small">
          {subtitle}
        </BloomText>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.primarySoft }}
        thumbColor={value ? colors.primary : colors.muted}
      />
    </View>
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
  sectionCard: {
    marginBottom: 14,
  },
  sectionCopy: {
    marginTop: 6,
  },
  inputLabel: {
    marginTop: 14,
    marginBottom: 8,
  },
  input: {
    minHeight: 46,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  saveNameButton: {
    marginTop: 10,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    paddingTop: 14,
    marginTop: 14,
  },
  settingText: {
    flex: 1,
    paddingRight: 14,
  },
  dangerStack: {
    gap: 10,
    marginTop: 14,
  },
  logoutButton: {
    marginTop: 4,
  },
  versionText: {
    marginTop: 10,
  },
  statusCard: {
    marginTop: 14,
  },
});
