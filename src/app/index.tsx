import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "./supabase";

export default function AuthScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState("Male"); // Default Gender: Male
  const [userRole, setUserRole] = useState("Tenant"); // Default Role: Tenant

  // OTP State
  const [otp, setOtp] = useState("");
  const [showOtpScreen, setShowOtpScreen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // युजर पहिल्यै लगइन छ कि छैन जाँच गर्ने
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUser(user);
      setCheckingAuth(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser(session.user);
        } else {
          setUser(null);
        }
        setCheckingAuth(false);
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // इमेल जाँच गर्ने Validation Regex
  const validateEmail = (emailStr: string) => {
    const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return reg.test(emailStr);
  };

  // लगआउट गर्ने फङ्सन
  async function handleSignOut() {
    await supabase.auth.signOut();
    Alert.alert("लगआउट", "सफलतापूर्वक लगआउट भयो!");
  }

  // १. Sign Up र Log In Handle गर्ने फङ्सन
  async function handleAuth() {
    if (!email || !password) {
      Alert.alert("त्रुटि", "कृपया इमेल र पासवर्ड राख्नुहोस्!");
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert("गलत इमेल", "कृपया सही इमेल ठेगाना राख्नुहोस्!");
      return;
    }

    if (isSignUp && (!fullName || !gender || !userRole)) {
      Alert.alert(
        "अपुरो जानकारी",
        "कृपया नाम, लिङ्ग र युजर टाइप सबै छान्नुहोस्!",
      );
      return;
    }

    setLoading(true);

    if (isSignUp) {
      // Supabase मा Role, Name, Gender Metadata सहित Sign Up गर्ने
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: fullName,
            gender: gender,
            role: userRole, // 'Landlord' वा 'Tenant'
          },
        },
      });

      if (error) {
        Alert.alert("साइन अप असफल भयो", error.message);
      } else {
        Alert.alert(
          "OTP पठाइयो!",
          "कृपया आफ्नो इमेल चेक गरेर 6-digit OTP हाल्नुहोस्।",
        );
        setShowOtpScreen(true);
      }
    } else {
      // Log In गर्ने
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        Alert.alert("लगइन असफल भयो", error.message);
      } else {
        Alert.alert("स्वागत छ!", "सफलतापूर्वक लगइन भयो!");
      }
    }

    setLoading(false);
  }

  // २. OTP Verify गर्ने फङ्सन
  async function handleVerifyOtp() {
    if (!otp) {
      Alert.alert("त्रुटि", "कृपया ६-अङ्कको OTP कोड राख्नुहोस्!");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.verifyOtp({
      email: email,
      token: otp,
      type: "signup",
    });

    if (error) {
      Alert.alert("सत्यापन असफल भयो", error.message);
    } else {
      Alert.alert("सफल भयो!", "तपाईंको खाता सफलतापूर्वक भेरिफाई भयो!");
      setShowOtpScreen(false);
    }

    setLoading(false);
  }

  if (checkingAuth) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // यदि युजर लगइन छ भने प्रोफाइल स्क्रिन देखाउने
  if (user) {
    const userMeta = user.user_metadata || {};
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Nepal Rent</Text>
          <Text style={styles.subtitle}>तपाईं सफलतापूर्वक लगइन हुनुहुन्छ!</Text>

          <View style={styles.profileBox}>
            <Text style={styles.userInfo}>इमेल: {user.email}</Text>
            {userMeta.full_name && (
              <Text style={styles.userInfo}>नाम: {userMeta.full_name}</Text>
            )}
            {userMeta.role && (
              <Text style={styles.userInfo}>
                प्रकार:{" "}
                {userMeta.role === "Landlord"
                  ? "घरबेटी (Landlord)"
                  : "भाडामा बस्ने (Tenant)"}
              </Text>
            )}
            {userMeta.gender && (
              <Text style={styles.userInfo}>
                लिङ्ग:{" "}
                {userMeta.gender === "Male"
                  ? "पुरुष"
                  : userMeta.gender === "Female"
                    ? "महिला"
                    : "अन्य"}
              </Text>
            )}
          </View>

          <TouchableOpacity style={styles.buttonDanger} onPress={handleSignOut}>
            <Text style={styles.buttonText}>लगआउट (Log Out)</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // OTP Verify गर्ने स्क्रिन
  if (showOtpScreen) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Nepal Rent</Text>
          <Text style={styles.subtitle}>{email} मा पठाइएको OTP हाल्नुहोस्</Text>

          <TextInput
            style={styles.input}
            placeholder="६-अङ्कको OTP कोड"
            placeholderTextColor="#888"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleVerifyOtp}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "भेरिफाई हुँदैछ..." : "OTP भेरिफाई गर्नुहोस्"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchContainer}
            onPress={() => setShowOtpScreen(false)}
          >
            <Text style={styles.switchText}>साइन अप फारममा फर्कनुहोस्</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // मुख्य लगइन र साइन अप फारम
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Nepal Rent</Text>
        <Text style={styles.subtitle}>
          {isSignUp ? "नयाँ खाता बनाउनुहोस् (Sign Up)" : "स्वागत छ (Log In)"}
        </Text>

        {isSignUp && (
          <>
            <TextInput
              style={styles.input}
              placeholder="पुरा नाम (Full Name)"
              placeholderTextColor="#888"
              value={fullName}
              onChangeText={setFullName}
            />

            {/* Role Selection */}
            <Text style={styles.label}>तपाईं को हुनुहुन्छ?</Text>
            <View style={styles.row}>
              <TouchableOpacity
                style={[
                  styles.chip,
                  userRole === "Tenant" && styles.chipActive,
                ]}
                onPress={() => setUserRole("Tenant")}
              >
                <Text
                  style={[
                    styles.chipText,
                    userRole === "Tenant" && styles.chipTextActive,
                  ]}
                >
                  भाडामा बस्ने (Tenant)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.chip,
                  userRole === "Landlord" && styles.chipActive,
                ]}
                onPress={() => setUserRole("Landlord")}
              >
                <Text
                  style={[
                    styles.chipText,
                    userRole === "Landlord" && styles.chipTextActive,
                  ]}
                >
                  घरबेटी (Landlord)
                </Text>
              </TouchableOpacity>
            </View>

            {/* Gender Selection */}
            <Text style={styles.label}>लिङ्ग (Gender):</Text>
            <View style={styles.row}>
              {[
                { label: "पुरुष", val: "Male" },
                { label: "महिला", val: "Female" },
                { label: "अन्य", val: "Other" },
              ].map((g) => (
                <TouchableOpacity
                  key={g.val}
                  style={[styles.chip, gender === g.val && styles.chipActive]}
                  onPress={() => setGender(g.val)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      gender === g.val && styles.chipTextActive,
                    ]}
                  >
                    {g.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <TextInput
          style={styles.input}
          placeholder="इमेल (Email)"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="पासवर्ड (Password)"
          placeholderTextColor="#888"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleAuth}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading
              ? "प्रक्रिया हुँदैछ..."
              : isSignUp
                ? "साइन अप गर्नुहोस्"
                : "लगइन गर्नुहोस्"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.switchContainer}
          onPress={() => setIsSignUp(!isSignUp)}
        >
          <Text style={styles.switchText}>
            {isSignUp
              ? "पहिल्यै खाता छ? लगइन गर्नुहोस्"
              : "खाता छैन? नयाँ साइन अप गर्नुहोस्"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f6f8",
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#ffffff",
    padding: 25,
    borderRadius: 15,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#007AFF",
    textAlign: "center",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#444",
    marginBottom: 8,
    marginTop: 5,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  chip: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 3,
    backgroundColor: "#fff",
  },
  chipActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  chipText: {
    fontSize: 12,
    color: "#333",
  },
  chipTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },
  profileBox: {
    backgroundColor: "#f0f4f8",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  userInfo: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    marginBottom: 15,
    color: "#333",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonDanger: {
    backgroundColor: "#FF3B30",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  switchContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  switchText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "500",
  },
});
