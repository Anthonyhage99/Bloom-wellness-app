import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";
import "react-native-reanimated";

import {
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";

import { BloomPalette } from "@/constants/theme";
import { BloomThemeProvider, useTheme } from "@/context/ThemeContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";

export const unstable_settings = {
  anchor: "(tabs)",
};

// This component decides which stack to show based on auth state
function RootNavigator() {
  const { user, loading } = useAuth();
  const { darkMode } = useTheme();
  const colors = BloomPalette[darkMode ? "dark" : "light"];

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {user ? (
        // Logged in -> show main app tabs
        <Stack.Screen name="(tabs)" />
      ) : (
        // Not logged in -> show auth group (login / signup)
        <Stack.Screen name="(auth)" />
      )}

      {/* Keep your modal route if you use it */}
      <Stack.Screen
        name="modal"
        options={{ presentation: "modal", title: "Modal" }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <BloomThemeProvider>
      <AuthProvider>
        <NavigationShell />
      </AuthProvider>
    </BloomThemeProvider>
  );
}

function NavigationShell() {
  const { darkMode } = useTheme();
  const colors = BloomPalette[darkMode ? "dark" : "light"];
  const navTheme = {
    ...DefaultTheme,
    dark: darkMode,
    colors: {
      ...DefaultTheme.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      notification: colors.accent,
    },
  };

  return (
    <ThemeProvider value={navTheme}>
      <RootNavigator />
      <StatusBar style={darkMode ? "light" : "dark"} />
    </ThemeProvider>
  );
}
