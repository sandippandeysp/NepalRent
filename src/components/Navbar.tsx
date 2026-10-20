import { router, usePathname } from "expo-router";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native";

export default function Navbar() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const currentPath = usePathname();

  const navItems = [
    { label: "Home", icon: "🏠", path: "/home" },
    { label: "Chat", icon: "💬", path: "/chat" },
    { label: "Profile", icon: "👤", path: "/profile" },
  ];

  return (
    <View
      style={[
        styles.navContainer,
        isDesktop ? styles.topNav : styles.bottomNav,
      ]}
    >
      {isDesktop && <Text style={styles.logo}>Nepal Rent 🏠</Text>}
      <View style={styles.menuItems}>
        {navItems.map((item) => {
          const isActive = currentPath === item.path;
          return (
            <TouchableOpacity
              key={item.path}
              style={[styles.navButton, isActive && styles.activeNavButton]}
              onPress={() => router.push(item.path as any)}
            >
              <Text style={styles.navIcon}>{item.icon}</Text>
              <Text
                style={[styles.navLabel, isActive && styles.activeNavLabel]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navContainer: {
    backgroundColor: "#ffffff",
    borderColor: "#e2e8f0",
    zIndex: 1000,
  },
  topNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomWidth: 1,
    width: "100%",
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    borderTopWidth: 1,
    elevation: 8,
  },
  logo: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#007AFF",
  },
  menuItems: {
    flexDirection: "row",
    gap: 12,
  },
  navButton: {
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
  activeNavButton: {
    backgroundColor: "#e7f1ff",
  },
  navIcon: {
    fontSize: 18,
  },
  navLabel: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  activeNavLabel: {
    color: "#007AFF",
    fontWeight: "bold",
  },
});
