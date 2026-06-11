import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Animated,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

// Theme Colors
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
  secondaryContainer: '#fc820c',
  error: '#ba1a1a',
  errorContainer: '#ffdad6',
};

// Schools Data
const schoolsData = [
  {
    id: 1,
    name: 'Oakridge Academy',
    district: 'North District',
    enrolled: 1240,
    programs: 4,
    impact: 85,
    status: 'Active',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAd0x1ztc9iuj8nay2xC1_MH-xTSmAKr8IhFrASNZRkSKkt-Y4BunC5I9iqvTLQ0_8lmU0zaYnPjqddtwFcC75fjZRBUU-N_7DG60EY9HluYt_nZMGUi1MCuGMs9ZtR2iM2AGFyw2MvZhg-RlW1as3xPOOXef7qU9OwfisCQeoCv_6chJeBZbBMdmknEG_LLtMl_EWluwSEWTOAEkWm2p31lCjaolK7bQHfqtZzT6CLsbLoare9Nu918oPHFj07H0LgIShvW4giB6YL',
  },
  {
    id: 2,
    name: 'Riverside Public',
    district: 'East Valley',
    enrolled: 850,
    programs: 2,
    impact: 42,
    status: 'Review',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCz5AwPFuwFIR2gamqHGmS3Z3IdTDQwW83VVeH6b9NJQeyhwstun166F-NBJdmvRxVedIL-KvP2kSfrxII7pBp79OmeBVj_J6PnuiUawZodfc0uJXAvWrakkcwnw4Hqf3XMp1L_FWf3gbWbnqajq_B2L9R61bXpsmng6PGHQ1DhYHPRtNj0FIVW9oXuywykoMFb8kYgru_HD_DkySGwo1b-jcWzvibQ5MZ6R3bzcPgSiBKeu0Rk1ETZRc61Hdu6z3xj1KNhL2dgFdP5',
  },
  {
    id: 3,
    name: 'Summit Prep',
    district: 'West Highlands',
    enrolled: 2100,
    programs: 7,
    impact: 94,
    status: 'Active',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB3JsQ8gLDGjXcAskdAgUZD_gbTWPDpCHJ32DnFoopdp-_p5I_tgEYtvw4dOCafH7MyasL1dS3wak_92AIaWlwMwG3sj4MjB1WuLlaXIrD_Pgmeuj-7QDOpOBBGV61QzLmn-ToK-R2LhxD-uDv5RiRqzcVeF6dzd8NDuP0UxUs4_6vkZrksOHYi1xW4AxQWl2kD1120kSJ72va_hR5sAs4V-2ir50bTZl6Oc9Rb9HATjyWanXkUOJDd6GDhhJaAsICMPa-8RFXRUFJx',
  },
];

// Footer Component
const Footer = () => {
  return (
    <View style={styles.footer}>
      <View style={styles.footerContent}>
        <View style={styles.footerSection}>
          <View style={styles.footerLogoContainer}>
            <LinearGradient colors={[colors.primary, colors.primaryContainer]} style={styles.footerLogoIcon}>
              <MaterialIcons name="local-library" size={24} color="#fff" />
            </LinearGradient>
            <Text style={styles.footerFoundationName}>Aman Foundation</Text>
          </View>
          <Text style={styles.footerTagline}>Creating lasting impact in communities</Text>
        </View>

        <View style={styles.footerSection}>
          <Text style={styles.footerSectionTitle}>Contact Us</Text>
          <View style={styles.footerContactItem}>
            <Ionicons name="call-outline" size={16} color="#6B7280" />
            <Text style={styles.footerContactText}>+91 300 1234567</Text>
          </View>
          <View style={styles.footerContactItem}>
            <Ionicons name="mail-outline" size={16} color="#6B7280" />
            <Text style={styles.footerContactText}>info@amanfoundation.org</Text>
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
            <Text style={styles.footerAddressText}>Mumbai{'\n'}Sector F-11/3, Maha{'\n'}India</Text>
          </View>
        </View>
      </View>

      <View style={styles.footerBottom}>
        <Text style={styles.footerCopyright}>© 2026 Aman Foundation. All Rights Reserved.</Text>
        <View style={styles.footerLinks}>
          <Text style={styles.footerLinkText}>Terms & Conditions</Text>
          <Text style={styles.footerDot}>•</Text>
          <Text style={styles.footerLinkText}>Privacy Policy</Text>
        </View>
      </View>
    </View>
  );
};

// School Card Component
const SchoolCard = ({ school, onPress }) => (
  <TouchableOpacity
    style={styles.schoolCard}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.cardHeader}>
      <View style={styles.schoolInfo}>
        <Image source={{ uri: school.image }} style={styles.schoolImage} />
        <View>
          <Text style={styles.schoolName}>{school.name}</Text>
          <View style={styles.locationContainer}>
            <MaterialIcons name="location-on" size={14} color={colors.onSurfaceVariant} />
            <Text style={styles.schoolLocation}>{school.district}</Text>
          </View>
        </View>
      </View>
      <View style={[styles.statusBadge, school.status === 'Active' ? styles.statusActive : styles.statusReview]}>
        <Text style={styles.statusText}>{school.status}</Text>
      </View>
    </View>

    <View style={styles.statsContainer}>
      <View>
        <Text style={styles.statLabel}>Enrolled</Text>
        <Text style={styles.statValue}>{school.enrolled}</Text>
      </View>
      <View>
        <Text style={styles.statLabel}>Programs</Text>
        <Text style={styles.statValue}>{school.programs}</Text>
      </View>
    </View>

    <View>
      <View style={styles.goalHeader}>
        <Text style={styles.goalLabel}>Impact Goal</Text>
        <Text style={[styles.goalPercentage, school.impact >= 85 ? styles.goalSuccess : styles.goalWarning]}>
          {school.impact}%
        </Text>
      </View>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressFill, { width: `${school.impact}%` }]} />
      </View>
    </View>
  </TouchableOpacity>
);

export default function SchoolsModule() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showFooter, setShowFooter] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-width)).current;

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

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  };

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowFooter(offsetY > 450);
  };

  const filteredSchools = schoolsData.filter((school) =>
    school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    school.district.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={{ flex: 1 }}>
      {/* OVERLAY */}
      {menuOpen && <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={toggleMenu} />}

      {/* SIDEBAR */}
      <Animated.View style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}>
        <View style={styles.brandContainer}>
          <LinearGradient colors={[colors.primary, colors.primaryContainer]} style={styles.brandIcon}>
            <MaterialIcons name="local-library" size={22} color="#fff" />
          </LinearGradient>
          <View>
            <Text style={styles.brandTitle}>Aman Foundation</Text>
            <Text style={styles.brandSub}>Impact Portal</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.menuItem} onPress={() => { toggleMenu(); router.push("/"); }}>
          <Ionicons name="grid-outline" size={20} color="#4b5563" />
          <Text style={styles.menuText}>Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => { toggleMenu(); router.push("/education_management_hub"); }}>
          <Ionicons name="school-outline" size={20} color="#4b5563" />
          <Text style={styles.menuText}>Education</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => { toggleMenu(); router.push("/education_fellows_module"); }}>
          <Ionicons name="people-outline" size={20} color="#4b5563" />
          <Text style={styles.menuText}>Fellows</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => { toggleMenu(); router.push("/education_students_module"); }}>
          <Ionicons name="happy-outline" size={20} color="#4b5563" />
          <Text style={styles.menuText}>Students</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItemActive}>
          <Ionicons name="business-outline" size={20} color="#fff" />
          <Text style={styles.menuTextActive}>Schools</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => { toggleMenu(); router.push("/education_pta_programs"); }}>
          <Ionicons name="people-circle-outline" size={20} color="#4b5563" />
          <Text style={styles.menuText}>PTA & Programs</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => { toggleMenu(); router.push("/livelihood_management_hub"); }}>
          <Ionicons name="bicycle-outline" size={20} color="#4b5563" />
          <Text style={styles.menuText}>Livelihood</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => { toggleMenu(); router.push("/disaster_relief_management"); }}>
          <Ionicons name="snow-outline" size={20} color="#4b5563" />
          <Text style={styles.menuText}>Disaster Relief</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => { toggleMenu(); router.push("/hr_employee_management"); }}>
          <Ionicons name="people-outline" size={20} color="#4b5563" />
          <Text style={styles.menuText}>HR Management</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => { toggleMenu(); router.push("/admin_access_control"); }}>
          <Ionicons name="document-text-outline" size={20} color="#4b5563" />
          <Text style={styles.menuText}>Admin & Access</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* MAIN CONTENT */}
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={toggleMenu}>
            <MaterialIcons name="menu" size={24} color="#64748b" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Impact Portal</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity>
              <Ionicons name="notifications-outline" size={22} color="#1f2937" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Ionicons name="settings-outline" size={22} color="#1f2937" />
            </TouchableOpacity>
            <Image source={{ uri: 'https://randomuser.me/api/portraits/women/68.jpg' }} style={styles.avatar} />
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 20, gap: 24 }}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
        >
          {/* Back Button */}
          <TouchableOpacity style={styles.backBtn} onPress={() => router.push("/education_management_hub")}>
            <MaterialIcons name="arrow-back" size={18} color="#6b7280" />
            <Text style={styles.backText}>Back to Education Hub</Text>
          </TouchableOpacity>

          {/* Header Section */}
          <View>
            <Text style={styles.mainTitle}>Schools Module</Text>
            <Text style={styles.subtitle}>
              Monitoring school profiles, program participation, and geographic impact across targeted regions.
            </Text>
          </View>

          {/* Search and Export */}
          <View style={styles.actionContainer}>
            <View style={styles.searchContainer}>
              <MaterialIcons name="search" size={20} color={colors.onSurfaceVariant} />
              <TextInput
                placeholder="Search schools..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchInput}
                placeholderTextColor="#9ca3af"
              />
            </View>
            <TouchableOpacity style={styles.exportButton}>
              <Feather name="download" size={16} color="#fff" />
              <Text style={styles.exportButtonText}>Export</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addButton}>
              <MaterialIcons name="add" size={18} color="white" />
              <Text style={styles.addButtonText}>Add School</Text>
            </TouchableOpacity>
          </View>

          {/* Map & Stats Section */}
          <View style={styles.mapContainer}>
            <View style={styles.mapCard}>
              <Image source={{ uri: 'https://picsum.photos/800/400?grayscale' }} style={styles.mapImage} />
              <BlurView intensity={80} tint="light" style={styles.mapOverlay}>
                <View style={styles.mapOverlayHeader}>
                  <Text style={styles.mapOverlayTitle}>Regional Impact</Text>
                  <MaterialIcons name="public" size={20} color={colors.primary} />
                </View>
                <View style={styles.mapStats}>
                  <View>
                    <Text style={styles.mapStatLabel}>Total Schools</Text>
                    <Text style={styles.mapStatValue}>124</Text>
                  </View>
                  <View>
                    <Text style={styles.mapStatLabel}>Active Students</Text>
                    <Text style={[styles.mapStatValue, { color: colors.primary }]}>45.2k</Text>
                  </View>
                </View>
              </BlurView>
            </View>

            <View style={styles.rightStats}>
              <LinearGradient colors={[colors.primaryContainer, colors.primaryContainer]} style={styles.impactCard}>
                <View style={styles.impactHeader}>
                  <MaterialIcons name="trending-up" size={20} color={colors.onPrimaryContainer} />
                  <Text style={styles.impactLabel}>Overall Impact Score</Text>
                </View>
                <View style={styles.impactScore}>
                  <Text style={styles.impactValue}>87</Text>
                  <Text style={styles.impactTotal}>/ 100</Text>
                </View>
                <View style={styles.impactDetails}>
                  <View>
                    <View style={styles.impactRow}>
                      <Text style={styles.impactText}>Program Attendance</Text>
                      <Text style={styles.impactPercent}>92%</Text>
                    </View>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFillSmall, { width: '92%' }]} />
                    </View>
                  </View>
                  <View>
                    <View style={styles.impactRow}>
                      <Text style={styles.impactText}>Resource Allocation</Text>
                      <Text style={styles.impactPercent}>78%</Text>
                    </View>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFillSmall, { width: '78%' }]} />
                    </View>
                  </View>
                </View>
              </LinearGradient>

              <View style={styles.alertCard}>
                <Text style={styles.alertLabel}>Needs Attention</Text>
                <View style={styles.alertContent}>
                  <View style={styles.alertIcon}>
                    <MaterialIcons name="warning" size={20} color={colors.secondary} />
                  </View>
                  <View>
                    <Text style={styles.alertText}>3 Schools require immediate resource restocking.</Text>
                    <TouchableOpacity>
                      <Text style={styles.alertLink}>Review Inventory</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Featured Profiles Section */}
          <View>
            <View style={styles.featuredHeader}>
              <Text style={styles.featuredTitle}>Featured Profiles</Text>
              <TouchableOpacity style={styles.viewAllButton}>
                <Text style={styles.viewAllText}>View All Directory</Text>
                <MaterialIcons name="arrow-forward" size={14} color={colors.primary} />
              </TouchableOpacity>
            </View>
            <View>
              {filteredSchools.map((school) => (
                <SchoolCard
                  key={school.id}
                  school={school}
                  onPress={() => {
                    router.push({
                      pathname: "/education_schools_profile",
                      params: {
                        id: school.id.toString(),
                        name: school.name,
                        district: school.district,
                        enrolled: school.enrolled.toString(),
                        programs: school.programs.toString(),
                        impact: school.impact.toString(),
                        status: school.status,
                        image: school.image,
                      },
                    });
                  }}
                />
              ))}
            </View>
          </View>

          {/* Footer */}
          {showFooter && <Footer />}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
const styles = StyleSheet.create({

  /* ========================================
     SIDEBAR & NAVIGATION
  ======================================== */
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

  menuText: {
    marginLeft: 12,
    fontSize: 14,
    color: "#374151",
  },

  menuItemActive: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#006857",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 30,
    marginBottom: 20,
    elevation: 3,
  },

  menuTextActive: {
    color: "#fff",
    marginLeft: 12,
    fontWeight: "600",
  },

  /* ========================================
     HEADER
  ======================================== */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderBottomWidth: 1,
    borderBottomColor: "#edeeef",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },

  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },

  /* ========================================
     PAGE HEADER / TITLE
  ======================================== */
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },

  backText: {
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
    color: "#64748b",
  },

  mainTitle: {
    fontSize: 40,
    fontWeight: "900",
    letterSpacing: -0.5,
    color: "#191c1d",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 16,
    color: "#3d4945",
  },

  /* ========================================
     ACTION BUTTONS & SEARCH
  ======================================== */
  actionContainer: {
    flexDirection: "row",
    gap: 12,
  },

  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#edeeef",
    borderRadius: 50,
    paddingHorizontal: 16,
    gap: 8,
  },

  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
  },

  exportButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.primary,
    borderRadius: 50,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  exportButtonText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    color: "white",
  },

  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.primary,
    borderRadius: 50,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },

  addButtonText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    color: "white",
  },

  /* ========================================
     MAP SECTION
  ======================================== */
  mapContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },

  mapCard: {
    flex: 2,
    minWidth: 250,
    height: 300,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },

  mapImage: {
    width: "100%",
    height: "100%",
  },

  mapOverlay: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 16,
    overflow: "hidden",
  },

  mapOverlayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  mapOverlayTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#191c1d",
  },

  mapStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  mapStatLabel: {
    fontSize: 10,
    fontWeight: "500",
    textTransform: "uppercase",
    color: "#3d4945",
  },

  mapStatValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#191c1d",
  },

  /* ========================================
     IMPACT / STATISTICS SECTION
  ======================================== */
  rightStats: {
    flex: 1,
    minWidth: 200,
    gap: 16,
  },

  impactCard: {
    padding: 24,
    borderRadius: 16,
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
    fontWeight: "500",
    textTransform: "uppercase",
    color: "rgba(0,0,0,0.7)",
  },

  impactScore: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },

  impactValue: {
    fontSize: 48,
    fontWeight: "800",
    letterSpacing: -1,
    color: "#00201a",
  },

  impactTotal: {
    fontSize: 14,
    color: "rgba(0,0,0,0.6)",
  },

  impactDetails: {
    marginTop: 24,
    gap: 16,
  },

  impactRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },

  impactText: {
    color: "#00201a",
  },

  impactPercent: {
    fontWeight: "600",
    color: "#00201a",
  },

  progressBar: {
    height: 6,
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 10,
  },

  progressFillSmall: {
    height: "100%",
    backgroundColor: "#00201a",
    borderRadius: 10,
  },

  /* ========================================
     ALERT SECTION
  ======================================== */
  alertCard: {
    padding: 20,
    backgroundColor: "#f3f4f5",
    borderRadius: 16,
  },

  alertLabel: {
    fontSize: 10,
    fontWeight: "500",
    textTransform: "uppercase",
    color: "#3d4945",
    marginBottom: 12,
  },

  alertContent: {
    flexDirection: "row",
    gap: 16,
  },

  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 30,
    backgroundColor: "rgba(150,73,0,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },

  alertText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#191c1d",
  },

  alertLink: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    color: "#006857",
    marginTop: 8,
  },

  /* ========================================
     FEATURED SECTION
  ======================================== */
  featuredHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  featuredTitle: {
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: -0.5,
    color: "#191c1d",
  },

  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  viewAllText: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    color: "#006857",
  },

  /* ========================================
     SCHOOL CARD
  ======================================== */
  schoolCard: {
    backgroundColor: colors.surfaceContainerLowest,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },

  schoolInfo: {
    flexDirection: "row",
    gap: 16,
    flex: 1,
  },

  schoolImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },

  schoolName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.onSurface,
    marginBottom: 4,
  },

  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  schoolLocation: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },

  /* ========================================
     STATUS BADGES
  ======================================== */
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },

  statusActive: {
    backgroundColor: "#d1fae5",
  },

  statusReview: {
    backgroundColor: colors.surfaceContainerHighest,
  },

  statusText: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    color: "#065f46",
  },

  /* ========================================
     STATS SECTION
  ======================================== */
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceVariant,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceVariant,
    marginBottom: 16,
  },

  statLabel: {
    fontSize: 10,
    fontWeight: "500",
    textTransform: "uppercase",
    color: colors.onSurfaceVariant,
    marginBottom: 4,
  },

  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.onSurface,
  },

  /* ========================================
     GOAL PROGRESS
  ======================================== */
  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  goalLabel: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    color: colors.onSurfaceVariant,
  },

  goalPercentage: {
    fontSize: 12,
    fontWeight: "600",
  },

  goalSuccess: {
    color: colors.primary,
  },

  goalWarning: {
    color: colors.secondary,
  },

  progressBarContainer: {
    height: 6,
    backgroundColor: colors.surfaceContainerHighest,
    borderRadius: 10,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 10,
  },

  /* ========================================
     FOOTER
  ======================================== */
  footer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginTop: 40,
    marginBottom: 20,
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