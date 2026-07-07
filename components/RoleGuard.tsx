import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useAuth } from "@/lib/useAuth";
import { isProgramManager } from "@/utils/permissions";

type RoleGuardProps = {
  children: React.ReactNode;
  title?: string;
  description?: string;
};

export function RoleGuard({
  children,
  title = "Access restricted",
  description = "This section is available to program managers only.",
}: RoleGuardProps) {
  const { user } = useAuth();
  const router = useRouter();

  if (isProgramManager(user)) {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Ionicons name="lock-closed-outline" size={40} color="#0f766e" />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Go back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#f3f7f7",
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 24,
    alignItems: "center",
  },
  title: {
    marginTop: 12,
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
  },
  description: {
    marginTop: 8,
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 20,
  },
  button: {
    marginTop: 18,
    backgroundColor: "#0f766e",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "700",
  },
});
