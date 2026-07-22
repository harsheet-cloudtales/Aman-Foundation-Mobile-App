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

const { width } = Dimensions.get("window");

// ============================================
// TYPES
// ============================================
interface Farmer {
  id: string;
  initials: string;
  bgInitials: string;
  name: string;
  location: string;
  parcel: number;
  stage: string;
  stageClass: string;
  soilType: string;
  waterSource: string;
  estYield: number;
  estIncome: number;
  phone?: string;
  enrollmentDate?: string;
}

interface SugarcaneStats {
  totalFarmers: number;
  totalLand: number;
  totalYield: number;
  avgIncome: number;
  growthRate: string;
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
  tertiary: "#565d5f",
  tertiaryContainer: "#6f7678",
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
              <Ionicons name="business-outline" size={24} color="#fff" />
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
              Mumbai{"\n"}
              Sector F-11/3, Maha{"\n"}
              India
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
// MAIN COMPONENT
// ============================================
export default function SugarcaneCultivation() {
  const { user } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showFooter, setShowFooter] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [selectedStage, setSelectedStage] = useState("All");
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);
  const [stats, setStats] = useState<SugarcaneStats>({
    totalFarmers: 0,
    totalLand: 0,
    totalYield: 0,
    avgIncome: 0,
    growthRate: "+0%",
  });

  // Dropdown states
  const [educationDropdownOpen, setEducationDropdownOpen] = useState(false);
  const [livelihoodDropdownOpen, setLivelihoodDropdownOpen] = useState(false);
  const [authDropdownOpen, setAuthDropdownOpen] = useState(false);

  // Filter picker states
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showStagePicker, setShowStagePicker] = useState(false);

  // Animated values
  const slideAnim = useRef(new Animated.Value(-width)).current;
  const educationRotateAnim = useRef(new Animated.Value(0)).current;
  const livelihoodRotateAnim = useRef(new Animated.Value(0)).current;
  const authRotateAnim = useRef(new Animated.Value(0)).current;

  // Form states
  const [newFarmerName, setNewFarmerName] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newParcel, setNewParcel] = useState("");
  const [newStage, setNewStage] = useState("Planting");
  const [newSoil, setNewSoil] = useState("Clay Loam");
  const [newWater, setNewWater] = useState("Rainfed");
  const [newPhone, setNewPhone] = useState("");

  // ============================================
  // FETCH DATA
  // ============================================
  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch farmers
      const farmersData = await api.get<Farmer[]>("/api/livelihood/farmers");
      if (farmersData && farmersData.length > 0) {
        setFarmers(farmersData);
        setSelectedFarmer(farmersData[0]);

        // Calculate stats
        const totalLand = farmersData.reduce((acc, f) => acc + f.parcel, 0);
        const totalYield = farmersData.reduce((acc, f) => acc + f.estYield, 0);
        const avgIncome =
          farmersData.length > 0
            ? farmersData.reduce((acc, f) => acc + f.estIncome, 0) /
              farmersData.length
            : 0;

        setStats({
          totalFarmers: farmersData.length,
          totalLand: totalLand,
          totalYield: totalYield,
          avgIncome: avgIncome,
          growthRate: "+18%",
        });
      }
    } catch (err) {
      if (err instanceof ApiError) {
        console.error("Sugarcane data fetch error:", err.message);
      }
      // Fallback data
      const fallbackFarmers: Farmer[] = [
        {
          id: "1",
          initials: "AB",
          bgInitials: "#d1fae5",
          name: "Amina Begum",
          location: "Bartari, Kalgachia",
          parcel: 4.5,
          stage: "Growing",
          stageClass: "bg-primary/10 text-primary",
          soilType: "Clay Loam",
          waterSource: "Drip Irrigation",
          estYield: 202.5,
          estIncome: 631800,
        },
        {
          id: "2",
          initials: "JA",
          bgInitials: "#fed7aa",
          name: "Joynal Abedin",
          location: "Digjani, Kalgachia",
          parcel: 2.1,
          stage: "Harvesting",
          stageClass: "bg-tertiary-container/20 text-tertiary",
          soilType: "Sandy Soil",
          waterSource: "Rainfed",
          estYield: 94.5,
          estIncome: 294840,
        },
        {
          id: "3",
          initials: "SD",
          bgInitials: "#e5e7eb",
          name: "Sawpan Das",
          location: "Sawpur, Kalgachia",
          parcel: 8.0,
          stage: "Planting",
          stageClass: "bg-inverse-primary/20 text-primary-container",
          soilType: "Alluvial Soil",
          waterSource: "Canal Linkage",
          estYield: 360.0,
          estIncome: 1123200,
        },
        {
          id: "4",
          initials: "RA",
          bgInitials: "#d1fae5",
          name: "Rahmat Ali",
          location: "Balikuri, Kalgachia",
          parcel: 5.2,
          stage: "Growing",
          stageClass: "bg-primary/10 text-primary",
          soilType: "Clay Loam",
          waterSource: "Drip Irrigation",
          estYield: 234.0,
          estIncome: 730080,
        },
        {
          id: "5",
          initials: "BD",
          bgInitials: "#fed7aa",
          name: "Bhanu Das",
          location: "Gunialguri, Kalgachia",
          parcel: 3.8,
          stage: "Planting",
          stageClass: "bg-inverse-primary/20 text-primary-container",
          soilType: "Alluvial Soil",
          waterSource: "Canal Linkage",
          estYield: 171.0,
          estIncome: 533520,
        },
        {
          id: "6",
          initials: "AB",
          bgInitials: "#e5e7eb",
          name: "Abdul Baten",
          location: "Moinbari, Kalgachia",
          parcel: 2.5,
          stage: "Harvesting",
          stageClass: "bg-tertiary-container/20 text-tertiary",
          soilType: "Sandy Soil",
          waterSource: "Rainfed",
          estYield: 112.5,
          estIncome: 351000,
        },
      ];
      setFarmers(fallbackFarmers);
      setSelectedFarmer(fallbackFarmers[0]);
      setStats({
        totalFarmers: fallbackFarmers.length,
        totalLand: fallbackFarmers.reduce((acc, f) => acc + f.parcel, 0),
        totalYield: fallbackFarmers.reduce((acc, f) => acc + f.estYield, 0),
        avgIncome:
          fallbackFarmers.reduce((acc, f) => acc + f.estIncome, 0) /
          fallbackFarmers.length,
        growthRate: "+18%",
      });
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

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowFooter(offsetY > 450);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
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
  // CRUD OPERATIONS
  // ============================================
  const handleEnrollFarmer = async () => {
    if (!newFarmerName || !newLocation || !newParcel) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    try {
      const hectares = parseFloat(newParcel);
      const tons = hectares * 45;
      const income = tons * 3120;

      const newFarmer = {
        name: newFarmerName,
        location: newLocation,
        parcel: hectares,
        stage: newStage,
        soilType: newSoil,
        waterSource: newWater,
        phone: newPhone,
        estYield: tons,
        estIncome: income,
      };

      const response = await api.post("/api/livelihood/farmers", newFarmer);

      if (response) {
        Alert.alert("Success", "Farmer enrolled successfully");
        setNewFarmerName("");
        setNewLocation("");
        setNewParcel("");
        setNewStage("Planting");
        setNewSoil("Clay Loam");
        setNewWater("Rainfed");
        setNewPhone("");
        setShowEnrollModal(false);
        fetchData();
      }
    } catch (err) {
      if (err instanceof ApiError) {
        Alert.alert("Error", err.message);
      }
    }
  };

  const handleDeleteFarmer = (id: string, name: string) => {
    Alert.alert("Delete Farmer", `Are you sure you want to delete ${name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.del(`/api/livelihood/farmers/${id}`);
            Alert.alert("Success", "Farmer deleted successfully");
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
  // FILTERS
  // ============================================
  const locations = [
    "All",
    ...new Set(farmers.map((f) => f.location.split(",")[0].trim())),
  ];
  const stages = ["All", "Planting", "Growing", "Harvesting"];

  const filteredFarmers = farmers.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation =
      selectedLocation === "All" || f.location.includes(selectedLocation);
    const matchesStage = selectedStage === "All" || f.stage === selectedStage;
    return matchesSearch && matchesLocation && matchesStage;
  });

  // ============================================
  // COMPONENTS
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
      transparent={true}
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
                  <MaterialIcons name="check" size={20} color="#059669" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const KpiCard = ({ title, value, unit, trend, icon }: any) => (
    <View style={styles.kpiCard}>
      <View style={styles.kpiHeader}>
        <Text style={styles.kpiTitle}>{title}</Text>
        {trend && (
          <View style={styles.trendBadge}>
            <MaterialIcons name="trending-up" size={10} color="#10b981" />
            <Text style={styles.trendText}>{stats.growthRate}</Text>
          </View>
        )}
      </View>
      <View style={styles.kpiValueRow}>
        <Text style={styles.kpiValue}>{value}</Text>
        {unit && <Text style={styles.kpiUnit}>{unit}</Text>}
      </View>
      <Text style={styles.kpiSubtitle}>{icon}</Text>
    </View>
  );

  const FarmerRow = ({ farmer, isSelected, onPress }: any) => (
    <TouchableOpacity
      style={[styles.farmerRow, isSelected && styles.farmerRowSelected]}
      onPress={onPress}
    >
      <View style={styles.farmerInfo}>
        <View
          style={[
            styles.farmerInitials,
            { backgroundColor: farmer.bgInitials },
          ]}
        >
          <Text style={styles.farmerInitialsText}>{farmer.initials}</Text>
        </View>
        <View>
          <Text style={styles.farmerName}>{farmer.name}</Text>
          <Text style={styles.farmerLocation}>{farmer.location}</Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => handleDeleteFarmer(farmer.id, farmer.name)}
      >
        <MaterialIcons name="delete-outline" size={20} color={colors.rose} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // ============================================
  // LOADING STATE
  // ============================================
  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading sugarcane data...</Text>
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
                    style={[styles.dropdownItem, styles.dropdownItemActive]}
                    onPress={() =>
                      handleNavigation("/livelihood_sugarcane_cultivation")
                    }
                  >
                    <Ionicons name="leaf-outline" size={18} color="#047857" />
                    <Text
                      style={[styles.dropdownText, styles.dropdownTextActive]}
                    >
                      Agriculture Support
                    </Text>
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
            {/* Back Link */}
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.push("/livelihood_management_hub")}
            >
              <MaterialIcons name="arrow-back" size={18} color="#6b7280" />
              <Text style={styles.backText}>Back to Livelihood Hub</Text>
            </TouchableOpacity>

            {/* Header Section */}
            <View>
              <Text style={styles.sectionLabel}>Livelihood Module</Text>
              <Text style={styles.mainTitle}>Sugarcane Cultivation</Text>
              <Text style={styles.subtitle}>
                Tracking farmer enrolment, seasonal growth cycles, and yield
                forecasts for the current harvest year.
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.exportButton}>
                <MaterialIcons
                  name="download"
                  size={16}
                  color={colors.onSurface}
                />
                <Text style={styles.exportButtonText}>Export Report</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.enrollButton}
                onPress={() => setShowEnrollModal(true)}
              >
                <MaterialIcons
                  name="person-add"
                  size={16}
                  color={colors.onPrimary}
                />
                <Text style={styles.enrollButtonText}>Enroll Farmer</Text>
              </TouchableOpacity>
            </View>

            {/* KPI Cards */}
            <View style={styles.kpiContainer}>
              <KpiCard
                title="Active Farmers"
                value={stats.totalFarmers + 1245}
                trend={stats.growthRate}
                icon="Enrolled this season"
              />
              <KpiCard
                title="Total Land Parcel"
                value={stats.totalLand.toFixed(1)}
                unit="Hectares"
                icon="Across Kalgachia circle"
              />
              <KpiCard
                title="Est. Yield Forecast"
                value={stats.totalYield.toFixed(0)}
                unit="Tons"
                icon="Expected Q4 Harvest"
              />
            </View>

            {/* Selected Farmer Details */}
            {selectedFarmer && (
              <View style={styles.farmerDetailCard}>
                <View style={styles.farmerDetailHeader}>
                  <View
                    style={[
                      styles.farmerDetailAvatar,
                      { backgroundColor: selectedFarmer.bgInitials },
                    ]}
                  >
                    <Text style={styles.farmerDetailInitials}>
                      {selectedFarmer.initials}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.farmerDetailName}>
                      {selectedFarmer.name}
                    </Text>
                    <Text style={styles.farmerDetailLocation}>
                      {selectedFarmer.location}
                    </Text>
                  </View>
                </View>

                <View style={styles.farmerDetailGrid}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Soil Profile type</Text>
                    <Text style={styles.detailValue}>
                      {selectedFarmer.soilType}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Watering Resource</Text>
                    <Text style={styles.detailValue}>
                      {selectedFarmer.waterSource}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Parcel Area Size</Text>
                    <Text style={styles.detailValue}>
                      {selectedFarmer.parcel} Hectares
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Current Growth Stage</Text>
                    <Text
                      style={[styles.detailValue, { color: colors.primary }]}
                    >
                      {selectedFarmer.stage}
                    </Text>
                  </View>
                </View>

                {/* Income Calculator */}
                <View style={styles.calculatorCard}>
                  <Text style={styles.calculatorTitle}>
                    Yield & Income Performance Calculator
                  </Text>
                  <View style={styles.calculatorRow}>
                    <Text style={styles.calculatorLabel}>
                      Hectares Cultivated
                    </Text>
                    <Text style={styles.calculatorValue}>
                      {selectedFarmer.parcel} Hectares
                    </Text>
                  </View>
                  <View style={styles.calculatorRow}>
                    <Text style={styles.calculatorLabel}>
                      Benchmark Yield Ratio
                    </Text>
                    <Text style={styles.calculatorValue}>
                      45 Tons / Hectare
                    </Text>
                  </View>
                  <View style={styles.calculatorRow}>
                    <Text style={styles.calculatorLabel}>
                      Estimated Total Yield
                    </Text>
                    <Text
                      style={[
                        styles.calculatorValue,
                        { color: colors.primary, fontWeight: "bold" },
                      ]}
                    >
                      {selectedFarmer.estYield.toFixed(1)} Tons
                    </Text>
                  </View>
                  <View style={styles.calculatorRow}>
                    <Text style={styles.calculatorLabel}>Market Rate</Text>
                    <Text style={styles.calculatorValue}>₹3,120 / Ton</Text>
                  </View>
                  <View
                    style={[styles.calculatorRow, styles.calculatorTotalRow]}
                  >
                    <Text style={styles.calculatorTotalLabel}>
                      Projected Net Income
                    </Text>
                    <Text style={styles.calculatorTotalValue}>
                      ₹{selectedFarmer.estIncome.toLocaleString("en-IN")}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Farmers Table */}
            <View style={styles.tableCard}>
              <View style={styles.tableHeader}>
                <View>
                  <Text style={styles.tableTitle}>
                    Recent Farmer Enrolments
                  </Text>
                  <Text style={styles.tableSubtitle}>
                    Latest registered beneficiaries and parcel data. Tap on any
                    row to view full file and calculator.
                  </Text>
                </View>
              </View>

              {/* Search and Filters */}
              <View style={styles.filterBar}>
                <View style={styles.searchContainer}>
                  <MaterialIcons name="search" size={18} color="#9ca3af" />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search farmers..."
                    placeholderTextColor="#9ca3af"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                </View>
                <TouchableOpacity
                  style={styles.filterChip}
                  onPress={() => setShowLocationPicker(true)}
                >
                  <Text style={styles.filterChipText}>
                    {selectedLocation === "All"
                      ? "All Villages"
                      : selectedLocation}
                  </Text>
                  <MaterialIcons name="expand-more" size={16} color="#6B7280" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.filterChip}
                  onPress={() => setShowStagePicker(true)}
                >
                  <Text style={styles.filterChipText}>
                    {selectedStage === "All" ? "All Stages" : selectedStage}
                  </Text>
                  <MaterialIcons name="expand-more" size={16} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {/* Farmers List */}
              {filteredFarmers.map((farmer) => (
                <FarmerRow
                  key={farmer.id}
                  farmer={farmer}
                  isSelected={selectedFarmer?.id === farmer.id}
                  onPress={() => setSelectedFarmer(farmer)}
                />
              ))}
              {filteredFarmers.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>
                    No registered farmers match your search query.
                  </Text>
                </View>
              )}
            </View>

            {/* Footer */}
            {showFooter && <Footer />}
          </ScrollView>
        </SafeAreaView>

        {/* Filter Modals */}
        <FilterPickerModal
          visible={showLocationPicker}
          onClose={() => setShowLocationPicker(false)}
          items={locations}
          selected={selectedLocation}
          onSelect={setSelectedLocation}
          title="Select Village"
        />
        <FilterPickerModal
          visible={showStagePicker}
          onClose={() => setShowStagePicker(false)}
          items={stages}
          selected={selectedStage}
          onSelect={setSelectedStage}
          title="Select Stage"
        />

        {/* Enrollment Modal */}
        <Modal
          visible={showEnrollModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowEnrollModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.enrollModalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  Enroll New Sugarcane Farmer
                </Text>
                <TouchableOpacity onPress={() => setShowEnrollModal(false)}>
                  <MaterialIcons name="close" size={24} color="#64748b" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalForm}>
                <View>
                  <Text style={styles.formLabel}>Farmer Full Name *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. David Mwangi"
                    placeholderTextColor="#9ca3af"
                    value={newFarmerName}
                    onChangeText={setNewFarmerName}
                  />
                </View>

                <View>
                  <Text style={styles.formLabel}>Location / Region *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. Sawpur, Kalgachia"
                    placeholderTextColor="#9ca3af"
                    value={newLocation}
                    onChangeText={setNewLocation}
                  />
                </View>

                <View>
                  <Text style={styles.formLabel}>Parcel Size (Hectares) *</Text>
                  <TextInput
                    style={styles.formInput}
                    keyboardType="numeric"
                    placeholder="e.g. 3.5"
                    placeholderTextColor="#9ca3af"
                    value={newParcel}
                    onChangeText={setNewParcel}
                  />
                </View>

                <View>
                  <Text style={styles.formLabel}>Phone Number</Text>
                  <TextInput
                    style={styles.formInput}
                    keyboardType="phone-pad"
                    placeholder="e.g. 9876543210"
                    placeholderTextColor="#9ca3af"
                    value={newPhone}
                    onChangeText={setNewPhone}
                  />
                </View>

                <View>
                  <Text style={styles.formLabel}>Soil Profile Type</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={newSoil}
                      onValueChange={(itemValue) => setNewSoil(itemValue)}
                      style={styles.picker}
                    >
                      <Picker.Item label="Clay Loam" value="Clay Loam" />
                      <Picker.Item label="Sandy Soil" value="Sandy Soil" />
                      <Picker.Item
                        label="Alluvial Soil"
                        value="Alluvial Soil"
                      />
                    </Picker>
                  </View>
                </View>

                <View>
                  <Text style={styles.formLabel}>
                    Watering Resource Linkage
                  </Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={newWater}
                      onValueChange={(itemValue) => setNewWater(itemValue)}
                      style={styles.picker}
                    >
                      <Picker.Item label="Rainfed" value="Rainfed" />
                      <Picker.Item
                        label="Drip Irrigation"
                        value="Drip Irrigation"
                      />
                      <Picker.Item
                        label="Canal Linkage"
                        value="Canal Linkage"
                      />
                    </Picker>
                  </View>
                </View>

                <View>
                  <Text style={styles.formLabel}>Crop Stage</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={newStage}
                      onValueChange={(itemValue) => setNewStage(itemValue)}
                      style={styles.picker}
                    >
                      <Picker.Item label="Planting" value="Planting" />
                      <Picker.Item label="Growing" value="Growing" />
                      <Picker.Item label="Harvesting" value="Harvesting" />
                    </Picker>
                  </View>
                </View>

                <View style={styles.formButtons}>
                  <TouchableOpacity
                    onPress={() => setShowEnrollModal(false)}
                    style={styles.cancelButton}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleEnrollFarmer}
                    style={styles.submitButton}
                  >
                    <Text style={styles.submitButtonText}>Enroll Farmer</Text>
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
  brandTitle: { fontSize: 16, fontWeight: "700", color: "#065f46" },
  brandSub: { fontSize: 12, color: "#6b7280" },
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
  menuItemLeft: { flexDirection: "row", alignItems: "center" },
  menuText: { marginLeft: 12, fontSize: 14, color: "#374151" },
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
  dropdownItemActive: { backgroundColor: "#e8f5e9", borderRadius: 8 },
  dropdownItemLogout: {
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    marginTop: 4,
    paddingTop: 12,
  },
  dropdownText: { fontSize: 13, color: "#6b7280", marginLeft: 10 },
  dropdownTextActive: { color: "#047857", fontWeight: "600" },
  dropdownTextLogout: { color: "#ef4444" },
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
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  menuButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#111827" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconButton: { padding: 8 },
  avatar: { width: 32, height: 32, borderRadius: 16 },
  scrollContent: { padding: 20, paddingBottom: 40 },
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
  sectionLabel: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: colors.onSurfaceVariant,
    marginBottom: 4,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.onSurface,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
    lineHeight: 20,
    marginBottom: 20,
  },
  actionButtons: { flexDirection: "row", gap: 12, marginBottom: 24 },
  exportButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  exportButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.onSurface,
  },
  enrollButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 999,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  enrollButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.onPrimary,
  },
  kpiContainer: { gap: 16, marginBottom: 24 },
  kpiCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  kpiHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  kpiTitle: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: colors.onSurfaceVariant,
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#d1fae5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  trendText: { fontSize: 11, fontWeight: "500", color: "#059669" },
  kpiValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    marginBottom: 8,
  },
  kpiValue: { fontSize: 32, fontWeight: "bold", color: colors.onSurface },
  kpiUnit: { fontSize: 14, color: colors.onSurfaceVariant },
  kpiSubtitle: { fontSize: 11, color: colors.onSurfaceVariant },
  farmerDetailCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  farmerDetailHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 20,
  },
  farmerDetailAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  farmerDetailInitials: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.onSurface,
  },
  farmerDetailName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.onSurface,
  },
  farmerDetailLocation: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  farmerDetailGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  detailItem: {
    flex: 1,
    minWidth: "45%",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  detailLabel: {
    fontSize: 11,
    color: colors.onSurfaceVariant,
    marginBottom: 4,
  },
  detailValue: { fontSize: 13, fontWeight: "500", color: colors.onSurface },
  calculatorCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  calculatorTitle: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: colors.onSurfaceVariant,
    marginBottom: 12,
  },
  calculatorRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  calculatorLabel: { fontSize: 12, color: colors.onSurfaceVariant },
  calculatorValue: { fontSize: 12, fontWeight: "500", color: colors.onSurface },
  calculatorTotalRow: { borderBottomWidth: 0, marginTop: 8, paddingTop: 12 },
  calculatorTotalLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.onSurface,
  },
  calculatorTotalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.primary,
  },
  tableCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  tableHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  tableTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.onSurface,
    marginBottom: 4,
  },
  tableSubtitle: { fontSize: 12, color: colors.onSurfaceVariant },
  filterBar: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: 12,
    minWidth: 150,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
    fontSize: 13,
    color: colors.onSurface,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterChipText: { fontSize: 12, color: colors.onSurfaceVariant },
  farmerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  farmerRowSelected: { backgroundColor: `${colors.primary}10` },
  farmerInfo: { flexDirection: "row", alignItems: "center", gap: 12 },
  farmerInitials: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  farmerInitialsText: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.onSurface,
  },
  farmerName: { fontSize: 14, fontWeight: "500", color: colors.onSurface },
  farmerLocation: {
    fontSize: 11,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  farmerParcel: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.onSurface,
    textAlign: "right",
  },
  stageBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  stageText: { fontSize: 9, fontWeight: "600", textTransform: "uppercase" },
  emptyState: { padding: 48, alignItems: "center" },
  emptyStateText: { color: "#9ca3af", textAlign: "center" },
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
  modalListItemText: { color: colors.onSurface },
  enrollModalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    width: "100%",
    maxWidth: 400,
    padding: 24,
    margin: 16,
    alignSelf: "center",
    maxHeight: "90%",
  },
  modalForm: { gap: 16 },
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
  // Footer
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
  footerSection: { flex: 1, minWidth: 200 },
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
  footerFoundationName: { fontSize: 18, fontWeight: "700", color: "#065f46" },
  footerTagline: { fontSize: 12, color: "#6B7280", lineHeight: 16 },
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
  footerContactText: { fontSize: 13, color: "#6B7280", flex: 1 },
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
  footerCopyright: { fontSize: 12, color: "#6B7280" },
  footerLinks: { flexDirection: "row", alignItems: "center", gap: 8 },
  footerLinkText: { fontSize: 12, color: "#006857", fontWeight: "500" },
  footerDot: { fontSize: 12, color: "#9CA3AF" },
});
