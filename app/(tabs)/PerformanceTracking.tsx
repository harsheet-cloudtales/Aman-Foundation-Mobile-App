// FellowPerformanceScreen.tsx
import { RouteGuard } from "@/components/RouteGuard";
import { useAuth } from "@/lib/useAuth";
import { getUserRole, UserRole } from "@/utils/permissions";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

// ============================================
// THEME COLORS (for footer gradient)
// ============================================
const colors = {
  primary: "#006857",
  primaryContainer: "#00846e",
};

// ============================================
// TYPES
// ============================================
type FellowPerformance = {
  id: string;
  date: string;
  fellow?: { id: string; name: string };
  classGroup?: string;
  subject?: string;
  lessonPlan?: number;
  culture?: number;
  lessonFlow?: number;
  content?: number;
  communityEngagement?: number;
  overallScore?: number;
  strength?: string;
  aod?: string;
  trend?: string;
};

type Fellow = { id: string; name: string };

const RATING_COLUMNS: { key: keyof FellowPerformance; label: string }[] = [
  { key: "lessonPlan", label: "Lesson Plan" },
  { key: "culture", label: "Culture" },
  { key: "lessonFlow", label: "Lesson Flow" },
  { key: "content", label: "Content" },
  { key: "communityEngagement", label: "Community Engagement" },
];

// ============================================
// HELPERS
// ============================================
function formatDate(value: string | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ============================================
// FOOTER COMPONENT  (from Dashboard)
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
// FORM MODAL
// ============================================
function FellowPerformanceForm({
  visible,
  performance,
  fellows,
  token,
  onClose,
  onSave,
}: {
  visible: boolean;
  performance: FellowPerformance | null;
  fellows: Fellow[];
  token: string | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const isEdit = !!performance;
  const [form, setForm] = useState({
    fellowId: "",
    date: new Date().toISOString().slice(0, 10),
    classGroup: "",
    subject: "",
    lessonPlan: "",
    culture: "",
    lessonFlow: "",
    content: "",
    communityEngagement: "",
    strength: "",
    aod: "",
    trend: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    if (performance) {
      setForm({
        fellowId: performance.fellow?.id || "",
        date: performance.date
          ? new Date(performance.date).toISOString().slice(0, 10)
          : new Date().toISOString().slice(0, 10),
        classGroup: performance.classGroup || "",
        subject: performance.subject || "",
        lessonPlan: String(performance.lessonPlan ?? ""),
        culture: String(performance.culture ?? ""),
        lessonFlow: String(performance.lessonFlow ?? ""),
        content: String(performance.content ?? ""),
        communityEngagement: String(performance.communityEngagement ?? ""),
        strength: performance.strength || "",
        aod: performance.aod || "",
        trend: performance.trend || "",
      });
    } else {
      setForm({
        fellowId: "",
        date: new Date().toISOString().slice(0, 10),
        classGroup: "",
        subject: "",
        lessonPlan: "",
        culture: "",
        lessonFlow: "",
        content: "",
        communityEngagement: "",
        strength: "",
        aod: "",
        trend: "",
      });
    }
  }, [visible, performance]);

  const setField = (key: string, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async () => {
    if (!form.fellowId || !form.date) {
      Alert.alert("Missing Fields", "Fellow and Date are required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        fellowId: form.fellowId,
        date: form.date,
        classGroup: form.classGroup || null,
        subject: form.subject || null,
        lessonPlan: form.lessonPlan ? Number(form.lessonPlan) : null,
        culture: form.culture ? Number(form.culture) : null,
        lessonFlow: form.lessonFlow ? Number(form.lessonFlow) : null,
        content: form.content ? Number(form.content) : null,
        communityEngagement: form.communityEngagement
          ? Number(form.communityEngagement)
          : null,
        strength: form.strength || null,
        aod: form.aod || null,
        trend: form.trend || null,
      };
      const url = isEdit
        ? `/api/fellow-performances/${performance!.id}`
        : "/api/fellow-performances";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) onSave();
      else Alert.alert("Error", json.error || "Failed to save record");
    } catch (err) {
      console.error("Save fellow performance error:", err);
      Alert.alert("Error", "Failed to save record");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {isEdit ? "Edit Fellow Performance" : "Add Fellow Performance"}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.inputLabel}>Fellow *</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 4 }}
            >
              {fellows.length === 0 ? (
                <Text style={styles.emptyHint}>No fellows available</Text>
              ) : (
                fellows.map((f) => (
                  <TouchableOpacity
                    key={f.id}
                    onPress={() => setField("fellowId", f.id)}
                    style={[
                      styles.chip,
                      form.fellowId === f.id && styles.chipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        form.fellowId === f.id && styles.chipTextActive,
                      ]}
                    >
                      {f.name}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>

            <Text style={styles.inputLabel}>Date * (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              value={form.date}
              onChangeText={(v) => setField("date", v)}
              placeholder="2026-01-15"
              placeholderTextColor="#9ca3af"
            />

            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Class Group</Text>
                <TextInput
                  style={styles.input}
                  value={form.classGroup}
                  onChangeText={(v) => setField("classGroup", v)}
                  placeholder="Grade 6A"
                  placeholderTextColor="#9ca3af"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Subject</Text>
                <TextInput
                  style={styles.input}
                  value={form.subject}
                  onChangeText={(v) => setField("subject", v)}
                  placeholder="Math"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            <Text style={styles.sectionLabel}>Ratings (0–10)</Text>

            {RATING_COLUMNS.map((col) => (
              <View key={col.key as string}>
                <Text style={styles.inputLabel}>{col.label}</Text>
                <TextInput
                  style={styles.input}
                  value={String(form[col.key as keyof typeof form] || "")}
                  onChangeText={(v) => setField(col.key as string, v)}
                  placeholder="0"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                />
              </View>
            ))}

            <Text style={styles.inputLabel}>Strength</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              value={form.strength}
              onChangeText={(v) => setField("strength", v)}
              placeholder="Notes on strengths"
              placeholderTextColor="#9ca3af"
              multiline
            />

            <Text style={styles.inputLabel}>AOD</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              value={form.aod}
              onChangeText={(v) => setField("aod", v)}
              placeholder="AOD notes"
              placeholderTextColor="#9ca3af"
              multiline
            />

            <Text style={styles.inputLabel}>Trend</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              value={form.trend}
              onChangeText={(v) => setField("trend", v)}
              placeholder="Trend notes"
              placeholderTextColor="#9ca3af"
              multiline
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleSubmit}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitBtnText}>
                    {isEdit ? "Save Changes" : "Add Record"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ============================================
// CONFIRM DELETE MODAL
// ============================================
function ConfirmDeleteModal({
  visible,
  onClose,
  onConfirm,
  title,
  message,
}: {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.confirmOverlay}>
        <View style={styles.confirmBox}>
          <Ionicons name="warning-outline" size={40} color="#ef4444" />
          <Text style={styles.confirmTitle}>{title}</Text>
          <Text style={styles.confirmMessage}>{message}</Text>
          <View style={styles.confirmActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: "#ef4444" }]}
              onPress={onConfirm}
            >
              <Text style={styles.submitBtnText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ============================================
// MAIN SCREEN
// ============================================
export default function FellowPerformanceScreen() {
  const router = useRouter();
  const { user, token, isInitializing, logout: authLogout } = useAuth();
  const currentRole = getUserRole(user);
  const isFellowUser = currentRole === UserRole.FELLOW;
  const hasFullAccess = !isFellowUser;
  const canManage =
    user?.roleName === "ADMIN" || user?.roleName === "PROGRAM_MANAGER";

  // ============ SIDEBAR STATE ============
  const [menuOpen, setMenuOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-width)).current;

  const [educationDropdownOpen, setEducationDropdownOpen] = useState(false);
  const [reportsDropdownOpen, setReportsDropdownOpen] = useState(false);
  const [livelihoodDropdownOpen, setLivelihoodDropdownOpen] = useState(false);
  const [authDropdownOpen, setAuthDropdownOpen] = useState(false);

  const educationRotateAnim = useRef(new Animated.Value(0)).current;
  const reportsRotateAnim = useRef(new Animated.Value(0)).current;
  const livelihoodRotateAnim = useRef(new Animated.Value(0)).current;
  const authRotateAnim = useRef(new Animated.Value(0)).current;

  // ============ DATA STATE ============
  const [records, setRecords] = useState<FellowPerformance[]>([]);
  const [fellows, setFellows] = useState<Fellow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FellowPerformance | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<FellowPerformance | null>(
    null,
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

  const handleNavigation = (route: string) => {
    closeMenu();
    setTimeout(() => {
      router.push(route as any);
    }, 150);
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
  const loadData = useCallback(async () => {
    if (!token) return;
    try {
      const perfRes = await fetch("/api/fellow-performances", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const perfJson = await perfRes.json();
      if (perfJson.success) {
        setRecords(perfJson.data || []);
      } else {
        Alert.alert("Error", perfJson.error || "Failed to load records");
      }
      setLoading(false);
      setRefreshing(false);

      fetch("/api/fellows", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((json) => {
          if (json.success) setFellows(json.data || []);
        })
        .catch((err) => console.error("Background fellows fetch failed:", err));
    } catch (err) {
      console.error("Failed to load fellow performances:", err);
      Alert.alert("Error", "Failed to load records");
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    if (!isInitializing && token && canManage) {
      loadData();
    }
  }, [isInitializing, token, canManage, loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // ============ ACCESS GUARD ============
  useEffect(() => {
    if (user && !canManage) {
      router.replace("/profile");
    }
  }, [user, canManage, router]);

  // ============ HANDLERS ============
  const openAddForm = () => {
    setEditingRecord(null);
    setShowForm(true);
  };

  const openEditForm = (record: FellowPerformance) => {
    setEditingRecord(record);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingRecord(null);
  };

  const handleSaved = async () => {
    closeForm();
    await loadData();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/fellow-performances/${deleteTarget.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setDeleteTarget(null);
        await loadData();
      } else {
        Alert.alert("Error", json.error || "Failed to delete record");
      }
    } catch (err) {
      console.error("Delete error:", err);
      Alert.alert("Error", "Failed to delete record");
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setDateFrom("");
    setDateTo("");
  };

  // ============ FILTERING ============
  const filteredRecords = useMemo(() => {
    return records
      .filter((record) => {
        const name = record.fellow?.name || "";
        if (
          searchQuery &&
          !name.toLowerCase().includes(searchQuery.trim().toLowerCase())
        )
          return false;

        if (dateFrom || dateTo) {
          const recordDate = new Date(record.date).getTime();
          if (
            dateFrom &&
            recordDate < new Date(`${dateFrom}T00:00:00`).getTime()
          )
            return false;
          if (dateTo && recordDate > new Date(`${dateTo}T23:59:59`).getTime())
            return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [records, searchQuery, dateFrom, dateTo]);

  const hasFilters = !!searchQuery || !!dateFrom || !!dateTo;

  // ============ RENDER: CARD ============
  const renderItem = ({ item: record }: { item: FellowPerformance }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{record.fellow?.name || "—"}</Text>
          <Text style={styles.cardMeta}>{formatDate(record.date)}</Text>
        </View>
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreBadgeText}>
            {record.overallScore ?? "—"}
          </Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>Class</Text>
        <Text style={styles.metaValue}>{record.classGroup || "—"}</Text>
      </View>
      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>Subject</Text>
        <Text style={styles.metaValue}>{record.subject || "—"}</Text>
      </View>

      <Text style={styles.sectionHeading}>Ratings</Text>
      <View style={styles.ratingsGrid}>
        {RATING_COLUMNS.map((col) => (
          <View key={col.key as string} style={styles.ratingCell}>
            <Text style={styles.ratingLabel}>{col.label}</Text>
            <Text style={styles.ratingValue}>
              {String(record[col.key] ?? "—")}
            </Text>
          </View>
        ))}
      </View>

      {record.strength ? (
        <View style={{ marginTop: 12 }}>
          <Text style={styles.sectionHeading}>Strength</Text>
          <Text style={styles.noteText}>{record.strength}</Text>
        </View>
      ) : null}

      {record.aod ? (
        <View style={{ marginTop: 10 }}>
          <Text style={styles.sectionHeading}>AOD</Text>
          <Text style={styles.noteText}>{record.aod}</Text>
        </View>
      ) : null}

      {record.trend ? (
        <View style={{ marginTop: 10 }}>
          <Text style={styles.sectionHeading}>Trend</Text>
          <Text style={styles.noteText}>{record.trend}</Text>
        </View>
      ) : null}

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => openEditForm(record)}
        >
          <Ionicons name="create-outline" size={16} color="#006857" />
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => setDeleteTarget(record)}
        >
          <Ionicons name="trash-outline" size={16} color="#ef4444" />
          <Text style={styles.deleteBtnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ============ RENDER: LIST HEADER ============
  const ListHeader = (
    <View>
      <Text style={styles.title}>Fellow Performance Tracking</Text>
      <Text style={styles.subtitle}>
        Classroom observation scores and development notes for each fellow,
        listed by date.
      </Text>

      <TouchableOpacity style={styles.addBtn} onPress={openAddForm}>
        <Ionicons name="add" size={18} color="#fff" />
        <Text style={styles.addBtnText}>Add Fellow Performance</Text>
      </TouchableOpacity>

      <View style={styles.filtersCard}>
        <Text style={styles.filtersLabel}>Filters</Text>

        <Text style={styles.pickerLabel}>Search by Fellow Name</Text>
        <View style={styles.searchWrapper}>
          <Ionicons
            name="search"
            size={16}
            color="#9ca3af"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search fellow..."
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.pickerLabel}>From (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              value={dateFrom}
              onChangeText={setDateFrom}
              placeholder="2026-01-01"
              placeholderTextColor="#9ca3af"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.pickerLabel}>To (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              value={dateTo}
              onChangeText={setDateTo}
              placeholder="2026-12-31"
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        {hasFilters && (
          <TouchableOpacity onPress={clearFilters} style={styles.clearWrap}>
            <Text style={styles.clearFilters}>Clear Filters</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={{ paddingVertical: 40 }}>
          <ActivityIndicator size="large" color="#006857" />
        </View>
      ) : null}
    </View>
  );

  // ============ RENDER: LIST FOOTER (Dashboard Footer) ============
  const ListFooter = !loading ? <Footer /> : null;

  // ============ RENDER ============
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
              <View style={styles.brandIcon}>
                <Ionicons name="business-outline" size={22} color="#fff" />
              </View>
              <View>
                <Text style={styles.brandTitle}>Aman Foundation</Text>
                <Text style={styles.brandSub}>Impact Portal</Text>
              </View>
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
                style={styles.menuItem}
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
                <View style={styles.subNav}>
                  <TouchableOpacity
                    style={styles.subNavItem}
                    onPress={() =>
                      handleNavigation("/education_management_hub")
                    }
                  >
                    <Ionicons
                      name="library-outline"
                      size={16}
                      color="#6b7280"
                    />
                    <Text style={styles.subNavText}>Management Hub</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.subNavItem}
                    onPress={() =>
                      handleNavigation("/education_schools_module")
                    }
                  >
                    <Ionicons
                      name="business-outline"
                      size={16}
                      color="#6b7280"
                    />
                    <Text style={styles.subNavText}>Schools Overview</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.subNavItem}
                    onPress={() =>
                      handleNavigation("/education_fellows_module")
                    }
                  >
                    <Ionicons name="people-outline" size={16} color="#6b7280" />
                    <Text style={styles.subNavText}>Fellows Directory</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.subNavItem}
                    onPress={() =>
                      handleNavigation("/education_students_module")
                    }
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={16}
                      color="#6b7280"
                    />
                    <Text style={styles.subNavText}>Active Programs</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.subNavItem}
                    onPress={() => handleNavigation("/education_pta_programs")}
                  >
                    <Ionicons
                      name="document-text-outline"
                      size={16}
                      color="#6b7280"
                    />
                    <Text style={styles.subNavText}>PTA and Programs</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.subNavItem}
                    onPress={() => handleNavigation("/after-school-students")}
                  >
                    <Ionicons
                      name="document-text-outline"
                      size={16}
                      color="#6b7280"
                    />
                    <Text style={styles.subNavText}>After-School-Students</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.subNavItem}
                    onPress={() => handleNavigation("/after-school-centres")}
                  >
                    <Ionicons
                      name="document-text-outline"
                      size={16}
                      color="#6b7280"
                    />
                    <Text style={styles.subNavText}>After-School-Centres</Text>
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

            {/* FELLOW OBERVATION — ACTIVE */}
            <View>
              <TouchableOpacity
                style={styles.menuItem}
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
                <View style={styles.subNav}>
                  <TouchableOpacity
                    style={styles.subNavItem}
                    onPress={() => handleNavigation("/PM Reflection")}
                  >
                    <Ionicons
                      name="stats-chart-outline"
                      size={16}
                      color="#6b7280"
                    />
                    <Text style={styles.subNavText}>PM Reflection</Text>
                  </TouchableOpacity>

                  {/* ACTIVE — Fellow Performance Tracking */}
                  <TouchableOpacity
                    style={[styles.subNavItem, styles.subNavItemActive]}
                    onPress={() => closeMenu()}
                  >
                    <Ionicons
                      name="clipboard-outline"
                      size={16}
                      color="#047857"
                    />
                    <Text style={[styles.subNavText, styles.subNavTextActive]}>
                      Fellow Performance Tracking
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* LIVELIHOOD DROPDOWN */}
            <View>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={toggleLivelihoodDropdown}
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons name="leaf-outline" size={20} color="#4b5563" />
                  <Text style={styles.menuText}>Livelihood</Text>
                </View>
                <Animated.View
                  style={{ transform: [{ rotate: rotateLivelihood }] }}
                >
                  <Ionicons name="chevron-down" size={20} color="#6b7280" />
                </Animated.View>
              </TouchableOpacity>

              {livelihoodDropdownOpen && (
                <View style={styles.subNav}>
                  <TouchableOpacity
                    style={styles.subNavItem}
                    onPress={() =>
                      handleNavigation("/livelihood_management_hub")
                    }
                  >
                    <Ionicons name="apps-outline" size={16} color="#6b7280" />
                    <Text style={styles.subNavText}>Management Hub</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.subNavItem}
                    onPress={() =>
                      handleNavigation("/livelihood_goat_rearing_1")
                    }
                  >
                    <Ionicons name="paw-outline" size={16} color="#6b7280" />
                    <Text style={styles.subNavText}>Goat Rearing</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.subNavItem}
                    onPress={() =>
                      handleNavigation("/livelihood_sugarcane_cultivation")
                    }
                  >
                    <Ionicons name="leaf-outline" size={16} color="#6b7280" />
                    <Text style={styles.subNavText}>Agriculture Support</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.subNavItem}
                    onPress={() =>
                      handleNavigation("/beneficiary_master_profile")
                    }
                  >
                    <Ionicons
                      name="people-circle-outline"
                      size={16}
                      color="#6b7280"
                    />
                    <Text style={styles.subNavText}>Beneficiaries</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* FULL ACCESS ITEMS */}
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

            {/* ACCOUNT */}
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
                style={styles.menuItem}
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
                <View style={styles.subNav}>
                  <TouchableOpacity
                    style={styles.subNavItem}
                    onPress={() => handleNavigation("/login")}
                  >
                    <Ionicons name="log-in-outline" size={16} color="#6b7280" />
                    <Text style={styles.subNavText}>Login Page</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.subNavItem}
                    onPress={() => handleNavigation("/registration")}
                  >
                    <Ionicons
                      name="person-add-outline"
                      size={16}
                      color="#6b7280"
                    />
                    <Text style={styles.subNavText}>Register Page</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.subNavItem, styles.subNavItemLogout]}
                    onPress={handleLogout}
                  >
                    <Ionicons
                      name="log-out-outline"
                      size={16}
                      color="#ef4444"
                    />
                    <Text style={[styles.subNavText, styles.subNavTextLogout]}>
                      Logout
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* HELP */}
            <View style={styles.sidebarFooter}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => closeMenu()}
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons
                    name="help-circle-outline"
                    size={20}
                    color="#4b5563"
                  />
                  <Text style={styles.menuText}>Help</Text>
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>

        {/* ============================================
            MAIN CONTENT
        ============================================ */}
        <View style={styles.container}>
          {/* HEADER BAR */}
          <View style={styles.headerBar}>
            <TouchableOpacity onPress={toggleMenu}>
              <Ionicons name="menu-outline" size={26} color="#1f2937" />
            </TouchableOpacity>
            <Text style={styles.headerBarTitle}>Fellow Performance</Text>
            <View style={styles.headerIcons}>
              <TouchableOpacity
                onPress={() =>
                  Alert.alert("Notifications", "No new notifications")
                }
              >
                <Ionicons
                  name="notifications-outline"
                  size={22}
                  color="#1f2937"
                />
              </TouchableOpacity>
            </View>
          </View>

          <FlatList
            data={loading ? [] : filteredRecords}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={ListHeader}
            ListFooterComponent={ListFooter}
            ListEmptyComponent={
              !loading ? (
                <View style={styles.emptyState}>
                  <Ionicons
                    name="document-text-outline"
                    size={40}
                    color="#9ca3af"
                  />
                  <Text style={styles.emptyText}>
                    {records.length === 0
                      ? "No fellow performance records found."
                      : "No records match your filters."}
                  </Text>
                </View>
              ) : null
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#006857"]}
                tintColor="#006857"
              />
            }
            initialNumToRender={8}
            windowSize={5}
            removeClippedSubviews
          />
        </View>

        {/* FORM MODAL */}
        <FellowPerformanceForm
          visible={showForm}
          performance={editingRecord}
          fellows={fellows}
          token={token}
          onClose={closeForm}
          onSave={handleSaved}
        />

        {/* DELETE CONFIRM */}
        <ConfirmDeleteModal
          visible={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
          title="Delete Fellow Performance"
          message="Are you sure you want to delete this fellow performance record? This action is permanent and cannot be undone."
        />
      </View>
    </RouteGuard>
  );
}

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  // Overlay
  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.3)",
    zIndex: 5,
  },

  // ============ SIDEBAR ============
  sidebar: {
    position: "absolute",
    width: width * 0.78,
    maxWidth: 300,
    height: "100%",
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 56 : 40,
    paddingBottom: 20,
    zIndex: 10,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  brandContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  brandIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#047857",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  brandTitle: { fontSize: 16, fontWeight: "700", color: "#134e4a" },
  brandSub: { fontSize: 11, color: "#3d4945" },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 40,
    marginBottom: 4,
  },
  menuItemLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  menuText: {
    marginLeft: 12,
    fontSize: 14,
    color: "#4b5563",
    fontWeight: "500",
  },
  subNav: {
    marginLeft: 20,
    marginTop: 2,
    marginBottom: 8,
    borderLeftWidth: 2,
    borderLeftColor: "#d1fae5",
    paddingLeft: 16,
  },
  subNavItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 9,
    paddingHorizontal: 4,
    gap: 10,
    borderRadius: 8,
  },
  subNavItemActive: { backgroundColor: "#e8f5e9" },
  subNavItemLogout: {
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    marginTop: 4,
    paddingTop: 12,
  },
  subNavText: { fontSize: 13, fontWeight: "500", color: "#4b5563" },
  subNavTextActive: { color: "#047857", fontWeight: "700" },
  subNavTextLogout: { color: "#ef4444", fontWeight: "600" },
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
  sidebarFooter: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },

  // ============ MAIN ============
  container: { flex: 1, backgroundColor: "#f7faf9" },
  scrollContent: { padding: 16, paddingBottom: 60 },

  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 56 : 40,
    paddingBottom: 12,
    backgroundColor: "#f7faf9",
  },
  headerBarTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    flex: 1,
    textAlign: "center",
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  // Title
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#191c1d",
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: "#4b5563",
    marginBottom: 16,
    lineHeight: 19,
  },

  // Add
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#006857",
    paddingVertical: 12,
    borderRadius: 999,
    marginBottom: 16,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    color: "#fff",
  },

  // Filters
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
  searchWrapper: { position: "relative", justifyContent: "center" },
  searchIcon: { position: "absolute", left: 14, zIndex: 1 },
  searchInput: {
    backgroundColor: "#f1f3f4",
    borderRadius: 10,
    paddingLeft: 40,
    paddingRight: 14,
    paddingVertical: Platform.OS === "ios" ? 12 : 10,
    fontSize: 14,
    color: "#191c1d",
  },
  clearWrap: { alignSelf: "flex-end", marginTop: 12 },
  clearFilters: { color: "#006857", fontSize: 13, fontWeight: "700" },

  // Empty
  emptyState: { padding: 40, alignItems: "center", gap: 10 },
  emptyText: {
    color: "#9ca3af",
    fontSize: 13,
    textAlign: "center",
  },

  // Card
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
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
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 12,
  },
  cardTitle: { fontSize: 15, fontWeight: "800", color: "#191c1d" },
  cardMeta: { fontSize: 11, color: "#6b7280", marginTop: 2 },
  scoreBadge: {
    minWidth: 44,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#d0f5ea",
    alignItems: "center",
    justifyContent: "center",
  },
  scoreBadgeText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#006857",
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  metaLabel: { fontSize: 12, color: "#6b7280", fontWeight: "600" },
  metaValue: { fontSize: 13, color: "#191c1d", fontWeight: "600" },
  sectionHeading: {
    fontSize: 10,
    letterSpacing: 1.5,
    color: "#9ca3af",
    textTransform: "uppercase",
    fontWeight: "700",
    marginTop: 12,
    marginBottom: 8,
  },
  ratingsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  ratingCell: {
    width: "31%",
    backgroundColor: "#f1f3f4",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
  },
  ratingLabel: {
    fontSize: 9,
    color: "#6b7280",
    textAlign: "center",
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  ratingValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#191c1d",
    marginTop: 4,
  },
  noteText: { fontSize: 12, color: "#4b5563", lineHeight: 17 },
  cardActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 16,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  editBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  editBtnText: { fontSize: 13, fontWeight: "700", color: "#006857" },
  deleteBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  deleteBtnText: { fontSize: 13, fontWeight: "700", color: "#ef4444" },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
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
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  modalTitle: { fontSize: 16, fontWeight: "800", color: "#191c1d" },
  inputLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: 12,
    marginBottom: 4,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#006857",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 16,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
    fontSize: 14,
    color: "#191c1d",
    backgroundColor: "#fff",
  },
  inputMultiline: { minHeight: 60, textAlignVertical: "top" },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#fff",
    marginRight: 6,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  chipActive: { backgroundColor: "#006857", borderColor: "#006857" },
  chipText: { fontSize: 12, color: "#191c1d", fontWeight: "600" },
  chipTextActive: { color: "#fff" },
  emptyHint: { fontSize: 12, color: "#9ca3af", paddingHorizontal: 8 },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  cancelBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  cancelBtnText: { fontSize: 13, fontWeight: "600", color: "#191c1d" },
  submitBtn: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#006857",
    minWidth: 110,
    alignItems: "center",
  },
  submitBtnText: { fontSize: 13, fontWeight: "700", color: "#fff" },

  // Confirm
  confirmOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  confirmBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 22,
    alignItems: "center",
    width: "100%",
    maxWidth: 380,
  },
  confirmTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#191c1d",
    marginTop: 12,
    textAlign: "center",
  },
  confirmMessage: {
    fontSize: 13,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 18,
  },
  confirmActions: { flexDirection: "row", gap: 10, marginTop: 20 },

  // ============ FOOTER (from Dashboard) ============
  footer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginTop: 24,
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
