// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";

import { useTheme } from "../context/ThemeContext";

export default function TabLayout() {
  const { darkMode } = useTheme();
  const tint = Colors[darkMode ? "dark" : "light"].tint;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: darkMode ? "#000000" : "#FFFFFF",
          borderTopColor: darkMode ? "#222222" : "#E0E0E0",
        },
      }}
    >
      {/* 1. HOME */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />

      {/* 2. AI TIPS */}
      <Tabs.Screen
        name="ai"
        options={{
          title: "AI",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="brain.head.profile" color={color} />
          ),
        }}
      />

      {/* 3. LOG */}
      <Tabs.Screen
        name="log"
        options={{
          title: "Log",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="square.and.pencil" color={color} />
          ),
        }}
      />

      {/* 4. HISTORY */}
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="clock.fill" color={color} />
          ),
        }}
      />

      {/* 5. ACHIEVEMENTS / MEDALS */}
      <Tabs.Screen
        name="achievements"
        options={{
          title: "Medals",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="rosette" color={color} />
          ),
        }}
      />

      {/* 6. SETTINGS */}
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="gearshape.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
