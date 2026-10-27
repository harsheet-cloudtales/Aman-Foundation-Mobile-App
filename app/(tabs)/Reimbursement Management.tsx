// app/(tabs)/reimbursements.tsx
import { RouteGuard } from "@/components/RouteGuard";
import { useAuth } from "@/lib/useAuth";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  Keyboard,
  Modal,
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
    title: "Reimbursements",
    route: "/(tabs)/reimbursements",
    icon: "receipt-long",
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

const FILTERS = ["ALL", "PENDING", "APPROVED", "REJECTED", "REIMBURSED"];

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
// HELPERS
// ============================================
const formatINR = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const d = new Date(dateString);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function ReimbursementsPage() {
  const { user, token } = useAuth();
  const router = useRouter();

  // Data State
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClaim, setSelectedClaim] = useState<any>(null);

  // Sidebar State
  const [menuOpen, setMenuOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-width)).current;

  // Header Search State
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [headerSearchQuery, setHeaderSearchQuery] = useState("");
  const expandAnim = useRef(new Animated.Value(0)).current;
  const dropdownAnim = useRef(new Animated.Value(0)).current;

  // Sidebar Dropdowns
  const [educationDropdownOpen, setEducationDropdownOpen] = useState(false);
  const [reportsDropdownOpen, setReportsDropdownOpen] = useState(false);
  const [livelihoodDropdownOpen, setLivelihoodDropdownOpen] = useState(false);
  const [authDropdownOpen, setAuthDropdownOpen] = useState(false);

  const educationRotateAnim = useRef(new Animated.Value(0)).current;
  const reportsRotateAnim = useRef(new Animated.Value(0)).current;
  const livelihoodRotateAnim = useRef(new Animated.Value(0)).current;
  const authRotateAnim = useRef(new Animated.Value(0)).current;

  // ============ FETCH CLAIMS ============
  const loadClaims = useCallback(
    async (silent = false) => {
      if (!token) return;
      if (!silent) setLoading(true);
      try {
        const res = await fetch("/api/reimbursements", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (json.success) {
          setClaims(json.data || []);
        } else {
          Alert.alert("Error", json.error || "Failed to load claims.");
        }
      } catch (err: any) {
        Alert.alert("Error", "Network error loading claims.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token],
  );

  useEffect(() => {
    loadClaims();
  }, [loadClaims]);

  const onRefresh = () => {
    setRefreshing(true);
    loadClaims(true);
  };

  // ============ CALCULATIONS ============
  const totals = useMemo(() => {
    return claims.reduce(
      (acc, claim) => {
        const claimed = Number(claim.totalClaimed || 0);
        if (claim.status === "PENDING") {
          acc.pending += claimed;
          acc.pendingCount += 1;
        }
        if (claim.status === "APPROVED") {
          acc.approved += Number(claim.totalApproved ?? claimed);
          acc.approvedCount += 1;
        }
        if (claim.status === "REIMBURSED") {
          acc.reimbursed += Number(
            claim.totalReimbursed ?? claim.totalApproved ?? claimed,
          );
        }
        return acc;
      },
      {
        pending: 0,
        pendingCount: 0,
        approved: 0,
        approvedCount: 0,
        reimbursed: 0,
      },
    );
  }, [claims]);

  const filteredClaims = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return claims.filter((c) => {
      const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
      const matchesSearch =
        !q ||
        (c.title || "").toLowerCase().includes(q) ||
        (c.purpose || "").toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [claims, statusFilter, searchQuery]);

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

  // ============ STATUS BADGE RENDERER ============
  const renderBadge = (status: string) => {
    let bg = "#f1f5f9";
    let text = "#475569";
    if (status === "PENDING") {
      bg = "#fef3c7";
      text = "#92400e";
    } else if (status === "APPROVED") {
      bg = "#d1fae5";
      text = "#065f46";
    } else if (status === "REJECTED") {
      bg = "#ffe4e6";
      text = "#9f1239";
    } else if (status === "REIMBURSED") {
      bg = "#dbeafe";
      text = "#1e40af";
    }

    return (
      <View style={[styles.badge, { backgroundColor: bg }]}>
        <Text style={[styles.badgeText, { color: text }]}>{status}</Text>
      </View>
    );
  };

  // ============ USER GUARD ============
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 12, color: "#64748b" }}>Loading user…</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ============ RENDER ============
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

            {/* Task */}
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
                <Ionicons name="bar-chart-outline" size={20} color="#4b5563" />
                <Text style={styles.menuText}>Task Analytics</Text>
              </View>
            </TouchableOpacity>

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
                    <Text style={styles.dropdownText}>Fellow Performance</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

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

            {/* Active Link */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() =>
                handleNavigation("/(tabs)/Reimbursement Management")
              }
            >
              <View style={styles.menuItemLeft}>
                <Ionicons name="payments" size={20} color="#4b5563" />
                <Text style={styles.menuText}>Reimbursements</Text>
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
                          user.avatar ||
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
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#006857"]}
              />
            }
          >
            {/* Page Header */}
            <View style={styles.pageHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionLabel}>Staff Expenses</Text>
                <Text style={styles.pageTitle}>Reimbursements</Text>
                <Text style={styles.pageSubtitle}>
                  Submit expense claims and track their approval and payment.
                </Text>
              </View>
              <TouchableOpacity
                onPress={() =>
                  router.push("/(tabs)/Reimbursement Management/new")
                }
                style={styles.headerAddBtn}
              >
                <MaterialIcons name="add" size={16} color="#fff" />
                <Text style={styles.headerAddBtnText}>New Claim</Text>
              </TouchableOpacity>
            </View>

            {/* Summary Cards */}
            <View style={styles.statsGrid}>
              <View
                style={[
                  styles.statCard,
                  { borderColor: "#fcd34d", backgroundColor: "#fffbeb" },
                ]}
              >
                <Text style={[styles.statLabel, { color: "#b45309" }]}>
                  Pending Claims
                </Text>
                <Text style={[styles.statValue, { color: "#78350f" }]}>
                  {formatINR(totals.pending)}
                </Text>
                <Text style={[styles.statSubtitle, { color: "#b45309" }]}>
                  {totals.pendingCount} awaiting review
                </Text>
              </View>
              <View
                style={[
                  styles.statCard,
                  { borderColor: "#6ee7b7", backgroundColor: "#ecfdf5" },
                ]}
              >
                <Text style={[styles.statLabel, { color: "#047857" }]}>
                  Approved
                </Text>
                <Text style={[styles.statValue, { color: "#064e3b" }]}>
                  {formatINR(totals.approved)}
                </Text>
                <Text style={[styles.statSubtitle, { color: "#047857" }]}>
                  {totals.approvedCount} awaiting payment
                </Text>
              </View>
              <View
                style={[
                  styles.statCard,
                  { borderColor: "#93c5fd", backgroundColor: "#eff6ff" },
                ]}
              >
                <Text style={[styles.statLabel, { color: "#1d4ed8" }]}>
                  Reimbursed
                </Text>
                <Text style={[styles.statValue, { color: "#1e3a8a" }]}>
                  {formatINR(totals.reimbursed)}
                </Text>
                <Text style={[styles.statSubtitle, { color: "#1d4ed8" }]}>
                  Total paid out to you
                </Text>
              </View>
            </View>

            {/* Filters & Search */}
            <View style={styles.filtersContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8 }}
              >
                {FILTERS.map((status) => {
                  const count =
                    status === "ALL"
                      ? claims.length
                      : claims.filter((c) => c.status === status).length;
                  return (
                    <TouchableOpacity
                      key={status}
                      onPress={() => setStatusFilter(status)}
                      style={[
                        styles.filterBtn,
                        statusFilter === status
                          ? styles.filterBtnActive
                          : styles.filterBtnInactive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterBtnText,
                          statusFilter === status
                            ? styles.filterBtnTextActive
                            : styles.filterBtnTextInactive,
                        ]}
                      >
                        {status === "ALL" ? "All" : status.toLowerCase()} (
                        {count})
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              <View style={styles.searchBarContainer}>
                <MaterialIcons name="search" size={18} color="#9ca3af" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search claims..."
                  placeholderTextColor="#9ca3af"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
            </View>

            {/* Claims List */}
            {loading ? (
              <View style={{ paddingVertical: 40, alignItems: "center" }}>
                <ActivityIndicator size="large" color="#006857" />
              </View>
            ) : filteredClaims.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialIcons name="receipt-long" size={48} color="#cbd5e1" />
                <Text style={styles.emptyStateTitle}>
                  {claims.length === 0
                    ? "No reimbursement claims yet."
                    : "No claims match this filter."}
                </Text>
              </View>
            ) : (
              filteredClaims.map((claim) => (
                <View key={claim.id} style={styles.claimCard}>
                  <View style={styles.claimHeader}>
                    <View style={{ flex: 1 }}>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 8,
                          flexWrap: "wrap",
                        }}
                      >
                        <Text style={styles.claimTitle}>{claim.title}</Text>
                        {renderBadge(claim.status)}
                      </View>
                      {claim.purpose && (
                        <Text style={styles.claimPurpose} numberOfLines={2}>
                          {claim.purpose}
                        </Text>
                      )}
                      <Text style={styles.claimMeta}>
                        Submitted {formatDate(claim.createdAt)} ·{" "}
                        {claim.items?.length || 0} expense line
                        {(claim.items?.length || 0) === 1 ? "" : "s"}
                      </Text>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={styles.claimLabel}>Claimed</Text>
                      <Text style={styles.claimAmount}>
                        {formatINR(claim.totalClaimed)}
                      </Text>
                      {claim.status === "REIMBURSED" && (
                        <Text style={styles.claimReimbursed}>
                          {formatINR(
                            claim.totalReimbursed ?? claim.totalApproved,
                          )}{" "}
                          reimbursed
                        </Text>
                      )}
                    </View>
                  </View>

                  <View style={styles.claimActions}>
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => setSelectedClaim(claim)}
                    >
                      <MaterialIcons
                        name="visibility"
                        size={16}
                        color="#334155"
                      />
                      <Text style={styles.actionBtnText}>View Details</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}

            {/* Footer */}
            <Footer />
          </ScrollView>
        </SafeAreaView>

        {/* ============ CLAIM DETAILS MODAL ============ */}
        {selectedClaim && (
          <Modal
            visible
            transparent
            animationType="slide"
            onRequestClose={() => setSelectedClaim(null)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Reimbursement Details</Text>
                  <TouchableOpacity
                    onPress={() => setSelectedClaim(null)}
                    style={styles.closeBtn}
                  >
                    <MaterialIcons name="close" size={22} color="#64748b" />
                  </TouchableOpacity>
                </View>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  style={{ padding: 20 }}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "bold",
                      marginBottom: 8,
                    }}
                  >
                    {selectedClaim.title}
                  </Text>
                  <View style={{ marginBottom: 16 }}>
                    {renderBadge(selectedClaim.status)}
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Total Claimed</Text>
                    <Text style={styles.detailValue}>
                      {formatINR(selectedClaim.totalClaimed)}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Submitted</Text>
                    <Text style={styles.detailValue}>
                      {formatDate(selectedClaim.createdAt)}
                    </Text>
                  </View>
                  {selectedClaim.purpose && (
                    <View style={{ marginTop: 16 }}>
                      <Text style={styles.detailLabel}>Purpose</Text>
                      <Text
                        style={{ fontSize: 14, color: "#334155", marginTop: 4 }}
                      >
                        {selectedClaim.purpose}
                      </Text>
                    </View>
                  )}
                </ScrollView>
                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    onPress={() => setSelectedClaim(null)}
                    style={styles.primaryBtn}
                  >
                    <Text style={styles.primaryBtnText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}
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
  dropdownItemLogout: {
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    marginTop: 4,
    paddingTop: 12,
  },
  dropdownTextLogout: { color: "#ef4444" },

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

  // Page
  scrollContent: { padding: 20, paddingBottom: 40 },
  pageHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    gap: 12,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    color: "#64748b",
    letterSpacing: 0.5,
  },
  pageTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: "#191C1D",
    marginTop: 4,
  },
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
  statsGrid: { gap: 12, marginBottom: 24 },
  statCard: { padding: 16, borderRadius: 12, borderWidth: 1 },
  statLabel: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statValue: { fontSize: 22, fontWeight: "800", marginBottom: 4 },
  statSubtitle: { fontSize: 12 },

  // Filters
  filtersContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 24,
    gap: 12,
  },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  filterBtnActive: { backgroundColor: "#006857" },
  filterBtnInactive: { backgroundColor: "#f1f5f9" },
  filterBtnText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  filterBtnTextActive: { color: "#fff" },
  filterBtnTextInactive: { color: "#475569" },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 14,
    height: 40,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: "#111827", paddingVertical: 0 },

  // Claim Cards
  claimCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 12,
  },
  claimHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  claimTitle: { fontSize: 16, fontWeight: "700", color: "#0f172a" },
  claimPurpose: {
    fontSize: 13,
    color: "#475569",
    marginTop: 4,
    lineHeight: 18,
  },
  claimMeta: { fontSize: 11, color: "#64748b", marginTop: 8 },
  claimLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#94a3b8",
    textTransform: "uppercase",
  },
  claimAmount: { fontSize: 18, fontWeight: "700", color: "#0f172a" },
  claimReimbursed: {
    fontSize: 11,
    fontWeight: "600",
    color: "#047857",
    marginTop: 2,
  },
  claimActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  actionBtnText: { fontSize: 12, fontWeight: "700", color: "#334155" },

  // Badges
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 9, fontWeight: "800", textTransform: "uppercase" },

  // Empty State
  emptyState: { paddingVertical: 60, alignItems: "center" },
  emptyStateTitle: { fontSize: 15, color: "#64748b", marginTop: 12 },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "100%",
    maxWidth: 500,
    maxHeight: "90%",
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  modalTitle: { fontSize: 18, fontWeight: "800", color: "#0f172a" },
  closeBtn: { padding: 6, backgroundColor: "#f1f5f9", borderRadius: 999 },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  detailLabel: { fontSize: 13, color: "#64748b", fontWeight: "600" },
  detailValue: { fontSize: 14, fontWeight: "700", color: "#0f172a" },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    alignItems: "flex-end",
  },
  primaryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#006857",
  },
  primaryBtnText: { fontSize: 13, fontWeight: "700", color: "#fff" },

  // Footer
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
  footerFoundationName: { fontSize: 16, fontWeight: "700", color: "#065f46" },
  footerTagline: { fontSize: 12, color: "#6B7280", lineHeight: 16 },
  footerBottom: {
    borderTopWidth: 1,
    borderTopColor: "#EDEEEF",
    paddingTop: 16,
  },
  footerCopyright: { fontSize: 12, color: "#6B7280" },
});
