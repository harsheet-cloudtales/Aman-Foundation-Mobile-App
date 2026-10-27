// app/travel.tsx
import { RouteGuard } from "@/components/RouteGuard";
import { useAuth } from "@/lib/useAuth";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
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

const { width } = Dimensions.get("window");

// ============================================
// API BASE URL (REQUIRED FOR REACT NATIVE)
// ============================================
// Set EXPO_PUBLIC_API_URL in your .env file.
// Examples:
//   - Android emulator:  http://10.0.2.2:3000
//   - iOS simulator:     http://localhost:3000
//   - Physical device:   http://192.168.x.x:3000  (your laptop's LAN IP)
const API_BASE = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

const apiFetch = (path: string, init?: RequestInit) =>
  fetch(`${API_BASE}${path}`, init);

// ============================================
// CONSTANTS
// ============================================
const PROGRAM_ROLES = [
  "PROGRAM_MANAGER",
  "ACCOUNTANT",
  "PROGRAM_COORDINATOR",
  "FIELD_EXECUTIVE",
  "PROGRAM_DIRECTOR",
  "PROGRAM_LEAD",
  "CLASS_ASSISTANT",
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
  surfaceContainerLow: "#f3f4f5",
  surfaceContainer: "#edeeef",
  surfaceContainerHighest: "#e1e3e4",
  onSurface: "#191c1d",
  onSurfaceVariant: "#3d4945",
  outlineVariant: "#bccac4",
  secondary: "#964900",
  error: "#ba1a1a",
  errorContainer: "#ffdad6",
  rose: "#ef4444",
  emerald: "#059669",
  emeraldDark: "#047857",
  blue: "#2563eb",
  blueDark: "#1d4ed8",
  yellow: "#ca8a04",
  yellowBg: "#fef9c3",
  roseBg: "#ffe4e6",
  emeraldBg: "#d1fae5",
  blueBg: "#dbeafe",
  slateBg: "#f1f5f9",
};

// ============================================
// STATUS BADGE
// ============================================
const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { bg: string; text: string }> = {
    PENDING: { bg: colors.yellowBg, text: "#854d0e" },
    APPROVED: { bg: colors.emeraldBg, text: "#065f46" },
    REJECTED: { bg: colors.roseBg, text: "#9f1239" },
    COMPLETED: { bg: colors.blueBg, text: "#1e40af" },
  };
  const c = map[status] || {
    bg: colors.surfaceContainer,
    text: colors.onSurface,
  };
  return (
    <View style={[styles.statusBadge, { backgroundColor: c.bg }]}>
      <Text style={[styles.statusBadgeText, { color: c.text }]}>{status}</Text>
    </View>
  );
};

// ============================================
// FOOTER
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
export default function TravelPage() {
  const { token, user, isInitializing } = useAuth();
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false); // 👈 FIX: start false
  const [toast, setToast] = useState({ show: false, message: "" });

  // New Travel Request modal
  const [showNewModal, setShowNewModal] = useState(false);
  const [newDestination, setNewDestination] = useState("");
  const [newPurpose, setNewPurpose] = useState("");
  const [newStartDate, setNewStartDate] = useState("");
  const [newEndDate, setNewEndDate] = useState("");
  const [newExpectedExpenses, setNewExpectedExpenses] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Expense modal
  const [showExpenseModal, setShowExpenseModal] = useState<any>(null);
  const [expenseDetails, setExpenseDetails] = useState([
    { category: "", amount: "", description: "" },
  ]);
  const [expenseNotes, setExpenseNotes] = useState("");
  const [expenseFiles, setExpenseFiles] = useState<any[]>([]);
  const [submittingExpense, setSubmittingExpense] = useState(false);

  // Sidebar dropdowns
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

  // 👈 FIX: treat "user not yet known" as allowed so we don't redirect prematurely
  const isAllowed =
    !user ||
    user.roleName === "FELLOW" ||
    PROGRAM_ROLES.includes(user.roleName);

  // ============================================
  // TOAST
  // ============================================
  const triggerToast = (msg: string) => {
    setToast({ show: true, message: msg });
    setTimeout(() => setToast({ show: false, message: "" }), 3000);
  };

  // ============================================
  // FETCH REQUESTS
  // ============================================
  const fetchRequests = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch("/api/travel-requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        const mine = PROGRAM_ROLES.includes(user?.roleName)
          ? json.data.filter((r: any) => r.userId === user.id)
          : json.data;
        setRequests(mine);
      }
    } catch (e) {
      console.error("fetchRequests error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 👈 FIX: explicit branches, no infinite loading
  useEffect(() => {
    if (isInitializing) return;

    if (!isAllowed) {
      setLoading(false);
      router.replace("/");
      return;
    }

    if (token && user) {
      fetchRequests();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user, isInitializing]);

  // ============================================
  // CREATE REQUEST
  // ============================================
  const handleCreateRequest = async () => {
    if (!newDestination || !newPurpose || !newStartDate || !newEndDate) {
      triggerToast("Please fill in all required fields");
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiFetch("/api/travel-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          destination: newDestination,
          purpose: newPurpose,
          startDate: newStartDate,
          endDate: newEndDate,
          expectedExpenses: parseFloat(newExpectedExpenses) || 0,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setRequests((prev) => [json.data, ...prev]);
        setShowNewModal(false);
        setNewDestination("");
        setNewPurpose("");
        setNewStartDate("");
        setNewEndDate("");
        setNewExpectedExpenses("");
        triggerToast("Travel request submitted!");
      } else {
        triggerToast(json.error || "Failed to submit");
      }
    } catch (e) {
      triggerToast("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================
  // SUBMIT EXPENSES
  // ============================================
  const handleSubmitExpense = async () => {
    if (!showExpenseModal) return;
    setSubmittingExpense(true);
    try {
      const validDetails = expenseDetails.filter((d) => d.category && d.amount);
      const totalAmount = validDetails.reduce(
        (sum, d) => sum + (parseFloat(d.amount) || 0),
        0,
      );

      const formData = new FormData();
      formData.append("actualExpense", String(totalAmount));
      formData.append("expenseDetails", JSON.stringify(validDetails));
      formData.append("notes", expenseNotes);

      expenseFiles.forEach((file, idx) => {
        formData.append(`receipt_${idx}`, {
          uri: file.uri,
          name: file.name,
          type: file.mimeType || "application/octet-stream",
        } as any);
      });

      const res = await apiFetch(
        `/api/travel-requests/${showExpenseModal.id}/expenses`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        },
      );
      const json = await res.json();
      if (json.success) {
        setShowExpenseModal(null);
        setExpenseDetails([{ category: "", amount: "", description: "" }]);
        setExpenseNotes("");
        setExpenseFiles([]);
        triggerToast("Expense submitted!");
        fetchRequests();
      } else {
        triggerToast(json.error || "Failed to submit expense");
      }
    } catch (e) {
      triggerToast("An error occurred");
    } finally {
      setSubmittingExpense(false);
    }
  };

  // ============================================
  // PICK RECEIPT FILES
  // ============================================
  const pickReceiptFiles = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        multiple: true,
        type: ["image/*", "application/pdf"],
      });
      if (result.canceled) return;
      setExpenseFiles((prev) => [...prev, ...result.assets]);
    } catch (e) {
      console.error(e);
    }
  };

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

  const onRefresh = () => {
    setRefreshing(true);
    fetchRequests();
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
  // HELPERS
  // ============================================
  const formatDate = (d: any) => {
    if (!d) return "N/A";
    try {
      return new Date(d).toLocaleDateString();
    } catch {
      return "N/A";
    }
  };

  const formatCurrency = (n: any) => {
    if (n == null) return "N/A";
    return `₹${Number(n).toLocaleString("en-IN")}`;
  };

  // ============================================
  // LOADING
  // ============================================
  // 👈 FIX: only show spinner when auth is initializing OR the request is in flight
  if (isInitializing || (loading && requests.length === 0)) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading travel requests...</Text>
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
            SIDEBAR
        ============================================ */}
        <Animated.View
          style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
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
              <View style={styles.menuItemLeft}>
                <Ionicons name="grid-outline" size={20} color="#4b5563" />
                <Text style={styles.menuText}>Dashboard</Text>
              </View>
            </TouchableOpacity>

            {/* EDUCATION */}
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

            {/* FELLOW OBSERVATION */}
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

            {/* LIVELIHOOD */}
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
                <Ionicons name="airplane-outline" size={20} color="#4b5563" />
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

            {/* TRAVEL — active */}
            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemActive]}
              onPress={closeMenu}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons
                  name="airplane-outline"
                  size={20}
                  color={colors.emeraldDark}
                />
                <Text style={[styles.menuText, styles.menuTextActive]}>
                  Travel Requests
                </Text>
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
            {/* PAGE HEADER */}
            <View style={styles.pageHeaderRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.pageTitle}>Travel Requests</Text>
                <Text style={styles.pageSubtitle}>
                  Submit and manage your travel requests.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.newRequestBtn}
              onPress={() => setShowNewModal(true)}
            >
              <MaterialIcons name="add" size={18} color="#fff" />
              <Text style={styles.newRequestBtnText}>New Travel Request</Text>
            </TouchableOpacity>

            {/* REQUEST LIST */}
            <View style={{ gap: 14 }}>
              {requests.length === 0 ? (
                <View style={styles.emptyState}>
                  <MaterialIcons
                    name="flight"
                    size={48}
                    color="#cbd5e1"
                    style={{ marginBottom: 12 }}
                  />
                  <Text style={styles.emptyStateTitle}>
                    No travel requests yet.
                  </Text>
                  <Text style={styles.emptyStateSubtitle}>
                    Submit a new travel request to get started.
                  </Text>
                </View>
              ) : (
                requests.map((req) => (
                  <View key={req.id} style={styles.requestCard}>
                    {/* HEADER */}
                    <View style={styles.requestHeaderRow}>
                      <View style={{ flex: 1 }}>
                        <View style={styles.requestTitleRow}>
                          <Text style={styles.requestTitle} numberOfLines={1}>
                            {req.destination}
                          </Text>
                          <StatusBadge status={req.status} />
                        </View>
                        <Text style={styles.requestPurpose} numberOfLines={2}>
                          {req.purpose}
                        </Text>
                      </View>
                    </View>

                    {/* DATES + ESTIMATE */}
                    <View style={styles.requestMetaRow}>
                      <Text style={styles.requestDates}>
                        {formatDate(req.startDate)} - {formatDate(req.endDate)}
                      </Text>
                      <Text style={styles.requestEstimate}>
                        Estimated: {formatCurrency(req.expectedExpenses)}
                      </Text>
                    </View>

                    {/* REJECTION */}
                    {req.status === "REJECTED" && req.rejectionReason && (
                      <View style={styles.rejectBox}>
                        <Text style={styles.rejectLabel}>Rejection Reason</Text>
                        <Text style={styles.rejectText}>
                          {req.rejectionReason}
                        </Text>
                      </View>
                    )}

                    {/* APPROVED */}
                    {req.status === "APPROVED" && (
                      <View style={styles.approvedRow}>
                        <Text style={styles.approvedText}>
                          Approved by {req.approver?.name || "Manager"} on{" "}
                          {formatDate(req.approvedAt)}
                        </Text>
                        <TouchableOpacity
                          style={styles.submitExpenseBtn}
                          onPress={() => setShowExpenseModal(req)}
                        >
                          <Text style={styles.submitExpenseBtnText}>
                            Submit Actual Expenses
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* COMPLETED */}
                    {req.status === "COMPLETED" &&
                      req.expenses &&
                      req.expenses.length > 0 && (
                        <View style={styles.completedBox}>
                          <Text style={styles.completedLabel}>
                            Actual Expense Report
                          </Text>
                          <Text style={styles.completedTotal}>
                            Total:{" "}
                            {formatCurrency(req.expenses[0].actualExpense)}
                          </Text>

                          {req.expenses[0].expenseDetails &&
                            Array.isArray(req.expenses[0].expenseDetails) && (
                              <View style={{ marginTop: 8, gap: 4 }}>
                                {req.expenses[0].expenseDetails.map(
                                  (d: any, idx: number) => (
                                    <View
                                      key={idx}
                                      style={styles.expenseDetailRow}
                                    >
                                      <Text style={styles.expenseDetailText}>
                                        {d.category} - {d.description}
                                      </Text>
                                      <Text style={styles.expenseDetailAmount}>
                                        {formatCurrency(d.amount)}
                                      </Text>
                                    </View>
                                  ),
                                )}
                              </View>
                            )}

                          {Array.isArray(req.expenses[0].receiptFiles) &&
                            req.expenses[0].receiptFiles.length > 0 && (
                              <View style={styles.receiptsRow}>
                                {req.expenses[0].receiptFiles.map(
                                  (file: string, idx: number) => (
                                    <TouchableOpacity
                                      key={idx}
                                      style={styles.receiptChip}
                                      onPress={() =>
                                        Alert.alert(
                                          "Receipt",
                                          "Open in browser: " + file,
                                        )
                                      }
                                    >
                                      <Text style={styles.receiptChipText}>
                                        Receipt {idx + 1}
                                      </Text>
                                    </TouchableOpacity>
                                  ),
                                )}
                              </View>
                            )}
                        </View>
                      )}
                  </View>
                ))
              )}
            </View>

            <Footer />
          </ScrollView>
        </SafeAreaView>

        {/* ============================================
            NEW TRAVEL REQUEST MODAL
        ============================================ */}
        <Modal
          visible={showNewModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowNewModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>New Travel Request</Text>
                <TouchableOpacity onPress={() => setShowNewModal(false)}>
                  <MaterialIcons name="close" size={24} color="#64748b" />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.modalForm}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Destination</Text>
                  <TextInput
                    style={styles.fieldInput}
                    placeholder="e.g. Guwahati, Assam"
                    placeholderTextColor="#9ca3af"
                    value={newDestination}
                    onChangeText={setNewDestination}
                  />
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Purpose</Text>
                  <TextInput
                    style={styles.fieldInput}
                    placeholder="e.g. Teacher training workshop"
                    placeholderTextColor="#9ca3af"
                    value={newPurpose}
                    onChangeText={setNewPurpose}
                  />
                </View>

                <View style={styles.rowTwoCols}>
                  <View style={styles.colHalf}>
                    <Text style={styles.fieldLabel}>Start Date</Text>
                    <TextInput
                      style={styles.fieldInput}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor="#9ca3af"
                      value={newStartDate}
                      onChangeText={setNewStartDate}
                    />
                  </View>
                  <View style={styles.colHalf}>
                    <Text style={styles.fieldLabel}>End Date</Text>
                    <TextInput
                      style={styles.fieldInput}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor="#9ca3af"
                      value={newEndDate}
                      onChangeText={setNewEndDate}
                    />
                  </View>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Expected Expenses (INR)</Text>
                  <TextInput
                    style={styles.fieldInput}
                    placeholder="e.g. 5000"
                    placeholderTextColor="#9ca3af"
                    keyboardType="numeric"
                    value={newExpectedExpenses}
                    onChangeText={setNewExpectedExpenses}
                  />
                </View>

                <View style={styles.formButtons}>
                  <TouchableOpacity
                    onPress={() => setShowNewModal(false)}
                    style={styles.cancelButton}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleCreateRequest}
                    disabled={submitting}
                    style={[
                      styles.submitButton,
                      submitting && { opacity: 0.5 },
                    ]}
                  >
                    <Text style={styles.submitButtonText}>
                      {submitting ? "Submitting..." : "Submit Request"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* ============================================
            EXPENSES MODAL
        ============================================ */}
        <Modal
          visible={!!showExpenseModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowExpenseModal(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Submit Actual Expenses</Text>
                <TouchableOpacity onPress={() => setShowExpenseModal(null)}>
                  <MaterialIcons name="close" size={24} color="#64748b" />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.modalForm}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.expenseHeaderRow}>
                  <Text style={styles.fieldLabel}>Expense Items</Text>
                  <TouchableOpacity
                    onPress={() =>
                      setExpenseDetails([
                        ...expenseDetails,
                        { category: "", amount: "", description: "" },
                      ])
                    }
                  >
                    <Text style={styles.addItemText}>+ Add Item</Text>
                  </TouchableOpacity>
                </View>

                {expenseDetails.map((item, idx) => (
                  <View key={idx} style={styles.expenseItemRow}>
                    <View style={{ flex: 1, gap: 6 }}>
                      <TextInput
                        style={styles.smallInput}
                        placeholder="Category"
                        placeholderTextColor="#9ca3af"
                        value={item.category}
                        onChangeText={(v) => {
                          const updated = [...expenseDetails];
                          updated[idx] = { ...updated[idx], category: v };
                          setExpenseDetails(updated);
                        }}
                      />
                      <View style={styles.rowTwoCols}>
                        <TextInput
                          style={[styles.smallInput, styles.colHalf]}
                          placeholder="Amount"
                          placeholderTextColor="#9ca3af"
                          keyboardType="numeric"
                          value={item.amount}
                          onChangeText={(v) => {
                            const updated = [...expenseDetails];
                            updated[idx] = { ...updated[idx], amount: v };
                            setExpenseDetails(updated);
                          }}
                        />
                        <TextInput
                          style={[styles.smallInput, styles.colHalf]}
                          placeholder="Description"
                          placeholderTextColor="#9ca3af"
                          value={item.description}
                          onChangeText={(v) => {
                            const updated = [...expenseDetails];
                            updated[idx] = { ...updated[idx], description: v };
                            setExpenseDetails(updated);
                          }}
                        />
                      </View>
                    </View>
                    {expenseDetails.length > 1 && (
                      <TouchableOpacity
                        onPress={() =>
                          setExpenseDetails(
                            expenseDetails.filter((_, i) => i !== idx),
                          )
                        }
                        style={{ paddingTop: 8 }}
                      >
                        <MaterialIcons
                          name="delete"
                          size={18}
                          color={colors.error}
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}

                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Notes (optional)</Text>
                  <TextInput
                    style={[styles.fieldInput, { height: 70 }]}
                    multiline
                    value={expenseNotes}
                    onChangeText={setExpenseNotes}
                    placeholder="Any additional notes..."
                    placeholderTextColor="#9ca3af"
                  />
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Upload Receipts</Text>
                  <TouchableOpacity
                    style={styles.uploadBtn}
                    onPress={pickReceiptFiles}
                  >
                    <MaterialIcons
                      name="upload-file"
                      size={18}
                      color={colors.primary}
                    />
                    <Text style={styles.uploadBtnText}>Choose Files</Text>
                  </TouchableOpacity>
                  {expenseFiles.length > 0 && (
                    <View style={styles.filesRow}>
                      {expenseFiles.map((f, idx) => (
                        <View key={idx} style={styles.fileChip}>
                          <Text style={styles.fileChipText} numberOfLines={1}>
                            {f.name}
                          </Text>
                          <TouchableOpacity
                            onPress={() =>
                              setExpenseFiles(
                                expenseFiles.filter((_, i) => i !== idx),
                              )
                            }
                          >
                            <MaterialIcons
                              name="close"
                              size={14}
                              color={colors.rose}
                            />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                <View style={styles.formButtons}>
                  <TouchableOpacity
                    onPress={() => setShowExpenseModal(null)}
                    style={styles.cancelButton}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSubmitExpense}
                    disabled={submittingExpense}
                    style={[
                      styles.submitButton,
                      submittingExpense && { opacity: 0.5 },
                    ]}
                  >
                    <Text style={styles.submitButtonText}>
                      {submittingExpense ? "Submitting..." : "Submit Expenses"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* ============================================
            TOAST
        ============================================ */}
        {toast.show && (
          <View style={styles.toast} pointerEvents="none">
            <MaterialIcons name="info" size={18} color="#34d399" />
            <Text style={styles.toastText}>{toast.message}</Text>
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

  // Sidebar (identical pattern)
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
    backgroundColor: colors.primary,
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

  // Header/container
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

  scrollContent: { padding: 20, paddingBottom: 30 },

  // Page header
  pageHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 12,
  },
  pageTitle: {
    fontSize: 30,
    fontWeight: "bold",
    color: colors.onSurface,
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  pageSubtitle: {
    fontSize: 13,
    color: colors.onSurfaceVariant,
  },

  // New request button
  newRequestBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: colors.primary,
    marginBottom: 22,
    alignSelf: "flex-start",
  },
  newRequestBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },

  // Empty state
  emptyState: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(188,202,196,0.2)",
  },
  emptyStateTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.onSurfaceVariant,
    marginTop: 4,
  },
  emptyStateSubtitle: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 4,
  },

  // Request card
  requestCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    gap: 12,
  },
  requestHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },
  requestTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 4,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.onSurface,
    flexShrink: 1,
  },
  requestPurpose: {
    fontSize: 13,
    color: colors.onSurfaceVariant,
  },
  requestMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 10,
    gap: 8,
    flexWrap: "wrap",
  },
  requestDates: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: "#64748b",
  },
  requestEstimate: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.onSurface,
  },

  // Status badge
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  // Rejected
  rejectBox: {
    backgroundColor: colors.roseBg,
    borderWidth: 1,
    borderColor: "#fecdd3",
    borderRadius: 10,
    padding: 10,
  },
  rejectLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#9f1239",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  rejectText: {
    fontSize: 13,
    color: "#9f1239",
  },

  // Approved
  approvedRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  approvedText: {
    flex: 1,
    fontSize: 11,
    fontWeight: "600",
    color: "#059669",
    minWidth: 140,
  },
  submitExpenseBtn: {
    backgroundColor: colors.blue,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },
  submitExpenseBtnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },

  // Completed
  completedBox: {
    backgroundColor: colors.slateBg,
    borderRadius: 10,
    padding: 14,
  },
  completedLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#475569",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  completedTotal: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.onSurface,
  },
  expenseDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  expenseDetailText: {
    flex: 1,
    fontSize: 12,
    color: "#475569",
  },
  expenseDetailAmount: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.onSurface,
  },
  receiptsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10,
  },
  receiptChip: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  receiptChipText: {
    fontSize: 11,
    color: colors.blue,
    fontWeight: "600",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 16,
    maxHeight: "92%",
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
    fontWeight: "700",
    color: colors.onSurface,
  },
  modalForm: {
    padding: 20,
    gap: 4,
  },

  // Form fields
  fieldGroup: { marginBottom: 14 },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  fieldInput: {
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
    fontSize: 14,
    color: colors.onSurface,
    backgroundColor: "#fff",
  },
  rowTwoCols: {
    flexDirection: "row",
    gap: 10,
  },
  colHalf: { flex: 1 },

  // Form buttons
  formButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    paddingTop: 12,
  },
  cancelButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  cancelButtonText: {
    color: colors.onSurface,
    fontSize: 13,
    fontWeight: "600",
  },
  submitButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },

  // Expense items
  expenseHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  addItemText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },
  expenseItemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 10,
  },
  smallInput: {
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    color: colors.onSurface,
    backgroundColor: "#fff",
  },

  // Upload
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: "dashed",
    borderRadius: 10,
    paddingVertical: 14,
    backgroundColor: "#f0fdfa",
  },
  uploadBtnText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "700",
  },
  filesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10,
  },
  fileChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.blueBg,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    maxWidth: "100%",
  },
  fileChipText: {
    fontSize: 11,
    color: "#1e40af",
    fontWeight: "600",
    maxWidth: 160,
  },

  // Toast
  toast: {
    position: "absolute",
    bottom: 24,
    left: 20,
    right: 20,
    backgroundColor: "#0f172a",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    zIndex: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  toastText: {
    flex: 1,
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },

  // Footer
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
