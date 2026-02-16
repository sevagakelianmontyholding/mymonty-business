import React from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import {
  Building2,
  Users,
  Shield,
  LifeBuoy,
  FileText,
  ChevronRight,
} from "lucide-react-native";

function Item({ title, subtitle, icon: Icon, onPress }) {
  const border = "rgba(11,15,20,0.08)";
  const textPrimary = "#0B0F14";
  const textMuted = "rgba(11,15,20,0.60)";

  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingVertical: 14,
        borderTopWidth: 1,
        borderTopColor: border,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}
      accessibilityLabel={title}
    >
      <View
        style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}
      >
        <View
          style={{
            height: 38,
            width: 38,
            borderRadius: 14,
            backgroundColor: "#F1F3F5",
            borderWidth: 1,
            borderColor: border,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={18} color={textPrimary} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ color: textPrimary, fontSize: 14, fontWeight: "800" }}>
            {title}
          </Text>
          {subtitle ? (
            <Text
              style={{
                marginTop: 3,
                color: textMuted,
                fontSize: 12,
                fontWeight: "600",
              }}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>

      <ChevronRight size={18} color={textMuted} />
    </Pressable>
  );
}

export default function More() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const comingSoon = (title) => Alert.alert(title, "Coming soon");

  const background = "#F8F9FA";
  const surface = "#FFFFFF";
  const textPrimary = "#0B0F14";
  const textMuted = "rgba(11,15,20,0.60)";
  const border = "rgba(11,15,20,0.08)";

  return (
    <View
      style={{ flex: 1, backgroundColor: background, paddingTop: insets.top }}
    >
      <StatusBar style="dark" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 18, paddingTop: 10 }}>
          <Text style={{ color: textPrimary, fontSize: 24, fontWeight: "900" }}>
            More
          </Text>
          <Text
            style={{
              marginTop: 6,
              color: textMuted,
              fontSize: 13,
              fontWeight: "600",
            }}
          >
            Company settings, team and help.
          </Text>
        </View>

        <View style={{ paddingHorizontal: 18, marginTop: 16 }}>
          <View
            style={{
              borderRadius: 20,
              backgroundColor: surface,
              borderWidth: 1,
              borderColor: border,
              paddingHorizontal: 14,
              paddingBottom: 6,
            }}
          >
            <Item
              title="Company"
              subtitle="Profile, addresses, tax details"
              icon={Building2}
              onPress={() => comingSoon("Company")}
            />
            <Item
              title="Team"
              subtitle="Members, roles and approvals"
              icon={Users}
              onPress={() => comingSoon("Team")}
            />
            <Item
              title="Security"
              subtitle="2FA, devices, sessions"
              icon={Shield}
              onPress={() => comingSoon("Security")}
            />
            <Item
              title="Statement of Account"
              subtitle="Email a statement for your wallet"
              icon={FileText}
              onPress={() => router.push("/statement")}
            />
          </View>
        </View>

        <View style={{ paddingHorizontal: 18, marginTop: 14 }}>
          <Text style={{ color: textPrimary, fontSize: 14, fontWeight: "900" }}>
            Support
          </Text>

          <View
            style={{
              marginTop: 10,
              borderRadius: 20,
              backgroundColor: surface,
              borderWidth: 1,
              borderColor: border,
              paddingHorizontal: 14,
              paddingBottom: 6,
            }}
          >
            <Item
              title="Help center"
              subtitle="Guides and FAQs"
              icon={LifeBuoy}
              onPress={() => router.push("/support")}
            />
            <Item
              title="Legal"
              subtitle="Terms & policies"
              icon={FileText}
              onPress={() => comingSoon("Legal")}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
