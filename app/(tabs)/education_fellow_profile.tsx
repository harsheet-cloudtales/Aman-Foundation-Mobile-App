import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

const { width, height } = Dimensions.get("window");

interface Milestone {
  done: boolean;
  text: string;
}

interface Goal {
  id: string;
  title: string;
  targetDate: string;
  milestones: string[];
  progressReview: string;
  progress?: number;
}

interface Fellow {
  avatar?: string;
  initials?: string;
  name: string;
  cohort: string;
  location: string;
  progress: number;
  milestones: Milestone[];
  lastUpdated: string;
}

const FellowProfile = () => {
  const params = useLocalSearchParams();
  const fellow: Fellow = JSON.parse(params.fellow as string);
  const [expandedGoal, setExpandedGoal] = useState<string | null>("goal1");
  const [menuOpen, setMenuOpen] = useState(false);

  // Dropdown states
  const [educationDropdownOpen, setEducationDropdownOpen] = useState(false);
  const [livelihoodDropdownOpen, setLivelihoodDropdownOpen] = useState(false);
  const [authDropdownOpen, setAuthDropdownOpen] = useState(false);

  // Animated values
  const slideAnim = useRef(new Animated.Value(-width)).current;
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

  const handleNavigation = (route: string) => {
    toggleMenu();
    router.push(route);
  };

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

  // Extended fellow data for the detailed profile
  const [goals] = useState<Goal[]>([
    {
      id: "goal1",
      title: "Improve Standard 3 Reading Proficiency",
      targetDate: "Nov 30, 2026",
      milestones: [
        "Administer Baseline Phonics Assessment",
        "Weekly Group Phonics Drills",
        "Conduct Mid-Term Reading Evaluation",
      ],
      progressReview:
        "Progressing well. 75% of kids now recognize standard phonics syllables.",
      progress: 75,
    },
    {
      id: "goal2",
      title: "Establish PTA Attendance Benchmark at 80%",
      targetDate: "Dec 15, 2026",
      milestones: [
        "Send SMS notifications 3 days in advance",
        "Design parent feedback registry sheets",
      ],
      progressReview:
        "PTA attendance reached 84% in the last meeting. Excellent parent engagement.",
      progress: 84,
    },
    {
      id: "goal3",
      title: "Integrate Interactive Math Activities",
      targetDate: "Jan 10, 2027",
      milestones: [
        "Develop Lesson Plan for Hands-on Algebra",
        "Acquire Math Kits",
      ],
      progressReview:
        "Scheduled for next month. Teaching kits and blocks ordered.",
      progress: 30,
    },
  ]);

  const toggleGoal = (goalId: string) => {
    if (expandedGoal === goalId) {
      setExpandedGoal(null);
    } else {
      setExpandedGoal(goalId);
    }
  };

  const GoalCard = ({ goal, isExpanded, onToggle }: any) => (
    <View style={styles.goalCard}>
      <TouchableOpacity
        onPress={() => onToggle(goal.id)}
        style={styles.goalHeader}
      >
        <View style={styles.goalTitleContainer}>
          <Icon
            name={isExpanded ? "expand-less" : "expand-more"}
            size={24}
            color="#059669"
          />
          <Text style={styles.goalTitle}>{goal.title}</Text>
        </View>
        <View style={styles.goalDateContainer}>
          <Icon name="event" size={14} color="#6B7280" />
          <Text style={styles.goalDate}>Target: {goal.targetDate}</Text>
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.goalContent}>
          {/* Progress Bar */}
          <View style={styles.goalProgressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Progress</Text>
              <Text style={styles.progressPercentage}>{goal.progress}%</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View
                style={[styles.progressBarFill, { width: `${goal.progress}%` }]}
              />
            </View>
          </View>

          {/* Milestones */}
          <Text style={styles.milestonesTitle}>Goal Milestones</Text>
          {goal.milestones.map((milestone: string, idx: number) => (
            <View key={idx} style={styles.goalMilestoneItem}>
              <View style={styles.checkboxPlaceholder}>
                <Icon
                  name="check-box-outline-blank"
                  size={18}
                  color="#9CA3AF"
                />
              </View>
              <Text style={styles.goalMilestoneText}>{milestone}</Text>
            </View>
          ))}

          {/* Progress Review */}
          <View style={styles.progressReviewBox}>
            <Icon name="feedback" size={16} color="#059669" />
            <Text style={styles.progressReviewText}>{goal.progressReview}</Text>
          </View>
        </View>
      )}
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

        {/* MENU ITEMS */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => handleNavigation("/")}
        >
          <Ionicons name="grid-outline" size={20} color="#4b5563" />
          <Text style={styles.menuText}>Dashboard</Text>
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
                onPress={() => handleNavigation("/education_management_hub")}
              >
                <Ionicons name="library-outline" size={18} color="#6b7280" />
                <Text style={styles.dropdownText}>Management Hub</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => handleNavigation("/education_schools_module")}
              >
                <Ionicons name="business-outline" size={18} color="#6b7280" />
                <Text style={styles.dropdownText}>Schools Overview</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.dropdownItem, styles.dropdownItemActive]}
                onPress={() => handleNavigation("/education_fellows_module")}
              >
                <Ionicons name="people-outline" size={18} color="#047857" />
                <Text style={[styles.dropdownText, styles.dropdownTextActive]}>
                  Fellows Directory
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => handleNavigation("/education_students_module")}
              >
                <Ionicons name="calendar-outline" size={18} color="#6b7280" />
                <Text style={styles.dropdownText}>Active Programs</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => handleNavigation("/education_pta_programs")}
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
                onPress={() => handleNavigation("/livelihood_management_hub")}
              >
                <Ionicons name="apps-outline" size={18} color="#6b7280" />
                <Text style={styles.dropdownText}>Management Hub</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => handleNavigation("/livelihood_goat_rearing_1")}
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
                onPress={() => handleNavigation("/beneficiary_master_profile")}
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
          <Ionicons name="snow-outline" size={20} color="#4b5563" />
          <Text style={styles.menuText}>Disaster Relief</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => handleNavigation("/hr_employee_management")}
        >
          <Ionicons name="people-outline" size={20} color="#4b5563" />
          <Text style={styles.menuText}>HR Management</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => handleNavigation("/admin_access_control")}
        >
          <Ionicons name="document-text-outline" size={20} color="#4b5563" />
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
                  router.push("/register");
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

      {/* MAIN CONTENT */}
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
              <Ionicons name="menu" size={24} color="#4B5563" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Impact Portal</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() =>
                Alert.alert("Notifications", "No new notifications")
              }
            >
              <Ionicons
                name="notifications-outline"
                size={22}
                color="#6B7280"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() =>
                Alert.alert("Settings", "Settings will be available soon")
              }
            >
              <Ionicons name="settings-outline" size={22} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.avatar}
              onPress={() => router.push("/profile")}
            >
              <Image
                source={{
                  uri: "https://randomuser.me/api/portraits/women/68.jpg",
                }}
                style={styles.avatarImage}
              />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Back Button to Fellows Page */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push("/education_fellows_module")}
          >
            <Icon name="arrow-back" size={20} color="#64748b" />
            <Text style={styles.backButtonText}>Back to Fellows Directory</Text>
          </TouchableOpacity>

          {/* Profile Header */}
          <LinearGradient
            colors={["#059669", "#10b981"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.profileHeader}
          >
            <View style={styles.profileImageContainer}>
              {fellow.avatar ? (
                <Image
                  source={{ uri: fellow.avatar }}
                  style={styles.profileImage}
                />
              ) : (
                <View style={styles.profileInitials}>
                  <Text style={styles.profileInitialsText}>
                    {fellow.initials || fellow.name.charAt(0)}
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.profileName}>{fellow.name}</Text>

            <View style={styles.cohortBadgeMain}>
              <Text style={styles.cohortBadgeMainText}>
                {fellow.cohort?.toUpperCase()}
              </Text>
            </View>

            <View style={styles.profileDetails}>
              <View style={styles.profileDetailItem}>
                <Icon name="location-on" size={16} color="#FFFFFF" />
                <Text style={styles.profileDetailText}>{fellow.location}</Text>
              </View>
              <View style={styles.profileDetailItem}>
                <Icon name="work" size={16} color="#FFFFFF" />
                <Text style={styles.profileDetailText}>
                  3 Active Placements
                </Text>
              </View>
              <View style={styles.profileDetailItem}>
                <Icon name="email" size={16} color="#FFFFFF" />
                <Text style={styles.profileDetailText}>
                  {fellow.name.toLowerCase().replace(" ", ".")}@aman.org
                </Text>
              </View>
              <View style={styles.profileDetailItem}>
                <Icon name="school" size={16} color="#FFFFFF" />
                <Text style={styles.profileDetailText}>
                  Assigned School: Oakridge Academy
                </Text>
              </View>
            </View>
          </LinearGradient>

          {/* Goals Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Goals</Text>
            <View style={styles.sectionActions}>
              <TouchableOpacity style={styles.sectionActionButton}>
                <Icon name="dashboard" size={18} color="#059669" />
                <Text style={styles.sectionActionText}>
                  Performance Dashboard
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sectionActionButton}>
                <Icon name="assessment" size={18} color="#059669" />
                <Text style={styles.sectionActionText}>
                  6-Month Progress Reviews
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Goal Cards */}
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              isExpanded={expandedGoal === goal.id}
              onToggle={toggleGoal}
            />
          ))}

          {/* Placement Summary & Donor Report Row */}
          <View style={styles.rowContainer}>
            {/* Placement Summary Card */}
            <View style={[styles.card, styles.placementCard]}>
              <Text style={styles.cardTitle}>Placement Summary</Text>

              <View style={styles.placementItem}>
                <View style={styles.placementIconContainer}>
                  <Icon name="work" size={20} color="#059669" />
                </View>
                <View>
                  <Text style={styles.placementLabel}>Active Placement</Text>
                  <Text style={styles.placementValue}>Oakridge Academy</Text>
                </View>
              </View>

              <View style={styles.placementItem}>
                <View style={styles.placementIconContainer}>
                  <Icon name="class" size={20} color="#f59e0b" />
                </View>
                <View>
                  <Text style={styles.placementLabel}>Class Grades</Text>
                  <Text style={styles.placementValue}>Grade 3, Grade 4</Text>
                </View>
              </View>

              <View style={styles.placementItem}>
                <View style={styles.placementIconContainer}>
                  <Icon name="people" size={20} color="#8b5cf6" />
                </View>
                <View>
                  <Text style={styles.placementLabel}>Assigned Students</Text>
                  <Text style={styles.placementValue}>76 Students</Text>
                </View>
              </View>

              <View style={styles.placementItem}>
                <View style={styles.placementIconContainer}>
                  <Icon name="star" size={20} color="#fbbf24" />
                </View>
                <View>
                  <Text style={styles.placementLabel}>Evaluation Rating</Text>
                  <Text style={styles.placementValue}>4.8 / 5.0</Text>
                </View>
              </View>
            </View>

            {/* Donor Report Card */}
            <View style={[styles.card, styles.donorCard]}>
              <Text style={styles.cardTitle}>Donor Report Status</Text>

              <View style={styles.donorContent}>
                <Icon name="description" size={40} color="#059669" />
                <Text style={styles.donorText}>
                  A donor-ready document incorporating the 6-month objectives,
                  performance scores, and assessment indexes is ready.
                </Text>
                <TouchableOpacity
                  style={styles.downloadButton}
                  onPress={() =>
                    Alert.alert(
                      "Download",
                      "Downloading presentation package...",
                    )
                  }
                >
                  <Icon name="file-download" size={18} color="#FFFFFF" />
                  <Text style={styles.downloadButtonText}>
                    Download presentation package →
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Completed Section */}
          <View style={styles.completedSection}>
            <LinearGradient
              colors={["#d1fae5", "#a7f3d0"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.completedCard}
            >
              <Icon name="check-circle" size={24} color="#059669" />
              <Text style={styles.completedText}>COMPLETED</Text>
              <Text style={styles.completedSubtext}>
                All goals are on track
              </Text>
            </LinearGradient>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  // Sidebar styles
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
  dropdownItemLogout: {
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    marginTop: 4,
    paddingTop: 12,
  },
  dropdownTextLogout: {
    color: "#ef4444",
  },
  // Main container
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
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
  menuButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#191C1D",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconButton: {
    padding: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#EDEEEF",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748b",
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: 32,
    marginHorizontal: 16,
    borderRadius: 24,
    marginBottom: 16,
  },
  profileImageContainer: {
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
  profileInitials: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
  profileInitialsText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#059669",
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  cohortBadgeMain: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  cohortBadgeMainText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  profileDetails: {
    width: "100%",
    paddingHorizontal: 20,
    gap: 8,
  },
  profileDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  profileDetailText: {
    fontSize: 13,
    color: "#FFFFFF",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexWrap: "wrap",
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#191C1D",
  },
  sectionActions: {
    flexDirection: "row",
    gap: 12,
  },
  sectionActionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionActionText: {
    fontSize: 12,
    color: "#059669",
    fontWeight: "500",
  },
  goalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden",
  },
  goalHeader: {
    padding: 16,
    backgroundColor: "#FFFFFF",
  },
  goalTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#191C1D",
    flex: 1,
  },
  goalDateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginLeft: 32,
  },
  goalDate: {
    fontSize: 12,
    color: "#6B7280",
  },
  goalContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  goalProgressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  progressPercentage: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#059669",
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#059669",
    borderRadius: 3,
  },
  milestonesTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  goalMilestoneItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  checkboxPlaceholder: {
    width: 20,
  },
  goalMilestoneText: {
    fontSize: 14,
    color: "#4B5563",
    flex: 1,
  },
  progressReviewBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#F0FDF4",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  progressReviewText: {
    fontSize: 13,
    color: "#065f46",
    flex: 1,
    lineHeight: 18,
  },
  rowContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  placementCard: {
    flex: 1,
    minWidth: 200,
  },
  donorCard: {
    flex: 1,
    minWidth: 250,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#191C1D",
    marginBottom: 16,
  },
  placementItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  placementIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  placementLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  placementValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#191C1D",
  },
  donorContent: {
    alignItems: "center",
    gap: 12,
  },
  donorText: {
    fontSize: 13,
    color: "#4B5563",
    textAlign: "center",
    lineHeight: 18,
  },
  downloadButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#059669",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  downloadButtonText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  completedSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  completedCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 12,
    justifyContent: "center",
  },
  completedText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#059669",
    letterSpacing: 1,
  },
  completedSubtext: {
    fontSize: 12,
    color: "#065f46",
  },
  bottomSpacer: {
    height: 32,
  },
});

export default FellowProfile;
