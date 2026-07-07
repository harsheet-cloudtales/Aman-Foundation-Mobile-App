import { useRouter } from "expo-router";
import React from "react";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

export default function LeavesPage() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerCard}>
          <Icon name="event-note" size={40} color="#0f766e" />
          <Text style={styles.title}>Leave Management</Text>
          <Text style={styles.subtitle}>
            Apply for leave and track recent requests from one place.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick actions</Text>
          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Apply for leave</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.secondaryButtonText}>Back to dashboard</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recent requests</Text>
          <View style={styles.rowItem}>
            <View>
              <Text style={styles.rowTitle}>Medical leave</Text>
              <Text style={styles.rowSubtitle}>Approved • 2 days</Text>
            </View>
            <Text style={styles.statusApproved}>Approved</Text>
          </View>
          <View style={styles.rowItem}>
            <View>
              <Text style={styles.rowTitle}>Training day</Text>
              <Text style={styles.rowSubtitle}>Pending review</Text>
            </View>
            <Text style={styles.statusPending}>Pending</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f7f7",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  headerCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    marginTop: 12,
    fontSize: 22,
    fontWeight: "700",
    color: "#0f172a",
  },
  subtitle: {
    marginTop: 8,
    color: "#64748b",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: "#0f766e",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "700",
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#334155",
    fontWeight: "600",
  },
  rowItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 10,
    marginTop: 10,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0f172a",
  },
  rowSubtitle: {
    marginTop: 2,
    color: "#64748b",
  },
  statusApproved: {
    color: "#047857",
    fontWeight: "700",
  },
  statusPending: {
    color: "#b45309",
    fontWeight: "700",
  },
});
