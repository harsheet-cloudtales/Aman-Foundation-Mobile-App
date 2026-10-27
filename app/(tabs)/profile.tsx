import { RouteGuard } from "@/components/RouteGuard";
import { useToast } from "@/context/ToastContext";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

const { width } = Dimensions.get("window");

// ============================================
// THEME COLORS (for footer gradient)
// ============================================
const colors = {
  primary: "#006857",
  primaryContainer: "#00846e",
};

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
  token?: string;
  avatar?: string;
}

// ============================================
// FOOTER COMPONENT  (from Dashboard)
// ============================================
const Footer = () => (
  <View style={styles.footer}>
    <View style={styles.footerLogoContainer}>
      <LinearGradient
        colors={[colors.primary, colors.primaryContainer]}
        style={styles.footerLogoIcon}
      >
        <Ionicons name="business-outline" size={22} color="#fff" />
      </LinearGradient>
      <View>
        <Text style={styles.footerFoundationName}>Aman Foundation</Text>
        <Text style={styles.footerTagline}>
          Creating lasting impact in communities
        </Text>
      </View>
    </View>
    <View style={styles.footerBottom}>
      <Text style={styles.footerCopyright}>
        © 2026 Aman Foundation. All Rights Reserved.
      </Text>
    </View>
  </View>
);

export default function ProfilePage() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // ============ SIDEBAR STATE ============
  const [menuOpen, setMenuOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-width)).current;

  const [educationDropdownOpen, setEducationDropdownOpen] = useState(false);
  const [reportsDropdownOpen, setReportsDropdownOpen] = useState(false);
  const [livelihoodDropdownOpen, setLivelihoodDropdownOpen] = useState(false);
  const [authDropdownOpen, setAuthDropdownOpen] = useState(false);

  const educationRotateAnim = useRef(new Animated.Value(0)).current;
  const reportsRotateAnim = useRef(new Animated.Value(0)).current;
  const livelihoodRotateAnim = useRef(new Animated.Value(0)).current;
  const authRotateAnim = useRef(new Animated.Value(0)).current;

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

  // ============ SIDEBAR CONTROLS ============
  const toggleMenu = () => {
    if (menuOpen) {
      Animated.timing(slideAnim, {
        toValue: -width,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setMenuOpen(false));
    } else {
      setMenuOpen(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const closeMenu = () => {
    if (menuOpen) {
      Animated.timing(slideAnim, {
        toValue: -width,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setMenuOpen(false));
    }
  };

  const handleNavigation = (route: string) => {
    closeMenu();
    setTimeout(() => {
      router.push(route as any);
    }, 150);
  };

  const toggleEducationDropdown = () => {
    Animated.timing(educationRotateAnim, {
      toValue: educationDropdownOpen ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    setEducationDropdownOpen(!educationDropdownOpen);
  };

  const toggleReportsDropdown = () => {
    Animated.timing(reportsRotateAnim, {
      toValue: reportsDropdownOpen ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    setReportsDropdownOpen(!reportsDropdownOpen);
  };

  const toggleLivelihoodDropdown = () => {
    Animated.timing(livelihoodRotateAnim, {
      toValue: livelihoodDropdownOpen ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    setLivelihoodDropdownOpen(!livelihoodDropdownOpen);
  };

  const toggleAuthDropdown = () => {
    Animated.timing(authRotateAnim, {
      toValue: authDropdownOpen ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    setAuthDropdownOpen(!authDropdownOpen);
  };

  const rotateEducation = educationRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });
  const rotateReports = reportsRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });
  const rotateLivelihood = livelihoodRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });
  const rotateAuth = authRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

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
      <View style={{ flex: 1 }}>
        {/* OVERLAY */}
        {menuOpen && (
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={closeMenu}
          />
        )}

        {/* ============================================
            SIDEBAR — copied from Dashboard
        ============================================ */}
        <Animated.View
          style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* BRAND */}
            <View style={styles.brandContainer}>
              <View style={styles.brandIcon}>
                <Ionicons name="business-outline" size={22} color="#fff" />
              </View>
              <View>
                <Text style={styles.brandTitle}>Aman Foundation</Text>
                <Text style={styles.brandSub}>Impact Portal</Text>
              </View>
            </View>

            {/* DASHBOARD */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigation("/")}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons name="grid-outline" size={20} color="#4b5563" />
                <Text style={styles.menuText}>Dashboard</Text>
              </View>
            </TouchableOpacity>

            {/* EDUCATION DROPDOWN */}
            <View>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={toggleEducationDropdown}
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons name="school-outline" size={20} color="#4b5563" />
                  <Text style={styles.menuText}>Education</Text>
                </View>
                <Animated.View
                  style={{ transform: [{ rotate: rotateEducation }] }}
                >
                  <Ionicons name="chevron-down" size={20} color="#6b7280" />
                </Animated.View>
              </TouchableOpacity>

              {educationDropdownOpen && (
                <View style={styles.subNav}>
                  <TouchableOpacity
                    style={styles.subNavItem}
                    onPress={() =>
                      handleNavigation("/education_management_hub")
                    }
                  >
                    <Ionicons
                      name="library-outline"
                      size={16}
                      color="#6b7280"
                    />
                    <Text style={styles.subNavText}>Management Hub</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.subNavItem}
                    onPress={() =>
                      handleNavigation("/education_schools_module")
                    }
                  >
                    <Ionicons
                      name="business-outline"
                      size={16}
                      color="#6b7280"
                    />
                    <Text style={styles.subNavText}>Schools Overview</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.subNavItem}
                    onPress={() =>
                      handleNavigation("/education_fellows_module")
                    }
                  >
                    <Ionicons name="people-outline" size={16} color="#6b7280" />
                    <Text style={styles.subNavText}>Fellows Directory</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.subNavItem}
                    onPress={() =>
                      handleNavigation("/education_students_module")
                    }
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={16}
                      color="#6b7280"
                    />
                    <Text style={styles.subNavText}>Active Programs</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.subNavItem}
                    onPress={() => handleNavigation("/education_pta_programs")}
                  >
                    <Ionicons
                      name="document-text-outline"
                      size={16}
                      color="#6b7280"
                    />
                    <Text style={styles.subNavText}>PTA and Programs</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.subNavItem}
                    onPress={() => handleNavigation("/after-school-students")}
                  >
                    <Ionicons
                      name="document-text-outline"
                      size={16}
                      color="#6b7280"
                    />
                    <Text style={styles.subNavText}>After-School-Students</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.subNavItem}
                    onPress={() => handleNavigation("/after-school-centres")}
                  >
                    <Ionicons
                      name="document-text-outline"
                      size={16}
                      color="#6b7280"
                    />
                    <Text style={styles.subNavText}>After-School-Centres</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* FELLOW OBERVATION DROPDOWN */}
            <View>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={toggleReportsDropdown}
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons
                    name="bar-chart-outline"
                    size={20}
                    color="#4b5563"
                  />
                  <Text style={styles.menuText}>Fellow Obervation</Text>
                </View>
                <Animated.View
                  style={{ transform: [{ rotate: rotateReports }] }}
                >
                  <Ionicons name="chevron-down" size={20} color="#6b7280" />
                </Animated.View>
              </TouchableOpacity>

              {reportsDropdownOpen && (
                <View style={styles.subNav}>
                  <TouchableOpacity
                    style={styles.subNavItem}
                    onPress={() => handleNavigation("/PM Reflection")}
                  >
                    <Ionicons
                      name="stats-chart-outline"
                      size={16}
                      color="#6b7280"
                    />
                    <Text style={styles.subNavText}>PM Reflection</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.subNavItem}
                    onPress={() => handleNavigation("/PerformanceTracking")}
                  >
                    <Ionicons
                      name="clipboard-outline"
                      size={16}
                      color="#6b7280"
                    />
                    <Text style={styles.subNavText}>
                      Fellow Performance Tracking
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* LIVELIHOOD DROPDOWN */}
            <View>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={toggleLivelihoodDropdown}
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons name="leaf-outline" size={20} color="#4b5563" />
                  <Text style={styles.menuText}>Livelihood</Text>
                </View>
                <Animated.View
                  style={{ transform: [{ rotate: rotateLivelihood }] }}
                >
                  <Ionicons name="chevron-down" size={20} color="#6b7280" />
                </Animated.View>
              </TouchableOpacity>

              {livelihoodDropdownOpen && (
                <View style={styles.subNav}>
                  <TouchableOpacity
                    style={styles.subNavItem}
                    onPress={() =>
                      handleNavigation("/livelihood_management_hub")
                    }
                  >
                    <Ionicons name="apps-outline" size={16} color="#6b7280" />
                    <Text style={styles.subNavText}>Management Hub</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.subNavItem}
                    onPress={() =>
                      handleNavigation("/livelihood_goat_rearing_1")
                    }
                  >
                    <Ionicons name="paw-outline" size={16} color="#6b7280" />
                    <Text style={styles.subNavText}>Goat Rearing</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.subNavItem}
                    onPress={() =>
                      handleNavigation("/livelihood_sugarcane_cultivation")
                    }
                  >
                    <Ionicons name="leaf-outline" size={16} color="#6b7280" />
                    <Text style={styles.subNavText}>Agriculture Support</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.subNavItem}
                    onPress={() =>
                      handleNavigation("/beneficiary_master_profile")
                    }
                  >
                    <Ionicons
                      name="people-circle-outline"
                      size={16}
                      color="#6b7280"
                    />
                    <Text style={styles.subNavText}>Beneficiaries</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* FULL ACCESS ITEMS */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigation("/disaster_relief_management")}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons name="snow-outline" size={20} color="#4b5563" />
                <Text style={styles.menuText}>Disaster Relief</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigation("/travel")}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons name="airplane" size={20} color="#4b5563" />
                <Text style={styles.menuText}>Travel Management</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigation("/hr_employee_management")}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons name="people-outline" size={20} color="#4b5563" />
                <Text style={styles.menuText}>HR Management</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigation("/admin_access_control")}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons
                  name="document-text-outline"
                  size={20}
                  color="#4b5563"
                />
                <Text style={styles.menuText}>Admin & Access</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigation("/(tabs)/leaves")}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons name="calendar-outline" size={20} color="#4b5563" />
                <Text style={styles.menuText}>Leaves</Text>
              </View>
            </TouchableOpacity>

            {/* ACCOUNT SECTION */}
            <View style={styles.menuDivider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ACCOUNT</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* ACTIVE — My Profile */}
            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemActive]}
              onPress={() => closeMenu()}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons name="person-outline" size={20} color="#047857" />
                <Text style={[styles.menuText, styles.menuTextActive]}>
                  My Profile
                </Text>
              </View>
            </TouchableOpacity>

            <View>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={toggleAuthDropdown}
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons name="key-outline" size={20} color="#4b5563" />
                  <Text style={styles.menuText}>Authentication</Text>
                </View>
                <Animated.View style={{ transform: [{ rotate: rotateAuth }] }}>
                  <Ionicons name="chevron-down" size={20} color="#6b7280" />
                </Animated.View>
              </TouchableOpacity>

              {authDropdownOpen && (
                <View style={styles.subNav}>
                  <TouchableOpacity
                    style={styles.subNavItem}
                    onPress={() => handleNavigation("/login")}
                  >
                    <Ionicons name="log-in-outline" size={16} color="#6b7280" />
                    <Text style={styles.subNavText}>Login Page</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.subNavItem}
                    onPress={() => handleNavigation("/registration")}
                  >
                    <Ionicons
                      name="person-add-outline"
                      size={16}
                      color="#6b7280"
                    />
                    <Text style={styles.subNavText}>Register Page</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.subNavItem, styles.subNavItemLogout]}
                    onPress={handleLogout}
                  >
                    <Ionicons
                      name="log-out-outline"
                      size={16}
                      color="#ef4444"
                    />
                    <Text style={[styles.subNavText, styles.subNavTextLogout]}>
                      Logout
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* HELP */}
            <View style={styles.sidebarFooter}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => closeMenu()}
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons
                    name="help-circle-outline"
                    size={20}
                    color="#4b5563"
                  />
                  <Text style={styles.menuText}>Help</Text>
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>

        {/* ============================================
            MAIN CONTENT
        ============================================ */}
        <SafeAreaView style={styles.container}>
          {/* HEADER BAR */}
          <View style={styles.headerBar}>
            <TouchableOpacity onPress={toggleMenu}>
              <Ionicons name="menu-outline" size={26} color="#1f2937" />
            </TouchableOpacity>
            <Text style={styles.headerBarTitle}>My Profile</Text>
            <View style={styles.headerIcons}>
              <TouchableOpacity
                onPress={() => toast.info("No new notifications")}
              >
                <Ionicons
                  name="notifications-outline"
                  size={22}
                  color="#1f2937"
                />
              </TouchableOpacity>
            </View>
          </View>

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

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleLogout}
            >
              <Icon
                name="logout"
                size={20}
                color="#fff"
                style={styles.buttonIcon}
              />
              <Text style={styles.primaryButtonText}>Logout</Text>
            </TouchableOpacity>

            <Text style={styles.versionText}>App Version 1.0.0</Text>

            {/* Footer — from Dashboard */}
            <Footer />
          </ScrollView>
        </SafeAreaView>
      </View>
    </RouteGuard>
  );
}

const styles = StyleSheet.create({
  // ============================================
  // 1. SIDEBAR
  // ============================================
  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.3)",
    zIndex: 5,
  },
  sidebar: {
    position: "absolute",
    width: width * 0.78,
    maxWidth: 300,
    height: "100%",
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 56 : 40,
    paddingBottom: 20,
    zIndex: 10,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  brandContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  brandIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#047857",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  brandTitle: { fontSize: 16, fontWeight: "700", color: "#134e4a" },
  brandSub: { fontSize: 11, color: "#3d4945" },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 40,
    marginBottom: 4,
  },
  menuItemActive: { backgroundColor: "#e8f5e9" },
  menuItemLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  menuText: {
    marginLeft: 12,
    fontSize: 14,
    color: "#4b5563",
    fontWeight: "500",
  },
  menuTextActive: { color: "#047857", fontWeight: "700" },
  subNav: {
    marginLeft: 20,
    marginTop: 2,
    marginBottom: 8,
    borderLeftWidth: 2,
    borderLeftColor: "#d1fae5",
    paddingLeft: 16,
  },
  subNavItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 9,
    paddingHorizontal: 4,
    gap: 10,
    borderRadius: 8,
  },
  subNavItemLogout: {
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    marginTop: 4,
    paddingTop: 12,
  },
  subNavText: { fontSize: 13, fontWeight: "500", color: "#4b5563" },
  subNavTextLogout: { color: "#ef4444", fontWeight: "600" },
  menuDivider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
    paddingHorizontal: 4,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#e5e7eb" },
  dividerText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#9ca3af",
    paddingHorizontal: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sidebarFooter: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },

  // ============================================
  // 2. MAIN CONTAINER & HEADER BAR
  // ============================================
  container: {
    flex: 1,
    backgroundColor: "#f3f7f7",
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 56 : 40,
    paddingBottom: 12,
    backgroundColor: "#f3f7f7",
  },
  headerBarTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    flex: 1,
    textAlign: "center",
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
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

  // ============================================
  // 3. FOOTER  (from Dashboard)
  // ============================================
  footer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginTop: 40,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#EDEEEF",
  },
  footerLogoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  footerLogoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  footerFoundationName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#065f46",
  },
  footerTagline: { fontSize: 12, color: "#6B7280", lineHeight: 16 },
  footerBottom: {
    borderTopWidth: 1,
    borderTopColor: "#EDEEEF",
    paddingTop: 16,
  },
  footerCopyright: { fontSize: 12, color: "#6B7280" },
});
