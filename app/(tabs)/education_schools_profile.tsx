// import { AMAN_FOUNDATION_MAP } from "@/lib/schoolsData";
// import { useAuth } from "@/lib/useAuth";
// import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
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

// Custom Components
const InputField = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  options,
  multiline = false,
}) => {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      {options ? (
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={value}
            onValueChange={(itemValue) =>
              onChange({ target: { name, value: itemValue } })
            }
            style={styles.picker}
          >
            {options.map((o) => (
              <Picker.Item key={o} label={o} value={o} />
            ))}
          </Picker>
        </View>
      ) : type === "textarea" || multiline ? (
        <TextInput
          style={[styles.input, styles.textArea]}
          value={value}
          onChangeText={(text) => onChange({ target: { name, value: text } })}
          placeholder={`Enter ${label.toLowerCase()}`}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      ) : (
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={(text) => onChange({ target: { name, value: text } })}
          placeholder={`Enter ${label.toLowerCase()}`}
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

const SchoolsModule = () => {
  const { token } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    loadSchools();
  }, [token]);

  const loadSchools = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/schools", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const json = await res.json();
      if (json.success) {
        setSchools(json.data);
      }
    } catch (err) {
      console.error("Failed to load schools:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSchool = async () => {
    if (!addForm.name || !addForm.location) return;

    try {
      const res = await fetch("/api/schools", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          ...addForm,
          goal: parseInt(addForm.goal),
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSchools([json.data, ...schools]);
        setAddForm(initialAddForm);
        setShowAddModal(false);
      }
    } catch (err) {
      console.error("Failed to add school:", err);
    }
  };

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

  const renderSchoolCard = (s, index) => (
    <TouchableOpacity
      key={index}
      style={styles.schoolCard}
      onPress={() => {
        // Navigate to school details
        // navigation.navigate('SchoolDetails', { id: s.id });
      }}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <View style={styles.schoolImageContainer}>
            {s.img ? (
              <Image source={{ uri: s.img }} style={styles.schoolImage} />
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
        <View
          style={[
            styles.statusBadge,
            s.status === "Active" ? styles.activeBadge : styles.inactiveBadge,
          ]}
        >
          <Text style={styles.statusText}>{s.status}</Text>
        </View>
      </View>

      <View style={styles.cardStats}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Enrolled</Text>
          <Text style={styles.statValue}>{s.enrolled ?? 0}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Programs</Text>
          <Text style={styles.statValue}>{s.programs}</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Impact Goal</Text>
          <Text
            style={[
              styles.progressValue,
              s.goal > 50 ? styles.progressSuccess : styles.progressWarning,
            ]}
          >
            {s.goal}%
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${s.goal}%`,
                backgroundColor: s.goal > 50 ? "#006857" : "#ff9800",
              },
            ]}
          />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          // navigation.goBack();
        }}
      >
        <Icon name="arrow-back" size={20} color="#666" />
        <Text style={styles.backText}>Back to Education Hub</Text>
      </TouchableOpacity>

      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.title}>Education Module</Text>
          <Text style={styles.subtitle}>
            Monitoring school profiles, program participation, and geographic
            impact across targeted regions.
          </Text>
        </View>
      </View>

      {/* Map and Metrics Grid */}
      <View style={styles.mapContainer}>
        <View style={styles.mapWrapper}>
          <WebView
            source={{ uri: AMAN_FOUNDATION_MAP.embedUrl }}
            style={styles.mapWebView}
            javaScriptEnabled={true}
            domStorageEnabled={true}
          />
          <View style={styles.mapOverlay}>
            <View style={styles.overlayHeader}>
              <Text style={styles.overlayTitle}>Regional Impact</Text>
              <Icon name="public" size={24} color="#006857" />
            </View>
            <View style={styles.overlayStats}>
              <View style={styles.overlayStat}>
                <Text style={styles.overlayStatLabel}>Total Schools</Text>
                <Text style={styles.overlayStatValue}>{schools.length}</Text>
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
              <Text style={styles.impactScore}>87</Text>
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
                  <Text style={styles.metricLabel}>Resource Allocation</Text>
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
                  3 Schools require immediate resource restocking.
                </Text>
                <TouchableOpacity style={styles.alertAction}>
                  <Text style={styles.alertActionText}>Review Inventory</Text>
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

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#006857" />
          </View>
        ) : (
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
        )}

        {renderPagination()}
      </View>

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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 40 : 24,
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
    backdropFilter: "blur(12px)",
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
  loadingContainer: {
    paddingVertical: 40,
    justifyContent: "center",
    alignItems: "center",
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
