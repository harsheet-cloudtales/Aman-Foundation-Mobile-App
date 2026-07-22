import { RouteGuard } from "@/components/RouteGuard";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
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

// ============================================
// TYPES
// ============================================
interface Attendee {
  name: string;
  role: string;
  signed: string;
  time: string;
}

interface Communication {
  title: string;
  description: string;
  date: string;
}

interface EventDetail {
  id: number;
  title: string;
  status: string;
  date: string;
  location: string;
  agenda: string;
  attendees: Attendee[];
  communications: Communication[];
}

// ============================================
// THEME COLORS
// ============================================
const colors = {
  primary: "#006857",
  primaryContainer: "#00846e",
  onPrimary: "#ffffff",
  onPrimaryContainer: "#f4fffa",
  primaryFixed: "#7cf8da",
  onPrimaryFixed: "#00201a",
  surface: "#f8f9fa",
  surfaceContainerLowest: "#ffffff",
  surfaceContainerLow: "#f3f4f5",
  surfaceContainer: "#edeeef",
  surfaceContainerHighest: "#e1e3e4",
  onSurface: "#191c1d",
  onSurfaceVariant: "#3d4945",
  outlineVariant: "#bccac4",
  secondary: "#964900",
  secondaryFixed: "#ffdcc6",
  onSecondaryContainer: "#5e2c00",
  errorContainer: "#ffdad6",
  onErrorContainer: "#93000a",
  rose: "#ef4444",
  emerald: "#10b981",
};

// ============================================
// MAIN COMPONENT
// ============================================
export default function PtaEventDetail() {
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const eventId = (params.id as string) || "102";

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [educationDropdownOpen, setEducationDropdownOpen] = useState(false);
  const [livelihoodDropdownOpen, setLivelihoodDropdownOpen] = useState(false);
  const [authDropdownOpen, setAuthDropdownOpen] = useState(false);

  const slideAnim = useRef(new Animated.Value(-width)).current;
  const educationRotateAnim = useRef(new Animated.Value(0)).current;
  const livelihoodRotateAnim = useRef(new Animated.Value(0)).current;
  const authRotateAnim = useRef(new Animated.Value(0)).current;

  // ============================================
  // FETCH EVENT DATA
  // ============================================
  const fetchEventData = async () => {
    try {
      setLoading(true);

      if (!eventId) {
        throw new Error("Event ID is required");
      }

      const data = await api.get<EventDetail>(`/api/events/${eventId}`);

      if (data) {
        setEvent(data);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        console.error("Event fetch error:", err.message);
      }
      // Fallback data
      const fallbackEvents: Record<string, EventDetail> = {
        "101": {
          id: 101,
          title: "Q3 PTA General Assembly",
          status: "Completed",
          date: "Oct 24, 2026 • 10:00 AM",
          location: "Oakridge Main Hall",
          agenda:
            "This assembly focused on reviewing Q3 student outcomes, addressing infrastructure needs, and gathering parent feedback on ongoing programs.",
          attendees: [
            {
              name: "Rajesh Kumar",
              role: "Parent (Grade 8)",
              signed: "Yes",
              time: "10:02 AM",
            },
            {
              name: "Aisha Rahman",
              role: "Fellow (Assigned)",
              signed: "Yes",
              time: "09:45 AM",
            },
            {
              name: "Margaret Alva",
              role: "School Principal",
              signed: "Yes",
              time: "09:55 AM",
            },
            {
              name: "Suresh Patil",
              role: "Parent (Grade 3)",
              signed: "No (Apology Sent)",
              time: "-",
            },
          ],
          communications: [
            {
              title: "Pre-Alert Sent",
              description:
                "SMS invitations sent automatically to 32 parents registered in Grade 3 and Grade 4 cohorts.",
              date: "Oct 29, 2026 • 09:12 AM",
            },
            {
              title: "Follow-up reminder",
              description:
                "Acknowledged by Fellow coordinator. Review booklets packed for distribution.",
              date: "Oct 31, 2026 • 15:45 PM",
            },
          ],
        },
        "102": {
          id: 102,
          title: "Fellow-Parent Welcome Committee",
          status: "Scheduled",
          date: "Nov 12, 2026 • 11:30 AM",
          location: "Riverside Classroom B",
          agenda:
            "This assembly is scheduled to establish critical linkages between newly onboarded educational fellows and parent representatives. We will review attendance goals, distribute learning block materials, and define community feedback paths.",
          attendees: [
            {
              name: "Rajesh Kumar",
              role: "Parent (Grade 8)",
              signed: "Pending",
              time: "-",
            },
            {
              name: "Aisha Rahman",
              role: "Fellow (Assigned)",
              signed: "Confirmed",
              time: "-",
            },
            {
              name: "Margaret Alva",
              role: "School Principal",
              signed: "Confirmed",
              time: "-",
            },
            {
              name: "Suresh Patil",
              role: "Parent (Grade 3)",
              signed: "Pending",
              time: "-",
            },
            {
              name: "Neha Sharma",
              role: "Parent (Grade 5)",
              signed: "Confirmed",
              time: "-",
            },
          ],
          communications: [
            {
              title: "Invitation Sent",
              description:
                "Email invitations sent to all parents of Grade 3-8 students.",
              date: "Nov 5, 2026 • 10:00 AM",
            },
            {
              title: "Reminder Notice",
              description:
                "Reminder sent via SMS to registered parent contacts.",
              date: "Nov 10, 2026 • 09:30 AM",
            },
          ],
        },
        "103": {
          id: 103,
          title: "PTA Monthly Planning Meeting",
          status: "Scheduled",
          date: "Jun 10, 2026 • 09:30 AM",
          location: "Kalgachia Circle Office",
          agenda:
            "Planning meeting for summer camp activities and setting baseline literacy goals for the upcoming term.",
          attendees: [
            {
              name: "Aisha Rahman",
              role: "Fellow Lead",
              signed: "Confirmed",
              time: "-",
            },
            {
              name: "Rajesh Kumar",
              role: "PTA President",
              signed: "Confirmed",
              time: "-",
            },
            {
              name: "Margaret Alva",
              role: "School Principal",
              signed: "Confirmed",
              time: "-",
            },
          ],
          communications: [
            {
              title: "Meeting Request",
              description: "Calendar invites sent to all committee members.",
              date: "Jun 1, 2026 • 02:00 PM",
            },
          ],
        },
        "104": {
          id: 104,
          title: "Community Reading Circle Launch",
          status: "Scheduled",
          date: "Jun 24, 2026 • 02:00 PM",
          location: "Bartari Village Common",
          agenda:
            "Launch event for the new outdoor reading circle initiative aimed at improving literacy among primary students.",
          attendees: [
            {
              name: "Aisha Rahman",
              role: "Program Coordinator",
              signed: "Confirmed",
              time: "-",
            },
            {
              name: "Local Village Head",
              role: "Community Leader",
              signed: "Pending",
              time: "-",
            },
            {
              name: "Primary Teachers",
              role: "Teaching Staff",
              signed: "Confirmed",
              time: "-",
            },
          ],
          communications: [
            {
              title: "Community Announcement",
              description: "Posters distributed in local community centers.",
              date: "Jun 15, 2026 • 11:00 AM",
            },
          ],
        },
      };
      setEvent(fallbackEvents[eventId] || fallbackEvents["102"]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEventData();
  }, [eventId]);

  // ============================================
  // SIDEBAR FUNCTIONS
  // ============================================
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

  const handleNavigation = (route: string) => {
    closeMenu();
    router.push(route);
  };

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

  const onRefresh = () => {
    setRefreshing(true);
    fetchEventData();
  };

  // ============================================
  // COMPONENTS
  // ============================================
  const AttendeeRow = ({ attendee }: { attendee: Attendee }) => (
    <View style={styles.attendeeRow}>
      <View style={styles.attendeeInfo}>
        <Text style={styles.attendeeName}>{attendee.name}</Text>
        <Text style={styles.attendeeRole}>{attendee.role}</Text>
      </View>
      <View style={styles.attendeeStatus}>
        <View
          style={[
            styles.signedBadge,
            attendee.signed === "Yes" || attendee.signed === "Confirmed"
              ? styles.signedYes
              : attendee.signed === "No (Apology Sent)"
                ? styles.signedNo
                : styles.signedPending,
          ]}
        >
          <Text
            style={[
              styles.signedText,
              attendee.signed === "Yes" || attendee.signed === "Confirmed"
                ? styles.signedTextYes
                : attendee.signed === "No (Apology Sent)"
                  ? styles.signedTextNo
                  : styles.signedTextPending,
            ]}
          >
            {attendee.signed === "Yes"
              ? "Signed In"
              : attendee.signed === "Confirmed"
                ? "Confirmed"
                : attendee.signed === "No (Apology Sent)"
                  ? "Not Signed"
                  : "Pending"}
          </Text>
        </View>
        <Text style={styles.attendeeTime}>{attendee.time}</Text>
      </View>
    </View>
  );

  const CommunicationCard = ({ log }: { log: Communication }) => (
    <View style={styles.communicationCard}>
      <Text style={styles.communicationTitle}>{log.title}</Text>
      <Text style={styles.communicationDescription}>{log.description}</Text>
      <Text style={styles.communicationDate}>{log.date}</Text>
    </View>
  );

  // ============================================
  // LOADING STATE
  // ============================================
  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading event details...</Text>
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <MaterialIcons name="error-outline" size={48} color={colors.rose} />
        <Text style={styles.loadingText}>Event not found</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // ============================================
  // RENDER
  // ============================================
  return (
    <RouteGuard>
      <View style={{ flex: 1 }}>
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
                    onPress={() =>
                      handleNavigation("/education_management_hub")
                    }
                  >
                    <Ionicons
                      name="library-outline"
                      size={18}
                      color="#6b7280"
                    />
                    <Text style={styles.dropdownText}>Management Hub</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() =>
                      handleNavigation("/education_schools_module")
                    }
                  >
                    <Ionicons
                      name="business-outline"
                      size={18}
                      color="#6b7280"
                    />
                    <Text style={styles.dropdownText}>Schools Overview</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() =>
                      handleNavigation("/education_fellows_module")
                    }
                  >
                    <Ionicons name="people-outline" size={18} color="#6b7280" />
                    <Text style={styles.dropdownText}>Fellows Directory</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() =>
                      handleNavigation("/education_students_module")
                    }
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={18}
                      color="#6b7280"
                    />
                    <Text style={styles.dropdownText}>Students Directory</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.dropdownItem, styles.dropdownItemActive]}
                    onPress={() => handleNavigation("/education_pta_programs")}
                  >
                    <Ionicons
                      name="people-circle-outline"
                      size={18}
                      color="#047857"
                    />
                    <Text
                      style={[styles.dropdownText, styles.dropdownTextActive]}
                    >
                      PTA & Programs
                    </Text>
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
                    onPress={() =>
                      handleNavigation("/beneficiary_master_profile")
                    }
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
              <Ionicons
                name="document-text-outline"
                size={20}
                color="#4b5563"
              />
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
                      closeMenu();
                      router.push("/login");
                    }}
                  >
                    <Ionicons name="log-in-outline" size={18} color="#6b7280" />
                    <Text style={styles.dropdownText}>Login Page</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      closeMenu();
                      router.push("/registration");
                    }}
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
                      color={colors.rose}
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
              <TouchableOpacity onPress={() => router.push("/profile")}>
                {/* <Image
                  source={{
                    uri:
                      user?.avatar ||
                      "https://randomuser.me/api/portraits/women/68.jpg",
                  }}
                  style={styles.avatar}
                /> */}
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            }
          >
            {/* Back Link */}
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.push("/education_pta_programs")}
            >
              <MaterialIcons name="arrow-back" size={18} color="#6b7280" />
              <Text style={styles.backText}>Back to PTA Hub</Text>
            </TouchableOpacity>

            {/* Hero Header */}
            <LinearGradient
              colors={["#FFFFFF", "#FFFFFF"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroCard}
            >
              <View style={styles.heroContent}>
                <View style={styles.heroIcon}>
                  <MaterialIcons
                    name="diversity-3"
                    size={32}
                    color={colors.onSecondaryContainer}
                  />
                </View>
                <View style={styles.heroInfo}>
                  <View style={styles.titleRow}>
                    <Text style={styles.heroTitle}>{event.title}</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        event.status === "Scheduled"
                          ? styles.statusScheduled
                          : styles.statusCompleted,
                      ]}
                    >
                      <Text style={styles.statusText}>{event.status}</Text>
                    </View>
                  </View>
                  <View style={styles.dateRow}>
                    <MaterialIcons
                      name="calendar-today"
                      size={16}
                      color={colors.primary}
                    />
                    <Text style={styles.dateText}>
                      {event.date} at {event.location}
                    </Text>
                  </View>
                </View>
              </View>
            </LinearGradient>

            {/* Two Column Layout */}
            <View style={styles.twoColumnLayout}>
              {/* Left Column */}
              <View style={styles.leftColumn}>
                {/* Meeting Details */}
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Meeting Agenda & Focus</Text>
                  <Text style={styles.cardText}>{event.agenda}</Text>
                </View>

                {/* Attendee Sign Ins */}
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <MaterialIcons
                      name="how-to-reg"
                      size={20}
                      color={colors.primary}
                    />
                    <Text style={styles.cardTitle}>
                      PTA Attendee Registry & Sign-ins
                    </Text>
                  </View>
                  <View style={styles.attendeeHeader}>
                    <Text style={styles.attendeeHeaderName}>Name</Text>
                    <Text style={styles.attendeeHeaderStatus}>Status</Text>
                  </View>
                  {event.attendees &&
                    event.attendees.map((attendee, idx) => (
                      <AttendeeRow key={idx} attendee={attendee} />
                    ))}
                </View>
              </View>

              {/* Right Column */}
              <View style={styles.rightColumn}>
                {/* Communication Logs */}
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>
                    Action & Communication Logs
                  </Text>
                  {event.communications &&
                    event.communications.map((log, idx) => (
                      <CommunicationCard key={idx} log={log} />
                    ))}
                </View>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </RouteGuard>
  );
}

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.surface,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.onSurfaceVariant,
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  // Sidebar Styles
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
  dropdownItemLogout: {
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    marginTop: 4,
    paddingTop: 12,
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
  dropdownTextLogout: {
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

  // Main Container
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },

  // Header Styles
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
  menuButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
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
  },

  // Scroll Content
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  // Back Button
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

  // Hero Card
  heroCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  heroContent: {
    flexDirection: "row",
    gap: 16,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.secondaryFixed,
    alignItems: "center",
    justifyContent: "center",
  },
  heroInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.onSurface,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusScheduled: {
    backgroundColor: colors.primaryFixed,
  },
  statusCompleted: {
    backgroundColor: colors.surfaceContainerHighest,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    color: colors.onPrimaryFixed,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dateText: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },

  // Two Column Layout
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

  // Cards
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 20,
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
    fontSize: 18,
    fontWeight: "600",
    color: colors.onSurface,
    marginBottom: 12,
  },
  cardText: {
    fontSize: 13,
    color: colors.onSurfaceVariant,
    lineHeight: 20,
  },

  // Attendee Styles
  attendeeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
    marginBottom: 12,
  },
  attendeeHeaderName: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    color: colors.onSurfaceVariant,
  },
  attendeeHeaderStatus: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    color: colors.onSurfaceVariant,
  },
  attendeeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  attendeeInfo: {
    flex: 2,
  },
  attendeeName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.onSurface,
    marginBottom: 2,
  },
  attendeeRole: {
    fontSize: 11,
    color: colors.onSurfaceVariant,
  },
  attendeeStatus: {
    flex: 1,
    alignItems: "flex-end",
    gap: 4,
  },
  signedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  signedYes: {
    backgroundColor: colors.primaryFixed,
  },
  signedNo: {
    backgroundColor: colors.errorContainer,
  },
  signedPending: {
    backgroundColor: colors.surfaceContainerHighest,
  },
  signedText: {
    fontSize: 9,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  signedTextYes: {
    color: colors.onPrimaryFixed,
  },
  signedTextNo: {
    color: colors.onErrorContainer,
  },
  signedTextPending: {
    color: colors.onSurfaceVariant,
  },
  attendeeTime: {
    fontSize: 10,
    color: colors.onSurfaceVariant,
  },

  // Communication Log Styles
  communicationCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  communicationTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.onSurface,
    marginBottom: 4,
  },
  communicationDescription: {
    fontSize: 11,
    color: colors.onSurfaceVariant,
    marginBottom: 8,
    lineHeight: 16,
  },
  communicationDate: {
    fontSize: 9,
    color: colors.onSurfaceVariant,
  },
});
