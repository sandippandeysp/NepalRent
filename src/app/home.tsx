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

export default function HomeScreen() {
  const [user, setUser] = useState<any>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getUserData();
    fetchProperties();
  }, []);

  async function getUserData() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.replace("/");
      return;
    }
    setUser(user);
  }

  async function fetchProperties() {
    setLoading(true);
    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      Alert.alert("त्रुटि", error.message);
    } else {
      setProperties(data || []);
      setFilteredProperties(data || []);
    }
    setLoading(false);
  }

  // खोज्ने (Search) गर्ने फंक्सन
  function handleSearch(text: string) {
    setSearchQuery(text);
    if (text.trim() === "") {
      setFilteredProperties(properties);
    } else {
      const filtered = properties.filter(
        (item) =>
          item.title?.toLowerCase().includes(text.toLowerCase()) ||
          item.location?.toLowerCase().includes(text.toLowerCase()),
      );
      setFilteredProperties(filtered);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/");
  }

  const userMeta = user?.user_metadata || {};
  const isLandlord = userMeta.role === "Landlord";

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* माथि Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.appName}>Nepal Rent 🏠</Text>
            <Text style={styles.welcomeText}>
              नमस्ते, {userMeta.full_name || user?.email}!
            </Text>
            <View style={styles.badgeContainer}>
              <Text style={styles.roleBadge}>
                {isLandlord ? "घरबेटी (Landlord)" : "भाडामा बस्ने (Tenant)"}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleSignOut}>
            <Text style={styles.logoutBtnText}>लगआउट</Text>
          </TouchableOpacity>
        </View>

        {/* यदि घरबेटी हो भने नयाँ प्रोपर्टी थप्ने बटन देखाउने */}
        {isLandlord && (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => router.push("/add-property")}
          >
            <Text style={styles.addBtnText}>➕ नयाँ प्रोपर्टी थप्नुहोस्</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* सर्च बार (Search Bar) */}
      <View style={styles.searchCard}>
        <TextInput
          style={styles.searchInput}
          placeholder="ठेगाना वा शीर्षक अनुसार खोज्नुहोस्..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {/* उपलब्ध प्रोपर्टीहरूको सूची (Property Listings) */}
      <View style={styles.listCard}>
        <View style={styles.rowHeader}>
          <Text style={styles.sectionTitle}>🏢 उपलब्ध कोठा / घरहरू</Text>
          <TouchableOpacity onPress={fetchProperties}>
            <Text style={styles.refreshText}>रिफ्रेस 🔄</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#007AFF"
            style={{ marginVertical: 30 }}
          />
        ) : filteredProperties.length === 0 ? (
          <Text style={styles.emptyText}>अहिलेसम्म कुनै प्रोपर्टी भेटिएन।</Text>
        ) : (
          filteredProperties.map((item) => (
            <View key={item.id} style={styles.propertyCard}>
              <View style={styles.propertyHeaderRow}>
                <Text style={styles.propertyTitle}>{item.title}</Text>
                <View style={styles.priceTag}>
                  <Text style={styles.priceTagText}>रु. {item.price}</Text>
                </View>
              </View>
              <Text style={styles.propertyDetail}>
                📍 ठेगाना: {item.location}
              </Text>
              <Text style={styles.propertyPhone}>📞 सम्पर्क: {item.phone}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: "#f4f6f8",
    alignItems: "center",
  },
  headerCard: {
    width: "100%",
    maxWidth: 500,
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 3,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  appName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007AFF",
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginTop: 6,
  },
  badgeContainer: {
    marginTop: 6,
    alignSelf: "flex-start",
    backgroundColor: "#e7f1ff",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  roleBadge: {
    fontSize: 12,
    color: "#007AFF",
    fontWeight: "600",
  },
  logoutBtn: {
    backgroundColor: "#ff3b30",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  logoutBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  addBtn: {
    backgroundColor: "#28a745",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },
  addBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  searchCard: {
    width: "100%",
    maxWidth: 500,
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: "#333",
    elevation: 2,
  },
  listCard: {
    width: "100%",
    maxWidth: 500,
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 16,
    elevation: 3,
  },
  rowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a202c",
  },
  refreshText: {
    color: "#007AFF",
    fontWeight: "600",
  },
  emptyText: {
    textAlign: "center",
    color: "#718096",
    marginVertical: 24,
    fontSize: 15,
  },
  propertyCard: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  propertyHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2d3748",
    flex: 1,
  },
  priceTag: {
    backgroundColor: "#def7ec",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priceTagText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#03543f",
  },
  propertyDetail: {
    fontSize: 14,
    color: "#4a5568",
    marginBottom: 4,
  },
  propertyPhone: {
    fontSize: 14,
    color: "#2b6cb0",
    fontWeight: "600",
  },
});
