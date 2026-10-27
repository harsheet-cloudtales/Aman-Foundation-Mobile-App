// AfterSchoolStudentsModule.tsx
import { RouteGuard } from "@/components/RouteGuard";
import { useAuth } from "@/lib/useAuth";
import { getUserRole, UserRole } from "@/utils/permissions";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  Keyboard,
  Modal,
  Platform,
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
  surface: "#f8f9fa",
  surfaceContainerLowest: "#ffffff",
  onSurface: "#191c1d",
  onSurfaceVariant: "#3d4945",
  outlineVariant: "#bccac4",
  rose: "#ef4444",
  emerald: "#059669",
  emeraldDark: "#047857",
};

const ITEMS_PER_PAGE = 10;

type Student = {
  id: string;
  studentId: string;
  name: string;
  grade?: string;
  gradeGroup?: string;
  attendance: number;
  status: string;
  district?: string;
  centre?: { id: string; name: string; location?: string };
};

type Centre = { id: string; name: string };
type Fellow = { id: string; name: string };

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

export default function AfterSchoolStudentsModule() {
  const router = useRouter();
  const { user, token, logout: authLogout } = useAuth();
  const currentRole = getUserRole(user);
  const isFellowUser = currentRole === UserRole.FELLOW;
  const hasFullAccess = !isFellowUser;

  // ============ DATA STATE ============
  const [searchQuery, setSearchQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState("All Grades");
  const [performanceFilter, setPerformanceFilter] = useState("All Performance");
  const [centreFilter, setCentreFilter] = useState("All Centres");
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [students, setStudents] = useState<Student[]>([]);
  const [centres, setCentres] = useState<Centre[]>([]);

  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentId, setNewStudentId] = useState("");
  const [newStudentCentre, setNewStudentCentre] = useState("");
  const [newStudentFellow, setNewStudentFellow] = useState("");
  const [centreFellows, setCentreFellows] = useState<Fellow[]>([]);
  const [newStudentGrade, setNewStudentGrade] = useState("");
  const [newStudentGradeGroup, setNewStudentGradeGroup] = useState("");
  const [newStudentAttendance, setNewStudentAttendance] = useState("");
  const [newStudentStatus, setNewStudentStatus] = useState("On Track");
  const [loading, setLoading] = useState(false);

  // ============ HEADER SEARCH STATE ============
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [headerSearchQuery, setHeaderSearchQuery] = useState("");
  const expandAnim = useRef(new Animated.Value(0)).current;
  const dropdownAnim = useRef(new Animated.Value(0)).current;

  // ============ SIDEBAR STATE ============
  const [menuOpen, setMenuOpen] = useState(false);
  const [educationDropdownOpen, setEducationDropdownOpen] = useState(false);
  const [reportsDropdownOpen, setReportsDropdownOpen] = useState(false);
  const [livelihoodDropdownOpen, setLivelihoodDropdownOpen] = useState(false);
  const [authDropdownOpen, setAuthDropdownOpen] = useState(false);

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

  // ============ SIDEBAR CONTROLS ============
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
        onPress: async () => {
          await authLogout();
          router.replace("/login");
        },
      },
    ]);
  };

  // ============ DATA FETCHING ============
  useEffect(() => {
    async function loadData() {
      try {
        const headers: Record<string, string> = token
          ? { Authorization: `Bearer ${token}` }
          : {};
        const [studRes, centreRes] = await Promise.all([
          fetch("/api/after-school-students", { headers }),
          fetch("/api/after-school-centres", { headers }),
        ]);
        const studJson = await studRes.json();
        const centreJson = await centreRes.json();
        if (studJson.success) setStudents(studJson.data);
        if (centreJson.success) setCentres(centreJson.data);
      } catch (err) {
        console.error("Failed to load data:", err);
      }
    }
    loadData();
  }, [token]);

  const handleAddStudent = async () => {
    if (!newStudentName || !newStudentCentre || !newStudentAttendance) {
      Alert.alert("Missing Fields", "Please fill in all required fields.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/after-school-students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          studentId:
            newStudentId ||
            `AST-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          name: newStudentName,
          centreId: newStudentCentre,
          fellowId: newStudentFellow || undefined,
          grade: newStudentGrade || null,
          gradeGroup: newStudentGradeGroup || null,
          attendance: parseFloat(newStudentAttendance),
          status: newStudentStatus,
        }),
      });
      const json = await res.json();
      if (json.success) {
        const loadRes = await fetch("/api/after-school-students", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const loadJson = await loadRes.json();
        if (loadJson.success) setStudents(loadJson.data);

        setNewStudentName("");
        setNewStudentId("");
        setNewStudentCentre("");
        setNewStudentFellow("");
        setCentreFellows([]);
        setNewStudentGrade("");
        setNewStudentGradeGroup("");
        setNewStudentAttendance("");
        setNewStudentStatus("On Track");
        setShowAddModal(false);
      } else {
        Alert.alert("Error", json.error || "Failed to add student");
      }
    } catch (err) {
      console.error("Failed to add student:", err);
      Alert.alert("Error", "Failed to add student");
    } finally {
      setLoading(false);
    }
  };

  const handleCentreChange = async (centreId: string) => {
    setNewStudentCentre(centreId);
    setNewStudentFellow("");
    setCentreFellows([]);
    if (!centreId) return;
    try {
      const headers: Record<string, string> = token
        ? { Authorization: `Bearer ${token}` }
        : {};
      const res = await fetch(`/api/after-school-centres/${centreId}/fellows`, {
        headers,
      });
      const json = await res.json();
      if (json.success) setCentreFellows(json.data);
    } catch (err) {
      console.error("Failed to load centre fellows:", err);
    }
  };

  const clearFilters = () => {
    setGradeFilter("All Grades");
    setPerformanceFilter("All Performance");
    setCentreFilter("All Centres");
    setSearchQuery("");
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2) || "ST";
  const getAvatarColor = (name: string) => {
    const palette = ["#0f766e", "#7c3aed", "#c2410c", "#334155"];
    return palette[name.length % palette.length];
  };
  const getAttendanceColor = (attendance: number) => {
    const att = attendance || 0;
    if (att > 85) return "#006857";
    if (att > 70) return "#6b7280";
    return "#b3261e";
  };
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "On Track":
      case "Excelling":
        return { bg: "#d0f5ea", text: "#003c30" };
      case "Needs Attention":
        return { bg: "#ffdad6", text: "#93000a" };
      default:
        return { bg: "#e5e7eb", text: "#374151" };
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.centre &&
          s.centre.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
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
      const matchesCentre =
        centreFilter === "All Centres" ||
        (s.centre && s.centre.id === centreFilter);
      return (
        matchesSearch && matchesGrade && matchesPerformance && matchesCentre
      );
    });
  }, [students, searchQuery, gradeFilter, performanceFilter, centreFilter]);

  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, gradeFilter, performanceFilter, centreFilter]);

  const renderStudent = ({ item: s }: { item: Student }) => {
    const initials = getInitials(s.name);
    const bgColor = getAvatarColor(s.name);
    const attColor = getAttendanceColor(s.attendance);
    const statusStyle = getStatusStyle(s.status);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.avatar, { backgroundColor: bgColor }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.studentName}>{s.name}</Text>
            <Text style={styles.studentMeta}>ID: {s.studentId}</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.row}>
            <Text style={styles.label}>Centre</Text>
            <Text style={styles.value}>
              {s.centre ? s.centre.name : "Unassigned"}
            </Text>
          </View>
          <Text style={styles.subMeta}>
            {s.grade || s.gradeGroup || "—"} •{" "}
            {s.district || s.centre?.location || "Community Learning Centre"}
          </Text>

          <View style={{ marginTop: 12 }}>
            <View style={styles.row}>
              <Text style={styles.label}>Attendance</Text>
              <Text style={[styles.value, { color: attColor }]}>
                {s.attendance}%
              </Text>
            </View>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${Math.min(s.attendance, 100)}%`,
                    backgroundColor: attColor,
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.cardFooter}>
            <View
              style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}
            >
              <Text style={[styles.statusText, { color: statusStyle.text }]}>
                {s.status}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/student-profile",
                  params: { name: s.name.replace(/\s+/g, "-") },
                })
              }
            >
              <Text style={styles.viewProfile}>View Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

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
            SIDEBAR
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
                      After-School-Students
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => handleNavigation("/after-school-centres")}
                  >
                    <Ionicons
                      name="business-outline"
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

            {hasFullAccess && (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleNavigation("/disaster_relief_management")}
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons name="snow-outline" size={20} color="#4b5563" />
                  <Text style={styles.menuText}>Disaster Relief</Text>
                </View>
              </TouchableOpacity>
            )}

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
              onPress={() => handleNavigation("/travel")}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons name="airplane" size={20} color="#4b5563" />
                <Text style={styles.menuText}>Travel Management</Text>
              </View>
            </TouchableOpacity>

            {hasFullAccess && (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleNavigation("/hr_employee_management")}
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons name="people-outline" size={20} color="#4b5563" />
                  <Text style={styles.menuText}>HR Management</Text>
                </View>
              </TouchableOpacity>
            )}

            {hasFullAccess && (
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
            )}

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
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <TouchableOpacity
              style={styles.backLink}
              onPress={() => router.push("/")}
            >
              <Text style={styles.backLinkText}>← Back to Education Hub</Text>
            </TouchableOpacity>

            <Text style={styles.title}>After School Students Directory</Text>
            <Text style={styles.subtitle}>
              Manage after school learners, track attendance and academic
              progress across community learning centres.
            </Text>

            <View style={styles.searchRow}>
              <Ionicons
                name="search-outline"
                size={18}
                color="#9ca3af"
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search students..."
                placeholderTextColor="#9ca3af"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.secondaryBtn}>
                <Ionicons name="download-outline" size={16} color="#191c1d" />
                <Text style={styles.secondaryBtnText}>Export</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => setShowAddModal(true)}
              >
                <Ionicons name="add" size={16} color="#fff" />
                <Text style={styles.primaryBtnText}>Add Student</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.statsCard}>
              <Text style={styles.statsLabel}>Total Enrolled</Text>
              <Text style={styles.statsValue}>{students.length}</Text>
              <Text style={styles.statsHint}>Across all learning centres</Text>
            </View>

            {/* FILTERS */}
            <View style={styles.filtersCard}>
              <Text style={styles.filtersLabel}>Filters</Text>

              <Text style={styles.pickerLabel}>Grade</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={gradeFilter}
                  onValueChange={(v) => setGradeFilter(v)}
                  style={styles.picker}
                  dropdownIconColor="#6b7280"
                >
                  <Picker.Item label="All Grades" value="All Grades" />
                  <Picker.Item label="Primary (1-5)" value="Primary (1-5)" />
                  <Picker.Item label="Middle (6-8)" value="Middle (6-8)" />
                  <Picker.Item label="High (9-10)" value="High (9-10)" />
                </Picker>
              </View>

              <Text style={styles.pickerLabel}>Performance</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={performanceFilter}
                  onValueChange={(v) => setPerformanceFilter(v)}
                  style={styles.picker}
                  dropdownIconColor="#6b7280"
                >
                  <Picker.Item
                    label="All Performance"
                    value="All Performance"
                  />
                  <Picker.Item label="Excellent" value="Excellent" />
                  <Picker.Item label="Satisfactory" value="Satisfactory" />
                  <Picker.Item
                    label="Needs Attention"
                    value="Needs Attention"
                  />
                </Picker>
              </View>

              <Text style={styles.pickerLabel}>Centre</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={centreFilter}
                  onValueChange={(v) => setCentreFilter(v)}
                  style={styles.picker}
                  dropdownIconColor="#6b7280"
                >
                  <Picker.Item label="All Centres" value="All Centres" />
                  {centres.map((c) => (
                    <Picker.Item key={c.id} label={c.name} value={c.id} />
                  ))}
                </Picker>
              </View>

              <TouchableOpacity
                onPress={clearFilters}
                style={styles.clearFiltersWrap}
              >
                <Text style={styles.clearFilters}>Clear Filters</Text>
              </TouchableOpacity>
            </View>

            {/* Students List */}
            {paginatedStudents.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  No student records match the selected filters.
                </Text>
              </View>
            ) : (
              paginatedStudents.map((s) => (
                <View key={s.id}>{renderStudent({ item: s })}</View>
              ))
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <View style={styles.pagination}>
                <Text style={styles.paginationInfo}>
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                  {Math.min(
                    currentPage * ITEMS_PER_PAGE,
                    filteredStudents.length,
                  )}{" "}
                  of {filteredStudents.length}
                </Text>
                <View style={styles.paginationControls}>
                  <TouchableOpacity
                    disabled={currentPage === 1}
                    onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    style={[
                      styles.pageBtn,
                      currentPage === 1 && styles.pageBtnDisabled,
                    ]}
                  >
                    <Text style={styles.pageBtnText}>Prev</Text>
                  </TouchableOpacity>
                  <Text style={styles.pageIndicator}>
                    {currentPage} / {totalPages}
                  </Text>
                  <TouchableOpacity
                    disabled={currentPage === totalPages}
                    onPress={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    style={[
                      styles.pageBtn,
                      currentPage === totalPages && styles.pageBtnDisabled,
                    ]}
                  >
                    <Text style={styles.pageBtnText}>Next</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <Footer />
          </ScrollView>
        </SafeAreaView>

        {/* ADD STUDENT MODAL */}
        <Modal
          visible={showAddModal}
          animationType="slide"
          transparent
          onRequestClose={() => setShowAddModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    Add New After School Student
                  </Text>
                  <TouchableOpacity onPress={() => setShowAddModal(false)}>
                    <Text style={styles.modalClose}>✕</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.inputLabel}>Student Full Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Aarav Kumar"
                  placeholderTextColor="#9ca3af"
                  value={newStudentName}
                  onChangeText={setNewStudentName}
                />

                <Text style={styles.inputLabel}>Student ID (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Leave blank to auto-generate"
                  placeholderTextColor="#9ca3af"
                  value={newStudentId}
                  onChangeText={setNewStudentId}
                />

                <Text style={styles.inputLabel}>Centre *</Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={newStudentCentre}
                    onValueChange={(v) => handleCentreChange(v)}
                    style={styles.picker}
                    dropdownIconColor="#6b7280"
                  >
                    <Picker.Item
                      label="Select community learning centre..."
                      value=""
                    />
                    {centres.map((c) => (
                      <Picker.Item key={c.id} label={c.name} value={c.id} />
                    ))}
                  </Picker>
                </View>

                <Text style={styles.inputLabel}>
                  Assign under Fellow (Optional)
                </Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    enabled={!!newStudentCentre}
                    selectedValue={newStudentFellow}
                    onValueChange={(v) => setNewStudentFellow(v)}
                    style={styles.picker}
                    dropdownIconColor="#6b7280"
                  >
                    <Picker.Item
                      label={
                        newStudentCentre
                          ? "Select fellow..."
                          : "Select a centre first"
                      }
                      value=""
                    />
                    {centreFellows.map((f) => (
                      <Picker.Item key={f.id} label={f.name} value={f.id} />
                    ))}
                  </Picker>
                </View>

                <Text style={styles.inputLabel}>Grade Group</Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={newStudentGradeGroup}
                    onValueChange={(v) => setNewStudentGradeGroup(v)}
                    style={styles.picker}
                    dropdownIconColor="#6b7280"
                  >
                    <Picker.Item label="Not applicable" value="" />
                    <Picker.Item label="Primary (1-5)" value="Primary (1-5)" />
                    <Picker.Item label="Middle (6-8)" value="Middle (6-8)" />
                    <Picker.Item label="High (9-10)" value="High (9-10)" />
                  </Picker>
                </View>

                <Text style={styles.inputLabel}>Specific Grade (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Grade 6"
                  placeholderTextColor="#9ca3af"
                  value={newStudentGrade}
                  onChangeText={setNewStudentGrade}
                />

                <Text style={styles.inputLabel}>Attendance (%) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 95"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                  value={newStudentAttendance}
                  onChangeText={setNewStudentAttendance}
                />

                <Text style={styles.inputLabel}>Academic Status</Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={newStudentStatus}
                    onValueChange={(v) => setNewStudentStatus(v)}
                    style={styles.picker}
                    dropdownIconColor="#6b7280"
                  >
                    <Picker.Item label="On Track" value="On Track" />
                    <Picker.Item label="Satisfactory" value="Satisfactory" />
                    <Picker.Item
                      label="Needs Attention"
                      value="Needs Attention"
                    />
                    <Picker.Item label="Excelling" value="Excelling" />
                  </Picker>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => setShowAddModal(false)}
                  >
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.submitBtn}
                    onPress={handleAddStudent}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.submitBtnText}>Add Student</Text>
                    )}
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
  // Sidebar Styles
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

  // Header & Search Styles
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

  // Main Content Styles
  scrollContent: { padding: 16, paddingBottom: 80 },
  backLink: { marginBottom: 16 },
  backLinkText: {
    color: "#0f766e",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },
  title: { fontSize: 26, fontWeight: "800", color: "#191c1d", marginBottom: 6 },
  subtitle: { fontSize: 14, color: "#4b5563", marginBottom: 16 },

  searchRow: {
    marginBottom: 12,
    position: "relative",
    justifyContent: "center",
  },
  searchIcon: { position: "absolute", left: 16, zIndex: 1 },
  searchInput: {
    backgroundColor: "#eef2f1",
    borderRadius: 999,
    paddingLeft: 42,
    paddingRight: 16,
    paddingVertical: Platform.OS === "ios" ? 12 : 10,
    fontSize: 14,
    color: "#191c1d",
  },

  actionRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  secondaryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#eef2f1",
    paddingVertical: 12,
    borderRadius: 999,
  },
  secondaryBtnText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    color: "#191c1d",
  },
  primaryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#006857",
    paddingVertical: 12,
    borderRadius: 999,
  },
  primaryBtnText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    color: "#fff",
  },

  statsCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  statsLabel: {
    fontSize: 10,
    letterSpacing: 2,
    color: "#6b7280",
    textTransform: "uppercase",
  },
  statsValue: {
    fontSize: 28,
    fontWeight: "900",
    color: "#191c1d",
    marginTop: 4,
  },
  statsHint: { fontSize: 12, color: "#006857", marginTop: 4 },

  filtersCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  filtersLabel: {
    fontSize: 10,
    letterSpacing: 2,
    color: "#9ca3af",
    textTransform: "uppercase",
    marginBottom: 12,
    fontWeight: "700",
  },
  pickerLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 10,
    marginBottom: 4,
    fontWeight: "500",
  },
  pickerWrapper: {
    backgroundColor: "#f1f3f4",
    borderRadius: 10,
    overflow: "hidden",
  },
  picker: {
    backgroundColor: "transparent",
    color: "#191c1d",
    height: Platform.OS === "ios" ? undefined : 48,
  },
  clearFiltersWrap: { alignSelf: "flex-end", marginTop: 14 },
  clearFilters: { color: "#006857", fontSize: 13, fontWeight: "700" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  studentName: { fontSize: 15, fontWeight: "700", color: "#191c1d" },
  studentMeta: { fontSize: 11, color: "#6b7280", marginTop: 2 },
  cardBody: { marginTop: 4 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: { fontSize: 12, color: "#6b7280", fontWeight: "600" },
  value: { fontSize: 13, color: "#191c1d", fontWeight: "600" },
  subMeta: { fontSize: 11, color: "#6b7280", marginTop: 2 },
  progressBarBg: {
    height: 6,
    backgroundColor: "#e5e7eb",
    borderRadius: 999,
    marginTop: 6,
    overflow: "hidden",
  },
  progressBarFill: { height: 6, borderRadius: 999 },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  statusText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  viewProfile: { color: "#006857", fontSize: 12, fontWeight: "700" },

  emptyState: { padding: 40, alignItems: "center" },
  emptyText: { color: "#9ca3af", fontSize: 13 },
  pagination: {
    marginTop: 8,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  paginationInfo: { fontSize: 11, color: "#6b7280", marginBottom: 8 },
  paginationControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pageBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 6,
  },
  pageBtnDisabled: { opacity: 0.4 },
  pageBtnText: { fontSize: 13, fontWeight: "600", color: "#191c1d" },
  pageIndicator: { fontSize: 13, fontWeight: "600", color: "#191c1d" },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 16,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: { fontSize: 17, fontWeight: "800", color: "#191c1d" },
  modalClose: { fontSize: 18, color: "#6b7280" },
  inputLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6b7280",
    textTransform: "uppercase",
    marginTop: 12,
    marginBottom: 4,
  },
  input: {
    backgroundColor: "#f1f3f4",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 12 : 10,
    fontSize: 14,
    color: "#191c1d",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 20,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  cancelBtnText: { fontSize: 13, fontWeight: "600", color: "#191c1d" },
  submitBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#006857",
  },
  submitBtnText: { fontSize: 13, fontWeight: "700", color: "#fff" },

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
