import { useToast } from "@/context/ToastContext";
import { authenticateLocalUser } from "@/lib/authStorage";
import { useAuth } from "@/lib/useAuth";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";

const { width, height } = Dimensions.get("window");

export default function LoginPage() {
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  const [identifier, setIdentifier] = useState("admin@amanfoundation.org");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const [identifierError, setIdentifierError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const toast = useToast();
  const router = useRouter();

  // ============================================
  // VALIDATION
  // ============================================
  const validate = () => {
    let isValid = true;
    setIdentifierError("");
    setPasswordError("");
    setFormError("");

    if (!identifier.trim()) {
      setIdentifierError("Email or username is required");
      isValid = false;
    }

    if (!password) {
      setPasswordError("Password is required");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      isValid = false;
    }

    return isValid;
  };

  // ============================================
  // LOGIN HANDLER
  // ============================================
  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    setFormError("");

    try {
      const result = await authenticateLocalUser(identifier.trim(), password);

      if (!result) {
        throw new Error("Invalid email/username or password");
      }

      toast.success("Welcome back!");
      await login(result.user, result.token);
      router.replace("/");
    } catch (err: any) {
      console.error("Login error:", err);
      setFormError(err.message || "Unable to sign in locally.");
      toast.error(err.message || "Unable to sign in locally.");
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ===== BRAND PANEL ===== */}
          <LinearGradient
            colors={["#0d9488", "#0f766e"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.brandPanel}
          >
            <View style={styles.brandInner}>
              <View style={styles.brandLogo}>
                <View style={styles.logoIcon}>
                  <Icon name="dashboard" size={24} color="#fff" />
                </View>
                <View>
                  <Text style={styles.brandName}>Aman Foundation</Text>
                  <Text style={styles.brandSubtitle}>Impact Portal</Text>
                </View>
              </View>

              <View style={styles.brandHero}>
                <Text style={styles.brandHeadline}>
                  Measuring Impact,{"\n"}Driving Change.
                </Text>
                <Text style={styles.brandDesc}>
                  Access your real-time impact data across Education,
                  Livelihood, and Disaster Relief programs.
                </Text>
              </View>

              <View style={styles.brandDecoration}>
                <View style={styles.decorationCircle1} />
                <View style={styles.decorationCircle2} />
              </View>
            </View>
          </LinearGradient>

          {/* ===== FORM PANEL ===== */}
          <View style={styles.formPanel}>
            <View style={styles.formInner}>
              {/* Header */}
              <View style={styles.formHeader}>
                <Text style={styles.formTitle}>Welcome back</Text>
                <Text style={styles.formSubtitle}>
                  Sign in to your Impact Portal account
                </Text>
              </View>

              {/* Local-only sign in info */}
              <View style={styles.debugContainer}>
                <Text style={styles.debugText}>
                  🔐 This sign-in uses your device storage only.
                </Text>
              </View>

              {/* Error Message */}
              {formError ? (
                <View style={styles.errorContainer}>
                  <Icon name="error-outline" size={16} color="#ef4444" />
                  <Text style={styles.errorText}>{formError}</Text>
                  <TouchableOpacity onPress={() => setFormError("")}>
                    <Icon name="close" size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ) : null}

              {/* Form */}
              <View style={styles.form}>
                {/* Email or Username */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Email or Username</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      identifierError ? styles.inputError : null,
                    ]}
                  >
                    <Icon
                      name="person"
                      size={20}
                      color="#94a3b8"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter email or username"
                      placeholderTextColor="#94a3b8"
                      value={identifier}
                      onChangeText={(text) => {
                        setIdentifier(text);
                        if (identifierError) setIdentifierError("");
                      }}
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="username"
                      returnKeyType="next"
                      editable={!loading}
                    />
                    {identifierError ? (
                      <Icon name="error" size={20} color="#ef4444" />
                    ) : null}
                  </View>
                  {identifierError ? (
                    <Text style={styles.fieldError}>{identifierError}</Text>
                  ) : null}
                </View>

                {/* Password */}
                <View style={styles.formGroup}>
                  <View style={styles.labelRow}>
                    <Text style={styles.label}>Password</Text>
                    <TouchableOpacity
                      onPress={() => {
                        toast.success("Password reset will be available soon.");
                      }}
                      disabled={loading}
                    >
                      <Text style={styles.forgotLink}>Forgot password?</Text>
                    </TouchableOpacity>
                  </View>
                  <View
                    style={[
                      styles.inputWrapper,
                      passwordError ? styles.inputError : null,
                    ]}
                  >
                    <Icon
                      name="lock"
                      size={20}
                      color="#94a3b8"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your password"
                      placeholderTextColor="#94a3b8"
                      value={password}
                      onChangeText={(text) => {
                        setPassword(text);
                        if (passwordError) setPasswordError("");
                      }}
                      secureTextEntry={!showPassword}
                      autoComplete="password"
                      returnKeyType="done"
                      editable={!loading}
                      onSubmitEditing={handleLogin}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      <Icon
                        name={showPassword ? "visibility-off" : "visibility"}
                        size={20}
                        color="#94a3b8"
                      />
                    </TouchableOpacity>
                  </View>
                  {passwordError ? (
                    <Text style={styles.fieldError}>{passwordError}</Text>
                  ) : null}
                </View>

                {/* Remember Me */}
                <View style={styles.formOptions}>
                  <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={() => setRemember(!remember)}
                    disabled={loading}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        remember ? styles.checkboxChecked : null,
                      ]}
                    >
                      {remember ? (
                        <Icon name="check" size={14} color="#fff" />
                      ) : null}
                    </View>
                    <Text style={styles.checkboxLabel}>Keep me signed in</Text>
                  </TouchableOpacity>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  style={[
                    styles.btnPrimary,
                    loading ? styles.btnDisabled : null,
                  ]}
                  onPress={handleLogin}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color="#fff" />
                      <Text style={styles.btnPrimaryText}>Signing in...</Text>
                    </View>
                  ) : (
                    <Text style={styles.btnPrimaryText}>Sign In</Text>
                  )}
                </TouchableOpacity>

                {/* Divider */}
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Register Button */}
                <TouchableOpacity
                  style={styles.btnSecondary}
                  onPress={() => router.push("/registration")}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <Text style={styles.btnSecondaryText}>
                    Create a new account
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Footer */}
              <Text style={styles.formFooter}>
                Need access? Contact your{" "}
                <Text style={styles.footerLink}>system administrator</Text>.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
  },
  brandPanel: {
    padding: 30,
    paddingTop: Platform.OS === "ios" ? 40 : 30,
    paddingBottom: 40,
    minHeight: height * 0.35,
  },
  brandInner: {
    flex: 1,
    justifyContent: "space-between",
  },
  brandLogo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logoIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  brandName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255,255,255,0.7)",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  brandHero: {
    marginTop: 20,
  },
  brandHeadline: {
    fontSize: 32,
    fontWeight: "700",
    color: "#ffffff",
    lineHeight: 40,
    marginBottom: 12,
  },
  brandDesc: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    lineHeight: 22,
    maxWidth: "90%",
  },
  brandDecoration: {
    position: "absolute",
    right: -40,
    bottom: -40,
    width: 200,
    height: 200,
    opacity: 0.1,
  },
  decorationCircle1: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#ffffff",
    right: 0,
    bottom: 0,
  },
  decorationCircle2: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#ffffff",
    right: 40,
    bottom: 40,
  },
  formPanel: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  formInner: {
    flex: 1,
  },
  formHeader: {
    marginBottom: 28,
  },
  formTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 14,
    color: "#64748b",
  },
  debugContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f1f5f9",
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  debugText: {
    fontSize: 10,
    color: "#64748b",
    flex: 1,
  },
  testButton: {
    backgroundColor: "#0d9488",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  testButtonText: {
    fontSize: 11,
    color: "#ffffff",
    fontWeight: "500",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 14,
    backgroundColor: "#fef2f2",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fecaca",
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    color: "#ef4444",
    fontWeight: "500",
    flex: 1,
  },
  form: {
    gap: 18,
  },
  formGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  forgotLink: {
    fontSize: 13,
    color: "#0d9488",
    fontWeight: "500",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
  },
  inputError: {
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#1e293b",
    paddingVertical: 0,
    height: 52,
  },
  fieldError: {
    fontSize: 12,
    color: "#ef4444",
    marginTop: 4,
  },
  formOptions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#cbd5e1",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#0d9488",
    borderColor: "#0d9488",
  },
  checkboxLabel: {
    fontSize: 14,
    color: "#475569",
  },
  btnPrimary: {
    backgroundColor: "#0d9488",
    borderRadius: 12,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
    shadowColor: "#0d9488",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  btnDisabled: {
    opacity: 0.6,
    shadowOpacity: 0,
    elevation: 0,
  },
  btnPrimaryText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e2e8f0",
  },
  dividerText: {
    fontSize: 12,
    color: "#94a3b8",
    textTransform: "uppercase",
    fontWeight: "500",
  },
  btnSecondary: {
    backgroundColor: "transparent",
    borderRadius: 12,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
  },
  btnSecondaryText: {
    color: "#1e293b",
    fontSize: 15,
    fontWeight: "500",
  },
  formFooter: {
    fontSize: 12,
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 24,
    lineHeight: 18,
  },
  footerLink: {
    color: "#0d9488",
    fontWeight: "600",
  },
});
