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
  Keyboard,
  Platform,
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

const { width, height } = Dimensions.get("window");

// ============================================
// TYPES
// ============================================
interface EducationDashboardResponse {
  totalSchools: number;
  totalFellows: number;
  totalStudents: number;
  totalPrograms: number;
  activeSchools: number;
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

interface DashboardStats {
  totalSchools: number;
  totalFellows: number;
  totalStudents: number;
  totalPrograms: number;
  activeSchools: number;
  growthRate: string;
}

// ============================================
// THEME COLORS (used by Footer)
// ============================================
const colors = {
  primary: "#006857",
  primaryContainer: "#00846e",
};

// ============================================
// ALL FEATURES (FOR SEARCH)
// ============================================
const ALL_FEATURES = [
  {
    title: "Management Hub",
    route: "/education_management_hub",
    icon: "library-outline",
    category: "Education",
  },
  {
    title: "Schools Overview",
    route: "/education_schools_module",
    icon: "business-outline",
    category: "Education",
  },
  {
    title: "Fellows Directory",
    route: "/education_fellows_module",
    icon: "people-outline",
    category: "Education",
  },
  {
    title: "Active Programs",
    route: "/education_students_module",
    icon: "calendar-outline",
    category: "Education",
  },
  {
    title: "PTA and Programs",
    route: "/education_pta_programs",
    icon: "document-text-outline",
    category: "Education",
  },
  {
    title: "After-School-Students",
    route: "/after-school-students",
    icon: "document-text-outline",
    category: "Education",
  },
  {
    title: "After-School-Centres",
    route: "/after-school-centres",
    icon: "document-text-outline",
    category: "Education",
  },
  {
    title: "PM Reflection",
    route: "/PM-Reflection",
    icon: "stats-chart-outline",
    category: "Fellow Observation",
  },
  {
    title: "Fellow Performance Tracking",
    route: "/PerformanceTracking",
    icon: "clipboard-outline",
    category: "Fellow Observation",
  },
  {
    title: "Classroom Visits",
    route: "/fellow-observation/classroom-visits",
    icon: "assignment-turned-in",
    category: "Fellow Observation",
  },
  {
    title: "Observation Reports",
    route: "/fellow-observation/reports",
    icon: "description",
    category: "Fellow Observation",
  },
  {
    title: "Livelihood Management Hub",
    route: "/livelihood_management_hub",
    icon: "apps-outline",
    category: "Livelihood",
  },
  {
    title: "Goat Rearing",
    route: "/livelihood_goat_rearing_1",
    icon: "paw-outline",
    category: "Livelihood",
  },
  {
    title: "Agriculture Support",
    route: "/livelihood_sugarcane_cultivation",
    icon: "leaf-outline",
    category: "Livelihood",
  },
  {
    title: "Beneficiaries",
    route: "/beneficiaries",
    icon: "people-circle-outline",
    category: "Livelihood",
  },
  {
    title: "Disaster Relief",
    route: "/disaster_relief_management",
    icon: "snow-outline",
    category: "General",
  },
  {
    title: "Travel Management",
    route: "/travel",
    icon: "airplane",
    category: "General",
  },
  {
    title: "HR Management",
    route: "/hr_employee_management",
    icon: "people-outline",
    category: "HR",
  },
  {
    title: "Admin & Access",
    route: "/admin_access_control",
    icon: "document-text-outline",
    category: "Admin",
  },
  {
    title: "Leaves",
    route: "/(tabs)/leaves",
    icon: "calendar-outline",
    category: "HR",
  },
  {
    title: "My Profile",
    route: "/profile",
    icon: "person-outline",
    category: "Account",
  },
];

// ============================================
// FOOTER COMPONENT (synced with dashboard/admin)
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

// ============================================
// MAIN COMPONENT
// ============================================
export default function EducationScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [showFooter, setShowFooter] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalSchools: 0,
    totalFellows: 0,
    totalStudents: 0,
    totalPrograms: 0,
    activeSchools: 0,
    growthRate: "+0%",
  });
  const [activities, setActivities] = useState<RecentActivity[]>([]);

  // Sidebar
  const [menuOpen, setMenuOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-width)).current;

  // Header Search Bar State
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [headerSearchQuery, setHeaderSearchQuery] = useState("");
  const expandAnim = useRef(new Animated.Value(0)).current;
  const dropdownAnim = useRef(new Animated.Value(0)).current;

  // Dropdown states for sidebar
  const [educationDropdownOpen, setEducationDropdownOpen] = useState(true);
  const [reportsDropdownOpen, setReportsDropdownOpen] = useState(false);
  const [livelihoodDropdownOpen, setLivelihoodDropdownOpen] = useState(false);
  const [authDropdownOpen, setAuthDropdownOpen] = useState(false);

  // Animated values for dropdowns
  const educationRotateAnim = useRef(new Animated.Value(1)).current;
  const reportsRotateAnim = useRef(new Animated.Value(0)).current;
  const livelihoodRotateAnim = useRef(new Animated.Value(0)).current;
  const authRotateAnim = useRef(new Animated.Value(0)).current;

  // ============================================
  // HEADER SEARCH ANIMATION & DROPDOWN
  // ============================================
  const expandSearch = () => {
    setIsSearchExpanded(true);
    Animated.timing(expandAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: false,
    }).start();

    if (headerSearchQuery.length > 0) {
      Animated.timing(dropdownAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  const collapseSearch = () => {
    Keyboard.dismiss();
    Animated.timing(dropdownAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: false,
    }).start(() => {
      Animated.timing(expandAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false,
      }).start(() => {
        setIsSearchExpanded(false);
        setHeaderSearchQuery("");
      });
    });
  };

  const handleSearchTextChange = (text: string) => {
    setHeaderSearchQuery(text);
    if (text.length > 0) {
      Animated.timing(dropdownAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(dropdownAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: false,
      }).start();
    }
  };

  const searchBarWidth = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [40, width - 100],
  });

  const dropdownHeight = dropdownAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, height * 0.7],
  });

  const handleSearchNavigate = (route: string) => {
    collapseSearch();
    setTimeout(() => {
      router.push(route as any);
    }, 300);
  };

  const filteredFeatures = ALL_FEATURES.filter(
    (f) =>
      f.title.toLowerCase().includes(headerSearchQuery.toLowerCase()) ||
      f.category.toLowerCase().includes(headerSearchQuery.toLowerCase()),
  );

  // ============================================
  // FETCH DASHBOARD DATA
  // ============================================
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const data = await api.get<EducationDashboardResponse>(
        "/api/education/dashboard",
      );

      if (data) {
        setStats({
          totalSchools: data.totalSchools ?? 0,
          totalFellows: data.totalFellows ?? 0,
          totalStudents: data.totalStudents ?? 0,
          totalPrograms: data.totalPrograms ?? 0,
          activeSchools: data.activeSchools ?? 0,
          growthRate: data.growthRate ?? "+0%",
        });
        setActivities(data.recentActivities ?? []);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        console.error("Education dashboard error:", err.message);
      }
      setStats({
        totalSchools: 128,
        totalFellows: 342,
        totalStudents: 4520,
        totalPrograms: 45,
        activeSchools: 112,
        growthRate: "+14%",
      });
      setActivities([
        {
          id: "1",
          title: "New School Partnership",
          description:
            "Aman Foundation partnered with 5 new schools in rural areas.",
          time: "2 days ago",
          icon: "business-outline",
        },
        {
          id: "2",
          title: "Fellow Training Completed",
          description: "45 new fellows completed their orientation training.",
          time: "5 days ago",
          icon: "people-outline",
        },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleNavigation = (path: string) => {
    closeMenu();
    setTimeout(() => {
      router.push(path as any);
    }, 150);
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

  const toggleReportsDropdown = () => {
    const toValue = reportsDropdownOpen ? 0 : 1;
    Animated.timing(reportsRotateAnim, {
      toValue,
      duration: 200,
      useNativeDriver: true,
    }).start();
    setReportsDropdownOpen(!reportsDropdownOpen);
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

  // ============================================
  // LOGOUT
  // ============================================
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
    fetchDashboardData();
  };

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowFooter(offsetY > 350);
  };

  // ============================================
  // LOADING STATE
  // ============================================
  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#006857" />
          <Text style={styles.loadingText}>Loading education data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================
  // RENDER
  // ============================================
  return (
    <RouteGuard>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
        <View style={styles.container}>
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
                <Image
                  source={require("../../assets/images/logo.jpeg")}
                  style={styles.brandLogo}
                  resizeMode="contain"
                />
              </View>

              {/* DASHBOARD (ACTIVE) */}
              <TouchableOpacity
                style={styles.menuItemActive}
                onPress={() => handleNavigation("/")}
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons name="grid-outline" size={20} color="#fff" />
                  <Text style={styles.menuTextActive}>Dashboard</Text>
                </View>
              </TouchableOpacity>

              {/* EDUCATION WITH SUBMENU */}
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
                      <Ionicons
                        name="people-outline"
                        size={16}
                        color="#6b7280"
                      />
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
                      onPress={() =>
                        handleNavigation("/education_pta_programs")
                      }
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
                      <Text style={styles.subNavText}>
                        After-School-Students
                      </Text>
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
                      <Text style={styles.subNavText}>
                        After-School-Centres
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleNavigation("/(tabs)/task")}
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={20}
                    color="#4b5563"
                  />
                  <Text style={styles.menuText}>Task</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleNavigation("/(tabs)/taskanalytics")}
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons
                    name="bar-chart-outline"
                    size={20}
                    color="#4b5563"
                  />
                  <Text style={styles.menuText}>Task Analytics</Text>
                </View>
              </TouchableOpacity>

              {/* FELLOW OBSERVATION (NEW top-level dropdown) */}
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
                    <Text style={styles.menuText}>Fellow Observation</Text>
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
                      onPress={() => handleNavigation("/PM-Reflection")}
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

              {/* LIVELIHOOD WITH SUBMENU */}
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
                      <Text style={styles.subNavText}>
                        Sugarcane Cultivation
                      </Text>
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

              {/* DISASTER RELIEF */}
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
                onPress={() => handleNavigation("/Reimbursement Management")}
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons name="cash" size={20} color="#4b5563" />
                  <Text style={styles.menuText}>Reimbursements Management</Text>
                </View>
              </TouchableOpacity>

              {/* HR MANAGEMENT */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleNavigation("/hr_employee_management")}
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons name="people-outline" size={20} color="#4b5563" />
                  <Text style={styles.menuText}>HR Management</Text>
                </View>
              </TouchableOpacity>

              {/* ADMIN & ACCESS */}
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

              {/* LEAVES */}
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

              {/* MY PROFILE */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleNavigation("/profile")}
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons name="person-outline" size={20} color="#4b5563" />
                  <Text style={styles.menuText}>My Profile</Text>
                </View>
              </TouchableOpacity>

              {/* AUTHENTICATION DROPDOWN */}
              <View>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={toggleAuthDropdown}
                >
                  <View style={styles.menuItemLeft}>
                    <Ionicons name="key-outline" size={20} color="#4b5563" />
                    <Text style={styles.menuText}>Authentication</Text>
                  </View>
                  <Animated.View
                    style={{ transform: [{ rotate: rotateAuth }] }}
                  >
                    <Ionicons name="chevron-down" size={20} color="#6b7280" />
                  </Animated.View>
                </TouchableOpacity>

                {authDropdownOpen && (
                  <View style={styles.subNav}>
                    <TouchableOpacity
                      style={styles.subNavItem}
                      onPress={() => handleNavigation("/login")}
                    >
                      <Ionicons
                        name="log-in-outline"
                        size={16}
                        color="#6b7280"
                      />
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
                      <Text
                        style={[styles.subNavText, styles.subNavTextLogout]}
                      >
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

          {/* MAIN SCREEN */}
          <View style={{ flex: 1 }}>
            {/* HEADER */}
            <View style={styles.header}>
              {!isSearchExpanded ? (
                <>
                  <View style={styles.headerLeft}>
                    <TouchableOpacity
                      onPress={toggleMenu}
                      style={styles.menuButton}
                    >
                      <MaterialIcons name="menu" size={24} color="#4B5563" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Impact Portal</Text>
                  </View>

                  <View style={styles.headerRight}>
                    <TouchableOpacity
                      style={styles.searchIconTrigger}
                      onPress={expandSearch}
                    >
                      <MaterialIcons name="search" size={24} color="#6B7280" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() =>
                        Alert.alert("Notifications", "No new notifications")
                      }
                    >
                      <Ionicons
                        name="notifications-outline"
                        size={24}
                        color="#6B7280"
                      />
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
                </>
              ) : (
                // Expanded Search Bar
                <View style={styles.expandedSearchContainer}>
                  <Animated.View
                    style={[
                      styles.expandedSearchInputWrapper,
                      { width: searchBarWidth },
                    ]}
                  >
                    <MaterialIcons name="search" size={20} color="#6B7280" />
                    <TextInput
                      style={styles.expandedSearchInput}
                      placeholder="Search pages, tabs & forms..."
                      placeholderTextColor="#9CA3AF"
                      value={headerSearchQuery}
                      onChangeText={handleSearchTextChange}
                      autoFocus
                      returnKeyType="search"
                      underlineColorAndroid="transparent"
                    />
                    {headerSearchQuery.length > 0 && (
                      <TouchableOpacity
                        onPress={() => handleSearchTextChange("")}
                      >
                        <MaterialIcons name="close" size={18} color="#9CA3AF" />
                      </TouchableOpacity>
                    )}
                  </Animated.View>
                  <TouchableOpacity
                    onPress={collapseSearch}
                    style={{ paddingLeft: 12, paddingVertical: 8 }}
                  >
                    <Text style={styles.cancelSearchText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* 70% Height Search Dropdown Card */}
            {isSearchExpanded && (
              <Animated.View
                style={[
                  styles.searchDropdownContainer,
                  { height: dropdownHeight },
                ]}
              >
                <ScrollView
                  style={{ flex: 1 }}
                  keyboardShouldPersistTaps="handled"
                >
                  {filteredFeatures.length > 0 ? (
                    filteredFeatures.map((feature, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.searchResultItem}
                        onPress={() => handleSearchNavigate(feature.route)}
                      >
                        <View style={styles.searchIconBox}>
                          <Ionicons
                            name={feature.icon as any}
                            size={18}
                            color="#006857"
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.searchResultTitle}>
                            {feature.title}
                          </Text>
                          <Text style={styles.searchResultCategory}>
                            {feature.category}
                          </Text>
                        </View>
                        <MaterialIcons
                          name="chevron-right"
                          size={20}
                          color="#D1D5DB"
                        />
                      </TouchableOpacity>
                    ))
                  ) : (
                    <View style={styles.emptySearchContainer}>
                      <MaterialIcons
                        name="search-off"
                        size={40}
                        color="#D1D5DB"
                      />
                      <Text style={styles.emptySearchText}>
                        No results found for "{headerSearchQuery}"
                      </Text>
                    </View>
                  )}
                </ScrollView>
              </Animated.View>
            )}

            <ScrollView
              style={styles.mainContent}
              contentContainerStyle={{ paddingBottom: 40 }}
              showsVerticalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={["#006857"]}
                  tintColor="#006857"
                />
              }
            >
              {/* BACK BUTTON */}
              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => router.replace("/")}
              >
                <Ionicons name="arrow-back" size={16} color="#6b7280" />
                <Text style={styles.backText}>Back to Dashboard</Text>
              </TouchableOpacity>

              {/* HEADER SECTION */}
              <View style={styles.headerSection}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Central Hub</Text>
                </View>

                <Text style={styles.title}>Education Management</Text>

                <Text style={styles.subtitle}>
                  Oversee, evaluate, and scale educational initiatives. This
                  module provides a unified view of fellows, students, schools,
                  and programs.
                </Text>
              </View>

              {/* STATS CARDS */}
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{stats.totalSchools}</Text>
                  <Text style={styles.statLabel}>Total Schools</Text>
                  <View style={styles.statBadge}>
                    <Text style={styles.statBadgeText}>
                      {stats.activeSchools} Active
                    </Text>
                  </View>
                </View>

                <View style={[styles.statCard, styles.statCardGreen]}>
                  <Text style={[styles.statNumber, styles.statNumberWhite]}>
                    {stats.totalFellows}
                  </Text>
                  <Text style={[styles.statLabel, styles.statLabelWhite]}>
                    Total Fellows
                  </Text>
                  <View style={[styles.statBadge, styles.statBadgeLight]}>
                    <Text
                      style={[styles.statBadgeText, styles.statBadgeTextLight]}
                    >
                      {stats.growthRate} Growth
                    </Text>
                  </View>
                </View>

                <View style={[styles.statCard, styles.statCardOrange]}>
                  <Text style={[styles.statNumber, styles.statNumberWhite]}>
                    {stats.totalStudents}
                  </Text>
                  <Text style={[styles.statLabel, styles.statLabelWhite]}>
                    Total Students
                  </Text>
                  <View style={[styles.statBadge, styles.statBadgeLight]}>
                    <Text
                      style={[styles.statBadgeText, styles.statBadgeTextLight]}
                    >
                      Enrolled
                    </Text>
                  </View>
                </View>

                <View style={[styles.statCard, styles.statCardPurple]}>
                  <Text style={[styles.statNumber, styles.statNumberWhite]}>
                    {stats.totalPrograms}
                  </Text>
                  <Text style={[styles.statLabel, styles.statLabelWhite]}>
                    Active Programs
                  </Text>
                  <View style={[styles.statBadge, styles.statBadgeLight]}>
                    <Text
                      style={[styles.statBadgeText, styles.statBadgeTextLight]}
                    >
                      Running
                    </Text>
                  </View>
                </View>
              </View>

              {/* RECENT ACTIVITIES */}
              {activities.length > 0 && (
                <View style={styles.activitiesSection}>
                  <Text style={styles.activitiesTitle}>Recent Activities</Text>

                  {activities.map((activity) => (
                    <View key={activity.id} style={styles.activityItem}>
                      <View style={styles.activityIcon}>
                        <Ionicons
                          name={activity.icon as any}
                          size={20}
                          color="#006857"
                        />
                      </View>
                      <View style={styles.activityContent}>
                        <Text style={styles.activityTitle}>
                          {activity.title}
                        </Text>
                        <Text style={styles.activityDescription}>
                          {activity.description}
                        </Text>
                        <Text style={styles.activityTime}>{activity.time}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* MODULE CARDS */}
              <View style={styles.grid}>
                <TouchableOpacity
                  style={styles.card}
                  onPress={() => router.push("/education_fellows_module")}
                >
                  <View style={[styles.iconCircle, styles.iconGreen]}>
                    <Ionicons name="people-outline" size={28} color="#047857" />
                  </View>
                  <Text style={styles.cardTitle}>Fellows Module</Text>
                  <Text style={styles.cardText}>
                    Manage fellows, track performance, and monitor placements.
                  </Text>
                  <Text style={styles.linkGreen}>Access Module →</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.card}
                  onPress={() => router.push("/education_students_module")}
                >
                  <View style={[styles.iconCircle, styles.iconOrange]}>
                    <Ionicons name="happy-outline" size={28} color="#ea580c" />
                  </View>
                  <Text style={styles.cardTitle}>Students Module</Text>
                  <Text style={styles.cardText}>
                    Track student learning outcomes and attendance metrics.
                  </Text>
                  <Text style={styles.linkOrange}>Access Module →</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.card}
                  onPress={() => router.push("/education_schools_module")}
                >
                  <View style={[styles.iconCircle, styles.iconGreen]}>
                    <Ionicons
                      name="business-outline"
                      size={28}
                      color="#047857"
                    />
                  </View>
                  <Text style={styles.cardTitle}>Schools Module</Text>
                  <Text style={styles.cardText}>
                    Manage school profiles and partnerships with institutions.
                  </Text>
                  <Text style={styles.linkGreen}>Access Module →</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.card}
                  onPress={() => router.push("/education_pta_programs")}
                >
                  <View style={[styles.iconCircle, styles.iconGray]}>
                    <Ionicons
                      name="people-circle-outline"
                      size={28}
                      color="#6b7280"
                    />
                  </View>
                  <Text style={styles.cardTitle}>PTA & Programs</Text>
                  <Text style={styles.cardText}>
                    Track community programs and parent-teacher initiatives.
                  </Text>
                  <Text style={styles.linkGray}>Access Module →</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.card}
                  onPress={() => router.push("/after-school-students")}
                >
                  <View style={[styles.iconCircle, styles.iconGreen]}>
                    <Ionicons name="school-outline" size={28} color="#047857" />
                  </View>
                  <Text style={styles.cardTitle}>After-School Students</Text>
                  <Text style={styles.cardText}>
                    Manage after-school learners, attendance, and academic
                    progress.
                  </Text>
                  <Text style={styles.linkGreen}>Access Module →</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.card}
                  onPress={() => router.push("/after-school-centres")}
                >
                  <View style={[styles.iconCircle, styles.iconGreen]}>
                    <Ionicons
                      name="business-outline"
                      size={28}
                      color="#047857"
                    />
                  </View>
                  <Text style={styles.cardTitle}>After-School Centres</Text>
                  <Text style={styles.cardText}>
                    Monitor centre profiles, program participation, and regional
                    impact.
                  </Text>
                  <Text style={styles.linkGreen}>Access Module →</Text>
                </TouchableOpacity>
              </View>

              {/* Footer - Only visible when scrolled */}
              {showFooter && <Footer />}
            </ScrollView>
          </View>
        </View>
      </SafeAreaView>
    </RouteGuard>
  );
}

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  // ============================================
  // 1. LAYOUT & SIDEBAR
  // ============================================
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748b",
  },
  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.4)",
    zIndex: 15,
  },
  sidebar: {
    position: "absolute",
    width: width * 0.75,
    height: "100%",
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 56 : 40,
    paddingBottom: 30,
    zIndex: 20,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  brandContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 0,
  },
  brandLogo: {
    width: 200,
    height: 90,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 40,
    marginBottom: 4,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuText: {
    marginLeft: 12,
    fontSize: 14,
    color: "#4b5563",
    fontWeight: "500",
  },
  menuItemActive: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "#006857",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 40,
    marginBottom: 4,
    elevation: 2,
  },
  menuTextActive: {
    color: "#fff",
    marginLeft: 12,
    fontWeight: "600",
  },
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
  },
  subNavItemLogout: {
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    marginTop: 4,
    paddingTop: 12,
  },
  subNavText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#4b5563",
  },
  subNavTextLogout: {
    color: "#ef4444",
    fontWeight: "600",
  },
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
  sidebarFooter: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },

  // ============================================
  // 2. HEADER & EXPANDING SEARCH
  // ============================================
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.95)",
    borderBottomWidth: 1,
    borderBottomColor: "#EDEEEF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    height: 64,
    zIndex: 20,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  searchIconTrigger: { padding: 4 },
  iconButton: {
    padding: 4,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#edeeef",
  },

  expandedSearchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  expandedSearchInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 20,
    gap: 8,
  },
  expandedSearchInput: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
    paddingVertical: 0,
    borderWidth: 0,
    outlineStyle: "none",
    outlineWidth: 0,
  } as any,
  cancelSearchText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#006857",
  },

  // ============================================
  // 3. SEARCH DROPDOWN OVERLAY (70% HEIGHT)
  // ============================================
  searchDropdownContainer: {
    position: "absolute",
    top: 64,
    left: 20,
    right: 20,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginTop: 8,
    zIndex: 15,
    elevation: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    overflow: "hidden",
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    gap: 14,
  },
  searchIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
  },
  searchResultTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
  },
  searchResultCategory: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  emptySearchContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60,
    gap: 12,
  },
  emptySearchText: {
    fontSize: 14,
    color: "#9CA3AF",
  },

  // ============================================
  // 4. MAIN CONTENT
  // ============================================
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    alignSelf: "flex-start",
  },
  backText: {
    marginLeft: 6,
    color: "#6b7280",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },
  headerSection: {
    marginBottom: 28,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#d1fae5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 12,
  },
  badgeText: {
    color: "#065f46",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 36,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },

  // ============================================
  // 5. STATS GRID
  // ============================================
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    width: "48%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statCardGreen: { backgroundColor: "#006857" },
  statCardOrange: { backgroundColor: "#ea580c" },
  statCardPurple: { backgroundColor: "#7c3aed" },
  statNumber: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
  },
  statNumberWhite: { color: "#fff" },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  statLabelWhite: { color: "rgba(255,255,255,0.8)" },
  statBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#d1fae5",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: 8,
  },
  statBadgeLight: { backgroundColor: "rgba(255,255,255,0.2)" },
  statBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#065f46",
  },
  statBadgeTextLight: { color: "#fff" },

  // ============================================
  // 6. ACTIVITIES
  // ============================================
  activitiesSection: { marginBottom: 24 },
  activitiesTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  activityItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
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
    backgroundColor: "#ecfdf5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityContent: { flex: 1 },
  activityTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  activityDescription: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 2,
  },
  activityTime: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 4,
  },

  // ============================================
  // 7. MODULE CARDS
  // ============================================
  grid: {
    flexDirection: "column",
    marginBottom: 24,
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  iconGreen: { backgroundColor: "#ecfdf5" },
  iconOrange: { backgroundColor: "#fff7ed" },
  iconGray: { backgroundColor: "#f3f4f6" },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 16,
    lineHeight: 20,
  },
  linkGreen: {
    color: "#047857",
    fontWeight: "600",
    fontSize: 13,
  },
  linkOrange: {
    color: "#ea580c",
    fontWeight: "600",
    fontSize: 13,
  },
  linkGray: {
    color: "#374151",
    fontWeight: "600",
    fontSize: 13,
  },

  // ============================================
  // 8. FOOTER (synced with dashboard/admin)
  // ============================================
  footer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginTop: 40,
    marginBottom: 20,
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
