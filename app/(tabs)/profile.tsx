import { RouteGuard } from "@/components/RouteGuard";
import { useToast } from "@/context/ToastContext";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

// ✅ Updated UserProfile interface to match user object
interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  roleId: string;
  roleName?: string;
  status: string;
  mobile: string | null;
  firstName?: string;
  lastName?: string;
  // ✅ Add optional fields that might come from user
  token?: string;
  avatar?: string;
}

export default function ProfilePage() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // ✅ Fix: Cast user to UserProfile or use null
  const [profileData, setProfileData] = useState<UserProfile | null>(
    user as UserProfile | null,
  );

  // Fetch latest profile data from API
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await api.get<UserProfile>("/api/users/profile");

      if (data) {
        setProfileData(data);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        console.error("Profile fetch error:", err.message);
        // Fallback to user from context
        setProfileData(user as UserProfile | null);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfile();
  };

  const roleLabel = (() => {
    const roleValue = (profileData?.roleId as string | undefined) || "";
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
          <Text style={styles.emptyText}>
            Sign in to view your profile details.
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.replace("/login")}
          >
            <Text style={styles.primaryButtonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentUser = profileData || user;

  // ✅ Safely get initials
  const getInitials = () => {
    if (!currentUser) return "U";
    const name = currentUser.name || "";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase() || "U";
  };

  const initials = getInitials();

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0f766e" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <RouteGuard>
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.headerCard}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>

            <Text style={styles.name}>{currentUser?.name || "User"}</Text>
            <Text style={styles.role}>{roleLabel}</Text>
            <Text style={styles.accountNote}>
              This profile is linked to your signed-in account.
            </Text>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Icon name="person-outline" size={20} color="#0f766e" />
              <View style={styles.infoTextWrap}>
                <Text style={styles.infoLabel}>Name</Text>
                <Text style={styles.infoValue}>
                  {currentUser?.name || "Not available"}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Icon name="email" size={20} color="#0f766e" />
              <View style={styles.infoTextWrap}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>
                  {currentUser?.email || "Not available"}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Icon name="phone" size={20} color="#0f766e" />
              <View style={styles.infoTextWrap}>
                <Text style={styles.infoLabel}>Mobile Number</Text>
                <Text style={styles.infoValue}>
                  {currentUser?.mobile || "Not available"}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Icon name="verified-user" size={20} color="#0f766e" />
              <View style={styles.infoTextWrap}>
                <Text style={styles.infoLabel}>Role</Text>
                <Text style={styles.infoValue}>{roleLabel}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Icon name="badge" size={20} color="#0f766e" />
              <View style={styles.infoTextWrap}>
                <Text style={styles.infoLabel}>Status</Text>
                <Text
                  style={[
                    styles.infoValue,
                    currentUser?.status === "ACTIVE"
                      ? styles.statusActive
                      : styles.statusPending,
                  ]}
                >
                  {currentUser?.status || "ACTIVE"}
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={handleLogout}>
            <Icon
              name="logout"
              size={20}
              color="#fff"
              style={styles.buttonIcon}
            />
            <Text style={styles.primaryButtonText}>Logout</Text>
          </TouchableOpacity>

          <Text style={styles.versionText}>App Version 1.0.0</Text>
        </ScrollView>
      </SafeAreaView>
    </RouteGuard>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#64748b",
    fontSize: 14,
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
  statusActive: {
    color: "#10b981",
  },
  statusPending: {
    color: "#f59e0b",
  },
  primaryButton: {
    marginTop: 24,
    backgroundColor: "#0f766e",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  buttonIcon: {
    marginRight: 8,
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
  versionText: {
    marginTop: 20,
    textAlign: "center",
    color: "#94a3b8",
    fontSize: 12,
  },
});
