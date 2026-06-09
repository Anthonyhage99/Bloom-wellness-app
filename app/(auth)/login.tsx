import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const { darkMode } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const bg = darkMode ? "#000000" : "#F5F7FB";
  const cardBg = darkMode ? "#111111" : "#FFFFFF";
  const textColor = darkMode ? "#FFFFFF" : "#23404E";
  const subColor = darkMode ? "#A6A6A6" : "#66737D";

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert("Missing info", "Please enter email and password.");
      return;
    }

    try {
      setLoading(true);
      await signIn(email, password);
      router.replace("/(tabs)");
    } catch (err: any) {
      console.log(err);
      Alert.alert("Login failed", err.message ?? "Check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <Text style={[styles.title, { color: textColor }]}>
          Welcome to Bloom 🌱
        </Text>
        <Text style={[styles.subtitle, { color: subColor }]}>
          Your daily habits are happier when they’re synced 😉
        </Text>

        <Text style={[styles.label, { color: textColor }]}>Email</Text>
        <TextInput
          style={[styles.input, { color: textColor }]}
          placeholder="you@example.com"
          placeholderTextColor={darkMode ? "#777" : "#999"}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={[styles.label, { color: textColor }]}>Password</Text>
        <TextInput
          style={[styles.input, { color: textColor }]}
          placeholder="••••••••"
          placeholderTextColor={darkMode ? "#777" : "#999"}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.6 }]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Logging in…" : "Log In"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
          <Text style={[styles.linkText, { color: subColor }]}>
            Don&apos;t have an account?{" "}
            <Text style={{ fontWeight: "600" }}>Sign up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  card: {
    borderRadius: 18,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 16,
  },
  label: {
    marginTop: 10,
    marginBottom: 4,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#CCD6DD",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  button: {
    marginTop: 14,
    backgroundColor: "#2E7D32",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  linkText: {
    textAlign: "center",
    marginTop: 14,
    fontSize: 13,
  },
});
