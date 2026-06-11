import React, { useState, useRef, useEffect } from 'react';
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
  ActivityIndicator,
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
  teal: '#14b8a6',
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

export default function AdminAccessControl() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [activeTab, setActiveTab] = useState('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Dropdown states
  const [educationDropdownOpen, setEducationDropdownOpen] = useState(false);
  const [livelihoodDropdownOpen, setLivelihoodDropdownOpen] = useState(false);
  
  // Modal states
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);
  
  // Data states
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Animated values
  const slideAnim = useRef(new Animated.Value(-width)).current;
  const educationRotateAnim = useRef(new Animated.Value(0)).current;
  const livelihoodRotateAnim = useRef(new Animated.Value(0)).current;

  // Current user (mock for demo)
  const currentUser = { roleName: 'ADMIN' };
  const pendingApprovalsCount = users.filter(u => u.status === 'PENDING').length;

  // Mock data
  const mockUsers = [
    { id: '1', name: 'John Doe', username: 'john.doe', email: 'john@amanfoundation.org', mobile: '+91 98765 43210', status: 'ACTIVE', role: { name: 'ADMIN' } },
    { id: '2', name: 'Jane Smith', username: 'jane.smith', email: 'jane@amanfoundation.org', mobile: '+91 98765 43211', status: 'ACTIVE', role: { name: 'MANAGER' } },
    { id: '3', name: 'Alice Johnson', username: 'alice.j', email: 'alice@amanfoundation.org', mobile: '+91 98765 43212', status: 'PENDING', role: { name: 'FIELD_STAFF' } },
    { id: '4', name: 'Bob Williams', username: 'bob.w', email: 'bob@amanfoundation.org', mobile: '+91 98765 43213', status: 'INACTIVE', role: { name: 'FIELD_STAFF' } },
    { id: '5', name: 'Carol Brown', username: 'carol.b', email: 'carol@amanfoundation.org', mobile: '+91 98765 43214', status: 'PENDING', role: { name: 'VOLUNTEER' } },
  ];

  const mockRoles = [
    { id: '1', name: 'ADMIN', description: 'Full system access with all permissions', displayInRegister: true },
    { id: '2', name: 'MANAGER', description: 'Manage operations and oversee field staff', displayInRegister: true },
    { id: '3', name: 'FIELD_STAFF', description: 'Field operations and data collection', displayInRegister: true },
    { id: '4', name: 'VOLUNTEER', description: 'Limited access for volunteers', displayInRegister: true },
  ];

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setUsers(mockUsers);
      setRoles(mockRoles);
      setLoading(false);
    }, 1000);
  }, []);

  const triggerToast = (msg: string, isError: boolean = false) => {
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
    setTimeout(() => {
      setUsers(mockUsers);
      setRoles(mockRoles);
      setRefreshing(false);
    }, 2000);
  };

  const rotateEducation = educationRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const rotateLivelihood = livelihoodRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const handleStatusUpdate = async (userId: string, newStatus: string) => {
    setActionLoading(userId);
    setTimeout(() => {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
      setActionLoading(null);
      triggerToast(`User status updated to ${newStatus}.`);
    }, 500);
  };

  const handleDeleteRole = (roleId: string) => {
    Alert.alert(
      'Delete Role',
      'Are you sure you want to delete this role? This action is permanent.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setRoles(prev => prev.filter(r => r.id !== roleId));
            triggerToast('Role deleted successfully!');
          }
        }
      ]
    );
  };

  const pendingUsers = users.filter(u => u.status === 'PENDING');
  const activeOrInactiveUsers = users.filter(u => u.status !== 'PENDING');

  const filteredUsers = () => {
    const list = activeTab === 'approvals' ? pendingUsers : activeOrInactiveUsers;
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      u =>
        (u.name && u.name.toLowerCase().includes(q)) ||
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.mobile && u.mobile.includes(q))
    );
  };

  if (currentUser?.roleName !== 'ADMIN') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.accessDeniedContainer}>
          <MaterialIcons name="shield" size={48} color={colors.rose} />
          <Text style={styles.accessDeniedTitle}>Access Denied</Text>
          <Text style={styles.accessDeniedText}>Administrator authorization is required to access this system.</Text>
        </View>
      </SafeAreaView>
    );
  }

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

        <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigation('/hr_employee_management')}>
          <Ionicons name="people-outline" size={20} color="#4b5563" />
          <Text style={styles.menuText}>HR Management</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, styles.menuItemActive]} onPress={() => handleNavigation('/admin_access_control')}>
          <Ionicons name="document-text-outline" size={20} color="#fff" />
          <Text style={styles.menuTextActive}>Admin & Access</Text>
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
          <View style={styles.pageHeader}>
            <View>
              <Text style={styles.mainTitle}>Admin Portal</Text>
              <Text style={styles.subtitle}>Dynamic access parameters & user authorization dashboard</Text>
            </View>
            <View style={styles.headerActions}>
              {activeTab === 'roles' && (
                <TouchableOpacity style={styles.addRoleButton} onPress={() => setIsAddRoleOpen(true)}>
                  <MaterialIcons name="add" size={16} color="white" />
                  <Text style={styles.addRoleButtonText}>Add Role</Text>
                </TouchableOpacity>
              )}
              <View style={styles.userCountBadge}>
                <MaterialIcons name="people" size={14} color={colors.emerald} />
                <Text style={styles.userCountText}>{activeOrInactiveUsers.length} Users</Text>
              </View>
              <TouchableOpacity
                style={[styles.pendingButton, activeTab === 'approvals' && styles.pendingButtonActive]}
                onPress={() => setActiveTab('approvals')}
              >
                <Text style={styles.pendingButtonText}>Pending Approvals</Text>
                <MaterialIcons name="arrow-forward" size={14} color={activeTab === 'approvals' ? colors.amber : colors.onSurfaceVariant} />
                {pendingApprovalsCount > 0 && (
                  <View style={styles.pendingCountBadge}>
                    <Text style={styles.pendingCountText}>{pendingApprovalsCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'users' && styles.tabActive]}
              onPress={() => setActiveTab('users')}
            >
              <MaterialIcons name="people" size={16} color={activeTab === 'users' ? colors.onSurface : colors.onSurfaceVariant} />
              <Text style={[styles.tabText, activeTab === 'users' && styles.tabTextActive]}>Active Users</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'approvals' && styles.tabActive]}
              onPress={() => setActiveTab('approvals')}
            >
              <MaterialIcons name="pending-actions" size={16} color={activeTab === 'approvals' ? colors.onSurface : colors.onSurfaceVariant} />
              <Text style={[styles.tabText, activeTab === 'approvals' && styles.tabTextActive]}>Approvals Queue</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'roles' && styles.tabActive]}
              onPress={() => setActiveTab('roles')}
            >
              <MaterialIcons name="shield" size={16} color={activeTab === 'roles' ? colors.onSurface : colors.onSurfaceVariant} />
              <Text style={[styles.tabText, activeTab === 'roles' && styles.tabTextActive]}>Role Switches</Text>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          {(activeTab === 'users' || activeTab === 'approvals') && (
            <View style={styles.searchContainer}>
              <MaterialIcons name="search" size={16} color="#9ca3af" />
              <TextInput
                style={styles.searchInput}
                placeholder={`Search ${activeTab === 'users' ? 'users' : 'pending approvals'} by name, email...`}
                placeholderTextColor="#9ca3af"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          )}

          {/* Loading State */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <>
              {/* USERS / APPROVALS TAB */}
              {(activeTab === 'users' || activeTab === 'approvals') && (
                filteredUsers().length === 0 ? (
                  <View style={styles.emptyState}>
                    <MaterialIcons name="check-circle" size={48} color="#9ca3af" />
                    <Text style={styles.emptyStateTitle}>No entries found</Text>
                    <Text style={styles.emptyStateText}>There are no matches for your query in this section.</Text>
                  </View>
                ) : (
                  <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                    <View style={styles.tableContainer}>
                      {/* Table Header */}
                      <View style={styles.tableHeader}>
                        <Text style={[styles.headerCell, styles.headerName]}>Name</Text>
                        <Text style={[styles.headerCell, styles.headerUsername]}>Username</Text>
                        <Text style={[styles.headerCell, styles.headerEmail]}>Email Address</Text>
                        <Text style={[styles.headerCell, styles.headerMobile]}>Mobile</Text>
                        <Text style={[styles.headerCell, styles.headerRoleCol]}>Role</Text>
                        <Text style={[styles.headerCell, styles.headerStatusCol]}>Status</Text>
                        <Text style={[styles.headerCell, styles.headerActions]}>Actions</Text>
                      </View>

                      {/* Table Rows */}
                      {filteredUsers().map((user, idx) => (
                        <View key={user.id} style={styles.tableRow}>
                          <View style={[styles.rowCell, styles.rowNameCell]}>
                            <View style={styles.userAvatar}>
                              <Text style={styles.userAvatarText}>
                                {(user.name || user.username).charAt(0).toUpperCase()}
                              </Text>
                            </View>
                            <Text style={styles.rowName}>{user.name || user.username}</Text>
                          </View>
                          <Text style={[styles.rowCell, styles.rowUsername]}>@{user.username}</Text>
                          <Text style={[styles.rowCell, styles.rowEmail]}>{user.email}</Text>
                          <Text style={[styles.rowCell, styles.rowMobile]}>{user.mobile || '—'}</Text>
                          <View style={[styles.rowCell, styles.rowRole]}>
                            <Text style={styles.roleBadge}>{user.role?.name?.replace('_', ' ') || 'N/A'}</Text>
                          </View>
                          <View style={[styles.rowCell, styles.rowStatus]}>
                            <View style={[
                              styles.statusBadge,
                              user.status === 'ACTIVE' ? styles.statusActive :
                              user.status === 'PENDING' ? styles.statusPending :
                              styles.statusInactive
                            ]}>
                              <Text style={styles.statusBadgeText}>{user.status}</Text>
                            </View>
                          </View>
                          <View style={[styles.rowCell, styles.rowActions]}>
                            {activeTab === 'approvals' ? (
                              <View style={styles.actionButtonsRow}>
                                <TouchableOpacity
                                  style={styles.approveButton}
                                  onPress={() => handleStatusUpdate(user.id, 'ACTIVE')}
                                  disabled={actionLoading === user.id}
                                >
                                  {actionLoading === user.id ? (
                                    <ActivityIndicator size="small" color="white" />
                                  ) : (
                                    <>
                                      <MaterialIcons name="check-circle" size={12} color="white" />
                                      <Text style={styles.approveButtonText}>Approve</Text>
                                    </>
                                  )}
                                </TouchableOpacity>
                                <TouchableOpacity
                                  style={styles.rejectButton}
                                  onPress={() => handleStatusUpdate(user.id, 'REJECTED')}
                                  disabled={actionLoading === user.id}
                                >
                                  <MaterialIcons name="cancel" size={12} color="white" />
                                  <Text style={styles.rejectButtonText}>Reject</Text>
                                </TouchableOpacity>
                              </View>
                            ) : (
                              <View style={styles.actionButtonsRow}>
                                {user.status !== 'ACTIVE' ? (
                                  <TouchableOpacity
                                    style={styles.activateButton}
                                    onPress={() => handleStatusUpdate(user.id, 'ACTIVE')}
                                  >
                                    <MaterialIcons name="check-circle" size={12} color={colors.emerald} />
                                    <Text style={styles.activateButtonText}>Activate</Text>
                                  </TouchableOpacity>
                                ) : (
                                  <TouchableOpacity
                                    style={styles.deactivateButton}
                                    onPress={() => handleStatusUpdate(user.id, 'INACTIVE')}
                                  >
                                    <MaterialIcons name="cancel" size={12} color={colors.rose} />
                                    <Text style={styles.deactivateButtonText}>Deactivate</Text>
                                  </TouchableOpacity>
                                )}
                                <TouchableOpacity
                                  style={styles.permissionsButton}
                                  onPress={() => {
                                    setSelectedUser(user);
                                    setIsUserModalOpen(true);
                                  }}
                                >
                                  <MaterialIcons name="shield" size={12} color={colors.teal} />
                                  <Text style={styles.permissionsButtonText}>Edit Permissions</Text>
                                </TouchableOpacity>
                              </View>
                            )}
                          </View>
                        </View>
                      ))}
                    </View>
                  </ScrollView>
                )
              )}

              {/* ROLES TAB */}
              {activeTab === 'roles' && (
                <View style={styles.rolesGrid}>
                  {roles.map((role) => {
                    const isAdmin = role.name === 'ADMIN';
                    return (
                      <View key={role.id} style={styles.roleCard}>
                        <View style={styles.roleCardHeader}>
                          <View style={styles.roleIcon}>
                            <MaterialIcons name="shield" size={20} color={colors.teal} />
                          </View>
                          <View style={[styles.roleVisibilityBadge, role.displayInRegister ? styles.roleVisible : styles.roleHidden]}>
                            <Text style={styles.roleVisibilityText}>
                              {role.displayInRegister ? 'Register Visible' : 'Hidden Role'}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.roleName}>{role.name.replace('_', ' ')}</Text>
                        <Text style={styles.roleDescription}>
                          {role.description || 'Provides default capability profile inside system apps.'}
                        </Text>
                        {!isAdmin && (
                          <View style={styles.roleActions}>
                            <TouchableOpacity
                              style={styles.rolePermissionsButton}
                              onPress={() => {
                                setSelectedRole(role);
                                setIsRoleModalOpen(true);
                              }}
                            >
                              <MaterialIcons name="edit" size={14} color={colors.teal} />
                              <Text style={styles.rolePermissionsText}>Permissions</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.roleDeleteButton}
                              onPress={() => handleDeleteRole(role.id)}
                            >
                              <MaterialIcons name="delete" size={14} color={colors.rose} />
                              <Text style={styles.roleDeleteText}>Delete</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}
            </>
          )}

          {/* Footer */}
          <Footer />
        </ScrollView>
      </SafeAreaView>

      {/* User Permissions Modal */}
      <Modal
        visible={isUserModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsUserModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>User Permissions</Text>
              <TouchableOpacity onPress={() => setIsUserModalOpen(false)}>
                <MaterialIcons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <View style={styles.userInfoSection}>
                <View style={styles.userAvatarLarge}>
                  <Text style={styles.userAvatarLargeText}>
                    {selectedUser ? (selectedUser.name || selectedUser.username).charAt(0).toUpperCase() : 'U'}
                  </Text>
                </View>
                <Text style={styles.userName}>{selectedUser?.name || selectedUser?.username}</Text>
                <Text style={styles.userEmail}>{selectedUser?.email}</Text>
              </View>
              <View style={styles.permissionsSection}>
                <Text style={styles.permissionsTitle}>Role & Permissions</Text>
                <Text style={styles.permissionsText}>Current Role: {selectedUser?.role?.name?.replace('_', ' ')}</Text>
              </View>
              <TouchableOpacity style={styles.closeModalButton} onPress={() => setIsUserModalOpen(false)}>
                <Text style={styles.closeModalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Role Permissions Modal */}
      <Modal
        visible={isRoleModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsRoleModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Role Permissions</Text>
              <TouchableOpacity onPress={() => setIsRoleModalOpen(false)}>
                <MaterialIcons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <View style={styles.roleInfoSection}>
                <View style={styles.roleIconLarge}>
                  <MaterialIcons name="shield" size={32} color={colors.teal} />
                </View>
                <Text style={styles.roleNameLarge}>{selectedRole?.name?.replace('_', ' ')}</Text>
                <Text style={styles.roleDescriptionLarge}>{selectedRole?.description}</Text>
              </View>
              <View style={styles.permissionsSection}>
                <Text style={styles.permissionsTitle}>Module Access</Text>
                <View style={styles.permissionCheckbox}>
                  <MaterialIcons name="check-box" size={20} color={colors.emerald} />
                  <Text style={styles.permissionText}>Dashboard Access</Text>
                </View>
                <View style={styles.permissionCheckbox}>
                  <MaterialIcons name="check-box" size={20} color={colors.emerald} />
                  <Text style={styles.permissionText}>Education Module</Text>
                </View>
                <View style={styles.permissionCheckbox}>
                  <MaterialIcons name="check-box" size={20} color={colors.emerald} />
                  <Text style={styles.permissionText}>Livelihood Module</Text>
                </View>
                <View style={styles.permissionCheckbox}>
                  <MaterialIcons name="check-box" size={20} color={colors.emerald} />
                  <Text style={styles.permissionText}>HR Management</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.closeModalButton} onPress={() => setIsRoleModalOpen(false)}>
                <Text style={styles.closeModalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Role Modal */}
      <Modal
        visible={isAddRoleOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsAddRoleOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Role</Text>
              <TouchableOpacity onPress={() => setIsAddRoleOpen(false)}>
                <MaterialIcons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Role Name</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g., SUPERVISOR"
                  placeholderTextColor="#9ca3af"
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Description</Text>
                <TextInput
                  style={[styles.formInput, styles.textArea]}
                  placeholder="Role description"
                  placeholderTextColor="#9ca3af"
                  multiline
                  numberOfLines={3}
                />
              </View>
              <View style={styles.formGroup}>
                <TouchableOpacity style={styles.checkboxRow}>
                  <MaterialIcons name="check-box-outline-blank" size={20} color="#9ca3af" />
                  <Text style={styles.checkboxLabel}>Display in Registration</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.cancelModalButton} onPress={() => setIsAddRoleOpen(false)}>
                  <Text style={styles.cancelModalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.createModalButton} onPress={() => {
                  triggerToast('Role created successfully!');
                  setIsAddRoleOpen(false);
                }}>
                  <Text style={styles.createModalButtonText}>Create Role</Text>
                </TouchableOpacity>
              </View>
            </View>
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
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
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
  scrollContent: {
    padding: 20,
    paddingBottom: 20,
  },
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
  accessDeniedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  accessDeniedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.rose,
    marginTop: 16,
    marginBottom: 8,
  },
  accessDeniedText: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  pageHeader: {
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.onSurface,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: colors.emerald,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
    flexWrap: 'wrap',
  },
  addRoleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  addRoleButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'white',
  },
  userCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: `${colors.emerald}10`,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: `${colors.emerald}20`,
  },
  userCountText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.emerald,
  },
  pendingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceContainerLowest,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    position: 'relative',
  },
  pendingButtonActive: {
    backgroundColor: `${colors.amber}10`,
    borderColor: `${colors.amber}30`,
  },
  pendingButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
  },
  pendingCountBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.rose,
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  pendingCountText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: 'white',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: colors.surfaceContainerLowest,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.onSurfaceVariant,
  },
  tabTextActive: {
    color: colors.onSurface,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 16,
    paddingHorizontal: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 13,
    color: colors.onSurface,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.onSurface,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  tableContainer: {
    minWidth: 900,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
    marginBottom: 8,
  },
  headerCell: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    color: colors.onSurfaceVariant,
  },
  headerName: { width: 140 },
  headerUsername: { width: 110 },
  headerEmail: { width: 180 },
  headerMobile: { width: 110 },
  headerRoleCol: { width: 100 },
  headerStatusCol: { width: 90 },
  headerActions: { width: 220, textAlign: 'right' },
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
  rowNameCell: { width: 140, flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowUsername: { width: 110 },
  rowEmail: { width: 180 },
  rowMobile: { width: 110 },
  rowRole: { width: 100 },
  rowStatus: { width: 90 },
  rowActions: { width: 220, alignItems: 'flex-end' },
  userAvatar: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: `${colors.teal}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.teal,
  },
  rowName: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.onSurface,
  },
  roleBadge: {
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    fontSize: 10,
    fontWeight: '500',
    color: colors.onSurfaceVariant,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statusActive: {
    backgroundColor: `${colors.emerald}15`,
  },
  statusPending: {
    backgroundColor: `${colors.amber}15`,
  },
  statusInactive: {
    backgroundColor: `${colors.rose}15`,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  approveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.emerald,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  approveButtonText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  rejectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.rose,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  rejectButtonText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  activateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${colors.emerald}15`,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  activateButtonText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.emerald,
  },
  deactivateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${colors.rose}15`,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  deactivateButtonText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.rose,
  },
  permissionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${colors.teal}15`,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  permissionsButtonText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.teal,
  },
  rolesGrid: {
    gap: 16,
  },
  roleCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  roleCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  roleIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: `${colors.teal}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleVisibilityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roleVisible: {
    backgroundColor: `${colors.emerald}15`,
  },
  roleHidden: {
    backgroundColor: colors.surface,
  },
  roleVisibilityText: {
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
    color: colors.onSurfaceVariant,
  },
  roleName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.onSurface,
    marginBottom: 8,
  },
  roleDescription: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
    lineHeight: 18,
    marginBottom: 20,
  },
  roleActions: {
    flexDirection: 'row',
    gap: 12,
  },
  rolePermissionsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: `${colors.teal}15`,
    paddingVertical: 10,
    borderRadius: 12,
  },
  rolePermissionsText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.teal,
  },
  roleDeleteButton: {
    flex: 0.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: `${colors.rose}15`,
    paddingVertical: 10,
    borderRadius: 12,
  },
  roleDeleteText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.rose,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 24,
    width: width - 40,
    maxWidth: 400,
    maxHeight: '80%',
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
  modalBody: {
    padding: 20,
  },
  userInfoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  userAvatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${colors.teal}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  userAvatarLargeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.teal,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.onSurface,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  roleInfoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  roleIconLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${colors.teal}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  roleNameLarge: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.onSurface,
    marginBottom: 8,
  },
  roleDescriptionLarge: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  permissionsSection: {
    marginBottom: 24,
  },
  permissionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.onSurface,
    marginBottom: 12,
  },
  permissionsText: {
    fontSize: 13,
    color: colors.onSurfaceVariant,
    marginBottom: 4,
  },
  permissionCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  permissionText: {
    fontSize: 13,
    color: colors.onSurface,
  },
  closeModalButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeModalButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '600',
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
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkboxLabel: {
    fontSize: 13,
    color: colors.onSurface,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
  cancelModalButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  cancelModalButtonText: {
    color: colors.onSurface,
  },
  createModalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  createModalButtonText: {
    color: 'white',
    fontWeight: '600',
  },
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