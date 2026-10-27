import { RouteGuard } from "@/components/RouteGuard";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
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
// TYPES
// ============================================
interface Calamity {
  id: string;
  name: string;
  location: string;
  type: string;
  expectedFamiliesAffected: number;
  humanLossDied: number;
  humanLossInjured: number;
  humanLossMissing: number;
  propertyLossEstimate: number;
  active: boolean;
  createdAt: string;
}

interface Provider {
  id: string;
  name: string;
  type: string;
  contact: string;
  status: string;
}

interface Inventory {
  id: string;
  item: string;
  calamity: string;
  stockNeeded: number;
  stockReceived: number;
  fulfillment: string;
}

interface ReliefLog {
  id: string;
  description: string;
  amount: number;
  date: string;
  location: string;
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
  onErrorContainer: "#93000a",
  rose: "#ef4444",
  emerald: "#10b981",
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
export default function DisasterRelief() {
  const { user } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeAlert, setActiveAlert] = useState<any>(null);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [showCalamityModal, setShowCalamityModal] = useState(false);
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [broadcastSeverity, setBroadcastSeverity] = useState("Urgent");
  const [activeTab, setActiveTab] = useState("Help Providers");

  // Header Search Bar State
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [headerSearchQuery, setHeaderSearchQuery] = useState("");
  const expandAnim = useRef(new Animated.Value(0)).current;
  const dropdownAnim = useRef(new Animated.Value(0)).current;

  // Dropdown states
  const [educationDropdownOpen, setEducationDropdownOpen] = useState(false);
  const [reportsDropdownOpen, setReportsDropdownOpen] = useState(false);
  const [livelihoodDropdownOpen, setLivelihoodDropdownOpen] = useState(false);
  const [authDropdownOpen, setAuthDropdownOpen] = useState(false);

  // Animated values
  const slideAnim = useRef(new Animated.Value(-width)).current;
  const educationRotateAnim = useRef(new Animated.Value(0)).current;
  const reportsRotateAnim = useRef(new Animated.Value(0)).current;
  const livelihoodRotateAnim = useRef(new Animated.Value(0)).current;
  const authRotateAnim = useRef(new Animated.Value(0)).current;

  // Data states
  const [calamities, setCalamities] = useState<Calamity[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [reliefLogs, setReliefLogs] = useState<ReliefLog[]>([]);
  const [currentCalamity, setCurrentCalamity] = useState<Calamity | null>(null);

  // Form states for calamity
  const [calamityName, setCalamityName] = useState("");
  const [calamityLocation, setCalamityLocation] = useState("");
  const [calamityType, setCalamityType] = useState("Flood");
  const [calamityFamilies, setCalamityFamilies] = useState("");
  const [calamityDied, setCalamityDied] = useState("");
  const [calamityInjured, setCalamityInjured] = useState("");
  const [calamityMissing, setCalamityMissing] = useState("");
  const [calamityPropertyLoss, setCalamityPropertyLoss] = useState("");

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
  // FETCH DATA
  // ============================================
  const fetchData = async () => {
    try {
      setLoading(true);

      const calamitiesData = await api.get<Calamity[]>(
        "/api/disaster/calamities",
      );
      if (calamitiesData && calamitiesData.length > 0) {
        setCalamities(calamitiesData);
        const activeCalamity = calamitiesData.find((c) => c.active);
        setCurrentCalamity(activeCalamity || calamitiesData[0]);
      }

      const providersData = await api.get<Provider[]>(
        "/api/disaster/providers",
      );
      if (providersData) {
        setProviders(providersData);
      }

      const inventoryData = await api.get<Inventory[]>(
        "/api/disaster/inventory",
      );
      if (inventoryData) {
        setInventory(inventoryData);
      }

      const logsData = await api.get<ReliefLog[]>("/api/disaster/logs");
      if (logsData) {
        setReliefLogs(logsData);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        console.error("Disaster data fetch error:", err.message);
      }
      setCalamities([
        {
          id: "FLD-001",
          name: "Test Flood",
          location: "River Bank",
          type: "Flood",
          expectedFamiliesAffected: 0,
          humanLossDied: 0,
          humanLossInjured: 0,
          humanLossMissing: 0,
          propertyLossEstimate: 0,
          active: true,
          createdAt: new Date().toISOString(),
        },
      ]);
      setCurrentCalamity({
        id: "FLD-001",
        name: "Test Flood",
        location: "River Bank",
        type: "Flood",
        expectedFamiliesAffected: 0,
        humanLossDied: 0,
        humanLossInjured: 0,
        humanLossMissing: 0,
        propertyLossEstimate: 0,
        active: true,
        createdAt: new Date().toISOString(),
      });
      setProviders([
        {
          id: "PROV-401",
          name: "Kalgachia Hospital Medical Unit",
          type: "Responders (Medical & Health)",
          contact: "Dr. A. Rahman (+91 94350 xxxxx)",
          status: "Active in Bartari Camp",
        },
        {
          id: "PROV-112",
          name: "Aman Foundation Relief Convoy",
          type: "Responders (Logistics & Food)",
          contact: "H. Ali (convoy_lead@amanassam.org)",
          status: "Dispatched to Moinbari Char",
        },
        {
          id: "PROV-908",
          name: "Kalgachia Student Volunteer Cohort",
          type: "Volunteers (Distribution)",
          contact: "College Volunteer Group",
          status: "Standby / Rest",
        },
      ]);
      setInventory([
        {
          id: "1",
          item: "Assam Rice & Dal Ration Packs",
          calamity: "Flood 2026",
          stockNeeded: 1200,
          stockReceived: 1200,
          fulfillment: "Optimal",
        },
        {
          id: "2",
          item: "Drinking Water Halogen Tablets & Tanks",
          calamity: "Flood 2026",
          stockNeeded: 14000,
          stockReceived: 8000,
          fulfillment: "Critical Shortage",
        },
        {
          id: "3",
          item: "First Aid & Anti-Venom Kits",
          calamity: "Flood 2026",
          stockNeeded: 45,
          stockReceived: 45,
          fulfillment: "Optimal",
        },
        {
          id: "4",
          item: "Tarpaulins & Mosquito Nets",
          calamity: "Flood 2026",
          stockNeeded: 250,
          stockReceived: 180,
          fulfillment: "Restock Requested",
        },
      ]);
      setReliefLogs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
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

  const handleNavigation = (route: string) => {
    closeMenu();
    setTimeout(() => {
      router.push(route as any);
    }, 150);
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

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
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
  // CRUD OPERATIONS
  // ============================================
  const handleBroadcast = () => {
    if (!broadcastMsg) {
      Alert.alert("Error", "Please enter a message");
      return;
    }
    setActiveAlert({
      severity: broadcastSeverity,
      message: broadcastMsg,
    });
    setBroadcastMsg("");
    setShowBroadcastModal(false);
    Alert.alert("Success", "Alert broadcasted successfully");
  };

  const handleAddCalamity = async () => {
    if (!calamityName || !calamityLocation) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    try {
      const newCalamity = {
        name: calamityName,
        location: calamityLocation,
        type: calamityType,
        expectedFamiliesAffected: parseInt(calamityFamilies) || 0,
        humanLossDied: parseInt(calamityDied) || 0,
        humanLossInjured: parseInt(calamityInjured) || 0,
        humanLossMissing: parseInt(calamityMissing) || 0,
        propertyLossEstimate: parseFloat(calamityPropertyLoss) || 0,
        active: true,
      };

      const response = await api.post("/api/disaster/calamities", newCalamity);

      if (response) {
        Alert.alert("Success", "Calamity added successfully");
        setCalamityName("");
        setCalamityLocation("");
        setCalamityType("Flood");
        setCalamityFamilies("");
        setCalamityDied("");
        setCalamityInjured("");
        setCalamityMissing("");
        setCalamityPropertyLoss("");
        setShowCalamityModal(false);
        fetchData();
      }
    } catch (err) {
      if (err instanceof ApiError) {
        Alert.alert("Error", err.message);
      }
    }
  };

  const handleDeleteCalamity = (id: string, name: string) => {
    Alert.alert("Delete Calamity", `Are you sure you want to delete ${name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.del(`/api/disaster/calamities/${id}`);
            Alert.alert("Success", "Calamity deleted successfully");
            fetchData();
          } catch (err) {
            if (err instanceof ApiError) {
              Alert.alert("Error", err.message);
            }
          }
        },
      },
    ]);
  };

  // ============================================
  // RENDER HELPERS
  // ============================================
  const getFulfillmentStyle = (status: string) => {
    if (status === "Optimal") return styles.statusOptimal;
    if (status === "Critical Shortage") return styles.statusCritical;
    if (status === "Restock Requested") return styles.statusRestock;
    return styles.statusInProgress;
  };

  const ToggleTab = ({ title }: { title: string }) => (
    <TouchableOpacity
      style={[styles.tab, activeTab === title && styles.tabActive]}
      onPress={() => setActiveTab(title)}
    >
      <Text
        style={[styles.tabText, activeTab === title && styles.tabTextActive]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  // ============================================
  // LOADING STATE
  // ============================================
  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading disaster data...</Text>
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
                    <Text style={styles.dropdownText}>Active Programs</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => handleNavigation("/education_pta_programs")}
                  >
                    <Ionicons
                      name="document-text-outline"
                      size={18}
                      color="#6b7280"
                    />
                    <Text style={styles.dropdownText}>PTA and Programs</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => handleNavigation("/after-school-students")}
                  >
                    <Ionicons
                      name="document-text-outline"
                      size={18}
                      color="#6b7280"
                    />
                    <Text style={styles.dropdownText}>
                      After-School-Students
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => handleNavigation("/after-school-centres")}
                  >
                    <Ionicons
                      name="document-text-outline"
                      size={18}
                      color="#6b7280"
                    />
                    <Text style={styles.dropdownText}>
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
                <Ionicons name="bar-chart-outline" size={20} color="#4b5563" />
                <Text style={styles.menuText}>Task Analytics</Text>
              </View>
            </TouchableOpacity>

            {/* FELLOW OBSERVATION (top-level dropdown) */}
            <View>
              <TouchableOpacity
                style={styles.menuItemWithDropdown}
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

            {/* LIVELIHOOD DROPDOWN */}
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

            {/* DISASTER RELIEF — ACTIVE */}
            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemActive]}
              onPress={() => closeMenu()}
            >
              <Ionicons name="snow-outline" size={20} color="#fff" />
              <Text style={styles.menuTextActive}>Disaster Relief</Text>
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

            {/* ACCOUNT SECTION */}
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
                          color={colors.primary}
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
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.primary]}
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

            {/* Dynamic Warning Alert */}
            {activeAlert && (
              <View style={styles.alertBanner}>
                <View style={styles.alertContent}>
                  <MaterialIcons
                    name="gavel"
                    size={20}
                    color={colors.secondary}
                  />
                  <Text style={styles.alertText}>
                    <Text style={styles.alertBold}>
                      [{activeAlert.severity} Alert]
                    </Text>{" "}
                    {activeAlert.message}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setActiveAlert(null)}
                  style={styles.alertClose}
                >
                  <MaterialIcons name="close" size={18} color="#6B7280" />
                </TouchableOpacity>
              </View>
            )}

            {/* Header Section */}
            <View>
              <Text style={styles.sectionLabel}>Operations Portal</Text>
              <Text style={styles.mainTitle}>Disaster Relief Management</Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.addCalamityButton]}
                onPress={() => setShowCalamityModal(true)}
              >
                <MaterialIcons
                  name="emergency"
                  size={18}
                  color={colors.onSurface}
                />
                <Text style={styles.actionButtonText}>Add Calamity</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.broadcastButton]}
                onPress={() => setShowBroadcastModal(true)}
              >
                <MaterialIcons
                  name="add-alert"
                  size={18}
                  color={colors.onPrimary}
                />
                <Text
                  style={[styles.actionButtonText, styles.broadcastButtonText]}
                >
                  Broadcast Alert
                </Text>
              </TouchableOpacity>
            </View>

            {/* Calamity Cards */}
            {calamities.map((calamity) => (
              <View key={calamity.id} style={styles.floodCard}>
                <View style={styles.floodCardHeader}>
                  <View style={styles.floodCardTitleContainer}>
                    <MaterialIcons
                      name="warning"
                      size={20}
                      color={colors.error}
                    />
                    <Text style={styles.floodCardTitle}>{calamity.name}</Text>
                  </View>
                  <View style={styles.floodCardActions}>
                    <View style={styles.floodCardStatus}>
                      <Text style={styles.floodCardStatusText}>
                        {calamity.active ? "Active Calamity" : "Resolved"}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() =>
                        handleDeleteCalamity(calamity.id, calamity.name)
                      }
                      style={styles.deleteCalamityBtn}
                    >
                      <MaterialIcons
                        name="delete-outline"
                        size={18}
                        color={colors.rose}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.floodCardBody}>
                  <View style={styles.floodCardRow}>
                    <Text style={styles.floodCardLabel}>Location:</Text>
                    <Text style={styles.floodCardValue}>
                      {calamity.location}
                    </Text>
                  </View>
                  <View style={styles.floodCardRow}>
                    <Text style={styles.floodCardLabel}>Type:</Text>
                    <Text style={styles.floodCardValue}>{calamity.type}</Text>
                  </View>
                </View>

                <View style={styles.floodStatsContainer}>
                  <View style={styles.floodStatItem}>
                    <Text style={styles.floodStatLabel}>Families Affected</Text>
                    <Text style={styles.floodStatValue}>
                      {calamity.expectedFamiliesAffected}
                    </Text>
                  </View>

                  <View style={styles.floodStatItem}>
                    <Text
                      style={[styles.floodStatLabel, { color: colors.error }]}
                    >
                      Human Loss
                    </Text>
                    <View style={styles.floodStatHumanLoss}>
                      <Text
                        style={[styles.floodStatSmall, { color: colors.error }]}
                      >
                        {calamity.humanLossDied} Died
                      </Text>
                      <Text
                        style={[
                          styles.floodStatSmall,
                          { color: colors.secondary },
                        ]}
                      >
                        {calamity.humanLossInjured} Injured
                      </Text>
                      <Text
                        style={[
                          styles.floodStatSmall,
                          { color: colors.onSurfaceVariant },
                        ]}
                      >
                        {calamity.humanLossMissing} Missing
                      </Text>
                    </View>
                  </View>

                  <View style={styles.floodStatItem}>
                    <Text style={styles.floodStatLabel}>
                      Property Loss Est.
                    </Text>
                    <Text style={styles.floodStatValue}>
                      ₹ {calamity.propertyLossEstimate.toLocaleString()}
                    </Text>
                  </View>
                </View>
              </View>
            ))}

            {/* Tabs */}
            <View style={styles.tabContainer}>
              <ToggleTab title="Help Providers" />
              <ToggleTab title="Resource Inventory" />
            </View>

            {/* Tab Content */}
            <View style={styles.tabContent}>
              {activeTab === "Help Providers" && (
                <View>
                  <Text style={styles.tableTitle}>
                    Help Providers & Responder Roster
                  </Text>
                  <View style={styles.providerHeader}>
                    <Text style={[styles.headerCell, styles.providerName]}>
                      Responder Name
                    </Text>
                    <Text style={[styles.headerCell, styles.providerType]}>
                      Capability Type
                    </Text>
                    <Text style={[styles.headerCell, styles.providerContact]}>
                      Contact
                    </Text>
                  </View>
                  {providers.map((item) => (
                    <View key={item.id} style={styles.tableRow}>
                      <Text style={[styles.rowCell, styles.providerNameCell]}>
                        {item.name}
                      </Text>
                      <Text style={[styles.rowCell, styles.providerTypeCell]}>
                        {item.type}
                      </Text>
                      <Text
                        style={[styles.rowCell, styles.providerContactCell]}
                      >
                        {item.contact}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {activeTab === "Resource Inventory" && (
                <View>
                  <Text style={styles.tableTitle}>Calamity Resource Needs</Text>
                  <View style={styles.inventoryHeader}>
                    <Text style={[styles.headerCell, styles.inventoryItem]}>
                      Aid Needed (Item)
                    </Text>
                    <Text style={[styles.headerCell, styles.inventoryCalamity]}>
                      Associated Calamity
                    </Text>
                    <Text style={[styles.headerCell, styles.inventoryStock]}>
                      Stock Needed
                    </Text>
                    <Text style={[styles.headerCell, styles.inventoryReceived]}>
                      Stock Received
                    </Text>
                    <Text
                      style={[styles.headerCell, styles.inventoryFulfillment]}
                    >
                      Fulfillment
                    </Text>
                  </View>
                  {inventory.length === 0 ? (
                    <View style={styles.emptyState}>
                      <Text style={styles.emptyStateText}>
                        No resources currently needed.
                      </Text>
                    </View>
                  ) : (
                    inventory.map((item) => (
                      <View key={item.id} style={styles.tableRow}>
                        <Text
                          style={[styles.rowCell, styles.inventoryItemCell]}
                        >
                          {item.item}
                        </Text>
                        <Text
                          style={[styles.rowCell, styles.inventoryCalamityCell]}
                        >
                          {item.calamity}
                        </Text>
                        <Text
                          style={[styles.rowCell, styles.inventoryStockCell]}
                        >
                          {item.stockNeeded}
                        </Text>
                        <Text
                          style={[styles.rowCell, styles.inventoryReceivedCell]}
                        >
                          {item.stockReceived}
                        </Text>
                        <Text
                          style={[
                            styles.rowCell,
                            styles.inventoryFulfillmentCell,
                          ]}
                        >
                          <Text style={[getFulfillmentStyle(item.fulfillment)]}>
                            {item.fulfillment}
                          </Text>
                        </Text>
                      </View>
                    ))
                  )}
                </View>
              )}
            </View>

            {/* Distribution Logs */}
            <View style={styles.logsCard}>
              <Text style={styles.logsTitle}>Relief Distribution Logs</Text>
              <Text style={styles.logsSubtitle}>Synced Realtime</Text>
              {reliefLogs.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>
                    No ledger transactions logged.
                  </Text>
                </View>
              ) : (
                reliefLogs.map((log) => (
                  <View key={log.id} style={styles.logItem}>
                    <Text style={styles.logDescription}>{log.description}</Text>
                    <Text style={styles.logAmount}>
                      ₹{log.amount.toLocaleString()}
                    </Text>
                  </View>
                ))
              )}
            </View>

            {/* Footer */}
            <Footer />
          </ScrollView>
        </SafeAreaView>

        {/* Broadcast Alert Modal */}
        <Modal
          visible={showBroadcastModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowBroadcastModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  Broadcast Regional Emergency Alert
                </Text>
                <TouchableOpacity onPress={() => setShowBroadcastModal(false)}>
                  <MaterialIcons name="close" size={24} color="#64748b" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalForm}>
                <View>
                  <Text style={styles.formLabel}>Emergency Message</Text>
                  <TextInput
                    style={[styles.formInput, styles.textArea]}
                    placeholder="e.g. Beki River water levels rising. Residents in Bartari advised to move to school shelter."
                    placeholderTextColor="#9ca3af"
                    value={broadcastMsg}
                    onChangeText={setBroadcastMsg}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>

                <View>
                  <Text style={styles.formLabel}>Alert Severity</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={broadcastSeverity}
                      onValueChange={(itemValue) =>
                        setBroadcastSeverity(itemValue)
                      }
                      style={styles.picker}
                    >
                      <Picker.Item label="Info Alert" value="Info" />
                      <Picker.Item label="Urgent Alert" value="Urgent" />
                      <Picker.Item
                        label="Critical Broadcast"
                        value="Critical"
                      />
                    </Picker>
                  </View>
                </View>

                <View style={styles.formButtons}>
                  <TouchableOpacity
                    onPress={() => setShowBroadcastModal(false)}
                    style={styles.cancelButton}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleBroadcast}
                    style={styles.submitButton}
                  >
                    <Text style={styles.submitButtonText}>Broadcast Now</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>

        {/* Add Calamity Modal */}
        <Modal
          visible={showCalamityModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowCalamityModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add New Calamity</Text>
                <TouchableOpacity onPress={() => setShowCalamityModal(false)}>
                  <MaterialIcons name="close" size={24} color="#64748b" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalForm}>
                <View>
                  <Text style={styles.formLabel}>Calamity Name *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. Assam Floods"
                    placeholderTextColor="#9ca3af"
                    value={calamityName}
                    onChangeText={setCalamityName}
                  />
                </View>

                <View>
                  <Text style={styles.formLabel}>Location *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. Kalgachia"
                    placeholderTextColor="#9ca3af"
                    value={calamityLocation}
                    onChangeText={setCalamityLocation}
                  />
                </View>

                <View>
                  <Text style={styles.formLabel}>Type</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={calamityType}
                      onValueChange={(itemValue) => setCalamityType(itemValue)}
                      style={styles.picker}
                    >
                      <Picker.Item label="Flood" value="Flood" />
                      <Picker.Item label="Earthquake" value="Earthquake" />
                      <Picker.Item label="Cyclone" value="Cyclone" />
                      <Picker.Item label="Drought" value="Drought" />
                      <Picker.Item label="Landslide" value="Landslide" />
                    </Picker>
                  </View>
                </View>

                <View>
                  <Text style={styles.formLabel}>
                    Expected Families Affected
                  </Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="0"
                    keyboardType="numeric"
                    placeholderTextColor="#9ca3af"
                    value={calamityFamilies}
                    onChangeText={setCalamityFamilies}
                  />
                </View>

                <View style={styles.formRow}>
                  <View style={styles.formRowItem}>
                    <Text style={[styles.formLabel, { color: colors.error }]}>
                      People Died
                    </Text>
                    <TextInput
                      style={[styles.formInput, styles.formInputSmall]}
                      placeholder="0"
                      keyboardType="numeric"
                      placeholderTextColor="#9ca3af"
                      value={calamityDied}
                      onChangeText={setCalamityDied}
                    />
                  </View>
                  <View style={styles.formRowItem}>
                    <Text
                      style={[styles.formLabel, { color: colors.secondary }]}
                    >
                      People Injured
                    </Text>
                    <TextInput
                      style={[styles.formInput, styles.formInputSmall]}
                      placeholder="0"
                      keyboardType="numeric"
                      placeholderTextColor="#9ca3af"
                      value={calamityInjured}
                      onChangeText={setCalamityInjured}
                    />
                  </View>
                  <View style={styles.formRowItem}>
                    <Text style={styles.formLabel}>People Missing</Text>
                    <TextInput
                      style={[styles.formInput, styles.formInputSmall]}
                      placeholder="0"
                      keyboardType="numeric"
                      placeholderTextColor="#9ca3af"
                      value={calamityMissing}
                      onChangeText={setCalamityMissing}
                    />
                  </View>
                </View>

                <View>
                  <Text style={styles.formLabel}>Property Loss (₹)</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="0.00"
                    keyboardType="numeric"
                    placeholderTextColor="#9ca3af"
                    value={calamityPropertyLoss}
                    onChangeText={setCalamityPropertyLoss}
                  />
                </View>

                <View style={styles.formButtons}>
                  <TouchableOpacity
                    onPress={() => setShowCalamityModal(false)}
                    style={styles.cancelButton}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleAddCalamity}
                    style={styles.submitButton}
                  >
                    <Text style={styles.submitButtonText}>Add Calamity</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </RouteGuard>
  );
}

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  // ============================================
  // 1. LOADING & SIDEBAR
  // ============================================
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
    marginTop: 0,
  },
  brandLogo: {
    width: 200,
    height: 90,
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
  menuItemLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  menuText: { marginLeft: 12, fontSize: 14, color: "#374151" },
  menuItemActive: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 30,
    marginBottom: 10,
    elevation: 3,
  },
  menuTextActive: { color: "#fff", marginLeft: 12, fontWeight: "600" },
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
  dropdownText: { fontSize: 13, color: "#6b7280", marginLeft: 10 },
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
  dropdownItemLogout: {
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    marginTop: 4,
    paddingTop: 12,
  },
  dropdownTextLogout: {
    color: "#ef4444",
  },

  // ============================================
  // 2. HEADER & EXPANDING SEARCH
  // ============================================
  container: { flex: 1, backgroundColor: colors.surface },
  header: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderBottomWidth: 1,
    borderBottomColor: "#EDEEEF",
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
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#111827" },
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
    borderWidth: 0,
    outlineStyle: "none",
    outlineWidth: 0,
  } as any,
  cancelSearchText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
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
  scrollContent: { padding: 20, paddingBottom: 20 },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  backText: {
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
    color: "#64748b",
  },
  alertBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffdad6",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ba1a1a30",
  },
  alertContent: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  alertText: { fontSize: 12, color: "#93000a", flex: 1 },
  alertBold: { fontWeight: "bold" },
  alertClose: { padding: 4 },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: colors.onSurfaceVariant,
    marginBottom: 4,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.onSurface,
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  addCalamityButton: {
    backgroundColor: colors.surfaceContainerLow,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.onSurface,
  },
  broadcastButton: {
    backgroundColor: colors.primary,
    borderWidth: 0,
  },
  broadcastButtonText: {
    color: colors.onPrimary,
  },

  // ============================================
  // 5. CALAMITY CARDS
  // ============================================
  floodCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.error + "30",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  floodCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  floodCardTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  floodCardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.onSurface,
  },
  floodCardActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  floodCardStatus: {
    backgroundColor: colors.errorContainer,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  floodCardStatusText: {
    fontSize: 9,
    fontWeight: "bold",
    textTransform: "uppercase",
    color: colors.onErrorContainer,
  },
  deleteCalamityBtn: {
    padding: 4,
  },
  floodCardBody: {
    marginBottom: 12,
    flexDirection: "row",
    gap: 16,
  },
  floodCardRow: {
    flexDirection: "row",
    gap: 4,
  },
  floodCardLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.onSurfaceVariant,
  },
  floodCardValue: {
    fontSize: 13,
    color: colors.onSurface,
  },
  floodStatsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  floodStatItem: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLow,
    padding: 10,
    borderRadius: 8,
  },
  floodStatLabel: {
    fontSize: 8,
    fontWeight: "600",
    textTransform: "uppercase",
    color: colors.onSurfaceVariant,
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  floodStatValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.onSurface,
  },
  floodStatHumanLoss: {
    flexDirection: "row",
    gap: 4,
    flexWrap: "wrap",
  },
  floodStatSmall: {
    fontSize: 10,
    fontWeight: "600",
  },

  // ============================================
  // 6. TABS & TABLES
  // ============================================
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
    marginBottom: 16,
    gap: 0,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.onSurfaceVariant,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: "600",
  },
  tabContent: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tableTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.onSurface,
    marginBottom: 16,
  },
  providerHeader: {
    flexDirection: "row",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
    marginBottom: 10,
  },
  inventoryHeader: {
    flexDirection: "row",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
    marginBottom: 10,
  },
  headerCell: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    color: colors.onSurfaceVariant,
  },
  providerName: { flex: 1.5 },
  providerType: { flex: 1.5 },
  providerContact: { flex: 1 },
  inventoryItem: { flex: 1.3 },
  inventoryCalamity: { flex: 1.2 },
  inventoryStock: { flex: 0.8, textAlign: "center" },
  inventoryReceived: { flex: 0.8, textAlign: "center" },
  inventoryFulfillment: { flex: 0.9, textAlign: "right" },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
    alignItems: "center",
  },
  rowCell: { fontSize: 12, color: colors.onSurface },
  providerNameCell: { flex: 1.5, fontWeight: "500" },
  providerTypeCell: { flex: 1.5 },
  providerContactCell: {
    flex: 1,
    fontSize: 10,
    color: colors.onSurfaceVariant,
  },
  inventoryItemCell: { flex: 1.3, fontWeight: "500" },
  inventoryCalamityCell: { flex: 1.2 },
  inventoryStockCell: { flex: 0.8, textAlign: "center" },
  inventoryReceivedCell: { flex: 0.8, textAlign: "center" },
  inventoryFulfillmentCell: { flex: 0.9, textAlign: "right" },
  statusOptimal: { color: colors.emerald, fontWeight: "600" },
  statusCritical: { color: colors.error, fontWeight: "600" },
  statusRestock: { color: colors.secondary, fontWeight: "600" },
  statusInProgress: { color: colors.onSurfaceVariant, fontWeight: "600" },
  emptyState: {
    paddingVertical: 24,
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 13,
    color: colors.onSurfaceVariant,
  },

  // ============================================
  // 7. LOGS
  // ============================================
  logsCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  logsTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.onSurface,
    marginBottom: 4,
  },
  logsSubtitle: {
    fontSize: 11,
    color: colors.onSurfaceVariant,
    marginBottom: 12,
  },
  logItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  logDescription: {
    fontSize: 12,
    color: colors.onSurface,
  },
  logAmount: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
  },

  // ============================================
  // 8. MODALS
  // ============================================
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: colors.onSurface },
  modalForm: { padding: 20, gap: 16 },
  formLabel: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    color: colors.onSurfaceVariant,
    marginBottom: 6,
  },
  formInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.onSurface,
    backgroundColor: "#ffffff",
  },
  formRow: {
    flexDirection: "row",
    gap: 12,
  },
  formRowItem: {
    flex: 1,
  },
  formInputSmall: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
  },
  textArea: { minHeight: 100, textAlignVertical: "top" },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    overflow: "hidden",
  },
  picker: { height: 44 },
  formButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    paddingTop: 16,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  cancelButtonText: { color: colors.onSurface },
  submitButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  submitButtonText: { color: "white", fontWeight: "600" },

  // ============================================
  // 9. FOOTER (synced with dashboard/admin)
  // ============================================
  footer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginTop: 40,
    marginBottom: 0,
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
