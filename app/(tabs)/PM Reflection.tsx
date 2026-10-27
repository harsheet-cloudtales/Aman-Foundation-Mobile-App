// FellowPmReflectionScreen.tsx
import { RouteGuard } from "@/components/RouteGuard";
import { useAuth } from "@/lib/useAuth";
import { getUserRole, UserRole } from "@/utils/permissions";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
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
// API BASE URL (REQUIRED FOR REACT NATIVE)
// ============================================
const API_BASE = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

const apiFetch = (path: string, init?: RequestInit) =>
  fetch(`${API_BASE}${path}`, init);

// ============================================
// ROLE CONFIG — who can manage/view PM Reflections
// ============================================
// Anyone in this list can see + edit PM Reflections.
// Fellows are explicitly excluded (they see their own data elsewhere).
const PM_REFLECTION_ROLES = [
  "ADMIN",
  "SUPER_ADMIN",
  "PROGRAM_MANAGER",
  "PROGRAM_DIRECTOR",
  "PROGRAM_COORDINATOR",
  "PROGRAM_LEAD",
  "FIELD_EXECUTIVE",
  "ACCOUNTANT",
  "CLASS_ASSISTANT",
  "Administrator",
];

// ============================================
// CONSTANTS — mirrors pmReflectionConstants
// ============================================
const COMPETENCY_CATEGORIES = [
  { key: "core", label: "Core Competencies", prefix: "C" },
  { key: "leadership", label: "Leadership", prefix: "L" },
  { key: "management", label: "Management", prefix: "M" },
  { key: "development", label: "Development", prefix: "D" },
];

const CATEGORY_COUNT = 5;

const MATRIX_CELLS = [
  { key: "skill_will", label: "Skill / Will" },
  { key: "skill_skill", label: "Skill / Skill" },
  { key: "will_will", label: "Will / Will" },
  { key: "will_skill", label: "Will / Skill" },
];

const MATRIX_HEADERS = MATRIX_CELLS.map((cell) => ({
  key: cell.key,
  label: cell.key.replace("_", "/"),
  full: cell.label,
}));

const LEVEL_STYLES: Record<string, { bg: string; text: string }> = {
  Novice: { bg: "#fee2e2", text: "#b91c1c" },
  Beginner: { bg: "#fef3c7", text: "#b45309" },
  Proficient: { bg: "#d1fae5", text: "#047857" },
  Advanced: { bg: "#dbeafe", text: "#1d4ed8" },
};

const LEVEL_ABBR: Record<string, string> = {
  Novice: "N",
  Beginner: "B",
  Proficient: "P",
  Advanced: "A",
};

// ============================================
// TYPES
// ============================================
type Reflection = {
  id: string;
  date: string;
  responses?: Record<string, string>;
  matrix?: Record<string, string>;
  notes?: string;
  author?: { name: string };
};

type FellowRow = {
  id: string;
  name: string;
  cohort?: string;
  latestReflection?: Reflection;
};

type Fellow = { id: string; name: string };

// ============================================
// PM REFLECTION FORM MODAL
// ============================================
function PMReflectionForm({
  visible,
  fellowId,
  reflection,
  token,
  onClose,
  onSave,
}: {
  visible: boolean;
  fellowId: string | null;
  reflection: Reflection | null;
  token: string | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const isEdit = !!reflection;
  const [date, setDate] = useState(
    reflection?.date
      ? new Date(reflection.date).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10),
  );
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [matrix, setMatrix] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible && reflection) {
      setDate(new Date(reflection.date).toISOString().slice(0, 10));
      setResponses(reflection.responses || {});
      setMatrix(reflection.matrix || {});
      setNotes(reflection.notes || "");
    } else if (visible && !reflection) {
      setDate(new Date().toISOString().slice(0, 10));
      setResponses({});
      setMatrix({});
      setNotes("");
    }
  }, [visible, reflection]);

  const cycleLevel = (key: string) => {
    const order = ["Novice", "Beginner", "Proficient", "Advanced"];
    const current = responses[key] || "";
    const next = order[(order.indexOf(current) + 1) % order.length];
    setResponses((r) => ({ ...r, [key]: next }));
  };

  const cycleMatrix = (key: string) => {
    const colors = ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6"];
    const current = matrix[key] || "#d1d5db";
    const idx = colors.indexOf(current);
    setMatrix((m) => ({ ...m, [key]: colors[(idx + 1) % colors.length] }));
  };

  const handleSubmit = async () => {
    if (!fellowId || !date) {
      Alert.alert("Missing Fields", "Fellow and Date are required.");
      return;
    }
    setSaving(true);
    try {
      const url = isEdit
        ? `/api/fellows/${fellowId}/pm-reflections/${reflection!.id}`
        : `/api/fellows/${fellowId}/pm-reflections`;
      const method = isEdit ? "PUT" : "POST";
      const res = await apiFetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ date, responses, matrix, notes }),
      });
      const json = await res.json();
      if (json.success) {
        onSave();
      } else {
        Alert.alert("Error", json.error || "Failed to save reflection");
      }
    } catch (err) {
      console.error("Save PM reflection error:", err);
      Alert.alert("Error", "Failed to save reflection");
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
              {isEdit ? "Edit PM Reflection" : "Add PM Reflection"}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.inputLabel}>Date * (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              value={date}
              onChangeText={setDate}
              placeholder="2026-01-15"
              placeholderTextColor="#9ca3af"
            />

            <Text style={styles.sectionLabel}>Competency Ratings</Text>
            <Text style={styles.helperText}>
              Tap a cell to cycle through Novice → Beginner → Proficient →
              Advanced.
            </Text>

            {COMPETENCY_CATEGORIES.map((cat) => (
              <View key={cat.key} style={{ marginTop: 12 }}>
                <Text style={styles.categoryLabel}>{cat.label}</Text>
                <View style={styles.competencyGrid}>
                  {Array.from({ length: CATEGORY_COUNT }, (_, i) => {
                    const key = `${cat.prefix}${i + 1}`;
                    const level = responses[key];
                    const style = level ? LEVEL_STYLES[level] : null;
                    return (
                      <TouchableOpacity
                        key={key}
                        style={[
                          styles.competencyChip,
                          style && { backgroundColor: style.bg },
                        ]}
                        onPress={() => cycleLevel(key)}
                      >
                        <Text
                          style={[
                            styles.competencyChipKey,
                            style && { color: style.text },
                          ]}
                        >
                          {key}
                        </Text>
                        <Text
                          style={[
                            styles.competencyChipValue,
                            style && { color: style.text },
                          ]}
                        >
                          {level ? LEVEL_ABBR[level] : "—"}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}

            <Text style={styles.sectionLabel}>Skill / Will Matrix</Text>
            <Text style={styles.helperText}>
              Tap a cell to cycle through colors.
            </Text>
            <View style={styles.matrixGrid}>
              {MATRIX_HEADERS.map((header) => (
                <TouchableOpacity
                  key={header.key}
                  style={styles.matrixCell}
                  onPress={() => cycleMatrix(header.key)}
                >
                  <View
                    style={[
                      styles.matrixSwatch,
                      { backgroundColor: matrix[header.key] || "#d1d5db" },
                    ]}
                  />
                  <Text style={styles.matrixCellLabel}>{header.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Notes</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add observation notes..."
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
                    {isEdit ? "Save Changes" : "Add Reflection"}
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
// PM REFLECTION VIEWER MODAL
// ============================================
function PMReflectionViewer({
  visible,
  reflection,
  onClose,
}: {
  visible: boolean;
  reflection: Reflection | null;
  onClose: () => void;
}) {
  if (!reflection) return null;
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
            <Text style={styles.modalTitle}>Reflection Details</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.viewerDate}>
              {new Date(reflection.date).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>

            {reflection.author?.name && (
              <Text style={styles.viewerAuthor}>
                Reviewed by {reflection.author.name}
              </Text>
            )}

            <Text style={styles.sectionLabel}>Competency Ratings</Text>
            {COMPETENCY_CATEGORIES.map((cat) => (
              <View key={cat.key} style={{ marginTop: 8 }}>
                <Text style={styles.categoryLabel}>{cat.label}</Text>
                <View style={styles.competencyGrid}>
                  {Array.from({ length: CATEGORY_COUNT }, (_, i) => {
                    const key = `${cat.prefix}${i + 1}`;
                    const level = reflection.responses?.[key];
                    const style = level ? LEVEL_STYLES[level] : null;
                    return (
                      <View
                        key={key}
                        style={[
                          styles.competencyChip,
                          style && { backgroundColor: style.bg },
                        ]}
                      >
                        <Text
                          style={[
                            styles.competencyChipKey,
                            style && { color: style.text },
                          ]}
                        >
                          {key}
                        </Text>
                        <Text
                          style={[
                            styles.competencyChipValue,
                            style && { color: style.text },
                          ]}
                        >
                          {level ? LEVEL_ABBR[level] : "—"}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            ))}

            <Text style={styles.sectionLabel}>Skill / Will Matrix</Text>
            <View style={styles.matrixGrid}>
              {MATRIX_HEADERS.map((header) => (
                <View key={header.key} style={styles.matrixCell}>
                  <View
                    style={[
                      styles.matrixSwatch,
                      {
                        backgroundColor:
                          reflection.matrix?.[header.key] || "#d1d5db",
                      },
                    ]}
                  />
                  <Text style={styles.matrixCellLabel}>{header.label}</Text>
                </View>
              ))}
            </View>

            {reflection.notes ? (
              <>
                <Text style={styles.sectionLabel}>Notes</Text>
                <Text style={styles.notesText}>{reflection.notes}</Text>
              </>
            ) : null}
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
export default function FellowPmReflectionScreen() {
  const router = useRouter();
  const { user, token, isInitializing, logout: authLogout } = useAuth();
  const currentRole = getUserRole(user);
  const isFellowUser = currentRole === UserRole.FELLOW;
  const hasFullAccess = !isFellowUser;

  // 👈 FIX: canManage now includes all non-Fellow roles
  const canManage =
    !!user?.roleName && PM_REFLECTION_ROLES.includes(user.roleName);

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
  const [rows, setRows] = useState<FellowRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [formFellowId, setFormFellowId] = useState<string | null>(null);
  const [editingReflection, setEditingReflection] = useState<Reflection | null>(
    null,
  );

  const [historyFellow, setHistoryFellow] = useState<Fellow | null>(null);
  const [historyReflections, setHistoryReflections] = useState<Reflection[]>(
    [],
  );
  const [historyLoading, setHistoryLoading] = useState(false);

  const [viewingReflection, setViewingReflection] = useState<Reflection | null>(
    null,
  );

  const [deleteTarget, setDeleteTarget] = useState<{
    fellowId: string;
    reflectionId: string;
  } | null>(null);

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
  const loadRows = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch("/api/pm-reflections", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) setRows(json.data || []);
      else Alert.alert("Error", json.error || "Failed to load reflections");
    } catch (err) {
      console.error("Failed to load PM reflections:", err);
      Alert.alert("Error", "Failed to load PM reflections");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    if (isInitializing) return;
    if (token && user && canManage) {
      loadRows();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitializing, token, user, canManage]);

  const onRefresh = () => {
    setRefreshing(true);
    loadRows();
  };

  // ============ FORM HANDLERS ============
  const openAddForm = (fellowId: string) => {
    setFormFellowId(fellowId);
    setEditingReflection(null);
  };

  const openEditForm = (fellowId: string, reflection: Reflection | null) => {
    setFormFellowId(fellowId);
    setEditingReflection(reflection);
  };

  const closeForm = () => {
    setFormFellowId(null);
    setEditingReflection(null);
  };

  const handleSaved = async () => {
    closeForm();
    await loadRows();
    if (historyFellow) {
      await loadHistory(historyFellow.id);
    }
  };

  // ============ HISTORY ============
  const loadHistory = useCallback(
    async (fellowId: string) => {
      setHistoryLoading(true);
      try {
        const res = await apiFetch(`/api/fellows/${fellowId}/pm-reflections`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (json.success) setHistoryReflections(json.data || []);
        else Alert.alert("Error", json.error || "Failed to load history");
      } catch (err) {
        console.error("Failed to load reflection history:", err);
        Alert.alert("Error", "Failed to load history");
      } finally {
        setHistoryLoading(false);
      }
    },
    [token],
  );

  const openHistory = (fellow: Fellow) => {
    setHistoryFellow(fellow);
    setHistoryReflections([]);
    loadHistory(fellow.id);
  };

  const closeHistory = () => {
    setHistoryFellow(null);
    setHistoryReflections([]);
  };

  // ============ DELETE ============
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { fellowId, reflectionId } = deleteTarget;
    try {
      const res = await apiFetch(
        `/api/fellows/${fellowId}/pm-reflections/${reflectionId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const json = await res.json();
      if (json.success) {
        setDeleteTarget(null);
        await loadRows();
        if (historyFellow) await loadHistory(historyFellow.id);
      } else {
        Alert.alert("Error", json.error || "Failed to delete reflection");
      }
    } catch (err) {
      console.error("Delete PM reflection error:", err);
      Alert.alert("Error", "Failed to delete reflection");
    }
  };

  // ============ RENDER HELPERS ============
  const renderLevel = (reflection: Reflection | undefined, key: string) => {
    const level = reflection?.responses?.[key];
    if (!level) return <Text style={styles.dashText}>—</Text>;
    const style = LEVEL_STYLES[level];
    return (
      <View style={[styles.levelBadge, style && { backgroundColor: style.bg }]}>
        <Text style={[styles.levelBadgeText, style && { color: style.text }]}>
          {LEVEL_ABBR[level] || level.charAt(0)}
        </Text>
      </View>
    );
  };

  const renderMatrix = (reflection: Reflection | undefined, key: string) => (
    <View
      style={[
        styles.matrixSwatchSmall,
        { backgroundColor: reflection?.matrix?.[key] || "#d1d5db" },
      ]}
    />
  );

  // ============ LOADING / ACCESS GATES ============
  if (isInitializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#006857" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // 👈 Access gate — only shows for users who aren't in PM_REFLECTION_ROLES
  if (user && !canManage) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="lock-closed-outline" size={48} color="#ef4444" />
        <Text style={styles.loadingText}>Access restricted</Text>
        <Text style={styles.accessRoleText}>
          Your role: {user?.roleName || "unknown"}
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#006857" />
        <Text style={styles.loadingText}>Loading PM reflections...</Text>
      </View>
    );
  }

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
            SIDEBAR
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

            {/* FELLOW OBSERVATION — ACTIVE */}
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
                    style={[styles.subNavItem, styles.subNavItemActive]}
                    onPress={() => closeMenu()}
                  >
                    <Ionicons
                      name="stats-chart-outline"
                      size={16}
                      color="#047857"
                    />
                    <Text style={[styles.subNavText, styles.subNavTextActive]}>
                      PM Reflection
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.subNavItem}
                    onPress={() => handleNavigation("/PerformanceTracking")}
                  >
                    <Ionicons
                      name="clipboard-outline"
                      size={16}
                      color="#6b7280"
                    />
                    <Text style={styles.subNavText}>
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
          {/* HEADER */}
          <View style={styles.headerBar}>
            <TouchableOpacity onPress={toggleMenu}>
              <Ionicons name="menu-outline" size={26} color="#1f2937" />
            </TouchableOpacity>
            <Text style={styles.headerBarTitle}>PM Reflection</Text>
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

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#006857"]}
                tintColor="#006857"
              />
            }
          >
            {/* Back Link */}
            <TouchableOpacity
              style={styles.backLink}
              onPress={() => handleNavigation("/education_fellows_module")}
            >
              <Ionicons name="arrow-back" size={14} color="#0f766e" />
              <Text style={styles.backLinkText}>Back to Fellows</Text>
            </TouchableOpacity>

            {/* Title */}
            <Text style={styles.title}>PM Reflection</Text>
            <Text style={styles.subtitle}>
              Latest Leadership Development Journey Conversation reflection for
              each fellow. Use the actions to edit the latest reflection, add a
              new dated reflection, or review the full history.
            </Text>

            {/* Legend */}
            <View style={styles.legendCard}>
              <Text style={styles.legendTitle}>RATING LEGEND</Text>
              <View style={styles.legendRow}>
                {Object.entries(LEVEL_ABBR).map(([level, abbr]) => {
                  const style = LEVEL_STYLES[level];
                  return (
                    <View key={level} style={styles.legendItem}>
                      <View
                        style={[
                          styles.levelBadge,
                          style && { backgroundColor: style.bg },
                        ]}
                      >
                        <Text
                          style={[
                            styles.levelBadgeText,
                            style && { color: style.text },
                          ]}
                        >
                          {abbr}
                        </Text>
                      </View>
                      <Text style={styles.legendText}>{level}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Fellows Cards */}
            {rows.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={40} color="#9ca3af" />
                <Text style={styles.emptyText}>No fellows found.</Text>
              </View>
            ) : (
              rows.map((row) => {
                const reflection = row.latestReflection;
                return (
                  <View key={row.id} style={styles.card}>
                    {/* Card Header */}
                    <View style={styles.cardHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.cardTitle}>{row.name}</Text>
                        {row.cohort ? (
                          <Text style={styles.cardMeta}>{row.cohort}</Text>
                        ) : null}
                      </View>
                    </View>

                    {/* Competencies */}
                    <Text style={styles.sectionHeading}>Competencies</Text>
                    {COMPETENCY_CATEGORIES.map((cat) => (
                      <View key={cat.key} style={{ marginBottom: 8 }}>
                        <Text style={styles.categoryLabel}>{cat.label}</Text>
                        <View style={styles.competencyGrid}>
                          {Array.from({ length: CATEGORY_COUNT }, (_, i) => {
                            const key = `${cat.prefix}${i + 1}`;
                            return (
                              <View
                                key={key}
                                style={styles.competencyChipSmall}
                              >
                                <Text style={styles.competencyChipKey}>
                                  {key}
                                </Text>
                                {renderLevel(reflection, key)}
                              </View>
                            );
                          })}
                        </View>
                      </View>
                    ))}

                    {/* Skill/Will Matrix */}
                    <Text style={styles.sectionHeading}>
                      Skill / Will Matrix
                    </Text>
                    <View style={styles.matrixRow}>
                      {MATRIX_HEADERS.map((header) => (
                        <View key={header.key} style={styles.matrixItem}>
                          {renderMatrix(reflection, header.key)}
                          <Text style={styles.matrixItemLabel}>
                            {header.label}
                          </Text>
                        </View>
                      ))}
                    </View>

                    {/* Notes */}
                    {reflection?.notes ? (
                      <View style={{ marginTop: 12 }}>
                        <Text style={styles.sectionHeading}>Notes</Text>
                        <Text style={styles.notesText}>{reflection.notes}</Text>
                      </View>
                    ) : null}

                    {/* Actions */}
                    <View style={styles.cardActions}>
                      <TouchableOpacity
                        style={[
                          styles.actionBtn,
                          !reflection && styles.actionBtnDisabled,
                        ]}
                        disabled={!reflection}
                        onPress={() => openEditForm(row.id, reflection || null)}
                      >
                        <Ionicons
                          name="create-outline"
                          size={14}
                          color={reflection ? "#006857" : "#9ca3af"}
                        />
                        <Text
                          style={[
                            styles.actionBtnText,
                            !reflection && styles.actionBtnTextDisabled,
                          ]}
                        >
                          Edit latest
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => openAddForm(row.id)}
                      >
                        <Ionicons
                          name="add-outline"
                          size={14}
                          color="#006857"
                        />
                        <Text style={styles.actionBtnText}>Add new</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.actionBtn,
                          !reflection && styles.actionBtnDisabled,
                        ]}
                        disabled={!reflection}
                        onPress={() => openHistory(row)}
                      >
                        <Ionicons
                          name="time-outline"
                          size={14}
                          color={reflection ? "#006857" : "#9ca3af"}
                        />
                        <Text
                          style={[
                            styles.actionBtnText,
                            !reflection && styles.actionBtnTextDisabled,
                          ]}
                        >
                          History
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>
        </View>

        {/* FORM MODAL */}
        <PMReflectionForm
          visible={!!formFellowId}
          fellowId={formFellowId}
          reflection={editingReflection}
          token={token}
          onClose={closeForm}
          onSave={handleSaved}
        />

        {/* VIEWER MODAL */}
        <PMReflectionViewer
          visible={!!viewingReflection}
          reflection={viewingReflection}
          onClose={() => setViewingReflection(null)}
        />

        {/* HISTORY MODAL */}
        <Modal
          visible={!!historyFellow}
          animationType="slide"
          transparent
          onRequestClose={closeHistory}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { maxHeight: "85%" }]}>
              <View style={styles.modalHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle}>Reflection History</Text>
                  {historyFellow && (
                    <Text style={styles.modalSubtitle}>
                      {historyFellow.name}
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.addSmallBtn}
                  onPress={() => {
                    if (historyFellow) {
                      const id = historyFellow.id;
                      closeHistory();
                      openAddForm(id);
                    }
                  }}
                >
                  <Ionicons name="add" size={14} color="#fff" />
                  <Text style={styles.addSmallBtnText}>Add new</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={closeHistory}>
                  <Ionicons name="close" size={22} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {historyLoading ? (
                  <View style={{ paddingVertical: 30 }}>
                    <ActivityIndicator color="#006857" />
                  </View>
                ) : historyReflections.length === 0 ? (
                  <Text style={styles.emptyText}>
                    No reflections recorded yet.
                  </Text>
                ) : (
                  historyReflections.map((reflection) => {
                    const matrixColors = reflection.matrix || {};
                    return (
                      <View key={reflection.id} style={styles.historyItem}>
                        <TouchableOpacity
                          style={{ flex: 1 }}
                          onPress={() => setViewingReflection(reflection)}
                        >
                          <Text style={styles.historyDate}>
                            {new Date(reflection.date).toLocaleDateString(
                              undefined,
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              },
                            )}
                          </Text>
                          <View style={styles.historyMatrixRow}>
                            {MATRIX_HEADERS.map((header) => (
                              <View
                                key={header.key}
                                style={[
                                  styles.matrixSwatchSmall,
                                  {
                                    backgroundColor:
                                      matrixColors[header.key] || "#d1d5db",
                                  },
                                ]}
                              />
                            ))}
                          </View>
                          {reflection.author?.name && (
                            <Text style={styles.historyAuthor}>
                              Reviewed by {reflection.author.name}
                            </Text>
                          )}
                        </TouchableOpacity>

                        <View style={styles.historyActions}>
                          <TouchableOpacity
                            onPress={() => {
                              const id = historyFellow!.id;
                              closeHistory();
                              openEditForm(id, reflection);
                            }}
                          >
                            <Text style={styles.historyEdit}>Edit</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => {
                              if (historyFellow) {
                                setDeleteTarget({
                                  fellowId: historyFellow.id,
                                  reflectionId: reflection.id,
                                });
                              }
                            }}
                          >
                            <Ionicons
                              name="trash-outline"
                              size={18}
                              color="#ef4444"
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* DELETE CONFIRM MODAL */}
        <ConfirmDeleteModal
          visible={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
          title="Delete PM Reflection"
          message="Are you sure you want to delete this PM reflection? This action is permanent and cannot be undone."
        />
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
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#3d4945",
  },
  accessRoleText: {
    marginTop: 8,
    fontSize: 12,
    color: "#9ca3af",
    fontStyle: "italic",
  },

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
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
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
  subNavText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#4b5563",
  },
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
  scrollContent: { padding: 16, paddingBottom: 80 },

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

  backLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  backLinkText: {
    color: "#0f766e",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },

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

  legendCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  legendTitle: {
    fontSize: 10,
    letterSpacing: 2,
    color: "#9ca3af",
    fontWeight: "700",
    marginBottom: 8,
  },
  legendRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendText: { fontSize: 11, color: "#4b5563" },

  levelBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  levelBadgeText: { fontSize: 10, fontWeight: "800" },
  dashText: { fontSize: 11, color: "#d1d5db" },

  emptyState: { padding: 40, alignItems: "center", gap: 10 },
  emptyText: {
    color: "#9ca3af",
    fontSize: 13,
    textAlign: "center",
    paddingVertical: 20,
  },

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
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#191c1d",
  },
  cardMeta: { fontSize: 11, color: "#6b7280", marginTop: 2 },

  sectionHeading: {
    fontSize: 10,
    letterSpacing: 1.5,
    color: "#9ca3af",
    textTransform: "uppercase",
    fontWeight: "700",
    marginTop: 12,
    marginBottom: 6,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#006857",
    marginBottom: 6,
  },

  competencyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  competencyChip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#f1f3f4",
    borderRadius: 8,
    minWidth: 52,
    gap: 6,
  },
  competencyChipSmall: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    backgroundColor: "#f1f3f4",
    borderRadius: 8,
    width: "18%",
    minWidth: 52,
    gap: 4,
  },
  competencyChipKey: {
    fontSize: 9,
    fontWeight: "700",
    color: "#6b7280",
  },
  competencyChipValue: {
    fontSize: 12,
    fontWeight: "800",
    color: "#191c1d",
  },

  matrixRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  matrixItem: {
    alignItems: "center",
    gap: 4,
  },
  matrixItemLabel: { fontSize: 9, color: "#6b7280", fontWeight: "600" },
  matrixSwatchSmall: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  matrixGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 6,
  },
  matrixCell: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#f1f3f4",
    borderRadius: 10,
    gap: 8,
  },
  matrixSwatch: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  matrixCellLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#191c1d",
  },

  notesText: {
    fontSize: 12,
    color: "#4b5563",
    lineHeight: 18,
  },

  cardActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 14,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  actionBtnDisabled: { opacity: 0.5 },
  actionBtnText: { fontSize: 12, fontWeight: "700", color: "#006857" },
  actionBtnTextDisabled: { color: "#9ca3af" },

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
  modalSubtitle: { fontSize: 12, color: "#6b7280", marginTop: 2 },

  addSmallBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#006857",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginRight: 8,
  },
  addSmallBtnText: { fontSize: 11, fontWeight: "700", color: "#fff" },

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
  helperText: {
    fontSize: 11,
    color: "#9ca3af",
    marginBottom: 6,
    fontStyle: "italic",
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
  inputMultiline: {
    minHeight: 70,
    textAlignVertical: "top",
  },
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

  viewerDate: {
    fontSize: 16,
    fontWeight: "800",
    color: "#191c1d",
    marginBottom: 4,
  },
  viewerAuthor: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 8,
  },

  historyItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    gap: 10,
  },
  historyDate: {
    fontSize: 13,
    fontWeight: "700",
    color: "#191c1d",
    marginBottom: 6,
  },
  historyMatrixRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 6,
  },
  historyAuthor: { fontSize: 11, color: "#6b7280" },
  historyActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  historyEdit: { fontSize: 12, fontWeight: "700", color: "#006857" },

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
  confirmActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },
});
