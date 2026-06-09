import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";

import { BloomThemeProvider } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";

export const unstable_settings = {
  anchor: "(tabs)",
};

// This component decides which stack to show based on auth state
function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    // Tiny loading screen while Firebase figures out if we're logged in
    return null;
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
  // You can hook your own color scheme logic here if you want
  const navTheme = DefaultTheme; // or DarkTheme

  return (
    <BloomThemeProvider>
      <AuthProvider>
        <ThemeProvider value={navTheme}>
          <RootNavigator />
          <StatusBar style="auto" />
        </ThemeProvider>
      </AuthProvider>
    </BloomThemeProvider>
  );
}
