import {
  approveUser,
  getActiveUsers,
  getPendingUsers,
  rejectUser,
} from "@/lib/authStorage"; // ✅ Imported local storage functions
import { useAuth } from "@/lib/useAuth";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  Keyboard,
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

const { width, height } = Dimensions.get("window");

const colors = {
  primary: "#1a7a5e",
  primaryContainer: "#2a9d7a",
  surface: "#f8f9fa",
  surfaceContainerLowest: "#ffffff",
  onSurface: "#191c1d",
  onSurfaceVariant: "#3d4945",
  emerald: "#10b981",
  rose: "#f43f5e",
  amber: "#f59e0b",
  teal: "#14b8a6",
};

const ADMIN_TABS = ["users", "deactivated", "approvals", "roles"];

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

export default function AdminAccessControl() {
  const router = useRouter();
  const { user: currentUser } = useAuth();

  // ============ STATE ============
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]); // Kept for UI purposes
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [activeTab, setActiveTab] = useState("users");
  const [searchQuery, setSearchQuery] = useState("");

  // Sidebar & Header Search States
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [headerSearchQuery, setHeaderSearchQuery] = useState("");

  // Dropdown States
  const [educationDropdownOpen, setEducationDropdownOpen] = useState(false);
  const [reportsDropdownOpen, setReportsDropdownOpen] = useState(false);
  const [authDropdownOpen, setAuthDropdownOpen] = useState(false);

  // Modals state
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Animations
  const slideAnim = useRef(new Animated.Value(-width)).current;
  const expandAnim = useRef(new Animated.Value(0)).current;
  const educationRotateAnim = useRef(new Animated.Value(0)).current;
  const reportsRotateAnim = useRef(new Animated.Value(0)).current;
  const authRotateAnim = useRef(new Animated.Value(0)).current;

  // ============ ACCESS CONTROL ============
  const isAdmin = true; // Bypassed for testing

  // ============ FETCH LOCAL DATA ============
  const loadData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);

      // Fetch from AsyncStorage via our new helpers
      const pending = await getPendingUsers();
      const active = await getActiveUsers();

      // Merge them for the UI (we can differentiate by status later)
      setUsers([...pending, ...active]);
    } catch (err) {
      console.error("Error loading local users:", err);
      Alert.alert("Error", "Failed to load users from local storage");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Re-fetch every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData(true);
  };

  // ============ ACTIONS ============
  const handleStatusUpdate = async (userId: string, newStatus: string) => {
    try {
      if (newStatus === "ACTIVE") {
        await approveUser(userId);
      } else if (newStatus === "REJECTED") {
        await rejectUser(userId);
      }

      // Reload data to reflect changes immediately
      await loadData(true);
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  // ============ SIDEBAR & SEARCH HANDLERS ============
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

  const expandSearch = () => {
    setIsSearchExpanded(true);
    Animated.timing(expandAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: false,
    }).start();
  };

  const collapseSearch = () => {
    Keyboard.dismiss();
    Animated.timing(expandAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      setIsSearchExpanded(false);
      setHeaderSearchQuery("");
    });
  };

  const searchBarWidth = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [40, width - 60],
  });

  const rotateEducation = educationRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });
  const rotateReports = reportsRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });
  const rotateAuth = authRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  // ============ FILTERS & COMPUTATIONS ============
  const pendingUsers = users.filter((u) => u.status === "PENDING");
  const activeUsers = users.filter((u) => u.status === "ACTIVE");
  const deactivatedUsers = users.filter(
    (u) => u.status === "REJECTED" || u.status === "INACTIVE",
  );

  const filteredUsers = (() => {
    let list = activeUsers;
    if (activeTab === "approvals") list = pendingUsers;
    else if (activeTab === "deactivated") list = deactivatedUsers;

    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase();
    return list.filter(
      (u) =>
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.mobile && u.mobile.includes(q)),
    );
  })();

  // ============ RENDER ============
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      {/* OVERLAY */}
      {menuOpen && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={closeMenu}
        />
      )}

      {/* ============================================
          SIDEBAR (SLIDER)
      ============================================ */}
      <Animated.View
        style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.brandContainer}>
            <Text style={styles.brandText}>Aman Foundation</Text>
          </View>

          <TouchableOpacity
            style={styles.menuItemActive}
            onPress={() => handleNavigation("/")}
          >
            <Ionicons name="grid-outline" size={20} color="#fff" />
            <Text style={styles.menuTextActive}>Dashboard</Text>
          </TouchableOpacity>

          <View>
            <TouchableOpacity
              style={styles.menuItemWithDropdown}
              onPress={() => {
                Animated.timing(educationRotateAnim, {
                  toValue: educationDropdownOpen ? 0 : 1,
                  duration: 200,
                  useNativeDriver: true,
                }).start();
                setEducationDropdownOpen(!educationDropdownOpen);
              }}
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
                  onPress={() => handleNavigation("/education_management_hub")}
                >
                  <Text style={styles.dropdownText}>Management Hub</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => handleNavigation("/education_schools_module")}
                >
                  <Text style={styles.dropdownText}>Schools Overview</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View>
            <TouchableOpacity
              style={styles.menuItemWithDropdown}
              onPress={() => {
                Animated.timing(reportsRotateAnim, {
                  toValue: reportsDropdownOpen ? 0 : 1,
                  duration: 200,
                  useNativeDriver: true,
                }).start();
                setReportsDropdownOpen(!reportsDropdownOpen);
              }}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons name="bar-chart-outline" size={20} color="#4b5563" />
                <Text style={styles.menuText}>Fellow Observation</Text>
              </View>
              <Animated.View style={{ transform: [{ rotate: rotateReports }] }}>
                <Ionicons name="chevron-down" size={20} color="#6b7280" />
              </Animated.View>
            </TouchableOpacity>
            {reportsDropdownOpen && (
              <View style={styles.dropdownContainer}>
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => handleNavigation("/PM-Reflection")}
                >
                  <Text style={styles.dropdownText}>PM Reflection</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => handleNavigation("/PerformanceTracking")}
                >
                  <Text style={styles.dropdownText}>Fellow Performance</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.menuDivider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ACCOUNT</Text>
            <View style={styles.dividerLine} />
          </View>
          <View>
            <TouchableOpacity
              style={styles.menuItemWithDropdown}
              onPress={() => {
                Animated.timing(authRotateAnim, {
                  toValue: authDropdownOpen ? 0 : 1,
                  duration: 200,
                  useNativeDriver: true,
                }).start();
                setAuthDropdownOpen(!authDropdownOpen);
              }}
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
                  <Text style={styles.dropdownText}>Login Page</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => handleNavigation("/registration")}
                >
                  <Text style={styles.dropdownText}>Register Page</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </Animated.View>

      {/* ============================================
          HEADER & SEARCH
      ============================================ */}
      <View style={styles.header}>
        {!isSearchExpanded ? (
          <>
            <View style={styles.headerLeft}>
              <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
                <MaterialIcons name="menu" size={24} color="#4B5563" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Impact Portal</Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity
                onPress={expandSearch}
                style={styles.iconButton}
              >
                <MaterialIcons name="search" size={24} color="#6B7280" />
              </TouchableOpacity>
              <Image
                source={{
                  uri: "https://randomuser.me/api/portraits/women/68.jpg",
                }}
                style={styles.avatar}
              />
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
                value={headerSearchQuery}
                onChangeText={setHeaderSearchQuery}
                autoFocus
              />
            </Animated.View>
            <TouchableOpacity
              onPress={collapseSearch}
              style={{ paddingLeft: 12 }}
            >
              <Text style={styles.cancelSearchText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
      >
        {/* ============================================
            PAGE HEADER
        ============================================ */}
        <View style={styles.pageHeader}>
          <View>
            <Text style={styles.mainTitle}>Admin Portal</Text>
            <Text style={styles.subtitle}>DYNAMIC ACCESS PARAMETERS</Text>
          </View>

          <View style={styles.headerActions}>
            {activeTab === "roles" ? (
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() =>
                  Alert.alert("Notice", "Add Role modal not converted yet.")
                }
              >
                <MaterialIcons name="add" size={16} color="#fff" />
                <Text style={styles.primaryButtonText}>Add Role</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() =>
                  Alert.alert("Notice", "Create User modal not converted yet.")
                }
              >
                <Ionicons name="person-add" size={14} color="#fff" />
                <Text style={styles.primaryButtonText}>Create User</Text>
              </TouchableOpacity>
            )}

            <View style={styles.activeCountBadge}>
              <Ionicons name="people" size={14} color={colors.emerald} />
              <Text style={styles.activeCountText}>
                {activeUsers.length} Active
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.pendingButton,
                activeTab === "approvals" && styles.pendingButtonActive,
              ]}
              onPress={() => setActiveTab("approvals")}
            >
              <Text style={styles.pendingButtonText}>Pending Approvals</Text>
              <MaterialIcons
                name="arrow-forward"
                size={14}
                color={activeTab === "approvals" ? colors.amber : "#666"}
              />
              {pendingUsers.length > 0 && (
                <View style={styles.pendingBadge}>
                  <Text style={styles.pendingBadgeText}>
                    {pendingUsers.length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* ============================================
            TABS
        ============================================ */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabContainer}
        >
          {ADMIN_TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.tabTextActive,
                ]}
              >
                {tab === "users"
                  ? "Active Users"
                  : tab === "deactivated"
                    ? "Deactivated"
                    : tab === "approvals"
                      ? "Approvals Queue"
                      : "Role Switches"}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ============================================
            CONTENT AREA
        ============================================ */}
        {loading ? (
          <ActivityIndicator
            size="large"
            color={colors.primary}
            style={{ marginTop: 40 }}
          />
        ) : (
          <View style={styles.contentArea}>
            {/* USERS LIST */}
            {(activeTab === "users" ||
              activeTab === "approvals" ||
              activeTab === "deactivated") && (
              <View>
                <View style={styles.searchContainer}>
                  <MaterialIcons
                    name="search"
                    size={20}
                    color="#9ca3af"
                    style={{ marginRight: 8 }}
                  />
                  <TextInput
                    style={styles.searchInput}
                    placeholder={`Search ${activeTab}...`}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                </View>

                {filteredUsers.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={48}
                      color="#9ca3af"
                    />
                    <Text style={styles.emptyStateTitle}>No entries found</Text>
                    <Text style={styles.emptyStateText}>
                      No matches for your query.
                    </Text>
                  </View>
                ) : (
                  filteredUsers.map((item) => (
                    <View key={item.id} style={styles.card}>
                      <View style={styles.cardHeader}>
                        <View style={styles.avatarCircle}>
                          <Text style={styles.avatarText}>
                            {item.name
                              ? item.name.charAt(0)
                              : item.email.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                          <Text style={styles.userName}>
                            {item.name || item.username}
                          </Text>
                          <Text style={styles.userEmail}>{item.email}</Text>
                        </View>
                      </View>

                      <View style={styles.cardDetails}>
                        <Text style={styles.detailText}>
                          Role:{" "}
                          <Text style={styles.boldText}>
                            {item.roleName?.replaceAll("_", " ") || "User"}
                          </Text>
                        </Text>
                        <View
                          style={[
                            styles.statusBadge,
                            item.status === "ACTIVE"
                              ? styles.bgEmerald
                              : item.status === "PENDING"
                                ? styles.bgAmber
                                : styles.bgRose,
                          ]}
                        >
                          <Text style={styles.statusText}>{item.status}</Text>
                        </View>
                      </View>

                      {/* Actions */}
                      <View style={styles.cardActions}>
                        {activeTab === "approvals" ? (
                          <>
                            <TouchableOpacity
                              style={[
                                styles.actionBtn,
                                styles.bgEmeraldOutline,
                              ]}
                              onPress={() =>
                                handleStatusUpdate(item.id, "ACTIVE")
                              }
                            >
                              <Text style={styles.textEmerald}>Approve</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.actionBtn, styles.bgRoseOutline]}
                              onPress={() =>
                                handleStatusUpdate(item.id, "REJECTED")
                              }
                            >
                              <Text style={styles.textRose}>Reject</Text>
                            </TouchableOpacity>
                          </>
                        ) : (
                          <>
                            <TouchableOpacity
                              style={[styles.actionBtn, styles.bgSlateOutline]}
                              onPress={() => setSelectedUser(item)}
                            >
                              <Text style={styles.textSlate}>Permissions</Text>
                            </TouchableOpacity>
                          </>
                        )}
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}

            {/* ROLES LIST - Placeholder since local storage doesn't hold roles yet */}
            {activeTab === "roles" && (
              <View style={styles.emptyState}>
                <MaterialIcons name="security" size={48} color="#9ca3af" />
                <Text style={styles.emptyStateTitle}>Roles Manager</Text>
                <Text style={styles.emptyStateText}>
                  Roles are currently hardcoded in the application.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* ============================================
            FOOTER
        ============================================ */}
        <Footer />
      </ScrollView>

      {/* PLACEHOLDER MODALS */}
      <Modal visible={!!selectedUser} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>User Permissions</Text>
            <Text style={styles.modalText}>Editing: {selectedUser?.name}</Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => setSelectedUser(null)}
            >
              <Text style={styles.primaryButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ============================================
// STYLES (Untouched from original)
// ============================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  deniedText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.rose,
    marginTop: 12,
  },
  deniedSub: { fontSize: 14, color: "#666", marginTop: 8, textAlign: "center" },
  scrollContent: { padding: 20, paddingBottom: 60 },

  // Sidebar
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    zIndex: 10,
  },
  sidebar: {
    position: "absolute",
    width: width * 0.75,
    height: "100%",
    backgroundColor: "#fff",
    padding: 20,
    zIndex: 20,
    elevation: 20,
  },
  brandContainer: { marginBottom: 20, marginTop: 20 },
  brandText: { fontSize: 20, fontWeight: "bold", color: colors.primary },
  menuItemActive: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  menuTextActive: { color: "#fff", marginLeft: 12, fontWeight: "600" },
  menuItemWithDropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 12,
  },
  menuItemLeft: { flexDirection: "row", alignItems: "center" },
  menuText: { marginLeft: 12, fontSize: 15, color: "#374151" },
  dropdownContainer: {
    marginLeft: 32,
    borderLeftWidth: 1,
    borderLeftColor: "#e5e7eb",
    paddingLeft: 12,
    marginBottom: 8,
  },
  dropdownItem: { paddingVertical: 10 },
  dropdownText: { fontSize: 14, color: "#6b7280" },
  menuDivider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#e5e7eb" },
  dividerText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#9ca3af",
    marginHorizontal: 8,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    zIndex: 5,
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  menuButton: { padding: 4, marginRight: 12 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#111" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 16 },
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
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 40,
  },
  expandedSearchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: "#111" },
  cancelSearchText: { fontSize: 14, fontWeight: "600", color: colors.primary },

  // Page Header
  pageHeader: { marginBottom: 20 },
  mainTitle: { fontSize: 26, fontWeight: "bold", color: "#111" },
  subtitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: colors.primary,
    letterSpacing: 1,
    marginTop: 4,
  },
  headerActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 16,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  activeCountBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${colors.emerald}15`,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  activeCountText: { color: colors.emerald, fontSize: 12, fontWeight: "bold" },
  pendingButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  pendingButtonActive: {
    borderColor: `${colors.amber}50`,
    backgroundColor: `${colors.amber}10`,
  },
  pendingButtonText: { fontSize: 12, fontWeight: "bold", color: "#333" },
  pendingBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: colors.rose,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  pendingBadgeText: { color: "#fff", fontSize: 9, fontWeight: "bold" },

  // Tabs
  tabContainer: { flexDirection: "row", marginBottom: 20 },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#eee",
    borderRadius: 10,
    marginRight: 8,
  },
  tabActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#666",
    textTransform: "uppercase",
  },
  tabTextActive: { color: colors.primary },

  // Content
  contentArea: { minHeight: 300 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 14, color: "#111" },

  // Cards
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cardHeader: { flexDirection: "row", alignItems: "center" },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: `${colors.primary}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 18, fontWeight: "bold", color: colors.primary },
  userName: { fontSize: 16, fontWeight: "bold", color: "#111" },
  userEmail: { fontSize: 12, color: "#666", marginTop: 2 },
  cardDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 16,
  },
  detailText: { fontSize: 12, color: "#666" },
  boldText: { fontWeight: "bold", color: "#111" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: "bold", textTransform: "uppercase" },
  cardActions: { flexDirection: "row", gap: 8 },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },

  // Colors utility
  bgEmerald: { backgroundColor: `${colors.emerald}15` },
  textEmerald: { color: colors.emerald, fontSize: 12, fontWeight: "bold" },
  bgAmber: { backgroundColor: `${colors.amber}15` },
  bgRose: { backgroundColor: `${colors.rose}15` },
  textRose: { color: colors.rose, fontSize: 12, fontWeight: "bold" },
  bgSlate: { backgroundColor: "#f1f5f9" },
  textSlate: { color: "#64748b", fontSize: 12, fontWeight: "bold" },
  bgEmeraldOutline: {
    borderColor: `${colors.emerald}50`,
    backgroundColor: `${colors.emerald}05`,
  },
  bgRoseOutline: {
    borderColor: `${colors.rose}50`,
    backgroundColor: `${colors.rose}05`,
  },
  bgSlateOutline: { borderColor: "#cbd5e1", backgroundColor: "#f8fafc" },

  // Empty State
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderStyle: "dashed",
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginTop: 12,
  },
  emptyStateText: { fontSize: 12, color: "#999", marginTop: 4 },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    width: width - 40,
    padding: 24,
    borderRadius: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
  modalText: { fontSize: 14, color: "#666", marginBottom: 20 },

  // ============================================
  // FOOTER
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
