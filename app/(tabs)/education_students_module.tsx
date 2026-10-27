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
interface Student {
  id: string;
  initials: string;
  bgClass: string;
  name: string;
  studentId: string;
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
  email?: string;
  phone?: string;
  enrollmentDate?: string;
}

interface StudentResponse {
  id: string;
  name: string;
  email: string;
  school: string;
  grade: string;
  attendance: number;
  status: string;
  studentId?: string;
  phone?: string;
  enrollmentDate?: string;
}

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
    route: "/PM Reflection",
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
// MOCK SCHOOLS
// ============================================
const DEFAULT_SCHOOLS = [
  { name: "Oakridge Academy, Kalgachia" },
  { name: "Kalgachia Public School, Kalgachia" },
  { name: "Bartari Primary School, Bartari" },
  { name: "Digjani High School, Digjani" },
  { name: "Sawpur Elementary, Sawpur" },
];

// ============================================
// FOOTER COMPONENT  (from Dashboard)
// ============================================
const Footer = () => (
  <View style={styles.footer}>
    <View style={styles.footerLogoContainer}>
      <LinearGradient
        colors={["#006857", "#00846e"]}
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
const StudentsModule = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState("All Grades");
  const [performanceFilter, setPerformanceFilter] = useState("All Performance");
  const [schoolFilter, setSchoolFilter] = useState("All Schools");
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    excellent: 0,
    onTrack: 0,
    needsAttention: 0,
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

  // Filter picker states
  const [showGradePicker, setShowGradePicker] = useState(false);
  const [showPerformancePicker, setShowPerformancePicker] = useState(false);
  const [showSchoolPicker, setShowSchoolPicker] = useState(false);

  // Animated values
  const slideAnim = useRef(new Animated.Value(-width)).current;
  const educationRotateAnim = useRef(new Animated.Value(0)).current;
  const reportsRotateAnim = useRef(new Animated.Value(0)).current;
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
  // FETCH STUDENTS
  // ============================================
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await api.get<StudentResponse[]>("/api/students");

      if (data && data.length > 0) {
        const transformedStudents: Student[] = data.map((s) => {
          const att = s.attendance || 0;
          const attendanceColor =
            att > 85 ? "#059669" : att > 70 ? "#6B7280" : "#ea580c";
          const barColor =
            att > 85 ? "#059669" : att > 70 ? "#6B7280" : "#ea580c";
          const hasGlow = att > 90;

          const statusColors: { [key: string]: string } = {
            "On Track": "#d1fae5",
            Satisfactory: "#f3f4f6",
            "Needs Attention": "#fee2e2",
            Excelling: "#d1fae5",
          };

          const initials =
            s.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .substring(0, 2) || "ST";

          return {
            id: s.id,
            initials,
            bgClass: ["#d1fae5", "#fed7aa", "#ddd6fe", "#e5e7eb"][
              s.name.length % 4
            ],
            name: s.name,
            studentId: s.studentId || `STU-${Date.now().toString().slice(-6)}`,
            school: s.school || "Not Assigned",
            grade: s.grade || "Grade 1",
            gradeGroup: getGradeGroup(s.grade || "Grade 1"),
            district: s.school?.split(",")[0]?.trim() || "Unknown",
            attendance: att,
            attendanceColor,
            barColor,
            hasGlow,
            status: s.status || "On Track",
            statusClass: statusColors[s.status || "On Track"] || "#f3f4f6",
            email: s.email,
            phone: s.phone,
            enrollmentDate: s.enrollmentDate,
          };
        });

        setStudents(transformedStudents);
        updateStats(transformedStudents);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        console.error("Students fetch error:", err.message);
      }
      // Fallback data
      const fallbackStudents: Student[] = [
        {
          initials: "AK",
          bgClass: "#d1fae5",
          name: "Aarav Kumar",
          id: "1",
          studentId: "STU-2026-001",
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
          id: "2",
          studentId: "STU-2026-002",
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
          id: "3",
          studentId: "STU-2026-003",
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
          id: "4",
          studentId: "STU-2026-004",
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
      setStudents(fallbackStudents);
      updateStats(fallbackStudents);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getGradeGroup = (grade: string) => {
    const num = parseInt(grade.split(" ")[1]);
    if (num <= 5) return "Primary (1-5)";
    if (num <= 8) return "Middle (6-8)";
    return "High (9-10)";
  };

  const updateStats = (studentList: Student[]) => {
    setStats({
      total: studentList.length,
      excellent: studentList.filter((s) => s.status === "Excelling").length,
      onTrack: studentList.filter(
        (s) => s.status === "On Track" || s.status === "Satisfactory",
      ).length,
      needsAttention: studentList.filter((s) => s.status === "Needs Attention")
        .length,
    });
  };

  useEffect(() => {
    fetchStudents();
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

  const handleNavigation = (route: string) => {
    closeMenu();
    setTimeout(() => {
      router.push(route as any);
    }, 150);
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
  const handleAddStudent = async () => {
    if (!newStudentName || !newStudentSchool || !newStudentAttendance) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    try {
      const newStudentData = {
        name: newStudentName,
        school: newStudentSchool,
        grade: newStudentGrade,
        attendance: parseInt(newStudentAttendance),
        status: newStudentStatus,
        studentId: newStudentId || undefined,
      };

      const response = await api.post("/api/students", newStudentData);

      if (response) {
        Alert.alert("Success", "Student added successfully");
        setNewStudentName("");
        setNewStudentId("");
        setNewStudentSchool("");
        setNewStudentGrade("Grade 8");
        setNewStudentGradeGroup("Middle (6-8)");
        setNewStudentAttendance("");
        setNewStudentStatus("On Track");
        setShowAddModal(false);
        fetchStudents();
      }
    } catch (err) {
      if (err instanceof ApiError) {
        Alert.alert("Error", err.message);
      }
    }
  };

  const handleDeleteStudent = (id: string, name: string) => {
    Alert.alert("Delete Student", `Are you sure you want to delete ${name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.del(`/api/students/${id}`);
            Alert.alert("Success", "Student deleted successfully");
            fetchStudents();
          } catch (err) {
            if (err instanceof ApiError) {
              Alert.alert("Error", err.message);
            }
          }
        },
      },
    ]);
  };

  const clearFilters = () => {
    setGradeFilter("All Grades");
    setPerformanceFilter("All Performance");
    setSchoolFilter("All Schools");
    setSearchQuery("");
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchStudents();
  };

  // ============================================
  // FILTERS
  // ============================================
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.school.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchQuery.toLowerCase());

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

  // ============================================
  // LOADING STATE
  // ============================================
  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#059669" />
        <Text style={styles.loadingText}>Loading students...</Text>
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

                  {/* ACTIVE — Students Directory */}
                  <TouchableOpacity
                    style={[styles.dropdownItem, styles.dropdownItemActive]}
                    onPress={() => closeMenu()}
                  >
                    <Ionicons name="people-outline" size={18} color="#047857" />
                    <Text
                      style={[styles.dropdownText, styles.dropdownTextActive]}
                    >
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

            {/* FELLOW OBERVATION (top-level dropdown) */}
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
                  <Text style={styles.menuText}>Fellow Obervation</Text>
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
                    onPress={() => handleNavigation("/PM Reflection")}
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
              <View style={styles.statsGrid}>
                <View style={[styles.statCard, styles.statCardGreen]}>
                  <Text style={[styles.statTitle, styles.statTitleWhite]}>
                    Total
                  </Text>
                  <Text style={[styles.statValue, styles.statValueWhite]}>
                    {stats.total}
                  </Text>
                </View>
                <View style={[styles.statCard, styles.statCardBlue]}>
                  <Text style={[styles.statTitle, styles.statTitleWhite]}>
                    Excellent
                  </Text>
                  <Text style={[styles.statValue, styles.statValueWhite]}>
                    {stats.excellent}
                  </Text>
                </View>
                <View style={[styles.statCard, styles.statCardOrange]}>
                  <Text style={[styles.statTitle, styles.statTitleWhite]}>
                    On Track
                  </Text>
                  <Text style={[styles.statValue, styles.statValueWhite]}>
                    {stats.onTrack}
                  </Text>
                </View>
                <View style={[styles.statCard, styles.statCardRed]}>
                  <Text style={[styles.statTitle, styles.statTitleWhite]}>
                    Needs Attention
                  </Text>
                  <Text style={[styles.statValue, styles.statValueWhite]}>
                    {stats.needsAttention}
                  </Text>
                </View>
              </View>

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

            {/* Students Table */}
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
                          <Text style={styles.studentNameText}>
                            {item.name}
                          </Text>
                          <Text style={styles.studentIdText}>
                            ID: {item.studentId}
                          </Text>
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
                      <View style={styles.actionButtonsContainer}>
                        <TouchableOpacity
                          style={styles.viewProfileBtn}
                          onPress={() => Alert.alert("View Profile", item.name)}
                        >
                          <Text style={styles.viewProfileBtnText}>
                            View Profile
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() =>
                            handleDeleteStudent(item.id, item.name)
                          }
                          style={styles.deleteBtn}
                        >
                          <Icon
                            name="delete-outline"
                            size={20}
                            color="#ef4444"
                          />
                        </TouchableOpacity>
                      </View>
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
                  style={[
                    styles.paginationButton,
                    styles.paginationButtonActive,
                  ]}
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

            {/* Footer — from Dashboard */}
            <Footer />
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
                  <Text style={styles.addModalTitle}>
                    Add New Student Record
                  </Text>
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
                    <Text style={styles.formLabel}>
                      Partner School Linkage *
                    </Text>
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={newStudentSchool}
                        onValueChange={(itemValue) =>
                          setNewStudentSchool(itemValue)
                        }
                        style={styles.picker}
                      >
                        <Picker.Item
                          label="Select partner school..."
                          value=""
                        />
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
                          <Picker.Item
                            label="High (9-10)"
                            value="High (9-10)"
                          />
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
    </RouteGuard>
  );
};

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  // 1. LOADING & SIDEBAR
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748b",
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
    justifyContent: "space-between",
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

  // 2. HEADER & EXPANDING SEARCH
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
    color: "#059669",
  },

  // 3. SEARCH DROPDOWN OVERLAY (70% HEIGHT)
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

  // 4. MAIN CONTENT
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

  // 5. ACTION BAR & STATS
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
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statCardGreen: {
    backgroundColor: "#059669",
  },
  statCardBlue: {
    backgroundColor: "#3b82f6",
  },
  statCardOrange: {
    backgroundColor: "#f59e0b",
  },
  statCardRed: {
    backgroundColor: "#ef4444",
  },
  statTitle: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: "#64748b",
    fontWeight: "600",
    marginBottom: 4,
  },
  statTitleWhite: {
    color: "rgba(255,255,255,0.8)",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "900",
    color: "#0f172a",
  },
  statValueWhite: {
    color: "#ffffff",
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

  // 6. TABLE
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
    flex: 1.2,
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
  actionButtonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  deleteBtn: {
    padding: 8,
  },
  emptyState: {
    padding: 48,
    alignItems: "center",
  },
  emptyStateText: {
    color: "#9ca3af",
    textAlign: "center",
  },

  // 7. PAGINATION
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

  // 8. MODALS
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

  // ============================================
  // 9. FOOTER  (from Dashboard)
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

export default StudentsModule;
