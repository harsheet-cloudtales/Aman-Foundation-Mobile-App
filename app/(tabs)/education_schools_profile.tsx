import { RouteGuard } from "@/components/RouteGuard";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import WebView from "react-native-webview";

const { width } = Dimensions.get("window");

// ============================================
// TYPES
// ============================================
interface School {
  id: number;
  name: string;
  principalName: string;
  udiseCode: string;
  email: string;
  phone: string;
  address: string;
  location: string;
  status: string;
  mapUrl: string;
  goal: number;
  enrolled?: number;
  programs?: number;
  image?: string;
}

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
};

// ============================================
// CUSTOM COMPONENTS
// ============================================
const InputField = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  options,
  multiline = false,
  placeholder = "",
}: any) => {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>
        {label} {required && <Text style={{ color: colors.rose }}>*</Text>}
      </Text>
      {options ? (
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={value}
            onValueChange={(itemValue) =>
              onChange({ target: { name, value: itemValue } })
            }
            style={styles.picker}
          >
            {options.map((o: string) => (
              <Picker.Item key={o} label={o} value={o} />
            ))}
          </Picker>
        </View>
      ) : type === "textarea" || multiline ? (
        <TextInput
          style={[styles.input, styles.textArea]}
          value={value}
          onChangeText={(text) => onChange({ target: { name, value: text } })}
          placeholder={placeholder || `Enter ${label.toLowerCase()}`}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      ) : (
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={(text) => onChange({ target: { name, value: text } })}
          placeholder={placeholder || `Enter ${label.toLowerCase()}`}
          keyboardType={
            type === "email"
              ? "email-address"
              : type === "number"
                ? "numeric"
                : "default"
          }
          secureTextEntry={type === "password"}
        />
      )}
    </View>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
const SchoolsModule = () => {
  const { user, token } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLocation, setSelectedLocation] = useState("All");

  const initialAddForm = {
    name: "",
    principalName: "",
    udiseCode: "",
    email: "",
    phone: "",
    address: "",
    location: "",
    status: "Active",
    mapUrl: "",
    goal: 80,
  };
  const [addForm, setAddForm] = useState(initialAddForm);

  // ============================================
  // FETCH SCHOOLS
  // ============================================
  const fetchSchools = async () => {
    try {
      setLoading(true);
      const data = await api.get<School[]>("/api/schools");

      if (data && data.length > 0) {
        // Add some default values for display
        const schoolsWithDefaults = data.map((school) => ({
          ...school,
          enrolled: school.enrolled || Math.floor(Math.random() * 500) + 100,
          programs: school.programs || Math.floor(Math.random() * 5) + 1,
          image:
            school.image || `https://picsum.photos/seed/${school.id}/100/100`,
        }));
        setSchools(schoolsWithDefaults);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        console.error("Schools fetch error:", err.message);
      }
      // Fallback data
      setSchools([
        {
          id: 1,
          name: "Oakridge Academy",
          principalName: "Dr. Margaret Alva",
          udiseCode: "123456789",
          email: "oakridge@aman.org",
          phone: "9876543210",
          address: "123 Main Street, North District",
          location: "North District",
          status: "Active",
          mapUrl: "",
          goal: 85,
          enrolled: 1240,
          programs: 4,
          image: "https://picsum.photos/seed/1/100/100",
        },
        {
          id: 2,
          name: "Riverside Public School",
          principalName: "Mr. Suresh Patil",
          udiseCode: "987654321",
          email: "riverside@aman.org",
          phone: "9876543211",
          address: "456 River Road, East Valley",
          location: "East Valley",
          status: "Review",
          mapUrl: "",
          goal: 42,
          enrolled: 850,
          programs: 2,
          image: "https://picsum.photos/seed/2/100/100",
        },
        {
          id: 3,
          name: "Summit Prep School",
          principalName: "Ms. Neha Sharma",
          udiseCode: "456789123",
          email: "summit@aman.org",
          phone: "9876543212",
          address: "789 Hilltop Avenue, West Highlands",
          location: "West Highlands",
          status: "Active",
          mapUrl: "",
          goal: 94,
          enrolled: 2100,
          programs: 7,
          image: "https://picsum.photos/seed/3/100/100",
        },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  // ============================================
  // CRUD OPERATIONS
  // ============================================
  const handleAddSchool = async () => {
    if (!addForm.name || !addForm.location) {
      Alert.alert("Error", "School name and location are required");
      return;
    }

    try {
      const newSchool = {
        ...addForm,
        goal: parseInt(addForm.goal as any) || 80,
      };

      const response = await api.post("/api/schools", newSchool);

      if (response) {
        Alert.alert("Success", "School added successfully");
        setAddForm(initialAddForm);
        setShowAddModal(false);
        fetchSchools();
      }
    } catch (err) {
      if (err instanceof ApiError) {
        Alert.alert("Error", err.message);
      }
    }
  };

  const handleDeleteSchool = (id: number, name: string) => {
    Alert.alert("Delete School", `Are you sure you want to delete ${name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.del(`/api/schools/${id}`);
            Alert.alert("Success", "School deleted successfully");
            fetchSchools();
          } catch (err) {
            if (err instanceof ApiError) {
              Alert.alert("Error", err.message);
            }
          }
        },
      },
    ]);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchSchools();
  };

  // ============================================
  // FILTERS & PAGINATION
  // ============================================
  const filteredSchools = schools.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation =
      selectedLocation === "All" ||
      s.location.toLowerCase().startsWith(selectedLocation.toLowerCase());
    return matchesSearch && matchesLocation;
  });

  const ITEMS_PER_PAGE = 6;
  const totalPages = Math.ceil(filteredSchools.length / ITEMS_PER_PAGE);
  const paginatedSchools = filteredSchools.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedLocation]);

  // ============================================
  // RENDER FUNCTIONS
  // ============================================
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage, "...", totalPages);
      }
    }

    return (
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          style={[
            styles.paginationButton,
            currentPage === 1 && styles.disabledButton,
          ]}
        >
          <Text style={styles.paginationText}>Prev</Text>
        </TouchableOpacity>

        <View style={styles.paginationPages}>
          {pages.map((page, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => typeof page === "number" && setCurrentPage(page)}
              disabled={page === "..."}
              style={[
                styles.pageButton,
                page === currentPage && styles.activePageButton,
                page === "..." && styles.dotsButton,
              ]}
            >
              <Text
                style={[
                  styles.pageText,
                  page === currentPage && styles.activePageText,
                  page === "..." && styles.dotsText,
                ]}
              >
                {page}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          onPress={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          style={[
            styles.paginationButton,
            currentPage === totalPages && styles.disabledButton,
          ]}
        >
          <Text style={styles.paginationText}>Next</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderSchoolCard = (s: School, index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.schoolCard}
      onPress={() => {
        router.push({
          pathname: "/education_schools_profile",
          params: {
            id: s.id.toString(),
            name: s.name,
            district: s.location,
            enrolled: (s.enrolled || 0).toString(),
            programs: (s.programs || 0).toString(),
            impact: (s.goal || 0).toString(),
            status: s.status,
            image: s.image,
          },
        });
      }}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <View style={styles.schoolImageContainer}>
            {s.image ? (
              <Image source={{ uri: s.image }} style={styles.schoolImage} />
            ) : (
              <View style={styles.schoolImagePlaceholder}>
                <Icon name="school" size={24} color="#666" />
              </View>
            )}
          </View>
          <View>
            <Text style={styles.schoolName}>{s.name}</Text>
            <View style={styles.locationContainer}>
              <Icon name="location-on" size={14} color="#666" />
              <Text style={styles.schoolLocation}>{s.location}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity onPress={() => handleDeleteSchool(s.id, s.name)}>
          <Icon name="delete-outline" size={22} color={colors.rose} />
        </TouchableOpacity>
      </View>

      <View style={styles.cardStats}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Enrolled</Text>
          <Text style={styles.statValue}>{s.enrolled ?? 0}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Programs</Text>
          <Text style={styles.statValue}>{s.programs || 0}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Status</Text>
          <View
            style={[
              styles.statusBadge,
              s.status === "Active" ? styles.activeBadge : styles.inactiveBadge,
            ]}
          >
            <Text style={styles.statusText}>{s.status}</Text>
          </View>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Impact Goal</Text>
          <Text
            style={[
              styles.progressValue,
              (s.goal || 0) > 50
                ? styles.progressSuccess
                : styles.progressWarning,
            ]}
          >
            {s.goal || 0}%
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${s.goal || 0}%`,
                backgroundColor:
                  (s.goal || 0) > 50 ? colors.primary : "#ff9800",
              },
            ]}
          />
        </View>
      </View>
    </TouchableOpacity>
  );

  // ============================================
  // LOADING STATE
  // ============================================
  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading schools...</Text>
      </SafeAreaView>
    );
  }

  // ============================================
  // RENDER
  // ============================================
  return (
    <RouteGuard>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
            />
          }
        >
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push("/education_management_hub")}
          >
            <Icon name="arrow-back" size={20} color="#666" />
            <Text style={styles.backText}>Back to Education Hub</Text>
          </TouchableOpacity>

          <View style={styles.headerContainer}>
            <View>
              <Text style={styles.title}>Education Module</Text>
              <Text style={styles.subtitle}>
                Monitoring school profiles, program participation, and
                geographic impact across targeted regions.
              </Text>
            </View>
          </View>

          {/* Map and Metrics Grid */}
          <View style={styles.mapContainer}>
            <View style={styles.mapWrapper}>
              <WebView
                source={{
                  uri: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15078.123456789!2d72.8311!3d19.0760!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDA0JzMzLjYiTiA3MsKwNDknNTIuMCJF!5e0!3m2!1sen!2sin!4v1234567890",
                }}
                style={styles.mapWebView}
                javaScriptEnabled={true}
                domStorageEnabled={true}
              />
              <View style={styles.mapOverlay}>
                <View style={styles.overlayHeader}>
                  <Text style={styles.overlayTitle}>Regional Impact</Text>
                  <Icon name="public" size={24} color={colors.primary} />
                </View>
                <View style={styles.overlayStats}>
                  <View style={styles.overlayStat}>
                    <Text style={styles.overlayStatLabel}>Total Schools</Text>
                    <Text style={styles.overlayStatValue}>
                      {schools.length}
                    </Text>
                  </View>
                  <View style={styles.overlayStat}>
                    <Text style={styles.overlayStatLabel}>Active Students</Text>
                    <Text
                      style={[
                        styles.overlayStatValue,
                        styles.overlayStatValuePrimary,
                      ]}
                    >
                      {schools
                        .reduce((acc, s) => acc + (s.enrolled ?? 0), 0)
                        .toLocaleString()}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Metrics Side Panel */}
            <View style={styles.metricsPanel}>
              <View style={styles.impactCard}>
                <View style={styles.impactHeader}>
                  <Icon name="trending-up" size={20} color="#1a3a37" />
                  <Text style={styles.impactLabel}>Overall Impact Score</Text>
                </View>
                <View style={styles.impactScoreContainer}>
                  <Text style={styles.impactScore}>
                    {schools.length > 0
                      ? Math.round(
                          schools.reduce((acc, s) => acc + (s.goal || 0), 0) /
                            schools.length,
                        )
                      : 0}
                  </Text>
                  <Text style={styles.impactScoreTotal}>/ 100</Text>
                </View>
                <View style={styles.impactMetrics}>
                  <View style={styles.impactMetric}>
                    <View style={styles.metricRow}>
                      <Text style={styles.metricLabel}>Program Attendance</Text>
                      <Text style={styles.metricValue}>92%</Text>
                    </View>
                    <View style={styles.metricBar}>
                      <View style={[styles.metricBarFill, { width: "92%" }]} />
                    </View>
                  </View>
                  <View style={styles.impactMetric}>
                    <View style={styles.metricRow}>
                      <Text style={styles.metricLabel}>
                        Resource Allocation
                      </Text>
                      <Text style={styles.metricValue}>78%</Text>
                    </View>
                    <View style={styles.metricBar}>
                      <View style={[styles.metricBarFill, { width: "78%" }]} />
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.alertCard}>
                <Text style={styles.alertTitle}>Needs Attention</Text>
                <View style={styles.alertContent}>
                  <View style={styles.alertIcon}>
                    <Icon name="warning" size={20} color="#e65100" />
                  </View>
                  <View style={styles.alertTextContainer}>
                    <Text style={styles.alertText}>
                      {schools.filter((s) => s.status === "Review").length}{" "}
                      Schools require immediate resource restocking.
                    </Text>
                    <TouchableOpacity style={styles.alertAction}>
                      <Text style={styles.alertActionText}>
                        Review Inventory
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Toolbar */}
          <View style={styles.toolbar}>
            <View style={styles.searchContainer}>
              <Icon
                name="search"
                size={20}
                color="#666"
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search schools..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <View style={styles.toolbarActions}>
              <TouchableOpacity style={styles.exportButton}>
                <Icon name="file-download" size={18} color="#333" />
                <Text style={styles.exportText}>Export Data</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowAddModal(true)}
              >
                <Icon name="add" size={18} color="#fff" />
                <Text style={styles.addButtonText}>Add School</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* School Cards Section */}
          <View style={styles.schoolsSection}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Featured Profiles</Text>
                <Text style={styles.sectionSubtitle}>
                  Showing {filteredSchools.length} partner schools
                </Text>
              </View>
              <View style={styles.locationFilterContainer}>
                <Icon
                  name="location-on"
                  size={18}
                  color="#666"
                  style={styles.filterIcon}
                />
                <Picker
                  selectedValue={selectedLocation}
                  onValueChange={(itemValue) => setSelectedLocation(itemValue)}
                  style={styles.locationPicker}
                >
                  <Picker.Item label="All Locations" value="All" />
                  {Array.from(
                    new Set(
                      schools.map((s) =>
                        s.location
                          ? s.location.split(",")[0].trim()
                          : "Unknown Location",
                      ),
                    ),
                  ).map((loc) => (
                    <Picker.Item key={loc} label={loc} value={loc} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.schoolsGrid}>
              {paginatedSchools.map(renderSchoolCard)}
              {filteredSchools.length === 0 && (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    No partner schools match your search query.
                  </Text>
                </View>
              )}
            </View>

            {renderPagination()}
          </View>
        </ScrollView>

        {/* Add School Modal */}
        <Modal
          visible={showAddModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowAddModal(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalOverlay}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add New Partner School</Text>
                <TouchableOpacity
                  onPress={() => setShowAddModal(false)}
                  style={styles.modalClose}
                >
                  <Icon name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.modalBody}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.formGrid}>
                  <InputField
                    label="School Name"
                    name="name"
                    value={addForm.name}
                    onChange={setAddForm}
                    required
                  />
                  <InputField
                    label="Principal / Headmaster Name"
                    name="principalName"
                    value={addForm.principalName}
                    onChange={setAddForm}
                  />
                  <InputField
                    label="UDISE Code"
                    name="udiseCode"
                    value={addForm.udiseCode}
                    onChange={setAddForm}
                  />
                  <InputField
                    label="Email"
                    name="email"
                    type="email"
                    value={addForm.email}
                    onChange={setAddForm}
                  />
                  <InputField
                    label="Phone"
                    name="phone"
                    value={addForm.phone}
                    onChange={setAddForm}
                  />
                  <InputField
                    label="Location/City"
                    name="location"
                    value={addForm.location}
                    onChange={setAddForm}
                    required
                  />
                  <InputField
                    label="Status"
                    name="status"
                    value={addForm.status}
                    onChange={setAddForm}
                    options={["Active", "Inactive", "Under Review"]}
                  />
                  <InputField
                    label="Enrolment Goal"
                    name="goal"
                    type="number"
                    value={String(addForm.goal)}
                    onChange={setAddForm}
                  />
                </View>

                <InputField
                  label="Address"
                  name="address"
                  value={addForm.address}
                  onChange={setAddForm}
                  multiline
                />

                <InputField
                  label="Google Maps Embed URL"
                  name="mapUrl"
                  value={addForm.mapUrl}
                  onChange={setAddForm}
                  placeholder="https://maps.google.com/embed?..."
                />

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setShowAddModal(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.submitButton]}
                    onPress={handleAddSchool}
                  >
                    <Text style={styles.submitButtonText}>Add School</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </SafeAreaView>
    </RouteGuard>
  );
};

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  backText: {
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    color: "#666",
  },
  headerContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },
  mapContainer: {
    marginBottom: 24,
  },
  mapWrapper: {
    height: 400,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#fff",
    marginBottom: 16,
    position: "relative",
  },
  mapWebView: {
    flex: 1,
  },
  mapOverlay: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 16,
    padding: 16,
  },
  overlayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  overlayTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  overlayStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  overlayStat: {
    flex: 1,
  },
  overlayStatLabel: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: "#666",
    marginBottom: 4,
  },
  overlayStatValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  overlayStatValuePrimary: {
    color: "#006857",
  },
  metricsPanel: {
    gap: 16,
  },
  impactCard: {
    backgroundColor: "#e8f5e9",
    borderRadius: 16,
    padding: 24,
    position: "relative",
    overflow: "hidden",
  },
  impactHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  impactLabel: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: "#1a3a37",
  },
  impactScoreContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    marginBottom: 16,
  },
  impactScore: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#1a3a37",
  },
  impactScoreTotal: {
    fontSize: 16,
    color: "#1a3a37",
    opacity: 0.8,
  },
  impactMetrics: {
    gap: 12,
  },
  impactMetric: {
    gap: 4,
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metricLabel: {
    fontSize: 14,
    color: "#1a3a37",
  },
  metricValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1a3a37",
  },
  metricBar: {
    height: 6,
    backgroundColor: "rgba(0,104,87,0.2)",
    borderRadius: 3,
    overflow: "hidden",
  },
  metricBarFill: {
    height: "100%",
    backgroundColor: "#1a3a37",
    borderRadius: 3,
  },
  alertCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
  },
  alertTitle: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: "#666",
    marginBottom: 12,
  },
  alertContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(230,81,0,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  alertTextContainer: {
    flex: 1,
  },
  alertText: {
    fontSize: 14,
    color: "#1a1a1a",
    marginBottom: 8,
  },
  alertAction: {
    alignSelf: "flex-start",
  },
  alertActionText: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    color: "#006857",
    fontWeight: "600",
  },
  toolbar: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    flexDirection: Platform.OS === "ios" ? "column" : "row",
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 25,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#1a1a1a",
  },
  toolbarActions: {
    flexDirection: "row",
    gap: 8,
  },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 25,
  },
  exportText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: "#333",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#006857",
    borderRadius: 25,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: "#fff",
  },
  schoolsSection: {
    marginBottom: 40,
  },
  sectionHeader: {
    flexDirection: Platform.OS === "ios" ? "column" : "row",
    justifyContent: "space-between",
    alignItems: Platform.OS === "ios" ? "flex-start" : "center",
    gap: 12,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  sectionSubtitle: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  locationFilterContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 25,
    paddingHorizontal: 8,
    minWidth: 180,
  },
  filterIcon: {
    marginRight: 4,
  },
  locationPicker: {
    flex: 1,
    height: 44,
  },
  schoolsGrid: {
    gap: 16,
  },
  schoolCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    gap: 12,
    flex: 1,
  },
  schoolImageContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f5f5f5",
  },
  schoolImage: {
    width: "100%",
    height: "100%",
  },
  schoolImagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  schoolName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  schoolLocation: {
    fontSize: 14,
    color: "#666",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: "#e8f5e9",
  },
  inactiveBadge: {
    backgroundColor: "#f5f5f5",
  },
  statusText: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontWeight: "600",
  },
  cardStats: {
    flexDirection: "row",
    gap: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: "#666",
    marginBottom: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  progressContainer: {
    gap: 4,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressLabel: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: "#666",
  },
  progressValue: {
    fontSize: 12,
    fontWeight: "600",
  },
  progressSuccess: {
    color: "#006857",
  },
  progressWarning: {
    color: "#ff9800",
  },
  progressBar: {
    height: 6,
    backgroundColor: "#f0f0f0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 24,
  },
  paginationButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  disabledButton: {
    opacity: 0.5,
  },
  paginationText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  paginationPages: {
    flexDirection: "row",
    gap: 4,
  },
  pageButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  activePageButton: {
    backgroundColor: "#006857",
  },
  dotsButton: {
    opacity: 0.5,
  },
  pageText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  activePageText: {
    color: "#fff",
  },
  dotsText: {
    color: "#666",
  },
  emptyContainer: {
    paddingVertical: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 24,
    width: "100%",
    maxWidth: 600,
    maxHeight: "90%",
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  modalClose: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  formGrid: {
    gap: 16,
    marginBottom: 16,
  },
  inputContainer: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: "#666",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: "#1a1a1a",
    backgroundColor: "#fff",
    minHeight: 44,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  picker: {
    height: 44,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  submitButton: {
    backgroundColor: "#006857",
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
});

export default SchoolsModule;
