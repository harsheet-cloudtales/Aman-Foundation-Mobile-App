import { useAuth } from "@/lib/useAuth";
import { useRouter } from "expo-router";
import { ReactNode, useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

interface RouteGuardProps {
  children: ReactNode;
  allowedRoles?: string[];
}

export function RouteGuard({ children, allowedRoles }: RouteGuardProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // Check authentication
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    // Check role-based access
    if (allowedRoles && user) {
      const userRole = user.roleName || user.roleId || "";
      if (!allowedRoles.includes(userRole)) {
        router.replace("/unauthorized");
        return;
      }
    }
  }, [isAuthenticated, isLoading, user, allowedRoles]);

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0d9488" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Not authenticated - return null (will redirect via useEffect)
  if (!isAuthenticated) {
    return null;
  }

  // Role check failed
  if (allowedRoles && user) {
    const userRole = user.roleName || user.roleId || "";
    if (!allowedRoles.includes(userRole)) {
      return null;
    }
  }

  // Render children
  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748b",
  },
});
