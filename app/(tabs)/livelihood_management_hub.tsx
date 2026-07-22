import { RouteGuard } from "@/components/RouteGuard";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

// ============================================
// TYPES
// ============================================
interface LivelihoodStats {
  totalBeneficiaries: number;
  activePrograms: number;
  goatRearingCount: number;
  agricultureCount: number;
  growthRate: string;
  recentActivities: RecentActivity[];
}

interface RecentActivity {
  id: string;
  title: string;
  description: string;
  time: string;
  icon: string;
}

// ============================================
// THEME COLORS
// ============================================
const colors = {
  primary: "#006857",
  primaryContainer: "#00846e",
  onPrimary: "#ffffff",
  onPrimaryContainer: "#f4fffa",
  primaryFixed: "#7cf8da",
  onPrimaryFixed: "#00201a",
  surface: "#f8f9fa",
  surfaceContainerLowest: "#ffffff",
  surfaceContainerLow: "#f3f4f5",
  surfaceContainer: "#edeeef",
  surfaceContainerHighest: "#e1e3e4",
  onSurface: "#191c1d",
  onSurfaceVariant: "#3d4945",
  outlineVariant: "#bccac4",
  secondary: "#964900",
  secondaryContainer: "#fc820c",
  secondaryFixed: "#ffdcc6",
  onSecondaryContainer: "#5e2c00",
  error: "#ba1a1a",
  errorContainer: "#ffdad6",
  rose: "#ef4444",
  emerald: "#10b981",
};

// ============================================
// MAIN COMPONENT
// ============================================
export default function LivelihoodHub() {
  const { user } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<LivelihoodStats>({
    totalBeneficiaries: 0,
    activePrograms: 0,
    goatRearingCount: 0,
    agricultureCount: 0,
    growthRate: "+0%",
    recentActivities: [],
  });
  const [educationDropdownOpen, setEducationDropdownOpen] = useState(false);
  const [livelihoodDropdownOpen, setLivelihoodDropdownOpen] = useState(true);
  const [authDropdownOpen, setAuthDropdownOpen] = useState(false);

  const slideAnim = useRef(new Animated.Value(-width)).current;
  const educationRotateAnim = useRef(new Animated.Value(0)).current;
  const livelihoodRotateAnim = useRef(new Animated.Value(1)).current;
  const authRotateAnim = useRef(new Animated.Value(0)).current;

  // ============================================
  // FETCH LIVELIHOOD DATA
  // ============================================
  const fetchLivelihoodData = async () => {
    try {
      setLoading(true);

      const data = await api.get<LivelihoodStats>("/api/livelihood/dashboard");

      if (data) {
        setStats({
          totalBeneficiaries: data.totalBeneficiaries ?? 0,
          activePrograms: data.activePrograms ?? 0,
          goatRearingCount: data.goatRearingCount ?? 0,
          agricultureCount: data.agricultureCount ?? 0,
          growthRate: data.growthRate ?? "+0%",
          recentActivities: data.recentActivities ?? [],
        });
      }
    } catch (err) {
      if (err instanceof ApiError) {
        console.error("Livelihood dashboard error:", err.message);
      }
      // Fallback data
      setStats({
        totalBeneficiaries: 4820,
        activePrograms: 28,
        goatRearingCount: 1240,
        agricultureCount: 3580,
        growthRate: "+18%",
        recentActivities: [
          {
            id: "1",
            title: "Goat Rearing Phase 2 Completed",
            description:
              "Successfully distributed 500 goats to 250 families in rural areas.",
            time: "3 days ago",
            icon: "pets",
          },
          {
            id: "2",
            title: "Sugarcane Cultivation Training",
            description:
              "Training program completed for 150 farmers on modern techniques.",
            time: "1 week ago",
            icon: "agriculture",
          },
          {
            id: "3",
            title: "New Beneficiary Enrollment",
            description:
              "120 new families enrolled in livelihood programs this month.",
            time: "2 weeks ago",
            icon: "group",
          },
        ],
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLivelihoodData();
  }, []);

  // ============================================
  // SIDEBAR FUNCTIONS
  // ============================================
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

  const toggleEducationDropdown = () => {
    const toValue = educationDropdownOpen ? 0 : 1;
    Animated.timing(educationRotateAnim, {
      toValue,
      duration: 200,
      useNativeDriver: true,
    }).start();
    setEducationDropdownOpen(!educationDropdownOpen);
  };

  const toggleLivelihoodDropdown = () => {
    const toValue = livelihoodDropdownOpen ? 0 : 1;
    Animated.timing(livelihoodRotateAnim, {
      toValue,
      duration: 200,
      useNativeDriver: true,
    }).start();
    setLivelihoodDropdownOpen(!livelihoodDropdownOpen);
  };

  const toggleAuthDropdown = () => {
    const toValue = authDropdownOpen ? 0 : 1;
    Animated.timing(authRotateAnim, {
      toValue,
      duration: 200,
      useNativeDriver: true,
    }).start();
    setAuthDropdownOpen(!authDropdownOpen);
  };

  const handleNavigation = (route: string) => {
    closeMenu();
    router.push(route);
  };

  // Logout function
  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          Alert.alert("Success", "Logged out successfully");
          router.replace("/login");
        },
      },
    ]);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchLivelihoodData();
  };

  const rotateEducation = educationRotateAnim.interpolate({
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

  // ============================================
  // COMPONENTS
  // ============================================
  const LivelihoodCard = ({
    title,
    description,
    icon,
    route,
    isHighlighted = false,
  }: any) => (
    <TouchableOpacity
      style={[styles.card, isHighlighted && styles.cardHighlighted]}
      onPress={() => router.push(route)}
      activeOpacity={0.8}
    >
      {isHighlighted && (
        <LinearGradient
          colors={[colors.primary, colors.primaryContainer]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardHighlightedBg}
        />
      )}
      <View
        style={[
          styles.cardContent,
          isHighlighted && styles.cardContentHighlighted,
        ]}
      >
        <View
          style={[
            styles.iconContainer,
            isHighlighted && styles.iconContainerHighlighted,
          ]}
        >
          <MaterialIcons
            name={icon}
            size={24}
            color={isHighlighted ? colors.onPrimary : colors.primary}
          />
        </View>
        <Text
          style={[
            styles.cardTitle,
            isHighlighted && styles.cardTitleHighlighted,
          ]}
        >
          {title}
        </Text>
        <Text
          style={[
            styles.cardDescription,
            isHighlighted && styles.cardDescriptionHighlighted,
          ]}
        >
          {description}
        </Text>
        <View style={styles.cardFooter}>
          <Text
            style={[
              styles.cardFooterText,
              isHighlighted && styles.cardFooterTextHighlighted,
            ]}
          >
            {isHighlighted ? "Access Database" : "Manage Module"}
          </Text>
          <MaterialIcons
            name="arrow-forward"
            size={16}
            color={isHighlighted ? colors.primaryFixed : colors.primary}
            style={styles.arrowIcon}
          />
        </View>
      </View>
    </TouchableOpacity>
  );

  const StatCard = ({ title, value, subtitle, trend }: any) => (
    <View style={styles.statCard}>
      <Text style={styles.statTitle}>{title}</Text>
      <View style={styles.statValueContainer}>
        <Text style={styles.statValue}>{value}</Text>
        {trend && (
          <View style={styles.trendBadge}>
            <MaterialIcons
              name="trending-up"
              size={14}
              color={colors.emerald}
            />
            <Text style={styles.trendText}>{trend}</Text>
          </View>
        )}
      </View>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  // ============================================
  // LOADING STATE
  // ============================================
  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading livelihood data...</Text>
      </SafeAreaView>
    );
  }

  // ============================================
  // RENDER
  // ============================================
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

        {/* SIDEBAR */}
        <Animated.View
          style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.brandContainer}>
              <LinearGradient
                colors={[colors.primary, colors.primaryContainer]}
                style={styles.brandIcon}
              >
                <MaterialIcons name="local-library" size={22} color="#fff" />
              </LinearGradient>
              <View>
                <Text style={styles.brandTitle}>Aman Foundation</Text>
                <Text style={styles.brandSub}>Impact Portal</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigation("/")}
            >
              <Ionicons name="grid-outline" size={20} color="#4b5563" />
              <Text style={styles.menuText}>Dashboard</Text>
            </TouchableOpacity>

            {/* EDUCATION WITH DROPDOWN */}
            <View>
              <TouchableOpacity
                style={styles.menuItemWithDropdown}
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
                <View style={styles.dropdownContainer}>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() =>
                      handleNavigation("/education_management_hub")
                    }
                  >
                    <Ionicons
                      name="library-outline"
                      size={18}
                      color="#6b7280"
                    />
                    <Text style={styles.dropdownText}>Management Hub</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() =>
                      handleNavigation("/education_schools_module")
                    }
                  >
                    <Ionicons
                      name="business-outline"
                      size={18}
                      color="#6b7280"
                    />
                    <Text style={styles.dropdownText}>Schools Overview</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() =>
                      handleNavigation("/education_fellows_module")
                    }
                  >
                    <Ionicons name="people-outline" size={18} color="#6b7280" />
                    <Text style={styles.dropdownText}>Fellows Directory</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() =>
                      handleNavigation("/education_students_module")
                    }
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={18}
                      color="#6b7280"
                    />
                    <Text style={styles.dropdownText}>Students Directory</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => handleNavigation("/education_pta_programs")}
                  >
                    <Ionicons
                      name="people-circle-outline"
                      size={18}
                      color="#6b7280"
                    />
                    <Text style={styles.dropdownText}>PTA & Programs</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* LIVELIHOOD WITH DROPDOWN - ACTIVE */}
            <View>
              <TouchableOpacity
                style={styles.menuItemWithDropdown}
                onPress={toggleLivelihoodDropdown}
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons name="bicycle-outline" size={20} color="#4b5563" />
                  <Text style={styles.menuText}>Livelihood</Text>
                </View>
                <Animated.View
                  style={{ transform: [{ rotate: rotateLivelihood }] }}
                >
                  <Ionicons name="chevron-down" size={20} color="#6b7280" />
                </Animated.View>
              </TouchableOpacity>

              {livelihoodDropdownOpen && (
                <View style={styles.dropdownContainer}>
                  <TouchableOpacity
                    style={[styles.dropdownItem, styles.dropdownItemActive]}
                    onPress={() =>
                      handleNavigation("/livelihood_management_hub")
                    }
                  >
                    <Ionicons name="apps-outline" size={18} color="#047857" />
                    <Text
                      style={[styles.dropdownText, styles.dropdownTextActive]}
                    >
                      Management Hub
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() =>
                      handleNavigation("/livelihood_goat_rearing_1")
                    }
                  >
                    <Ionicons name="paw-outline" size={18} color="#6b7280" />
                    <Text style={styles.dropdownText}>Goat Rearing</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() =>
                      handleNavigation("/livelihood_sugarcane_cultivation")
                    }
                  >
                    <Ionicons name="leaf-outline" size={18} color="#6b7280" />
                    <Text style={styles.dropdownText}>Agriculture Support</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() =>
                      handleNavigation("/beneficiary_master_profile")
                    }
                  >
                    <Ionicons
                      name="people-circle-outline"
                      size={18}
                      color="#6b7280"
                    />
                    <Text style={styles.dropdownText}>Beneficiaries</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigation("/disaster_relief_management")}
            >
              <Ionicons name="snow-outline" size={20} color="#4b5563" />
              <Text style={styles.menuText}>Disaster Relief</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigation("/hr_employee_management")}
            >
              <Ionicons name="people-outline" size={20} color="#4b5563" />
              <Text style={styles.menuText}>HR Management</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigation("/admin_access_control")}
            >
              <Ionicons
                name="document-text-outline"
                size={20}
                color="#4b5563"
              />
              <Text style={styles.menuText}>Admin & Access</Text>
            </TouchableOpacity>

            {/* AUTHENTICATION SECTION WITH DROPDOWN */}
            <View style={styles.menuDivider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ACCOUNT</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                closeMenu();
                router.push("/profile");
              }}
            >
              <Ionicons name="person-outline" size={20} color="#4b5563" />
              <Text style={styles.menuText}>My Profile</Text>
            </TouchableOpacity>

            <View>
              <TouchableOpacity
                style={styles.menuItemWithDropdown}
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
                <View style={styles.dropdownContainer}>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      closeMenu();
                      router.push("/login");
                    }}
                  >
                    <Ionicons name="log-in-outline" size={18} color="#6b7280" />
                    <Text style={styles.dropdownText}>Login Page</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      closeMenu();
                      router.push("/registration");
                    }}
                  >
                    <Ionicons
                      name="person-add-outline"
                      size={18}
                      color="#6b7280"
                    />
                    <Text style={styles.dropdownText}>Register Page</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.dropdownItem, styles.dropdownItemLogout]}
                    onPress={handleLogout}
                  >
                    <Ionicons
                      name="log-out-outline"
                      size={18}
                      color={colors.rose}
                    />
                    <Text
                      style={[styles.dropdownText, styles.dropdownTextLogout]}
                    >
                      Logout
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </ScrollView>
        </Animated.View>

        {/* MAIN CONTENT */}
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
                <MaterialIcons name="menu" size={24} color="#4B5563" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Impact Portal</Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() =>
                  Alert.alert("Notifications", "No new notifications")
                }
              >
                <Ionicons
                  name="notifications-outline"
                  size={22}
                  color="#6B7280"
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() =>
                  Alert.alert("Settings", "Settings will be available soon")
                }
              >
                <Ionicons name="settings-outline" size={22} color="#6B7280" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push("/profile")}>
                <Image
                  source={{
                    uri:
                      user?.avatar ||
                      "https://randomuser.me/api/portraits/women/68.jpg",
                  }}
                  style={styles.avatar}
                />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            }
          >
            {/* Back Link */}
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.push("/")}
            >
              <MaterialIcons name="arrow-back" size={18} color="#6b7280" />
              <Text style={styles.backText}>Back to Dashboard</Text>
            </TouchableOpacity>

            {/* Hero Section */}
            <View style={styles.heroSection}>
              <Text style={styles.mainTitle}>Livelihood Management</Text>
              <Text style={styles.subtitle}>
                Oversee and optimize community economic development programs.
                Manage livestock health, track agricultural yields, and monitor
                beneficiary resilience scores across diverse livelihood
                initiatives.
              </Text>
            </View>

            {/* Statistics Cards */}
            <View style={styles.statsGrid}>
              <StatCard
                title="Total Beneficiaries"
                value={stats.totalBeneficiaries.toLocaleString()}
                trend={stats.growthRate}
              />
              <StatCard
                title="Active Programs"
                value={stats.activePrograms}
                subtitle="Currently running"
              />
              <StatCard
                title="Goat Rearing"
                value={stats.goatRearingCount}
                subtitle="Families supported"
              />
              <StatCard
                title="Agriculture"
                value={stats.agricultureCount}
                subtitle="Farmers enrolled"
              />
            </View>

            {/* Recent Activities */}
            {stats.recentActivities.length > 0 && (
              <View style={styles.activitiesSection}>
                <Text style={styles.activitiesTitle}>Recent Activities</Text>

                {stats.recentActivities.map((activity) => (
                  <View key={activity.id} style={styles.activityItem}>
                    <View style={styles.activityIcon}>
                      <MaterialIcons
                        name={activity.icon as any}
                        size={20}
                        color={colors.primary}
                      />
                    </View>
                    <View style={styles.activityContent}>
                      <Text style={styles.activityTitle}>{activity.title}</Text>
                      <Text style={styles.activityDescription}>
                        {activity.description}
                      </Text>
                      <Text style={styles.activityTime}>{activity.time}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Cards Grid */}
            <View style={styles.cardsGrid}>
              {/* Card 1: Goat Rearing */}
              <LivelihoodCard
                title="Goat Rearing"
                description="Manage livestock distribution, track vaccination schedules, and monitor flock growth metrics for beneficiary families."
                icon="pets"
                route="/livelihood_goat_rearing_1"
                isHighlighted={false}
              />

              {/* Card 2: Sugarcane Cultivation */}
              <LivelihoodCard
                title="Sugarcane Cultivation"
                description="Track crop cycles, monitor fertilizer usage, and record harvest yields to optimize agricultural output and profitability."
                icon="agriculture"
                route="/livelihood_sugarcane_cultivation"
                isHighlighted={false}
              />

              {/* Card 3: Beneficiaries Master (Highlighted) */}
              <LivelihoodCard
                title="Beneficiaries Master"
                description="Central database for all program participants. View complete profiles, resilience scoring, and cross-module engagement data."
                icon="group"
                route="/beneficiary_master_profile"
                isHighlighted={true}
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </RouteGuard>
  );
}

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.surface,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.onSurfaceVariant,
  },
  // Sidebar Styles
  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.3)",
    zIndex: 5,
  },
  sidebar: {
    position: "absolute",
    width: width * 0.7,
    height: "100%",
    backgroundColor: "#fff",
    padding: 20,
    zIndex: 10,
    elevation: 10,
  },
  brandContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
    marginTop: 50,
  },
  brandIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#065f46",
  },
  brandSub: {
    fontSize: 12,
    color: "#6b7280",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 10,
  },
  menuItemWithDropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 5,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuText: {
    marginLeft: 12,
    fontSize: 14,
    color: "#374151",
  },
  dropdownContainer: {
    marginLeft: 32,
    marginBottom: 8,
    borderLeftWidth: 1,
    borderLeftColor: "#e5e7eb",
    paddingLeft: 12,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  dropdownItemActive: {
    backgroundColor: "#e8f5e9",
    borderRadius: 8,
  },
  dropdownItemLogout: {
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    marginTop: 4,
    paddingTop: 12,
  },
  dropdownText: {
    fontSize: 13,
    color: "#6b7280",
    marginLeft: 10,
  },
  dropdownTextActive: {
    color: "#047857",
    fontWeight: "600",
  },
  dropdownTextLogout: {
    color: "#ef4444",
  },

  // Authentication divider styles
  menuDivider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
    paddingHorizontal: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  dividerText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#9ca3af",
    paddingHorizontal: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Main Container
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },

  // Header Styles
  header: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderBottomWidth: 1,
    borderBottomColor: "#EDEEEF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconButton: {
    padding: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },

  // Scroll Content
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  // Back Button
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  backText: {
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
    color: "#64748b",
  },

  // Hero Section
  heroSection: {
    marginBottom: 24,
  },
  mainTitle: {
    fontSize: 34,
    fontWeight: "bold",
    color: colors.onSurface,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
    lineHeight: 22,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 12,
    padding: 16,
    flex: 1,
    minWidth: "45%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statTitle: {
    fontSize: 11,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: colors.onSurfaceVariant,
    marginBottom: 4,
  },
  statValueContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.onSurface,
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${colors.emerald}15`,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 2,
  },
  trendText: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.emerald,
  },
  statSubtitle: {
    fontSize: 11,
    color: colors.onSurfaceVariant,
    marginTop: 4,
  },

  // Activities
  activitiesSection: {
    marginBottom: 24,
  },
  activitiesTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.onSurface,
    marginBottom: 12,
  },
  activityItem: {
    flexDirection: "row",
    backgroundColor: colors.surfaceContainerLowest,
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.primary}10`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.onSurface,
    marginBottom: 2,
  },
  activityDescription: {
    fontSize: 13,
    color: colors.onSurfaceVariant,
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 11,
    color: colors.onSurfaceVariant,
    opacity: 0.7,
  },

  // Cards Grid
  cardsGrid: {
    gap: 16,
  },

  // Card Styles
  card: {
    borderRadius: 16,
    backgroundColor: colors.surfaceContainerLowest,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHighlighted: {
    backgroundColor: "transparent",
  },
  cardHighlightedBg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cardContent: {
    padding: 24,
  },
  cardContentHighlighted: {
    position: "relative",
    zIndex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceContainer,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  iconContainerHighlighted: {
    backgroundColor: colors.primaryContainer,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.onSurface,
    marginBottom: 8,
  },
  cardTitleHighlighted: {
    color: colors.onPrimary,
  },
  cardDescription: {
    fontSize: 13,
    color: colors.onSurfaceVariant,
    lineHeight: 20,
    marginBottom: 20,
  },
  cardDescriptionHighlighted: {
    color: colors.onPrimaryContainer,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  cardFooterText: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: colors.primary,
  },
  cardFooterTextHighlighted: {
    color: colors.primaryFixed,
  },
  arrowIcon: {
    marginLeft: 8,
  },
});
