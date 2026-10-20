import { router } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native";
import Navbar from "../components/Navbar";
import { supabase } from "./supabase";

// १. प्रोपर्टी कार्ड कम्पोनेन्ट
function PropertyCardItem({
  item,
  cardWidth,
}: {
  item: any;
  cardWidth: number;
}) {
  const player = useVideoPlayer(item.video_url || "", (player) => {
    player.loop = false;
  });

  return (
    <View style={[styles.propertyCard, { width: cardWidth }]}>
      <View style={styles.propertyHeaderRow}>
        <Text style={styles.propertyTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <View style={styles.priceTag}>
          <Text style={styles.priceTagText}>रु. {item.price}</Text>
        </View>
      </View>

      {/* भिडियो प्लेयर सेक्सन */}
      {item.video_url ? (
        <View style={styles.videoContainer}>
          <VideoView
            style={styles.video}
            player={player}
            allowsFullscreen
            allowsPictureInPicture
          />
        </View>
      ) : (
        <View style={styles.noVideoContainer}>
          <Text style={styles.noVideoText}>📹 भिडियो उपलब्ध छैन</Text>
        </View>
      )}

      <Text style={styles.propertyDetail}>📍 ठेगाना: {item.location}</Text>

      {item.landmark ? (
        <Text style={styles.propertyDetail}>
          🚩 ल्यान्डमार्क: {item.landmark}
        </Text>
      ) : null}

      {item.facilities ? (
        <View style={styles.facilityBox}>
          <Text style={styles.facilityTitle}>✨ सुविधाहरू तथा टिप्पणी:</Text>
          <Text style={styles.facilityText} numberOfLines={3}>
            {item.facilities}
          </Text>
        </View>
      ) : null}

      <Text style={styles.propertyPhone}>📞 सम्पर्क: {item.phone}</Text>
    </View>
  );
}

// २. मुख्य होम स्क्रिन कम्पोनेन्ट
export default function HomeScreen() {
  const { width } = useWindowDimensions();

  // Hydration mismatch र warning रोक्न isClient state
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const isDesktop = isClient ? width >= 768 : false;
  const cardWidth = isDesktop ? (width > 1000 ? 460 : width * 0.44) : "100%";

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
      alert(error.message);
    } else {
      setProperties(data || []);
      setFilteredProperties(data || []);
    }
    setLoading(false);
  }

  function handleSearch(text: string) {
    setSearchQuery(text);
    if (text.trim() === "") {
      setFilteredProperties(properties);
    } else {
      const filtered = properties.filter(
        (item) =>
          item.title?.toLowerCase().includes(text.toLowerCase()) ||
          item.location?.toLowerCase().includes(text.toLowerCase()) ||
          item.landmark?.toLowerCase().includes(text.toLowerCase()) ||
          item.facilities?.toLowerCase().includes(text.toLowerCase()),
      );
      setFilteredProperties(filtered);
    }
  }

  const userMeta = user?.user_metadata || {};
  const isLandlord = userMeta.role === "Landlord";

  return (
    <View style={styles.mainWrapper}>
      {/* ल्यापटपमा माथि Navbar देखाउने */}
      {isDesktop && <Navbar />}

      <ScrollView contentContainerStyle={styles.container}>
        <View style={[styles.headerCard, { maxWidth: isDesktop ? 960 : 600 }]}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.appName}>Nepal Rent 🏠</Text>
              <Text style={styles.welcomeText}>
                नमस्ते, {userMeta.full_name || user?.email}!
              </Text>
              <View style={styles.badgeContainer}>
                <Text style={styles.roleBadge}>
                  {isLandlord
                    ? "घरबेटी / सामान धनी (Landlord)"
                    : "कोठा खोज्ने (Tenant)"}
                </Text>
              </View>
            </View>
          </View>

          {/* घरबेटीले मात्र नयाँ विज्ञापन/प्रोपर्टी थप्ने बटन */}
          {isLandlord && (
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => router.push("/add-property")}
            >
              <Text style={styles.addBtnText}>
                ➕ नयाँ प्रोपर्टी वा सामान थप्नुहोस्
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={[styles.searchCard, { maxWidth: isDesktop ? 960 : 600 }]}>
          <TextInput
            style={styles.searchInput}
            placeholder="ठाउँ, ल्यान्डमार्क वा शीर्षक अनुसार खोज्नुहोस्..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>

        <View style={[styles.listCard, { maxWidth: isDesktop ? 960 : 600 }]}>
          <View style={styles.rowHeader}>
            <Text style={styles.sectionTitle}>
              🏢 उपलब्ध कोठा / घर / सामानहरू
            </Text>
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
            <Text style={styles.emptyText}>कुनै विज्ञापन भेटिएन।</Text>
          ) : (
            <View style={styles.gridContainer}>
              {filteredProperties.map((item) => (
                <PropertyCardItem
                  key={item.id}
                  item={item}
                  cardWidth={cardWidth}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* मोबाइलमा तल Navbar देखाउने */}
      {!isDesktop && <Navbar />}
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
    backgroundColor: "#f4f6f8",
  },
  container: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 80,
    alignItems: "center",
  },
  headerCard: {
    width: "100%",
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
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  propertyCard: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  propertyHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2d3748",
    flex: 1,
    marginRight: 8,
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
  videoContainer: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#000",
    marginVertical: 10,
  },
  video: {
    width: "100%",
    height: "100%",
  },
  noVideoContainer: {
    width: "100%",
    height: 40,
    backgroundColor: "#edf2f7",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginVertical: 10,
  },
  noVideoText: {
    color: "#718096",
    fontSize: 12,
  },
  propertyDetail: {
    fontSize: 14,
    color: "#4a5568",
    marginBottom: 4,
  },
  facilityBox: {
    backgroundColor: "#edf2f7",
    padding: 8,
    borderRadius: 8,
    marginVertical: 6,
  },
  facilityTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#4a5568",
    marginBottom: 2,
  },
  facilityText: {
    fontSize: 13,
    color: "#2d3748",
  },
  propertyPhone: {
    fontSize: 14,
    color: "#2b6cb0",
    fontWeight: "bold",
    marginTop: 4,
  },
});
