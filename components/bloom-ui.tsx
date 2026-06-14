import React from "react";
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewProps,
  ViewStyle,
} from "react-native";

import { BloomPalette, BloomSpacing } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";

export function useBloomColors() {
  const { darkMode } = useTheme();
  return BloomPalette[darkMode ? "dark" : "light"];
}

export function BloomScreen({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  const colors = useBloomColors();
  return (
    <View style={[styles.screen, { backgroundColor: colors.background }, style]}>
      <View
        pointerEvents="none"
        style={[
          styles.backgroundGlow,
          styles.backgroundGlowOne,
          { backgroundColor: colors.primarySoft },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.backgroundGlow,
          styles.backgroundGlowTwo,
          { backgroundColor: colors.accentSoft },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.backgroundLine,
          { borderColor: colors.border },
        ]}
      />
      {children}
    </View>
  );
}

export function BloomCard({
  children,
  style,
  muted = false,
}: ViewProps & { muted?: boolean }) {
  const colors = useBloomColors();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: muted ? colors.surfaceMuted : colors.surface,
          borderColor: colors.border,
          shadowColor: colors.shadow,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function BloomText({
  children,
  variant = "body",
  muted = false,
  style,
}: {
  children: React.ReactNode;
  variant?: "hero" | "title" | "section" | "body" | "small" | "label";
  muted?: boolean;
  style?: TextStyle;
}) {
  const colors = useBloomColors();
  return (
    <Text
      style={[
        { color: muted ? colors.muted : colors.text },
        variant === "hero" && styles.heroText,
        variant === "title" && styles.titleText,
        variant === "section" && styles.sectionText,
        variant === "body" && styles.bodyText,
        variant === "small" && styles.smallText,
        variant === "label" && styles.labelText,
        style,
      ]}
    >
      {children}
    </Text>
  );
}

export function BloomButton({
  children,
  variant = "primary",
  style,
  textStyle,
  disabled,
  ...props
}: TouchableOpacityProps & {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  textStyle?: TextStyle;
}) {
  const colors = useBloomColors();
  const buttonStyle =
    variant === "primary"
      ? { backgroundColor: colors.primary, borderColor: colors.primary }
      : variant === "danger"
        ? { backgroundColor: colors.dangerSoft, borderColor: colors.dangerSoft }
        : variant === "ghost"
          ? { backgroundColor: "transparent", borderColor: "transparent" }
          : { backgroundColor: colors.surfaceMuted, borderColor: colors.border };

  const color =
    variant === "primary"
      ? colors.background
      : variant === "danger"
        ? colors.danger
        : colors.text;

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      disabled={disabled}
      style={[styles.button, buttonStyle, disabled && styles.disabled, style]}
      {...props}
    >
      <Text style={[styles.buttonText, { color }, textStyle]}>{children}</Text>
    </TouchableOpacity>
  );
}

export function BloomChip({
  label,
  active,
  onPress,
  style,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}) {
  const colors = useBloomColors();
  return (
    <TouchableOpacity
      activeOpacity={0.84}
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: active ? colors.primarySoft : colors.surface,
          borderColor: active ? colors.primary : colors.border,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.chipText,
          { color: active ? colors.primary : colors.muted },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: BloomSpacing.screenX,
    paddingTop: BloomSpacing.screenTop,
    overflow: "hidden",
  },
  backgroundGlow: {
    position: "absolute",
    width: 260,
    height: 92,
    borderRadius: 28,
    opacity: 0.32,
    transform: [{ rotate: "-18deg" }],
  },
  backgroundGlowOne: {
    top: 28,
    right: -90,
  },
  backgroundGlowTwo: {
    bottom: 118,
    left: -108,
    opacity: 0.2,
    transform: [{ rotate: "16deg" }],
  },
  backgroundLine: {
    position: "absolute",
    top: 96,
    right: -24,
    width: 180,
    height: 70,
    borderRadius: 32,
    borderWidth: 1,
    opacity: 0.24,
    transform: [{ rotate: "-18deg" }],
  },
  card: {
    borderRadius: BloomSpacing.radius,
    borderWidth: 1,
    padding: 16,
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  heroText: {
    fontSize: 31,
    lineHeight: 37,
    fontWeight: "800",
  },
  titleText: {
    fontSize: 25,
    lineHeight: 31,
    fontWeight: "800",
  },
  sectionText: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "700",
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "400",
  },
  smallText: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "500",
  },
  labelText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
  },
  button: {
    minHeight: 48,
    borderRadius: BloomSpacing.radiusSmall,
    borderWidth: 1,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: {
    opacity: 0.58,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "800",
  },
  chip: {
    minHeight: 36,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  chipText: {
    fontSize: 12,
    fontWeight: "800",
  },
});
