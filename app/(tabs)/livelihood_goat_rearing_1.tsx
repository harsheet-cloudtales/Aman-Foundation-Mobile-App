import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Dimensions,
  Alert,
  Animated,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
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
  primaryFixedDim: '#5ddbbe',
  surface: '#f8f9fa',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f3f4f5',
  surfaceContainer: '#edeeef',
  surfaceContainerHighest: '#e1e3e4',
  onSurface: '#191c1d',
  onSurfaceVariant: '#3d4945',
  outlineVariant: '#bccac4',
  inverseSurface: '#2e3132',
  inverseOnSurface: '#f0f1f2',
  secondary: '#964900',
  secondaryContainer: '#fc820c',
  secondaryFixed: '#ffdcc6',
  onSecondaryContainer: '#5e2c00',
  error: '#ba1a1a',
  errorContainer: '#ffdad6',
};

// ---------- Footer Component ----------
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
            <Text style={styles.footerAddressText}>
              Mumbai{'\n'}
              Sector F-11/3, Maha{'\n'}
              India
            </Text>
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

export default function GoatRearing() {
  const router = useRouter();
  const [timeframe, setTimeframe] = useState("1 Year");
  const [menuOpen, setMenuOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showFooter, setShowFooter] = useState(false);
  const [educationDropdownOpen, setEducationDropdownOpen] = useState(false);
  const [livelihoodDropdownOpen, setLivelihoodDropdownOpen] = useState(false);
  
  const slideAnim = useRef(new Animated.Value(-width)).current;
  const educationRotateAnim = useRef(new Animated.Value(0)).current;
  const livelihoodRotateAnim = useRef(new Animated.Value(0)).current;

  // Trajectory data
  const trajectoryHeights = {
    "6 Months": [40, 50, 60, 45, 55],
    "1 Year": [30, 45, 60, 75, 90],
  };

  const heights = trajectoryHeights[timeframe];
  const locations = ["Bartari", "Digjani", "Sawpur", "Balikuri", "Gunialguri"];

  const healthLogs = [
    {
      id: 1,
      tag: "GR-4092",
      beneficiary: "Fatima Bi",
      checked: "Today",
      status: "Healthy",
      isHealthy: true,
    },
    {
      id: 2,
      tag: "GR-4105",
      beneficiary: "Rahim Khan",
      checked: "Yesterday",
      status: "Needs Check",
      isHealthy: false,
    },
    {
      id: 3,
      tag: "GR-3988",
      beneficiary: "Amina Begum",
      checked: "2d ago",
      status: "Healthy",
      isHealthy: true,
    },
  ];

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

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowFooter(offsetY > 450);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  };

  const rotateEducation = educationRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const rotateLivelihood = livelihoodRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const MetricCard = ({ title, value, trend, subtitle, isHighlighted = false }: any) => (
    <LinearGradient
      colors={isHighlighted ? [colors.primary, colors.primaryContainer] : ['#FFFFFF', '#FFFFFF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.metricCard, isHighlighted && styles.metricCardHighlighted]}
    >
      <Text style={[styles.metricTitle, isHighlighted && styles.metricTitleHighlighted]}>
        {title}
      </Text>
      <View style={styles.metricValueRow}>
        <Text style={[styles.metricValue, isHighlighted && styles.metricValueHighlighted]}>
          {value}
        </Text>
        {trend && (
          <View style={styles.trendBadge}>
            <MaterialIcons name="trending-up" size={10} color="#10b981" />
            <Text style={styles.trendText}>{trend}</Text>
          </View>
        )}
      </View>
      {subtitle && <Text style={[styles.metricSubtitle, isHighlighted && styles.metricSubtitleHighlighted]}>{subtitle}</Text>}
    </LinearGradient>
  );

  const HealthLogItem = ({ tag, beneficiary, checked, status, isHealthy }: any) => (
    <View style={styles.healthLogItem}>
      <View style={styles.healthLogLeft}>
        <View style={[styles.healthLogIcon, isHealthy ? styles.healthIconHealthy : styles.healthIconWarning]}>
          <MaterialIcons 
            name={isHealthy ? "pets" : "medical-services"} 
            size={16} 
            color={isHealthy ? colors.primary : colors.secondary} 
          />
        </View>
        <View>
          <Text style={styles.healthLogTag}>Tag #{tag}</Text>
          <Text style={styles.healthLogBeneficiary}>Beneficiary: {beneficiary}</Text>
        </View>
      </View>
      <View style={styles.healthLogRight}>
        <Text style={styles.healthLogChecked}>Checked: {checked}</Text>
        <View style={[styles.healthStatusBadge, isHealthy ? styles.healthStatusHealthy : styles.healthStatusWarning]}>
          <Text style={[styles.healthStatusText, isHealthy ? styles.healthStatusTextHealthy : styles.healthStatusTextWarning]}>
            {status}
          </Text>
        </View>
      </View>
    </View>
  );

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

        {/* EDUCATION WITH DROPDOWN */}
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
              <TouchableOpacity style={styles.dropdownItem} onPress={() => handleNavigation('/education_schools_module')}>
                <Ionicons name="business-outline" size={18} color="#6b7280" />
                <Text style={styles.dropdownText}>Schools Overview</Text>
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
                <Ionicons name="people-circle-outline" size={18} color="#6b7280" />
                <Text style={styles.dropdownText}>PTA & Programs</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* LIVELIHOOD WITH DROPDOWN - ACTIVE */}
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
              <TouchableOpacity style={[styles.dropdownItem, styles.dropdownItemActive]} onPress={() => handleNavigation('/livelihood_goat_rearing_1')}>
                <Ionicons name="paw-outline" size={18} color="#047857" />
                <Text style={[styles.dropdownText, styles.dropdownTextActive]}>Goat Rearing</Text>
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

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
        >
          {/* Back Link */}
          <TouchableOpacity style={styles.backBtn} onPress={() => router.push("/livelihood_management_hub")}>
            <MaterialIcons name="arrow-back" size={18} color="#6b7280" />
            <Text style={styles.backText}>Back to Livelihood Hub</Text>
          </TouchableOpacity>

          {/* Page Header */}
          <View style={styles.pageHeader}>
            <View style={styles.pageHeaderContent}>
              <Text style={styles.mainTitle}>Goat Rearing Distribution & Health</Text>
              <Text style={styles.subtitle}>
                Monitoring livelihood impact through livestock distribution metrics, health tracking, 
                and return on investment for rural beneficiaries.
              </Text>
            </View>
            <TouchableOpacity style={styles.exportButton}>
              <MaterialIcons name="download" size={16} color={colors.onPrimary} />
              <Text style={styles.exportButtonText}>Export Data</Text>
            </TouchableOpacity>
          </View>

          {/* Bento Grid Layout */}
          <View style={styles.grid}>
            {/* Left Column - Metrics */}
            <View style={styles.leftColumn}>
              <MetricCard 
                title="Total Beneficiaries" 
                value="1,248" 
                trend="+12%" 
                subtitle="Across 32 active villages"
              />
              <View style={styles.metricCard}>
                <Text style={styles.metricTitle}>Active Livestock</Text>
                <Text style={[styles.metricValue, { fontSize: 32 }]}>3,740</Text>
                <View style={styles.livestockStats}>
                  <View>
                    <View style={styles.livestockRow}>
                      <Text style={styles.livestockLabel}>Adults</Text>
                      <Text style={styles.livestockNumber}>2,100</Text>
                    </View>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: '60%', backgroundColor: colors.primary }]} />
                    </View>
                  </View>
                  <View>
                    <View style={styles.livestockRow}>
                      <Text style={styles.livestockLabel}>Kids</Text>
                      <Text style={styles.livestockNumber}>1,640</Text>
                    </View>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: '40%', backgroundColor: colors.primaryContainer }]} />
                    </View>
                  </View>
                </View>
              </View>
              <MetricCard 
                title="Avg. Household ROI" 
                value="145%" 
                subtitle="Estimated return over 24 months based on initial capital investment and organic herd growth."
                isHighlighted={true}
              />
            </View>

            {/* Right Column - Chart & Health Logs */}
            <View style={styles.rightColumn}>
              {/* Chart Section */}
              <View style={styles.chartCard}>
                <View style={styles.chartHeader}>
                  <Text style={styles.chartTitle}>Outcome Trajectory</Text>
                  <View style={styles.timeframeButtons}>
                    <TouchableOpacity
                      style={[styles.timeframeButton, timeframe === "6 Months" && styles.timeframeButtonActive]}
                      onPress={() => setTimeframe("6 Months")}
                    >
                      <Text style={[styles.timeframeText, timeframe === "6 Months" && styles.timeframeTextActive]}>
                        6 Months
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.timeframeButton, timeframe === "1 Year" && styles.timeframeButtonActive]}
                      onPress={() => setTimeframe("1 Year")}
                    >
                      <Text style={[styles.timeframeText, timeframe === "1 Year" && styles.timeframeTextActive]}>
                        1 Year
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Chart Bars */}
                <View style={styles.chartContainer}>
                  {heights.map((height, index) => (
                    <View key={index} style={styles.barWrapper}>
                      <View
                        style={[
                          styles.bar,
                          { height: `${height}%` },
                          index === 4 && styles.barLast,
                          index === 3 && styles.barThird,
                          index === 2 && styles.barSecond,
                          index === 1 && styles.barFirst,
                        ]}
                      />
                    </View>
                  ))}
                </View>

                {/* Locations */}
                <View style={styles.locationsContainer}>
                  {locations.map((location, index) => (
                    <Text key={index} style={styles.locationText}>{location}</Text>
                  ))}
                </View>
              </View>

              {/* Health Logs */}
              <View style={styles.healthLogsCard}>
                <View style={styles.healthLogsHeader}>
                  <Text style={styles.healthLogsTitle}>Recent Livestock Health Logs</Text>
                  <TouchableOpacity>
                    <Text style={styles.viewAllText}>View All</Text>
                  </TouchableOpacity>
                </View>

                {healthLogs.map((log) => (
                  <HealthLogItem 
                    key={log.id}
                    tag={log.tag}
                    beneficiary={log.beneficiary}
                    checked={log.checked}
                    status={log.status}
                    isHealthy={log.isHealthy}
                  />
                ))}
              </View>
            </View>
          </View>

          {/* Footer - Only visible when scrolled */}
          {showFooter && <Footer />}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  // ==================================================
  // LAYOUT
  // ==================================================
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },

  leftColumn: {
    flex: 1,
    minWidth: 250,
    gap: 16,
  },

  rightColumn: {
    flex: 2,
    minWidth: 300,
    gap: 16,
  },

  // ==================================================
  // SIDEBAR
  // ==================================================
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
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },

  brandContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 50,
    marginBottom: 30,
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

  dropdownContainer: {
    marginLeft: 32,
    marginBottom: 8,
    paddingLeft: 12,
    borderLeftWidth: 1,
    borderLeftColor: "#e5e7eb",
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

  // ==================================================
  // HEADER
  // ==================================================
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

  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },

  menuButton: {
    padding: 8,
  },

  iconButton: {
    padding: 8,
  },

  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },

  // ==================================================
  // PAGE HEADER
  // ==================================================
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

  pageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 24,
  },

  pageHeaderContent: {
    flex: 1,
    minWidth: 200,
    maxWidth: "70%",
  },

  mainTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.onSurface,
    marginBottom: 8,
    letterSpacing: -0.5,
    flexWrap: "wrap",
    flexShrink: 1,
  },

  subtitle: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
    lineHeight: 20,
    flexWrap: "wrap",
    flexShrink: 1,
  },

  // ==================================================
  // ACTION BUTTONS
  // ==================================================
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.primary,
    borderRadius: 999,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    alignSelf: "flex-start",
  },

  exportButtonText: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    color: colors.onPrimary,
  },

  // ==================================================
  // METRIC CARDS
  // ==================================================
  metricCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },

  metricCardHighlighted: {
    backgroundColor: colors.primary,
  },

  metricTitle: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: colors.onSurfaceVariant,
    marginBottom: 8,
  },

  metricTitleHighlighted: {
    color: "rgba(255,255,255,0.7)",
  },

  metricValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    marginBottom: 8,
  },

  metricValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.onSurface,
  },

  metricValueHighlighted: {
    color: colors.onPrimary,
  },

  metricSubtitle: {
    fontSize: 11,
    color: colors.onSurfaceVariant,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
  },

  metricSubtitleHighlighted: {
    color: colors.onPrimaryContainer,
    borderTopColor: "rgba(255,255,255,0.2)",
  },

  // ==================================================
  // TREND
  // ==================================================
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#d1fae5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },

  trendText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#059669",
  },

  // ==================================================
  // LIVESTOCK
  // ==================================================
  livestockStats: {
    gap: 12,
    marginTop: 16,
  },

  livestockRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },

  livestockLabel: {
    fontSize: 11,
    color: colors.onSurfaceVariant,
  },

  livestockNumber: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.onSurface,
  },

  progressBar: {
    height: 6,
    backgroundColor: colors.surfaceContainerHighest,
    borderRadius: 3,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: 3,
  },

  // ==================================================
  // CHART
  // ==================================================
  chartCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },

  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },

  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.onSurface,
  },

  timeframeButtons: {
    flexDirection: "row",
    gap: 8,
  },

  timeframeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.surfaceContainer,
    borderRadius: 20,
  },

  timeframeButtonActive: {
    backgroundColor: colors.surfaceContainerHighest,
  },

  timeframeText: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.onSurfaceVariant,
  },

  timeframeTextActive: {
    color: colors.onSurface,
  },

  chartContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 200,
    paddingHorizontal: 8,
    marginBottom: 16,
  },

  barWrapper: {
    flex: 1,
    alignItems: "center",
  },

  bar: {
    width: 40,
    backgroundColor: colors.primaryContainer,
    borderRadius: 4,
    minHeight: 4,
  },

  barFirst: {
    backgroundColor: `${colors.primaryContainer}66`,
  },

  barSecond: {
    backgroundColor: `${colors.primaryContainer}99`,
  },

  barThird: {
    backgroundColor: `${colors.primary}CC`,
  },

  barLast: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },

  locationsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
  },

  locationText: {
    flex: 1,
    textAlign: "center",
    fontSize: 10,
    color: colors.onSurfaceVariant,
  },

  // ==================================================
  // HEALTH LOGS
  // ==================================================
  healthLogsCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },

  healthLogsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  healthLogsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.onSurface,
  },

  viewAllText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.primary,
  },

  healthLogItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexWrap: "wrap",
    gap: 12,
  },

  healthLogLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },

  healthLogIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  healthIconHealthy: {
    backgroundColor: `${colors.primary}10`,
  },

  healthIconWarning: {
    backgroundColor: `${colors.secondary}20`,
  },

  healthLogTag: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.onSurface,
  },

  healthLogBeneficiary: {
    fontSize: 11,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },

  healthLogRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  healthLogChecked: {
    fontSize: 11,
    color: colors.onSurfaceVariant,
  },

  healthStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  healthStatusHealthy: {
    backgroundColor: colors.primaryFixed,
  },

  healthStatusWarning: {
    backgroundColor: `${colors.secondary}20`,
  },

  healthStatusText: {
    fontSize: 9,
    fontWeight: "600",
    textTransform: "uppercase",
  },

  healthStatusTextHealthy: {
    color: colors.onPrimaryFixed,
  },

  healthStatusTextWarning: {
    color: colors.secondary,
  },

  // ==================================================
  // FOOTER
  // ==================================================
  footer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginTop: 40,
    marginBottom: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
    borderTopWidth: 1,
    borderTopColor: '#EDEEEF',
  },

  footerContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 20,
  },

  footerSection: {
    flex: 1,
    minWidth: 200,
  },

  footerLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  footerLogoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  footerFoundationName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#065f46',
  },

  footerTagline: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },

  footerSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#191C1D',
    marginBottom: 12,
  },

  footerContactItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },

  footerContactText: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
  },

  footerAddressText: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
    lineHeight: 18,
  },

  footerBottom: {
    borderTopWidth: 1,
    borderTopColor: '#EDEEEF',
    paddingTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },

  footerCopyright: {
    fontSize: 12,
    color: '#6B7280',
  },

  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  footerLinkText: {
    fontSize: 12,
    color: '#006857',
    fontWeight: '500',
  },

  footerDot: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});