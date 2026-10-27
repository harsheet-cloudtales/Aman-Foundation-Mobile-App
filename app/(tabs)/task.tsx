// app/(tabs)/task.tsx
import { RouteGuard } from "@/components/RouteGuard";
import { useAuth } from "@/lib/useAuth";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import * as DocumentPicker from "expo-document-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
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
  Image,
  Keyboard,
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

const { width, height } = Dimensions.get("window");

// ============================================
// THEME COLORS
// ============================================
const colors = {
  primary: "#006857",
  primaryContainer: "#00846e",
};

// ============================================
// CONSTANTS
// ============================================
const STATUSES = [
  "Pending",
  "In Progress",
  "Completed",
  "Blocked",
  "Cancelled",
];
const PRIORITIES = ["Low", "Medium", "High", "Urgent"];

const STATUS_CLASS: Record<string, { bg: string; text: string }> = {
  Pending: { bg: "#fef3c7", text: "#92400e" },
  "In Progress": { bg: "#dbeafe", text: "#1e40af" },
  Completed: { bg: "#d1fae5", text: "#065f46" },
  Blocked: { bg: "#ffe4e6", text: "#9f1239" },
  Cancelled: { bg: "#e2e8f0", text: "#475569" },
};

const PRIORITY_CLASS: Record<string, { bg: string; text: string }> = {
  Low: { bg: "#f1f5f9", text: "#475569" },
  Medium: { bg: "#eff6ff", text: "#1d4ed8" },
  High: { bg: "#fef3c7", text: "#92400e" },
  Urgent: { bg: "#ffe4e6", text: "#9f1239" },
};

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
    title: "Tasks",
    route: "/(tabs)/task",
    icon: "checkmark-circle-outline", // Changed to a tick icon
    category: "Account",
  },
  {
    title: "My Profile",
    route: "/profile",
    icon: "person-outline",
    category: "Account",
  },
];

// ============================================
// HELPERS
// ============================================
function formatDate(value: any) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value: any) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toDateInput(value: any) {
  if (!value) return "";
  try {
    return new Date(value).toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

function getISTDateKey() {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const ist = new Date(now.getTime() + istOffset);
  return ist.toISOString().slice(0, 10);
}

function validateDateOrder(start: any, end: any, opts: any = {}) {
  if (!start || !end) return null;
  const s = new Date(start);
  const e = new Date(end);
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return null;
  if (e < s) {
    return `${opts.endLabel || "End date"} cannot be before ${
      opts.startLabel || "start date"
    }`;
  }
  return null;
}

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
// TASK DETAIL MODAL
// ============================================
function TaskDetailModal({
  task,
  onClose,
  token,
  onChanged,
  canManage,
  currentUserId,
  canWrite,
}: any) {
  const [comments, setComments] = useState<any[]>(task.comments || []);
  const [documents, setDocuments] = useState<any[]>(task.documents || []);
  const [newComment, setNewComment] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: task.title || "",
    description: task.description || "",
    plannedDate: toDateInput(task.plannedDate),
    deadline: toDateInput(task.deadline),
    status: task.status || "Pending",
    priority: task.priority || "Medium",
  });

  const saveChanges = async () => {
    if (!form.title.trim()) {
      Alert.alert("Error", "Task title is required");
      return;
    }
    const dateError = validateDateOrder(
      form.plannedDate || getISTDateKey(),
      form.deadline,
      { startLabel: "Planned date", endLabel: "Deadline" },
    );
    if (dateError) {
      Alert.alert("Error", dateError);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          plannedDate: form.plannedDate || null,
          deadline: form.deadline || null,
          status: form.status,
          priority: form.priority,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update task");
      onChanged?.(data.data);
      setForm({
        title: data.data.title || "",
        description: data.data.description || "",
        plannedDate: toDateInput(data.data.plannedDate),
        deadline: toDateInput(data.data.deadline),
        status: data.data.status || "Pending",
        priority: data.data.priority || "Medium",
      });
      setEditing(false);
      Alert.alert("Success", "Task updated");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setSaving(false);
    }
  };

  const addComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await fetch(`/api/tasks/${task.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: newComment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add comment");
      setComments((prev) => [...prev, data.data]);
      setNewComment("");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  const uploadDocuments = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        multiple: true,
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;

      setUploading(true);
      const formData = new FormData();
      result.assets.forEach((asset) => {
        formData.append("files", {
          uri: asset.uri,
          name: asset.name,
          type: asset.mimeType || "application/octet-stream",
        } as any);
      });

      const res = await fetch(`/api/tasks/${task.id}/documents`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload documents");
      setDocuments((prev) => [...prev, ...data.data]);
      Alert.alert("Success", "Documents uploaded");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setUploading(false);
    }
  };

  const deleteDocument = async (documentId: string) => {
    try {
      const res = await fetch(
        `/api/tasks/${task.id}/documents?documentId=${documentId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) throw new Error("Failed to delete document");
      setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  const deleteTask = () => {
    Alert.alert("Delete Task", "Delete this task permanently?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const res = await fetch(`/api/tasks/${task.id}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Failed to delete task");
            Alert.alert("Success", "Task deleted");
            onChanged?.(null);
            onClose();
          } catch (err: any) {
            Alert.alert("Error", err.message);
          }
        },
      },
    ]);
  };

  const canDelete =
    task.assignedBy?.id === currentUserId ||
    (!task.assignedBy && task.assignee?.id === currentUserId) ||
    canManage;

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <View style={styles.badgeRow}>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          STATUS_CLASS[task.status]?.bg || "#f1f5f9",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        { color: STATUS_CLASS[task.status]?.text || "#334155" },
                      ]}
                    >
                      {task.status}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          PRIORITY_CLASS[task.priority]?.bg || "#f1f5f9",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        {
                          color:
                            PRIORITY_CLASS[task.priority]?.text || "#334155",
                        },
                      ]}
                    >
                      {task.priority}
                    </Text>
                  </View>
                  {task.assignedBy && (
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: "#ccfbf1" },
                      ]}
                    >
                      <Text
                        style={[styles.statusBadgeText, { color: "#115e59" }]}
                      >
                        Assigned
                      </Text>
                    </View>
                  )}
                </View>

                {!editing ? (
                  <>
                    <Text style={styles.modalTitle}>{task.title}</Text>
                    <Text style={styles.modalSubtitle}>
                      Assigned to {task.assignee?.name || "—"}
                      {task.assignedBy
                        ? ` by ${task.assignedBy.name}`
                        : ""} · {formatDateTime(task.createdAt)}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.modalTitle}>Edit task</Text>
                )}
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <MaterialIcons name="close" size={22} color="#64748b" />
              </TouchableOpacity>
            </View>

            {/* Edit mode */}
            {editing ? (
              <View style={{ gap: 12, marginBottom: 20 }}>
                <View>
                  <Text style={styles.formLabel}>Title</Text>
                  <TextInput
                    value={form.title}
                    onChangeText={(v) => setForm({ ...form, title: v })}
                    style={styles.formInput}
                  />
                </View>
                <View>
                  <Text style={styles.formLabel}>Description</Text>
                  <TextInput
                    value={form.description}
                    onChangeText={(v) => setForm({ ...form, description: v })}
                    style={[
                      styles.formInput,
                      { height: 80, textAlignVertical: "top" },
                    ]}
                    multiline
                  />
                </View>
                <View style={{ flexDirection: "row", gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.formLabel}>Planned Date</Text>
                    <TextInput
                      value={form.plannedDate}
                      onChangeText={(v) => setForm({ ...form, plannedDate: v })}
                      placeholder="YYYY-MM-DD"
                      style={styles.formInput}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.formLabel}>Deadline</Text>
                    <TextInput
                      value={form.deadline}
                      onChangeText={(v) => setForm({ ...form, deadline: v })}
                      placeholder="YYYY-MM-DD"
                      style={styles.formInput}
                    />
                  </View>
                </View>
                <View style={{ flexDirection: "row", gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.formLabel}>Status</Text>
                    <View style={styles.pickerWrapper}>
                      <Picker
                        selectedValue={form.status}
                        onValueChange={(v) => setForm({ ...form, status: v })}
                      >
                        {STATUSES.map((s) => (
                          <Picker.Item key={s} label={s} value={s} />
                        ))}
                      </Picker>
                    </View>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.formLabel}>Priority</Text>
                    <View style={styles.pickerWrapper}>
                      <Picker
                        selectedValue={form.priority}
                        onValueChange={(v) => setForm({ ...form, priority: v })}
                      >
                        {PRIORITIES.map((p) => (
                          <Picker.Item key={p} label={p} value={p} />
                        ))}
                      </Picker>
                    </View>
                  </View>
                </View>
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    onPress={() => setEditing(false)}
                    style={styles.cancelBtn}
                  >
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={saveChanges}
                    disabled={saving}
                    style={styles.primaryBtn}
                  >
                    <Text style={styles.primaryBtnText}>
                      {saving ? "Saving..." : "Save Changes"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <>
                <View style={styles.datesGrid}>
                  <View style={styles.dateCell}>
                    <Text style={styles.dateLabel}>Assigned Date</Text>
                    <Text style={styles.dateValue}>
                      {formatDate(task.createdAt)}
                    </Text>
                  </View>
                  <View style={styles.dateCell}>
                    <Text style={styles.dateLabel}>Planned Date</Text>
                    <Text style={styles.dateValue}>
                      {formatDate(task.plannedDate)}
                    </Text>
                  </View>
                  <View style={styles.dateCell}>
                    <Text style={styles.dateLabel}>Deadline</Text>
                    <Text style={styles.dateValue}>
                      {formatDate(task.deadline)}
                    </Text>
                  </View>
                  <View style={styles.dateCell}>
                    <Text style={styles.dateLabel}>Completed</Text>
                    <Text style={styles.dateValue}>
                      {formatDate(task.completionDate)}
                    </Text>
                  </View>
                </View>

                {task.description ? (
                  <Text style={styles.description}>{task.description}</Text>
                ) : null}
              </>
            )}

            {/* Documents */}
            <View style={{ marginBottom: 20 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <Text style={styles.sectionTitle}>Documents</Text>
                {canWrite && (
                  <TouchableOpacity
                    onPress={uploadDocuments}
                    disabled={uploading}
                    style={styles.uploadBtn}
                  >
                    <Text style={styles.uploadBtnText}>
                      {uploading ? "Uploading..." : "Upload"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              {documents.length === 0 ? (
                <Text style={styles.emptyText}>No documents attached.</Text>
              ) : (
                <View style={{ gap: 8 }}>
                  {documents.map((doc) => (
                    <View key={doc.id} style={styles.docRow}>
                      <MaterialIcons
                        name="description"
                        size={18}
                        color="#94a3b8"
                      />
                      <Text style={styles.docName} numberOfLines={1}>
                        {doc.name}
                      </Text>
                      {canWrite && (
                        <TouchableOpacity
                          onPress={() => deleteDocument(doc.id)}
                        >
                          <MaterialIcons
                            name="delete"
                            size={16}
                            color="#f43f5e"
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Comments */}
            <View style={{ marginBottom: 20 }}>
              <Text style={styles.sectionTitle}>Comments</Text>
              <View style={{ gap: 8, marginTop: 8 }}>
                {comments.length === 0 ? (
                  <Text style={styles.emptyText}>No comments yet.</Text>
                ) : (
                  comments.map((c) => (
                    <View key={c.id} style={styles.commentCard}>
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          marginBottom: 4,
                        }}
                      >
                        <Text style={styles.commentAuthor}>
                          {c.author?.name || "User"}
                        </Text>
                        <Text style={styles.commentDate}>
                          {formatDateTime(c.createdAt)}
                        </Text>
                      </View>
                      <Text style={styles.commentText}>{c.text}</Text>
                    </View>
                  ))
                )}
              </View>
              {canWrite && (
                <View style={styles.commentInputRow}>
                  <TextInput
                    value={newComment}
                    onChangeText={setNewComment}
                    placeholder="Add a comment..."
                    placeholderTextColor="#94a3b8"
                    style={styles.commentInput}
                  />
                  <TouchableOpacity onPress={addComment} style={styles.postBtn}>
                    <Text style={styles.postBtnText}>Post</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Footer */}
            <View style={styles.modalFooter}>
              {canWrite && canDelete && (
                <TouchableOpacity onPress={deleteTask} style={styles.deleteBtn}>
                  <MaterialIcons name="delete" size={16} color="#e11d48" />
                  <Text style={styles.deleteBtnText}>Delete task</Text>
                </TouchableOpacity>
              )}
              <View
                style={{ flexDirection: "row", gap: 8, marginLeft: "auto" }}
              >
                {canWrite && !editing && (
                  <TouchableOpacity
                    onPress={() => setEditing(true)}
                    style={styles.primaryBtn}
                  >
                    <MaterialIcons name="edit" size={16} color="#fff" />
                    <Text style={styles.primaryBtnText}>Edit</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
                  <Text style={styles.cancelBtnText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ============================================
// MAIN PAGE CONTENT
// ============================================
function TasksPageContent() {
  const router = useRouter();
  const searchParams = useLocalSearchParams();
  const { token, user } = useAuth();

  const [view, setView] = useState(user?.roleName === "ADMIN" ? "all" : "mine");
  const [createFiles, setCreateFiles] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [assignables, setAssignables] = useState<any[]>([]);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    assigneeId: "",
    plannedDate: getISTDateKey(),
    deadline: "",
    priority: "Medium",
  });

  // Sidebar
  const [menuOpen, setMenuOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-width)).current;

  // Header search
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [headerSearchQuery, setHeaderSearchQuery] = useState("");
  const expandAnim = useRef(new Animated.Value(0)).current;
  const dropdownAnim = useRef(new Animated.Value(0)).current;

  // Sidebar dropdowns
  const [educationDropdownOpen, setEducationDropdownOpen] = useState(false);
  const [reportsDropdownOpen, setReportsDropdownOpen] = useState(false);
  const [livelihoodDropdownOpen, setLivelihoodDropdownOpen] = useState(false);
  const [authDropdownOpen, setAuthDropdownOpen] = useState(false);

  const educationRotateAnim = useRef(new Animated.Value(0)).current;
  const reportsRotateAnim = useRef(new Animated.Value(0)).current;
  const livelihoodRotateAnim = useRef(new Animated.Value(0)).current;
  const authRotateAnim = useRef(new Animated.Value(0)).current;

  const isAdmin = user?.roleName === "ADMIN";
  // FORCED TO TRUE FOR TESTING
  const canWrite = true;

  useEffect(() => {
    if (isAdmin) {
      setView((prev) => (prev === "mine" ? "all" : prev));
    }
  }, [isAdmin]);

  // ============ FETCH TASKS ============
  const loadTasks = useCallback(
    async (silent = false) => {
      if (!token) return;
      if (!silent) setLoading(true);
      try {
        const params = new URLSearchParams({ view });
        if (statusFilter) params.set("status", statusFilter);
        if (priorityFilter) params.set("priority", priorityFilter);
        const res = await fetch(`/api/tasks?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load tasks");
        setTasks(data.data || []);
      } catch (err: any) {
        Alert.alert("Error", err.message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token, view, statusFilter, priorityFilter],
  );

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    const taskId = searchParams.task as string;
    if (!taskId || !tasks.length) return;
    const found = tasks.find((t) => t.id === taskId);
    if (found) setSelectedTask(found);
  }, [searchParams, tasks]);

  const onRefresh = () => {
    setRefreshing(true);
    loadTasks(true);
  };

  // ============ SIDEBAR ============
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
    setTimeout(() => router.push(route as any), 150);
  };

  const toggleEducation = () => {
    Animated.timing(educationRotateAnim, {
      toValue: educationDropdownOpen ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    setEducationDropdownOpen(!educationDropdownOpen);
  };
  const toggleReports = () => {
    Animated.timing(reportsRotateAnim, {
      toValue: reportsDropdownOpen ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    setReportsDropdownOpen(!reportsDropdownOpen);
  };
  const toggleLivelihood = () => {
    Animated.timing(livelihoodRotateAnim, {
      toValue: livelihoodDropdownOpen ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    setLivelihoodDropdownOpen(!livelihoodDropdownOpen);
  };
  const toggleAuth = () => {
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
        onPress: () => router.replace("/login"),
      },
    ]);
  };

  // ============ HEADER SEARCH ============
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
    Animated.timing(dropdownAnim, {
      toValue: text.length > 0 ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
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
    setTimeout(() => router.push(route as any), 300);
  };
  const filteredFeatures = ALL_FEATURES.filter(
    (f) =>
      f.title.toLowerCase().includes(headerSearchQuery.toLowerCase()) ||
      f.category.toLowerCase().includes(headerSearchQuery.toLowerCase()),
  );

  // ============ CREATE TASK ============
  const openCreate = async () => {
    setShowCreate(true);
    setCreateFiles([]);
    try {
      const res = await fetch("/api/tasks/assignable", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setAssignables(data.data || []);
        setForm((prev) => ({
          ...prev,
          assigneeId: prev.assigneeId || user?.id || "",
        }));
      }
    } catch {
      // optional
    }
  };

  const pickCreateFiles = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        multiple: true,
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      setCreateFiles(result.assets || []);
    } catch {
      // cancelled
    }
  };

  const createTask = async () => {
    if (!form.title.trim()) return;
    const dateError = validateDateOrder(
      form.plannedDate || getISTDateKey(),
      form.deadline,
      { startLabel: "Planned date", endLabel: "Deadline" },
    );
    if (dateError) {
      Alert.alert("Error", dateError);
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          assigneeId: form.assigneeId || user?.id,
          plannedDate: form.plannedDate || getISTDateKey(),
          deadline: form.deadline || null,
          priority: form.priority,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create task");

      if (createFiles.length > 0) {
        const formData = new FormData();
        createFiles.forEach((file) => {
          formData.append("files", {
            uri: file.uri,
            name: file.name,
            type: file.mimeType || "application/octet-stream",
          } as any);
        });
        const uploadRes = await fetch(`/api/tasks/${data.data.id}/documents`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (!uploadRes.ok) {
          Alert.alert(
            "Warning",
            "Task created, but documents could not be uploaded.",
          );
        }
      }

      Alert.alert("Success", "Task created");
      setShowCreate(false);
      setCreateFiles([]);
      setForm({
        title: "",
        description: "",
        assigneeId: user?.id || "",
        plannedDate: getISTDateKey(),
        deadline: "",
        priority: "Medium",
      });
      loadTasks();
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setCreating(false);
    }
  };

  // ============ STATS ============
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "Completed").length;
    const overdue = tasks.filter(
      (t) =>
        t.status !== "Completed" &&
        t.status !== "Cancelled" &&
        t.deadline &&
        new Date(t.deadline) < new Date(),
    ).length;
    return { total, completed, pending: total - completed, overdue };
  }, [tasks]);

  const handleChanged = (updated: any) => {
    if (!updated) {
      setSelectedTask(null);
      loadTasks();
      return;
    }
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setSelectedTask(updated);
  };

  // ============ USER GUARD ============
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator size="large" color="#006857" />
          <Text style={{ marginTop: 12, color: "#64748b" }}>Loading user…</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ============ RENDER ============
  return (
    <RouteGuard>
      <View style={{ flex: 1, backgroundColor: "#f8f9fa" }}>
        {menuOpen && (
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={closeMenu}
          />
        )}

        {/* ============ SIDEBAR ============ */}
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

            {/* Education */}
            <View>
              <TouchableOpacity
                style={styles.menuItemWithDropdown}
                onPress={toggleEducation}
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
                  {[
                    {
                      label: "Management Hub",
                      icon: "library-outline",
                      route: "/education_management_hub",
                    },
                    {
                      label: "Schools Overview",
                      icon: "business-outline",
                      route: "/education_schools_module",
                    },
                    {
                      label: "Fellows Directory",
                      icon: "people-outline",
                      route: "/education_fellows_module",
                    },
                    {
                      label: "Active Programs",
                      icon: "calendar-outline",
                      route: "/education_students_module",
                    },
                    {
                      label: "PTA and Programs",
                      icon: "document-text-outline",
                      route: "/education_pta_programs",
                    },
                    {
                      label: "After-School-Students",
                      icon: "document-text-outline",
                      route: "/after-school-students",
                    },
                    {
                      label: "After-School-Centres",
                      icon: "document-text-outline",
                      route: "/after-school-centres",
                    },
                  ].map((item) => (
                    <TouchableOpacity
                      key={item.label}
                      style={styles.dropdownItem}
                      onPress={() => handleNavigation(item.route)}
                    >
                      <Ionicons
                        name={item.icon as any}
                        size={18}
                        color="#6b7280"
                      />
                      <Text style={styles.dropdownText}>{item.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Active Task Link */}
            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemActive]}
              onPress={() => closeMenu()}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color="#fff"
                />
                <Text style={styles.menuTextActive}>Task</Text>
              </View>
            </TouchableOpacity>

            {/* Task Analytics Link (FIXED ICON AND ROUTE) */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigation("/(tabs)/taskanalytics")}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons name="bar-chart-outline" size={20} color="#4b5563" />
                <Text style={styles.menuText}>Task Analytics</Text>
              </View>
            </TouchableOpacity>

            {/* Fellow Observation */}
            <View>
              <TouchableOpacity
                style={styles.menuItemWithDropdown}
                onPress={toggleReports}
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

            {/* Livelihood */}
            <View>
              <TouchableOpacity
                style={styles.menuItemWithDropdown}
                onPress={toggleLivelihood}
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
                onPress={toggleAuth}
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

        {/* ============ MAIN ============ */}
        <SafeAreaView style={styles.container}>
          <StatusBar
            barStyle="dark-content"
            backgroundColor="#f8f9fa"
            translucent={false}
          />

          {/* Header */}
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
                          user.avatar ||
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

          {/* Search dropdown */}
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
                  filteredFeatures.map((f, i) => (
                    <TouchableOpacity
                      key={i}
                      style={styles.searchResultItem}
                      onPress={() => handleSearchNavigate(f.route)}
                    >
                      <View style={styles.searchIconBox}>
                        <Ionicons
                          name={f.icon as any}
                          size={18}
                          color="#006857"
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.searchResultTitle}>{f.title}</Text>
                        <Text style={styles.searchResultCategory}>
                          {f.category}
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
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#006857"]}
              />
            }
          >
            {/* Page header WITH THE ADD TASK BUTTON NEXT TO TITLE */}
            <View style={styles.pageHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.pageTitle}>Tasks</Text>
                <Text style={styles.pageSubtitle}>
                  Plan daily work, track assigned tasks and collaborate with
                  your team.
                </Text>
              </View>
              {canWrite && (
                <TouchableOpacity
                  onPress={openCreate}
                  style={styles.headerAddBtn}
                >
                  <MaterialIcons name="add" size={16} color="#fff" />
                  <Text style={styles.headerAddBtnText}>Add Task</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Stats */}
            <View style={styles.statsGrid}>
              {[
                {
                  label: "Total",
                  value: stats.total,
                  icon: "check-circle-outline",
                  bg: "#f1f5f9",
                  color: "#334155",
                },
                {
                  label: "Completed",
                  value: stats.completed,
                  icon: "task-alt",
                  bg: "#d1fae5",
                  color: "#065f46",
                },
                {
                  label: "Pending",
                  value: stats.pending,
                  icon: "pending-actions",
                  bg: "#fef3c7",
                  color: "#92400e",
                },
                {
                  label: "Overdue",
                  value: stats.overdue,
                  icon: "warning",
                  bg: "#ffe4e6",
                  color: "#9f1239",
                },
              ].map((card) => (
                <View key={card.label} style={styles.statCard}>
                  <View>
                    <Text style={styles.statLabel}>{card.label}</Text>
                    <Text style={styles.statValue}>{card.value}</Text>
                  </View>
                  <View
                    style={[styles.statIconBox, { backgroundColor: card.bg }]}
                  >
                    <MaterialIcons
                      name={card.icon as any}
                      size={20}
                      color={card.color}
                    />
                  </View>
                </View>
              ))}
            </View>

            {/* View tabs */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, marginBottom: 12 }}
            >
              {(isAdmin
                ? [{ key: "all", label: "All Tasks" }]
                : [{ key: "mine", label: "My Tasks" }]
              )
                .concat([{ key: "assigned-by-me", label: "Assigned by Me" }])
                .map((tab) => (
                  <TouchableOpacity
                    key={tab.key}
                    onPress={() => setView(tab.key)}
                    style={[
                      styles.tabBtn,
                      view === tab.key
                        ? styles.tabBtnActive
                        : styles.tabBtnInactive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.tabBtnText,
                        view === tab.key
                          ? styles.tabBtnTextActive
                          : styles.tabBtnTextInactive,
                      ]}
                    >
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Filters */}
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
              <View style={[styles.pickerWrapper, { flex: 1 }]}>
                <Picker
                  selectedValue={statusFilter}
                  onValueChange={(v) => setStatusFilter(v)}
                  style={styles.filterPicker}
                >
                  <Picker.Item label="All statuses" value="" />
                  {STATUSES.map((s) => (
                    <Picker.Item key={s} label={s} value={s} />
                  ))}
                </Picker>
              </View>
              <View style={[styles.pickerWrapper, { flex: 1 }]}>
                <Picker
                  selectedValue={priorityFilter}
                  onValueChange={(v) => setPriorityFilter(v)}
                  style={styles.filterPicker}
                >
                  <Picker.Item label="All priorities" value="" />
                  {PRIORITIES.map((p) => (
                    <Picker.Item key={p} label={p} value={p} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Task list */}
            <View style={styles.taskList}>
              {loading ? (
                <View style={{ paddingVertical: 60, alignItems: "center" }}>
                  <ActivityIndicator size="large" color="#006857" />
                  <Text style={{ marginTop: 12, color: "#64748b" }}>
                    Loading tasks...
                  </Text>
                </View>
              ) : tasks.length === 0 ? (
                <View style={{ paddingVertical: 60, alignItems: "center" }}>
                  <MaterialIcons
                    name="check-circle-outline"
                    size={48}
                    color="#cbd5e1"
                  />
                  <Text style={{ marginTop: 8, color: "#64748b" }}>
                    No tasks found for this view.
                  </Text>
                </View>
              ) : (
                tasks.map((task) => {
                  const isOverdue =
                    task.status !== "Completed" &&
                    task.status !== "Cancelled" &&
                    task.deadline &&
                    new Date(task.deadline) < new Date();
                  return (
                    <TouchableOpacity
                      key={task.id}
                      onPress={() => setSelectedTask(task)}
                      style={styles.taskRow}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.taskDot,
                          {
                            backgroundColor:
                              task.status === "Completed"
                                ? "#10b981"
                                : isOverdue
                                  ? "#f43f5e"
                                  : "#f59e0b",
                          },
                        ]}
                      />
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.taskTitle,
                            task.status === "Completed" && {
                              textDecorationLine: "line-through",
                              color: "#94a3b8",
                            },
                          ]}
                          numberOfLines={2}
                        >
                          {task.title}
                        </Text>
                        <View style={styles.taskMetaRow}>
                          <View
                            style={[
                              styles.miniBadge,
                              {
                                backgroundColor:
                                  STATUS_CLASS[task.status]?.bg || "#f1f5f9",
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.miniBadgeText,
                                {
                                  color:
                                    STATUS_CLASS[task.status]?.text ||
                                    "#334155",
                                },
                              ]}
                            >
                              {task.status}
                            </Text>
                          </View>
                          <View
                            style={[
                              styles.miniBadge,
                              {
                                backgroundColor:
                                  PRIORITY_CLASS[task.priority]?.bg ||
                                  "#f1f5f9",
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.miniBadgeText,
                                {
                                  color:
                                    PRIORITY_CLASS[task.priority]?.text ||
                                    "#334155",
                                },
                              ]}
                            >
                              {task.priority}
                            </Text>
                          </View>
                          {task.assignedBy && (
                            <View
                              style={[
                                styles.miniBadge,
                                { backgroundColor: "#ccfbf1" },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.miniBadgeText,
                                  { color: "#115e59" },
                                ]}
                              >
                                Assigned by {task.assignedBy.name}
                              </Text>
                            </View>
                          )}
                          {task.documents?.length > 0 && (
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 2,
                              }}
                            >
                              <MaterialIcons
                                name="attachment"
                                size={13}
                                color="#64748b"
                              />
                              <Text style={styles.metaText}>
                                {task.documents.length}
                              </Text>
                            </View>
                          )}
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 2,
                            }}
                          >
                            <MaterialIcons
                              name="chat-bubble-outline"
                              size={13}
                              color="#64748b"
                            />
                            <Text style={styles.metaText}>
                              {task.comments?.length || 0}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <View style={{ alignItems: "flex-end" }}>
                        <Text
                          style={[
                            styles.dueText,
                            { color: isOverdue ? "#e11d48" : "#64748b" },
                          ]}
                        >
                          {task.deadline
                            ? `Due ${formatDate(task.deadline)}`
                            : `Planned ${formatDate(task.plannedDate)}`}
                        </Text>
                        {task.assignee && (
                          <Text style={styles.assigneeText}>
                            {task.assignee.name}
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>

            {/* Analytics link */}
            <View style={{ alignItems: "flex-end", marginTop: 16 }}>
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/taskanalytics" as any)}
              >
                <Text style={styles.analyticsLink}>Open task analytics →</Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <Footer />
          </ScrollView>
        </SafeAreaView>

        {/* ============ CREATE TASK MODAL ============ */}
        <Modal
          visible={showCreate}
          transparent
          animationType="slide"
          onRequestClose={() => setShowCreate(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.createModal}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Create Task</Text>
                  <TouchableOpacity
                    onPress={() => setShowCreate(false)}
                    style={styles.closeBtn}
                  >
                    <MaterialIcons name="close" size={22} color="#64748b" />
                  </TouchableOpacity>
                </View>

                <View style={{ gap: 12 }}>
                  <View>
                    <Text style={styles.formLabel}>Title *</Text>
                    <TextInput
                      value={form.title}
                      onChangeText={(v) => setForm({ ...form, title: v })}
                      style={styles.formInput}
                      placeholder="Task title"
                      placeholderTextColor="#94a3b8"
                    />
                  </View>
                  <View>
                    <Text style={styles.formLabel}>Description</Text>
                    <TextInput
                      value={form.description}
                      onChangeText={(v) => setForm({ ...form, description: v })}
                      style={[
                        styles.formInput,
                        { height: 80, textAlignVertical: "top" },
                      ]}
                      multiline
                      placeholder="Task description"
                      placeholderTextColor="#94a3b8"
                    />
                  </View>
                  <View>
                    <Text style={styles.formLabel}>Assign To</Text>
                    <View style={styles.pickerWrapper}>
                      <Picker
                        selectedValue={form.assigneeId}
                        onValueChange={(v) =>
                          setForm({ ...form, assigneeId: v })
                        }
                      >
                        <Picker.Item
                          label={`${user.name || user.username || "Me"} (me)`}
                          value={user.id}
                        />
                        {assignables
                          .filter((p) => p.id !== user.id)
                          .map((p) => (
                            <Picker.Item
                              key={p.id}
                              label={`${p.name} (${p.role?.name?.replaceAll("_", " ") || ""})`}
                              value={p.id}
                            />
                          ))}
                      </Picker>
                    </View>
                  </View>
                  <View>
                    <Text style={styles.formLabel}>Priority</Text>
                    <View style={styles.pickerWrapper}>
                      <Picker
                        selectedValue={form.priority}
                        onValueChange={(v) => setForm({ ...form, priority: v })}
                      >
                        {PRIORITIES.map((p) => (
                          <Picker.Item key={p} label={p} value={p} />
                        ))}
                      </Picker>
                    </View>
                  </View>
                  <View style={{ flexDirection: "row", gap: 12 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.formLabel}>Planned Date</Text>
                      <TextInput
                        value={form.plannedDate}
                        onChangeText={(v) =>
                          setForm({ ...form, plannedDate: v })
                        }
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor="#94a3b8"
                        style={styles.formInput}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.formLabel}>Deadline</Text>
                      <TextInput
                        value={form.deadline}
                        onChangeText={(v) => setForm({ ...form, deadline: v })}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor="#94a3b8"
                        style={styles.formInput}
                      />
                    </View>
                  </View>
                  <View>
                    <Text style={styles.formLabel}>Documents</Text>
                    <TouchableOpacity
                      onPress={pickCreateFiles}
                      style={styles.filePickBtn}
                    >
                      <MaterialIcons
                        name="attach-file"
                        size={16}
                        color="#1d4ed8"
                      />
                      <Text style={styles.filePickBtnText}>Choose files</Text>
                    </TouchableOpacity>
                    {createFiles.length > 0 && (
                      <Text style={styles.fileCount}>
                        {createFiles.length} file(s) will be uploaded with the
                        task.
                      </Text>
                    )}
                  </View>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    onPress={() => setShowCreate(false)}
                    style={styles.cancelBtn}
                  >
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={createTask}
                    disabled={creating}
                    style={styles.primaryBtn}
                  >
                    <Text style={styles.primaryBtnText}>
                      {creating ? "Creating..." : "Create Task"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* ============ TASK DETAIL MODAL ============ */}
        {selectedTask && (
          <TaskDetailModal
            key={selectedTask.id}
            task={selectedTask}
            token={token}
            onClose={() => setSelectedTask(null)}
            onChanged={handleChanged}
            canManage={isAdmin}
            currentUserId={user.id}
            canWrite={canWrite}
          />
        )}
      </View>
    </RouteGuard>
  );
}

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  // Sidebar
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
  menuItemActive: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#006857",
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
  menuTextActive: {
    marginLeft: 12,
    fontSize: 14,
    color: "#fff",
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
    borderRadius: 8,
  },
  dropdownText: { fontSize: 13, color: "#6b7280", marginLeft: 10 },
  dropdownItemLogout: {
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    marginTop: 4,
    paddingTop: 12,
  },
  dropdownTextLogout: { color: "#ef4444" },
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

  // Header — clean top bar
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  header: {
    backgroundColor: "#f8f9fa",
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
  headerTitle: { fontSize: 20, fontWeight: "900", color: "#191C1D" },
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
  },
  cancelSearchText: { fontSize: 14, fontWeight: "600", color: "#006857" },
  searchDropdownContainer: {
    position: "absolute",
    top: 64,
    left: 20,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginTop: 8,
    zIndex: 15,
    elevation: 15,
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

  // Page & Header Add button
  scrollContent: { padding: 20, paddingBottom: 40 },
  pageHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  pageTitle: { fontSize: 30, fontWeight: "800", color: "#191C1D" },
  pageSubtitle: { fontSize: 13, color: "#64748b", marginTop: 4 },

  // New Add Task Button Style
  headerAddBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#006857",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  headerAddBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },

  // Stats
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0f172a",
    marginTop: 4,
  },
  statIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  // Tabs
  tabBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999 },
  tabBtnActive: { backgroundColor: "#006857" },
  tabBtnInactive: { backgroundColor: "#e2e8f0" },
  tabBtnText: { fontSize: 12, fontWeight: "700" },
  tabBtnTextActive: { color: "#fff" },
  tabBtnTextInactive: { color: "#475569" },

  // Picker
  pickerWrapper: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    overflow: "hidden",
    marginBottom: 12,
  },
  filterPicker: { height: Platform.OS === "ios" ? undefined : 48 },

  // Task list
  taskList: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    overflow: "hidden",
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  taskDot: { width: 8, height: 8, borderRadius: 4 },
  taskTitle: { fontSize: 14, fontWeight: "700", color: "#0f172a" },
  taskMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 6,
    alignItems: "center",
  },
  miniBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  miniBadgeText: { fontSize: 9, fontWeight: "800", textTransform: "uppercase" },
  metaText: { fontSize: 10, color: "#64748b" },
  dueText: { fontSize: 10, fontWeight: "700" },
  assigneeText: { fontSize: 10, color: "#94a3b8", marginTop: 2 },
  analyticsLink: { fontSize: 12, fontWeight: "700", color: "#006857" },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "100%",
    maxWidth: 700,
    maxHeight: "92%",
    padding: 20,
    // Removed shadowColor to fix black border
    elevation: 5,
  },
  createModal: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "100%",
    maxWidth: 560,
    maxHeight: "92%",
    padding: 20,
    // Removed shadowColor to fix black border
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
    gap: 8,
  },
  modalTitle: { fontSize: 20, fontWeight: "800", color: "#0f172a", flex: 1 },
  modalSubtitle: { fontSize: 11, color: "#64748b", marginTop: 4 },
  closeBtn: { padding: 6, backgroundColor: "#f1f5f9", borderRadius: 999 },

  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    textTransform: "uppercase",
  },

  datesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 16,
  },
  dateCell: {
    width: "48%",
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    padding: 10,
    marginBottom: 6,
  },
  dateLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: "#64748b",
    textTransform: "uppercase",
  },
  dateValue: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0f172a",
    marginTop: 2,
  },
  description: {
    fontSize: 13,
    color: "#334155",
    marginBottom: 16,
    lineHeight: 20,
  },

  sectionTitle: { fontSize: 14, fontWeight: "800", color: "#0f172a" },
  emptyText: { fontSize: 12, color: "#94a3b8", marginTop: 4 },
  uploadBtn: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  uploadBtnText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  docRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#f8fafc",
    padding: 10,
    borderRadius: 8,
  },
  docName: { flex: 1, fontSize: 12, fontWeight: "600", color: "#2563eb" },
  commentCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  commentAuthor: { fontSize: 12, fontWeight: "800", color: "#334155" },
  commentDate: { fontSize: 10, color: "#94a3b8" },
  commentText: { fontSize: 12, color: "#475569", lineHeight: 18 },
  commentInputRow: { flexDirection: "row", gap: 8, marginTop: 10 },
  commentInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    fontSize: 13,
    backgroundColor: "#fff",
  },
  postBtn: {
    backgroundColor: "#006857",
    paddingHorizontal: 16,
    justifyContent: "center",
    borderRadius: 8,
  },
  postBtnText: { color: "#fff", fontWeight: "700", fontSize: 12 },

  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  modalFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  deleteBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  deleteBtnText: { fontSize: 12, fontWeight: "800", color: "#e11d48" },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  cancelBtnText: { fontSize: 12, fontWeight: "700", color: "#0f172a" },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#006857",
  },
  primaryBtnText: { fontSize: 12, fontWeight: "700", color: "#fff" },

  formLabel: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: "#64748b",
    marginBottom: 4,
  },
  formInput: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
    fontSize: 13,
    color: "#0f172a",
    backgroundColor: "#fff",
  },
  filePickBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    alignSelf: "flex-start",
  },
  filePickBtnText: { fontSize: 12, fontWeight: "700", color: "#1d4ed8" },
  fileCount: { fontSize: 10, color: "#64748b", marginTop: 6 },

  // Footer
  footer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginTop: 100,
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

// ============================================
// DEFAULT EXPORT
// ============================================
export default function TasksPage() {
  return (
    <RouteGuard>
      <TasksPageContent />
    </RouteGuard>
  );
}
