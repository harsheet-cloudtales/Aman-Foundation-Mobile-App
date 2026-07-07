import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
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

// Types
interface Student {
  initials: string;
  bgClass: string;
  name: string;
  id: string;
  school: string;
  grade: string;
  gradeGroup: string;
  district: string;
  attendance: number;
  attendanceColor: string;
  barColor: string;
  hasGlow: boolean;
  status: string;
  statusClass: string;
}

// Mock Data
const DEFAULT_SCHOOLS = [
  { name: "Oakridge Academy, Kalgachia" },
  { name: "Kalgachia Public School, Kalgachia" },
  { name: "Bartari Primary School, Bartari" },
  { name: "Digjani High School, Digjani" },
  { name: "Sawpur Elementary, Sawpur" },
];

const DEFAULT_STUDENTS: Student[] = [
  {
    initials: "AK",
    bgClass: "#d1fae5",
    name: "Aarav Kumar",
    id: "STU-2026-001",
    school: "Oakridge Academy, Kalgachia",
    grade: "Grade 8",
    gradeGroup: "Middle (6-8)",
    district: "Kalgachia",
    attendance: 95,
    attendanceColor: "#059669",
    barColor: "#059669",
    hasGlow: true,
    status: "Excelling",
    statusClass: "#d1fae5",
  },
  {
    initials: "SS",
    bgClass: "#fed7aa",
    name: "Sneha Sharma",
    id: "STU-2026-002",
    school: "Kalgachia Public School, Kalgachia",
    grade: "Grade 5",
    gradeGroup: "Primary (1-5)",
    district: "Kalgachia",
    attendance: 82,
    attendanceColor: "#6B7280",
    barColor: "#6B7280",
    hasGlow: false,
    status: "On Track",
    statusClass: "#d1fae5",
  },
  {
    initials: "RV",
    bgClass: "#ddd6fe",
    name: "Rohan Verma",
    id: "STU-2026-003",
    school: "Bartari Primary School, Bartari",
    grade: "Grade 3",
    gradeGroup: "Primary (1-5)",
    district: "Bartari",
    attendance: 65,
    attendanceColor: "#ea580c",
    barColor: "#ea580c",
    hasGlow: false,
    status: "Needs Attention",
    statusClass: "#fee2e2",
  },
  {
    initials: "PN",
    bgClass: "#e5e7eb",
    name: "Priya Nair",
    id: "STU-2026-004",
    school: "Digjani High School, Digjani",
    grade: "Grade 10",
    gradeGroup: "High (9-10)",
    district: "Digjani",
    attendance: 98,
    attendanceColor: "#059669",
    barColor: "#059669",
    hasGlow: true,
    status: "Excelling",
    statusClass: "#d1fae5",
  },
];

const StudentsModule = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState("All Grades");
  const [performanceFilter, setPerformanceFilter] = useState("All Performance");
  const [schoolFilter, setSchoolFilter] = useState("All Schools");
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [students, setStudents] = useState(DEFAULT_STUDENTS);

  // Dropdown states
  const [educationDropdownOpen, setEducationDropdownOpen] = useState(false);
  const [livelihoodDropdownOpen, setLivelihoodDropdownOpen] = useState(false);
  const [authDropdownOpen, setAuthDropdownOpen] = useState(false);

  // Filter picker states
  const [showGradePicker, setShowGradePicker] = useState(false);
  const [showPerformancePicker, setShowPerformancePicker] = useState(false);
  const [showSchoolPicker, setShowSchoolPicker] = useState(false);

  // Animated values
  const slideAnim = useRef(new Animated.Value(-width)).current;
  const educationRotateAnim = useRef(new Animated.Value(0)).current;
  const livelihoodRotateAnim = useRef(new Animated.Value(0)).current;
  const authRotateAnim = useRef(new Animated.Value(0)).current;

  // Form states for adding a student
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentId, setNewStudentId] = useState("");
  const [newStudentSchool, setNewStudentSchool] = useState("");
  const [newStudentGrade, setNewStudentGrade] = useState("Grade 8");
  const [newStudentGradeGroup, setNewStudentGradeGroup] =
    useState("Middle (6-8)");
  const [newStudentAttendance, setNewStudentAttendance] = useState("");
  const [newStudentStatus, setNewStudentStatus] = useState("On Track");

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

  const handleAddStudent = () => {
    if (!newStudentName || !newStudentSchool || !newStudentAttendance) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    const initials =
      newStudentName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2) || "ST";
    const bgColors = ["#d1fae5", "#fed7aa", "#ddd6fe", "#e5e7eb"];
    const bgClass = bgColors[newStudentName.length % bgColors.length];

    const att = parseInt(newStudentAttendance);
    const attendanceColor =
      att > 85 ? "#059669" : att > 70 ? "#6B7280" : "#ea580c";
    const barColor = att > 85 ? "#059669" : att > 70 ? "#6B7280" : "#ea580c";
    const hasGlow = att > 90;

    const statusColors: { [key: string]: string } = {
      "On Track": "#d1fae5",
      Satisfactory: "#f3f4f6",
      "Needs Attention": "#fee2e2",
      Excelling: "#d1fae5",
    };

    const newStudent: Student = {
      initials,
      bgClass,
      name: newStudentName,
      id: newStudentId || `STU-2026-${Math.floor(100 + Math.random() * 900)}`,
      school: newStudentSchool,
      grade: newStudentGrade,
      gradeGroup: newStudentGradeGroup,
      district:
        newStudentSchool.split(",")[0].trim().split(" ")[0] || "Kalgachia",
      attendance: att,
      attendanceColor,
      barColor,
      hasGlow,
      status: newStudentStatus,
      statusClass: statusColors[newStudentStatus] || "#f3f4f6",
    };

    setStudents([newStudent, ...students]);
    setNewStudentName("");
    setNewStudentId("");
    setNewStudentSchool("");
    setNewStudentGrade("Grade 8");
    setNewStudentGradeGroup("Middle (6-8)");
    setNewStudentAttendance("");
    setNewStudentStatus("On Track");
    setShowAddModal(false);
    Alert.alert("Success", "Student added successfully");
  };

  const clearFilters = () => {
    setGradeFilter("All Grades");
    setPerformanceFilter("All Performance");
    setSchoolFilter("All Schools");
    setSearchQuery("");
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.school.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGrade =
      gradeFilter === "All Grades" || s.gradeGroup === gradeFilter;

    const matchesPerformance =
      performanceFilter === "All Performance" ||
      (performanceFilter === "Excellent" && s.status === "Excelling") ||
      (performanceFilter === "Satisfactory" &&
        (s.status === "On Track" || s.status === "Satisfactory")) ||
      (performanceFilter === "Needs Attention" &&
        s.status === "Needs Attention");

    const matchesSchool =
      schoolFilter === "All Schools" || s.school === schoolFilter;

    return matchesSearch && matchesGrade && matchesPerformance && matchesSchool;
  });

  const gradeGroups = [
    "All Grades",
    "Primary (1-5)",
    "Middle (6-8)",
    "High (9-10)",
  ];
  const performanceOptions = [
    "All Performance",
    "Excellent",
    "Satisfactory",
    "Needs Attention",
  ];
  const schoolOptions = [
    "All Schools",
    ...new Set(students.map((s) => s.school)),
  ];

  const StatCard = ({ title, value, trend }: any) => (
    <View style={styles.statCard}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <View style={styles.trendContainer}>
        <Icon name="trending-up" size={12} color="#059669" />
        <Text style={styles.trendText}>+12% this term</Text>
      </View>
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
                <Text style={styles.modalListItemText}>{item}</Text>
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
          <View style={styles.brandIcon}>
            <Ionicons name="business-outline" size={22} color="#fff" />
          </View>
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
                style={[styles.dropdownItem, styles.dropdownItemActive]}
                onPress={() => handleNavigation("/education_students_module")}
              >
                <Ionicons name="people-outline" size={18} color="#047857" />
                <Text style={[styles.dropdownText, styles.dropdownTextActive]}>
                  Students Directory
                </Text>
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
                <Text style={styles.dropdownText}>Progress Reports</Text>
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
                <Ionicons name="log-out-outline" size={18} color="#ef4444" />
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
        <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
              <Ionicons name="menu" size={24} color="#4B5563" />
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
            <TouchableOpacity
              style={styles.avatar}
              onPress={() => router.push("/profile")}
            >
              <Image
                source={{
                  uri: "https://randomuser.me/api/portraits/women/68.jpg",
                }}
                style={styles.avatarImage}
              />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          horizontal={false}
        >
          {/* Back Link */}
          <TouchableOpacity
            style={styles.backLink}
            onPress={() => router.push("/education_management_hub")}
          >
            <Icon name="arrow-back" size={20} color="#64748b" />
            <Text style={styles.backLinkText}>Back to Education Hub</Text>
          </TouchableOpacity>

          {/* Header Section */}
          <View style={styles.headerSection}>
            <Text style={styles.mainTitle}>Students Directory</Text>
            <Text style={styles.subtitle}>
              Manage enrolled students, track academic progress, and monitor
              school linkages across all program areas.
            </Text>
          </View>

          {/* Action Bar */}
          <View style={styles.actionBar}>
            <View style={styles.searchContainer}>
              <Icon name="search" size={20} color="#9ca3af" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search students..."
                placeholderTextColor="#9ca3af"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.exportButton}>
                <Icon name="download" size={18} color="#374151" />
                <Text style={styles.exportButtonText}>Export</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowAddModal(true)}
                style={styles.addButton}
              >
                <Icon name="add" size={18} color="white" />
                <Text style={styles.addButtonText}>Add Student</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats and Filters */}
          <View style={styles.statsFiltersContainer}>
            <StatCard title="Total Enrolled" value="4,285" trend="+12%" />

            <View style={styles.filtersContainer}>
              <Text style={styles.filtersLabel}>Filters</Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterScroll}
              >
                <TouchableOpacity
                  onPress={() => setShowGradePicker(true)}
                  style={styles.filterButton}
                >
                  <Text style={styles.filterButtonText}>{gradeFilter}</Text>
                  <Icon name="expand-more" size={18} color="#9ca3af" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setShowPerformancePicker(true)}
                  style={styles.filterButton}
                >
                  <Text style={styles.filterButtonText}>
                    {performanceFilter}
                  </Text>
                  <Icon name="expand-more" size={18} color="#9ca3af" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setShowSchoolPicker(true)}
                  style={styles.filterButton}
                >
                  <Text style={styles.filterButtonText}>
                    {schoolFilter.length > 20
                      ? schoolFilter.substring(0, 20) + "..."
                      : schoolFilter}
                  </Text>
                  <Icon name="expand-more" size={18} color="#9ca3af" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={clearFilters}
                  style={styles.clearButton}
                >
                  <Text style={styles.clearButtonText}>Clear Filters</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>

          {/* Students Table - Using FlatList for better scrolling */}
          <View style={styles.tableContainer}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.headerCell, styles.studentInfoCell]}>
                Student Info
              </Text>
              <Text style={[styles.headerCell, styles.schoolCell]}>
                School Linkage
              </Text>
              <Text style={[styles.headerCell, styles.progressCell]}>
                Academic Progress
              </Text>
              <Text style={[styles.headerCell, styles.actionsCell]}>
                Actions
              </Text>
            </View>

            {/* Table Rows */}
            <FlatList
              data={filteredStudents}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.tableRow}>
                  {/* Student Info Column */}
                  <View style={[styles.rowCell, styles.studentInfoCell]}>
                    <View style={styles.studentInfoContainer}>
                      <View
                        style={[
                          styles.initialsCircle,
                          { backgroundColor: item.bgClass },
                        ]}
                      >
                        <Text style={styles.initialsCircleText}>
                          {item.initials}
                        </Text>
                      </View>
                      <View style={styles.studentTextContainer}>
                        <Text style={styles.studentNameText}>{item.name}</Text>
                        <Text style={styles.studentIdText}>ID: {item.id}</Text>
                      </View>
                    </View>
                  </View>

                  {/* School Linkage Column */}
                  <View style={[styles.rowCell, styles.schoolCell]}>
                    <Text style={styles.schoolNameText} numberOfLines={2}>
                      {item.school}
                    </Text>
                    <Text style={styles.gradeText}>
                      {item.grade} • {item.district}
                    </Text>
                  </View>

                  {/* Academic Progress Column */}
                  <View style={[styles.rowCell, styles.progressCell]}>
                    <View style={styles.attendanceContainer}>
                      <View style={styles.attendanceHeaderRow}>
                        <Text style={styles.attendanceLabelText}>
                          Attendance
                        </Text>
                        <Text
                          style={[
                            styles.attendancePercentText,
                            { color: item.attendanceColor },
                          ]}
                        >
                          {item.attendance}%
                        </Text>
                      </View>
                      <View style={styles.progressBarWrapper}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: `${item.attendance}%`,
                              backgroundColor: item.barColor,
                            },
                          ]}
                        />
                        {item.hasGlow && <View style={styles.progressGlow} />}
                      </View>
                      <View
                        style={[
                          styles.statusBadgeWrapper,
                          { backgroundColor: item.statusClass },
                        ]}
                      >
                        <Text style={styles.statusBadgeText}>
                          {item.status}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Actions Column */}
                  <View style={[styles.rowCell, styles.actionsCell]}>
                    <TouchableOpacity
                      style={styles.viewProfileBtn}
                      onPress={() => Alert.alert("View Profile", item.name)}
                    >
                      <Text style={styles.viewProfileBtnText}>
                        View Profile
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              ListEmptyComponent={() => (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>
                    No student records match the selected filters.
                  </Text>
                </View>
              )}
              scrollEnabled={false}
            />
          </View>

          {/* Pagination */}
          <View style={styles.paginationContainer}>
            <Text style={styles.paginationInfo}>
              Showing {filteredStudents.length} of {students.length} entries
            </Text>
            <View style={styles.paginationButtons}>
              <TouchableOpacity style={styles.paginationButton}>
                <Icon name="chevron-left" size={20} color="#6B7280" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.paginationButton, styles.paginationButtonActive]}
              >
                <Text style={styles.paginationButtonActiveText}>1</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.paginationButton}>
                <Text style={styles.paginationButtonText}>2</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.paginationButton}>
                <Text style={styles.paginationButtonText}>3</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.paginationButton}>
                <Icon name="chevron-right" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Filter Modals */}
        <FilterPickerModal
          visible={showGradePicker}
          onClose={() => setShowGradePicker(false)}
          items={gradeGroups}
          selected={gradeFilter}
          onSelect={setGradeFilter}
          title="Select Grade"
        />

        <FilterPickerModal
          visible={showPerformancePicker}
          onClose={() => setShowPerformancePicker(false)}
          items={performanceOptions}
          selected={performanceFilter}
          onSelect={setPerformanceFilter}
          title="Select Performance"
        />

        <FilterPickerModal
          visible={showSchoolPicker}
          onClose={() => setShowSchoolPicker(false)}
          items={schoolOptions}
          selected={schoolFilter}
          onSelect={setSchoolFilter}
          title="Select School"
        />

        {/* Add Student Modal */}
        <Modal
          visible={showAddModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowAddModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.addModalContent}>
              <View style={styles.addModalHeader}>
                <Text style={styles.addModalTitle}>Add New Student Record</Text>
                <TouchableOpacity onPress={() => setShowAddModal(false)}>
                  <Icon name="close" size={24} color="#64748b" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.formContainer}>
                <View>
                  <Text style={styles.formLabel}>Student Full Name *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. Aarav Kumar"
                    placeholderTextColor="#9ca3af"
                    value={newStudentName}
                    onChangeText={setNewStudentName}
                  />
                </View>

                <View>
                  <Text style={styles.formLabel}>Student ID (Optional)</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. STU-2026-101 (Leave blank to auto-generate)"
                    placeholderTextColor="#9ca3af"
                    value={newStudentId}
                    onChangeText={setNewStudentId}
                  />
                </View>

                <View>
                  <Text style={styles.formLabel}>Partner School Linkage *</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={newStudentSchool}
                      onValueChange={(itemValue) =>
                        setNewStudentSchool(itemValue)
                      }
                      style={styles.picker}
                    >
                      <Picker.Item label="Select partner school..." value="" />
                      {DEFAULT_SCHOOLS.map((sch) => (
                        <Picker.Item
                          key={sch.name}
                          label={sch.name}
                          value={sch.name}
                        />
                      ))}
                    </Picker>
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={styles.halfField}>
                    <Text style={styles.formLabel}>Grade Group</Text>
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={newStudentGradeGroup}
                        onValueChange={(itemValue) =>
                          setNewStudentGradeGroup(itemValue)
                        }
                        style={styles.picker}
                      >
                        <Picker.Item
                          label="Primary (1-5)"
                          value="Primary (1-5)"
                        />
                        <Picker.Item
                          label="Middle (6-8)"
                          value="Middle (6-8)"
                        />
                        <Picker.Item label="High (9-10)" value="High (9-10)" />
                      </Picker>
                    </View>
                  </View>
                  <View style={styles.halfField}>
                    <Text style={styles.formLabel}>Specific Grade</Text>
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={newStudentGrade}
                        onValueChange={(itemValue) =>
                          setNewStudentGrade(itemValue)
                        }
                        style={styles.picker}
                      >
                        {Array.from(
                          { length: 10 },
                          (_, i) => `Grade ${i + 1}`,
                        ).map((g) => (
                          <Picker.Item key={g} label={g} value={g} />
                        ))}
                      </Picker>
                    </View>
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={styles.halfField}>
                    <Text style={styles.formLabel}>Attendance (%) *</Text>
                    <TextInput
                      style={styles.formInput}
                      keyboardType="numeric"
                      placeholder="e.g. 95"
                      placeholderTextColor="#9ca3af"
                      value={newStudentAttendance}
                      onChangeText={setNewStudentAttendance}
                    />
                  </View>
                  <View style={styles.halfField}>
                    <Text style={styles.formLabel}>Academic Status</Text>
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={newStudentStatus}
                        onValueChange={(itemValue) =>
                          setNewStudentStatus(itemValue)
                        }
                        style={styles.picker}
                      >
                        <Picker.Item label="On Track" value="On Track" />
                        <Picker.Item
                          label="Satisfactory"
                          value="Satisfactory"
                        />
                        <Picker.Item
                          label="Needs Attention"
                          value="Needs Attention"
                        />
                        <Picker.Item label="Excelling" value="Excelling" />
                      </Picker>
                    </View>
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
                    onPress={handleAddStudent}
                    style={styles.submitButton}
                  >
                    <Text style={styles.submitButtonText}>Add Student</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  // Sidebar styles
  sidebar: {
    position: "absolute",
    width: width * 0.7,
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
    marginBottom: 30,
  },
  brandIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#047857",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 50,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#065f46",
    marginTop: 50,
  },
  brandSub: {
    fontSize: 12,
    color: "#6b7280",
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
  },
  dropdownItemActive: {
    backgroundColor: "#e8f5e9",
    borderRadius: 8,
  },
  dropdownItemLogout: {
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    marginTop: 4,
    paddingTop: 12,
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
  dropdownTextLogout: {
    color: "#ef4444",
  },
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
  // Main container
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
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
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuButton: {
    padding: 8,
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
  iconButton: {
    padding: 8,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  backLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
    marginTop: 8,
  },
  backLinkText: {
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#64748b",
  },
  headerSection: {
    marginBottom: 24,
  },
  mainTitle: {
    fontSize: 32,
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
  actionBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    flexWrap: "wrap",
    gap: 12,
  },
  searchContainer: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 999,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 14,
    color: "#0f172a",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#F3F4F6",
    borderRadius: 999,
  },
  exportButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#374151",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#059669",
    borderRadius: 999,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
  },
  statsFiltersContainer: {
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statTitle: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: "#64748b",
    fontWeight: "600",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "900",
    color: "#0f172a",
    marginBottom: 8,
  },
  trendContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  trendText: {
    fontSize: 11,
    color: "#059669",
    fontWeight: "500",
  },
  filtersContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filtersLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: "#64748b",
    fontWeight: "600",
    marginBottom: 12,
  },
  filterScroll: {
    flexDirection: "row",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  filterButtonText: {
    fontSize: 13,
    color: "#374151",
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearButtonText: {
    fontSize: 13,
    color: "#059669",
    fontWeight: "500",
  },
  tableContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F9FAFB",
    borderBottomWidth: 1,
    borderBottomColor: "#EDEEEF",
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  headerCell: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: "#6B7280",
  },
  studentInfoCell: {
    flex: 2.2,
    paddingLeft: 8,
  },
  schoolCell: {
    flex: 2,
    paddingLeft: 8,
  },
  progressCell: {
    flex: 1.8,
    paddingLeft: 8,
  },
  actionsCell: {
    flex: 1,
    textAlign: "right",
    paddingRight: 16,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingVertical: 16,
    paddingHorizontal: 12,
    minHeight: 90,
  },
  rowCell: {
    justifyContent: "center",
  },
  studentInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  studentTextContainer: {
    flex: 1,
  },
  initialsCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  initialsCircleText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#065f46",
  },
  studentNameText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 2,
  },
  studentIdText: {
    fontSize: 11,
    color: "#6B7280",
  },
  schoolNameText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#0f172a",
    marginBottom: 4,
    lineHeight: 18,
  },
  gradeText: {
    fontSize: 11,
    color: "#6B7280",
  },
  attendanceContainer: {
    width: "100%",
  },
  attendanceHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  attendanceLabelText: {
    fontSize: 11,
    color: "#6B7280",
  },
  attendancePercentText: {
    fontSize: 11,
    fontWeight: "600",
  },
  progressBarWrapper: {
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 10,
    position: "relative",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressGlow: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: "rgba(255,255,255,0.5)",
    borderRadius: 2,
  },
  statusBadgeWrapper: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: "#065f46",
  },
  viewProfileBtn: {
    alignSelf: "flex-end",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#F0FDF4",
    borderRadius: 20,
  },
  viewProfileBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#059669",
  },
  emptyState: {
    padding: 48,
    alignItems: "center",
  },
  emptyStateText: {
    color: "#9ca3af",
    textAlign: "center",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#EDEEEF",
    marginTop: 8,
  },
  paginationInfo: {
    fontSize: 12,
    color: "#6B7280",
  },
  paginationButtons: {
    flexDirection: "row",
    gap: 8,
  },
  paginationButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
  },
  paginationButtonActive: {
    backgroundColor: "#059669",
  },
  paginationButtonActiveText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  paginationButtonText: {
    color: "#374151",
    fontWeight: "500",
    fontSize: 14,
  },
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
    maxHeight: "90%",
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
  formContainer: {
    gap: 16,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    color: "#64748b",
    marginBottom: 6,
  },
  formInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
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
    height: 44,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
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
  cancelButtonText: {
    color: "#0f172a",
  },
  submitButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#059669",
  },
  submitButtonText: {
    color: "white",
    fontWeight: "600",
  },
});

export default StudentsModule;
