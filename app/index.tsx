import React from "react";
import { ActivityIndicator, View } from "react-native";
import { Redirect } from "expo-router";
import { useAuth } from "./context/AuthContext";

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator />
      </View>
    );
  }

  // if logged in -> go to tabs, else -> login
  if (user) {
    return <Redirect href="/(tabs)" />;
  } else {
    return <Redirect href="/(auth)/login" />;
  }
}
