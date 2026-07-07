import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
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
  secondaryFixed: "#ffdcc6",
  onSecondaryContainer: "#5e2c00",
  errorContainer: "#ffdad6",
  onErrorContainer: "#93000a",
  rose: "#ef4444",
  emerald: "#10b981",
};

// Complete programs data
const programsData = {
  1: {
    id: 1,
    title: "Annual Literacy Drive",
    status: "Active",
    description:
      "Comprehensive reading initiative targeting Standard 3 students.",
    duration: "6 Months",
    participants: "450 Students Enrolled",
    agenda:
      "This long-term program is designed to integrate basic phonics and reading competencies into primary classrooms, supporting assigned educational fellows with tailored toolkits and assessment templates. Progress outcomes are synced on a bi-weekly basis.",
    progress: 78,
    term: "Jun - Dec 2026",
    coordinator: "Aisha Rahman",
    totalTarget: "450 Students",
    participantsList: [
      {
        name: "Aarav Kumar",
        id: "STU-2023-089",
        school: "Vidya Mandir",
        progress: "85% Completed",
      },
      {
        name: "Meera Patel",
        id: "STU-2024-012",
        school: "Vidya Mandir",
        progress: "60% Completed",
      },
      {
        name: "Rahul Desai",
        id: "STU-2022-401",
        school: "Global Vision",
        progress: "92% Completed",
      },
      {
        name: "Priya Sharma",
        id: "STU-2024-045",
        school: "Vidya Mandir",
        progress: "75% Completed",
      },
      {
        name: "Ankit Verma",
        id: "STU-2023-178",
        school: "Global Vision",
        progress: "88% Completed",
      },
    ],
  },
  2: {
    id: 2,
    title: "Digital Literacy Course",
    status: "Planning",
    description:
      "Basic computing classes for standard 8 students in partner schools.",
    duration: "3 Months",
    participants: "Planning (120 Expected)",
    agenda:
      "This program introduces basic computer skills and digital literacy to standard 8 students, preparing them for modern educational and professional environments.",
    progress: 45,
    term: "Sep - Nov 2026",
    coordinator: "Rahul Mehta",
    totalTarget: "120 Students",
    participantsList: [
      {
        name: "Neha Gupta",
        id: "STU-2024-089",
        school: "Vidya Mandir",
        progress: "30% Completed",
      },
      {
        name: "Rohan Patil",
        id: "STU-2024-056",
        school: "Global Vision",
        progress: "45% Completed",
      },
      {
        name: "Sneha Reddy",
        id: "STU-2023-234",
        school: "Vidya Mandir",
        progress: "50% Completed",
      },
    ],
  },
};

export default function PtaProgramDetail() {
  const params = useLocalSearchParams();
  const programId = (params.id as string) || "1";

  const [menuOpen, setMenuOpen] = useState(false);
  const [educationDropdownOpen, setEducationDropdownOpen] = useState(false);
  const [livelihoodDropdownOpen, setLivelihoodDropdownOpen] = useState(false);
  const [authDropdownOpen, setAuthDropdownOpen] = useState(false);

  const slideAnim = useRef(new Animated.Value(-width)).current;
  const educationRotateAnim = useRef(new Animated.Value(0)).current;
  const livelihoodRotateAnim = useRef(new Animated.Value(0)).current;
  const authRotateAnim = useRef(new Animated.Value(0)).current;

  // Get program data based on ID
  const program = programsData[parseInt(programId)] || programsData[1];

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

  const ProgressBar = ({ progress }: { progress: number }) => (
    <View style={styles.progressBarContainer}>
      <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
    </View>
  );

  const ParticipantRow = ({ participant }: { participant: any }) => (
    <View style={styles.participantRow}>
      <View style={styles.participantInfo}>
        <Text style={styles.participantName}>{participant.name}</Text>
        <Text style={styles.participantSchool}>{participant.school}</Text>
      </View>
      <Text style={styles.participantProgress}>{participant.progress}</Text>
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
                style={[styles.dropdownItem, styles.dropdownItemActive]}
                onPress={() => handleNavigation("/education_pta_programs")}
              >
                <Ionicons
                  name="people-circle-outline"
                  size={18}
                  color="#047857"
                />
                <Text style={[styles.dropdownText, styles.dropdownTextActive]}>
                  PTA & Programs
                </Text>
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
                style={styles.dropdownItem}
                onPress={() => handleNavigation("/beneficiary_master_profile")}
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
          onPress={() => {
            toggleMenu();
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
        >
          {/* Back Link */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.push("/education_pta_programs")}
          >
            <MaterialIcons name="arrow-back" size={18} color="#6b7280" />
            <Text style={styles.backText}>Back to PTA Hub</Text>
          </TouchableOpacity>

          {/* Hero Header */}
          <LinearGradient
            colors={["#FFFFFF", "#FFFFFF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroContent}>
              <View
                style={[
                  styles.heroIcon,
                  program.status === "Active"
                    ? styles.heroIconActive
                    : styles.heroIconPlanning,
                ]}
              >
                <MaterialIcons
                  name="campaign"
                  size={32}
                  color={
                    program.status === "Active"
                      ? colors.primary
                      : colors.secondary
                  }
                />
              </View>
              <View style={styles.heroInfo}>
                <View style={styles.titleRow}>
                  <Text style={styles.heroTitle}>{program.title}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      program.status === "Active"
                        ? styles.statusActive
                        : styles.statusPlanning,
                    ]}
                  >
                    <Text style={styles.statusText}>{program.status}</Text>
                  </View>
                </View>
                <View style={styles.dateRow}>
                  <MaterialIcons
                    name="schedule"
                    size={16}
                    color={colors.primary}
                  />
                  <Text style={styles.dateText}>
                    Continuous Education Initiative • {program.duration} Planned
                  </Text>
                </View>
              </View>
            </View>
          </LinearGradient>

          {/* Two Column Layout */}
          <View style={styles.twoColumnLayout}>
            {/* Left Column */}
            <View style={styles.leftColumn}>
              {/* Program Goals & Metrics */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Program Goals & Metrics</Text>
                <Text style={styles.cardText}>{program.agenda}</Text>

                <View style={styles.progressSection}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>
                      General Learning Objective Reached
                    </Text>
                    <Text style={styles.progressPercentage}>
                      {program.progress}% Progress
                    </Text>
                  </View>
                  <ProgressBar progress={program.progress} />
                </View>
              </View>

              {/* Participant Roster */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <MaterialIcons
                    name="groups"
                    size={20}
                    color={colors.primary}
                  />
                  <Text style={styles.cardTitle}>
                    Participant Student Roster
                  </Text>
                </View>
                <View style={styles.participantHeader}>
                  <Text style={styles.participantHeaderName}>Student Name</Text>
                  <Text style={styles.participantHeaderProgress}>
                    Milestone
                  </Text>
                </View>
                {program.participantsList.map((participant, idx) => (
                  <ParticipantRow key={idx} participant={participant} />
                ))}
              </View>
            </View>

            {/* Right Column */}
            <View style={styles.rightColumn}>
              {/* Program Details */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Program Details</Text>
                <View style={styles.detailsList}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Scheduled Term</Text>
                    <Text style={styles.detailValue}>{program.term}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Active Coordinator</Text>
                    <Text style={styles.detailValue}>
                      {program.coordinator}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Total Target</Text>
                    <Text style={styles.detailValue}>
                      {program.totalTarget}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
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
  dropdownItemLogout: {
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    marginTop: 4,
    paddingTop: 12,
  },
  dropdownText: { fontSize: 13, color: "#6b7280", marginLeft: 10 },
  dropdownTextActive: { color: "#047857", fontWeight: "600" },
  dropdownTextLogout: { color: "#ef4444" },
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
  heroCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  heroContent: { flexDirection: "row", gap: 16 },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  heroIconActive: { backgroundColor: "rgba(0,104,87,0.1)" },
  heroIconPlanning: { backgroundColor: "rgba(150,73,0,0.1)" },
  heroInfo: { flex: 1 },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.onSurface,
    flex: 1,
  },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  statusActive: { backgroundColor: colors.primaryFixed },
  statusPlanning: { backgroundColor: colors.secondaryFixed },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    color: colors.onPrimaryFixed,
  },
  dateRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  dateText: { fontSize: 12, color: colors.onSurfaceVariant },
  twoColumnLayout: { flexDirection: "row", flexWrap: "wrap", gap: 16 },
  leftColumn: { flex: 2, minWidth: 280 },
  rightColumn: { flex: 1, minWidth: 250 },
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.onSurface,
    marginBottom: 12,
  },
  cardText: {
    fontSize: 13,
    color: colors.onSurfaceVariant,
    lineHeight: 20,
    marginBottom: 16,
  },
  progressSection: { marginTop: 8 },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressLabel: { fontSize: 13, color: colors.onSurfaceVariant },
  progressPercentage: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.surfaceContainerHighest,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  participantHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
    marginBottom: 12,
  },
  participantHeaderName: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    color: colors.onSurfaceVariant,
  },
  participantHeaderProgress: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    color: colors.onSurfaceVariant,
  },
  participantRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  participantInfo: { flex: 2 },
  participantName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.onSurface,
    marginBottom: 2,
  },
  participantSchool: { fontSize: 11, color: colors.onSurfaceVariant },
  participantProgress: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
  },
  detailsList: { gap: 16 },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  detailLabel: { fontSize: 13, color: colors.onSurfaceVariant },
  detailValue: { fontSize: 13, fontWeight: "600", color: colors.onSurface },
});
