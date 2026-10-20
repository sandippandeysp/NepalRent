import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";
import "react-native-url-polyfill/auto";

// तपाईंको Supabase Credentials (आफ्नो वास्तविक URL र Key राख्नुहोस्)
const SUPABASE_URL = "https://zkhtllnvvughsdxyjtiz.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpraHRsbG52dnVnaHNkeHlqdGl6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MjQ3NzYzOCwiZXhwIjoyMTA4MDUzNjM4fQ.CfjESdnKn_Y5CcOFKP7Zf9NcyhytQntvWzzNg9N1s4k";

// SSR (Server-Side) मा window नहुँदा आउने समस्या रोक्न
const CustomAsyncStorage = {
  getItem: (key) => {
    if (Platform.OS === "web" && typeof window === "undefined") {
      return Promise.resolve(null);
    }
    return AsyncStorage.getItem(key);
  },
  setItem: (key, value) => {
    if (Platform.OS === "web" && typeof window === "undefined") {
      return Promise.resolve();
    }
    return AsyncStorage.setItem(key, value);
  },
  removeItem: (key) => {
    if (Platform.OS === "web" && typeof window === "undefined") {
      return Promise.resolve();
    }
    return AsyncStorage.removeItem(key);
  },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: CustomAsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export default supabase;
