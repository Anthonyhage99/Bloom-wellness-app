import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import {
  BloomButton,
  BloomCard,
  BloomScreen,
  BloomText,
  useBloomColors,
} from "@/components/bloom-ui";
import { useAuth } from "@/context/AuthContext";

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const colors = useBloomColors();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert("Missing info", "Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);
      await signIn(email.trim(), password);
      router.replace("/(tabs)");
    } catch (err: any) {
      Alert.alert("Login failed", err.message ?? "Check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <BloomScreen style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboard}
      >
        <View style={styles.brandBlock}>
          <BloomText variant="hero">Bloom</BloomText>
          <BloomText muted style={styles.brandCopy}>
            Build steady self-care habits, one small win at a time.
          </BloomText>
        </View>

        <BloomCard style={styles.card}>
          <BloomText variant="title">Welcome back</BloomText>
          <BloomText muted style={styles.subtitle}>
            Log in to continue tracking your habits and daily check-ins.
          </BloomText>

          <BloomText variant="label" style={styles.label}>
            Email
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
            placeholder="you@example.com"
            placeholderTextColor={colors.muted}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <BloomText variant="label" style={styles.label}>
            Password
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
            placeholder="Enter your password"
            placeholderTextColor={colors.muted}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <BloomButton
            style={styles.primaryButton}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Log in"}
          </BloomButton>

          <BloomButton
            variant="ghost"
            onPress={() => router.push("/(auth)/signup")}
          >
            Create an account
          </BloomButton>
        </BloomCard>
      </KeyboardAvoidingView>
    </BloomScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    justifyContent: "center",
  },
  keyboard: {
    width: "100%",
  },
  brandBlock: {
    marginBottom: 22,
    paddingHorizontal: 4,
  },
  brandCopy: {
    marginTop: 8,
    maxWidth: 310,
  },
  card: {
    gap: 4,
  },
  subtitle: {
    marginBottom: 12,
  },
  label: {
    marginTop: 10,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  primaryButton: {
    marginTop: 16,
  },
});
