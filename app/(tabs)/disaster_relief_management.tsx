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
import { WebView } from 'react-native-webview';
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

export default function DisasterRelief() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeAlert, setActiveAlert] = useState<any>(null);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastSeverity, setBroadcastSeverity] = useState('Urgent');
  const [activeTab, setActiveTab] = useState('Affected Registry');
  
  // Dropdown states
  const [educationDropdownOpen, setEducationDropdownOpen] = useState(false);
  const [livelihoodDropdownOpen, setLivelihoodDropdownOpen] = useState(false);
  
  // Animated values
  const slideAnim = useRef(new Animated.Value(-width)).current;
  const educationRotateAnim = useRef(new Animated.Value(0)).current;
  const livelihoodRotateAnim = useRef(new Animated.Value(0)).current;

  // Data
  const [providers] = useState([
    {
      id: "PROV-401",
      name: "Kalgachia Hospital Medical Unit",
      type: "Responders (Medical & Health)",
      contact: "Dr. A. Rahman (+91 94350 xxxxx)",
      status: "Active in Bartari Camp",
    },
    {
      id: "PROV-112",
      name: "Aman Foundation Relief Convoy",
      type: "Responders (Logistics & Food)",
      contact: "H. Ali (convoy_lead@amanassam.org)",
      status: "Dispatched to Moinbari Char",
    },
    {
      id: "PROV-908",
      name: "Kalgachia Student Volunteer Cohort",
      type: "Volunteers (Distribution)",
      contact: "College Volunteer Group",
      status: "Standby / Rest",
    },
  ]);

  const [affected] = useState([
    {
      id: "AFF-102",
      family: "Ahmed Family",
      location: "Bartari School Shelter, Kalgachia",
      size: 5,
      requirement: "Dry Rations, Tarpaulins",
      status: "High Priority",
    },
    {
      id: "AFF-884",
      family: "Sawpur Char Evacuees",
      location: "Sawpur High School, Kalgachia",
      size: 8,
      requirement: "Medical Aid, Mosquito Nets",
      status: "Completed",
    },
    {
      id: "AFF-394",
      family: "Brahmaputra Bank Displaced",
      location: "Moinbari Embankment Camp",
      size: 4,
      requirement: "Baby Food, Clean Drinking Water",
      status: "In Progress",
    },
  ]);

  const [inventory] = useState([
    { item: "Assam Rice & Dal Ration Packs", stock: 1200, unit: "Packs", status: "Optimal" },
    { item: "Drinking Water Halogen Tablets & Tanks", stock: 14000, unit: "Liters / Tablets", status: "Critical Shortage" },
    { item: "First Aid & Anti-Venom Kits", stock: 45, unit: "Kits", status: "Optimal" },
    { item: "Tarpaulins & Mosquito Nets", stock: 250, unit: "Packs", status: "Restock Requested" },
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

  const handleBroadcast = () => {
    if (!broadcastMsg) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }
    setActiveAlert({
      severity: broadcastSeverity,
      message: broadcastMsg,
    });
    setBroadcastMsg('');
    setShowBroadcastModal(false);
    Alert.alert('Success', 'Alert broadcasted successfully');
  };

  const getStatusStyle = (status: string) => {
    if (status === 'High Priority' || status === 'Critical Shortage') {
      return styles.statusHighPriority;
    } else if (status === 'Completed' || status === 'Optimal') {
      return styles.statusCompleted;
    } else if (status === 'Restock Requested') {
      return styles.statusRestock;
    }
    return styles.statusInProgress;
  };

  const ToggleTab = ({ title }: { title: string }) => (
    <TouchableOpacity
      style={[styles.tab, activeTab === title && styles.tabActive]}
      onPress={() => setActiveTab(title)}
    >
      <Text style={[styles.tabText, activeTab === title && styles.tabTextActive]}>{title}</Text>
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

        <TouchableOpacity style={[styles.menuItem, styles.menuItemActive]} onPress={() => handleNavigation('/disaster_relief_management')}>
          <Ionicons name="snow-outline" size={20} color="#fff" />
          <Text style={styles.menuTextActive}>Disaster Relief</Text>
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
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
        >
          {/* Back Link */}
          <TouchableOpacity style={styles.backBtn} onPress={() => router.push('/')}>
            <MaterialIcons name="arrow-back" size={18} color="#6b7280" />
            <Text style={styles.backText}>Back to Dashboard</Text>
          </TouchableOpacity>

          {/* Dynamic Warning Alert */}
          {activeAlert && (
            <View style={styles.alertBanner}>
              <View style={styles.alertContent}>
                <MaterialIcons name="gavel" size={20} color={colors.secondary} />
                <Text style={styles.alertText}>
                  <Text style={styles.alertBold}>[{activeAlert.severity} Alert]</Text> {activeAlert.message}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setActiveAlert(null)} style={styles.alertClose}>
                <MaterialIcons name="close" size={18} color="#6B7280" />
              </TouchableOpacity>
            </View>
          )}

          {/* Header Section */}
          <View>
            <Text style={styles.sectionLabel}>Operations Portal</Text>
            <Text style={styles.mainTitle}>Disaster Relief Management</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.broadcastButton}
              onPress={() => setShowBroadcastModal(true)}
            >
              <MaterialIcons name="add-alert" size={18} color={colors.onPrimary} />
              <Text style={styles.broadcastButtonText}>Broadcast Alert</Text>
            </TouchableOpacity>
          </View>

          {/* Map Section */}
          <View style={styles.mapCard}>
            <WebView
              source={{ uri: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d57201.27218685167!2d90.82823611394142!3d26.373111053151877!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3759a1c24aaa3a29%3A0x1bb2df4d8a1c97a4!2sKalgachia%2C%20Assam%20781319!5e0!3m2!1sen!2sin!4v1717430000000!5m2!1sen!2sin' }}
              style={styles.mapWebView}
              javaScriptEnabled={true}
              domStorageEnabled={true}
            />
            <View style={styles.mapOverlay}>
              <Text style={styles.mapOverlayTitle}>Kalgachia & Beki River Circle</Text>
              <Text style={styles.mapOverlaySubtitle}>3 Active Flood Relief camps</Text>
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabContainer}>
            <ToggleTab title="Affected Registry" />
            <ToggleTab title="Help Providers" />
            <ToggleTab title="Resource Inventory" />
          </View>

          {/* Tab Content */}
          <View style={styles.tabContent}>
            {activeTab === "Affected Registry" && (
              <View>
                <Text style={styles.tableTitle}>Affected Families Registry</Text>
                <View style={styles.tableHeader}>
                  <Text style={[styles.headerCell, styles.headerFamily]}>Family / Group</Text>
                  <Text style={[styles.headerCell, styles.headerLocation]}>Location</Text>
                  <Text style={[styles.headerCell, styles.headerSize]}>Family Size</Text>
                  <Text style={[styles.headerCell, styles.headerRequirement]}>         Aid Requirement</Text>
                  <Text style={[styles.headerCell, styles.headerStatus]}>Status</Text>
                </View>
                {affected.map((item) => (
                  <View key={item.id} style={styles.tableRow}>
                    <Text style={[styles.rowCell, styles.rowFamily]}>{item.family}</Text>
                    <Text style={[styles.rowCell, styles.rowLocation]} numberOfLines={2}>{item.location}</Text>
                    <Text style={[styles.rowCell, styles.rowSize]}>{item.size}</Text>
                    <Text style={[styles.rowCell, styles.rowRequirement]}>{item.requirement}</Text>
                    <View style={[styles.rowCell, styles.rowStatus]}>
                      <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
                        <Text style={styles.statusBadgeText}>{item.status}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {activeTab === "Help Providers" && (
              <View>
                <Text style={styles.tableTitle}>Help Providers & Responder Roster</Text>
                <View style={styles.providerHeader}>
                  <Text style={[styles.headerCell, styles.providerName]}>Responder Name</Text>
                  <Text style={[styles.headerCell, styles.providerType]}>Capability Type</Text>
                  <Text style={[styles.headerCell, styles.providerStatus]}>Status</Text>
                </View>
                {providers.map((item) => (
                  <View key={item.id} style={styles.tableRow}>
                    <Text style={[styles.rowCell, styles.providerNameCell]}>{item.name}</Text>
                    <Text style={[styles.rowCell, styles.providerTypeCell]}>{item.type}</Text>
                    <View style={[styles.rowCell, styles.providerStatusCell]}>
                      <View style={[styles.statusBadge, 
                        item.status === 'Active in Bartari Camp' ? styles.statusActive : 
                        item.status === 'Dispatched to Moinbari Char' ? styles.statusDispatched : 
                        styles.statusStandby]}>
                        <Text style={styles.statusBadgeText}>{item.status}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {activeTab === "Resource Inventory" && (
              <View>
                <Text style={styles.tableTitle}>Supply Stocks & Ledger</Text>
                <View style={styles.inventoryHeader}>
                  <Text style={[styles.headerCell, styles.inventoryItem]}>Supply Item</Text>
                  <Text style={[styles.headerCell, styles.inventoryStock]}>Stock</Text>
                  <Text style={[styles.headerCell, styles.inventoryStatus]}>Status</Text>
                </View>
                {inventory.map((item, idx) => (
                  <View key={idx} style={styles.tableRow}>
                    <Text style={[styles.rowCell, styles.inventoryItemCell]}>{item.item}</Text>
                    <Text style={[styles.rowCell, styles.inventoryStockCell]}>{item.stock} {item.unit}</Text>
                    <View style={[styles.rowCell, styles.inventoryStatusCell]}>
                      <View style={[styles.statusBadge, 
                        item.status === 'Optimal' ? styles.statusOptimal : 
                        item.status === 'Critical Shortage' ? styles.statusCritical : 
                        styles.statusRestock]}>
                        <Text style={styles.statusBadgeText}>{item.status}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Distribution Logs */}
          <View style={styles.logsCard}>
            <Text style={styles.logsTitle}>Relief Distribution Logs</Text>
            <Text style={styles.logsSubtitle}>Synced Realtime</Text>
            <View style={styles.timeline}>
              <View style={styles.timelineItem}>
                <View style={styles.timelineDotActive} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTime}>10:42 AM</Text>
                  <Text style={styles.timelineTitle}>500 Rice & Ration Kits Distributed</Text>
                  <Text style={styles.timelineDesc}>Bartari School Shelter, signed by Aisha Rahman.</Text>
                </View>
              </View>
              <View style={styles.timelineItem}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTime}>Yesterday</Text>
                  <Text style={styles.timelineTitle}>Water & Halogen Tablets Dispatched</Text>
                  <Text style={styles.timelineDesc}>Relief Convoy routed to Moinbari Char Embankment camp.</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Footer - Always visible at the bottom */}
          <Footer />
        </ScrollView>
      </SafeAreaView>

      {/* Broadcast Alert Modal */}
      <Modal
        visible={showBroadcastModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowBroadcastModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Broadcast Regional Emergency Alert</Text>
              <TouchableOpacity onPress={() => setShowBroadcastModal(false)}>
                <MaterialIcons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalForm}>
              <View>
                <Text style={styles.formLabel}>Emergency Message</Text>
                <TextInput
                  style={[styles.formInput, styles.textArea]}
                  placeholder="e.g. Beki River water levels rising. Residents in Bartari advised to move to school shelter."
                  placeholderTextColor="#9ca3af"
                  value={broadcastMsg}
                  onChangeText={setBroadcastMsg}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <View>
                <Text style={styles.formLabel}>Alert Severity</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={broadcastSeverity}
                    onValueChange={(itemValue) => setBroadcastSeverity(itemValue)}
                    style={styles.picker}
                  >
                    <Picker.Item label="Info Alert" value="Info" />
                    <Picker.Item label="Urgent Alert" value="Urgent" />
                    <Picker.Item label="Critical Broadcast" value="Critical" />
                  </Picker>
                </View>
              </View>

              <View style={styles.formButtons}>
                <TouchableOpacity
                  onPress={() => setShowBroadcastModal(false)}
                  style={styles.cancelButton}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleBroadcast} style={styles.submitButton}>
                  <Text style={styles.submitButtonText}>Broadcast Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { position: "absolute", width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.3)", zIndex: 5 },
  sidebar: { position: "absolute", width: width * 0.7, height: "100%", backgroundColor: "#fff", padding: 20, zIndex: 10, elevation: 10 },
  brandContainer: { flexDirection: "row", alignItems: "center", marginBottom: 30, marginTop: 50 },
  brandIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: "center", alignItems: "center", marginRight: 12 },
  brandTitle: { fontSize: 16, fontWeight: "700", color: "#065f46" },
  brandSub: { fontSize: 12, color: "#6b7280" },
  menuItem: { flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 10, borderRadius: 12, marginBottom: 10 },
  menuItemWithDropdown: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12, paddingHorizontal: 10, borderRadius: 12, marginBottom: 5 },
  menuItemLeft: { flexDirection: "row", alignItems: "center" },
  menuText: { marginLeft: 12, fontSize: 14, color: "#374151" },
  menuItemActive: { flexDirection: "row", alignItems: "center", backgroundColor: colors.primary, paddingVertical: 14, paddingHorizontal: 12, borderRadius: 30, marginBottom: 10, elevation: 3 },
  menuTextActive: { color: "#fff", marginLeft: 12, fontWeight: "600" },
  dropdownContainer: { marginLeft: 32, marginBottom: 8, borderLeftWidth: 1, borderLeftColor: "#e5e7eb", paddingLeft: 12 },
  dropdownItem: { flexDirection: "row", alignItems: "center", paddingVertical: 10, paddingHorizontal: 8 },
  dropdownText: { fontSize: 13, color: "#6b7280", marginLeft: 10 },
  container: { flex: 1, backgroundColor: colors.surface },
  header: { backgroundColor: 'rgba(255,255,255,0.95)', borderBottomWidth: 1, borderBottomColor: '#EDEEEF', paddingHorizontal: 20, paddingVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#111827' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconButton: { padding: 8 },
  avatar: { width: 32, height: 32, borderRadius: 16 },
  scrollContent: { padding: 20, paddingBottom: 20 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  backText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', color: '#64748b' },
  alertBanner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffdad6', padding: 12, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#ba1a1a30' },
  alertContent: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  alertText: { fontSize: 12, color: '#93000a', flex: 1 },
  alertBold: { fontWeight: 'bold' },
  alertClose: { padding: 4 },
  sectionLabel: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, color: colors.onSurfaceVariant, marginBottom: 4 },
  mainTitle: { fontSize: 32, fontWeight: 'bold', color: colors.onSurface, marginBottom: 20 },
  actionButtons: { marginBottom: 20 },
  broadcastButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, backgroundColor: colors.primary, borderRadius: 999, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  broadcastButtonText: { fontSize: 14, fontWeight: '600', color: colors.onPrimary },
  mapCard: { backgroundColor: '#F3F4F6', borderRadius: 16, height: 300, overflow: 'hidden', marginBottom: 20, position: 'relative' },
  mapWebView: { width: '100%', height: '100%' },
  mapOverlay: { position: 'absolute', top: 16, left: 16, backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  mapOverlayTitle: { fontSize: 11, fontWeight: 'bold', color: colors.onSurface },
  mapOverlaySubtitle: { fontSize: 10, color: colors.onSurfaceVariant, marginTop: 2 },
  tabContainer: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.outlineVariant, marginBottom: 16 },
  tab: { paddingVertical: 12, paddingHorizontal: 16, marginRight: 8 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: colors.primary },
  tabText: { fontSize: 13, fontWeight: '500', color: colors.onSurfaceVariant },
  tabTextActive: { color: colors.primary, fontWeight: '600' },
  tabContent: { backgroundColor: colors.surfaceContainerLowest, borderRadius: 16, padding: 16, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
  tableTitle: { fontSize: 16, fontWeight: '600', color: colors.onSurface, marginBottom: 16 },
  tableHeader: { flexDirection: 'row', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant, marginBottom: 12 },
  providerHeader: { flexDirection: 'row', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant, marginBottom: 12 },
  inventoryHeader: { flexDirection: 'row', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant, marginBottom: 12 },
  headerCell: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', color: colors.onSurfaceVariant },
  headerFamily: { flex: 1.5 },
  headerLocation: { flex: 1.8 },
  headerSize: { flex: 0.5, textAlign: 'center' },
  headerRequirement: { flex: 1.5 },
  headerStatus: { flex: 1, textAlign: 'right' },
  providerName: { flex: 1.5 },
  providerType: { flex: 1.5 },
  providerStatus: { flex: 1, textAlign: 'right' },
  inventoryItem: { flex: 1.8 },
  inventoryStock: { flex: 1 },
  inventoryStatus: { flex: 1, textAlign: 'right' },
  tableRow: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant, alignItems: 'center' },
  rowCell: { fontSize: 12, color: colors.onSurface },
  rowFamily: { flex: 1.5, fontWeight: '500' },
  rowLocation: { flex: 1.8 },
  rowSize: { flex: 0.5, textAlign: 'center' },
  rowRequirement: { flex: 1.5, fontSize: 10, color: colors.primary },
  rowStatus: { flex: 1, alignItems: 'flex-end' },
  providerNameCell: { flex: 1.5, fontWeight: '500' },
  providerTypeCell: { flex: 1.5 },
  providerStatusCell: { flex: 1, alignItems: 'flex-end' },
  inventoryItemCell: { flex: 1.8, fontWeight: '500' },
  inventoryStockCell: { flex: 1 },
  inventoryStatusCell: { flex: 1, alignItems: 'flex-end' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusBadgeText: { fontSize: 9, fontWeight: '600', textTransform: 'uppercase' },
  statusHighPriority: { backgroundColor: colors.errorContainer },
  statusCompleted: { backgroundColor: colors.primaryFixed },
  statusInProgress: { backgroundColor: colors.secondaryFixed },
  statusRestock: { backgroundColor: '#fef3c7' },
  statusOptimal: { backgroundColor: colors.primaryFixed },
  statusCritical: { backgroundColor: colors.errorContainer },
  statusActive: { backgroundColor: colors.primaryFixed },
  statusDispatched: { backgroundColor: colors.secondaryFixed },
  statusStandby: { backgroundColor: colors.surfaceContainerHighest },
  logsCard: { backgroundColor: colors.surfaceContainerLowest, borderRadius: 16, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
  logsTitle: { fontSize: 16, fontWeight: '600', color: colors.onSurface, marginBottom: 4 },
  logsSubtitle: { fontSize: 11, color: colors.onSurfaceVariant, marginBottom: 16 },
  timeline: { marginLeft: 8, gap: 20 },
  timelineItem: { flexDirection: 'row', gap: 12 },
  timelineDotActive: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary, marginTop: 4, borderWidth: 3, borderColor: colors.surfaceContainerLowest },
  timelineDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.surfaceContainerHighest, marginTop: 4, borderWidth: 3, borderColor: colors.surfaceContainerLowest },
  timelineContent: { flex: 1 },
  timelineTime: { fontSize: 10, fontWeight: 'bold', color: '#9ca3af', marginBottom: 2 },
  timelineTitle: { fontSize: 13, fontWeight: '600', color: colors.onSurface, marginBottom: 4 },
  timelineDesc: { fontSize: 11, color: colors.onSurfaceVariant },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: colors.onSurface },
  modalForm: { padding: 20, gap: 16 },
  formLabel: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4, color: colors.onSurfaceVariant, marginBottom: 6 },
  formInput: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: colors.onSurface, backgroundColor: '#ffffff' },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  pickerContainer: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, overflow: 'hidden' },
  picker: { height: 44 },
  formButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, paddingTop: 16 },
  cancelButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, borderWidth: 1, borderColor: '#d1d5db' },
  cancelButtonText: { color: colors.onSurface },
  submitButton: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 999, backgroundColor: colors.primary },
  submitButtonText: { color: 'white', fontWeight: '600' },
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