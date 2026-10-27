// app/after-school-centres.tsx
import { RouteGuard } from "@/components/RouteGuard";
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
// ALL FEATURES (FOR SEARCH DROPDOWN)
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
  tertiary: "#565d5f",
  error: "#ba1a1a",
  errorContainer: "#ffdad6",
  rose: "#ef4444",
  emerald: "#10b981",
  emeraldDark: "#047857",
  tileGreen: "#d8f3e8",
  tileGreenText: "#047857",
  tileBlue: "#dbeafe",
  tileBlueText: "#2563eb",
  tileOrange: "#ffedd5",
  tileOrangeText: "#ea580c",
  tilePurple: "#ede9fe",
  tilePurpleText: "#7c3aed",
  tileYellow: "#fef3c7",
  tileYellowText: "#d97706",
  tileTeal: "#ccfbf1",
  tileTealText: "#0d9488",
  chipBg: "#f3f4f6",
  chipText: "#374151",
};

const ITEMS_PER_PAGE = 6;

interface AfterSchoolCentre {
  id: string;
  name: string;
  coordinatorName?: string;
  email?: string;
  phone?: string;
  address?: string;
  location: string;
  status: string;
  mapUrl?: string;
  goal: number;
  enrolled?: number;
  programs?: number;
  img?: string;
}

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
// INPUT FIELD
// ============================================
function InputField({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  options,
  multiline = false,
}: any) {
  return (
    <View style={styles.inputFieldContainer}>
      <Text style={styles.inputLabel}>
        {label} {required && <Text style={{ color: colors.error }}>*</Text>}
      </Text>
      {options ? (
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={value}
            onValueChange={onChange}
            style={styles.picker}
          >
            {options.map((o: string) => (
              <Picker.Item key={o} label={o} value={o} />
            ))}
          </Picker>
        </View>
      ) : (
        <TextInput
          style={[
            styles.formInput,
            multiline && { height: 70, textAlignVertical: "top" },
          ]}
          value={String(value ?? "")}
          onChangeText={onChange}
          keyboardType={
            type === "number"
              ? "numeric"
              : type === "email"
                ? "email-address"
                : type === "phone"
                  ? "phone-pad"
                  : "default"
          }
          multiline={multiline}
          placeholderTextColor="#9ca3af"
        />
      )}
    </View>
  );
}

// ============================================
// FILTER PICKER MODAL
// ============================================
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
    transparent
    animationType="slide"
    onRequestClose={onClose}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose}>
            <MaterialIcons name="close" size={24} color="#64748b" />
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
              <Text style={styles.modalListItemText}>{item}</Text>
              {selected === item && (
                <MaterialIcons name="check" size={20} color={colors.emerald} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  </Modal>
);

// ============================================
// MAIN COMPONENT
// ============================================
export default function AfterSchoolCentresModule() {
  const { user, token } = useAuth();
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [centres, setCentres] = useState<AfterSchoolCentre[]>([]);
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Form states
  const initialAddForm = {
    name: "",
    coordinatorName: "",
    email: "",
    phone: "",
    address: "",
    location: "",
    status: "Active",
    mapUrl: "",
    goal: "80",
  };
  const [addForm, setAddForm] = useState(initialAddForm);

  // ============ HEADER SEARCH STATE ============
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
  // FETCH CENTRES
  // ============================================
  const fetchCentres = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/after-school-centres", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const json = await res.json();
      if (json.success) setCentres(json.data);
      else throw new Error(json.message || "Fetch failed");
    } catch (err) {
      console.error("Failed to load after school centres:", err);
      const fallbackData: AfterSchoolCentre[] = [
        {
          id: "ASC-001",
          name: "Bartari Learning Centre",
          coordinatorName: "Amina Patel",
          email: "amina@asc.org",
          phone: "+91 9876543210",
          address: "Bartari Village, Kalgachia",
          location: "Bartari, Assam",
          status: "Active",
          goal: 80,
          enrolled: 62,
          programs: 4,
          img: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=200",
        },
        {
          id: "ASC-002",
          name: "Digjani Youth Hub",
          coordinatorName: "Rajesh Gond",
          email: "rajesh@asc.org",
          phone: "+91 9123456780",
          address: "Digjani Village, Kalgachia",
          location: "Digjani, Assam",
          status: "Active",
          goal: 60,
          enrolled: 38,
          programs: 3,
          img: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=200",
        },
        {
          id: "ASC-003",
          name: "Sawpur Community Centre",
          coordinatorName: "Savitri Bai",
          email: "savitri@asc.org",
          phone: "+91 9988776655",
          address: "Sawpur Village, Kalgachia",
          location: "Sawpur, Assam",
          status: "Under Review",
          goal: 100,
          enrolled: 92,
          programs: 5,
          img: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=200",
        },
      ];
      setCentres(fallbackData);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCentres();
  }, [token]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCentres();
  };

  // ============================================
  // CRUD
  // ============================================
  const handleAddCentre = async () => {
    if (!addForm.name || !addForm.location) {
      Alert.alert("Error", "Centre name and location are required.");
      return;
    }
    try {
      const res = await fetch("/api/after-school-centres", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          ...addForm,
          goal: parseInt(addForm.goal || "0", 10),
        }),
      });
      const json = await res.json();
      if (json.success) {
        setCentres([json.data, ...centres]);
        setAddForm(initialAddForm);
        setShowAddModal(false);
        Alert.alert("Success", "Centre added successfully.");
      } else throw new Error(json.message || "Add failed");
    } catch (err) {
      console.error("Failed to add centre:", err);
      const localNew: AfterSchoolCentre = {
        id: `ASC-${Math.floor(Math.random() * 9000 + 1000)}`,
        name: addForm.name,
        coordinatorName: addForm.coordinatorName,
        email: addForm.email,
        phone: addForm.phone,
        address: addForm.address,
        location: addForm.location,
        status: addForm.status,
        mapUrl: addForm.mapUrl,
        goal: parseInt(addForm.goal || "0", 10),
        enrolled: 0,
        programs: 0,
        img: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=200",
      };
      setCentres([localNew, ...centres]);
      setAddForm(initialAddForm);
      setShowAddModal(false);
      Alert.alert("Success", "Centre added (offline).");
    }
  };

  const handleExport = () => {
    if (centres.length === 0)
      return Alert.alert("Export", "No centre records to export.");
    Alert.alert("Export Ready", `Prepared ${centres.length} records.`);
  };

  // ============================================
  // FILTERS + PAGINATION
  // ============================================
  const filteredCentres = centres.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      c.name?.toLowerCase().includes(q) ||
      c.location?.toLowerCase().includes(q);
    const matchesLocation =
      selectedLocation === "All Locations" ||
      (c.location || "")
        .toLowerCase()
        .startsWith(selectedLocation.toLowerCase());
    return matchesSearch && matchesLocation;
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCentres.length / ITEMS_PER_PAGE),
  );
  const paginatedCentres = filteredCentres.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedLocation]);

  const locationOptions = [
    "All Locations",
    ...Array.from(
      new Set(
        centres.map((c) =>
          c.location ? c.location.split(",")[0].trim() : "Unknown Location",
        ),
      ),
    ),
  ];

  const totalCentres = centres.length;
  const activeStudents = centres.reduce((acc, c) => acc + (c.enrolled ?? 0), 0);
  const totalPrograms = centres.reduce((acc, c) => acc + (c.programs ?? 0), 0);
  const activeCentres = centres.filter((c) => c.status === "Active").length;

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading centres...</Text>
      </SafeAreaView>
    );
  }

  // ============================================
  // RENDER
  // ============================================
  return (
    <RouteGuard>
      <View style={{ flex: 1 }}>
        {menuOpen && (
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={closeMenu}
          />
        )}

        {/* ============================================
            SIDEBAR (EXACT DASHBOARD LAYOUT)
        ============================================ */}
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

                  {/* ACTIVE ITEM */}
                  <TouchableOpacity
                    style={[styles.dropdownItem, styles.menuItemActive]}
                    onPress={closeMenu}
                  >
                    <Ionicons
                      name="document-text-outline"
                      size={18}
                      color={colors.emeraldDark}
                    />
                    <Text style={[styles.dropdownText, styles.menuTextActive]}>
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
                    <Text style={styles.dropdownText}>Fellow Performance</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

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

        {/* ============================================
            MAIN CONTENT
        ============================================ */}
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

          {/* HEADER WITH ANIMATED SEARCH */}
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

          {/* SEARCH DROPDOWN */}
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

          {/* SCROLLABLE BODY */}
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
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.push("/")}
            >
              <MaterialIcons name="arrow-back" size={18} color="#6b7280" />
              <Text style={styles.backText}>Back to Education Hub</Text>
            </TouchableOpacity>

            <View>
              <Text style={styles.sectionLabel}>Education</Text>
              <Text style={styles.mainTitle}>
                After School Centres Directory
              </Text>
              <Text style={styles.subtitle}>
                Monitoring after school centre profiles, program participation,
                and geographic impact across targeted regions.
              </Text>
            </View>

            {/* STATS */}
            <View style={styles.statsGrid}>
              <View style={styles.statCardHalf}>
                <View style={styles.statHeaderRow}>
                  <MaterialIcons
                    name="school"
                    size={18}
                    color={colors.primary}
                  />
                  <Text style={styles.statTitleSmall}>Total Centres</Text>
                </View>
                <Text style={styles.statValue}>{totalCentres}</Text>
              </View>
              <View style={styles.statCardHalf}>
                <View style={styles.statHeaderRow}>
                  <MaterialIcons
                    name="groups"
                    size={18}
                    color={colors.primary}
                  />
                  <Text style={styles.statTitleSmall}>Active Students</Text>
                </View>
                <Text style={[styles.statValue, { color: colors.primary }]}>
                  {activeStudents.toLocaleString()}
                </Text>
              </View>
              <View style={styles.statCardHalf}>
                <View style={styles.statHeaderRow}>
                  <MaterialIcons
                    name="campaign"
                    size={18}
                    color={colors.primary}
                  />
                  <Text style={styles.statTitleSmall}>Total Programs</Text>
                </View>
                <Text style={styles.statValue}>{totalPrograms}</Text>
              </View>
              <View style={styles.statCardHalf}>
                <View style={styles.statHeaderRow}>
                  <MaterialIcons
                    name="check-circle"
                    size={18}
                    color={colors.primary}
                  />
                  <Text style={styles.statTitleSmall}>Active Centres</Text>
                </View>
                <Text style={styles.statValue}>{activeCentres}</Text>
              </View>
            </View>

            {/* TOOLBAR */}
            <View style={styles.toolbar}>
              <View style={styles.searchContainer}>
                <MaterialIcons name="search" size={18} color="#9ca3af" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search centres..."
                  placeholderTextColor="#9ca3af"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
              <View style={styles.toolbarActions}>
                <TouchableOpacity
                  style={styles.exportButton}
                  onPress={handleExport}
                >
                  <MaterialIcons
                    name="download"
                    size={16}
                    color={colors.onSurface}
                  />
                  <Text style={styles.exportButtonText}>Export</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => setShowAddModal(true)}
                >
                  <MaterialIcons
                    name="add"
                    size={16}
                    color={colors.onPrimary}
                  />
                  <Text style={styles.addButtonText}>Add Centre</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* SECTION HEADER */}
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.featuredTitle}>Featured Profiles</Text>
                <Text style={styles.featuredSub}>
                  Showing {filteredCentres.length} partner centres
                </Text>
              </View>
              <TouchableOpacity
                style={styles.filterChip}
                onPress={() => setShowLocationPicker(true)}
              >
                <MaterialIcons
                  name="location-on"
                  size={16}
                  color={colors.onSurfaceVariant}
                />
                <Text style={styles.filterChipText}>{selectedLocation}</Text>
                <MaterialIcons
                  name="keyboard-arrow-down"
                  size={16}
                  color={colors.onSurfaceVariant}
                />
              </TouchableOpacity>
            </View>

            {/* CARDS */}
            <View style={styles.cardsGrid}>
              {paginatedCentres.map((c, index) => {
                const enrolled = c.enrolled ?? 0;
                const goal = c.goal || 0;
                const progress =
                  goal > 0
                    ? Math.min(100, Math.round((enrolled / goal) * 100))
                    : 0;
                const barColor =
                  progress >= 80
                    ? colors.primary
                    : progress >= 40
                      ? colors.secondary
                      : colors.error;

                return (
                  <TouchableOpacity
                    key={c.id || index}
                    style={styles.centreCard}
                    onPress={() =>
                      router.push(`/education/after-school-centres/${c.id}`)
                    }
                    activeOpacity={0.85}
                  >
                    <View style={styles.cardHeaderRow}>
                      <View style={styles.cardHeaderLeft}>
                        <View style={styles.centreAvatar}>
                          <Image
                            source={{
                              uri:
                                c.img ||
                                "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=200",
                            }}
                            style={styles.centreAvatarImg}
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.centreName} numberOfLines={2}>
                            {c.name}
                          </Text>
                          <View style={styles.centreLocationRow}>
                            <MaterialIcons
                              name="location-on"
                              size={12}
                              color={colors.onSurfaceVariant}
                            />
                            <Text
                              style={styles.centreLocation}
                              numberOfLines={1}
                            >
                              {c.location}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <View
                        style={[
                          styles.statusBadge,
                          c.status === "Active"
                            ? styles.statusBadgeActive
                            : styles.statusBadgeInactive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusBadgeText,
                            c.status === "Active"
                              ? styles.statusBadgeTextActive
                              : styles.statusBadgeTextInactive,
                          ]}
                        >
                          {c.status}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.cardStatsRow}>
                      <View style={styles.cardStatItem}>
                        <Text style={styles.cardStatLabel}>Enrolled</Text>
                        <Text style={styles.cardStatValue}>{enrolled}</Text>
                      </View>
                      <View style={styles.cardStatItem}>
                        <Text style={styles.cardStatLabel}>Programs</Text>
                        <Text style={styles.cardStatValue}>
                          {c.programs ?? 0}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.progressSection}>
                      <View style={styles.progressLabelsRow}>
                        <Text style={styles.progressLabel}>
                          Enrollment Goal
                        </Text>
                        <Text
                          style={[styles.progressValue, { color: barColor }]}
                        >
                          {enrolled} / {goal}
                        </Text>
                      </View>
                      <View style={styles.progressBarBg}>
                        <View
                          style={[
                            styles.progressBarFill,
                            {
                              width: `${progress}%`,
                              backgroundColor: barColor,
                            },
                          ]}
                        />
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}

              {filteredCentres.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>
                    No partner centres match your search query.
                  </Text>
                </View>
              )}
            </View>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <View style={styles.paginationRow}>
                <TouchableOpacity
                  onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={[
                    styles.pageButton,
                    currentPage === 1 && styles.pageButtonDisabled,
                  ]}
                >
                  <Text style={styles.pageButtonText}>Prev</Text>
                </TouchableOpacity>
                <View style={styles.pageNumbersRow}>
                  {(() => {
                    const pages: (number | string)[] = [];
                    if (totalPages <= 5)
                      for (let i = 1; i <= totalPages; i++) pages.push(i);
                    else if (currentPage <= 3)
                      pages.push(1, 2, 3, "...", totalPages);
                    else if (currentPage >= totalPages - 2)
                      pages.push(
                        1,
                        "...",
                        totalPages - 2,
                        totalPages - 1,
                        totalPages,
                      );
                    else pages.push(1, "...", currentPage, "...", totalPages);
                    return pages.map((page, idx) => (
                      <TouchableOpacity
                        key={idx}
                        onPress={() =>
                          typeof page === "number" && setCurrentPage(page)
                        }
                        disabled={page === "..."}
                        style={[
                          styles.pageNumber,
                          page === currentPage && styles.pageNumberActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.pageNumberText,
                            page === currentPage && styles.pageNumberTextActive,
                          ]}
                        >
                          {page}
                        </Text>
                      </TouchableOpacity>
                    ));
                  })()}
                </View>
                <TouchableOpacity
                  onPress={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  style={[
                    styles.pageButton,
                    currentPage === totalPages && styles.pageButtonDisabled,
                  ]}
                >
                  <Text style={styles.pageButtonText}>Next</Text>
                </TouchableOpacity>
              </View>
            )}

            <Footer />
          </ScrollView>
        </SafeAreaView>

        {/* LOCATION FILTER PICKER */}
        <FilterPickerModal
          visible={showLocationPicker}
          onClose={() => setShowLocationPicker(false)}
          items={locationOptions}
          selected={selectedLocation}
          onSelect={setSelectedLocation}
          title="Select Location"
        />

        {/* ADD CENTRE MODAL */}
        <Modal
          visible={showAddModal}
          animationType="slide"
          transparent
          onRequestClose={() => setShowAddModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.addModalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add New Partner Centre</Text>
                <TouchableOpacity onPress={() => setShowAddModal(false)}>
                  <MaterialIcons name="close" size={24} color="#64748b" />
                </TouchableOpacity>
              </View>
              <ScrollView
                style={styles.modalForm}
                showsVerticalScrollIndicator={false}
              >
                <InputField
                  label="Centre Name"
                  value={addForm.name}
                  onChange={(v: string) =>
                    setAddForm((f) => ({ ...f, name: v }))
                  }
                  required
                />
                <InputField
                  label="Coordinator Name"
                  value={addForm.coordinatorName}
                  onChange={(v: string) =>
                    setAddForm((f) => ({ ...f, coordinatorName: v }))
                  }
                />
                <InputField
                  label="Email"
                  type="email"
                  value={addForm.email}
                  onChange={(v: string) =>
                    setAddForm((f) => ({ ...f, email: v }))
                  }
                />
                <InputField
                  label="Phone"
                  type="phone"
                  value={addForm.phone}
                  onChange={(v: string) =>
                    setAddForm((f) => ({ ...f, phone: v }))
                  }
                />
                <InputField
                  label="Location / City"
                  value={addForm.location}
                  onChange={(v: string) =>
                    setAddForm((f) => ({ ...f, location: v }))
                  }
                  required
                />
                <InputField
                  label="Status"
                  value={addForm.status}
                  onChange={(v: string) =>
                    setAddForm((f) => ({ ...f, status: v }))
                  }
                  options={["Active", "Inactive", "Under Review"]}
                />
                <InputField
                  label="Enrolment Goal"
                  type="number"
                  value={addForm.goal}
                  onChange={(v: string) =>
                    setAddForm((f) => ({ ...f, goal: v }))
                  }
                />
                <InputField
                  label="Address"
                  value={addForm.address}
                  onChange={(v: string) =>
                    setAddForm((f) => ({ ...f, address: v }))
                  }
                  multiline
                />
                <InputField
                  label="Google Maps Embed URL"
                  value={addForm.mapUrl}
                  onChange={(v: string) =>
                    setAddForm((f) => ({ ...f, mapUrl: v }))
                  }
                />

                <View style={styles.formButtons}>
                  <TouchableOpacity
                    onPress={() => setShowAddModal(false)}
                    style={styles.cancelButton}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleAddCentre}
                    style={styles.submitButton}
                  >
                    <Text style={styles.submitButtonText}>Add Centre</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.surface,
  },
  loadingText: { marginTop: 12, fontSize: 14, color: colors.onSurfaceVariant },

  // SIDEBAR
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
  brandLogo: { width: 200, height: 90 },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 10,
  },
  menuItemActive: { backgroundColor: "#e8f5e9" },
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
  menuTextActive: { color: colors.emeraldDark, fontWeight: "600" },
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

  // HEADER & SEARCH
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
  } as any,
  cancelSearchText: { fontSize: 14, fontWeight: "600", color: colors.primary },
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
  searchResultTitle: { fontSize: 15, fontWeight: "600", color: "#1F2937" },
  searchResultCategory: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  emptySearchContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60,
    gap: 12,
  },
  emptySearchText: { fontSize: 14, color: "#9CA3AF" },

  // MAIN CONTENT
  scrollContent: { padding: 20, paddingBottom: 30 },
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
    letterSpacing: 0.5,
  },
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
    marginBottom: 8,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 13,
    color: colors.onSurfaceVariant,
    lineHeight: 20,
    marginBottom: 20,
  },

  // STATS
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statCardHalf: {
    width: "48%",
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(188,202,196,0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  statHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  statTitleSmall: {
    fontSize: 9,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: colors.onSurfaceVariant,
    flex: 1,
  },
  statValue: { fontSize: 26, fontWeight: "bold", color: colors.onSurface },

  // TOOLBAR
  toolbar: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(188,202,196,0.3)",
    marginBottom: 24,
    gap: 12,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceContainer,
    borderRadius: 999,
    paddingHorizontal: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(188,202,196,0.4)",
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 13,
    color: colors.onSurface,
  },
  toolbarActions: { flexDirection: "row", gap: 10 },
  exportButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: "rgba(188,202,196,0.3)",
  },
  exportButtonText: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: colors.onSurface,
  },
  addButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  addButtonText: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: colors.onPrimary,
  },

  // SECTION HEADER
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(225,227,228,0.6)",
    paddingBottom: 12,
    marginBottom: 20,
    gap: 10,
  },
  featuredTitle: { fontSize: 20, fontWeight: "bold", color: colors.onSurface },
  featuredSub: { fontSize: 11, color: colors.onSurfaceVariant, marginTop: 2 },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: "rgba(188,202,196,0.3)",
    maxWidth: 180,
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    color: colors.onSurface,
    flexShrink: 1,
  },

  // CARDS
  cardsGrid: { gap: 14 },
  centreCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(188,202,196,0.25)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
    gap: 10,
  },
  cardHeaderLeft: { flexDirection: "row", gap: 10, flex: 1 },
  centreAvatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: colors.surfaceContainer,
  },
  centreAvatarImg: { width: "100%", height: "100%" },
  centreName: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.onSurface,
    lineHeight: 18,
  },
  centreLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 3,
  },
  centreLocation: {
    fontSize: 11,
    color: colors.onSurfaceVariant,
    flexShrink: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  statusBadgeActive: { backgroundColor: "#d1fae5" },
  statusBadgeInactive: { backgroundColor: colors.surfaceContainerHighest },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statusBadgeTextActive: { color: "#047857" },
  statusBadgeTextInactive: { color: colors.onSurfaceVariant },

  cardStatsRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "rgba(225,227,228,0.7)",
    paddingTop: 12,
    marginBottom: 14,
    gap: 20,
  },
  cardStatItem: { flex: 1 },
  cardStatLabel: {
    fontSize: 9,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: colors.onSurfaceVariant,
    marginBottom: 3,
  },
  cardStatValue: { fontSize: 20, fontWeight: "bold", color: colors.onSurface },

  progressSection: { marginTop: 2 },
  progressLabelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    color: colors.onSurfaceVariant,
  },
  progressValue: { fontSize: 11, fontWeight: "700" },
  progressBarBg: {
    height: 6,
    width: "100%",
    backgroundColor: colors.surfaceContainerHighest,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: { height: "100%", borderRadius: 3 },
  emptyState: { padding: 40, alignItems: "center", justifyContent: "center" },
  emptyStateText: {
    textAlign: "center",
    color: colors.onSurfaceVariant,
    fontSize: 13,
  },

  // PAGINATION
  paginationRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 8,
    gap: 6,
  },
  pageButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
  },
  pageButtonDisabled: { opacity: 0.5 },
  pageButtonText: { fontSize: 12, fontWeight: "600", color: colors.onSurface },
  pageNumbersRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginHorizontal: 6,
  },
  pageNumber: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  pageNumberActive: { backgroundColor: colors.primary },
  pageNumberText: { fontSize: 12, fontWeight: "600", color: colors.onSurface },
  pageNumberTextActive: { color: "#fff" },

  // MODALS
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: colors.onSurface },
  modalList: { maxHeight: 400 },
  modalListItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  modalListItemText: { color: colors.onSurface, fontSize: 14 },
  addModalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "92%",
  },
  modalForm: { gap: 4 },
  inputFieldContainer: { marginBottom: 12 },
  inputLabel: {
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
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
    fontSize: 14,
    color: colors.onSurface,
    backgroundColor: "#ffffff",
  },
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
    paddingBottom: 8,
  },
  cancelButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  cancelButtonText: { color: colors.onSurface, fontSize: 13 },
  submitButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  submitButtonText: { color: "white", fontWeight: "600", fontSize: 13 },

  // ============================================
  // FOOTER (synced with dashboard/admin)
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
