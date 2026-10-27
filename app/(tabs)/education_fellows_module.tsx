import { RouteGuard } from "@/components/RouteGuard";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Keyboard,
  Modal,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";

const { width, height } = Dimensions.get("window");

// ============================================
// TYPES
// ============================================
interface Milestone {
  done: boolean;
  text: string;
}

interface Fellow {
  id: string;
  avatar?: string;
  initials?: string;
  name: string;
  email: string;
  cohort: string;
  location: string;
  progress: number;
  milestones: Milestone[];
  lastUpdated: string;
  phone?: string;
  school?: string;
  status?: string;
}

interface FellowResponse {
  id: string;
  name: string;
  email: string;
  cohort: string;
  location: string;
  progress: number;
  phone?: string;
  school?: string;
  status?: string;
  lastUpdated?: string;
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
const FellowsModule = () => {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCohort, setSelectedCohort] = useState("All");
  const [selectedDistrict, setSelectedDistrict] = useState("All");
  const [refreshing, setRefreshing] = useState(false);
  const [showCohortPicker, setShowCohortPicker] = useState(false);
  const [showDistrictPicker, setShowDistrictPicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fellows, setFellows] = useState<Fellow[]>([]);
  const [metrics, setMetrics] = useState({
    total: 0,
    active: 0,
    avgProgress: 0,
    milestonesAchieved: 0,
  });

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

  // Form states
  const [newFellowName, setNewFellowName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newCohort, setNewCohort] = useState("Cohort '24");
  const [newLocation, setNewLocation] = useState("");
  const [newProgress, setNewProgress] = useState("50");
  const [newPhone, setNewPhone] = useState("");

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
  // FETCH FELLOWS DATA
  // ============================================
  const fetchFellows = async () => {
    try {
      setLoading(true);
      const data = await api.get<FellowResponse[]>("/api/fellows");

      if (data && data.length > 0) {
        const transformedFellows: Fellow[] = data.map((item) => ({
          id: item.id,
          name: item.name,
          email: item.email,
          cohort: item.cohort || "Cohort '24",
          location: item.location || "Not specified",
          progress: item.progress || 0,
          phone: item.phone || "",
          school: item.school || "",
          status: item.status || "Active",
          lastUpdated: item.lastUpdated || "Recently",
          initials: item.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .substring(0, 2),
          milestones: [
            { done: true, text: "Initial Assessment & Placement Completed" },
            { done: false, text: "Pending: Cohort Orientation Session" },
          ],
        }));

        setFellows(transformedFellows);

        const active = transformedFellows.filter(
          (f) => f.status === "Active",
        ).length;
        const avgProgress = Math.round(
          transformedFellows.reduce((acc, f) => acc + f.progress, 0) /
            transformedFellows.length,
        );

        setMetrics({
          total: transformedFellows.length,
          active: active,
          avgProgress: avgProgress,
          milestonesAchieved: transformedFellows.length * 2,
        });
      }
    } catch (err) {
      if (err instanceof ApiError) {
        console.error("Fellows fetch error:", err.message);
      }
      const fallbackFellows: Fellow[] = [
        {
          id: "1",
          name: "Aisha Rahman",
          email: "aisha@aman.org",
          cohort: "Cohort '23",
          location: "Bartari, Kalgachia",
          progress: 85,
          status: "Active",
          lastUpdated: "2d ago",
          initials: "AR",
          milestones: [
            { done: true, text: "Completed Advanced Phonics Module" },
            { done: false, text: "Pending: Classroom Observation #3" },
          ],
        },
        {
          id: "2",
          name: "Fatima Tariq",
          email: "fatima@aman.org",
          cohort: "Cohort '24",
          location: "Digjani, Kalgachia",
          progress: 42,
          status: "Active",
          lastUpdated: "5h ago",
          initials: "FT",
          milestones: [
            { done: true, text: "Initial Assessment Setup" },
            { done: false, text: "Action Required: Submit Lesson Plan" },
          ],
        },
        {
          id: "3",
          name: "Bilal Khan",
          email: "bilal@aman.org",
          cohort: "Cohort '23",
          location: "Sawpur, Kalgachia",
          progress: 95,
          status: "Active",
          lastUpdated: "1w ago",
          initials: "BK",
          milestones: [
            { done: true, text: "Final Impact Report Submitted" },
            { done: true, text: "Community Engagement Workshop" },
          ],
        },
        {
          id: "4",
          name: "Sneha Patel",
          email: "sneha@aman.org",
          cohort: "Cohort '24",
          location: "Balikuri, Kalgachia",
          progress: 60,
          status: "Pending",
          lastUpdated: "3d ago",
          initials: "SP",
          milestones: [
            { done: true, text: "Initial Assessment Setup" },
            { done: false, text: "Pending: Cohort Orientation" },
          ],
        },
      ];

      setFellows(fallbackFellows);
      const active = fallbackFellows.filter(
        (f) => f.status === "Active",
      ).length;
      const avgProgress = Math.round(
        fallbackFellows.reduce((acc, f) => acc + f.progress, 0) /
          fallbackFellows.length,
      );
      setMetrics({
        total: fallbackFellows.length,
        active: active,
        avgProgress: avgProgress,
        milestonesAchieved: fallbackFellows.length * 2,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFellows();
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
  const handleAddFellow = async () => {
    if (!newFellowName || !newEmail || !newLocation) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    try {
      const newFellow = {
        name: newFellowName,
        email: newEmail,
        cohort: newCohort,
        location: newLocation,
        progress: parseInt(newProgress) || 50,
        phone: newPhone,
        status: "Pending",
      };

      const response = await api.post("/api/fellows", newFellow);

      if (response) {
        Alert.alert("Success", "Fellow registered successfully");
        setNewFellowName("");
        setNewEmail("");
        setNewLocation("");
        setNewPhone("");
        setNewProgress("50");
        setShowAddModal(false);
        fetchFellows();
      }
    } catch (err) {
      if (err instanceof ApiError) {
        Alert.alert("Error", err.message);
      }
    }
  };

  const handleDeleteFellow = (id: string, name: string) => {
    Alert.alert("Delete Fellow", `Are you sure you want to delete ${name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.del(`/api/fellows/${id}`);
            Alert.alert("Success", "Fellow deleted successfully");
            fetchFellows();
          } catch (err) {
            if (err instanceof ApiError) {
              Alert.alert("Error", err.message);
            }
          }
        },
      },
    ]);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchFellows();
  };

  // ============================================
  // FILTERS
  // ============================================
  const cohorts = ["All", ...new Set(fellows.map((f) => f.cohort))];
  const districts = ["All", ...new Set(fellows.map((f) => f.location))];

  const filteredFellows = fellows.filter(
    (f) =>
      (f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.email.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (selectedCohort === "All" || f.cohort === selectedCohort) &&
      (selectedDistrict === "All" || f.location === selectedDistrict),
  );

  // ============================================
  // COMPONENTS
  // ============================================
  const MetricCard = ({ title, value, subtitle, trend }: any) => (
    <View style={styles.metricCard}>
      <Text style={styles.metricTitle}>{title}</Text>
      <View style={styles.metricValueContainer}>
        <Text style={styles.metricValue}>{value}</Text>
        {trend && (
          <View style={styles.trendBadge}>
            <Icon name="arrow-upward" size={14} color="#10b981" />
            <Text style={styles.trendText}>{trend}</Text>
          </View>
        )}
      </View>
      {subtitle && <Text style={styles.metricSubtitle}>{subtitle}</Text>}
    </View>
  );

  const ProgressBar = ({ progress }: { progress: number }) => (
    <View style={styles.progressBarContainer}>
      <View
        style={[
          styles.progressBarFill,
          {
            width: `${progress}%`,
            backgroundColor:
              progress > 70 ? "#10b981" : progress > 40 ? "#f59e0b" : "#ef4444",
          },
        ]}
      />
    </View>
  );

  const navigateToProfile = (fellow: Fellow) => {
    router.push({
      pathname: "/education_fellow_profile",
      params: { id: fellow.id },
    });
  };

  // ============================================
  // RENDER ITEMS
  // ============================================
  const renderGridView = ({ item }: { item: Fellow }) => (
    <TouchableOpacity
      style={styles.gridCard}
      activeOpacity={0.7}
      onPress={() => navigateToProfile(item)}
    >
      <View style={styles.gridHeader}>
        <View style={styles.profileSection}>
          {item.avatar ? (
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.initialsAvatar}>
              <Text style={styles.initialsText}>{item.initials || "U"}</Text>
            </View>
          )}
          <View>
            <Text style={styles.fellowName}>{item.name}</Text>
            <View style={styles.badgeContainer}>
              <View style={styles.cohortBadge}>
                <Text style={styles.cohortBadgeText}>{item.cohort}</Text>
              </View>
              <Text style={styles.locationText}>{item.location}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => handleDeleteFellow(item.id, item.name)}
        >
          <Icon name="delete-outline" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Improve Literacy Goal</Text>
          <Text
            style={[
              styles.progressPercentage,
              {
                color:
                  item.progress > 70
                    ? "#059669"
                    : item.progress > 40
                      ? "#ea580c"
                      : "#ef4444",
              },
            ]}
          >
            {item.progress}%
          </Text>
        </View>
        <ProgressBar progress={item.progress} />
      </View>

      <View style={styles.milestonesSection}>
        <Text style={styles.sectionTitle}>Recent Milestones</Text>
        {item.milestones &&
          item.milestones.slice(0, 2).map((milestone, idx) => (
            <View key={idx} style={styles.milestoneItem}>
              <View
                style={[
                  styles.milestoneIcon,
                  {
                    backgroundColor: milestone.done
                      ? "#d1fae5"
                      : milestone.text.includes("Action Required")
                        ? "#ffedd5"
                        : "#f3f4f6",
                  },
                ]}
              >
                <Icon
                  name={
                    milestone.done
                      ? "check"
                      : milestone.text.includes("Action Required")
                        ? "warning"
                        : "schedule"
                  }
                  size={12}
                  color={
                    milestone.done
                      ? "#059669"
                      : milestone.text.includes("Action Required")
                        ? "#ea580c"
                        : "#9ca3af"
                  }
                />
              </View>
              <Text
                style={[
                  styles.milestoneText,
                  milestone.done && styles.milestoneTextDone,
                ]}
              >
                {milestone.text}
              </Text>
            </View>
          ))}
      </View>

      <View style={styles.gridFooter}>
        <Text style={styles.lastUpdated}>
          Last updated: {item.lastUpdated || "Recently"}
        </Text>
        <View style={styles.viewProfileButton}>
          <Text style={styles.viewProfileText}>View Profile</Text>
          <Icon name="arrow-forward" size={16} color="#059669" />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderListView = ({ item }: { item: Fellow }) => (
    <TouchableOpacity
      style={styles.listItem}
      activeOpacity={0.7}
      onPress={() => navigateToProfile(item)}
    >
      <View style={styles.listItemContent}>
        <View style={styles.listItemInfo}>
          <Text style={styles.listItemName}>{item.name}</Text>
          <Text style={styles.listItemSubtext}>{item.cohort}</Text>
          <Text style={styles.listItemSubtext}>{item.location}</Text>
        </View>
        <View style={styles.listItemRight}>
          <View
            style={[
              styles.progressBadge,
              {
                backgroundColor:
                  item.progress > 70
                    ? "#d1fae5"
                    : item.progress > 40
                      ? "#ffedd5"
                      : "#fecaca",
              },
            ]}
          >
            <Text
              style={[
                styles.progressBadgeText,
                {
                  color:
                    item.progress > 70
                      ? "#065f46"
                      : item.progress > 40
                        ? "#9a3412"
                        : "#991b1b",
                },
              ]}
            >
              {item.progress}%
            </Text>
          </View>
          <Text style={styles.lastUpdatedSmall}>
            {item.lastUpdated || "Recently"}
          </Text>
          <Text style={styles.viewProfileLink}>View Profile →</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const FilterPickerModal = ({
    visible,
    onClose,
    items,
    selected,
    onSelect,
    title,
  }: any) => (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalList}>
            {items.map((item: string) => (
              <TouchableOpacity
                key={item}
                style={styles.modalListItem}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                <Text style={styles.modalListItemText}>
                  {item === "All"
                    ? title === "Select Cohort"
                      ? "All Cohorts"
                      : "All Districts"
                    : item}
                </Text>
                {selected === item && (
                  <Icon name="check" size={20} color="#059669" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // ============================================
  // LOADING STATE
  // ============================================
  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#059669" />
        <Text style={styles.loadingText}>Loading fellows...</Text>
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

                  {/* ACTIVE — Fellows Directory */}
                  <TouchableOpacity
                    style={[styles.dropdownItem, styles.dropdownItemActive]}
                    onPress={() => closeMenu()}
                  >
                    <Ionicons name="people-outline" size={18} color="#047857" />
                    <Text
                      style={[styles.dropdownText, styles.dropdownTextActive]}
                    >
                      Fellows Directory
                    </Text>
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

        {/* MAIN CONTENT */}
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />

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
                  <TouchableOpacity
                    style={styles.avatar}
                    onPress={() => router.push("/profile")}
                  >
                    <Image
                      source={{
                        uri:
                          user?.avatar ||
                          "https://randomuser.me/api/portraits/women/68.jpg",
                      }}
                      style={styles.avatarImage}
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
                          color="#059669"
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
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            <View style={styles.headerSection}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.push("/education_management_hub")}
              >
                <Icon name="arrow-back" size={20} color="#64748b" />
                <Text style={styles.backButtonText}>Back to Education Hub</Text>
              </TouchableOpacity>

              <Text style={styles.mainTitle}>Fellows Progress Tracking</Text>
              <Text style={styles.subtitle}>
                Monitor cohort advancement, individual literacy goals, and
                milestone achievements across all active educational districts.
              </Text>
            </View>

            {/* Search and Filters */}
            <View style={styles.searchSection}>
              <View style={styles.searchContainer}>
                <Icon name="search" size={20} color="#9ca3af" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search fellows..."
                  placeholderTextColor="#9ca3af"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filtersRow}
                contentContainerStyle={styles.filtersContent}
              >
                <TouchableOpacity
                  onPress={() => setShowCohortPicker(true)}
                  style={styles.filterButton}
                >
                  <Text style={styles.filterButtonText}>
                    {selectedCohort === "All" ? "All Cohorts" : selectedCohort}
                  </Text>
                  <Icon name="expand-more" size={20} color="#9ca3af" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setShowDistrictPicker(true)}
                  style={styles.filterButton}
                >
                  <Text style={styles.filterButtonText}>
                    {selectedDistrict === "All"
                      ? "All Districts"
                      : selectedDistrict}
                  </Text>
                  <Icon name="expand-more" size={20} color="#9ca3af" />
                </TouchableOpacity>

                <View style={styles.viewToggle}>
                  <TouchableOpacity
                    onPress={() => setViewMode("grid")}
                    style={[
                      styles.viewToggleButton,
                      viewMode === "grid" && styles.viewToggleButtonActive,
                    ]}
                  >
                    <Icon
                      name="grid-view"
                      size={18}
                      color={viewMode === "grid" ? "#0f172a" : "#64748b"}
                    />
                    <Text
                      style={[
                        styles.viewToggleText,
                        viewMode === "grid" && styles.viewToggleTextActive,
                      ]}
                    >
                      Grid
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setViewMode("list")}
                    style={[
                      styles.viewToggleButton,
                      viewMode === "list" && styles.viewToggleButtonActive,
                    ]}
                  >
                    <Icon
                      name="view-list"
                      size={18}
                      color={viewMode === "list" ? "#0f172a" : "#64748b"}
                    />
                    <Text
                      style={[
                        styles.viewToggleText,
                        viewMode === "list" && styles.viewToggleTextActive,
                      ]}
                    >
                      List
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={() => setShowAddModal(true)}
                  style={styles.addButton}
                >
                  <Icon name="add" size={18} color="white" />
                  <Text style={styles.addButtonText}>Add Fellow</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.exportButton}>
                  <Icon name="file-download" size={18} color="white" />
                  <Text style={styles.exportButtonText}>Export Report</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>

            {/* Metrics Summary Cards */}
            <View style={styles.metricsContainer}>
              <MetricCard
                title="Total Active Fellows"
                value={metrics.total}
                trend="+12%"
              />
              <MetricCard
                title="Avg. Cohort Progress"
                value={`${metrics.avgProgress}%`}
                subtitle="Overall Literacy"
              />
              <MetricCard
                title="Milestones Achieved"
                value={metrics.milestonesAchieved}
                trend="This Qtr"
              />
            </View>

            {/* Fellows List */}
            {filteredFellows.length > 0 ? (
              viewMode === "grid" ? (
                <FlatList
                  data={filteredFellows}
                  renderItem={renderGridView}
                  keyExtractor={(item) => item.id}
                  numColumns={1}
                  scrollEnabled={false}
                />
              ) : (
                <FlatList
                  data={filteredFellows}
                  renderItem={renderListView}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                />
              )
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  No fellows match your search.
                </Text>
              </View>
            )}

            {/* Footer */}
            <Footer />
          </ScrollView>

          <FilterPickerModal
            visible={showCohortPicker}
            onClose={() => setShowCohortPicker(false)}
            items={cohorts}
            selected={selectedCohort}
            onSelect={setSelectedCohort}
            title="Select Cohort"
          />

          <FilterPickerModal
            visible={showDistrictPicker}
            onClose={() => setShowDistrictPicker(false)}
            items={districts}
            selected={selectedDistrict}
            onSelect={setSelectedDistrict}
            title="Select District"
          />

          {/* Add Fellow Modal */}
          <Modal
            visible={showAddModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowAddModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.addModalContent}>
                <View style={styles.addModalHeader}>
                  <Text style={styles.addModalTitle}>
                    Register New Educational Fellow
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowAddModal(false)}
                    style={styles.closeButton}
                  >
                    <Icon name="close" size={24} color="#64748b" />
                  </TouchableOpacity>
                </View>

                <View style={styles.formContainer}>
                  <View>
                    <Text style={styles.formLabel}>Fellow Full Name *</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="e.g. Bilal Ahmed"
                      placeholderTextColor="#9ca3af"
                      value={newFellowName}
                      onChangeText={setNewFellowName}
                    />
                  </View>

                  <View>
                    <Text style={styles.formLabel}>Email *</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="e.g. bilal@aman.org"
                      placeholderTextColor="#9ca3af"
                      value={newEmail}
                      onChangeText={setNewEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  </View>

                  <View>
                    <Text style={styles.formLabel}>Cohort</Text>
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={newCohort}
                        onValueChange={(itemValue) => setNewCohort(itemValue)}
                        style={styles.picker}
                      >
                        <Picker.Item label="Cohort '23" value="Cohort '23" />
                        <Picker.Item label="Cohort '24" value="Cohort '24" />
                      </Picker>
                    </View>
                  </View>

                  <View>
                    <Text style={styles.formLabel}>District / Location *</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="e.g. Balikuri, Kalgachia"
                      placeholderTextColor="#9ca3af"
                      value={newLocation}
                      onChangeText={setNewLocation}
                    />
                  </View>

                  <View>
                    <Text style={styles.formLabel}>Phone Number</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="e.g. 9876543210"
                      placeholderTextColor="#9ca3af"
                      value={newPhone}
                      onChangeText={setNewPhone}
                      keyboardType="phone-pad"
                    />
                  </View>

                  <View>
                    <Text style={styles.formLabel}>
                      Baseline Literacy Progress (%)
                    </Text>
                    <TextInput
                      style={styles.formInput}
                      keyboardType="numeric"
                      value={newProgress}
                      onChangeText={setNewProgress}
                    />
                  </View>

                  <View style={styles.formButtons}>
                    <TouchableOpacity
                      onPress={() => setShowAddModal(false)}
                      style={styles.cancelButton}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleAddFellow}
                      style={styles.submitButton}
                    >
                      <Text style={styles.submitButtonText}>
                        Register Fellow
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </Modal>
        </SafeAreaView>
      </View>
    </RouteGuard>
  );
};

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
    backgroundColor: "#f9fafb",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748b",
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
  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.3)",
    zIndex: 5,
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
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
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
    borderRadius: 8,
  },
  dropdownItemActive: {
    backgroundColor: "#e8f5e9",
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
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
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
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#191C1D",
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
    backgroundColor: "#EDEEEF",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  headerSection: {
    marginBottom: 24,
    marginTop: 16,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#64748b",
  },
  mainTitle: {
    fontSize: 36,
    fontWeight: "900",
    color: "#0f172a",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#475569",
    lineHeight: 20,
  },

  // ============================================
  // 5. FILTERS & SEARCH BAR
  // ============================================
  searchSection: {
    marginBottom: 24,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 999,
    paddingHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 14,
    color: "#0f172a",
  },
  filtersRow: {
    marginBottom: 16,
  },
  filtersContent: {
    flexDirection: "row",
    gap: 12,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  filterButtonText: {
    fontSize: 14,
    color: "#1f2937",
    marginRight: 8,
  },
  viewToggle: {
    flexDirection: "row",
    backgroundColor: "#e5e7eb",
    borderRadius: 999,
    padding: 4,
  },
  viewToggleButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
  },
  viewToggleButtonActive: {
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  viewToggleText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748b",
  },
  viewToggleTextActive: {
    color: "#0f172a",
  },
  addButton: {
    backgroundColor: "#059669",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 999,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  exportButton: {
    backgroundColor: "#059669",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 999,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  exportButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },

  // ============================================
  // 6. METRICS & CARDS
  // ============================================
  metricsContainer: {
    marginBottom: 24,
  },
  metricCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricTitle: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: "#64748b",
    fontWeight: "600",
    marginBottom: 8,
  },
  metricValueContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 12,
  },
  metricValue: {
    fontSize: 36,
    fontWeight: "900",
    color: "#0f172a",
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#d1fae5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  trendText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#059669",
    marginLeft: 4,
  },
  metricSubtitle: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 4,
  },
  gridCard: {
    backgroundColor: "white",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
    padding: 20,
  },
  gridHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  profileSection: {
    flexDirection: "row",
    gap: 16,
    flex: 1,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  initialsAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#d1d5db",
    alignItems: "center",
    justifyContent: "center",
  },
  initialsText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4b5563",
  },
  fellowName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 4,
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cohortBadge: {
    backgroundColor: "#d1fae5",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  cohortBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: "#059669",
  },
  locationText: {
    fontSize: 12,
    color: "#64748b",
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0f172a",
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: "bold",
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 999,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 999,
  },
  milestonesSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: "#64748b",
    fontWeight: "600",
    marginBottom: 12,
  },
  milestoneItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },
  milestoneIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  milestoneText: {
    fontSize: 14,
    flex: 1,
    color: "#64748b",
  },
  milestoneTextDone: {
    color: "#0f172a",
  },
  gridFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  lastUpdated: {
    fontSize: 12,
    color: "#64748b",
  },
  viewProfileButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewProfileText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#059669",
  },

  // ============================================
  // 7. LIST VIEW
  // ============================================
  listItem: {
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  listItemContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  listItemInfo: {
    flex: 1,
  },
  listItemName: {
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 4,
  },
  listItemSubtext: {
    fontSize: 14,
    color: "#64748b",
  },
  listItemRight: {
    alignItems: "flex-end",
  },
  progressBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 8,
  },
  progressBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  lastUpdatedSmall: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 8,
  },
  viewProfileLink: {
    fontSize: 14,
    fontWeight: "600",
    color: "#059669",
  },
  emptyState: {
    paddingVertical: 48,
    alignItems: "center",
  },
  emptyStateText: {
    color: "#9ca3af",
    textAlign: "center",
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
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0f172a",
  },
  modalList: {
    maxHeight: 400,
  },
  modalListItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  modalListItemText: {
    color: "#0f172a",
  },
  addModalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    width: "100%",
    maxWidth: 400,
    padding: 24,
    margin: 16,
    alignSelf: "center",
  },
  addModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  addModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f172a",
  },
  closeButton: {
    padding: 4,
  },
  formContainer: {
    gap: 16,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    color: "#64748b",
    marginBottom: 4,
  },
  formInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    color: "#0f172a",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    overflow: "hidden",
  },
  picker: {
    height: 40,
  },
  formButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    paddingTop: 16,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  cancelButtonText: {
    color: "#0f172a",
  },
  submitButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#059669",
  },
  submitButtonText: {
    color: "white",
    fontWeight: "600",
  },

  // ============================================
  // 9. FOOTER (synced with dashboard/admin)
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

export default FellowsModule;
