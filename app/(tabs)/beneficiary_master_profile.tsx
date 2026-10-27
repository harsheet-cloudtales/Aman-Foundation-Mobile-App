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
interface Beneficiary {
  id: string;
  name: string;
  location: string;
  householdSize: number;
  income: string;
  tier: string;
  tierPercent: number;
  programs: string[];
  resilienceScore: number;
  phone?: string;
  enrollmentDate?: string;
}

interface BeneficiaryStats {
  total: number;
  tier1: number;
  tier2: number;
  tier3: number;
  avgResilience: number;
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
  error: "#ba1a1a",
  errorContainer: "#ffdad6",
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
// LOCATIONS, TIERS, PROGRAMS
// ============================================
const locations = [
  "All Locations",
  "Bartari",
  "Digjani",
  "Sawpur",
  "Balikuri",
  "Moinbari",
  "Gunialguri",
];
const tiers = ["All Tiers", "Tier 1", "Tier 2", "Tier 3"];
const programsList = ["All Programs", "Goat Rearing", "Sugarcane"];

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

// ============================================
// MAIN COMPONENT
// ============================================
export default function BeneficiaryMasterDirectory() {
  const { user } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showFooter, setShowFooter] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importStepText, setImportStepText] = useState("");

  // Header Search Bar State
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [headerSearchQuery, setHeaderSearchQuery] = useState("");
  const expandAnim = useRef(new Animated.Value(0)).current;
  const dropdownAnim = useRef(new Animated.Value(0)).current;

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState("All Tiers");
  const [programFilter, setProgramFilter] = useState("All Programs");
  const [locationFilter, setLocationFilter] = useState("All Locations");

  // Filter picker states
  const [showTierPicker, setShowTierPicker] = useState(false);
  const [showProgramPicker, setShowProgramPicker] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  // Beneficiaries state
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [stats, setStats] = useState<BeneficiaryStats>({
    total: 0,
    tier1: 0,
    tier2: 0,
    tier3: 0,
    avgResilience: 0,
  });

  // Form states
  const [newName, setNewName] = useState("");
  const [newLocation, setNewLocation] = useState("Bartari");
  const [newHouseholdSize, setNewHouseholdSize] = useState("4");
  const [newIncome, setNewIncome] = useState("Agriculture");
  const [newTier, setNewTier] = useState("Tier 2");
  const [newResilienceScore, setNewResilienceScore] = useState("50");
  const [newPhone, setNewPhone] = useState("");
  const [newProgramGoat, setNewProgramGoat] = useState(false);
  const [newProgramSugarcane, setNewProgramSugarcane] = useState(false);

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
  // FETCH BENEFICIARIES
  // ============================================
  const fetchBeneficiaries = async () => {
    try {
      setLoading(true);

      const data = await api.get<Beneficiary[]>("/api/beneficiaries");

      if (data && data.length > 0) {
        setBeneficiaries(data);
        calculateStats(data);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        console.error("Beneficiaries fetch error:", err.message);
      }
      // Fallback data
      const fallbackData: Beneficiary[] = [
        {
          id: "BEN-482-A",
          name: "Amina Patel",
          location: "Bartari, Kalgachia, Assam",
          householdSize: 5,
          income: "Agriculture",
          tier: "Tier 2",
          tierPercent: 65,
          programs: ["Goat Rearing", "Sugarcane"],
          resilienceScore: 82,
        },
        {
          id: "BEN-104-B",
          name: "Rajesh Gond",
          location: "Digjani, Kalgachia, Assam",
          householdSize: 4,
          income: "Livestock",
          tier: "Tier 1",
          tierPercent: 40,
          programs: ["Goat Rearing"],
          resilienceScore: 58,
        },
        {
          id: "BEN-902-C",
          name: "Savitri Bai",
          location: "Sawpur, Kalgachia, Assam",
          householdSize: 6,
          income: "Agriculture",
          tier: "Tier 3",
          tierPercent: 90,
          programs: ["Sugarcane"],
          resilienceScore: 92,
        },
        {
          id: "BEN-304-D",
          name: "Rahim Ali",
          location: "Balikuri, Kalgachia, Assam",
          householdSize: 5,
          income: "Agriculture",
          tier: "Tier 2",
          tierPercent: 70,
          programs: ["Sugarcane", "Goat Rearing"],
          resilienceScore: 78,
        },
        {
          id: "BEN-705-E",
          name: "Jahanara Begum",
          location: "Moinbari, Kalgachia, Assam",
          householdSize: 7,
          income: "Livestock",
          tier: "Tier 1",
          tierPercent: 35,
          programs: ["Goat Rearing"],
          resilienceScore: 52,
        },
      ];
      setBeneficiaries(fallbackData);
      calculateStats(fallbackData);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateStats = (data: Beneficiary[]) => {
    const tier1 = data.filter((b) => b.tier === "Tier 1").length;
    const tier2 = data.filter((b) => b.tier === "Tier 2").length;
    const tier3 = data.filter((b) => b.tier === "Tier 3").length;
    const avgResilience =
      data.length > 0
        ? Math.round(
            data.reduce((acc, b) => acc + b.resilienceScore, 0) / data.length,
          )
        : 0;

    setStats({
      total: data.length,
      tier1,
      tier2,
      tier3,
      avgResilience,
    });
  };

  useEffect(() => {
    fetchBeneficiaries();
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

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowFooter(offsetY > 300);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchBeneficiaries();
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
  const clearFilters = () => {
    setSearchQuery("");
    setTierFilter("All Tiers");
    setProgramFilter("All Programs");
    setLocationFilter("All Locations");
  };

  const handleAddBeneficiary = async () => {
    if (!newName) {
      Alert.alert("Error", "Please enter beneficiary name");
      return;
    }

    try {
      const programsSelected: string[] = [];
      if (newProgramGoat) programsSelected.push("Goat Rearing");
      if (newProgramSugarcane) programsSelected.push("Sugarcane");
      if (programsSelected.length === 0) programsSelected.push("Goat Rearing");

      let tierPercent = 50;
      if (newTier === "Tier 1") tierPercent = 40;
      else if (newTier === "Tier 2") tierPercent = 65;
      else if (newTier === "Tier 3") tierPercent = 90;

      const newBeneficiary = {
        name: newName,
        location: `${newLocation}, Kalgachia, Assam`,
        householdSize: parseInt(newHouseholdSize),
        income: newIncome,
        tier: newTier,
        tierPercent,
        programs: programsSelected,
        resilienceScore: parseInt(newResilienceScore),
        phone: newPhone,
      };

      const response = await api.post("/api/beneficiaries", newBeneficiary);

      if (response) {
        Alert.alert("Success", "Beneficiary registered successfully");
        setNewName("");
        setNewLocation("Bartari");
        setNewHouseholdSize("4");
        setNewIncome("Agriculture");
        setNewTier("Tier 2");
        setNewResilienceScore("50");
        setNewPhone("");
        setNewProgramGoat(false);
        setNewProgramSugarcane(false);
        setShowAddModal(false);
        fetchBeneficiaries();
      }
    } catch (err) {
      if (err instanceof ApiError) {
        Alert.alert("Error", err.message);
      }
    }
  };

  const handleDeleteBeneficiary = (id: string, name: string) => {
    Alert.alert(
      "Delete Beneficiary",
      `Are you sure you want to delete ${name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.del(`/api/beneficiaries/${id}`);
              Alert.alert("Success", "Beneficiary deleted successfully");
              fetchBeneficiaries();
            } catch (err) {
              if (err instanceof ApiError) {
                Alert.alert("Error", err.message);
              }
            }
          },
        },
      ],
    );
  };

  const simulateBulkImport = () => {
    setImporting(true);
    setImportProgress(0);
    setImportStepText("Reading uploaded CSV file...");

    setTimeout(() => {
      setImportProgress(35);
      setImportStepText("Parsing row data (15 records found)...");

      setTimeout(() => {
        setImportProgress(70);
        setImportStepText("Validating unique IDs and locations...");

        setTimeout(() => {
          setImportProgress(100);
          setImportStepText("Writing records to master directory...");

          setTimeout(() => {
            const imported: Beneficiary[] = [
              {
                id: "BEN-511-N",
                name: "Rupjan Nessa",
                location: "Gunialguri, Kalgachia, Assam",
                householdSize: 5,
                income: "Livestock",
                tier: "Tier 2",
                tierPercent: 65,
                programs: ["Goat Rearing"],
                resilienceScore: 74,
              },
              {
                id: "BEN-839-K",
                name: "Abul Kalam",
                location: "Bartari, Kalgachia, Assam",
                householdSize: 6,
                income: "Agriculture",
                tier: "Tier 3",
                tierPercent: 90,
                programs: ["Sugarcane"],
                resilienceScore: 88,
              },
              {
                id: "BEN-293-X",
                name: "Khadija Khatun",
                location: "Moinbari, Kalgachia, Assam",
                householdSize: 7,
                income: "Livestock",
                tier: "Tier 1",
                tierPercent: 40,
                programs: ["Goat Rearing"],
                resilienceScore: 48,
              },
            ];

            setBeneficiaries([...imported, ...beneficiaries]);
            calculateStats([...imported, ...beneficiaries]);
            Alert.alert(
              "Success",
              "Bulk import complete: 3 new beneficiaries registered successfully!",
            );
            setImporting(false);
            setShowImportModal(false);
          }, 600);
        }, 800);
      }, 800);
    }, 800);
  };

  // ============================================
  // FILTERS
  // ============================================
  const filteredBeneficiaries = beneficiaries.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTier = tierFilter === "All Tiers" || b.tier === tierFilter;
    const matchesProgram =
      programFilter === "All Programs" || b.programs.includes(programFilter);
    const matchesLocation =
      locationFilter === "All Locations" ||
      b.location.toLowerCase().includes(locationFilter.toLowerCase());

    return matchesSearch && matchesTier && matchesProgram && matchesLocation;
  });

  // ============================================
  // COMPONENTS
  // ============================================
  const StatCard = ({ title, value, subtitle }: any) => (
    <View style={styles.statCard}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statSubtitle}>{subtitle}</Text>
    </View>
  );

  const BeneficiaryRow = ({ beneficiary }: { beneficiary: Beneficiary }) => (
    <View style={styles.beneficiaryRow}>
      <View style={[styles.beneficiaryCell, styles.cellName]}>
        <View style={styles.beneficiaryInfo}>
          <View style={styles.beneficiaryAvatar}>
            <Text style={styles.beneficiaryInitials}>
              {beneficiary.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </Text>
          </View>
          <View>
            <Text style={styles.beneficiaryName}>{beneficiary.name}</Text>
            <Text style={styles.beneficiaryId}>ID: {beneficiary.id}</Text>
          </View>
        </View>
      </View>

      <View style={[styles.beneficiaryCell, styles.cellLocation]}>
        <Text style={styles.locationText} numberOfLines={2}>
          {beneficiary.location}
        </Text>
        <Text style={styles.incomeText}>{beneficiary.income}</Text>
      </View>

      <View style={[styles.beneficiaryCell, styles.cellProgress]}>
        <View style={styles.progressWrapper}>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressFill,
                { width: `${beneficiary.tierPercent}%` },
              ]}
            />
          </View>
          <Text style={styles.tierText}>{beneficiary.tier}</Text>
        </View>
      </View>

      <View style={[styles.beneficiaryCell, styles.cellPrograms]}>
        <View style={styles.programsContainer}>
          {beneficiary.programs.map((p, idx) => (
            <View key={idx} style={styles.programBadge}>
              <Text style={styles.programBadgeText}>{p}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.beneficiaryCell, styles.cellScore]}>
        <View style={styles.scoreContainer}>
          <MaterialIcons name="trending-up" size={14} color={colors.primary} />
          <Text style={styles.scoreText}>
            {beneficiary.resilienceScore} / 100
          </Text>
        </View>
      </View>

      <View style={[styles.beneficiaryCell, styles.cellAction]}>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() =>
            handleDeleteBeneficiary(beneficiary.id, beneficiary.name)
          }
        >
          <MaterialIcons name="delete-outline" size={18} color={colors.rose} />
        </TouchableOpacity>
      </View>
    </View>
  );

  // ============================================
  // LOADING STATE
  // ============================================
  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading beneficiaries...</Text>
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

                  {/* ACTIVE — Beneficiaries */}
                  <TouchableOpacity
                    style={[styles.dropdownItem, styles.dropdownItemActive]}
                    onPress={() => closeMenu()}
                  >
                    <Ionicons
                      name="people-circle-outline"
                      size={18}
                      color="#047857"
                    />
                    <Text
                      style={[styles.dropdownText, styles.dropdownTextActive]}
                    >
                      Beneficiaries
                    </Text>
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
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.push("/livelihood_management_hub")}
            >
              <MaterialIcons name="arrow-back" size={18} color="#6b7280" />
              <Text style={styles.backText}>Back to Livelihood Hub</Text>
            </TouchableOpacity>

            <View>
              <Text style={styles.sectionLabel}>Livelihood Database</Text>
              <Text style={styles.mainTitle}>
                Beneficiaries Master Registry
              </Text>
              <Text style={styles.subtitle}>
                Central master registry connecting all livelihood programs in
                Kalgachia, Assam. Monitor socio-economic growth, documents, and
                resilience indexes.
              </Text>
            </View>

            <View style={styles.actionButtons}>
              <View style={styles.searchContainer}>
                <MaterialIcons name="search" size={18} color="#9ca3af" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search master database..."
                  placeholderTextColor="#9ca3af"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowAddModal(true)}
              >
                <MaterialIcons
                  name="person-add"
                  size={16}
                  color={colors.onPrimary}
                />
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.importButton}
                onPress={() => setShowImportModal(true)}
              >
                <MaterialIcons
                  name="upload-file"
                  size={16}
                  color={colors.onSurface}
                />
                <Text style={styles.importButtonText}>Import</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.exportButton}>
                <MaterialIcons
                  name="download"
                  size={16}
                  color={colors.onPrimary}
                />
                <Text style={styles.exportButtonText}>Export</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.statsContainer}>
              <StatCard
                title="Total Beneficiaries"
                value={stats.total}
                subtitle="Unified profiles logged"
              />
              <StatCard
                title="Avg Resilience"
                value={`${stats.avgResilience}%`}
                subtitle="Overall score"
              />
              <StatCard
                title="Tier Distribution"
                value={`${stats.tier1}/${stats.tier2}/${stats.tier3}`}
                subtitle="Tier 1 / Tier 2 / Tier 3"
              />

              <View style={styles.filtersContainer}>
                <Text style={styles.filtersLabel}>Filter Registry</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.filterScroll}
                >
                  <TouchableOpacity
                    style={styles.filterChip}
                    onPress={() => setShowLocationPicker(true)}
                  >
                    <Text style={styles.filterChipText}>
                      {locationFilter === "All Locations"
                        ? "All Locations"
                        : locationFilter}
                    </Text>
                    <MaterialIcons
                      name="expand-more"
                      size={16}
                      color="#6B7280"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.filterChip}
                    onPress={() => setShowTierPicker(true)}
                  >
                    <Text style={styles.filterChipText}>
                      {tierFilter === "All Tiers" ? "All Tiers" : tierFilter}
                    </Text>
                    <MaterialIcons
                      name="expand-more"
                      size={16}
                      color="#6B7280"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.filterChip}
                    onPress={() => setShowProgramPicker(true)}
                  >
                    <Text style={styles.filterChipText}>
                      {programFilter === "All Programs"
                        ? "All Programs"
                        : programFilter}
                    </Text>
                    <MaterialIcons
                      name="expand-more"
                      size={16}
                      color="#6B7280"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={clearFilters}>
                    <Text style={styles.clearFiltersText}>Clear Filters</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </View>

            {/* Table Header */}
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.headerCell, styles.headerName]}>
                Beneficiary Name
              </Text>
              <Text style={[styles.headerCell, styles.headerLocation]}>
                Location
              </Text>
              <Text style={[styles.headerCell, styles.headerProgress]}>
                Progress
              </Text>
              <Text style={[styles.headerCell, styles.headerPrograms]}>
                Programs
              </Text>
              <Text style={[styles.headerCell, styles.headerScore]}>
                Resilience
              </Text>
              <Text style={[styles.headerCell, styles.headerAction]}>
                Action
              </Text>
            </View>

            {/* Table Rows */}
            {filteredBeneficiaries.map((beneficiary) => (
              <BeneficiaryRow key={beneficiary.id} beneficiary={beneficiary} />
            ))}
            {filteredBeneficiaries.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  No beneficiary records match the selected filters.
                </Text>
              </View>
            )}

            {/* Footer */}
            <Footer />
          </ScrollView>
        </SafeAreaView>

        {/* Filter Pickers */}
        <FilterPickerModal
          visible={showLocationPicker}
          onClose={() => setShowLocationPicker(false)}
          items={locations}
          selected={locationFilter}
          onSelect={setLocationFilter}
          title="Select Location"
        />
        <FilterPickerModal
          visible={showTierPicker}
          onClose={() => setShowTierPicker(false)}
          items={tiers}
          selected={tierFilter}
          onSelect={setTierFilter}
          title="Select Tier"
        />
        <FilterPickerModal
          visible={showProgramPicker}
          onClose={() => setShowProgramPicker(false)}
          items={programsList}
          selected={programFilter}
          onSelect={setProgramFilter}
          title="Select Program"
        />

        {/* Add Beneficiary Modal */}
        <Modal
          visible={showAddModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowAddModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.addModalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add New Beneficiary</Text>
                <TouchableOpacity onPress={() => setShowAddModal(false)}>
                  <MaterialIcons name="close" size={24} color="#64748b" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalForm}>
                <View>
                  <Text style={styles.formLabel}>Full Name *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. Joynal Abedin"
                    placeholderTextColor="#9ca3af"
                    value={newName}
                    onChangeText={setNewName}
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
                  <Text style={styles.formLabel}>Village / Location</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={newLocation}
                      onValueChange={(itemValue) => setNewLocation(itemValue)}
                      style={styles.picker}
                    >
                      <Picker.Item label="Bartari" value="Bartari" />
                      <Picker.Item label="Digjani" value="Digjani" />
                      <Picker.Item label="Sawpur" value="Sawpur" />
                      <Picker.Item label="Balikuri" value="Balikuri" />
                      <Picker.Item label="Gunialguri" value="Gunialguri" />
                      <Picker.Item label="Moinbari" value="Moinbari" />
                    </Picker>
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={styles.halfField}>
                    <Text style={styles.formLabel}>Household Size</Text>
                    <TextInput
                      style={styles.formInput}
                      keyboardType="numeric"
                      placeholder="4"
                      placeholderTextColor="#9ca3af"
                      value={newHouseholdSize}
                      onChangeText={setNewHouseholdSize}
                    />
                  </View>
                  <View style={styles.halfField}>
                    <Text style={styles.formLabel}>Primary Income Source</Text>
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={newIncome}
                        onValueChange={(itemValue) => setNewIncome(itemValue)}
                        style={styles.picker}
                      >
                        <Picker.Item label="Agriculture" value="Agriculture" />
                        <Picker.Item label="Livestock" value="Livestock" />
                        <Picker.Item label="Daily Wage" value="Daily Wage" />
                        <Picker.Item
                          label="Small Business"
                          value="Small Business"
                        />
                      </Picker>
                    </View>
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={styles.halfField}>
                    <Text style={styles.formLabel}>Socio-Economic Tier</Text>
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={newTier}
                        onValueChange={(itemValue) => setNewTier(itemValue)}
                        style={styles.picker}
                      >
                        <Picker.Item label="Tier 1 (Critical)" value="Tier 1" />
                        <Picker.Item
                          label="Tier 2 (Progressing)"
                          value="Tier 2"
                        />
                        <Picker.Item label="Tier 3 (Stable)" value="Tier 3" />
                      </Picker>
                    </View>
                  </View>
                  <View style={styles.halfField}>
                    <Text style={styles.formLabel}>
                      Resilience Score (0-100)
                    </Text>
                    <TextInput
                      style={styles.formInput}
                      keyboardType="numeric"
                      placeholder="50"
                      placeholderTextColor="#9ca3af"
                      value={newResilienceScore}
                      onChangeText={setNewResilienceScore}
                    />
                  </View>
                </View>

                <View>
                  <Text style={styles.formLabel}>Program Linkages</Text>
                  <View style={styles.checkboxContainer}>
                    <TouchableOpacity
                      style={styles.checkbox}
                      onPress={() => setNewProgramGoat(!newProgramGoat)}
                    >
                      <View
                        style={[
                          styles.checkboxBox,
                          newProgramGoat && styles.checkboxChecked,
                        ]}
                      >
                        {newProgramGoat && (
                          <MaterialIcons name="check" size={14} color="white" />
                        )}
                      </View>
                      <Text style={styles.checkboxLabel}>Goat Rearing</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.checkbox}
                      onPress={() =>
                        setNewProgramSugarcane(!newProgramSugarcane)
                      }
                    >
                      <View
                        style={[
                          styles.checkboxBox,
                          newProgramSugarcane && styles.checkboxChecked,
                        ]}
                      >
                        {newProgramSugarcane && (
                          <MaterialIcons name="check" size={14} color="white" />
                        )}
                      </View>
                      <Text style={styles.checkboxLabel}>
                        Sugarcane Cultivation
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.formButtons}>
                  <TouchableOpacity
                    onPress={() => setShowAddModal(false)}
                    style={styles.cancelButton}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleAddBeneficiary}
                    style={styles.submitButton}
                  >
                    <Text style={styles.submitButtonText}>
                      Register Beneficiary
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Bulk Import Modal */}
        <Modal
          visible={showImportModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => !importing && setShowImportModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.importModalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Bulk Import Beneficiaries</Text>
                {!importing && (
                  <TouchableOpacity onPress={() => setShowImportModal(false)}>
                    <MaterialIcons name="close" size={24} color="#64748b" />
                  </TouchableOpacity>
                )}
              </View>

              {importing ? (
                <View style={styles.importProgressContainer}>
                  <View style={styles.progressBarContainer}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${importProgress}%` },
                      ]}
                    />
                  </View>
                  <View style={styles.progressStatus}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={styles.progressText}>{importStepText}</Text>
                  </View>
                  <Text style={styles.progressPercent}>
                    {importProgress}% Complete
                  </Text>
                </View>
              ) : (
                <View style={styles.importContent}>
                  <View style={styles.uploadArea}>
                    <MaterialIcons
                      name="cloud-upload"
                      size={48}
                      color="#9ca3af"
                    />
                    <Text style={styles.uploadTitle}>
                      Drag and drop your spreadsheet here
                    </Text>
                    <Text style={styles.uploadSubtitle}>
                      Supports .csv, .xls, .xlsx (Max 10MB)
                    </Text>
                    <TouchableOpacity style={styles.browseButton}>
                      <Text style={styles.browseButtonText}>Browse Files</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.importButtons}>
                    <TouchableOpacity
                      onPress={() => setShowImportModal(false)}
                      style={styles.cancelButton}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={simulateBulkImport}
                      style={styles.submitButton}
                    >
                      <Text style={styles.submitButtonText}>
                        Simulate Import
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
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
  dropdownItemActive: { backgroundColor: "#e8f5e9" },
  dropdownText: { fontSize: 13, color: "#6b7280", marginLeft: 10 },
  dropdownTextActive: { color: "#047857", fontWeight: "600" },
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
  },
  subtitle: {
    fontSize: 13,
    color: colors.onSurfaceVariant,
    lineHeight: 20,
    marginBottom: 20,
  },

  // ============================================
  // 5. TOOLBAR & FILTERS
  // ============================================
  actionButtons: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
    flexWrap: "wrap",
  },
  searchContainer: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 999,
    paddingHorizontal: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    minWidth: 200,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 13,
    color: colors.onSurface,
    minWidth: 120,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.primary,
    borderRadius: 999,
  },
  addButtonText: { fontSize: 12, fontWeight: "600", color: colors.onPrimary },
  importButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  importButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.onSurface,
  },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.primary,
    borderRadius: 999,
  },
  exportButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.onPrimary,
  },

  // ============================================
  // 6. STATS & FILTERS
  // ============================================
  statsContainer: { marginBottom: 24, gap: 12 },
  statCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 20,
    marginBottom: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statTitle: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: colors.onSurfaceVariant,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.onSurface,
    marginBottom: 4,
  },
  statSubtitle: { fontSize: 11, color: colors.onSurfaceVariant },
  filtersContainer: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  filtersLabel: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: colors.onSurfaceVariant,
    marginBottom: 12,
  },
  filterScroll: { flexDirection: "row" },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  filterChipText: { fontSize: 12, color: colors.onSurfaceVariant },
  clearFiltersText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },

  // ============================================
  // 7. TABLE
  // ============================================
  tableHeaderRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
    marginBottom: 8,
  },
  headerCell: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: colors.onSurfaceVariant,
  },
  headerName: { flex: 1.6 },
  headerLocation: { flex: 1.5 },
  headerProgress: { flex: 0.9 },
  headerPrograms: { flex: 1.1 },
  headerScore: { flex: 0.8 },
  headerAction: { flex: 0.6, textAlign: "right" },
  beneficiaryRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
    alignItems: "center",
    backgroundColor: colors.surfaceContainerLowest,
  },
  beneficiaryCell: { justifyContent: "center" },
  cellName: { flex: 1.6, paddingRight: 8 },
  cellLocation: { flex: 1.5, paddingRight: 8 },
  cellProgress: { flex: 0.9, paddingRight: 8 },
  cellPrograms: { flex: 1.1, paddingRight: 8 },
  cellScore: { flex: 0.8, paddingRight: 8 },
  cellAction: { flex: 0.6, alignItems: "flex-end" },
  beneficiaryInfo: { flexDirection: "row", alignItems: "center", gap: 12 },
  beneficiaryAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${colors.primary}10`,
    alignItems: "center",
    justifyContent: "center",
  },
  beneficiaryInitials: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.primary,
  },
  beneficiaryName: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.onSurface,
  },
  beneficiaryId: {
    fontSize: 10,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  locationText: { fontSize: 12, color: colors.onSurface, fontWeight: "500" },
  incomeText: { fontSize: 10, color: colors.onSurfaceVariant, marginTop: 2 },
  progressWrapper: { gap: 4 },
  progressBarBg: {
    height: 4,
    backgroundColor: colors.surfaceContainerHighest,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  tierText: {
    fontSize: 10,
    fontWeight: "500",
    color: colors.onSurfaceVariant,
    marginTop: 4,
  },
  programsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  programBadge: {
    backgroundColor: `${colors.primary}15`,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  programBadgeText: {
    fontSize: 8,
    fontWeight: "600",
    textTransform: "uppercase",
    color: colors.primary,
  },
  scoreContainer: { flexDirection: "row", alignItems: "center", gap: 4 },
  scoreText: { fontSize: 11, fontWeight: "500", color: colors.onSurface },
  viewButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: `${colors.primary}10`,
    borderRadius: 20,
  },
  viewButtonText: { fontSize: 10, fontWeight: "600", color: colors.primary },
  emptyState: { padding: 48, alignItems: "center" },
  emptyStateText: { color: "#9ca3af", textAlign: "center" },

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
  addModalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    width: "100%",
    maxWidth: 400,
    padding: 24,
    margin: 16,
    alignSelf: "center",
    maxHeight: "90%",
  },
  importModalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    width: "100%",
    maxWidth: 400,
    padding: 24,
    margin: 16,
    alignSelf: "center",
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
  row: { flexDirection: "row", gap: 12 },
  halfField: { flex: 1 },
  checkboxContainer: {
    flexDirection: "row",
    gap: 20,
    marginTop: 4,
    flexWrap: "wrap",
  },
  checkbox: { flexDirection: "row", alignItems: "center", gap: 8 },
  checkboxBox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#d1d5db",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxLabel: { fontSize: 13, color: colors.onSurface },
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
  importProgressContainer: { padding: 20, alignItems: "center", gap: 16 },
  progressBarContainer: {
    width: "100%",
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressStatus: { flexDirection: "row", alignItems: "center", gap: 8 },
  progressText: { fontSize: 13, color: colors.primary, fontWeight: "500" },
  progressPercent: { fontSize: 12, color: colors.onSurfaceVariant },
  importContent: { gap: 20 },
  uploadArea: {
    borderWidth: 2,
    borderColor: "#d1d5db",
    borderStyle: "dashed",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    gap: 12,
  },
  uploadTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.onSurface,
    textAlign: "center",
  },
  uploadSubtitle: {
    fontSize: 11,
    color: colors.onSurfaceVariant,
    textAlign: "center",
  },
  browseButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.surface,
    borderRadius: 20,
  },
  browseButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.onSurface,
  },
  importButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },

  // ============================================
  // 9. FOOTER (synced with dashboard/admin)
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
