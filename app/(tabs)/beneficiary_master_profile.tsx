import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
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

// Theme Colors
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

// ---------- Footer Component ----------
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

// Types
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
}

// Default Data
const defaultBeneficiaries: Beneficiary[] = [
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

export default function BeneficiaryMasterDirectory() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showFooter, setShowFooter] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importStepText, setImportStepText] = useState("");

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
  const [beneficiaries, setBeneficiaries] =
    useState<Beneficiary[]>(defaultBeneficiaries);

  // Form states
  const [newName, setNewName] = useState("");
  const [newLocation, setNewLocation] = useState("Bartari");
  const [newHouseholdSize, setNewHouseholdSize] = useState("4");
  const [newIncome, setNewIncome] = useState("Agriculture");
  const [newTier, setNewTier] = useState("Tier 2");
  const [newResilienceScore, setNewResilienceScore] = useState("50");
  const [newProgramGoat, setNewProgramGoat] = useState(false);
  const [newProgramSugarcane, setNewProgramSugarcane] = useState(false);

  // Dropdown states
  const [educationDropdownOpen, setEducationDropdownOpen] = useState(false);
  const [livelihoodDropdownOpen, setLivelihoodDropdownOpen] = useState(false);
  const [authDropdownOpen, setAuthDropdownOpen] = useState(false);

  // Animated values
  const slideAnim = useRef(new Animated.Value(-width)).current;
  const educationRotateAnim = useRef(new Animated.Value(0)).current;
  const livelihoodRotateAnim = useRef(new Animated.Value(0)).current;
  const authRotateAnim = useRef(new Animated.Value(0)).current;

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
    toggleMenu();
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

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowFooter(offsetY > 300);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
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

  const clearFilters = () => {
    setSearchQuery("");
    setTierFilter("All Tiers");
    setProgramFilter("All Programs");
    setLocationFilter("All Locations");
  };

  const handleAddBeneficiary = () => {
    if (!newName) {
      Alert.alert("Error", "Please enter beneficiary name");
      return;
    }

    const programsSelected: string[] = [];
    if (newProgramGoat) programsSelected.push("Goat Rearing");
    if (newProgramSugarcane) programsSelected.push("Sugarcane");
    if (programsSelected.length === 0) programsSelected.push("Goat Rearing");

    let tierPercent = 50;
    if (newTier === "Tier 1") tierPercent = 40;
    else if (newTier === "Tier 2") tierPercent = 65;
    else if (newTier === "Tier 3") tierPercent = 90;

    const randomNum = Math.floor(100 + Math.random() * 900);
    const randomLetter = String.fromCharCode(
      65 + Math.floor(Math.random() * 26),
    );
    const newId = `BEN-${randomNum}-${randomLetter}`;

    const newRecord: Beneficiary = {
      id: newId,
      name: newName,
      location: `${newLocation}, Kalgachia, Assam`,
      householdSize: parseInt(newHouseholdSize),
      income: newIncome,
      tier: newTier,
      tierPercent,
      programs: programsSelected,
      resilienceScore: parseInt(newResilienceScore),
    };

    setBeneficiaries([newRecord, ...beneficiaries]);
    setNewName("");
    setNewLocation("Bartari");
    setNewHouseholdSize("4");
    setNewIncome("Agriculture");
    setNewTier("Tier 2");
    setNewResilienceScore("50");
    setNewProgramGoat(false);
    setNewProgramSugarcane(false);
    setShowAddModal(false);
    Alert.alert("Success", "Beneficiary registered successfully");
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

  const totalBeneficiaries = beneficiaries.length + 8420;

  const StatCard = ({ title, value, subtitle }: any) => (
    <View style={styles.statCard}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statSubtitle}>{subtitle}</Text>
    </View>
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
        <TouchableOpacity style={styles.viewButton}>
          <Text style={styles.viewButtonText}>View File</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      {/* OVERLAY */}
      {menuOpen && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={toggleMenu}
        />
      )}

      {/* SIDEBAR */}
      <Animated.View
        style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}
      >
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

        <View>
          <TouchableOpacity
            style={styles.menuItemWithDropdown}
            onPress={toggleEducationDropdown}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="school-outline" size={20} color="#4b5563" />
              <Text style={styles.menuText}>Education</Text>
            </View>
            <Animated.View style={{ transform: [{ rotate: rotateEducation }] }}>
              <Ionicons name="chevron-down" size={20} color="#6b7280" />
            </Animated.View>
          </TouchableOpacity>

          {educationDropdownOpen && (
            <View style={styles.dropdownContainer}>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => handleNavigation("/education_management_hub")}
              >
                <Ionicons name="library-outline" size={18} color="#6b7280" />
                <Text style={styles.dropdownText}>Management Hub</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => handleNavigation("/education_schools_module")}
              >
                <Ionicons name="business-outline" size={18} color="#6b7280" />
                <Text style={styles.dropdownText}>Schools Overview</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => handleNavigation("/education_fellows_module")}
              >
                <Ionicons name="people-outline" size={18} color="#6b7280" />
                <Text style={styles.dropdownText}>Fellows Directory</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => handleNavigation("/education_students_module")}
              >
                <Ionicons name="calendar-outline" size={18} color="#6b7280" />
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
                onPress={() => handleNavigation("/livelihood_management_hub")}
              >
                <Ionicons name="apps-outline" size={18} color="#6b7280" />
                <Text style={styles.dropdownText}>Management Hub</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => handleNavigation("/livelihood_goat_rearing_1")}
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
                style={[styles.dropdownItem, styles.dropdownItemActive]}
                onPress={() => handleNavigation("/beneficiary_master_profile")}
              >
                <Ionicons
                  name="people-circle-outline"
                  size={18}
                  color="#047857"
                />
                <Text style={[styles.dropdownText, styles.dropdownTextActive]}>
                  Beneficiaries
                </Text>
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
          <Ionicons name="document-text-outline" size={20} color="#4b5563" />
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
          onPress={() => handleNavigation("/profile")}
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
                  toggleMenu();
                  router.push("/login");
                }}
              >
                <Ionicons name="log-in-outline" size={18} color="#6b7280" />
                <Text style={styles.dropdownText}>Login Page</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  toggleMenu();
                  router.push("/register");
                }}
              >
                <Ionicons name="person-add-outline" size={18} color="#6b7280" />
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
                <Text style={[styles.dropdownText, styles.dropdownTextLogout]}>
                  Logout
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Animated.View>

      {/* MAIN CONTENT */}
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

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
                  uri: "https://randomuser.me/api/portraits/women/68.jpg",
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
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.push("/livelihood_management_hub")}
          >
            <MaterialIcons name="arrow-back" size={18} color="#6b7280" />
            <Text style={styles.backText}>Back to Livelihood Hub</Text>
          </TouchableOpacity>

          <View>
            <Text style={styles.sectionLabel}>Livelihood Database</Text>
            <Text style={styles.mainTitle}>Beneficiaries Master Registry</Text>
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
              value={totalBeneficiaries}
              subtitle="Unified profiles logged"
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
                  <MaterialIcons name="expand-more" size={16} color="#6B7280" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.filterChip}
                  onPress={() => setShowTierPicker(true)}
                >
                  <Text style={styles.filterChipText}>
                    {tierFilter === "All Tiers" ? "All Tiers" : tierFilter}
                  </Text>
                  <MaterialIcons name="expand-more" size={16} color="#6B7280" />
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
                  <MaterialIcons name="expand-more" size={16} color="#6B7280" />
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
            <Text style={[styles.headerCell, styles.headerAction]}>Action</Text>
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

          {/* Footer - Always visible at bottom */}
          <Footer />
        </ScrollView>
      </SafeAreaView>

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
                  <Text style={styles.formLabel}>Resilience Score (0-100)</Text>
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
                    onPress={() => setNewProgramSugarcane(!newProgramSugarcane)}
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
                    <Text style={styles.submitButtonText}>Simulate Import</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
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
  dropdownText: { fontSize: 13, color: "#6b7280", marginLeft: 10 },
  dropdownTextActive: { color: "#047857", fontWeight: "600" },
  // Authentication dropdown styles
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
  statsContainer: { marginBottom: 24 },
  statCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
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
  beneficiaryName: { fontSize: 13, fontWeight: "600", color: colors.onSurface },
  beneficiaryId: { fontSize: 10, color: colors.onSurfaceVariant, marginTop: 2 },
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
  importButtons: { flexDirection: "row", justifyContent: "flex-end", gap: 12 },
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
