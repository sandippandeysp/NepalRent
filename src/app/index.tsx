import { router } from "expo-router";
import { useEffect, useState } from "react";
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
  const [gender, setGender] = useState("Male");
  const [userRole, setUserRole] = useState("Tenant");

  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // User already logged in cha bhane direct '/home' ma pathaune
    checkUserSession();
  }, []);

  async function checkUserSession() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      router.replace("/home");
    } else {
      setCheckingAuth(false);
    }
  }

  async function handleAuth() {
    if (!email || !password) {
      Alert.alert("Truti", "Kripaya email ra password rakhnuhos!");
      return;
    }

    setLoading(true);

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, gender, role: userRole },
        },
      });

      if (error) {
        Alert.alert("Sign Up Asafal Bhayo", error.message);
      } else {
        Alert.alert("Safal Bhayo!", "Khata banyo!");
        router.replace("/home");
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        Alert.alert("Login Asafal Bhayo", error.message);
      } else {
        router.replace("/home");
      }
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Nepal Rent 🏠</Text>
        <Text style={styles.subtitle}>
          {isSignUp
            ? "Naya Khata Bananuhos (Sign Up)"
            : "Login Garnuhos (Log In)"}
        </Text>

        {isSignUp && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Pura Naam (Full Name)"
              placeholderTextColor="#888"
              value={fullName}
              onChangeText={setFullName}
            />

            <Text style={styles.label}>Tapai ko hunuhunchha?</Text>
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
                  Bhadut (Tenant)
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
                  Gharbeti (Landlord)
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Ling (Gender):</Text>
            <View style={styles.row}>
              {[
                { label: "Purush", val: "Male" },
                { label: "Mahila", val: "Female" },
                { label: "Anya", val: "Other" },
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
          placeholder="Email Address"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
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
              ? "Prakriya hundai chha..."
              : isSignUp
                ? "Sign Up Garnuhos"
                : "Login Garnuhos"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.switchContainer}
          onPress={() => setIsSignUp(!isSignUp)}
        >
          <Text style={styles.switchText}>
            {isSignUp
              ? "Pahilai khata chha? Login garnuhos"
              : "Khata chaina? Naya Sign Up garnuhos"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#f4f6f8",
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "100%",
    maxWidth: 500,
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 15,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#007AFF",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
    marginTop: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#444",
    marginBottom: 8,
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
  input: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    marginBottom: 12,
    color: "#333",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  switchContainer: {
    marginTop: 15,
    alignItems: "center",
  },
  switchText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "500",
  },
});
