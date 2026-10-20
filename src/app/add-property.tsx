import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native";
import { supabase } from "./supabase";

export default function AddPropertyScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [category, setCategory] = useState("Room"); // Default 'Room'
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [landmark, setLandmark] = useState("");
  const [phone, setPhone] = useState("");
  const [facilities, setFacilities] = useState("");

  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  async function pickVideo() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setVideoUri(result.assets[0].uri);
      setErrors({ ...errors, video: "" });
    }
  }

  async function uploadVideo(uri: string): Promise<string | null> {
    try {
      setUploading(true);
      const response = await fetch(uri);
      const blob = await response.blob();
      const fileExt = uri.split(".").pop() || "mp4";
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `videos/${fileName}`;

      const { error } = await supabase.storage
        .from("property-videos")
        .upload(filePath, blob, { contentType: "video/mp4" });

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from("property-videos")
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
    } catch (error: any) {
      Alert.alert("Upload Error", error.message);
      return null;
    } finally {
      setUploading(false);
    }
  }

  async function handleAddProperty() {
    let newErrors: { [key: string]: string } = {};

    if (!title.trim()) newErrors.title = "शीर्षक अनिवार्य छ!";
    if (!price.trim()) newErrors.price = "भाडा/मूल्य अनिवार्य छ!";
    if (!location.trim()) newErrors.location = "ठेगाना अनिवार्य छ!";
    if (!landmark.trim()) newErrors.landmark = "ल्यान्डमार्क अनिवार्य छ!";
    if (!phone.trim()) newErrors.phone = "फोन नम्बर अनिवार्य छ!";
    if (!videoUri) newErrors.video = "भिडियो अपलोड अनिवार्य छ!";
    if (!facilities.trim()) newErrors.facilities = "विवरण/सुविधा अनिवार्य छ!";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      Alert.alert("त्रुटि", "कृपया सबै अनिवार्य विवरणहरू भर्नुहोस्!");
      return;
    }

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      Alert.alert("त्रुटि", "कृपया लगइन गर्नुहोस्!");
      router.replace("/");
      return;
    }

    let uploadedVideoUrl = "";
    if (videoUri) {
      const url = await uploadVideo(videoUri);
      if (url) {
        uploadedVideoUrl = url;
      } else {
        setLoading(false);
        return;
      }
    }

    const { error } = await supabase.from("properties").insert([
      {
        category,
        title,
        price,
        location,
        landmark,
        phone,
        video_url: uploadedVideoUrl,
        facilities,
        user_id: user.id,
      },
    ]);

    setLoading(false);

    if (error) {
      Alert.alert("त्रुटि", error.message);
    } else {
      Alert.alert(
        "सफलता 🎉",
        "तपाईंको विज्ञापन सफलतापूर्वक पब्लिश भयो!",
        [{ text: "ठीक छ (OK)", onPress: () => router.replace("/profile") }],
        { cancelable: false },
      );
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={[styles.card, { maxWidth: isDesktop ? 950 : 500 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>← पछाडि जानुहोस्</Text>
        </TouchableOpacity>

        <Text style={styles.title}>➕ नयाँ विज्ञापन / रेन्ट थप्नुहोस्</Text>

        {/* Category Selection Option */}
        <Text style={styles.label}>
          रेन्टको प्रकार छान्नुहोस् (Category): *
        </Text>
        <View style={styles.categoryContainer}>
          {[
            { id: "Room", label: "🏠 कोठा / घर" },
            { id: "Watch", label: "⌚ घडी / सामान" },
            { id: "Partner", label: "🤝 साथी / पार्टनर" },
          ].map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.categoryChip,
                category === item.id && styles.activeCategoryChip,
              ]}
              onPress={() => setCategory(item.id)}
            >
              <Text
                style={[
                  styles.categoryText,
                  category === item.id && styles.activeCategoryText,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View
          style={[
            styles.formRow,
            { flexDirection: isDesktop ? "row" : "column" },
          ]}
        >
          <View style={[styles.column, isDesktop && { marginRight: 20 }]}>
            <Text style={styles.label}>शीर्षक (Title): *</Text>
            <TextInput
              style={[styles.input, errors.title && styles.errorInput]}
              placeholder="उदा: Rolex Watch / 2 Room Flat / Trekking Partner"
              value={title}
              onChangeText={(text) => {
                setTitle(text);
                setErrors({ ...errors, title: "" });
              }}
            />
            {errors.title ? (
              <Text style={styles.errorText}>{errors.title}</Text>
            ) : null}

            <Text style={styles.label}>भाडा / शुल्क (Price in Rs.): *</Text>
            <TextInput
              style={[styles.input, errors.price && styles.errorInput]}
              placeholder="उदा: 15000 (प्रति महिना/दिन)"
              value={price}
              onChangeText={(text) => {
                setPrice(text);
                setErrors({ ...errors, price: "" });
              }}
              keyboardType="numeric"
            />
            {errors.price ? (
              <Text style={styles.errorText}>{errors.price}</Text>
            ) : null}

            <Text style={styles.label}>ठेगाना (Location): *</Text>
            <TextInput
              style={[styles.input, errors.location && styles.errorInput]}
              placeholder="उदा: बानेश्वर, काठमाडौँ"
              value={location}
              onChangeText={(text) => {
                setLocation(text);
                setErrors({ ...errors, location: "" });
              }}
            />
            {errors.location ? (
              <Text style={styles.errorText}>{errors.location}</Text>
            ) : null}

            <Text style={styles.label}>नजिकैको ल्यान्डमार्क (Landmark): *</Text>
            <TextInput
              style={[styles.input, errors.landmark && styles.errorInput]}
              placeholder="उदा: हस्पिटल नजिकै"
              value={landmark}
              onChangeText={(text) => {
                setLandmark(text);
                setErrors({ ...errors, landmark: "" });
              }}
            />
            {errors.landmark ? (
              <Text style={styles.errorText}>{errors.landmark}</Text>
            ) : null}

            <Text style={styles.label}>सम्पर्क नम्बर (Phone): *</Text>
            <TextInput
              style={[styles.input, errors.phone && styles.errorInput]}
              placeholder="उदा: ९८XXXXXXXX"
              value={phone}
              onChangeText={(text) => {
                setPhone(text);
                setErrors({ ...errors, phone: "" });
              }}
              keyboardType="phone-pad"
            />
            {errors.phone ? (
              <Text style={styles.errorText}>{errors.phone}</Text>
            ) : null}
          </View>

          <View style={[styles.column, isDesktop && { marginLeft: 20 }]}>
            <Text style={styles.label}>भिडियो अपलोड गर्नुहोस्: *</Text>
            <TouchableOpacity
              style={[styles.uploadBtn, errors.video && styles.errorUploadBtn]}
              onPress={pickVideo}
            >
              <Text
                style={[
                  styles.uploadBtnText,
                  errors.video && { color: "#ff3b30" },
                ]}
              >
                {videoUri
                  ? "✅ भिडियो छानिबस्यो! (फेर्नुहोस्)"
                  : "📁 ग्यालेरीबाट भिडियो छान्नुहोस्"}
              </Text>
            </TouchableOpacity>
            {errors.video ? (
              <Text style={styles.errorText}>{errors.video}</Text>
            ) : null}

            <Text style={styles.label}>
              सुविधाहरू / विवरण (Facilities & Notes): *
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                errors.facilities && styles.errorInput,
              ]}
              placeholder="उदा: पानी फ्री, सक्कली सामान, इभेन्ट गाइड..."
              value={facilities}
              onChangeText={(text) => {
                setFacilities(text);
                setErrors({ ...errors, facilities: "" });
              }}
              multiline={true}
            />
            {errors.facilities ? (
              <Text style={styles.errorText}>{errors.facilities}</Text>
            ) : null}
          </View>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleAddProperty}
          disabled={loading || uploading}
        >
          {loading || uploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>विज्ञापन पब्लिश गर्नुहोस् 🚀</Text>
          )}
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
  },
  card: {
    width: "100%",
    backgroundColor: "#ffffff",
    padding: 24,
    borderRadius: 16,
    elevation: 3,
  },
  backBtn: { marginBottom: 12 },
  backBtnText: { color: "#007AFF", fontWeight: "600" },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#007AFF",
    textAlign: "center",
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
    marginTop: 6,
  },
  categoryContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  activeCategoryChip: { backgroundColor: "#007AFF", borderColor: "#007AFF" },
  categoryText: { color: "#475569", fontWeight: "600", fontSize: 13 },
  activeCategoryText: { color: "#ffffff" },
  formRow: { width: "100%" },
  column: { flex: 1 },
  input: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: "#333",
  },
  errorInput: { borderColor: "#ff3b30", backgroundColor: "#fff5f5" },
  errorUploadBtn: { borderColor: "#ff3b30", backgroundColor: "#fff5f5" },
  errorText: { color: "#ff3b30", fontSize: 12, marginTop: 4, marginBottom: 6 },
  uploadBtn: {
    backgroundColor: "#e7f1ff",
    borderWidth: 1.5,
    borderColor: "#007AFF",
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginBottom: 4,
    marginTop: 4,
  },
  uploadBtnText: { color: "#007AFF", fontWeight: "600" },
  textArea: { height: 120, textAlignVertical: "top" },
  button: {
    backgroundColor: "#28a745",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
