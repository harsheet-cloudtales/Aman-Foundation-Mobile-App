import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/lib/useAuth";
import { useRouter } from "expo-router";
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

export default function ProfilePage() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const roleLabel = (() => {
    const roleValue = (user?.roleId as string | undefined) || "";
    if (!roleValue) return "User";
    if (roleValue.toLowerCase().includes("admin")) return "Administrator";
    if (roleValue.toLowerCase().includes("manager")) return "Program Manager";
    if (roleValue.toLowerCase().includes("fellow")) return "Fellow";
    return roleValue;
  })();

  const handleLogout = async () => {
    await logout();
    toast.success("You have been logged out.");
    router.replace("/login");
  };

  if (!isAuthenticated || !user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Icon name="account-circle" size={48} color="#0f766e" />
          <Text style={styles.emptyTitle}>No account signed in</Text>
          <Text style={styles.emptyText}>Sign in to view your profile details.</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.replace("/login")}>
            <Text style={styles.primaryButtonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const initials = `${user.firstName || user.name?.split(" ")[0] || "U"}${user.lastName || user.name?.split(" ")[1] || ""}`
    .trim()
    .slice(0, 2)
    .toUpperCase();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials || "U"}</Text>
          </View>

          <Text style={styles.name}>{user.name || "User"}</Text>
          <Text style={styles.role}>{roleLabel}</Text>
          <Text style={styles.accountNote}>This profile is linked to your signed-in account.</Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Icon name="person-outline" size={20} color="#0f766e" />
            <View style={styles.infoTextWrap}>
              <Text style={styles.infoLabel}>Name</Text>
              <Text style={styles.infoValue}>{user.name || "Not available"}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Icon name="email" size={20} color="#0f766e" />
            <View style={styles.infoTextWrap}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user.email || "Not available"}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Icon name="phone" size={20} color="#0f766e" />
            <View style={styles.infoTextWrap}>
              <Text style={styles.infoLabel}>Mobile Number</Text>
              <Text style={styles.infoValue}>{user.mobile || "Not available"}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Icon name="verified-user" size={20} color="#0f766e" />
            <View style={styles.infoTextWrap}>
              <Text style={styles.infoLabel}>Role</Text>
              <Text style={styles.infoValue}>{roleLabel}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleLogout}>
          <Text style={styles.primaryButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f7f7",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  headerCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#0f766e",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarText: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "700",
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a",
  },
  role: {
    marginTop: 6,
    fontSize: 16,
    color: "#0f766e",
    fontWeight: "600",
  },
  accountNote: {
    marginTop: 10,
    color: "#64748b",
    textAlign: "center",
  },
  infoCard: {
    marginTop: 20,
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  infoTextWrap: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    color: "#64748b",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoValue: {
    marginTop: 2,
    fontSize: 16,
    color: "#0f172a",
    fontWeight: "600",
  },
  primaryButton: {
    marginTop: 24,
    backgroundColor: "#0f766e",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
  },
  emptyText: {
    marginTop: 8,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 20,
  },
});