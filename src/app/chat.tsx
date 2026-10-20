import { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native";
import Navbar from "../components/Navbar";

export default function ChatScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { id: 1, text: "नमस्ते! के यो कोठा/घडी अझै उपलब्ध छ?", sender: "renter" },
    {
      id: 2,
      text: "नमस्ते! हजुर उपलब्ध छ। हजुर कहिले हेर्न आउनुहुन्छ?",
      sender: "owner",
    },
  ]);

  function handleSend() {
    if (!message.trim()) return;
    setMessages([
      ...messages,
      { id: Date.now(), text: message, sender: "renter" },
    ]);
    setMessage("");
  }

  return (
    <View style={styles.mainWrapper}>
      {isDesktop && <Navbar />}

      <View style={[styles.container, { maxWidth: isDesktop ? 800 : "100%" }]}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatTitle}>💬 कुराकानी (Chat)</Text>
        </View>

        <ScrollView style={styles.messageBox}>
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.messageBubble,
                msg.sender === "renter"
                  ? styles.myMessage
                  : styles.otherMessage,
              ]}
            >
              <Text
                style={
                  msg.sender === "renter" ? styles.myText : styles.otherText
                }
              >
                {msg.text}
              </Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="मेसेज लेख्नुहोस्..."
            value={message}
            onChangeText={setMessage}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
            <Text style={styles.sendBtnText}>पठाउनुहोस्</Text>
          </TouchableOpacity>
        </View>
      </View>

      {!isDesktop && <Navbar />}
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
    backgroundColor: "#f4f6f8",
    alignItems: "center",
  },
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: "#ffffff",
    paddingBottom: 70,
  },
  chatHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007AFF",
  },
  messageBox: {
    flex: 1,
    padding: 16,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    maxWidth: "75%",
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#007AFF",
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#e2e8f0",
  },
  myText: {
    color: "#ffffff",
  },
  otherText: {
    color: "#1a202c",
  },
  inputRow: {
    flexDirection: "row",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  input: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  sendBtn: {
    backgroundColor: "#28a745",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: "center",
  },
  sendBtnText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
});
