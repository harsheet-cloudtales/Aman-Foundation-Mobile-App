import { useToast } from "@/context/ToastContext";
import { registerLocalUser } from "@/lib/authStorage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type DimensionValue,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";

const API_URL = "https://main.d1mnwey66nth5p.amplifyapp.com";

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [roleId, setRoleId] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [roleError, setRoleError] = useState("");
  const [formError, setFormError] = useState("");

  const [strengthWidth, setStrengthWidth] = useState("0%");
  const [strengthColor, setStrengthColor] = useState("#ff5252");
  const [strengthText, setStrengthText] = useState("");

  const toast = useToast();
  const router = useRouter();

  const roles = [
    { id: "cm0v1a2b3c4d5e6f7g8h9i0j1", name: "Fellow" },
    { id: "cm0v1a2b3c4d5e6f7g8h9i0j2", name: "Program Manager" },
  ];

  useEffect(() => {
    if (!password) {
      setStrengthWidth("0%");
      setStrengthText("");
      return;
    }

    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;

    if (score <= 1) {
      setStrengthWidth("33%");
      setStrengthColor("#ef4444");
      setStrengthText("Weak");
    } else if (score === 2 || score === 3) {
      setStrengthWidth("66%");
      setStrengthColor("#f59e0b");
      setStrengthText("Medium");
    } else {
      setStrengthWidth("100%");
      setStrengthColor("#10b981");
      setStrengthText("Strong");
    }
  }, [password]);

  const validate = () => {
    let isValid = true;
    setFirstNameError("");
    setLastNameError("");
    setEmailError("");
    setMobileError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setRoleError("");
    setFormError("");

    if (!firstName.trim()) {
      setFirstNameError("First name is required");
      isValid = false;
    } else if (firstName.trim().length < 2) {
      setFirstNameError("First name must be at least 2 characters");
      isValid = false;
    }

    if (!lastName.trim()) {
      setLastNameError("Last name is required");
      isValid = false;
    } else if (lastName.trim().length < 2) {
      setLastNameError("Last name must be at least 2 characters");
      isValid = false;
    }

    if (!email) {
      setEmailError("Email is required");
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Please enter a valid email address");
      isValid = false;
    }

    if (!mobile) {
      setMobileError("Mobile number is required");
      isValid = false;
    } else if (!/^[0-9]{10}$/.test(mobile)) {
      setMobileError("Please enter a valid 10-digit mobile number");
      isValid = false;
    }

    if (!password) {
      setPasswordError("Password is required");
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      isValid = false;
    }

    if (!confirmPassword) {
      setConfirmPasswordError("Please confirm your password");
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      isValid = false;
    }

    if (!roleId) {
      setRoleError("Please select a role");
      isValid = false;
    }

    if (!agreeToTerms) {
      setFormError("Please agree to the Terms & Conditions");
      isValid = false;
    }

    return isValid;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setLoading(true);
    setFormError("");

    try {
      const selectedRole = roles.find((item) => item.id === roleId);

      await registerLocalUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        mobile: mobile.trim(),
        password,
        roleId,
        roleName: selectedRole?.name,
      });

      toast.success("Registration successful! You can sign in now.");
      setShowSuccessModal(true);

      setTimeout(() => {
        setShowSuccessModal(false);
        router.push("/login");
      }, 2500);
    } catch (err: any) {
      setFormError(err.message || "Unable to save your account locally.");
      toast.error(err.message || "Unable to save your account locally.");
    } finally {
      setLoading(false);
    }
  };

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
          <LinearGradient
            colors={["#0f766e", "#0d9488"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <View style={styles.heroTopRow}>
              <View style={styles.brandBadge}>
                <Icon name="dashboard" size={22} color="#fff" />
              </View>
              <View>
                <Text style={styles.brandName}>Aman Foundation</Text>
                <Text style={styles.brandSubtitle}>Impact Portal</Text>
              </View>
            </View>

            <Text style={styles.heroTitle}>Create your account</Text>
            <Text style={styles.heroText}>
              Join the portal to access education, livelihood, and disaster
              relief programs.
            </Text>
          </LinearGradient>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Register</Text>
            <Text style={styles.cardSubtitle}>
              Fill in your details to request access.
            </Text>

            {formError ? (
              <View style={styles.errorBox}>
                <Icon name="error-outline" size={16} color="#ef4444" />
                <Text style={styles.errorText}>{formError}</Text>
                <TouchableOpacity onPress={() => setFormError("")}>
                  <Icon name="close" size={16} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ) : null}

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>First name</Text>
              <View
                style={[
                  styles.inputWrapper,
                  firstNameError ? styles.inputError : null,
                ]}
              >
                <Icon
                  name="person"
                  size={18}
                  color="#64748b"
                  style={styles.inputIcon}
                />
                <TextInput
                  value={firstName}
                  onChangeText={(text) => {
                    setFirstName(text);
                    if (firstNameError) setFirstNameError("");
                  }}
                  placeholder="Enter first name"
                  placeholderTextColor="#94a3b8"
                  autoCapitalize="words"
                  style={styles.input}
                  editable={!loading}
                />
              </View>
              {firstNameError ? (
                <Text style={styles.fieldError}>{firstNameError}</Text>
              ) : null}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Last name</Text>
              <View
                style={[
                  styles.inputWrapper,
                  lastNameError ? styles.inputError : null,
                ]}
              >
                <Icon
                  name="person-outline"
                  size={18}
                  color="#64748b"
                  style={styles.inputIcon}
                />
                <TextInput
                  value={lastName}
                  onChangeText={(text) => {
                    setLastName(text);
                    if (lastNameError) setLastNameError("");
                  }}
                  placeholder="Enter last name"
                  placeholderTextColor="#94a3b8"
                  autoCapitalize="words"
                  style={styles.input}
                  editable={!loading}
                />
              </View>
              {lastNameError ? (
                <Text style={styles.fieldError}>{lastNameError}</Text>
              ) : null}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email address</Text>
              <View
                style={[
                  styles.inputWrapper,
                  emailError ? styles.inputError : null,
                ]}
              >
                <Icon
                  name="email"
                  size={18}
                  color="#64748b"
                  style={styles.inputIcon}
                />
                <TextInput
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (emailError) setEmailError("");
                  }}
                  placeholder="you@amanfoundation.org"
                  placeholderTextColor="#94a3b8"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                  style={styles.input}
                  editable={!loading}
                />
              </View>
              {emailError ? (
                <Text style={styles.fieldError}>{emailError}</Text>
              ) : null}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Mobile number</Text>
              <View
                style={[
                  styles.inputWrapper,
                  mobileError ? styles.inputError : null,
                ]}
              >
                <Icon
                  name="phone"
                  size={18}
                  color="#64748b"
                  style={styles.inputIcon}
                />
                <TextInput
                  value={mobile}
                  onChangeText={(text) => {
                    const cleaned = text.replace(/[^0-9]/g, "");
                    setMobile(cleaned);
                    if (mobileError) setMobileError("");
                  }}
                  placeholder="10-digit mobile number"
                  placeholderTextColor="#94a3b8"
                  keyboardType="phone-pad"
                  maxLength={10}
                  style={styles.input}
                  editable={!loading}
                />
              </View>
              {mobileError ? (
                <Text style={styles.fieldError}>{mobileError}</Text>
              ) : null}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password</Text>
              <View
                style={[
                  styles.inputWrapper,
                  passwordError ? styles.inputError : null,
                ]}
              >
                <Icon
                  name="lock"
                  size={18}
                  color="#64748b"
                  style={styles.inputIcon}
                />
                <TextInput
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (passwordError) setPasswordError("");
                  }}
                  placeholder="Create a password"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry={!showPassword}
                  style={styles.input}
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  <Icon
                    name={showPassword ? "visibility-off" : "visibility"}
                    size={20}
                    color="#64748b"
                  />
                </TouchableOpacity>
              </View>
              {password ? (
                <View style={styles.strengthRow}>
                  <View style={styles.strengthTrack}>
                    <View
                      style={[
                        styles.strengthFill,
                        {
                          width: strengthWidth as DimensionValue,
                          backgroundColor: strengthColor,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.strengthText, { color: strengthColor }]}>
                    {strengthText}
                  </Text>
                </View>
              ) : null}
              {passwordError ? (
                <Text style={styles.fieldError}>{passwordError}</Text>
              ) : null}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Confirm password</Text>
              <View
                style={[
                  styles.inputWrapper,
                  confirmPasswordError ? styles.inputError : null,
                ]}
              >
                <Icon
                  name="lock-outline"
                  size={18}
                  color="#64748b"
                  style={styles.inputIcon}
                />
                <TextInput
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (confirmPasswordError) setConfirmPasswordError("");
                  }}
                  placeholder="Re-enter password"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry={!showConfirmPassword}
                  style={styles.input}
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  <Icon
                    name={showConfirmPassword ? "visibility-off" : "visibility"}
                    size={20}
                    color="#64748b"
                  />
                </TouchableOpacity>
              </View>
              {confirmPasswordError ? (
                <Text style={styles.fieldError}>{confirmPasswordError}</Text>
              ) : null}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Select your role</Text>
              <View style={styles.roleRow}>
                {roles.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.roleButton,
                      roleId === item.id && styles.roleButtonActive,
                    ]}
                    onPress={() => {
                      setRoleId(item.id);
                      if (roleError) setRoleError("");
                    }}
                    disabled={loading}
                  >
                    <Text
                      style={[
                        styles.roleButtonText,
                        roleId === item.id && styles.roleButtonTextActive,
                      ]}
                    >
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {roleError ? (
                <Text style={styles.fieldError}>{roleError}</Text>
              ) : null}
            </View>

            <TouchableOpacity
              style={styles.termsRow}
              onPress={() => setAgreeToTerms(!agreeToTerms)}
              disabled={loading}
            >
              <View
                style={[
                  styles.checkbox,
                  agreeToTerms && styles.checkboxChecked,
                ]}
              >
                {agreeToTerms ? (
                  <Icon name="check" size={14} color="#fff" />
                ) : null}
              </View>
              <Text style={styles.termsText}>
                I agree to the{" "}
                <Text style={styles.termsLink}>Terms & Conditions</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.primaryButton,
                loading && styles.primaryButtonDisabled,
              ]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.primaryButtonText}>Creating...</Text>
                </View>
              ) : (
                <Text style={styles.primaryButtonText}>Create account</Text>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push("/login")}
            >
              <Text style={styles.secondaryButtonText}>
                Already have an account? Sign in
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {showSuccessModal ? (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Icon name="check-circle" size={48} color="#10b981" />
            <Text style={styles.modalTitle}>Request submitted</Text>
            <Text style={styles.modalText}>
              Your account request is pending approval. You will be redirected
              to sign in shortly.
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setShowSuccessModal(false);
                router.push("/login");
              }}
            >
              <Text style={styles.modalButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
  },
  hero: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 36,
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  brandBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  brandName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  brandSubtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  heroTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
  },
  heroText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 320,
  },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 18,
    marginTop: -16,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 16,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  errorText: {
    flex: 1,
    color: "#b91c1c",
    fontSize: 13,
    marginLeft: 8,
  },
  fieldGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  inputError: {
    borderColor: "#ef4444",
    backgroundColor: "#fff1f2",
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#0f172a",
    paddingVertical: 0,
    height: 48,
  },
  fieldError: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: 4,
  },
  strengthRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  strengthTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#e2e8f0",
    overflow: "hidden",
    marginRight: 8,
  },
  strengthFill: {
    height: "100%",
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: "600",
  },
  roleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 2,
  },
  roleButton: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginRight: 8,
    marginBottom: 8,
  },
  roleButtonActive: {
    backgroundColor: "#0d9488",
    borderColor: "#0d9488",
  },
  roleButtonText: {
    color: "#475569",
    fontSize: 13,
    fontWeight: "600",
  },
  roleButtonTextActive: {
    color: "#fff",
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#cbd5e1",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: "#0d9488",
    borderColor: "#0d9488",
  },
  termsText: {
    flex: 1,
    color: "#475569",
    fontSize: 13,
  },
  termsLink: {
    color: "#0d9488",
    fontWeight: "600",
  },
  primaryButton: {
    backgroundColor: "#0d9488",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e2e8f0",
  },
  dividerText: {
    color: "#94a3b8",
    fontSize: 12,
    marginHorizontal: 10,
    textTransform: "uppercase",
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  secondaryButtonText: {
    color: "#0f172a",
    fontSize: 14,
    fontWeight: "600",
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(2, 6, 23, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 24,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
    marginTop: 12,
    marginBottom: 8,
  },
  modalText: {
    color: "#64748b",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16,
  },
  modalButton: {
    width: "100%",
    backgroundColor: "#0d9488",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});
