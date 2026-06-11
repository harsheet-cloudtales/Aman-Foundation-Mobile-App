import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Dimensions,
  Alert,
  Animated,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { WebView } from 'react-native-webview';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const colors = {
  primary: '#006857',
  primaryContainer: '#00846e',
  onPrimary: '#ffffff',
  onPrimaryContainer: '#f4fffa',
  primaryFixed: '#7cf8da',
  onPrimaryFixed: '#00201a',
  surface: '#f8f9fa',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f3f4f5',
  surfaceContainer: '#edeeef',
  surfaceContainerHighest: '#e1e3e4',
  onSurface: '#191c1d',
  onSurfaceVariant: '#3d4945',
  outlineVariant: '#bccac4',
  secondary: '#964900',
};

export default function SchoolProfileDetail() {
  const params = useLocalSearchParams();
  const [menuOpen, setMenuOpen] = useState(false);
  const [educationDropdownOpen, setEducationDropdownOpen] = useState(false);
  const [livelihoodDropdownOpen, setLivelihoodDropdownOpen] = useState(false);
  
  const slideAnim = useRef(new Animated.Value(-width)).current;
  const educationRotateAnim = useRef(new Animated.Value(0)).current;
  const livelihoodRotateAnim = useRef(new Animated.Value(0)).current;

  const school = {
    id: params.id || "1",
    name: params.name || "Oakridge Academy",
    district: params.district || "North District",
    enrolled: params.enrolled || "1240",
    programs: params.programs || "4",
    impact: params.impact || "85",
    status: params.status || "Active",
    image: params.image || "https://lh3.googleusercontent.com/aida-public/AB6AXuAd0x1ztc9iuj8nay2xC1_MH-xTSmAKr8IhFrASNZRkSKkt-Y4BunC5I9iqvTLQ0_8lmU0zaYnPjqddtwFcC75fjZRBUU-N_7DG60EY9HluYt_nZMGUi1MCuGMs9ZtR2iM2AGFyw2MvZhg-RlW1as3xPOOXef7qU9OwfisCQeoCv_6chJeBZbBMdmknEG_LLtMl_EWluwSEWTOAEkWm2p31lCjaolK7bQHfqtZzT6CLsbLoare9Nu918oPHFj07H0LgIShvW4giB6YL",
    location: `${params.district || "North District"}, Kalgachia`,
    address: `${params.district || "North District"}, Kalgachia-781319, Assam`,
    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3575.0416084059693!2d90.87077687542042!3d26.35751617698246!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3759a1653dc76b4b%3A0x63c8798832bf4693!2sAman%20Foundation!5e0!3m2!1sen!2sin!4v1780501000127!5m2!1sen!2sin",
  };

  const [programs] = useState([
    { name: "Standard 3 Literacy Drive", status: "Active", lead: "Aisha Rahman", reach: "120 Students" },
    { name: "Parent Teacher Assembly", status: "Active", lead: "Parent Committee", reach: "85 Families" },
    { name: "Primary Math Block Kit", status: "Active", lead: "Aisha Rahman", reach: "140 Students" },
    { name: "After School Sports Linkage", status: "Completed", lead: "External Coach", reach: "45 Students" },
  ]);

  const [studentDirectory] = useState([
    { name: "Aarav Kumar", id: "STU-2023-089", grade: "Grade 8", status: "On Track" },
    { name: "Meera Patel", id: "STU-2024-012", grade: "Grade 6", status: "Satisfactory" },
    { name: "Devendra Joshi", id: "STU-2024-114", grade: "Grade 8", status: "On Track" },
  ]);

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

  const handleNavigation = (route: string) => {
    toggleMenu();
    router.push(route);
  };

  const rotateEducation = educationRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const rotateLivelihood = livelihoodRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  return (
    <View style={{ flex: 1 }}>
      {/* OVERLAY */}
      {menuOpen && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={toggleMenu}
        />
      )}

      {/* SIDEBAR */}
      <Animated.View
        style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}
      >
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

        <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigation('/')}>
          <Ionicons name="grid-outline" size={20} color="#4b5563" />
          <Text style={styles.menuText}>Dashboard</Text>
        </TouchableOpacity>

        <View>
          <TouchableOpacity style={styles.menuItemWithDropdown} onPress={toggleEducationDropdown}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="school-outline" size={20} color="#4b5563" />
              <Text style={styles.menuText}>Education</Text>
            </View>
            <Animated.View style={{ transform: [{ rotate: rotateEducation }] }}>
              <Ionicons name="chevron-down" size={20} color="#6b7280" />
            </Animated.View>
          </TouchableOpacity>

          {educationDropdownOpen && (
            <View style={styles.dropdownContainer}>
              <TouchableOpacity style={styles.dropdownItem} onPress={() => handleNavigation('/education_management_hub')}>
                <Ionicons name="library-outline" size={18} color="#6b7280" />
                <Text style={styles.dropdownText}>Management Hub</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.dropdownItem, styles.dropdownItemActive]} onPress={() => handleNavigation('/education_schools_module')}>
                <Ionicons name="business-outline" size={18} color="#047857" />
                <Text style={[styles.dropdownText, styles.dropdownTextActive]}>Schools Overview</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dropdownItem} onPress={() => handleNavigation('/education_fellows_module')}>
                <Ionicons name="people-outline" size={18} color="#6b7280" />
                <Text style={styles.dropdownText}>Fellows Directory</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dropdownItem} onPress={() => handleNavigation('/education_students_module')}>
                <Ionicons name="calendar-outline" size={18} color="#6b7280" />
                <Text style={styles.dropdownText}>Students Directory</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dropdownItem} onPress={() => handleNavigation('/education_pta_programs')}>
                <Ionicons name="document-text-outline" size={18} color="#6b7280" />
                <Text style={styles.dropdownText}>Progress Reports</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View>
          <TouchableOpacity style={styles.menuItemWithDropdown} onPress={toggleLivelihoodDropdown}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="bicycle-outline" size={20} color="#4b5563" />
              <Text style={styles.menuText}>Livelihood</Text>
            </View>
            <Animated.View style={{ transform: [{ rotate: rotateLivelihood }] }}>
              <Ionicons name="chevron-down" size={20} color="#6b7280" />
            </Animated.View>
          </TouchableOpacity>

          {livelihoodDropdownOpen && (
            <View style={styles.dropdownContainer}>
              <TouchableOpacity style={styles.dropdownItem} onPress={() => handleNavigation('/livelihood_management_hub')}>
                <Ionicons name="apps-outline" size={18} color="#6b7280" />
                <Text style={styles.dropdownText}>Management Hub</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dropdownItem} onPress={() => handleNavigation('/livelihood_goat_rearing_1')}>
                <Ionicons name="paw-outline" size={18} color="#6b7280" />
                <Text style={styles.dropdownText}>Goat Rearing</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dropdownItem} onPress={() => handleNavigation('/livelihood_sugarcane_cultivation')}>
                <Ionicons name="leaf-outline" size={18} color="#6b7280" />
                <Text style={styles.dropdownText}>Agriculture Support</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dropdownItem} onPress={() => handleNavigation('/beneficiary_master_profile')}>
                <Ionicons name="people-circle-outline" size={18} color="#6b7280" />
                <Text style={styles.dropdownText}>Beneficiaries</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigation('/disaster_relief_management')}>
          <Ionicons name="snow-outline" size={20} color="#4b5563" />
          <Text style={styles.menuText}>Disaster Relief</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigation('/hr_employee_management')}>
          <Ionicons name="people-outline" size={20} color="#4b5563" />
          <Text style={styles.menuText}>HR Management</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigation('/admin_access_control')}>
          <Ionicons name="document-text-outline" size={20} color="#4b5563" />
          <Text style={styles.menuText}>Admin & Access</Text>
        </TouchableOpacity>
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
            <TouchableOpacity style={styles.iconButton} onPress={() => Alert.alert('Notifications', 'No new notifications')}>
              <Ionicons name="notifications-outline" size={22} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => Alert.alert('Settings', 'Settings will be available soon')}>
              <Ionicons name="settings-outline" size={22} color="#6B7280" />
            </TouchableOpacity>
            <Image source={{ uri: 'https://randomuser.me/api/portraits/women/68.jpg' }} style={styles.avatar} />
          </View>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Back Link */}
          <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={20} color="#64748b" />
            <Text style={styles.backLinkText}>Back to Schools Directory</Text>
          </TouchableOpacity>

          {/* Hero Header */}
          <LinearGradient colors={['#FFFFFF', '#FFFFFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroCard}>
            <View style={styles.heroContent}>
              <Image source={{ uri: school.image }} style={styles.schoolAvatar} />
              <View style={styles.schoolInfo}>
                <View style={styles.schoolTitleRow}>
                  <Text style={styles.schoolName}>{school.name}</Text>
                  <View style={[styles.statusBadge, school.status === 'Active' && styles.statusActive]}>
                    <Text style={styles.statusText}>{school.status}</Text>
                  </View>
                </View>
                <View style={styles.locationRow}>
                  <MaterialIcons name="location-on" size={16} color={colors.primary} />
                  <Text style={styles.locationText}>{school.location} • Regional Impact Partner</Text>
                </View>
                <View style={styles.addressContainer}>
                  <Text style={styles.addressLabel}>Address:</Text>
                  <Text style={styles.addressText}>{school.address}</Text>
                </View>
                <View style={styles.contactContainer}>
                  <View>
                    <Text style={styles.contactLabel}>Contact Person:</Text>
                    <Text style={styles.contactText}>Principal Margaret (admin@school.edu)</Text>
                  </View>
                  <View>
                    <Text style={styles.contactLabel}>Phone:</Text>
                    <Text style={styles.contactText}>+91 99887 76655</Text>
                  </View>
                </View>
              </View>
            </View>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.editButton}>
                <MaterialIcons name="edit" size={18} color="#374151" />
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.exportButton}>
                <Feather name="download" size={18} color="white" />
                <Text style={styles.exportButtonText}>Export Impact Report</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* Map Section */}
          <View style={styles.mapCard}>
            <WebView source={{ uri: school.mapUrl }} style={styles.mapWebView} javaScriptEnabled={true} domStorageEnabled={true} />
          </View>

          {/* Two Column Layout */}
          <View style={styles.twoColumnLayout}>
            {/* Left Column */}
            <View style={styles.leftColumn}>
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <MaterialIcons name="campaign" size={20} color={colors.primary} />
                  <Text style={styles.cardTitle}>Active Program Participation</Text>
                </View>
                {programs.map((program, idx) => (
                  <View key={idx} style={styles.programCard}>
                    <View>
                      <Text style={styles.programName}>{program.name}</Text>
                      <Text style={styles.programLead}>Lead Fellow: {program.lead}</Text>
                    </View>
                    <View style={styles.programRight}>
                      <View style={styles.programReach}>
                        <Text style={styles.reachLabel}>Reaches</Text>
                        <Text style={styles.reachValue}>{program.reach}</Text>
                      </View>
                      <View style={[styles.programStatus, program.status === 'Completed' && styles.programStatusCompleted]}>
                        <Text style={styles.programStatusText}>{program.status}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Right Column */}
            <View style={styles.rightColumn}>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>School Metrics</Text>
                <View style={styles.metricsList}>
                  <View style={styles.metricRow}>
                    <Text style={styles.metricLabel}>Total Enrolled Students</Text>
                    <Text style={styles.metricValue}>{school.enrolled} Students</Text>
                  </View>
                  <View style={styles.metricRow}>
                    <Text style={styles.metricLabel}>Class Grade Range</Text>
                    <Text style={styles.metricValue}>Grade 1 to Grade 10</Text>
                  </View>
                  <View style={styles.metricRow}>
                    <Text style={styles.metricLabel}>Student-to-Teacher Ratio</Text>
                    <Text style={styles.metricValue}>28 : 1</Text>
                  </View>
                  <View style={styles.metricRow}>
                    <Text style={styles.metricLabel}>Active Programs</Text>
                    <Text style={[styles.metricValue, styles.metricValuePrimary]}>{school.programs} Programs</Text>
                  </View>
                </View>
              </View>

              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <MaterialIcons name="groups" size={20} color={colors.primary} />
                  <Text style={styles.cardTitle}>Enrolled Beneficiaries</Text>
                </View>
                {studentDirectory.map((student, idx) => (
                  <TouchableOpacity key={idx} style={styles.studentRow} onPress={() => Alert.alert('Student Profile', student.name)}>
                    <View>
                      <Text style={styles.studentName}>{student.name}</Text>
                      <Text style={styles.studentDetails}>ID: {student.id} • {student.grade}</Text>
                    </View>
                    <View style={[styles.studentStatus, student.status === 'On Track' && styles.studentStatusOnTrack]}>
                      <Text style={styles.studentStatusText}>{student.status}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
const styles = StyleSheet.create({

  /* =========================
     SIDEBAR & OVERLAY
  ========================= */
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

  /* =========================
     BRAND SECTION
  ========================= */
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

  /* =========================
     SIDEBAR MENU
  ========================= */
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

  /* =========================
     DROPDOWN MENU
  ========================= */
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

  dropdownItemActive: {
    backgroundColor: "#e8f5e9",
    borderRadius: 8,
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

  /* =========================
     MAIN CONTAINER
  ========================= */
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },

  /* =========================
     HEADER
  ========================= */
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

  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  menuButton: {
    padding: 8,
  },

  iconButton: {
    padding: 8,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },

  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },

  /* =========================
     BACK NAVIGATION
  ========================= */
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

  /* =========================
     HERO / SCHOOL CARD
  ========================= */
  heroCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  heroContent: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 20,
  },

  schoolAvatar: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },

  schoolInfo: {
    flex: 1,
  },

  schoolTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 8,
  },

  schoolName: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.onSurface,
  },

  /* =========================
     STATUS BADGES
  ========================= */
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: "#e5e7eb",
  },

  statusActive: {
    backgroundColor: "#d1fae5",
  },

  statusText: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    color: "#065f46",
  },

  /* =========================
     LOCATION & CONTACT
  ========================= */
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 12,
  },

  locationText: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },

  addressContainer: {
    flexDirection: "row",
    gap: 4,
    marginBottom: 8,
  },

  addressLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.onSurface,
  },

  addressText: {
    fontSize: 11,
    color: colors.onSurfaceVariant,
  },

  contactContainer: {
    flexDirection: "row",
    gap: 16,
    flexWrap: "wrap",
  },

  contactLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.onSurface,
  },

  contactText: {
    fontSize: 10,
    color: colors.onSurfaceVariant,
  },

  /* =========================
     ACTION BUTTONS
  ========================= */
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "flex-end",
  },

  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 999,
  },

  editButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#374151",
  },

  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.primary,
    borderRadius: 999,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },

  exportButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
  },

  /* =========================
     MAP SECTION
  ========================= */
  mapCard: {
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    height: 300,
    overflow: "hidden",
    marginBottom: 16,
  },

  mapWebView: {
    width: "100%",
    height: "100%",
  },

  /* =========================
     LAYOUT
  ========================= */
  twoColumnLayout: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },

  leftColumn: {
    flex: 2,
    minWidth: 280,
  },

  rightColumn: {
    flex: 1,
    minWidth: 250,
  },

  /* =========================
     COMMON CARDS
  ========================= */
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.onSurface,
  },

  /* =========================
     PROGRAM SECTION
  ========================= */
  programCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    backgroundColor: colors.surfaceContainerLow,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },

  programName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.onSurface,
    marginBottom: 4,
  },

  programLead: {
    fontSize: 11,
    color: colors.onSurfaceVariant,
  },

  programRight: {
    alignItems: "flex-end",
    gap: 6,
  },

  programReach: {
    alignItems: "flex-end",
  },

  reachLabel: {
    fontSize: 9,
    color: colors.onSurfaceVariant,
    textTransform: "uppercase",
  },

  reachValue: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.onSurface,
  },

  programStatus: {
    backgroundColor: "#d1fae5",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },

  programStatusCompleted: {
    backgroundColor: "#e5e7eb",
  },

  programStatusText: {
    fontSize: 9,
    fontWeight: "600",
    textTransform: "uppercase",
    color: "#065f46",
  },

  /* =========================
     METRICS SECTION
  ========================= */
  metricsList: {
    gap: 12,
  },

  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceVariant,
  },

  metricLabel: {
    fontSize: 13,
    color: colors.onSurfaceVariant,
  },

  metricValue: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.onSurface,
  },

  metricValuePrimary: {
    color: colors.primary,
  },

  /* =========================
     STUDENT SECTION
  ========================= */
  studentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceVariant,
  },

  studentName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
    marginBottom: 4,
  },

  studentDetails: {
    fontSize: 11,
    color: colors.onSurfaceVariant,
  },

  studentStatus: {
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },

  studentStatusOnTrack: {
    backgroundColor: "#d1fae5",
  },

  studentStatusText: {
    fontSize: 9,
    fontWeight: "600",
    textTransform: "uppercase",
    color: "#065f46",
  },
});