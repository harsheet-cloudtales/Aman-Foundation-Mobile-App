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
interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  status: string;
  attendance: string;
  leavesUsed: number;
  sopSigned: boolean;
  email: string;
  userId?: string;
}

interface AttendanceLog {
  id: string;
  email: string;
  status: string;
  statusType: string;
  workHours: string;
  loginTime: string;
  tasks: string;
  lastUpdated: string;
}

interface LeaveRequest {
  id: string;
  coach: string;
  type: string;
  requestedDates: string;
  leavesTaken: number;
  leavesRemaining: number;
  status: string;
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
  emerald: "#10b981",
  rose: "#ef4444",
  amber: "#f59e0b",
  blue: "#3b82f6",
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
export default function HrEmployeeManagement() {
  const { user } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState("Team Directory");

  // Dropdown states
  const [educationDropdownOpen, setEducationDropdownOpen] = useState(false);
  const [livelihoodDropdownOpen, setLivelihoodDropdownOpen] = useState(false);
  const [authDropdownOpen, setAuthDropdownOpen] = useState(false);

  // Animated values
  const slideAnim = useRef(new Animated.Value(-width)).current;
  const educationRotateAnim = useRef(new Animated.Value(0)).current;
  const livelihoodRotateAnim = useRef(new Animated.Value(0)).current;
  const authRotateAnim = useRef(new Animated.Value(0)).current;

  // Data states
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([]);
  const [leaveApprovals, setLeaveApprovals] = useState<LeaveRequest[]>([]);

  // Filter states
  const [directorySearch, setDirectorySearch] = useState("");
  const [directoryDept, setDirectoryDept] = useState("All");
  const [directoryStatus, setDirectoryStatus] = useState("All");
  const [leaveSearch, setLeaveSearch] = useState("");
  const [leaveStatusFilter, setLeaveStatusFilter] = useState("ALL");

  // Form states
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newDept, setNewDept] = useState("Operations");
  const [newStatus, setNewStatus] = useState("In Office");

  // ============================================
  // FETCH DATA
  // ============================================
  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch users (employees)
      const usersData = await api.get("/api/users");
      if (usersData && usersData.data) {
        const transformedEmployees: Employee[] = usersData.data.map(
          (u: any) => ({
            id: u.id || `EMP-${Math.floor(100 + Math.random() * 900)}`,
            name: u.name || "Unknown",
            role: u.roleName || "Staff",
            department: u.department || "Operations",
            status: u.status === "ACTIVE" ? "In Office" : "On Leave",
            attendance: u.lastLogin || "Not checked-in",
            leavesUsed: u.leavesUsed || 0,
            sopSigned: u.sopSigned || false,
            email: u.email || "",
            userId: u.id,
          }),
        );
        setEmployees(transformedEmployees);
      }

      // Fetch attendance
      const attendanceData = await api.get("/api/attendance");
      if (attendanceData && attendanceData.data) {
        const transformedAttendance: AttendanceLog[] = attendanceData.data.map(
          (a: any) => ({
            id: a.id || `att-${Math.random()}`,
            email: a.email || "unknown@aman.org",
            status: a.status || "No Data",
            statusType: a.statusType || "nodata",
            workHours: a.workHours || "N/A",
            loginTime: a.loginTime || "N/A",
            tasks: a.tasks || "No tasks",
            lastUpdated: a.lastUpdated || new Date().toISOString(),
          }),
        );
        setAttendanceLogs(transformedAttendance);
      }

      // Fetch leaves
      const leavesData = await api.get("/api/leaves");
      if (leavesData && leavesData.data) {
        const transformedLeaves: LeaveRequest[] = leavesData.data.map(
          (l: any) => ({
            id: l.id || `leave-${Math.random()}`,
            coach: l.userName || "Unknown",
            type: l.type || "Casual Leave",
            requestedDates: l.requestedDates || "N/A",
            leavesTaken: l.leavesTaken || 0,
            leavesRemaining: l.leavesRemaining || 15,
            status: l.status || "PENDING",
          }),
        );
        setLeaveApprovals(transformedLeaves);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        console.error("HR data fetch error:", err.message);
      }
      // Fallback data
      setEmployees([
        {
          id: "EMP-082",
          name: "Sarah Jenkins",
          role: "Field Operations Lead",
          department: "Operations",
          status: "Active Mission",
          attendance: "09:02 AM",
          leavesUsed: 4,
          sopSigned: true,
          email: "sarah.jenkins@amanfoundation.org",
        },
        {
          id: "EMP-104",
          name: "David Chen",
          role: "Relief Coordinator",
          department: "Logistics",
          status: "In Office",
          attendance: "08:58 AM",
          leavesUsed: 8,
          sopSigned: true,
          email: "david.chen@amanfoundation.org",
        },
        {
          id: "EMP-304",
          name: "Maria Lopez",
          role: "Education Specialist",
          department: "Education",
          status: "On Leave",
          attendance: "On Leave",
          leavesUsed: 12,
          sopSigned: false,
          email: "maria.lopez@amanfoundation.org",
        },
      ]);
      setAttendanceLogs([
        {
          id: "att-1",
          email: "mayuriaoti@gmail.com",
          status: "Working: 7h 14m",
          statusType: "working",
          workHours: "7h 14m",
          loginTime: "N/A",
          tasks: "1 tasks",
          lastUpdated: "11:41:15 PM",
        },
        {
          id: "att-2",
          email: "muralikade@gmail.com",
          status: "No Data",
          statusType: "nodata",
          workHours: "N/A",
          loginTime: "N/A",
          tasks: "No tasks",
          lastUpdated: "11:41:15 PM",
        },
      ]);
      setLeaveApprovals([
        {
          id: "leave-1",
          coach: "Ahsan Kamal",
          type: "Casual Leave",
          requestedDates: "2026-06-02 to 2026-06-04",
          leavesTaken: 1,
          leavesRemaining: 14,
          status: "APPROVED",
        },
        {
          id: "leave-2",
          coach: "Ibrahim Khan",
          type: "Casual Leave",
          requestedDates: "2026-05-30",
          leavesTaken: 0,
          leavesRemaining: 15,
          status: "REJECTED",
        },
        {
          id: "leave-3",
          coach: "Darshan Mohankar",
          type: "Casual Leave",
          requestedDates: "2026-06-02",
          leavesTaken: 0,
          leavesRemaining: 15,
          status: "PENDING",
        },
      ]);
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
  const handleAddEmployee = async () => {
    if (!newName || !newEmail) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    try {
      const newUser = {
        name: newName,
        email: newEmail,
        roleName: newRole || "Staff",
        department: newDept,
        status: "ACTIVE",
      };

      const response = await api.post("/api/users", newUser);

      if (response) {
        triggerToast(`Successfully registered new hire: ${newName}`);
        setNewName("");
        setNewEmail("");
        setNewRole("");
        setNewDept("Operations");
        setNewStatus("In Office");
        setShowAddModal(false);
        fetchData();
      }
    } catch (err) {
      if (err instanceof ApiError) {
        Alert.alert("Error", err.message);
      }
    }
  };

  const handleDeleteLog = (id: string, email: string) => {
    setAttendanceLogs((prev) => prev.filter((log) => log.id !== id));
    triggerToast(`Attendance log for ${email} deleted.`);
  };

  const handleApproveLeave = async (id: string, coach: string) => {
    try {
      await api.put(`/api/leaves/${id}`, { status: "APPROVED" });
      setLeaveApprovals((prev) =>
        prev.map((l) =>
          l.id === id
            ? {
                ...l,
                status: "APPROVED",
                leavesTaken: l.leavesTaken + 1,
                leavesRemaining: Math.max(0, l.leavesRemaining - 1),
              }
            : l,
        ),
      );
      triggerToast(`Approved leave request for ${coach}`);
    } catch (err) {
      if (err instanceof ApiError) {
        Alert.alert("Error", err.message);
      }
    }
  };

  const handleRejectLeave = async (id: string, coach: string) => {
    try {
      await api.put(`/api/leaves/${id}`, { status: "REJECTED" });
      setLeaveApprovals((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status: "REJECTED" } : l)),
      );
      triggerToast(`Rejected leave request for ${coach}`);
    } catch (err) {
      if (err instanceof ApiError) {
        Alert.alert("Error", err.message);
      }
    }
  };

  const handleResetLeave = (id: string, coach: string) => {
    setLeaveApprovals((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: "PENDING" } : l)),
    );
    triggerToast(`Reset leave request for ${coach} to PENDING.`);
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // ============================================
  // FILTERS
  // ============================================
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(directorySearch.toLowerCase()) ||
      emp.role.toLowerCase().includes(directorySearch.toLowerCase()) ||
      emp.department.toLowerCase().includes(directorySearch.toLowerCase()) ||
      emp.id.toLowerCase().includes(directorySearch.toLowerCase());
    const matchesDept =
      directoryDept === "All" || emp.department === directoryDept;
    const matchesStatus =
      directoryStatus === "All" || emp.status === directoryStatus;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const filteredLeaves = leaveApprovals.filter((l) => {
    const matchesSearch =
      l.coach.toLowerCase().includes(leaveSearch.toLowerCase()) ||
      l.type.toLowerCase().includes(leaveSearch.toLowerCase());
    const matchesStatus =
      leaveStatusFilter === "ALL" || l.status === leaveStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // ============================================
  // RENDER HELPERS
  // ============================================
  const renderStatusPill = (statusType: string, statusText: string) => {
    let dotColor = "";
    let bgColor = "";
    let textColor = "";
    if (statusType === "working") {
      dotColor = colors.emerald;
      bgColor = `${colors.emerald}10`;
      textColor = colors.emerald;
    } else if (statusType === "nodata") {
      dotColor = colors.rose;
      bgColor = `${colors.rose}10`;
      textColor = colors.rose;
    } else {
      dotColor = colors.blue;
      bgColor = `${colors.blue}10`;
      textColor = colors.blue;
    }
    return (
      <View style={[styles.statusPill, { backgroundColor: bgColor }]}>
        <View style={[styles.statusDot, { backgroundColor: dotColor }]} />
        <Text style={[styles.statusPillText, { color: textColor }]}>
          {statusText}
        </Text>
      </View>
    );
  };

  const renderLeaveStatusPill = (status: string) => {
    if (status === "APPROVED") {
      return (
        <View style={styles.leaveStatusApproved}>
          <Text style={styles.leaveStatusText}>APPROVED</Text>
        </View>
      );
    } else if (status === "REJECTED") {
      return (
        <View style={styles.leaveStatusRejected}>
          <Text style={styles.leaveStatusText}>REJECTED</Text>
        </View>
      );
    } else {
      return (
        <View style={styles.leaveStatusPending}>
          <Text style={styles.leaveStatusText}>PENDING</Text>
        </View>
      );
    }
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
  // TABLE HEADERS
  // ============================================
  const TeamDirectoryHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={[styles.headerCell, styles.headerId]}>Employee ID</Text>
      <Text style={[styles.headerCell, styles.headerName]}>Name</Text>
      <Text style={[styles.headerCell, styles.headerEmail]}>Email</Text>
      <Text style={[styles.headerCell, styles.headerDept]}>Department</Text>
      <Text style={[styles.headerCell, styles.headerRole]}>Role</Text>
      <Text style={[styles.headerCell, styles.headerStatusTbl]}>Status</Text>
    </View>
  );

  const AttendanceHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={[styles.headerCell, styles.attEmail]}>Employee</Text>
      <Text style={[styles.headerCell, styles.attStatus]}>Status</Text>
      <Text style={[styles.headerCell, styles.attHours]}>Work Hours</Text>
      <Text style={[styles.headerCell, styles.attLogin]}>Login Time</Text>
      <Text style={[styles.headerCell, styles.attTasks]}>Daily Tasks</Text>
      <Text style={[styles.headerCell, styles.attActions]}>Actions</Text>
    </View>
  );

  const LeaveHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={[styles.headerCell, styles.leaveCoach]}>Coach</Text>
      <Text style={[styles.headerCell, styles.leaveType]}>Type</Text>
      <Text style={[styles.headerCell, styles.leaveDates]}>
        Requested Dates
      </Text>
      <Text style={[styles.headerCell, styles.leaveTaken]}>Taken</Text>
      <Text style={[styles.headerCell, styles.leaveRemaining]}>Remaining</Text>
      <Text style={[styles.headerCell, styles.leaveStatusHdr]}>Status</Text>
      <Text style={[styles.headerCell, styles.leaveActionsHdr]}>Actions</Text>
    </View>
  );

  // ============================================
  // LOADING STATE
  // ============================================
  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading HR data...</Text>
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

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigation("/disaster_relief_management")}
            >
              <Ionicons name="snow-outline" size={20} color="#4b5563" />
              <Text style={styles.menuText}>Disaster Relief</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemActive]}
              onPress={() => handleNavigation("/hr_employee_management")}
            >
              <Ionicons name="people-outline" size={20} color="#fff" />
              <Text style={styles.menuTextActive}>HR Management</Text>
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

            {/* Page Header */}
            <View>
              <Text style={styles.sectionLabel}>Administration Module</Text>
              <Text style={styles.mainTitle}>Human Resources & Personnel</Text>
              <Text style={styles.subtitle}>
                Manage employee databases, daily attendance tracking, approval
                workflows, and standard operating procedures (SOP).
              </Text>
            </View>

            {/* Add Button */}
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddModal(true)}
            >
              <MaterialIcons
                name="person-add"
                size={18}
                color={colors.onPrimary}
              />
              <Text style={styles.addButtonText}>New Hire Registration</Text>
            </TouchableOpacity>

            {/* Tabs */}
            <View style={styles.tabContainer}>
              <ToggleTab title="Team Directory" />
              <ToggleTab title="Attendance Logs" />
              <ToggleTab title="Leave Workflow" />
              <ToggleTab title="SOP acknowledged registers" />
              <ToggleTab title="HR Reports & headcount" />
            </View>

            {/* Tab Content */}
            <View style={styles.tabContent}>
              {/* TEAM DIRECTORY TAB */}
              {activeTab === "Team Directory" && (
                <View>
                  <View style={styles.directoryHeader}>
                    <Text style={styles.tableTitle}>
                      Staff & Employee Directory
                    </Text>
                    <Text style={styles.recordCount}>
                      {filteredEmployees.length} employees found
                    </Text>
                  </View>

                  {/* Filters */}
                  <View style={styles.filterContainer}>
                    <View style={styles.searchContainer}>
                      <MaterialIcons name="search" size={18} color="#9ca3af" />
                      <TextInput
                        style={styles.searchInput}
                        placeholder="Search name, role, ID..."
                        placeholderTextColor="#9ca3af"
                        value={directorySearch}
                        onChangeText={setDirectorySearch}
                      />
                    </View>
                    <View style={styles.pickerWrapper}>
                      <Picker
                        selectedValue={directoryDept}
                        onValueChange={(itemValue) =>
                          setDirectoryDept(itemValue)
                        }
                        style={styles.filterPicker}
                      >
                        <Picker.Item label="All Departments" value="All" />
                        <Picker.Item label="Operations" value="Operations" />
                        <Picker.Item label="Logistics" value="Logistics" />
                        <Picker.Item label="Education" value="Education" />
                        <Picker.Item label="HR" value="HR" />
                        <Picker.Item label="Finance" value="Finance" />
                      </Picker>
                    </View>
                    <View style={styles.pickerWrapper}>
                      <Picker
                        selectedValue={directoryStatus}
                        onValueChange={(itemValue) =>
                          setDirectoryStatus(itemValue)
                        }
                        style={styles.filterPicker}
                      >
                        <Picker.Item label="All Statuses" value="All" />
                        <Picker.Item label="In Office" value="In Office" />
                        <Picker.Item
                          label="Active Mission"
                          value="Active Mission"
                        />
                        <Picker.Item label="On Leave" value="On Leave" />
                      </Picker>
                    </View>
                  </View>

                  {/* Scrollable Table */}
                  <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                    <View style={styles.tableContainer}>
                      <TeamDirectoryHeader />
                      {filteredEmployees.map((emp) => (
                        <View key={emp.id} style={styles.tableRow}>
                          <Text style={[styles.rowCell, styles.rowId]}>
                            {emp.id}
                          </Text>
                          <Text style={[styles.rowCell, styles.rowName]}>
                            {emp.name}
                          </Text>
                          <Text style={[styles.rowCell, styles.rowEmail]}>
                            {emp.email}
                          </Text>
                          <Text style={[styles.rowCell, styles.rowDept]}>
                            {emp.department}
                          </Text>
                          <Text style={[styles.rowCell, styles.rowRole]}>
                            {emp.role}
                          </Text>
                          <View style={[styles.rowCell, styles.rowStatusTbl]}>
                            <View
                              style={[
                                styles.statusBadge,
                                emp.status === "Active Mission"
                                  ? styles.statusActiveMission
                                  : emp.status === "On Leave"
                                    ? styles.statusOnLeave
                                    : styles.statusInOffice,
                              ]}
                            >
                              <Text style={styles.statusBadgeText}>
                                {emp.status}
                              </Text>
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              )}

              {/* ATTENDANCE LOGS TAB */}
              {activeTab === "Attendance Logs" && (
                <View>
                  <View style={styles.directoryHeader}>
                    <Text style={styles.tableTitle}>
                      Daily Attendance Ledger
                    </Text>
                    <Text style={styles.recordCount}>
                      {attendanceLogs.length} Records
                    </Text>
                  </View>

                  <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                    <View style={styles.tableContainer}>
                      <AttendanceHeader />
                      {attendanceLogs.map((log) => (
                        <View key={log.id} style={styles.tableRow}>
                          <View style={[styles.rowCell, styles.attEmailCell]}>
                            <View style={styles.employeeAvatar}>
                              <Text style={styles.avatarText}>
                                {log.email.charAt(0).toUpperCase()}
                              </Text>
                            </View>
                            <View>
                              <Text style={styles.employeeEmail}>
                                {log.email}
                              </Text>
                            </View>
                          </View>
                          <View style={[styles.rowCell, styles.attStatusCell]}>
                            {renderStatusPill(log.statusType, log.status)}
                          </View>
                          <Text style={[styles.rowCell, styles.attHoursCell]}>
                            {log.workHours}
                          </Text>
                          <Text style={[styles.rowCell, styles.attLoginCell]}>
                            {log.loginTime}
                          </Text>
                          <View style={[styles.rowCell, styles.attTasksCell]}>
                            {log.tasks !== "No tasks" ? (
                              <View style={styles.tasksContainer}>
                                <MaterialIcons
                                  name="check-box"
                                  size={16}
                                  color={colors.emerald}
                                />
                                <Text style={styles.tasksText}>
                                  {log.tasks}
                                </Text>
                              </View>
                            ) : (
                              <View style={styles.tasksContainer}>
                                <MaterialIcons
                                  name="close"
                                  size={16}
                                  color={colors.rose}
                                />
                                <Text style={styles.tasksTextNo}>
                                  {log.tasks}
                                </Text>
                              </View>
                            )}
                          </View>
                          <View style={[styles.rowCell, styles.attActionsCell]}>
                            <TouchableOpacity
                              onPress={() =>
                                triggerToast(
                                  `Viewing attendance log for ${log.email}`,
                                )
                              }
                            >
                              <Text style={styles.actionText}>View</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => handleDeleteLog(log.id, log.email)}
                            >
                              <Text
                                style={[styles.actionText, styles.deleteText]}
                              >
                                Delete
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              )}

              {/* LEAVE WORKFLOW TAB */}
              {activeTab === "Leave Workflow" && (
                <View>
                  <View style={styles.directoryHeader}>
                    <Text style={styles.tableTitle}>Leave Approvals</Text>
                    <Text style={styles.recordCount}>
                      {filteredLeaves.length} Records Found
                    </Text>
                  </View>

                  {/* Leave Filters */}
                  <View style={styles.leaveFilterContainer}>
                    <View style={styles.searchContainer}>
                      <MaterialIcons name="search" size={18} color="#9ca3af" />
                      <TextInput
                        style={styles.searchInput}
                        placeholder="Search records..."
                        placeholderTextColor="#9ca3af"
                        value={leaveSearch}
                        onChangeText={setLeaveSearch}
                      />
                    </View>
                    <View style={styles.pickerWrapper}>
                      <Picker
                        selectedValue={leaveStatusFilter}
                        onValueChange={(itemValue) =>
                          setLeaveStatusFilter(itemValue)
                        }
                        style={styles.filterPicker}
                      >
                        <Picker.Item label="All Status" value="ALL" />
                        <Picker.Item label="APPROVED" value="APPROVED" />
                        <Picker.Item label="REJECTED" value="REJECTED" />
                        <Picker.Item label="PENDING" value="PENDING" />
                      </Picker>
                    </View>
                    <TouchableOpacity
                      style={styles.exportButton}
                      onPress={() =>
                        triggerToast("Exporting leave records to CSV...")
                      }
                    >
                      <MaterialIcons
                        name="download"
                        size={14}
                        color={colors.emerald}
                      />
                      <Text style={styles.exportButtonText}>Export</Text>
                    </TouchableOpacity>
                  </View>

                  <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                    <View style={styles.tableContainer}>
                      <LeaveHeader />
                      {filteredLeaves.map((leave) => (
                        <View key={leave.id} style={styles.tableRow}>
                          <Text style={[styles.rowCell, styles.leaveCoachCell]}>
                            {leave.coach}
                          </Text>
                          <Text style={[styles.rowCell, styles.leaveTypeCell]}>
                            {leave.type}
                          </Text>
                          <Text style={[styles.rowCell, styles.leaveDatesCell]}>
                            {leave.requestedDates}
                          </Text>
                          <Text style={[styles.rowCell, styles.leaveTakenCell]}>
                            {leave.leavesTaken}
                          </Text>
                          <Text
                            style={[styles.rowCell, styles.leaveRemainingCell]}
                          >
                            {leave.leavesRemaining}
                          </Text>
                          <View
                            style={[styles.rowCell, styles.leaveStatusCell]}
                          >
                            {renderLeaveStatusPill(leave.status)}
                          </View>
                          <View
                            style={[styles.rowCell, styles.leaveActionsCell]}
                          >
                            {leave.status === "PENDING" ? (
                              <View style={styles.actionButtonsRow}>
                                <TouchableOpacity
                                  style={styles.approveButton}
                                  onPress={() =>
                                    handleApproveLeave(leave.id, leave.coach)
                                  }
                                >
                                  <Text style={styles.approveButtonText}>
                                    Approve
                                  </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                  style={styles.rejectButton}
                                  onPress={() =>
                                    handleRejectLeave(leave.id, leave.coach)
                                  }
                                >
                                  <Text style={styles.rejectButtonText}>
                                    Reject
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            ) : (
                              <TouchableOpacity
                                onPress={() =>
                                  handleResetLeave(leave.id, leave.coach)
                                }
                              >
                                <Text style={styles.resetText}>Reset</Text>
                              </TouchableOpacity>
                            )}
                          </View>
                        </View>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              )}

              {/* SOP ACKNOWLEDGED REGISTERS TAB */}
              {activeTab === "SOP acknowledged registers" && (
                <View>
                  <Text style={styles.tableTitle}>
                    Standard Operating Procedures Acknowledgment Log
                  </Text>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.headerCell, styles.sopName]}>
                      Employee
                    </Text>
                    <Text style={[styles.headerCell, styles.sopRole]}>
                      Role
                    </Text>
                    <Text style={[styles.headerCell, styles.sopStatus]}>
                      Safety Protocol Signed
                    </Text>
                  </View>
                  {employees.map((emp) => (
                    <View key={emp.id} style={styles.tableRow}>
                      <Text style={[styles.rowCell, styles.sopNameCell]}>
                        {emp.name}
                      </Text>
                      <Text style={[styles.rowCell, styles.sopRoleCell]}>
                        {emp.role}
                      </Text>
                      <View style={[styles.rowCell, styles.sopStatusCell]}>
                        <View
                          style={[
                            styles.sopBadge,
                            emp.sopSigned
                              ? styles.sopSigned
                              : styles.sopPending,
                          ]}
                        >
                          <Text
                            style={[
                              styles.sopBadgeText,
                              emp.sopSigned
                                ? styles.sopSignedText
                                : styles.sopPendingText,
                            ]}
                          >
                            {emp.sopSigned ? "Acknowledged" : "Pending Signoff"}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* HR REPORTS TAB */}
              {activeTab === "HR Reports & headcount" && (
                <View>
                  <Text style={styles.tableTitle}>
                    Headcount Distribution & Leave Trends
                  </Text>
                  <View style={styles.reportContainer}>
                    <Text style={styles.reportSubtitle}>
                      Department Headcount Distribution
                    </Text>
                    <View style={styles.progressItem}>
                      <Text style={styles.progressLabel}>Operations</Text>
                      <View style={styles.progressBarBg}>
                        <View style={[styles.progressFill, { width: "60%" }]} />
                      </View>
                      <Text style={styles.progressValue}>140</Text>
                    </View>
                    <View style={styles.progressItem}>
                      <Text style={styles.progressLabel}>Logistics</Text>
                      <View style={styles.progressBarBg}>
                        <View style={[styles.progressFill, { width: "30%" }]} />
                      </View>
                      <Text style={styles.progressValue}>72</Text>
                    </View>
                    <View style={styles.progressItem}>
                      <Text style={styles.progressLabel}>Education</Text>
                      <View style={styles.progressBarBg}>
                        <View style={[styles.progressFill, { width: "10%" }]} />
                      </View>
                      <Text style={styles.progressValue}>24</Text>
                    </View>
                  </View>

                  <View style={styles.sideInfoCard}>
                    <Text style={styles.sideInfoTitle}>
                      General Leave Balance Index
                    </Text>
                    <View style={styles.balanceRow}>
                      <Text style={styles.balanceLabel}>
                        Casual Leaves Balance
                      </Text>
                      <Text style={styles.balanceValue}>12 Days remaining</Text>
                    </View>
                    <View style={styles.balanceRow}>
                      <Text style={styles.balanceLabel}>
                        Sick Leaves Balance
                      </Text>
                      <Text style={styles.balanceValue}>8 Days remaining</Text>
                    </View>
                    <View style={styles.balanceRow}>
                      <Text style={styles.balanceLabel}>
                        Earned Leaves Balance
                      </Text>
                      <Text style={styles.balanceValue}>22 Days remaining</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>

            {/* Footer */}
            <Footer />
          </ScrollView>
        </SafeAreaView>

        {/* Add Employee Modal */}
        <Modal
          visible={showAddModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowAddModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  Register New Employee Record
                </Text>
                <TouchableOpacity onPress={() => setShowAddModal(false)}>
                  <MaterialIcons name="close" size={24} color="#64748b" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalForm}>
                <View>
                  <Text style={styles.formLabel}>Employee Full Name *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. John Doe"
                    placeholderTextColor="#9ca3af"
                    value={newName}
                    onChangeText={setNewName}
                  />
                </View>

                <View>
                  <Text style={styles.formLabel}>Email *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. john@amanfoundation.org"
                    placeholderTextColor="#9ca3af"
                    value={newEmail}
                    onChangeText={setNewEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View>
                  <Text style={styles.formLabel}>Job Role / Title</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. Field Operations Associate"
                    placeholderTextColor="#9ca3af"
                    value={newRole}
                    onChangeText={setNewRole}
                  />
                </View>

                <View>
                  <Text style={styles.formLabel}>Department</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={newDept}
                      onValueChange={(itemValue) => setNewDept(itemValue)}
                      style={styles.picker}
                    >
                      <Picker.Item label="Operations" value="Operations" />
                      <Picker.Item label="Logistics" value="Logistics" />
                      <Picker.Item label="Education" value="Education" />
                      <Picker.Item label="HR" value="HR" />
                      <Picker.Item label="Finance" value="Finance" />
                    </Picker>
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
                    onPress={handleAddEmployee}
                    style={styles.submitButton}
                  >
                    <Text style={styles.submitButtonText}>Add Employee</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Toast Notification */}
        {showToast && (
          <View style={styles.toast}>
            <MaterialIcons
              name="check-circle"
              size={18}
              color={colors.emerald}
            />
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        )}
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
  // ==================== SIDEBAR STYLES ====================
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
  brandTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#065f46",
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
  menuTextActive: {
    color: "#fff",
    marginLeft: 12,
    fontWeight: "600",
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
  dropdownText: {
    fontSize: 13,
    color: "#6b7280",
    marginLeft: 10,
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

  // ==================== MAIN CONTAINER ====================
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },

  // ==================== HEADER STYLES ====================
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
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
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
  },

  // ==================== SCROLL CONTENT ====================
  scrollContent: {
    padding: 20,
    paddingBottom: 20,
  },

  // ==================== BACK BUTTON ====================
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

  // ==================== HEADER SECTION ====================
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

  // ==================== ADD BUTTON ====================
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 999,
    marginBottom: 20,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.onPrimary,
  },

  // ==================== TABS ====================
  tabContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
    marginBottom: 16,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginRight: 4,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.onSurfaceVariant,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: "600",
  },

  // ==================== TAB CONTENT ====================
  tabContent: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },

  // ==================== DIRECTORY HEADER ====================
  directoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    flexWrap: "wrap",
  },
  tableTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.onSurface,
    marginBottom: 16,
  },
  recordCount: {
    fontSize: 11,
    color: colors.onSurfaceVariant,
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  // ==================== TABLE CONTAINER ====================
  tableContainer: {
    minWidth: 800,
  },

  // ==================== FILTERS ====================
  filterContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  leaveFilterContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    minWidth: 150,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 12,
    color: colors.onSurface,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: 8,
    minWidth: 130,
  },
  filterPicker: {
    height: 40,
    width: "100%",
  },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: `${colors.emerald}10`,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: `${colors.emerald}30`,
  },
  exportButtonText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.emerald,
  },

  // ==================== TABLE HEADERS ====================
  tableHeader: {
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

  // Team Directory Headers
  headerId: { width: 80 },
  headerName: { width: 120 },
  headerEmail: { width: 180 },
  headerDept: { width: 100 },
  headerRole: { width: 140 },
  headerStatusTbl: { width: 100, textAlign: "right" },

  // Attendance Headers
  attEmail: { width: 180 },
  attStatus: { width: 140 },
  attHours: { width: 100 },
  attLogin: { width: 100 },
  attTasks: { width: 120 },
  attActions: { width: 100, textAlign: "right" },

  // Leave Headers
  leaveCoach: { width: 120 },
  leaveType: { width: 100 },
  leaveDates: { width: 180 },
  leaveTaken: { width: 70, textAlign: "center" },
  leaveRemaining: { width: 90, textAlign: "center" },
  leaveStatusHdr: { width: 100, textAlign: "center" },
  leaveActionsHdr: { width: 160, textAlign: "right" },

  // SOP Headers
  sopName: { flex: 1.5 },
  sopRole: { flex: 1.5 },
  sopStatus: { flex: 1, textAlign: "right" },

  // ==================== TABLE ROWS ====================
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
    alignItems: "center",
  },
  rowCell: {
    fontSize: 12,
    color: colors.onSurface,
  },

  // Team Directory Row Cells
  rowId: { width: 80 },
  rowName: { width: 120, fontWeight: "500" },
  rowEmail: { width: 180 },
  rowDept: { width: 100 },
  rowRole: { width: 140 },
  rowStatusTbl: { width: 100, alignItems: "flex-end" },

  // Status Badges
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusActiveMission: {
    backgroundColor: colors.primaryFixed,
  },
  statusInOffice: {
    backgroundColor: colors.surfaceContainerHighest,
  },
  statusOnLeave: {
    backgroundColor: colors.errorContainer,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: "600",
    textTransform: "uppercase",
    color: colors.onPrimaryFixed,
  },

  // Attendance Row Cells
  attEmailCell: {
    width: 180,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  attStatusCell: { width: 140 },
  attHoursCell: { width: 100 },
  attLoginCell: { width: 100 },
  attTasksCell: { width: 120 },
  attActionsCell: {
    width: 100,
    flexDirection: "row",
    gap: 10,
    justifyContent: "flex-end",
  },

  // Employee Avatar
  employeeAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: `${colors.blue}20`,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.blue,
  },
  employeeEmail: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.onSurface,
  },

  // Status Pill
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: "500",
  },

  // Tasks Container
  tasksContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  tasksText: {
    fontSize: 11,
    color: colors.blue,
  },
  tasksTextNo: {
    fontSize: 11,
    color: colors.onSurfaceVariant,
  },

  // Action Buttons
  actionText: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.blue,
  },
  deleteText: {
    color: colors.rose,
  },

  // Leave Row Cells
  leaveCoachCell: { width: 120, fontWeight: "500" },
  leaveTypeCell: { width: 100 },
  leaveDatesCell: { width: 180 },
  leaveTakenCell: { width: 70, textAlign: "center" },
  leaveRemainingCell: { width: 90, textAlign: "center" },
  leaveStatusCell: { width: 100, alignItems: "center" },
  leaveActionsCell: { width: 160, alignItems: "flex-end" },

  // Leave Status Badges
  leaveStatusApproved: {
    backgroundColor: `${colors.emerald}15`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: `${colors.emerald}30`,
  },
  leaveStatusRejected: {
    backgroundColor: `${colors.rose}15`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: `${colors.rose}30`,
  },
  leaveStatusPending: {
    backgroundColor: `${colors.amber}15`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: `${colors.amber}30`,
  },
  leaveStatusText: {
    fontSize: 9,
    fontWeight: "600",
    textTransform: "uppercase",
    color: colors.onSurface,
  },

  // Action Buttons Row
  actionButtonsRow: {
    flexDirection: "row",
    gap: 8,
  },
  approveButton: {
    backgroundColor: colors.emerald,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  approveButtonText: {
    fontSize: 10,
    fontWeight: "600",
    color: "white",
    textTransform: "uppercase",
  },
  rejectButton: {
    backgroundColor: colors.rose,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  rejectButtonText: {
    fontSize: 10,
    fontWeight: "600",
    color: "white",
    textTransform: "uppercase",
  },
  resetText: {
    fontSize: 11,
    color: colors.onSurfaceVariant,
  },

  // SOP Row Cells
  sopNameCell: { flex: 1.5, fontWeight: "500" },
  sopRoleCell: { flex: 1.5 },
  sopStatusCell: { flex: 1, alignItems: "flex-end" },

  // SOP Badges
  sopBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sopSigned: {
    backgroundColor: colors.primaryFixed,
  },
  sopPending: {
    backgroundColor: colors.errorContainer,
  },
  sopBadgeText: {
    fontSize: 9,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  sopSignedText: {
    color: colors.onPrimaryFixed,
  },
  sopPendingText: {
    color: colors.onErrorContainer,
  },

  // ==================== REPORTS SECTION ====================
  reportContainer: {
    marginBottom: 20,
  },
  reportSubtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.onSurface,
    marginBottom: 16,
  },
  progressItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  progressLabel: {
    width: 80,
    fontSize: 12,
    color: colors.onSurfaceVariant,
    textAlign: "right",
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: colors.surfaceContainerHighest,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  progressValue: {
    width: 40,
    fontSize: 12,
    fontWeight: "500",
    color: colors.onSurface,
    textAlign: "right",
  },

  // Side Info Card
  sideInfoCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  sideInfoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.onSurface,
    marginBottom: 12,
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  balanceLabel: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  balanceValue: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.onSurface,
  },

  // ==================== MODAL STYLES ====================
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
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.onSurface,
  },
  modalForm: {
    padding: 20,
    gap: 16,
  },

  // ==================== FORM STYLES ====================
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
  picker: {
    height: 44,
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
    color: colors.onSurface,
  },
  submitButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  submitButtonText: {
    color: "white",
    fontWeight: "600",
  },

  // ==================== TOAST NOTIFICATION ====================
  toast: {
    position: "absolute",
    bottom: 80,
    right: 20,
    left: 20,
    backgroundColor: "#1f2937",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 200,
  },
  toastText: {
    fontSize: 12,
    fontWeight: "500",
    color: "white",
  },

  // ==================== FOOTER STYLES ====================
  footer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginTop: 20,
    marginBottom: 0,
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
