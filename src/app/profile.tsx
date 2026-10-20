import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import Navbar from "../components/Navbar"; // सहि पाथ
import { supabase } from "./supabase";

export default function ProfileScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [user, setUser] = useState<any>(null);
  const [myProperties, setMyProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, []);

  async function loadUserProfile() {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.replace("/");
      return;
    }
    setUser(user);

    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      Alert.alert("त्रुटि", error.message);
    } else {
      setMyProperties(data || []);
    }
    setLoading(false);
  }

  async function handleDelete(id: number) {
    Alert.alert("पुष्टि गर्नुहोस्", "के तपाईं यो पोष्ट हटाउन चाहनुहुन्छ?", [
      { text: "रद्द गर्नुहोस्", style: "cancel" },
      {
        text: "हटाउनुहोस्",
        style: "destructive",
        onPress: async () => {
          const { error } = await supabase
            .from("properties")
            .delete()
            .eq("id", id);
          if (error) {
            Alert.alert("त्रुटि", error.message);
          } else {
            setMyProperties(myProperties.filter((item) => item.id !== id));
            Alert.alert("सफल भयो", "पोष्ट हटाइयो।");
          }
        },
      },
    ]);
  }

  const userMeta = user?.user_metadata || {};

  return (
    <View style={styles.mainWrapper}>
      {isDesktop && <Navbar />}

      <ScrollView contentContainerStyle={styles.container}>
        <View style={[styles.card, { maxWidth: isDesktop ? 900 : 500 }]}>
          <Text style={styles.title}>👤 मेरो प्रोफाइल (Profile)</Text>
          <Text style={styles.infoText}>
            नाम: {userMeta.full_name || "N/A"}
          </Text>
          <Text style={styles.infoText}>इमेल: {user?.email}</Text>
          <Text style={styles.roleBadge}>
            भूमिका:{" "}
            {userMeta.role === "Landlord"
              ? "घरबेटी / सामान धनी"
              : "भाडामा लिने"}
          </Text>

          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => router.push("/add-property")}
          >
            <Text style={styles.addBtnText}>
              ➕ नयाँ सामान / कोठा भाडामा राख्नुहोस्
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.card,
            { maxWidth: isDesktop ? 900 : 500, marginTop: 16 },
          ]}
        >
          <Text style={styles.sectionTitle}>
            📦 मैले अपलोड गरेका विज्ञापनहरू ({myProperties.length})
          </Text>

          {loading ? (
            <ActivityIndicator
              size="large"
              color="#007AFF"
              style={{ marginVertical: 20 }}
            />
          ) : myProperties.length === 0 ? (
            <Text style={styles.emptyText}>
              तपाईंले अहिलेसम्म कुनै पोष्ट अपलोड गर्नुभएको छैन।
            </Text>
          ) : (
            myProperties.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.categoryBadge}>
                    {item.category || "Room"}
                  </Text>
                </View>
                <Text style={styles.itemDetail}>
                  रु. {item.price} | 📍 {item.location}
                </Text>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(item.id)}
                >
                  <Text style={styles.deleteBtnText}>🗑️ हटाउनुहोस्</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {!isDesktop && <Navbar />}
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: { flex: 1, backgroundColor: "#f4f6f8" },
  container: { padding: 16, paddingBottom: 80, alignItems: "center" },
  card: {
    width: "100%",
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 16,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 12,
  },
  infoText: { fontSize: 15, color: "#333", marginBottom: 6 },
  roleBadge: {
    fontSize: 13,
    color: "#28a745",
    fontWeight: "600",
    marginTop: 4,
    marginBottom: 16,
  },
  addBtn: {
    backgroundColor: "#28a745",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  addBtnText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a202c",
    marginBottom: 14,
  },
  emptyText: { color: "#718096", textAlign: "center", marginVertical: 16 },
  itemCard: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemTitle: { fontSize: 16, fontWeight: "bold", color: "#2d3748" },
  categoryBadge: {
    backgroundColor: "#e7f1ff",
    color: "#007AFF",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: "600",
  },
  itemDetail: { fontSize: 14, color: "#4a5568", marginVertical: 6 },
  deleteBtn: {
    alignSelf: "flex-end",
    backgroundColor: "#fff0f0",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteBtnText: { color: "#ff3b30", fontSize: 12, fontWeight: "bold" },
});
