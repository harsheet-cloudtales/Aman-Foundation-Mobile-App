import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
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
            <LinearGradient
              colors={["#006857", "#00846e"]}
              style={styles.footerLogoIcon}
            >
              <Ionicons name="business-outline" size={24} color="#fff" />
            </LinearGradient>
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
            <Text style={styles.footerContactText}>Pune, India</Text>
          </View>
        </View>

        {/* Foundation Address */}
        <View style={styles.footerSection}>
          <Text style={styles.footerSectionTitle}>Foundation Address</Text>
          <View style={styles.footerContactItem}>
            <Ionicons name="home-outline" size={16} color="#6B7280" />
            <Text style={styles.footerAddressText}>
              House # 123, Street 45,{"\n"}
              Sector F-11/3,India,{"\n"}
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

export default function EducationScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [showFooter, setShowFooter] = useState(false);

  // Sidebar
  const [menuOpen, setMenuOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-width)).current;

  // Dropdown states for sidebar
  const [educationDropdownOpen, setEducationDropdownOpen] = useState(true);
  const [livelihoodDropdownOpen, setLivelihoodDropdownOpen] = useState(false);
  const [authDropdownOpen, setAuthDropdownOpen] = useState(false);

  // Animated values for dropdowns
  const educationRotateAnim = useRef(new Animated.Value(1)).current;
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

  const closeMenu = () => {
    if (menuOpen) {
      Animated.timing(slideAnim, {
        toValue: -width,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setMenuOpen(false));
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

  // Logout function
  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          Alert.alert("Success", "Logged out successfully");
          router.replace("/login");
        },
      },
    ]);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  };

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowFooter(offsetY > 350);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <View style={styles.container}>
        {/* OVERLAY */}
        {menuOpen && (
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={closeMenu}
          />
        )}

        {/* SIDEBAR */}
        <Animated.View
          style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* BRAND */}
            <View style={styles.brandContainer}>
              <LinearGradient
                colors={["#006857", "#00846e"]}
                style={styles.brandIcon}
              >
                <Ionicons name="library" size={22} color="#fff" />
              </LinearGradient>
              <View>
                <Text style={styles.brandTitle}>Aman Foundation</Text>
                <Text style={styles.brandSub}>Impact Portal</Text>
              </View>
            </View>

            {/* MENU */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                closeMenu();
                router.push("/");
              }}
            >
              <Ionicons name="grid-outline" size={20} color="#4b5563" />
              <Text style={styles.menuText}>Dashboard</Text>
            </TouchableOpacity>

            {/* Education with Submenu (Active) */}
            <View>
              <TouchableOpacity
                style={styles.menuItemActive}
                onPress={toggleEducationDropdown}
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons name="school-outline" size={20} color="#fff" />
                  <Text style={styles.menuTextActive}>Education</Text>
                </View>
                <Animated.View
                  style={{ transform: [{ rotate: rotateEducation }] }}
                >
                  <Ionicons name="chevron-down" size={20} color="#fff" />
                </Animated.View>
              </TouchableOpacity>
              {educationDropdownOpen && (
                <View style={styles.subNav}>
                  <TouchableOpacity
                    style={styles.subNavItem}
                    onPress={() => {
                      closeMenu();
                      router.push("/education_fellows_module");
                    }}
                  >
                    <Text style={styles.subNavText}>Fellows</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.subNavItem}
                    onPress={() => {
                      closeMenu();
                      router.push("/education_students_module");
                    }}
                  >
                    <Text style={styles.subNavText}>Students</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.subNavItem}
                    onPress={() => {
                      closeMenu();
                      router.push("/education_schools_module");
                    }}
                  >
                    <Text style={styles.subNavText}>Schools</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.subNavItem}
                    onPress={() => {
                      closeMenu();
                      router.push("/education_pta_programs");
                    }}
                  >
                    <Text style={styles.subNavText}>PTA and Programs</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Livelihood with Submenu */}
            <View>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={toggleLivelihoodDropdown}
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons
                    name="agriculture-outline"
                    size={20}
                    color="#4b5563"
                  />
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
                    onPress={() => {
                      closeMenu();
                      router.push("/livelihood_management_hub");
                    }}
                  >
                    <Text style={styles.subNavText}>Management Hub</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.subNavItem}
                    onPress={() => {
                      closeMenu();
                      router.push("/livelihood_goat_rearing_1");
                    }}
                  >
                    <Text style={styles.subNavText}>Goat Rearing</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.subNavItem}
                    onPress={() => {
                      closeMenu();
                      router.push("/livelihood_sugarcane_cultivation");
                    }}
                  >
                    <Text style={styles.subNavText}>Sugarcane Cultivation</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.subNavItem}
                    onPress={() => {
                      closeMenu();
                      router.push("/beneficiary_master_profile");
                    }}
                  >
                    <Text style={styles.subNavText}>Beneficiaries</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                closeMenu();
                router.push("/disaster_relief_management");
              }}
            >
              <Ionicons name="alert-circle-outline" size={20} color="#4b5563" />
              <Text style={styles.menuText}>Disaster Relief</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                closeMenu();
                router.push("/hr_employee_management");
              }}
            >
              <Ionicons name="people-outline" size={20} color="#4b5563" />
              <Text style={styles.menuText}>HR Management</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                closeMenu();
                router.push("/admin_access_control");
              }}
            >
              <Ionicons name="shield-outline" size={20} color="#4b5563" />
              <Text style={styles.menuText}>Admin & Access</Text>
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
                closeMenu();
                router.push("/profile");
              }}
            >
              <Ionicons name="person-outline" size={20} color="#4b5563" />
              <Text style={styles.menuText}>My Profile</Text>
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
                    onPress={() => {
                      closeMenu();
                      router.push("/login");
                    }}
                  >
                    <Text style={styles.subNavText}>Login Page</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.subNavItem}
                    onPress={() => {
                      closeMenu();
                      router.push("/register");
                    }}
                  >
                    <Text style={styles.subNavText}>Register Page</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.subNavItem, styles.subNavItemLogout]}
                    onPress={handleLogout}
                  >
                    <Text style={[styles.subNavText, styles.subNavTextLogout]}>
                      Logout
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Footer Menu Items */}
            <View style={styles.sidebarFooter}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => closeMenu()}
              >
                <Ionicons
                  name="help-circle-outline"
                  size={20}
                  color="#4b5563"
                />
                <Text style={styles.menuText}>Help</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>

        {/* MAIN SCREEN */}
        <ScrollView
          style={styles.mainContent}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#006857"]}
              tintColor="#006857"
            />
          }
        >
          {/* Top Bar */}
          <View style={styles.header}>
            <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
              <Ionicons name="menu-outline" size={24} color="#475569" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Impact Portal</Text>

            <View style={styles.headerIcons}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() =>
                  Alert.alert("Notifications", "No new notifications")
                }
              >
                <Ionicons
                  name="notifications-outline"
                  size={20}
                  color="#475569"
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() =>
                  Alert.alert("Settings", "Settings will be available soon")
                }
              >
                <Ionicons name="settings-outline" size={20} color="#475569" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push("/profile")}>
                <Image
                  source={{
                    uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuCy0YC_TGbMxUogj7u6FlVKznrRAyySoM1Wk5t86itV9-_WFTvj8S0Yzjr9GbBo8Bfm5nmRm_UZNvqkNLAOwajxpIHTPsvU3uWB_8oQCTDeLlTy5FFvFEdJbGbOLV8T87s7JItDrrR2LELtEkIRHVgt-MZ4wCsnMNliGHkwJgzEzPmZLJ3RyksBBrHyBQUOrsN9TswbWGEUCWg7Kct8wDcojEkOb4jbZtq_alD8mtnNZfS9PFgwiRKdk4k-6T8WSccDJBrvSEgUpobq",
                  }}
                  style={styles.avatar}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* BACK BUTTON */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.push("/")}
          >
            <Ionicons name="arrow-back" size={16} color="#6b7280" />
            <Text style={styles.backText}>Back to Dashboard</Text>
          </TouchableOpacity>

          {/* HEADER */}
          <View style={styles.headerSection}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Central Hub</Text>
            </View>

            <Text style={styles.title}>Education Management</Text>

            <Text style={styles.subtitle}>
              Oversee, evaluate, and scale educational initiatives. This module
              provides a unified view of fellows, students, schools, and
              programs.
            </Text>
          </View>

          {/* CARDS */}
          <View style={styles.grid}>
            {/* Fellows */}
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push("/education_fellows_module")}
            >
              <View style={[styles.iconCircle, styles.iconGreen]}>
                <Ionicons name="people-outline" size={28} color="#047857" />
              </View>

              <Text style={styles.cardTitle}>Fellows Module</Text>
              <Text style={styles.cardText}>
                Manage fellows, track performance, and monitor placements.
              </Text>

              <Text style={styles.linkGreen}>Access Module →</Text>
            </TouchableOpacity>

            {/* Students */}
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push("/education_students_module")}
            >
              <View style={[styles.iconCircle, styles.iconOrange]}>
                <Ionicons name="happy-outline" size={28} color="#ea580c" />
              </View>

              <Text style={styles.cardTitle}>Students Module</Text>
              <Text style={styles.cardText}>
                Track student learning outcomes and attendance metrics.
              </Text>

              <Text style={styles.linkOrange}>Access Module →</Text>
            </TouchableOpacity>

            {/* Schools */}
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push("/education_schools_module")}
            >
              <View style={[styles.iconCircle, styles.iconGreen]}>
                <Ionicons name="business-outline" size={28} color="#047857" />
              </View>

              <Text style={styles.cardTitle}>Schools Module</Text>
              <Text style={styles.cardText}>
                Manage school profiles and partnerships with institutions.
              </Text>

              <Text style={styles.linkGreen}>Access Module →</Text>
            </TouchableOpacity>

            {/* PTA */}
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push("/education_pta_programs")}
            >
              <View style={[styles.iconCircle, styles.iconGray]}>
                <Ionicons
                  name="people-circle-outline"
                  size={28}
                  color="#6b7280"
                />
              </View>

              <Text style={styles.cardTitle}>PTA & Programs</Text>
              <Text style={styles.cardText}>
                Track community programs and parent-teacher initiatives.
              </Text>

              <Text style={styles.linkGray}>Access Module →</Text>
            </TouchableOpacity>
          </View>

          {/* Footer - Only visible when scrolled */}
          {showFooter && <Footer />}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  // Overlay
  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.4)",
    zIndex: 15,
  },
  // Sidebar
  sidebar: {
    position: "absolute",
    width: width * 0.75,
    maxWidth: 280,
    height: "100%",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    zIndex: 20,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  brandContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  brandIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 50,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#134e4a",
    marginTop: 50,
  },
  brandSub: {
    fontSize: 11,
    color: "#3d4945",
  },
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
  },
  menuText: {
    marginLeft: 12,
    fontSize: 14,
    color: "#4b5563",
    fontWeight: "500",
  },
  menuItemActive: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#006857",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 40,
    marginBottom: 4,
    elevation: 2,
  },
  menuTextActive: {
    color: "#fff",
    marginLeft: 12,
    fontWeight: "600",
  },
  subNav: {
    marginLeft: 52,
    marginTop: 4,
    marginBottom: 8,
    gap: 4,
    borderLeftWidth: 2,
    borderLeftColor: "#00846e",
    paddingLeft: 12,
  },
  subNavItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  subNavItemLogout: {
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    marginTop: 4,
    paddingTop: 12,
  },
  subNavText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748b",
  },
  subNavTextLogout: {
    color: "#ef4444",
  },
  // Authentication divider styles
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
  sidebarFooter: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  // Main Content
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingVertical: 8,
  },
  menuButton: {
    padding: 8,
    borderRadius: 999,
    marginTop: -25,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginTop: -25,
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconButton: {
    padding: 8,
    borderRadius: 999,
    marginTop: -25,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#edeeef",
    marginTop: -25,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    alignSelf: "flex-start",
    marginTop: -15,
  },
  backText: {
    marginLeft: 6,
    color: "#6b7280",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    marginTop: -1,
  },
  headerSection: {
    marginBottom: 28,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#d1fae5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 12,
  },
  badgeText: {
    color: "#065f46",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 36,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  grid: {
    flexDirection: "column",
    marginBottom: 24,
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  iconGreen: {
    backgroundColor: "#ecfdf5",
  },
  iconOrange: {
    backgroundColor: "#fff7ed",
  },
  iconGray: {
    backgroundColor: "#f3f4f6",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 16,
    lineHeight: 20,
  },
  linkGreen: {
    color: "#047857",
    fontWeight: "600",
    fontSize: 13,
  },
  linkOrange: {
    color: "#ea580c",
    fontWeight: "600",
    fontSize: 13,
  },
  linkGray: {
    color: "#374151",
    fontWeight: "600",
    fontSize: 13,
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
