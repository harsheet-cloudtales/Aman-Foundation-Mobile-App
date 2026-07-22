import { useAuth } from "@/lib/useAuth";
import { Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

export default function TabLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Protect all tabs - redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading]);

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <ActivityIndicator size="large" color="#0d9488" />
      </View>
    );
  }

  // Return null if not authenticated (will redirect via useEffect)
  if (!isAuthenticated) {
    return null;
  }

  // Render tabs if authenticated
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: "none" }, // Hide tab bar
        tabBarActiveTintColor: "#0d9488",
        tabBarInactiveTintColor: "#94a3b8",
      }}
    >
      {/*  Dashboard - MUST match file name (index.tsx) */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />

      {/*  Education Hub - MUST match file name */}
      <Tabs.Screen
        name="education_management_hub"
        options={{
          title: "Education",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="school-outline" size={size} color={color} />
          ),
        }}
      />

      {/*  Schools Module */}
      <Tabs.Screen
        name="education_schools_module"
        options={{
          title: "Schools",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="business-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Fellows Module */}
      <Tabs.Screen
        name="education_fellows_module"
        options={{
          title: "Fellows",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />

      {/*  Students Module */}
      <Tabs.Screen
        name="education_students_module"
        options={{
          title: "Students",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />

      {/*  PTA Programs */}
      <Tabs.Screen
        name="education_pta_programs"
        options={{
          title: "Programs",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" size={size} color={color} />
          ),
        }}
      />

      {/*  Livelihood Hub */}
      <Tabs.Screen
        name="livelihood_management_hub"
        options={{
          title: "Livelihood",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bicycle-outline" size={size} color={color} />
          ),
        }}
      />

      {/*  Goat Rearing */}
      <Tabs.Screen
        name="livelihood_goat_rearing_1"
        options={{
          title: "Goat Rearing",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="paw-outline" size={size} color={color} />
          ),
        }}
      />

      {/*  Sugarcane Cultivation */}
      <Tabs.Screen
        name="livelihood_sugarcane_cultivation"
        options={{
          title: "Agriculture",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="leaf-outline" size={size} color={color} />
          ),
        }}
      />

      {/*  Beneficiaries */}
      <Tabs.Screen
        name="beneficiary_master_profile"
        options={{
          title: "Beneficiaries",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-circle-outline" size={size} color={color} />
          ),
        }}
      />

      {/*  Disaster Relief */}
      <Tabs.Screen
        name="disaster_relief_management"
        options={{
          title: "Disaster Relief",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="snow-outline" size={size} color={color} />
          ),
        }}
      />

      {/*  HR Management */}
      <Tabs.Screen
        name="hr_employee_management"
        options={{
          title: "HR Management",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />

      {/*  Admin Access Control */}
      <Tabs.Screen
        name="admin_access_control"
        options={{
          title: "Admin",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="shield-outline" size={size} color={color} />
          ),
        }}
      />

      {/*  Leaves */}
      <Tabs.Screen
        name="leaves"
        options={{
          title: "Leaves",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Profile */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Explore - Remove if you don't have this file */}
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
