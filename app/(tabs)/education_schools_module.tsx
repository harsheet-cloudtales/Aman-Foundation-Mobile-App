import { RouteGuard } from "@/components/RouteGuard";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
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
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

// ============================================
// TYPES
// ============================================
interface School {
  id: number;
  name: string;
  district: string;
  enrolled: number;
  programs: number;
  impact: number;
  status: string;
  image?: string;
}

interface DashboardStats {
  totalSchools: number;
  totalStudents: number;
  impactScore: number;
  attendanceRate: number;
  resourceRate: number;
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
  error: "#ba1a1a",
  errorContainer: "#ffdad6",
  rose: "#ef4444",
  emerald: "#10b981",
};

// ============================================
// FOOTER COMPONENT
// ============================================
const Footer = () => {
  return (
    <View style={styles.footer}>
      <View style={styles.footerContent}>
        <View style={styles.footerSection}>
          <View style={styles.footerLogoContainer}>
            <LinearGradient
              colors={[colors.primary, colors.primaryContainer]}
              style={styles.footerLogoIcon}
            >
              <MaterialIcons name="local-library" size={24} color="#fff" />
            </LinearGradient>
            <Text style={styles.footerFoundationName}>Aman Foundation</Text>
          </View>
          <Text style={styles.footerTagline}>
            Creating lasting impact in communities
          </Text>
        </View>

        <View style={styles.footerSection}>
          <Text style={styles.footerSectionTitle}>Contact Us</Text>
          <View style={styles.footerContactItem}>
            <Ionicons name="call-outline" size={16} color="#6B7280" />
            <Text style={styles.footerContactText}>+91 300 1234567</Text>
          </View>
          <View style={styles.footerContactItem}>
            <Ionicons name="mail-outline" size={16} color="#6B7280" />
            <Text style={styles.footerContactText}>
              info@amanfoundation.org
            </Text>
          </View>
          <View style={styles.footerContactItem}>
            <Ionicons name="location-outline" size={16} color="#6B7280" />
            <Text style={styles.footerContactText}>Mumbai, India</Text>
          </View>
        </View>

        <View style={styles.footerSection}>
          <Text style={styles.footerSectionTitle}>Foundation Address</Text>
          <View style={styles.footerContactItem}>
            <Ionicons name="home-outline" size={16} color="#6B7280" />
            <Text style={styles.footerAddressText}>
              Mumbai{"\n"}Sector F-11/3, Maha{"\n"}India
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.footerBottom}>
        <Text style={styles.footerCopyright}>
          © 2026 Aman Foundation. All Rights Reserved.
        </Text>
        <View style={styles.footerLinks}>
          <Text style={styles.footerLinkText}>Terms & Conditions</Text>
          <Text style={styles.footerDot}>•</Text>
          <Text style={styles.footerLinkText}>Privacy Policy</Text>
        </View>
      </View>
    </View>
  );
};

// ============================================
// SCHOOL CARD COMPONENT
// ============================================
const SchoolCard = ({
  school,
  onPress,
}: {
  school: School;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={styles.schoolCard}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.cardHeader}>
      <View style={styles.schoolInfo}>
        <Image
          source={{
            uri: school.image || "https://picsum.photos/seed/1/100/100",
          }}
          style={styles.schoolImage}
        />
        <View>
          <Text style={styles.schoolName}>{school.name}</Text>
          <View style={styles.locationContainer}>
            <MaterialIcons
              name="location-on"
              size={14}
              color={colors.onSurfaceVariant}
            />
            <Text style={styles.schoolLocation}>{school.district}</Text>
          </View>
        </View>
      </View>
      <View
        style={[
          styles.statusBadge,
          school.status === "Active"
            ? styles.statusActive
            : styles.statusReview,
        ]}
      >
        <Text style={styles.statusText}>{school.status}</Text>
      </View>
    </View>

    <View style={styles.statsContainer}>
      <View>
        <Text style={styles.statLabel}>Enrolled</Text>
        <Text style={styles.statValue}>{school.enrolled}</Text>
      </View>
      <View>
        <Text style={styles.statLabel}>Programs</Text>
        <Text style={styles.statValue}>{school.programs}</Text>
      </View>
    </View>

    <View>
      <View style={styles.goalHeader}>
        <Text style={styles.goalLabel}>Impact Goal</Text>
        <Text
          style={[
            styles.goalPercentage,
            school.impact >= 85 ? styles.goalSuccess : styles.goalWarning,
          ]}
        >
          {school.impact}%
        </Text>
      </View>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressFill, { width: `${school.impact}%` }]} />
      </View>
    </View>
  </TouchableOpacity>
);

// ============================================
// MAIN COMPONENT
// ============================================
export default function SchoolsModule() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showFooter, setShowFooter] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalSchools: 0,
    totalStudents: 0,
    impactScore: 0,
    attendanceRate: 0,
    resourceRate: 0,
  });

  const [educationDropdownOpen, setEducationDropdownOpen] = useState(false);
  const [livelihoodDropdownOpen, setLivelihoodDropdownOpen] = useState(false);
  const [authDropdownOpen, setAuthDropdownOpen] = useState(false);

  const slideAnim = useRef(new Animated.Value(-width)).current;
  const educationRotateAnim = useRef(new Animated.Value(0)).current;
  const livelihoodRotateAnim = useRef(new Animated.Value(0)).current;
  const authRotateAnim = useRef(new Animated.Value(0)).current;

  // ============================================
  // FETCH SCHOOLS DATA
  // ============================================
  const fetchSchools = async () => {
    try {
      setLoading(true);

      const data = await api.get<School[]>("/api/schools");

      if (data && data.length > 0) {
        setSchools(data);

        // Calculate stats
        const totalStudents = data.reduce(
          (acc, s) => acc + (s.enrolled || 0),
          0,
        );
        const avgImpact = Math.round(
          data.reduce((acc, s) => acc + (s.impact || 0), 0) / data.length,
        );

        setStats({
          totalSchools: data.length,
          totalStudents: totalStudents,
          impactScore: avgImpact,
          attendanceRate: 92,
          resourceRate: 78,
        });
      }
    } catch (err) {
      if (err instanceof ApiError) {
        console.error("Schools fetch error:", err.message);
      }
      // Fallback data
      const fallbackSchools: School[] = [
        {
          id: 1,
          name: "Oakridge Academy",
          district: "North District",
          enrolled: 1240,
          programs: 4,
          impact: 85,
          status: "Active",
          image: "https://picsum.photos/seed/1/100/100",
        },
        {
          id: 2,
          name: "Riverside Public",
          district: "East Valley",
          enrolled: 850,
          programs: 2,
          impact: 42,
          status: "Review",
          image: "https://picsum.photos/seed/2/100/100",
        },
        {
          id: 3,
          name: "Summit Prep",
          district: "West Highlands",
          enrolled: 2100,
          programs: 7,
          impact: 94,
          status: "Active",
          image: "https://picsum.photos/seed/3/100/100",
        },
      ];
      setSchools(fallbackSchools);
      setStats({
        totalSchools: fallbackSchools.length,
        totalStudents: fallbackSchools.reduce((acc, s) => acc + s.enrolled, 0),
        impactScore: Math.round(
          fallbackSchools.reduce((acc, s) => acc + s.impact, 0) /
            fallbackSchools.length,
        ),
        attendanceRate: 92,
        resourceRate: 78,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSchools();
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

  const onRefresh = () => {
    setRefreshing(true);
    fetchSchools();
  };

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowFooter(offsetY > 450);
  };

  const filteredSchools = schools.filter(
    (school) =>
      school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      school.district.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // ============================================
  // LOADING STATE
  // ============================================
  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading schools...</Text>
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
                    <Ionicons name="happy-outline" size={18} color="#6b7280" />
                    <Text style={styles.dropdownText}>Students</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.dropdownItem, styles.dropdownItemActive]}
                    onPress={() =>
                      handleNavigation("/education_schools_module")
                    }
                  >
                    <Ionicons
                      name="business-outline"
                      size={18}
                      color="#047857"
                    />
                    <Text
                      style={[styles.dropdownText, styles.dropdownTextActive]}
                    >
                      Schools
                    </Text>
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

            {/* LIVELIHOOD WITH DROPDOWN */}
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
                    style={styles.dropdownItem}
                    onPress={() =>
                      handleNavigation("/livelihood_management_hub")
                    }
                  >
                    <Ionicons name="apps-outline" size={18} color="#6b7280" />
                    <Text style={styles.dropdownText}>Management Hub</Text>
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

            {/* AUTHENTICATION SECTION */}
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
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
          <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={toggleMenu}>
              <MaterialIcons name="menu" size={24} color="#64748b" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Impact Portal</Text>
            <View style={styles.headerIcons}>
              <TouchableOpacity
                onPress={() =>
                  Alert.alert("Notifications", "No new notifications")
                }
              >
                <Ionicons
                  name="notifications-outline"
                  size={22}
                  color="#1f2937"
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  Alert.alert("Settings", "Settings will be available soon")
                }
              >
                <Ionicons name="settings-outline" size={22} color="#1f2937" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push("/profile")}>
                {/* <Image
                  source={{
                    uri:
                      user?.avatar ||
                      "https://randomuser.me/api/portraits/women/68.jpg",
                  }}
                  style={styles.avatar}
                /> */}
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 20, gap: 24 }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.primary]}
              />
            }
          >
            {/* Back Button */}
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.push("/education_management_hub")}
            >
              <MaterialIcons name="arrow-back" size={18} color="#6b7280" />
              <Text style={styles.backText}>Back to Education Hub</Text>
            </TouchableOpacity>

            {/* Header Section */}
            <View>
              <Text style={styles.mainTitle}>Schools Module</Text>
              <Text style={styles.subtitle}>
                Monitoring school profiles, program participation, and
                geographic impact across targeted regions.
              </Text>
            </View>

            {/* Search and Export */}
            <View style={styles.actionContainer}>
              <View style={styles.searchContainer}>
                <MaterialIcons
                  name="search"
                  size={20}
                  color={colors.onSurfaceVariant}
                />
                <TextInput
                  placeholder="Search schools..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  style={styles.searchInput}
                  placeholderTextColor="#9ca3af"
                />
              </View>
              <TouchableOpacity style={styles.exportButton}>
                <Feather name="download" size={16} color="#fff" />
                <Text style={styles.exportButtonText}>Export</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addButton}>
                <MaterialIcons name="add" size={18} color="white" />
                <Text style={styles.addButtonText}>Add School</Text>
              </TouchableOpacity>
            </View>

            {/* Map & Stats Section */}
            <View style={styles.mapContainer}>
              <View style={styles.mapCard}>
                <Image
                  source={{ uri: "https://picsum.photos/800/400" }}
                  style={styles.mapImage}
                />
                <BlurView intensity={80} tint="light" style={styles.mapOverlay}>
                  <View style={styles.mapOverlayHeader}>
                    <Text style={styles.mapOverlayTitle}>Regional Impact</Text>
                    <MaterialIcons
                      name="public"
                      size={20}
                      color={colors.primary}
                    />
                  </View>
                  <View style={styles.mapStats}>
                    <View>
                      <Text style={styles.mapStatLabel}>Total Schools</Text>
                      <Text style={styles.mapStatValue}>
                        {stats.totalSchools}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.mapStatLabel}>Active Students</Text>
                      <Text
                        style={[styles.mapStatValue, { color: colors.primary }]}
                      >
                        {stats.totalStudents.toLocaleString()}
                      </Text>
                    </View>
                  </View>
                </BlurView>
              </View>

              <View style={styles.rightStats}>
                <LinearGradient
                  colors={[colors.primaryContainer, colors.primaryContainer]}
                  style={styles.impactCard}
                >
                  <View style={styles.impactHeader}>
                    <MaterialIcons
                      name="trending-up"
                      size={20}
                      color={colors.onPrimaryContainer}
                    />
                    <Text style={styles.impactLabel}>Overall Impact Score</Text>
                  </View>
                  <View style={styles.impactScore}>
                    <Text style={styles.impactValue}>{stats.impactScore}</Text>
                    <Text style={styles.impactTotal}>/ 100</Text>
                  </View>
                  <View style={styles.impactDetails}>
                    <View>
                      <View style={styles.impactRow}>
                        <Text style={styles.impactText}>
                          Program Attendance
                        </Text>
                        <Text style={styles.impactPercent}>
                          {stats.attendanceRate}%
                        </Text>
                      </View>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFillSmall,
                            { width: `${stats.attendanceRate}%` },
                          ]}
                        />
                      </View>
                    </View>
                    <View>
                      <View style={styles.impactRow}>
                        <Text style={styles.impactText}>
                          Resource Allocation
                        </Text>
                        <Text style={styles.impactPercent}>
                          {stats.resourceRate}%
                        </Text>
                      </View>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFillSmall,
                            { width: `${stats.resourceRate}%` },
                          ]}
                        />
                      </View>
                    </View>
                  </View>
                </LinearGradient>

                <View style={styles.alertCard}>
                  <Text style={styles.alertLabel}>Needs Attention</Text>
                  <View style={styles.alertContent}>
                    <View style={styles.alertIcon}>
                      <MaterialIcons
                        name="warning"
                        size={20}
                        color={colors.secondary}
                      />
                    </View>
                    <View>
                      <Text style={styles.alertText}>
                        {schools.filter((s) => s.status === "Review").length}{" "}
                        Schools require immediate resource restocking.
                      </Text>
                      <TouchableOpacity>
                        <Text style={styles.alertLink}>Review Inventory</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Featured Profiles Section */}
            <View>
              <View style={styles.featuredHeader}>
                <Text style={styles.featuredTitle}>Featured Profiles</Text>
                <TouchableOpacity style={styles.viewAllButton}>
                  <Text style={styles.viewAllText}>View All Directory</Text>
                  <MaterialIcons
                    name="arrow-forward"
                    size={14}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              </View>
              <View>
                {filteredSchools.map((school) => (
                  <SchoolCard
                    key={school.id}
                    school={school}
                    onPress={() => {
                      router.push({
                        pathname: "/education_schools_profile",
                        params: {
                          id: school.id.toString(),
                          name: school.name,
                          district: school.district,
                          enrolled: school.enrolled.toString(),
                          programs: school.programs.toString(),
                          impact: school.impact.toString(),
                          status: school.status,
                          image: school.image,
                        },
                      });
                    }}
                  />
                ))}
              </View>
            </View>

            {/* Footer */}
            {showFooter && <Footer />}
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
  /* ========================================
     SIDEBAR & NAVIGATION
  ======================================== */
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

  menuItemActive: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#006857",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 30,
    marginBottom: 20,
    elevation: 3,
  },

  menuTextActive: {
    color: "#fff",
    marginLeft: 12,
    fontWeight: "600",
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

  /* ========================================
     HEADER
  ======================================== */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderBottomWidth: 1,
    borderBottomColor: "#edeeef",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },

  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },

  /* ========================================
     PAGE HEADER / TITLE
  ======================================== */
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },

  backText: {
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
    color: "#64748b",
  },

  mainTitle: {
    fontSize: 40,
    fontWeight: "900",
    letterSpacing: -0.5,
    color: "#191c1d",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 16,
    color: "#3d4945",
  },

  /* ========================================
     ACTION BUTTONS & SEARCH
  ======================================== */
  actionContainer: {
    flexDirection: "row",
    gap: 12,
  },

  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#edeeef",
    borderRadius: 50,
    paddingHorizontal: 16,
    gap: 8,
  },

  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
  },

  exportButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.primary,
    borderRadius: 50,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  exportButtonText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    color: "white",
  },

  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.primary,
    borderRadius: 50,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },

  addButtonText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    color: "white",
  },

  /* ========================================
     MAP SECTION
  ======================================== */
  mapContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },

  mapCard: {
    flex: 2,
    minWidth: 250,
    height: 300,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },

  mapImage: {
    width: "100%",
    height: "100%",
  },

  mapOverlay: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 16,
    overflow: "hidden",
  },

  mapOverlayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  mapOverlayTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#191c1d",
  },

  mapStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  mapStatLabel: {
    fontSize: 10,
    fontWeight: "500",
    textTransform: "uppercase",
    color: "#3d4945",
  },

  mapStatValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#191c1d",
  },

  /* ========================================
     IMPACT / STATISTICS SECTION
  ======================================== */
  rightStats: {
    flex: 1,
    minWidth: 200,
    gap: 16,
  },

  impactCard: {
    padding: 24,
    borderRadius: 16,
    overflow: "hidden",
  },

  impactHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },

  impactLabel: {
    fontSize: 10,
    fontWeight: "500",
    textTransform: "uppercase",
    color: "rgba(0,0,0,0.7)",
  },

  impactScore: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },

  impactValue: {
    fontSize: 48,
    fontWeight: "800",
    letterSpacing: -1,
    color: "#00201a",
  },

  impactTotal: {
    fontSize: 14,
    color: "rgba(0,0,0,0.6)",
  },

  impactDetails: {
    marginTop: 24,
    gap: 16,
  },

  impactRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },

  impactText: {
    color: "#00201a",
  },

  impactPercent: {
    fontWeight: "600",
    color: "#00201a",
  },

  progressBar: {
    height: 6,
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 10,
  },

  progressFillSmall: {
    height: "100%",
    backgroundColor: "#00201a",
    borderRadius: 10,
  },

  /* ========================================
     ALERT SECTION
  ======================================== */
  alertCard: {
    padding: 20,
    backgroundColor: "#f3f4f5",
    borderRadius: 16,
  },

  alertLabel: {
    fontSize: 10,
    fontWeight: "500",
    textTransform: "uppercase",
    color: "#3d4945",
    marginBottom: 12,
  },

  alertContent: {
    flexDirection: "row",
    gap: 16,
  },

  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 30,
    backgroundColor: "rgba(150,73,0,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },

  alertText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#191c1d",
  },

  alertLink: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    color: "#006857",
    marginTop: 8,
  },

  /* ========================================
     FEATURED SECTION
  ======================================== */
  featuredHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  featuredTitle: {
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: -0.5,
    color: "#191c1d",
  },

  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  viewAllText: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    color: "#006857",
  },

  /* ========================================
     SCHOOL CARD
  ======================================== */
  schoolCard: {
    backgroundColor: colors.surfaceContainerLowest,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },

  schoolInfo: {
    flexDirection: "row",
    gap: 16,
    flex: 1,
  },

  schoolImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },

  schoolName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.onSurface,
    marginBottom: 4,
  },

  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  schoolLocation: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },

  /* ========================================
     STATUS BADGES
  ======================================== */
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },

  statusActive: {
    backgroundColor: "#d1fae5",
  },

  statusReview: {
    backgroundColor: colors.surfaceContainerHighest,
  },

  statusText: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    color: "#065f46",
  },

  /* ========================================
     STATS SECTION
  ======================================== */
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceVariant,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceVariant,
    marginBottom: 16,
  },

  statLabel: {
    fontSize: 10,
    fontWeight: "500",
    textTransform: "uppercase",
    color: colors.onSurfaceVariant,
    marginBottom: 4,
  },

  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.onSurface,
  },

  /* ========================================
     GOAL PROGRESS
  ======================================== */
  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  goalLabel: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    color: colors.onSurfaceVariant,
  },

  goalPercentage: {
    fontSize: 12,
    fontWeight: "600",
  },

  goalSuccess: {
    color: colors.primary,
  },

  goalWarning: {
    color: colors.secondary,
  },

  progressBarContainer: {
    height: 6,
    backgroundColor: colors.surfaceContainerHighest,
    borderRadius: 10,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 10,
  },

  /* ========================================
     FOOTER
  ======================================== */
  footer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginTop: 40,
    marginBottom: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
    borderTopWidth: 1,
    borderTopColor: "#EDEEEF",
  },

  footerContent: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 20,
  },

  footerSection: {
    flex: 1,
    minWidth: 200,
  },

  footerLogoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
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
    fontSize: 18,
    fontWeight: "700",
    color: "#065f46",
  },

  footerTagline: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 16,
  },

  footerSectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#191C1D",
    marginBottom: 12,
  },

  footerContactItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 10,
  },

  footerContactText: {
    fontSize: 13,
    color: "#6B7280",
    flex: 1,
  },

  footerAddressText: {
    fontSize: 13,
    color: "#6B7280",
    flex: 1,
    lineHeight: 18,
  },

  footerBottom: {
    borderTopWidth: 1,
    borderTopColor: "#EDEEEF",
    paddingTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
  },

  footerCopyright: {
    fontSize: 12,
    color: "#6B7280",
  },

  footerLinks: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  footerLinkText: {
    fontSize: 12,
    color: "#006857",
    fontWeight: "500",
  },

  footerDot: {
    fontSize: 12,
    color: "#9CA3AF",
  },
});
