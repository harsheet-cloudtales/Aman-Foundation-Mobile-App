import { useAuth } from "@/lib/useAuth";
import { getUserRole, UserRole } from "@/utils/permissions";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

// ---------- Footer Component ----------
const Footer = () => {
  return (
    <View style={styles.footer}>
      <View style={styles.footerContent}>
        {/* Logo and Foundation Name */}
        <View style={styles.footerSection}>
          <View style={styles.footerLogoContainer}>
            <View style={styles.footerLogoIcon}>
              <Ionicons name="business-outline" size={24} color="#047857" />
            </View>
            <Text style={styles.footerFoundationName}>Aman Foundation</Text>
          </View>
          <Text style={styles.footerTagline}>
            Creating lasting impact in communities
          </Text>
        </View>

        {/* Contact Information */}
        <View style={styles.footerSection}>
          <Text style={styles.footerSectionTitle}>Contact Us</Text>
          <View style={styles.footerContactItem}>
            <Ionicons name="call-outline" size={16} color="#6B7280" />
            <Text style={styles.footerContactText}>+91 300 1234567</Text>
          </View>
          <View style={styles.footerContactItem}>
            <Ionicons name="mail-outline" size={16} color="#6B7280" />
            <Text style={styles.footerContactText}>
              info@amanfoundation.org
            </Text>
          </View>
          <View style={styles.footerContactItem}>
            <Ionicons name="location-outline" size={16} color="#6B7280" />
            <Text style={styles.footerContactText}>Mumbai , India</Text>
          </View>
        </View>

        {/* Foundation Address */}
        <View style={styles.footerSection}>
          <Text style={styles.footerSectionTitle}>Foundation Address</Text>
          <View style={styles.footerContactItem}>
            <Ionicons name="home-outline" size={16} color="#6B7280" />
            <Text style={styles.footerAddressText}>
              Mumbai {"\n"}
              Sector F-11/3, Maha,{"\n"}
              India
            </Text>
          </View>
        </View>
      </View>

      {/* Footer Bottom */}
      <View style={styles.footerBottom}>
        <Text style={styles.footerCopyright}>
          © 2026 Aman Foundation. All Rights Reserved.
        </Text>
        <View style={styles.footerLinks}>
          <Text style={styles.footerLinkText}>Terms & Conditions</Text>
          <Text style={styles.footerDot}>•</Text>
          <Text style={styles.footerLinkText}>Privacy Policy</Text>
        </View>
      </View>
    </View>
  );
};

export default function Dashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const [showFooter, setShowFooter] = useState(false);
  const router = useRouter();
  const { user, logout: authLogout } = useAuth();
  const currentRole = getUserRole(user);
  const isFellowUser = currentRole === UserRole.FELLOW;
  const hasFullAccess = !isFellowUser;

  // Sidebar
  const [menuOpen, setMenuOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-width)).current;

  // Dropdown states
  const [educationDropdownOpen, setEducationDropdownOpen] = useState(false);
  const [livelihoodDropdownOpen, setLivelihoodDropdownOpen] = useState(false);
  const [authDropdownOpen, setAuthDropdownOpen] = useState(false);

  // Animated values for dropdowns
  const educationRotateAnim = useRef(new Animated.Value(0)).current;
  const livelihoodRotateAnim = useRef(new Animated.Value(0)).current;
  const authRotateAnim = useRef(new Animated.Value(0)).current;

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

  const toggleAuthDropdown = () => {
    const toValue = authDropdownOpen ? 0 : 1;
    Animated.timing(authRotateAnim, {
      toValue,
      duration: 200,
      useNativeDriver: true,
    }).start();
    setAuthDropdownOpen(!authDropdownOpen);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  };

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowFooter(offsetY > 300);
  };

  // Logout function
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

  const rotateEducation = educationRotateAnim.interpolate({
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

        {/* MENU */}
        <TouchableOpacity style={styles.menuItemActive}>
          <Ionicons name="grid-outline" size={20} color="#fff" />
          <Text style={styles.menuTextActive}>Dashboard</Text>
        </TouchableOpacity>

        {/* EDUCATION WITH DROPDOWN */}
        <View>
          <TouchableOpacity
            style={styles.menuItemWithDropdown}
            onPress={toggleEducationDropdown}
          >
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
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  toggleMenu();
                  router.push("/education_management_hub");
                }}
              >
                <Ionicons name="library-outline" size={18} color="#6b7280" />
                <Text style={styles.dropdownText}>Management Hub</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  toggleMenu();
                  router.push("/education_schools_module");
                }}
              >
                <Ionicons name="business-outline" size={18} color="#6b7280" />
                <Text style={styles.dropdownText}>Schools Overview</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  toggleMenu();
                  router.push("/education_fellows_module");
                }}
              >
                <Ionicons name="people-outline" size={18} color="#6b7280" />
                <Text style={styles.dropdownText}>Fellows Directory</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  toggleMenu();
                  router.push("/education_students_module");
                }}
              >
                <Ionicons name="calendar-outline" size={18} color="#6b7280" />
                <Text style={styles.dropdownText}>Active Programs</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  toggleMenu();
                  router.push("/education_pta_programs");
                }}
              >
                <Ionicons
                  name="document-text-outline"
                  size={18}
                  color="#6b7280"
                />
                <Text style={styles.dropdownText}>Progress Reports</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* LIVELIHOOD WITH DROPDOWN */}
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
                onPress={() => {
                  toggleMenu();
                  router.push("/livelihood_management_hub");
                }}
              >
                <Ionicons name="apps-outline" size={18} color="#6b7280" />
                <Text style={styles.dropdownText}>Management Hub</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  toggleMenu();
                  router.push("/livelihood_goat_rearing_1");
                }}
              >
                <Ionicons name="paw-outline" size={18} color="#6b7280" />
                <Text style={styles.dropdownText}>Goat Rearing</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  toggleMenu();
                  router.push("/livelihood_sugarcane_cultivation");
                }}
              >
                <Ionicons name="leaf-outline" size={18} color="#6b7280" />
                <Text style={styles.dropdownText}>Agriculture Support</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  toggleMenu();
                  router.push("/beneficiary_master_profile");
                }}
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

        {hasFullAccess && (
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              toggleMenu();
              router.push("/disaster_relief_management");
            }}
          >
            <Ionicons name="snow-outline" size={20} color="#4b5563" />
            <Text style={styles.menuText}>Disaster Relief</Text>
          </TouchableOpacity>
        )}

        {hasFullAccess && (
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              toggleMenu();
              router.push("/hr_employee_management");
            }}
          >
            <Ionicons name="people-outline" size={20} color="#4b5563" />
            <Text style={styles.menuText}>HR Management</Text>
          </TouchableOpacity>
        )}

        {hasFullAccess && (
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              toggleMenu();
              router.push("/admin_access_control");
            }}
          >
            <Ionicons name="document-text-outline" size={20} color="#4b5563" />
            <Text style={styles.menuText}>Admin & Access</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            toggleMenu();
            router.push("/(tabs)/leaves");
          }}
        >
          <Ionicons name="calendar-outline" size={20} color="#4b5563" />
          <Text style={styles.menuText}>Leaves</Text>
        </TouchableOpacity>

        {/* AUTHENTICATION SECTION WITH DROPDOWN */}
        <View style={styles.menuDivider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>ACCOUNT</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            toggleMenu();
            router.push("/profile");
          }}
        >
          <Ionicons name="person-outline" size={20} color="#4b5563" />
          <Text style={styles.menuText}>My Profile</Text>
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
                onPress={() => {
                  toggleMenu();
                  router.push("/login");
                }}
              >
                <Ionicons name="log-in-outline" size={18} color="#6b7280" />
                <Text style={styles.dropdownText}>Login Page</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  toggleMenu();
                  router.push("/registration");
                }}
              >
                <Ionicons name="person-add-outline" size={18} color="#6b7280" />
                <Text style={styles.dropdownText}>Register Page</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dropdownItem, styles.dropdownItemLogout]}
                onPress={handleLogout}
              >
                <Ionicons name="log-out-outline" size={18} color="#ef4444" />
                <Text style={[styles.dropdownText, styles.dropdownTextLogout]}>
                  Logout
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Animated.View>

      {/* MAIN SCREEN */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
        bounces={true}
        overScrollMode="always"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#047857"]}
            tintColor="#047857"
          />
        }
      >
        {/* Top Bar */}
        <View style={styles.header}>
          <TouchableOpacity onPress={toggleMenu}>
            <Ionicons name="menu-outline" size={26} color="#1f2937" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Impact Portal</Text>

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
            <TouchableOpacity
              onPress={() =>
                Alert.alert("Settings", "Settings will be available soon")
              }
            >
              <Ionicons name="settings-outline" size={22} color="#1f2937" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/profile")}>
              <Image
                source={{
                  uri: "https://randomuser.me/api/portraits/women/68.jpg",
                }}
                style={styles.avatar}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* //role based */}
        <View style={styles.roleBanner}>
          <Text style={styles.roleBannerTitle}>
            {isFellowUser ? "Fellow workspace" : "Program manager workspace"}
          </Text>
          <Text style={styles.roleBannerText}>
            {isFellowUser
              ? "Education, Livelihood, and Leaves are enabled for your account."
              : "You have full access to the portal modules."}
          </Text>
        </View>
        {/* Title */}
        <View style={styles.section}>
          <Text style={styles.mainTitle}>YTD Impact{"\n"}Snapshot</Text>
          <Text style={styles.subText}>Data updated: Today, 09:41 AM</Text>
        </View>
        {/* Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.outlineBtn}>
            <Ionicons name="download-outline" size={18} color="#374151" />
            <Text style={styles.outlineText}>Export Report</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.primaryBtn}>
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={styles.primaryText}>New Entry</Text>
          </TouchableOpacity>
        </View>

        {/* Card 1 */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>TOTAL BENEFICIARIES</Text>
          <Text style={styles.cardNumber}>12,450</Text>

          <View style={styles.row}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>+14%</Text>
            </View>
            <Text style={styles.smallText}>vs last quarter</Text>
          </View>
        </View>
        {/* Card 2 */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>ACTIVE FELLOWS</Text>
          <Text style={styles.cardNumber}>342</Text>

          <View style={styles.progressBg}>
            <View style={styles.progressFill} />
          </View>
          <Text style={styles.smallText}>85% deployed</Text>
        </View>
        {/* Grid Cards */}
        <View style={styles.grid}>
          <View style={styles.halfCard}>
            <Text style={styles.cardTitle}>Schools Reached</Text>
            <Text style={styles.cardValue}>128</Text>
            <Text style={styles.cardSub}>Target: 150</Text>
          </View>

          <View style={[styles.halfCard, styles.highlightCard]}>
            <Text style={styles.cardTitleWhite}>Livelihood Programs</Text>
            <Text style={styles.cardValueWhite}>4,820</Text>
            <Text style={styles.cardSubWhite}>Families Supported</Text>
          </View>
        </View>
        {/* CHART WITH AXIS */}
        <View style={styles.section}>
          <Text style={styles.heading}>Education Enrollment Growth</Text>

          <View style={styles.chartContainer}>
            {/* Y Axis */}
            <View style={styles.yAxis}>
              {["5k", "4k", "3k", "2k", "1k", "0"].map((label, i) => (
                <Text key={i} style={styles.yLabel}>
                  {label}
                </Text>
              ))}
            </View>

            {/* Bars */}
            <View style={styles.chartArea}>
              <View style={styles.chart}>
                {[60, 100, 140, 180, 220].map((h, i) => (
                  <View key={i} style={[styles.bar, { height: h }]} />
                ))}
              </View>

              {/* X Axis */}
              <View style={styles.xAxis}>
                {["Jan", "Feb", "Mar", "Apr", "May"].map((m, i) => (
                  <Text key={i} style={styles.xLabel}>
                    {m}
                  </Text>
                ))}
              </View>
            </View>
          </View>
        </View>
        {/* Activity */}
        <View style={styles.section}>
          <Text style={styles.heading}>Program Highlights</Text>

          <View style={styles.activity}>
            <View style={styles.iconBox}>
              <Ionicons name="leaf-outline" size={18} color="#047857" />
            </View>

            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Goat Rearing Phase 2</Text>
              <Text style={styles.activityText}>
                Distribution of 500 livestock to identified families in Ward 4
                completed ahead of schedule.
              </Text>
              <Text style={styles.timeText}>2 days ago</Text>
            </View>
          </View>

          <View style={styles.activity}>
            <View style={styles.iconBox}>
              <Ionicons name="school-outline" size={18} color="#047857" />
            </View>

            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>New Fellows</Text>
              <Text style={styles.activityText}>
                45 new fellows onboarded and assigned to 12 target schools in
                the northern district.
              </Text>
              <Text style={styles.timeText}>5 days ago</Text>
            </View>
          </View>
        </View>
        {/* Footer - Only visible when scrolled */}
        {showFooter && <Footer />}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 16,
    paddingTop: 40,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
    marginTop: -25,
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
    backgroundColor: "#f97316",
    marginLeft: 10,
  },

  section: {
    marginBottom: 20,
  },

  mainTitle: {
    fontSize: 34,
    fontWeight: "800",
    color: "#111827",
    lineHeight: 42,
  },

  subText: {
    color: "#6b7280",
    marginTop: 6,
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  outlineBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 25,
    backgroundColor: "#fff",
  },

  outlineText: {
    marginLeft: 6,
    fontWeight: "500",
    color: "#374151",
  },

  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#047857",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    elevation: 3,
  },

  primaryText: {
    color: "#fff",
    marginLeft: 6,
    fontWeight: "600",
  },

  card: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 18,
    marginBottom: 16,
  },

  cardLabel: {
    fontSize: 12,
    color: "#6b7280",
    letterSpacing: 1,
  },

  cardNumber: {
    fontSize: 30,
    fontWeight: "800",
    marginVertical: 8,
    color: "#111827",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },

  badge: {
    backgroundColor: "#d1fae5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
  },

  badgeText: {
    color: "#065f46",
    fontWeight: "600",
    fontSize: 12,
  },

  smallText: {
    fontSize: 12,
    color: "#6b7280",
  },

  progressBg: {
    height: 6,
    backgroundColor: "#e5e7eb",
    borderRadius: 10,
    marginTop: 10,
    overflow: "hidden",
  },

  progressFill: {
    width: "85%",
    height: "100%",
    backgroundColor: "#047857",
  },

  grid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  halfCard: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
  },

  cardTitle: {
    fontSize: 12,
    color: "#6b7280",
  },

  cardValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
  },

  cardSub: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },

  highlightCard: {
    backgroundColor: "#047857",
  },

  cardTitleWhite: {
    fontSize: 12,
    color: "#d1fae5",
  },

  cardValueWhite: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
  },

  cardSubWhite: {
    fontSize: 12,
    color: "#d1fae5",
    marginTop: 4,
  },

  heading: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },

  chartContainer: {
    flexDirection: "row",
    marginTop: 10,
  },

  yAxis: {
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingRight: 8,
    height: 180,
  },

  yLabel: {
    fontSize: 10,
    color: "#6b7280",
  },

  chartArea: {
    flex: 1,
  },

  chart: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 180,
    justifyContent: "space-around",
  },

  bar: {
    width: 30,
    backgroundColor: "#047857",
    borderRadius: 4,
  },

  xAxis: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 8,
  },

  xLabel: {
    fontSize: 11,
    color: "#6b7280",
    width: 30,
    textAlign: "center",
  },

  activity: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 16,
  },

  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#d1fae5",
    justifyContent: "center",
    alignItems: "center",
  },

  activityContent: {
    flex: 1,
    marginLeft: 12,
  },

  activityTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },

  activityText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
    lineHeight: 16,
  },

  timeText: {
    fontSize: 10,
    color: "#9ca3af",
    marginTop: 6,
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

  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.3)",
    zIndex: 5,
  },

  brandContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },

  brandIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#047857",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 50,
  },

  brandTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#065f46",
    marginTop: 50,
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

  menuItemActive: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#047857",
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

  dropdownText: {
    fontSize: 13,
    color: "#6b7280",
    marginLeft: 10,
  },

  // Authentication dropdown styles
  menuDivider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
    paddingHorizontal: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  dividerText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#9ca3af",
    paddingHorizontal: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  roleBanner: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#ecfeff",
    borderWidth: 1,
    borderColor: "#a7f3d0",
  },
  roleBannerTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#115e59",
  },
  roleBannerText: {
    marginTop: 4,
    fontSize: 12,
    color: "#0f766e",
  },
  dropdownItemLogout: {
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    marginTop: 4,
    paddingTop: 12,
  },
  dropdownTextLogout: {
    color: "#ef4444",
  },

  // Footer styles
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
    backgroundColor: "#E8F5E9",
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
    color: "#047857",
    fontWeight: "500",
  },
  footerDot: {
    fontSize: 12,
    color: "#9CA3AF",
  },
});
