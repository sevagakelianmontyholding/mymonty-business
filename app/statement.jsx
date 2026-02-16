import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { X, FileText, Mail } from "lucide-react-native";
import useUser from "@/utils/auth/useUser";

export default function StatementOfAccount() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: user, loading } = useUser();

  const [currency, setCurrency] = useState("USD");
  const [range, setRange] = useState("this_month");

  const background = "#F8F9FA";
  const surface = "#FFFFFF";
  const textPrimary = "#0B0F14";
  const textMuted = "rgba(11,15,20,0.60)";
  const border = "rgba(11,15,20,0.08)";
  const accent = "#0786FD";

  const email = user?.email || "your email";

  const rangeLabel = useMemo(() => {
    if (range === "last_30") return "Last 30 days";
    if (range === "last_month") return "Last month";
    return "This month";
  }, [range]);

  const handleSend = () => {
    // UI-only for now; we can wire a backend email later.
    Alert.alert(
      "Statement requested",
      `We'll email your statement (${currency}, ${rangeLabel}) to ${email}.`,
    );
    setTimeout(() => router.back(), 600);
  };

  return (
    <View
      style={{ flex: 1, backgroundColor: background, paddingTop: insets.top }}
    >
      <StatusBar style="dark" />

      {/* Header */}
      <View
        style={{
          paddingHorizontal: 18,
          paddingVertical: 14,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: surface,
          borderBottomWidth: 1,
          borderBottomColor: border,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              backgroundColor: "#F1F3F5",
              borderWidth: 1,
              borderColor: border,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FileText size={18} color={textPrimary} strokeWidth={2.5} />
          </View>
          <Text style={{ color: textPrimary, fontSize: 18, fontWeight: "800" }}>
            Statement of Account
          </Text>
        </View>

        <Pressable onPress={() => router.back()} hitSlop={8}>
          <X size={24} color={textPrimary} />
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 18,
          paddingBottom: insets.bottom + 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            backgroundColor: surface,
            borderWidth: 1,
            borderColor: border,
            borderRadius: 18,
            padding: 14,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Mail size={18} color={accent} strokeWidth={2.5} />
            <Text
              style={{ color: textPrimary, fontSize: 14, fontWeight: "800" }}
            >
              Email delivery
            </Text>
          </View>
          <Text
            style={{
              marginTop: 8,
              color: textMuted,
              fontSize: 12,
              fontWeight: "600",
              lineHeight: 16,
            }}
          >
            We will send your statement to {email}.{" "}
            {loading ? "(Loading profile…)" : ""}
          </Text>
        </View>

        {/* Currency */}
        <View style={{ marginTop: 18 }}>
          <Text style={{ color: textPrimary, fontSize: 14, fontWeight: "800" }}>
            Wallet currency
          </Text>
          <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
            {["USD", "EUR", "LBP"].map((curr) => {
              const selected = currency === curr;
              const bg = selected ? "#DCEDFA" : surface;
              const borderColor = selected ? accent : border;
              const color = selected ? accent : textPrimary;

              return (
                <Pressable
                  key={curr}
                  onPress={() => setCurrency(curr)}
                  style={{
                    flex: 1,
                    backgroundColor: bg,
                    borderWidth: 1,
                    borderColor,
                    borderRadius: 14,
                    paddingVertical: 14,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color, fontSize: 13, fontWeight: "800" }}>
                    {curr}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Date range */}
        <View style={{ marginTop: 18 }}>
          <Text style={{ color: textPrimary, fontSize: 14, fontWeight: "800" }}>
            Date range
          </Text>
          <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
            {[
              { id: "this_month", label: "This month" },
              { id: "last_month", label: "Last month" },
              { id: "last_30", label: "Last 30 days" },
            ].map((r) => {
              const selected = range === r.id;
              const bg = selected ? "#DCEDFA" : surface;
              const borderColor = selected ? accent : border;
              const color = selected ? accent : textPrimary;

              return (
                <Pressable
                  key={r.id}
                  onPress={() => setRange(r.id)}
                  style={{
                    flex: 1,
                    backgroundColor: bg,
                    borderWidth: 1,
                    borderColor,
                    borderRadius: 14,
                    paddingVertical: 14,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color, fontSize: 12, fontWeight: "800" }}>
                    {r.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Pressable
          onPress={handleSend}
          style={{
            marginTop: 28,
            backgroundColor: accent,
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#FFFFFF", fontSize: 15, fontWeight: "900" }}>
            Send statement
          </Text>
        </Pressable>

        <Text
          style={{
            marginTop: 10,
            color: textMuted,
            fontSize: 12,
            fontWeight: "600",
            lineHeight: 16,
          }}
        >
          Note: this is a demo flow for now. If you want, I can wire a backend
          route that generates a PDF and emails it.
        </Text>
      </ScrollView>
    </View>
  );
}
