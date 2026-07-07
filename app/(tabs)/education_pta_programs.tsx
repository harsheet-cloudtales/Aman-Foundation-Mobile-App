import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Image,
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

const { width } = Dimensions.get("window");

// Theme Colors
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
  secondaryContainer: "#fc820c",
  secondaryFixed: "#ffdcc6",
  onSecondaryContainer: "#5e2c00",
  error: "#ba1a1a",
  errorContainer: "#ffdad6",
  rose: "#ef4444",
  emerald: "#10b981",
};

// Initial Data
const initialPrograms = [
  {
    id: 1,
    title: "Annual Literacy Drive",
    status: "Active",
    description:
      "Comprehensive reading initiative targeting Standard 3 students.",
    duration: "6 Months",
    participants: "450 Students Enrolled",
  },
  {
    id: 2,
    title: "Digital Literacy Course",
    status: "Planning",
    description:
      "Basic computing classes for standard 8 students in partner schools.",
    duration: "3 Months",
    participants: "Planning (120 Expected)",
  },
];

const initialEvents = [
  {
    id: 101,
    title: "Q3 PTA General Assembly",
    status: "Completed",
    description:
      "Review of student outcomes, infrastructure needs, and parent feedback.",
    date: "Oct 24, 2026 • 10:00 AM",
    location: "Oakridge Main Hall",
  },
  {
    id: 102,
    title: "Fellow-Parent Welcome Committee",
    status: "Scheduled",
    description:
      "Orientation session welcoming Cohort '24 fellows to the district.",
    date: "Nov 12, 2026 • 11:30 AM",
    location: "Riverside Classroom B",
  },
  {
    id: 103,
    title: "PTA Monthly Planning Meeting",
    status: "Scheduled",
    description:
      "Discussing summer camp preparations and baseline literacy goals.",
    date: "Jun 10, 2026 • 09:30 AM",
    location: "Kalgachia Circle Office",
  },
  {
    id: 104,
    title: "Community Reading Circle Launch",
    status: "Scheduled",
    description:
      "Launching the outdoor reading circle initiative for primary students.",
    date: "Jun 24, 2026 • 02:00 PM",
    location: "Bartari Village Common",
  },
];

export default function PtaPrograms() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState("Program");
  const [refreshing, setRefreshing] = useState(false);
  const [programs, setPrograms] = useState(initialPrograms);
  const [events, setEvents] = useState(initialEvents);

  // Dropdown states
  const [educationDropdownOpen, setEducationDropdownOpen] = useState(false);
  const [livelihoodDropdownOpen, setLivelihoodDropdownOpen] = useState(false);
  const [authDropdownOpen, setAuthDropdownOpen] = useState(false);

  // Animated values
  const slideAnim = useRef(new Animated.Value(-width)).current;
  const educationRotateAnim = useRef(new Animated.Value(0)).current;
  const livelihoodRotateAnim = useRef(new Animated.Value(0)).current;
  const authRotateAnim = useRef(new Animated.Value(0)).current;

  // Calendar states
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 3));
  const [selectedCell, setSelectedCell] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempEventDate, setTempEventDate] = useState(new Date());
  const [tempEventTime, setTempEventTime] = useState(new Date());

  // Form states
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newLoc, setNewLoc] = useState("");
  const [newPriority, setNewPriority] = useState("Active");

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
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

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  };

  // Calendar Functions
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarCells = [];

  // Padding days from previous month
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarCells.push({
      day: daysInPrevMonth - i,
      month: month === 0 ? 11 : month - 1,
      year: month === 0 ? year - 1 : year,
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarCells.push({
      day: i,
      month: month,
      year: year,
      isCurrentMonth: true,
    });
  }

  // Padding days from next month
  const totalCellsNeeded = calendarCells.length <= 35 ? 35 : 42;
  const nextMonthPaddingCount = totalCellsNeeded - calendarCells.length;
  for (let i = 1; i <= nextMonthPaddingCount; i++) {
    calendarCells.push({
      day: i,
      month: month === 11 ? 0 : month + 1,
      year: month === 11 ? year + 1 : year,
      isCurrentMonth: false,
    });
  }

  const parseEventDate = (dateStr: string) => {
    try {
      const parts = dateStr.split(" • ");
      const datePart = parts[0];
      const dateObj = new Date(datePart);
      if (isNaN(dateObj.getTime())) return null;
      return dateObj;
    } catch (e) {
      return null;
    }
  };

  const getEventsForDay = (cell: any) => {
    return events.filter((e) => {
      const d = parseEventDate(e.date);
      if (!d) return false;
      return (
        d.getDate() === cell.day &&
        d.getMonth() === cell.month &&
        d.getFullYear() === cell.year
      );
    });
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedCell(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedCell(null);
  };

  const formatEventDate = (date: Date, time: Date) => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthName = months[date.getMonth()];
    const day = date.getDate();
    const yr = date.getFullYear();
    let hours = time.getHours();
    const minutes = time.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const timeStr = `${hours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
    return `${monthName} ${day}, ${yr} • ${timeStr}`;
  };

  const displayedEvents = selectedCell
    ? getEventsForDay(selectedCell)
    : events.filter((e) => {
        const d = parseEventDate(e.date);
        if (!d) return false;
        return d.getMonth() === month && d.getFullYear() === year;
      });

  const handleAddSubmit = () => {
    if (!newName || !newDesc) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    if (modalType === "Program") {
      const newProg = {
        id: programs.length + 1,
        title: newName,
        status: newPriority,
        description: newDesc,
        duration: newDate || "Indefinite",
        participants: newLoc || "0 Enrolled",
      };
      setPrograms([...programs, newProg]);
      Alert.alert("Success", "Program launched successfully");
    } else {
      const formattedDate = formatEventDate(tempEventDate, tempEventTime);
      const newEvent = {
        id: events.length + 101,
        title: newName,
        status: newPriority === "Active" ? "Scheduled" : "Completed",
        description: newDesc,
        date: formattedDate,
        location: newLoc || "TBD",
      };
      setEvents([...events, newEvent]);
      Alert.alert("Success", "Event scheduled successfully");
    }

    // Reset form
    setNewName("");
    setNewDesc("");
    setNewDate("");
    setNewLoc("");
    setNewPriority("Active");
    setTempEventDate(new Date());
    setTempEventTime(new Date());
    setShowAddModal(false);
  };

  const StatCard = ({ title, value, subtitle }: any) => (
    <View style={styles.statCard}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statSubtitle}>{subtitle}</Text>
    </View>
  );

  const ProgramCard = ({ program }: any) => (
    <TouchableOpacity
      style={styles.programCard}
      onPress={() => {
        router.push({
          pathname: "/education_pta_program_detail",
          params: { id: program.id.toString() },
        });
      }}
    >
      <View style={styles.programHeader}>
        <View style={styles.programInfo}>
          <Text style={styles.programTitle}>{program.title}</Text>
          <Text style={styles.programDescription}>{program.description}</Text>
        </View>
        <View
          style={[
            styles.programStatus,
            program.status === "Active"
              ? styles.statusActive
              : styles.statusPlanning,
          ]}
        >
          <Text style={styles.programStatusText}>{program.status}</Text>
        </View>
      </View>
      <View style={styles.programFooter}>
        <Text style={styles.programDuration}>Duration: {program.duration}</Text>
        <Text style={styles.programParticipants}>{program.participants}</Text>
      </View>
    </TouchableOpacity>
  );

  const EventCard = ({ event }: any) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => {
        router.push({
          pathname: "/education_pta_events",
          params: { id: event.id.toString() },
        });
      }}
    >
      <View style={styles.eventHeader}>
        <Text style={styles.eventTitle}>{event.title}</Text>
        <View
          style={[
            styles.eventStatus,
            event.status === "Scheduled"
              ? styles.statusScheduled
              : styles.statusCompleted,
          ]}
        >
          <Text style={styles.eventStatusText}>{event.status}</Text>
        </View>
      </View>
      <Text style={styles.eventDescription}>{event.description}</Text>
      <View style={styles.eventFooter}>
        <Text style={styles.eventDate}>{event.date}</Text>
        <Text style={styles.eventLocation}>{event.location}</Text>
      </View>
    </TouchableOpacity>
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
                style={styles.dropdownItem}
                onPress={() => handleNavigation("/education_fellows_module")}
              >
                <Ionicons name="people-outline" size={18} color="#6b7280" />
                <Text style={styles.dropdownText}>Fellows Directory</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => handleNavigation("/education_students_module")}
              >
                <Ionicons name="calendar-outline" size={18} color="#6b7280" />
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
                <Text style={[styles.dropdownText, styles.dropdownTextActive]}>
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
                <Ionicons
                  name="log-out-outline"
                  size={18}
                  color={colors.rose}
                />
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
              <Image
                source={{
                  uri: "https://randomuser.me/api/portraits/women/68.jpg",
                }}
                style={styles.avatar}
              />
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
            />
          }
        >
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.push("/education_management_hub")}
          >
            <MaterialIcons name="arrow-back" size={18} color="#6b7280" />
            <Text style={styles.backText}>Back to Education Hub</Text>
          </TouchableOpacity>

          {/* Header Section */}
          <View>
            <Text style={styles.sectionLabel}>Education Module</Text>
            <Text style={styles.mainTitle}>PTA & Programs Hub</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.scheduleButton}
              onPress={() => {
                setModalType("Event");
                setShowAddModal(true);
              }}
            >
              <MaterialIcons
                name="calendar-month"
                size={18}
                color={colors.onSurface}
              />
              <Text style={styles.scheduleButtonText}>Schedule Meeting</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.launchButton}
              onPress={() => {
                setModalType("Program");
                setShowAddModal(true);
              }}
            >
              <MaterialIcons name="add" size={18} color={colors.onPrimary} />
              <Text style={styles.launchButtonText}>Launch Program</Text>
            </TouchableOpacity>
          </View>

          {/* Statistics Cards */}
          <View style={styles.statsContainer}>
            <StatCard
              title="Running Programs"
              value={`${programs.length} Active`}
              subtitle="Continuous impact assessment"
            />
            <StatCard
              title="Meetings Held (YTD)"
              value={`${events.filter((e) => e.status === "Completed").length + 24}`}
              subtitle="Parent-Teacher linkages complete"
            />
            <StatCard
              title="Communication Follow-ups"
              value="4 Pending"
              subtitle="Requires organizer action"
            />
          </View>

          {/* Two Column Layout */}
          <View style={styles.twoColumnLayout}>
            {/* Left Column - Programs */}
            <View style={styles.leftColumn}>
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <MaterialIcons
                    name="workspace-premium"
                    size={24}
                    color={colors.primary}
                  />
                  <Text style={styles.sectionTitle}>Long-Running Programs</Text>
                </View>
                {programs.map((program) => (
                  <ProgramCard key={program.id} program={program} />
                ))}
              </View>
            </View>

            {/* Right Column - Calendar & Events */}
            <View style={styles.rightColumn}>
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <MaterialIcons
                    name="calendar-month"
                    size={24}
                    color={colors.secondary}
                  />
                  <Text style={styles.sectionTitle}>
                    Events & Meetings Calendar
                  </Text>
                </View>

                {/* Calendar Header */}
                <View style={styles.calendarHeader}>
                  <Text style={styles.calendarMonth}>
                    {monthNames[month]} {year}
                  </Text>
                  <View style={styles.calendarNav}>
                    <TouchableOpacity
                      onPress={handlePrevMonth}
                      style={styles.calendarNavButton}
                    >
                      <MaterialIcons
                        name="chevron-left"
                        size={20}
                        color={colors.onSurface}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleNextMonth}
                      style={styles.calendarNavButton}
                    >
                      <MaterialIcons
                        name="chevron-right"
                        size={20}
                        color={colors.onSurface}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Weekday Labels */}
                <View style={styles.weekdayContainer}>
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                    <Text key={day} style={styles.weekdayText}>
                      {day}
                    </Text>
                  ))}
                </View>

                {/* Calendar Grid */}
                <View style={styles.calendarGrid}>
                  {calendarCells.map((cell, idx) => {
                    const dayEvents = getEventsForDay(cell);
                    const isToday =
                      cell.day === 3 && cell.month === 5 && cell.year === 2026;
                    const isSelected =
                      selectedCell &&
                      selectedCell.day === cell.day &&
                      selectedCell.month === cell.month &&
                      selectedCell.year === cell.year;

                    return (
                      <TouchableOpacity
                        key={idx}
                        style={[
                          styles.calendarCell,
                          !cell.isCurrentMonth && styles.calendarCellOtherMonth,
                          isSelected && styles.calendarCellSelected,
                          isToday && !isSelected && styles.calendarCellToday,
                        ]}
                        onPress={() => {
                          if (isSelected) {
                            setSelectedCell(null);
                          } else {
                            setSelectedCell(cell);
                          }
                        }}
                      >
                        <Text
                          style={[
                            styles.calendarCellText,
                            !cell.isCurrentMonth &&
                              styles.calendarCellTextOther,
                            isSelected && styles.calendarCellTextSelected,
                          ]}
                        >
                          {cell.day}
                        </Text>
                        {dayEvents.length > 0 && (
                          <View
                            style={[
                              styles.calendarDot,
                              isSelected && styles.calendarDotSelected,
                            ]}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Events List */}
                <View style={styles.eventsContainer}>
                  <View style={styles.eventsHeader}>
                    <Text style={styles.eventsTitle}>
                      {selectedCell
                        ? `Events on ${monthNames[selectedCell.month]} ${selectedCell.day}, ${selectedCell.year}`
                        : `Events in ${monthNames[month]} ${year}`}
                    </Text>
                    {selectedCell && (
                      <TouchableOpacity onPress={() => setSelectedCell(null)}>
                        <Text style={styles.showAllText}>Show All Month</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {displayedEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                  {displayedEvents.length === 0 && (
                    <Text style={styles.noEventsText}>
                      No events scheduled for this period.
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Add Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Launch New {modalType}</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <MaterialIcons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <View>
                <Text style={styles.formLabel}>Title / Name *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder={`e.g. ${modalType === "Program" ? "Vocational Training Camp" : "PTA Special Assembly"}`}
                  placeholderTextColor="#9ca3af"
                  value={newName}
                  onChangeText={setNewName}
                />
              </View>

              <View>
                <Text style={styles.formLabel}>Description *</Text>
                <TextInput
                  style={[styles.formInput, styles.textArea]}
                  placeholder="Explain goals, agendas, or outlines."
                  placeholderTextColor="#9ca3af"
                  value={newDesc}
                  onChangeText={setNewDesc}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              {modalType === "Program" ? (
                <View>
                  <Text style={styles.formLabel}>
                    Planned Duration (e.g. 6 Months)
                  </Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. 4 Months"
                    placeholderTextColor="#9ca3af"
                    value={newDate}
                    onChangeText={setNewDate}
                  />
                </View>
              ) : (
                <View>
                  <Text style={styles.formLabel}>Event Date & Time *</Text>
                  <TouchableOpacity
                    style={styles.datePickerButton}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <MaterialIcons
                      name="event"
                      size={20}
                      color={colors.primary}
                    />
                    <Text style={styles.datePickerText}>
                      {tempEventDate.toDateString()} at{" "}
                      {tempEventTime.toLocaleTimeString()}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              <View>
                <Text style={styles.formLabel}>
                  {modalType === "Program"
                    ? "Expected Participants (e.g. 150 Enrolled)"
                    : "Location / Venue"}
                </Text>
                <TextInput
                  style={styles.formInput}
                  placeholder={`e.g. ${modalType === "Program" ? "80 Enrolled" : "Classroom 4A"}`}
                  placeholderTextColor="#9ca3af"
                  value={newLoc}
                  onChangeText={setNewLoc}
                />
              </View>

              <View style={styles.formButtons}>
                <TouchableOpacity
                  onPress={() => setShowAddModal(false)}
                  style={styles.cancelButton}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleAddSubmit}
                  style={styles.submitButton}
                >
                  <Text style={styles.submitButtonText}>Launch Now</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Date/Time Pickers */}
      {showDatePicker && (
        <DateTimePicker
          value={tempEventDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setTempEventDate(selectedDate);
              setShowTimePicker(true);
            }
          }}
        />
      )}
      {showTimePicker && (
        <DateTimePicker
          value={tempEventTime}
          mode="time"
          display="default"
          onChange={(event, selectedTime) => {
            setShowTimePicker(false);
            if (selectedTime) {
              setTempEventTime(selectedTime);
            }
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
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

  // ScrollView Content
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

  // Header Section
  sectionLabel: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: colors.onSurfaceVariant,
    marginBottom: 4,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.onSurface,
    marginBottom: 20,
  },

  // Action Buttons
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  scheduleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  scheduleButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.onSurface,
  },
  launchButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 999,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  launchButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.onPrimary,
  },

  // Statistics Cards
  statsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statTitle: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: colors.onSurfaceVariant,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.onSurface,
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 11,
    color: colors.onSurfaceVariant,
  },

  // Two Column Layout
  twoColumnLayout: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  leftColumn: {
    flex: 1,
    minWidth: 280,
  },
  rightColumn: {
    flex: 1,
    minWidth: 280,
  },

  // Section Cards
  sectionCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.onSurface,
  },

  // Program Cards
  programCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  programHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  programInfo: {
    flex: 1,
    marginRight: 12,
  },
  programTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.onSurface,
    marginBottom: 4,
  },
  programDescription: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
    lineHeight: 16,
  },
  programStatus: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: colors.primaryFixed,
  },
  statusPlanning: {
    backgroundColor: colors.secondaryFixed,
  },
  programStatusText: {
    fontSize: 9,
    fontWeight: "600",
    textTransform: "uppercase",
    color: colors.onPrimaryFixed,
  },
  programFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
  },
  programDuration: {
    fontSize: 10,
    color: colors.onSurfaceVariant,
  },
  programParticipants: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.primary,
  },

  // Calendar Styles
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  calendarMonth: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.onSurface,
  },
  calendarNav: {
    flexDirection: "row",
    gap: 8,
  },
  calendarNavButton: {
    padding: 4,
  },
  weekdayContainer: {
    flexDirection: "row",
    marginBottom: 8,
  },
  weekdayText: {
    flex: 1,
    textAlign: "center",
    fontSize: 10,
    fontWeight: "600",
    color: colors.onSurfaceVariant,
    paddingVertical: 8,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  calendarCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  calendarCellOtherMonth: {
    opacity: 0.4,
  },
  calendarCellSelected: {
    backgroundColor: colors.primary,
  },
  calendarCellToday: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  calendarCellText: {
    fontSize: 14,
    color: colors.onSurface,
  },
  calendarCellTextOther: {
    color: colors.onSurfaceVariant,
  },
  calendarCellTextSelected: {
    color: colors.onPrimary,
  },
  calendarDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
    marginTop: 2,
  },
  calendarDotSelected: {
    backgroundColor: colors.onPrimary,
  },

  // Events Container
  eventsContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
    paddingTop: 16,
  },
  eventsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  eventsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.onSurface,
  },
  showAllText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.primary,
  },

  // Event Cards
  eventCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.onSurface,
    flex: 1,
  },
  eventStatus: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusScheduled: {
    backgroundColor: colors.primaryFixed,
  },
  statusCompleted: {
    backgroundColor: colors.surfaceContainerHighest,
  },
  eventStatusText: {
    fontSize: 8,
    fontWeight: "600",
    textTransform: "uppercase",
    color: colors.onPrimaryFixed,
  },
  eventDescription: {
    fontSize: 11,
    color: colors.onSurfaceVariant,
    marginBottom: 8,
    lineHeight: 14,
  },
  eventFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
  },
  eventDate: {
    fontSize: 9,
    color: colors.onSurfaceVariant,
  },
  eventLocation: {
    fontSize: 9,
    fontWeight: "500",
    color: colors.primary,
  },
  noEventsText: {
    textAlign: "center",
    paddingVertical: 24,
    fontSize: 11,
    color: colors.onSurfaceVariant,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.onSurface,
  },
  modalForm: {
    padding: 20,
    gap: 16,
  },

  // Form Styles
  formLabel: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    color: colors.onSurfaceVariant,
    marginBottom: 6,
  },
  formInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.onSurface,
    backgroundColor: "#ffffff",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
  },
  datePickerText: {
    fontSize: 14,
    color: colors.onSurface,
  },
  formButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    paddingTop: 16,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  cancelButtonText: {
    color: colors.onSurface,
  },
  submitButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  submitButtonText: {
    color: "white",
    fontWeight: "600",
  },
});
