// app/(tabs)/taskanalytics.tsx
import { RouteGuard } from "@/components/RouteGuard";
import { useAuth } from "@/lib/useAuth";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  Keyboard,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Line, Path, Text as SvgText } from "react-native-svg";

const { width, height } = Dimensions.get("window");

// ============================================
// THEME COLORS
// ============================================
const colors = {
  primary: "#006857",
  primaryContainer: "#00846e",
};

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
    title: "Tasks",
    route: "/(tabs)/task",
    icon: "checkmark-circle-outline",
    category: "Account",
  },
  {
    title: "Task Analytics",
    route: "/(tabs)/taskanalytics",
    icon: "bar-chart-outline",
    category: "Account",
  },
  {
    title: "My Profile",
    route: "/profile",
    icon: "person-outline",
    category: "Account",
  },
];

// ============================================
// FOOTER
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
// MOCK DATA FOR CHARTS
// ============================================
const lineChartData = {
  days: [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
    "13",
    "14",
    "15",
  ],
  assigned: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 5, 1],
  completed: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 0],
};

const calendarData = {
  month: "October 2026",
  startDay: 4, // Oct 1, 2026 is a Thursday (index 4)
  daysInMonth: 31,
  currentDay: 27,
  // Map of day -> task count for heatmap color
  tasks: {
    12: 1,
    14: 3,
    15: 5,
    18: 2,
    20: 4,
    25: 1,
    28: 2,
    30: 4,
  },
};

// ============================================
// MAIN PAGE
// ============================================
export default function TaskAnalyticsPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Sidebar
  const [menuOpen, setMenuOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-width)).current;

  // Header search
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [headerSearchQuery, setHeaderSearchQuery] = useState("");
  const expandAnim = useRef(new Animated.Value(0)).current;
  const dropdownAnim = useRef(new Animated.Value(0)).current;

  // Sidebar dropdowns
  const [educationDropdownOpen, setEducationDropdownOpen] = useState(false);
  const [reportsDropdownOpen, setReportsDropdownOpen] = useState(false);
  const [livelihoodDropdownOpen, setLivelihoodDropdownOpen] = useState(false);
  const [authDropdownOpen, setAuthDropdownOpen] = useState(false);

  const educationRotateAnim = useRef(new Animated.Value(0)).current;
  const reportsRotateAnim = useRef(new Animated.Value(0)).current;
  const livelihoodRotateAnim = useRef(new Animated.Value(0)).current;
  const authRotateAnim = useRef(new Animated.Value(0)).current;

  // ============ SIDEBAR FUNCTIONS ============
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
    setTimeout(() => router.push(route as any), 150);
  };

  const toggleEducation = () => {
    Animated.timing(educationRotateAnim, {
      toValue: educationDropdownOpen ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    setEducationDropdownOpen(!educationDropdownOpen);
  };
  const toggleReports = () => {
    Animated.timing(reportsRotateAnim, {
      toValue: reportsDropdownOpen ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    setReportsDropdownOpen(!reportsDropdownOpen);
  };
  const toggleLivelihood = () => {
    Animated.timing(livelihoodRotateAnim, {
      toValue: livelihoodDropdownOpen ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    setLivelihoodDropdownOpen(!livelihoodDropdownOpen);
  };
  const toggleAuth = () => {
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

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => router.replace("/login"),
      },
    ]);
  };

  // ============ HEADER SEARCH ============
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
    Animated.timing(dropdownAnim, {
      toValue: text.length > 0 ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
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
    setTimeout(() => router.push(route as any), 300);
  };
  const filteredFeatures = ALL_FEATURES.filter(
    (f) =>
      f.title.toLowerCase().includes(headerSearchQuery.toLowerCase()) ||
      f.category.toLowerCase().includes(headerSearchQuery.toLowerCase()),
  );

  // ============ RENDER HELPERS ============
  const getHeatmapColor = (count: number) => {
    if (!count) return "#f8f9fa";
    if (count <= 1) return "#d1fae5";
    if (count <= 3) return "#6ee7b7";
    return "#059669";
  };

  // Fixed Chart Calculations
  const chartWidth = 1000; // Internal resolution width
  const chartHeight = 200; // Internal resolution height
  const maxVal = Math.max(...lineChartData.assigned, 10);

  const getPathData = (data: number[]) => {
    return data
      .map((val, i) => {
        const x = (i / (data.length - 1)) * chartWidth;
        const y = chartHeight - (val / maxVal) * chartHeight;
        return `${i === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");
  };

  return (
    <RouteGuard>
      <View style={{ flex: 1, backgroundColor: "#f8f9fa" }}>
        {menuOpen && (
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={closeMenu}
          />
        )}

        {/* ============ SIDEBAR ============ */}
        <Animated.View
          style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.brandContainer}>
              <Image
                source={require("../../assets/images/logo.jpeg")}
                style={styles.brandLogo}
                resizeMode="contain"
              />
            </View>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigation("/")}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons name="grid-outline" size={20} color="#4b5563" />
                <Text style={styles.menuText}>Dashboard</Text>
              </View>
            </TouchableOpacity>

            {/* Education */}
            <View>
              <TouchableOpacity
                style={styles.menuItemWithDropdown}
                onPress={toggleEducation}
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
                  {[
                    {
                      label: "Management Hub",
                      icon: "library-outline",
                      route: "/education_management_hub",
                    },
                    {
                      label: "Schools Overview",
                      icon: "business-outline",
                      route: "/education_schools_module",
                    },
                    {
                      label: "Fellows Directory",
                      icon: "people-outline",
                      route: "/education_fellows_module",
                    },
                    {
                      label: "Active Programs",
                      icon: "calendar-outline",
                      route: "/education_students_module",
                    },
                    {
                      label: "PTA and Programs",
                      icon: "document-text-outline",
                      route: "/education_pta_programs",
                    },
                    {
                      label: "After-School-Students",
                      icon: "document-text-outline",
                      route: "/after-school-students",
                    },
                    {
                      label: "After-School-Centres",
                      icon: "document-text-outline",
                      route: "/after-school-centres",
                    },
                  ].map((item) => (
                    <TouchableOpacity
                      key={item.label}
                      style={styles.dropdownItem}
                      onPress={() => handleNavigation(item.route)}
                    >
                      <Ionicons
                        name={item.icon as any}
                        size={18}
                        color="#6b7280"
                      />
                      <Text style={styles.dropdownText}>{item.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Fellow Observation */}
            <View>
              <TouchableOpacity
                style={styles.menuItemWithDropdown}
                onPress={toggleReports}
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
                <View style={styles.dropdownContainer}>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => handleNavigation("/PM-Reflection")}
                  >
                    <Ionicons
                      name="stats-chart-outline"
                      size={18}
                      color="#6b7280"
                    />
                    <Text style={styles.dropdownText}>PM Reflection</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => handleNavigation("/PerformanceTracking")}
                  >
                    <Ionicons
                      name="clipboard-outline"
                      size={18}
                      color="#6b7280"
                    />
                    <Text style={styles.dropdownText}>
                      Fellow Performance Tracking
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Task Link (Tick Icon) */}
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

            {/* Task Analytics Link (Graph Icon - Active) */}
            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemActive]}
              onPress={() => closeMenu()}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons name="bar-chart-outline" size={20} color="#fff" />
                <Text style={styles.menuTextActive}>Task Analytics</Text>
              </View>
            </TouchableOpacity>

            {/* Livelihood */}
            <View>
              <TouchableOpacity
                style={styles.menuItemWithDropdown}
                onPress={toggleLivelihood}
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
                    onPress={() => handleNavigation("/beneficiaries")}
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

            <View style={styles.menuDivider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ACCOUNT</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigation("/profile")}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons name="person-outline" size={20} color="#4b5563" />
                <Text style={styles.menuText}>My Profile</Text>
              </View>
            </TouchableOpacity>

            <View>
              <TouchableOpacity
                style={styles.menuItemWithDropdown}
                onPress={toggleAuth}
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
                    onPress={() => handleNavigation("/login")}
                  >
                    <Ionicons name="log-in-outline" size={18} color="#6b7280" />
                    <Text style={styles.dropdownText}>Login Page</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => handleNavigation("/registration")}
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
                      color="#ef4444"
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

        {/* ============ MAIN CONTENT ============ */}
        <SafeAreaView style={styles.container}>
          <StatusBar
            barStyle="dark-content"
            backgroundColor="#f8f9fa"
            translucent={false}
          />

          {/* Header */}
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

          {/* Search Dropdown */}
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
                  filteredFeatures.map((f, i) => (
                    <TouchableOpacity
                      key={i}
                      style={styles.searchResultItem}
                      onPress={() => handleSearchNavigate(f.route)}
                    >
                      <View style={styles.searchIconBox}>
                        <Ionicons
                          name={f.icon as any}
                          size={18}
                          color="#006857"
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.searchResultTitle}>{f.title}</Text>
                        <Text style={styles.searchResultCategory}>
                          {f.category}
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
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Page Header + Add Task Button */}
            <View style={styles.pageHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.pageTitle}>Task Analytics</Text>
                <Text style={styles.pageSubtitle}>
                  Track team progress and performance metrics.
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/task")}
                style={styles.headerAddBtn}
              >
                <MaterialIcons name="add" size={16} color="#fff" />
                <Text style={styles.headerAddBtnText}>Add Task</Text>
              </TouchableOpacity>
            </View>

            {/* Overview Cards */}
            <View style={styles.statsGrid}>
              {[
                {
                  label: "Total Tasks",
                  value: 45,
                  icon: "checkmark-circle",
                  bg: "#f1f5f9",
                  color: "#334155",
                },
                {
                  label: "Completed",
                  value: 20,
                  icon: "task-alt",
                  bg: "#d1fae5",
                  color: "#065f46",
                },
                {
                  label: "Pending",
                  value: 25,
                  icon: "pending-actions",
                  bg: "#fef3c7",
                  color: "#92400e",
                },
                {
                  label: "Overdue",
                  value: 5,
                  icon: "warning",
                  bg: "#ffe4e6",
                  color: "#9f1239",
                },
              ].map((card) => (
                <View key={card.label} style={styles.statCard}>
                  <View>
                    <Text style={styles.statLabel}>{card.label}</Text>
                    <Text style={styles.statValue}>{card.value}</Text>
                  </View>
                  <View
                    style={[styles.statIconBox, { backgroundColor: card.bg }]}
                  >
                    <MaterialIcons
                      name={card.icon as any}
                      size={20}
                      color={card.color}
                    />
                  </View>
                </View>
              ))}
            </View>

            {/* LINE CHART CARD */}
            <View style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>Assigned vs Completed</Text>
                <View style={styles.legendRow}>
                  <View style={styles.legendItem}>
                    <View
                      style={[styles.legendDot, { backgroundColor: "#3b82f6" }]}
                    />
                    <Text style={styles.legendText}>Assigned</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View
                      style={[styles.legendDot, { backgroundColor: "#10b981" }]}
                    />
                    <Text style={styles.legendText}>Completed</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.chartSubtitle}>
                2026-10-15: 0 assigned · 0 completed
              </Text>

              {/* WRAPPER TO PREVENT OVERFLOW */}
              <View style={styles.svgContainer}>
                <Svg
                  height="180"
                  width="100%"
                  viewBox={`0 0 ${chartWidth} ${chartHeight + 30}`}
                  preserveAspectRatio="none"
                >
                  {/* Horizontal Grid Lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((tick, i) => (
                    <Line
                      key={i}
                      x1="0"
                      y1={chartHeight * tick}
                      x2={chartWidth}
                      y2={chartHeight * tick}
                      stroke="#e2e8f0"
                      strokeWidth="2"
                    />
                  ))}

                  {/* Vertical Dashed Line (Current Date Indicator) */}
                  <Line
                    x1={(13 / 14) * chartWidth}
                    y1="0"
                    x2={(13 / 14) * chartWidth}
                    y2={chartHeight}
                    stroke="#cbd5e1"
                    strokeWidth="3"
                    strokeDasharray="8, 8"
                  />

                  {/* Assigned Line (Blue) */}
                  <Path
                    d={getPathData(lineChartData.assigned)}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="4"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />

                  {/* Completed Line (Green) */}
                  <Path
                    d={getPathData(lineChartData.completed)}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="4"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />

                  {/* X-axis labels */}
                  {lineChartData.days.map((day, i) => (
                    <SvgText
                      key={i}
                      x={(i / (lineChartData.days.length - 1)) * chartWidth}
                      y={chartHeight + 25}
                      fontSize="24"
                      fill="#94a3b8"
                      textAnchor="middle"
                    >
                      {day}
                    </SvgText>
                  ))}
                </Svg>
              </View>
            </View>

            {/* DEADLINE CALENDAR CARD */}
            <View style={styles.chartCard}>
              <View style={styles.calendarHeader}>
                <MaterialIcons name="chevron-left" size={24} color="#0f172a" />
                <Text style={styles.calendarTitle}>{calendarData.month}</Text>
                <MaterialIcons name="chevron-right" size={24} color="#0f172a" />
              </View>

              {/* Days of Week */}
              <View style={styles.calendarRow}>
                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                  <Text key={i} style={styles.calendarDayLabel}>
                    {d}
                  </Text>
                ))}
              </View>

              {/* Calendar Grid */}
              <View style={styles.calendarGrid}>
                {/* Empty spaces for days before the 1st */}
                {Array.from({ length: calendarData.startDay }).map((_, i) => (
                  <View key={`empty-${i}`} style={styles.calendarCellWrapper} />
                ))}

                {/* Actual days */}
                {Array.from({ length: calendarData.daysInMonth }).map(
                  (_, i) => {
                    const day = i + 1;
                    const taskCount = calendarData.tasks[day] || 0;
                    const isToday = day === calendarData.currentDay;

                    return (
                      <View key={day} style={styles.calendarCellWrapper}>
                        <View
                          style={[
                            styles.calendarCell,
                            { backgroundColor: getHeatmapColor(taskCount) },
                            isToday && styles.calendarCellToday,
                          ]}
                        >
                          <Text
                            style={[
                              styles.calendarCellText,
                              isToday && styles.calendarCellTextToday,
                            ]}
                          >
                            {day}
                          </Text>
                        </View>
                      </View>
                    );
                  },
                )}
              </View>

              {/* Legend */}
              <View style={styles.calendarLegend}>
                <Text style={styles.calendarLegendText}>Less</Text>
                <View
                  style={[
                    styles.calendarLegendBox,
                    { backgroundColor: "#f8f9fa" },
                  ]}
                />
                <View
                  style={[
                    styles.calendarLegendBox,
                    { backgroundColor: "#d1fae5" },
                  ]}
                />
                <View
                  style={[
                    styles.calendarLegendBox,
                    { backgroundColor: "#6ee7b7" },
                  ]}
                />
                <View
                  style={[
                    styles.calendarLegendBox,
                    { backgroundColor: "#059669" },
                  ]}
                />
                <Text style={styles.calendarLegendText}>More</Text>
              </View>
            </View>

            {/* Footer */}
            <Footer />
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
  // Sidebar
  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.3)",
    zIndex: 5,
  },
  sidebar: {
    position: "absolute",
    width: width * 0.75,
    height: "100%",
    backgroundColor: "#fff",
    padding: 20,
    zIndex: 10,
    elevation: 10,
  },
  brandContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  brandLogo: { width: 200, height: 90 },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 10,
  },
  menuItemActive: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#006857",
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
  menuItemLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  menuText: { marginLeft: 12, fontSize: 14, color: "#374151" },
  menuTextActive: {
    marginLeft: 12,
    fontSize: 14,
    color: "#fff",
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
    borderRadius: 8,
  },
  dropdownText: { fontSize: 13, color: "#6b7280", marginLeft: 10 },
  dropdownItemLogout: {
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    marginTop: 4,
    paddingTop: 12,
  },
  dropdownTextLogout: { color: "#ef4444" },
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

  // Header
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  header: {
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 64,
    zIndex: 20,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  menuButton: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: "900", color: "#191C1D" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  searchIconTrigger: { padding: 4 },
  iconButton: { padding: 4 },
  avatar: { width: 32, height: 32, borderRadius: 16 },
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
  },
  cancelSearchText: { fontSize: 14, fontWeight: "600", color: "#006857" },
  searchDropdownContainer: {
    position: "absolute",
    top: 64,
    left: 20,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginTop: 8,
    zIndex: 15,
    elevation: 15,
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
  searchResultTitle: { fontSize: 15, fontWeight: "600", color: "#1F2937" },
  searchResultCategory: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  emptySearchContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60,
    gap: 12,
  },
  emptySearchText: { fontSize: 14, color: "#9CA3AF" },

  // Page Layout
  scrollContent: { padding: 20, paddingBottom: 40 },
  pageHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    gap: 12,
  },
  pageTitle: { fontSize: 30, fontWeight: "800", color: "#191C1D" },
  pageSubtitle: { fontSize: 13, color: "#64748b", marginTop: 4 },
  headerAddBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#006857",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  headerAddBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },

  // Stats
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0f172a",
    marginTop: 4,
  },
  statIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  // Chart Card General
  chartCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 24,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  chartTitle: { fontSize: 16, fontWeight: "700", color: "#0f172a" },
  chartSubtitle: { fontSize: 12, color: "#64748b", marginBottom: 16 },
  legendRow: { flexDirection: "row", gap: 12 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 12, color: "#475569" },

  // SVG Container
  svgContainer: { width: "100%", alignItems: "center", marginVertical: 10 },

  // Calendar Styles
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  calendarTitle: { fontSize: 16, fontWeight: "700", color: "#0f172a" },
  calendarRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 8,
  },
  calendarDayLabel: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "600",
    width: 32,
    textAlign: "center",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  calendarCellWrapper: { width: "14.28%", aspectRatio: 1, padding: 2 },
  calendarCell: {
    flex: 1,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  calendarCellToday: { borderColor: "#10b981", borderWidth: 2 },
  calendarCellText: { fontSize: 12, fontWeight: "600", color: "#334155" },
  calendarCellTextToday: { color: "#10b981", fontWeight: "800" },
  calendarLegend: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 16,
    gap: 6,
  },
  calendarLegendText: { fontSize: 10, color: "#64748b", marginHorizontal: 4 },
  calendarLegendBox: {
    width: 14,
    height: 14,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  // Footer
  footer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginTop: 20,
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
  footerFoundationName: { fontSize: 16, fontWeight: "700", color: "#065f46" },
  footerTagline: { fontSize: 12, color: "#6B7280", lineHeight: 16 },
  footerBottom: {
    borderTopWidth: 1,
    borderTopColor: "#EDEEEF",
    paddingTop: 16,
  },
  footerCopyright: { fontSize: 12, color: "#6B7280" },
});
