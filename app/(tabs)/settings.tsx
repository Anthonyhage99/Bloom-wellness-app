import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Switch,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

// 🔑 BASE keys (match the other screens)
const BASE_LOGS_KEY = "bloom_daily_logs";   // + _uid in Log screen
const BASE_HABITS_KEY = "bloom_habits_v2";  // same as Home screen

export default function SettingsScreen() {
  const router = useRouter();
  const { darkMode, toggleDarkMode } = useTheme();
  const { user, logout } = useAuth();

  // per-user keys (fallback to base if somehow no user)
  const logsKey = user ? `${BASE_LOGS_KEY}_${user.uid}` : BASE_LOGS_KEY;
  const habitsKey = user ? `${BASE_HABITS_KEY}_${user.uid}` : BASE_HABITS_KEY;

  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [status, setStatus] = useState<string | null>(null);

  const containerStyle = [styles.container, darkMode && styles.containerDark];

  const cardBackground = darkMode ? "#1E1E1E" : "#FFFFFF";
  const mainText = darkMode ? "#FFFFFF" : "#23404E";
  const subText = darkMode ? "#A0A0A0" : "#66737D";
  const dangerText = darkMode ? "#FF8A80" : "#D32F2F";

  // 🧹 Clear ALL daily logs (for this user)
  async function handleClearLogs() {
    Alert.alert("Clear daily logs?", "This will delete all saved daily logs.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem(logsKey);
          setStatus("🧹 All daily logs cleared.");
        },
      },
    ]);
  }

  // 🔁 Reset today's habits = set count = 0 for each habit
  async function handleResetHabits() {
    Alert.alert(
      "Reset habits today?",
      "This will reset today's habit counters (count = 0).",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              const raw = await AsyncStorage.getItem(habitsKey);
              if (raw) {
                const parsed = JSON.parse(raw) as any[];
                const reset = parsed.map((h) => ({
                  ...h,
                  count: 0, // ⬅️ THIS is what Home uses
                }));
                await AsyncStorage.setItem(habitsKey, JSON.stringify(reset));
              }
              setStatus("🔁 Habits for today reset.");
            } catch (e) {
              console.log("Error resetting habits", e);
              setStatus("⚠️ Could not reset habits.");
            }
          },
        },
      ]
    );
  }

  // 🌪 Clear logs + reset today's habits
  async function handleResetAllToday() {
    Alert.alert(
      "Reset all progress today?",
      "This will clear logs and reset today's habit counters.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset all",
          style: "destructive",
          onPress: async () => {
            try {
              // clear logs for this user
              await AsyncStorage.removeItem(logsKey);

              // reset habits for this user
              const raw = await AsyncStorage.getItem(habitsKey);
              if (raw) {
                const parsed = JSON.parse(raw) as any[];
                const reset = parsed.map((h) => ({
                  ...h,
                  count: 0,
                }));
                await AsyncStorage.setItem(habitsKey, JSON.stringify(reset));
              }

              setStatus("🌪 All progress for today reset (logs + habits).");
            } catch (e) {
              console.log("Error resetting everything", e);
              setStatus("⚠️ Could not reset everything.");
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
      setStatus("⚠️ Could not log out. Try again.");
    }
  }

  return (
    <SafeAreaView style={containerStyle}>
      <Text style={[styles.title, { color: mainText }]}>Settings ⚙️</Text>
      <Text style={[styles.subtitle, { color: subText }]}>
        Basic preferences for your Bloom experience.
      </Text>

      {/* Daily reminders row */}
      <View style={[styles.rowCard, { backgroundColor: cardBackground }]}>
        <View style={styles.rowTextContainer}>
          <Text style={[styles.rowTitle, { color: mainText }]}>
            Daily reminders
          </Text>
          <Text style={[styles.rowSubtitle, { color: subText }]}>
            Get a gentle nudge to log your habits.
          </Text>
        </View>
        <Switch
          value={remindersEnabled}
          onValueChange={setRemindersEnabled}
        />
      </View>

      {/* Dark mode row */}
      <View style={[styles.rowCard, { backgroundColor: cardBackground }]}>
        <View style={styles.rowTextContainer}>
          <Text style={[styles.rowTitle, { color: mainText }]}>Dark mode</Text>
          <Text style={[styles.rowSubtitle, { color: subText }]}>
            Switch Bloom between light and dark themes.
          </Text>
        </View>
        <Switch value={darkMode} onValueChange={toggleDarkMode} />
      </View>

      {/* Data reset section */}
      <View style={[styles.aboutCard, { backgroundColor: cardBackground }]}>
        <Text style={[styles.aboutTitle, { color: mainText }]}>
          Data & Progress
        </Text>
        <Text style={[styles.aboutText, { color: subText }]}>
          Use these options if you want to wipe today&apos;s logs or reset your
          daily progress.
        </Text>

        <TouchableOpacity style={styles.resetRow} onPress={handleClearLogs}>
          <Text style={[styles.resetText, { color: dangerText }]}>
            Clear all daily logs
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.resetRow} onPress={handleResetHabits}>
          <Text style={[styles.resetText, { color: dangerText }]}>
            Reset today&apos;s habit counters
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.resetRow} onPress={handleResetAllToday}>
          <Text style={[styles.resetText, { color: dangerText }]}>
            Reset all progress today (logs + habits)
          </Text>
        </TouchableOpacity>
      </View>

      {/* About card */}
      <View style={[styles.aboutCard, { backgroundColor: cardBackground }]}>
        <Text style={[styles.aboutTitle, { color: mainText }]}>
          About Bloom
        </Text>
        <Text style={[styles.aboutText, { color: subText }]}>
          Bloom is a self-care habit tracker that helps you pick a few key
          habits, track your progress, and get gentle coaching when you feel
          stuck.
        </Text>
      </View>

      {/* Logout at very bottom, under About Bloom */}
      {user && (
        <View style={[styles.logoutContainer]}>
          <TouchableOpacity
            style={styles.accountButtonDanger}
            onPress={handleLogout}
          >
            <Text style={styles.accountButtonDangerText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      )}

      {status && (
        <Text
          style={{
            marginTop: 12,
            marginHorizontal: 20,
            fontSize: 13,
            color: subText,
          }}
        >
          {status}
        </Text>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FB",
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  containerDark: {
    backgroundColor: "#000000",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#23404E",
    marginLeft: 16,
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 16,
    color: "#66737D",
    marginLeft: 16,
  },
  rowCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 8,
    marginTop: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  rowTextContainer: {
    flex: 1,
    paddingRight: 12,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#23404E",
  },
  rowSubtitle: {
    fontSize: 13,
    color: "#66737D",
    marginTop: 2,
  },
  aboutCard: {
    marginTop: 18,
    marginHorizontal: 8,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  aboutTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#23404E",
    marginBottom: 4,
  },
  aboutText: {
    fontSize: 13,
    color: "#66737D",
  },
  resetRow: {
    marginTop: 10,
  },
  resetText: {
    fontSize: 13,
    fontWeight: "600",
  },
  logoutContainer: {
    marginTop: 18,
    marginHorizontal: 8,
  },
  accountButtonDanger: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D32F2F",
  },
  accountButtonDangerText: {
    color: "#D32F2F",
    fontWeight: "600",
  },
});
