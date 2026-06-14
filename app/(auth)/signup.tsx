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

export default function SignupScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const colors = useBloomColors();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    if (!email.trim() || !password) {
      Alert.alert("Missing info", "Please enter an email and password.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Password too short", "Use at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      Alert.alert("Passwords do not match", "Please re-enter your password.");
      return;
    }

    try {
      setLoading(true);
      await signUp(email.trim(), password);
      router.replace("/(tabs)");
    } catch (err: any) {
      Alert.alert("Sign up failed", err.message ?? "Please try again.");
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
          <BloomText variant="hero">Start Blooming</BloomText>
          <BloomText muted style={styles.brandCopy}>
            Create a private habit space for daily progress and reflection.
          </BloomText>
        </View>

        <BloomCard style={styles.card}>
          <BloomText variant="title">Create account</BloomText>
          <BloomText muted style={styles.subtitle}>
            Your habits and logs stay separated from other accounts.
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
            placeholder="At least 6 characters"
            placeholderTextColor={colors.muted}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <BloomText variant="label" style={styles.label}>
            Confirm password
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
            placeholder="Re-enter password"
            placeholderTextColor={colors.muted}
            secureTextEntry
            value={confirm}
            onChangeText={setConfirm}
          />

          <BloomButton
            style={styles.primaryButton}
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? "Creating account..." : "Sign up"}
          </BloomButton>

          <BloomButton
            variant="ghost"
            onPress={() => router.replace("/(auth)/login")}
          >
            I already have an account
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
    maxWidth: 330,
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
