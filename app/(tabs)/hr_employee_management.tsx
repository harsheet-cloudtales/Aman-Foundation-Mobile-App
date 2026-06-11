import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  Alert,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Animated,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';

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
  secondaryFixed: '#ffdcc6',
  onSecondaryContainer: '#5e2c00',
  error: '#ba1a1a',
  errorContainer: '#ffdad6',
  onErrorContainer: '#93000a',
  emerald: '#10b981',
  rose: '#ef4444',
  amber: '#f59e0b',
  blue: '#3b82f6',
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

export default function HrEmployeeManagement() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState("Team Directory");
  
  // Dropdown states
  const [educationDropdownOpen, setEducationDropdownOpen] = useState(false);
  const [livelihoodDropdownOpen, setLivelihoodDropdownOpen] = useState(false);
  
  // Animated values
  const slideAnim = useRef(new Animated.Value(-width)).current;
  const educationRotateAnim = useRef(new Animated.Value(0)).current;
  const livelihoodRotateAnim = useRef(new Animated.Value(0)).current;

  // Employees data
  const [employees, setEmployees] = useState([
    { id: "EMP-082", name: "Sarah Jenkins", role: "Field Operations Lead", department: "Operations", status: "Active Mission", attendance: "09:02 AM", leavesUsed: 4, sopSigned: true, email: "sarah.jenkins@amanfoundation.org" },
    { id: "EMP-104", name: "David Chen", role: "Relief Coordinator", department: "Logistics", status: "In Office", attendance: "08:58 AM", leavesUsed: 8, sopSigned: true, email: "david.chen@amanfoundation.org" },
    { id: "EMP-304", name: "Maria Lopez", role: "Education Specialist", department: "Education", status: "On Leave", attendance: "On Leave", leavesUsed: 12, sopSigned: false, email: "maria.lopez@amanfoundation.org" },
    { id: "EMP-201", name: "Ahsan Kamal", role: "Field Representative", department: "Operations", status: "Active Mission", attendance: "08:45 AM", leavesUsed: 3, sopSigned: true, email: "ahsan.kamal@amanfoundation.org" },
    { id: "EMP-205", name: "Ibrahim Khan", role: "Logistics Specialist", department: "Logistics", status: "In Office", attendance: "08:50 AM", leavesUsed: 2, sopSigned: true, email: "ibrahim.khan@amanfoundation.org" },
    { id: "EMP-206", name: "Darshan Mohankar", role: "Area Manager", department: "Operations", status: "In Office", attendance: "09:15 AM", leavesUsed: 5, sopSigned: true, email: "darshan.mohankar@amanfoundation.org" },
    { id: "EMP-207", name: "Minakshi Kansare", role: "Health Educator", department: "Education", status: "On Leave", attendance: "On Leave", leavesUsed: 7, sopSigned: true, email: "minakshi.kansare@amanfoundation.org" },
    { id: "EMP-208", name: "Aman Sharma", role: "HR Director", department: "HR", status: "In Office", attendance: "08:30 AM", leavesUsed: 1, sopSigned: true, email: "aman.sharma@amanfoundation.org" },
    { id: "EMP-209", name: "Priya Das", role: "Finance Officer", department: "Finance", status: "In Office", attendance: "09:00 AM", leavesUsed: 0, sopSigned: true, email: "priya.das@amanfoundation.org" },
  ]);

  // Attendance Logs
  const [attendanceLogs, setAttendanceLogs] = useState([
    { id: "att-1", email: "mayuriaoti@gmail.com", status: "Working: 7h 14m", statusType: "working", workHours: "7h 14m", loginTime: "N/A", tasks: "1 tasks", lastUpdated: "11:41:15 PM" },
    { id: "att-2", email: "muralikade@gmail.com", status: "No Data", statusType: "nodata", workHours: "N/A", loginTime: "N/A", tasks: "No tasks", lastUpdated: "11:41:15 PM" },
    { id: "att-3", email: "nathajisadhana188@gmail.com", status: "No Data", statusType: "nodata", workHours: "N/A", loginTime: "N/A", tasks: "No tasks", lastUpdated: "11:41:15 PM" },
    { id: "att-4", email: "pavan.yafdsv@gmail.com", status: "Logged in at 12:30", statusType: "loggedin", workHours: "Calculating...", loginTime: "12:30", tasks: "2 tasks", lastUpdated: "11:41:15 PM" },
    { id: "att-5", email: "pooja.gramurja@gmail.com", status: "No Data", statusType: "nodata", workHours: "N/A", loginTime: "N/A", tasks: "No tasks", lastUpdated: "11:41:15 PM" },
    { id: "att-6", email: "pratibhadesmukh672@gmail.com", status: "Working: 7h 3m", statusType: "working", workHours: "7h 3m", loginTime: "N/A", tasks: "3 tasks", lastUpdated: "11:41:16 PM" },
    { id: "att-7", email: "sagarbhagat2020@gmail.com", status: "No Data", statusType: "nodata", workHours: "N/A", loginTime: "N/A", tasks: "No tasks", lastUpdated: "11:41:15 PM" },
    { id: "att-8", email: "samyashaikh150@gmail.com", status: "No Data", statusType: "nodata", workHours: "N/A", loginTime: "N/A", tasks: "No tasks", lastUpdated: "11:41:15 PM" },
  ]);

  // Leave Approvals
  const [leaveApprovals, setLeaveApprovals] = useState([
    { id: "leave-1", coach: "Ahsan Kamal", type: "Casual Leave", requestedDates: "2026-06-02 to 2026-06-04", leavesTaken: 1, leavesRemaining: 14, status: "APPROVED" },
    { id: "leave-2", coach: "Ibrahim Khan", type: "Casual Leave", requestedDates: "2026-05-30", leavesTaken: 0, leavesRemaining: 15, status: "REJECTED" },
    { id: "leave-3", coach: "Darshan Mohankar", type: "Casual Leave", requestedDates: "2026-06-02", leavesTaken: 0, leavesRemaining: 15, status: "REJECTED" },
    { id: "leave-4", coach: "Minakshi Kansare", type: "Sick Leave", requestedDates: "2026-06-02", leavesTaken: 1, leavesRemaining: 14, status: "REJECTED" },
    { id: "leave-5", coach: "Minakshi Kansare", type: "Sick Leave", requestedDates: "2026-05-25", leavesTaken: 1, leavesRemaining: 14, status: "APPROVED" },
    { id: "leave-6", coach: "Sarah Jenkins", type: "Casual Leave", requestedDates: "2026-06-10 to 2026-06-12", leavesTaken: 4, leavesRemaining: 12, status: "PENDING" },
    { id: "leave-7", coach: "David Chen", type: "Sick Leave", requestedDates: "2026-06-15", leavesTaken: 8, leavesRemaining: 8, status: "PENDING" },
  ]);

  // Filter states
  const [directorySearch, setDirectorySearch] = useState('');
  const [directoryDept, setDirectoryDept] = useState('All');
  const [directoryStatus, setDirectoryStatus] = useState('All');
  const [leaveSearch, setLeaveSearch] = useState('');
  const [leaveStatusFilter, setLeaveStatusFilter] = useState('ALL');

  // Form states
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newDept, setNewDept] = useState('Operations');
  const [newStatus, setNewStatus] = useState('In Office');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

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

  const handleDeleteLog = (id: string, email: string) => {
    setAttendanceLogs(prev => prev.filter(log => log.id !== id));
    triggerToast(`Attendance log for ${email} deleted.`);
  };

  const handleApproveLeave = (id: string, coach: string) => {
    setLeaveApprovals(prev => prev.map(l => l.id === id ? { ...l, status: "APPROVED", leavesTaken: l.leavesTaken + 1, leavesRemaining: Math.max(0, l.leavesRemaining - 1) } : l));
    triggerToast(`Approved leave request for ${coach}`);
  };

  const handleRejectLeave = (id: string, coach: string) => {
    setLeaveApprovals(prev => prev.map(l => l.id === id ? { ...l, status: "REJECTED" } : l));
    triggerToast(`Rejected leave request for ${coach}`);
  };

  const handleResetLeave = (id: string, coach: string) => {
    setLeaveApprovals(prev => prev.map(l => l.id === id ? { ...l, status: "PENDING" } : l));
    triggerToast(`Reset leave request for ${coach} to PENDING.`);
  };

  const handleAddEmployee = () => {
    if (!newName || !newRole) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    const email = `${newName.toLowerCase().replace(/\s+/g, ".")}@amanfoundation.org`;
    const newEmp = {
      id: `EMP-${Math.floor(100 + Math.random() * 900)}`,
      name: newName,
      role: newRole,
      department: newDept,
      status: newStatus,
      attendance: "Not checked-in",
      leavesUsed: 0,
      sopSigned: false,
      email: email,
    };

    setEmployees([...employees, newEmp]);
    setNewName('');
    setNewRole('');
    setNewDept('Operations');
    setNewStatus('In Office');
    setShowAddModal(false);
    triggerToast(`Successfully registered new hire: ${newName}`);
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch = emp.name.toLowerCase().includes(directorySearch.toLowerCase()) ||
      emp.role.toLowerCase().includes(directorySearch.toLowerCase()) ||
      emp.department.toLowerCase().includes(directorySearch.toLowerCase()) ||
      emp.id.toLowerCase().includes(directorySearch.toLowerCase());
    const matchesDept = directoryDept === "All" || emp.department === directoryDept;
    const matchesStatus = directoryStatus === "All" || emp.status === directoryStatus;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const filteredLeaves = leaveApprovals.filter((l) => {
    const matchesSearch = l.coach.toLowerCase().includes(leaveSearch.toLowerCase()) ||
      l.type.toLowerCase().includes(leaveSearch.toLowerCase());
    const matchesStatus = leaveStatusFilter === "ALL" || l.status === leaveStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const renderStatusPill = (statusType: string, statusText: string) => {
    let dotColor = '';
    let bgColor = '';
    let textColor = '';
    if (statusType === "working") {
      dotColor = colors.emerald;
      bgColor = `${colors.emerald}10`;
      textColor = colors.emerald;
    } else if (statusType === "nodata") {
      dotColor = colors.rose;
      bgColor = `${colors.rose}10`;
      textColor = colors.rose;
    } else {
      dotColor = colors.blue;
      bgColor = `${colors.blue}10`;
      textColor = colors.blue;
    }
    return (
      <View style={[styles.statusPill, { backgroundColor: bgColor }]}>
        <View style={[styles.statusDot, { backgroundColor: dotColor }]} />
        <Text style={[styles.statusPillText, { color: textColor }]}>{statusText}</Text>
      </View>
    );
  };

  const renderLeaveStatusPill = (status: string) => {
    if (status === "APPROVED") {
      return <View style={styles.leaveStatusApproved}><Text style={styles.leaveStatusText}>APPROVED</Text></View>;
    } else if (status === "REJECTED") {
      return <View style={styles.leaveStatusRejected}><Text style={styles.leaveStatusText}>REJECTED</Text></View>;
    } else {
      return <View style={styles.leaveStatusPending}><Text style={styles.leaveStatusText}>PENDING</Text></View>;
    }
  };

  const ToggleTab = ({ title }: { title: string }) => (
    <TouchableOpacity
      style={[styles.tab, activeTab === title && styles.tabActive]}
      onPress={() => setActiveTab(title)}
    >
      <Text style={[styles.tabText, activeTab === title && styles.tabTextActive]}>{title}</Text>
    </TouchableOpacity>
  );

  // Team Directory Table Header
  const TeamDirectoryHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={[styles.headerCell, styles.headerId]}>Employee ID</Text>
      <Text style={[styles.headerCell, styles.headerName]}>Name</Text>
      <Text style={[styles.headerCell, styles.headerEmail]}>Email</Text>
      <Text style={[styles.headerCell, styles.headerDept]}>Department</Text>
      <Text style={[styles.headerCell, styles.headerRole]}>Role</Text>
      <Text style={[styles.headerCell, styles.headerStatusTbl]}>Status</Text>
    </View>
  );

  // Attendance Table Header
  const AttendanceHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={[styles.headerCell, styles.attEmail]}>Employee</Text>
      <Text style={[styles.headerCell, styles.attStatus]}>Status</Text>
      <Text style={[styles.headerCell, styles.attHours]}>Work Hours</Text>
      <Text style={[styles.headerCell, styles.attLogin]}>Login Time</Text>
      <Text style={[styles.headerCell, styles.attTasks]}>Daily Tasks</Text>
      <Text style={[styles.headerCell, styles.attActions]}>Actions</Text>
    </View>
  );

  // Leave Table Header
  const LeaveHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={[styles.headerCell, styles.leaveCoach]}>Coach</Text>
      <Text style={[styles.headerCell, styles.leaveType]}>Type</Text>
      <Text style={[styles.headerCell, styles.leaveDates]}>Requested Dates</Text>
      <Text style={[styles.headerCell, styles.leaveTaken]}>Taken</Text>
      <Text style={[styles.headerCell, styles.leaveRemaining]}>Remaining</Text>
      <Text style={[styles.headerCell, styles.leaveStatusHdr]}>Status</Text>
      <Text style={[styles.headerCell, styles.leaveActionsHdr]}>Actions</Text>
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

        {/* LIVELIHOOD WITH DROPDOWN */}
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

        <TouchableOpacity style={[styles.menuItem, styles.menuItemActive]} onPress={() => handleNavigation('/hr_employee_management')}>
          <Ionicons name="people-outline" size={20} color="#fff" />
          <Text style={styles.menuTextActive}>HR Management</Text>
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
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
        >
          {/* Back Link */}
          <TouchableOpacity style={styles.backBtn} onPress={() => router.push('/')}>
            <MaterialIcons name="arrow-back" size={18} color="#6b7280" />
            <Text style={styles.backText}>Back to Dashboard</Text>
          </TouchableOpacity>

          {/* Page Header */}
          <View>
            <Text style={styles.sectionLabel}>Administration Module</Text>
            <Text style={styles.mainTitle}>Human Resources & Personnel</Text>
            <Text style={styles.subtitle}>
              Manage employee databases, daily attendance tracking, approval workflows, and standard operating procedures (SOP).
            </Text>
          </View>

          {/* Add Button */}
          <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
            <MaterialIcons name="person-add" size={18} color={colors.onPrimary} />
            <Text style={styles.addButtonText}>New Hire Registration</Text>
          </TouchableOpacity>

          {/* Tabs */}
          <View style={styles.tabContainer}>
            <ToggleTab title="Team Directory" />
            <ToggleTab title="Attendance Logs" />
            <ToggleTab title="Leave Workflow" />
            <ToggleTab title="SOP acknowledged registers" />
            <ToggleTab title="HR Reports & headcount" />
          </View>

          {/* Tab Content */}
          <View style={styles.tabContent}>
            {/* TEAM DIRECTORY TAB - SCROLLABLE HORIZONTALLY */}
            {activeTab === "Team Directory" && (
              <View>
                <View style={styles.directoryHeader}>
                  <Text style={styles.tableTitle}>Staff & Employee Directory</Text>
                  <Text style={styles.recordCount}>{filteredEmployees.length} employees found</Text>
                </View>

                {/* Filters */}
                <View style={styles.filterContainer}>
                  <View style={styles.searchContainer}>
                    <MaterialIcons name="search" size={18} color="#9ca3af" />
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Search name, role, ID..."
                      placeholderTextColor="#9ca3af"
                      value={directorySearch}
                      onChangeText={setDirectorySearch}
                    />
                  </View>
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={directoryDept}
                      onValueChange={(itemValue) => setDirectoryDept(itemValue)}
                      style={styles.filterPicker}
                    >
                      <Picker.Item label="All Departments" value="All" />
                      <Picker.Item label="Operations" value="Operations" />
                      <Picker.Item label="Logistics" value="Logistics" />
                      <Picker.Item label="Education" value="Education" />
                      <Picker.Item label="HR" value="HR" />
                      <Picker.Item label="Finance" value="Finance" />
                    </Picker>
                  </View>
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={directoryStatus}
                      onValueChange={(itemValue) => setDirectoryStatus(itemValue)}
                      style={styles.filterPicker}
                    >
                      <Picker.Item label="All Statuses" value="All" />
                      <Picker.Item label="In Office" value="In Office" />
                      <Picker.Item label="Active Mission" value="Active Mission" />
                      <Picker.Item label="On Leave" value="On Leave" />
                    </Picker>
                  </View>
                </View>

                {/* Scrollable Table */}
                <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                  <View style={styles.tableContainer}>
                    <TeamDirectoryHeader />
                    {filteredEmployees.map((emp) => (
                      <View key={emp.id} style={styles.tableRow}>
                        <Text style={[styles.rowCell, styles.rowId]}>{emp.id}</Text>
                        <Text style={[styles.rowCell, styles.rowName]}>{emp.name}</Text>
                        <Text style={[styles.rowCell, styles.rowEmail]}>{emp.email}</Text>
                        <Text style={[styles.rowCell, styles.rowDept]}>{emp.department}</Text>
                        <Text style={[styles.rowCell, styles.rowRole]}>{emp.role}</Text>
                        <View style={[styles.rowCell, styles.rowStatusTbl]}>
                          <View style={[styles.statusBadge, 
                            emp.status === 'Active Mission' ? styles.statusActiveMission : 
                            emp.status === 'On Leave' ? styles.statusOnLeave : 
                            styles.statusInOffice]}>
                            <Text style={styles.statusBadgeText}>{emp.status}</Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}

            {/* ATTENDANCE LOGS TAB - SCROLLABLE HORIZONTALLY */}
            {activeTab === "Attendance Logs" && (
              <View>
                <View style={styles.directoryHeader}>
                  <Text style={styles.tableTitle}>Daily Attendance Ledger</Text>
                  <Text style={styles.recordCount}>{attendanceLogs.length} Records</Text>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                  <View style={styles.tableContainer}>
                    <AttendanceHeader />
                    {attendanceLogs.map((log) => (
                      <View key={log.id} style={styles.tableRow}>
                        <View style={[styles.rowCell, styles.attEmailCell]}>
                          <View style={styles.employeeAvatar}>
                            <Text style={styles.avatarText}>{log.email.charAt(0).toUpperCase()}</Text>
                          </View>
                          <View>
                            <Text style={styles.employeeEmail}>{log.email}</Text>
                            <Text style={styles.employeeEmailSmall}>{log.email}</Text>
                          </View>
                        </View>
                        <View style={[styles.rowCell, styles.attStatusCell]}>
                          {renderStatusPill(log.statusType, log.status)}
                        </View>
                        <Text style={[styles.rowCell, styles.attHoursCell]}>{log.workHours}</Text>
                        <Text style={[styles.rowCell, styles.attLoginCell]}>{log.loginTime}</Text>
                        <View style={[styles.rowCell, styles.attTasksCell]}>
                          {log.tasks !== "No tasks" ? (
                            <View style={styles.tasksContainer}>
                              <MaterialIcons name="check-box" size={16} color={colors.emerald} />
                              <Text style={styles.tasksText}>{log.tasks}</Text>
                            </View>
                          ) : (
                            <View style={styles.tasksContainer}>
                              <MaterialIcons name="close" size={16} color={colors.rose} />
                              <Text style={styles.tasksTextNo}>{log.tasks}</Text>
                            </View>
                          )}
                        </View>
                        <View style={[styles.rowCell, styles.attActionsCell]}>
                          <TouchableOpacity onPress={() => triggerToast(`Viewing attendance log for ${log.email}`)}>
                            <Text style={styles.actionText}>View</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => handleDeleteLog(log.id, log.email)}>
                            <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}

            {/* LEAVE WORKFLOW TAB - SCROLLABLE HORIZONTALLY */}
            {activeTab === "Leave Workflow" && (
              <View>
                <View style={styles.directoryHeader}>
                  <Text style={styles.tableTitle}>Leave Approvals</Text>
                  <Text style={styles.recordCount}>{filteredLeaves.length} Records Found</Text>
                </View>

                {/* Leave Filters */}
                <View style={styles.leaveFilterContainer}>
                  <View style={styles.searchContainer}>
                    <MaterialIcons name="search" size={18} color="#9ca3af" />
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Search records..."
                      placeholderTextColor="#9ca3af"
                      value={leaveSearch}
                      onChangeText={setLeaveSearch}
                    />
                  </View>
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={leaveStatusFilter}
                      onValueChange={(itemValue) => setLeaveStatusFilter(itemValue)}
                      style={styles.filterPicker}
                    >
                      <Picker.Item label="All Status" value="ALL" />
                      <Picker.Item label="APPROVED" value="APPROVED" />
                      <Picker.Item label="REJECTED" value="REJECTED" />
                      <Picker.Item label="PENDING" value="PENDING" />
                    </Picker>
                  </View>
                  <TouchableOpacity style={styles.exportButton} onPress={() => triggerToast("Exporting leave records to CSV...")}>
                    <MaterialIcons name="download" size={14} color={colors.emerald} />
                    <Text style={styles.exportButtonText}>Export</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                  <View style={styles.tableContainer}>
                    <LeaveHeader />
                    {filteredLeaves.map((leave) => (
                      <View key={leave.id} style={styles.tableRow}>
                        <Text style={[styles.rowCell, styles.leaveCoachCell]}>{leave.coach}</Text>
                        <Text style={[styles.rowCell, styles.leaveTypeCell]}>{leave.type}</Text>
                        <Text style={[styles.rowCell, styles.leaveDatesCell]}>{leave.requestedDates}</Text>
                        <Text style={[styles.rowCell, styles.leaveTakenCell]}>{leave.leavesTaken}</Text>
                        <Text style={[styles.rowCell, styles.leaveRemainingCell]}>{leave.leavesRemaining}</Text>
                        <View style={[styles.rowCell, styles.leaveStatusCell]}>
                          {renderLeaveStatusPill(leave.status)}
                        </View>
                        <View style={[styles.rowCell, styles.leaveActionsCell]}>
                          {leave.status === "PENDING" ? (
                            <View style={styles.actionButtonsRow}>
                              <TouchableOpacity style={styles.approveButton} onPress={() => handleApproveLeave(leave.id, leave.coach)}>
                                <Text style={styles.approveButtonText}>Approve</Text>
                              </TouchableOpacity>
                              <TouchableOpacity style={styles.rejectButton} onPress={() => handleRejectLeave(leave.id, leave.coach)}>
                                <Text style={styles.rejectButtonText}>Reject</Text>
                              </TouchableOpacity>
                            </View>
                          ) : (
                            <TouchableOpacity onPress={() => handleResetLeave(leave.id, leave.coach)}>
                              <Text style={styles.resetText}>Reset</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}

            {/* SOP ACKNOWLEDGED REGISTERS TAB */}
            {activeTab === "SOP acknowledged registers" && (
              <View>
                <Text style={styles.tableTitle}>Standard Operating Procedures Acknowledgment Log</Text>
                <View style={styles.tableHeader}>
                  <Text style={[styles.headerCell, styles.sopName]}>Employee</Text>
                  <Text style={[styles.headerCell, styles.sopRole]}>Role</Text>
                  <Text style={[styles.headerCell, styles.sopStatus]}>Safety Protocol Signed</Text>
                </View>
                {employees.map((emp) => (
                  <View key={emp.id} style={styles.tableRow}>
                    <Text style={[styles.rowCell, styles.sopNameCell]}>{emp.name}</Text>
                    <Text style={[styles.rowCell, styles.sopRoleCell]}>{emp.role}</Text>
                    <View style={[styles.rowCell, styles.sopStatusCell]}>
                      <View style={[styles.sopBadge, emp.sopSigned ? styles.sopSigned : styles.sopPending]}>
                        <Text style={[styles.sopBadgeText, emp.sopSigned ? styles.sopSignedText : styles.sopPendingText]}>
                          {emp.sopSigned ? "Acknowledged" : "Pending Signoff"}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* HR REPORTS TAB */}
            {activeTab === "HR Reports & headcount" && (
              <View>
                <Text style={styles.tableTitle}>Headcount Distribution & Leave Trends</Text>
                <View style={styles.reportContainer}>
                  <Text style={styles.reportSubtitle}>Department Headcount Distribution</Text>
                  <View style={styles.progressItem}>
                    <Text style={styles.progressLabel}>Operations</Text>
                    <View style={styles.progressBarBg}>
                      <View style={[styles.progressFill, { width: '60%' }]} />
                    </View>
                    <Text style={styles.progressValue}>140</Text>
                  </View>
                  <View style={styles.progressItem}>
                    <Text style={styles.progressLabel}>Logistics</Text>
                    <View style={styles.progressBarBg}>
                      <View style={[styles.progressFill, { width: '30%' }]} />
                    </View>
                    <Text style={styles.progressValue}>72</Text>
                  </View>
                  <View style={styles.progressItem}>
                    <Text style={styles.progressLabel}>Education</Text>
                    <View style={styles.progressBarBg}>
                      <View style={[styles.progressFill, { width: '10%' }]} />
                    </View>
                    <Text style={styles.progressValue}>24</Text>
                  </View>
                </View>

                {/* Side Info */}
                <View style={styles.sideInfoCard}>
                  <Text style={styles.sideInfoTitle}>General Leave Balance Index</Text>
                  <View style={styles.balanceRow}>
                    <Text style={styles.balanceLabel}>Casual Leaves Balance</Text>
                    <Text style={styles.balanceValue}>12 Days remaining</Text>
                  </View>
                  <View style={styles.balanceRow}>
                    <Text style={styles.balanceLabel}>Sick Leaves Balance</Text>
                    <Text style={styles.balanceValue}>8 Days remaining</Text>
                  </View>
                  <View style={styles.balanceRow}>
                    <Text style={styles.balanceLabel}>Earned Leaves Balance</Text>
                    <Text style={styles.balanceValue}>22 Days remaining</Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Footer */}
          <Footer />
        </ScrollView>
      </SafeAreaView>

      {/* Add Employee Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Register New Employee Record</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <MaterialIcons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <View>
                <Text style={styles.formLabel}>Employee Full Name *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. John Doe"
                  placeholderTextColor="#9ca3af"
                  value={newName}
                  onChangeText={setNewName}
                />
              </View>

              <View>
                <Text style={styles.formLabel}>Job Role / Title *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. Field Operations Associate"
                  placeholderTextColor="#9ca3af"
                  value={newRole}
                  onChangeText={setNewRole}
                />
              </View>

              <View>
                <Text style={styles.formLabel}>Department</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={newDept}
                    onValueChange={(itemValue) => setNewDept(itemValue)}
                    style={styles.picker}
                  >
                    <Picker.Item label="Operations" value="Operations" />
                    <Picker.Item label="Logistics" value="Logistics" />
                    <Picker.Item label="Education" value="Education" />
                    <Picker.Item label="HR" value="HR" />
                    <Picker.Item label="Finance" value="Finance" />
                  </Picker>
                </View>
              </View>

              <View>
                <Text style={styles.formLabel}>Deployment Status</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={newStatus}
                    onValueChange={(itemValue) => setNewStatus(itemValue)}
                    style={styles.picker}
                  >
                    <Picker.Item label="In Office" value="In Office" />
                    <Picker.Item label="Active Mission" value="Active Mission" />
                    <Picker.Item label="On Leave" value="On Leave" />
                  </Picker>
                </View>
              </View>

              <View style={styles.formButtons}>
                <TouchableOpacity
                  onPress={() => setShowAddModal(false)}
                  style={styles.cancelButton}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleAddEmployee} style={styles.submitButton}>
                  <Text style={styles.submitButtonText}>Add Employee</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Toast Notification */}
      {showToast && (
        <View style={styles.toast}>
          <MaterialIcons name="check-circle" size={18} color={colors.emerald} />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // ==================== SIDEBAR STYLES ====================
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
  menuItemActive: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 30,
    marginBottom: 10,
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

  // ==================== MAIN CONTAINER ====================
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },

  // ==================== HEADER STYLES ====================
  header: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderBottomWidth: 1,
    borderBottomColor: '#EDEEEF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
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

  // ==================== SCROLL CONTENT ====================
  scrollContent: {
    padding: 20,
    paddingBottom: 20,
  },

  // ==================== BACK BUTTON ====================
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  backText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#64748b',
  },

  // ==================== HEADER SECTION ====================
  sectionLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: colors.onSurfaceVariant,
    marginBottom: 4,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.onSurface,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: colors.onSurfaceVariant,
    lineHeight: 20,
    marginBottom: 20,
  },

  // ==================== ADD BUTTON ====================
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 999,
    marginBottom: 20,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.onPrimary,
  },

  // ==================== TABS ====================
  tabContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
    marginBottom: 16,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginRight: 4,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.onSurfaceVariant,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },

  // ==================== TAB CONTENT ====================
  tabContent: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },

  // ==================== DIRECTORY HEADER ====================
  directoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  tableTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.onSurface,
    marginBottom: 16,
  },
  recordCount: {
    fontSize: 11,
    color: colors.onSurfaceVariant,
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  // ==================== TABLE CONTAINER ====================
  tableContainer: {
    minWidth: 800,
  },

  // ==================== FILTERS ====================
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  leaveFilterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    minWidth: 150,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 12,
    color: colors.onSurface,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: 8,
    minWidth: 130,
  },
  filterPicker: {
    height: 40,
    width: '100%',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${colors.emerald}10`,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: `${colors.emerald}30`,
  },
  exportButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.emerald,
  },

  // ==================== TABLE HEADERS ====================
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
    marginBottom: 10,
  },
  headerCell: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    color: colors.onSurfaceVariant,
  },

  // Team Directory Headers
  headerId: { width: 80 },
  headerName: { width: 120 },
  headerEmail: { width: 180 },
  headerDept: { width: 100 },
  headerRole: { width: 140 },
  headerStatusTbl: { width: 100, textAlign: 'right' },

  // Attendance Headers
  attEmail: { width: 180 },
  attStatus: { width: 140 },
  attHours: { width: 100 },
  attLogin: { width: 100 },
  attTasks: { width: 120 },
  attActions: { width: 100, textAlign: 'right' },

  // Leave Headers
  leaveCoach: { width: 120 },
  leaveType: { width: 100 },
  leaveDates: { width: 180 },
  leaveTaken: { width: 70, textAlign: 'center' },
  leaveRemaining: { width: 90, textAlign: 'center' },
  leaveStatusHdr: { width: 100, textAlign: 'center' },
  leaveActionsHdr: { width: 160, textAlign: 'right' },

  // SOP Headers
  sopName: { flex: 1.5 },
  sopRole: { flex: 1.5 },
  sopStatus: { flex: 1, textAlign: 'right' },

  // ==================== TABLE ROWS ====================
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
    alignItems: 'center',
  },
  rowCell: {
    fontSize: 12,
    color: colors.onSurface,
  },

  // Team Directory Row Cells
  rowId: { width: 80 },
  rowName: { width: 120, fontWeight: '500' },
  rowEmail: { width: 180 },
  rowDept: { width: 100 },
  rowRole: { width: 140 },
  rowStatusTbl: { width: 100, alignItems: 'flex-end' },

  // Status Badges
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusActiveMission: {
    backgroundColor: colors.primaryFixed,
  },
  statusInOffice: {
    backgroundColor: colors.surfaceContainerHighest,
  },
  statusOnLeave: {
    backgroundColor: colors.errorContainer,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
    color: colors.onPrimaryFixed,
  },

  // Attendance Row Cells
  attEmailCell: {
    width: 180,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  attStatusCell: { width: 140 },
  attHoursCell: { width: 100 },
  attLoginCell: { width: 100 },
  attTasksCell: { width: 120 },
  attActionsCell: {
    width: 100,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
  },

  // Employee Avatar
  employeeAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: `${colors.blue}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.blue,
  },
  employeeEmail: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.onSurface,
  },
  employeeEmailSmall: {
    fontSize: 10,
    color: colors.onSurfaceVariant,
  },

  // Status Pill
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '500',
  },

  // Tasks Container
  tasksContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tasksText: {
    fontSize: 11,
    color: colors.blue,
  },
  tasksTextNo: {
    fontSize: 11,
    color: colors.onSurfaceVariant,
  },

  // Action Buttons
  actionText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.blue,
  },
  deleteText: {
    color: colors.rose,
  },

  // Leave Row Cells
  leaveCoachCell: { width: 120, fontWeight: '500' },
  leaveTypeCell: { width: 100 },
  leaveDatesCell: { width: 180 },
  leaveTakenCell: { width: 70, textAlign: 'center' },
  leaveRemainingCell: { width: 90, textAlign: 'center' },
  leaveStatusCell: { width: 100, alignItems: 'center' },
  leaveActionsCell: { width: 160, alignItems: 'flex-end' },

  // Leave Status Badges
  leaveStatusApproved: {
    backgroundColor: `${colors.emerald}15`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: `${colors.emerald}30`,
  },
  leaveStatusRejected: {
    backgroundColor: `${colors.rose}15`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: `${colors.rose}30`,
  },
  leaveStatusPending: {
    backgroundColor: `${colors.amber}15`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: `${colors.amber}30`,
  },
  leaveStatusText: {
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
    color: colors.onSurface,
  },

  // Action Buttons Row
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  approveButton: {
    backgroundColor: colors.emerald,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  approveButtonText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
    textTransform: 'uppercase',
  },
  rejectButton: {
    backgroundColor: colors.rose,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  rejectButtonText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
    textTransform: 'uppercase',
  },
  resetText: {
    fontSize: 11,
    color: colors.onSurfaceVariant,
  },

  // SOP Row Cells
  sopNameCell: { flex: 1.5, fontWeight: '500' },
  sopRoleCell: { flex: 1.5 },
  sopStatusCell: { flex: 1, alignItems: 'flex-end' },

  // SOP Badges
  sopBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sopSigned: {
    backgroundColor: colors.primaryFixed,
  },
  sopPending: {
    backgroundColor: colors.errorContainer,
  },
  sopBadgeText: {
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  sopSignedText: {
    color: colors.onPrimaryFixed,
  },
  sopPendingText: {
    color: colors.onErrorContainer,
  },

  // ==================== REPORTS SECTION ====================
  reportContainer: {
    marginBottom: 20,
  },
  reportSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.onSurface,
    marginBottom: 16,
  },
  progressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  progressLabel: {
    width: 80,
    fontSize: 12,
    color: colors.onSurfaceVariant,
    textAlign: 'right',
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: colors.surfaceContainerHighest,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  progressValue: {
    width: 40,
    fontSize: 12,
    fontWeight: '500',
    color: colors.onSurface,
    textAlign: 'right',
  },

  // Side Info Card
  sideInfoCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  sideInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.onSurface,
    marginBottom: 12,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  balanceLabel: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  balanceValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.onSurface,
  },

  // ==================== MODAL STYLES ====================
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.onSurface,
  },
  modalForm: {
    padding: 20,
    gap: 16,
  },

  // ==================== FORM STYLES ====================
  formLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    color: colors.onSurfaceVariant,
    marginBottom: 6,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.onSurface,
    backgroundColor: '#ffffff',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 44,
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    paddingTop: 16,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#d1d5db',
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
    color: 'white',
    fontWeight: '600',
  },

  // ==================== TOAST NOTIFICATION ====================
  toast: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    left: 20,
    backgroundColor: '#1f2937',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 200,
  },
  toastText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
  },

  // ==================== FOOTER STYLES ====================
  footer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginTop: 20,
    marginBottom: 0,
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