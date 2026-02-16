import { View, Text, Pressable, ScrollView, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import {
  X,
  Plus,
  CreditCard,
  ArrowDownLeft,
  Landmark,
  Users,
  QrCode,
  Smartphone,
  ChevronRight,
} from "lucide-react-native";
import React, { useMemo } from "react";

function OptionRow({ title, subtitle, icon: Icon, onPress }) {
  const surface = "#FFFFFF";
  const textPrimary = "#0B0F14";
  const textMuted = "rgba(11,15,20,0.60)";
  const border = "rgba(11,15,20,0.08)";

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

export default function AddMoney() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const background = "#F8F9FA";
  const surface = "#FFFFFF";
  const textPrimary = "#0B0F14";
  const textMuted = "rgba(11,15,20,0.60)";
  const border = "rgba(11,15,20,0.08)";

  const comingSoon = (title) => Alert.alert(title, "Coming soon");

  const options = useMemo(() => {
    return [
      {
        key: "card",
        title: "Card",
        subtitle: "Instant • USD, EUR, or LBP",
        icon: CreditCard,
        onPress: () =>
          router.push({
            pathname: "/topupflow",
            params: {
              title: "Top-up by card",
              method: "card",
              sourceRef: "MOCK_CARD_4242",
            },
          }),
      },
      {
        key: "money_request",
        title: "Money Request",
        subtitle: "Ask someone to send you money",
        icon: ArrowDownLeft,
        onPress: () => router.push("/request"),
      },
      {
        key: "agent",
        title: "Agent",
        subtitle: "Cash top-up via agent",
        icon: Users,
        onPress: () =>
          router.push({
            pathname: "/topupflow",
            params: {
              title: "Top-up via agent",
              method: "cash_agent",
              sourceRef: "AGENT",
            },
          }),
      },
      {
        key: "bank",
        title: "Business Bank Account",
        subtitle: "Bank transfer • 1-3 business days",
        icon: Landmark,
        onPress: () =>
          router.push({
            pathname: "/topupflow",
            params: {
              title: "Business bank account",
              method: "bank_transfer",
              sourceRef: "BUSINESS_BANK_ACCOUNT",
            },
          }),
      },
      {
        key: "atm_deposit",
        title: "Cardless ATM deposit",
        subtitle: "Deposit cash at an ATM",
        icon: Smartphone,
        onPress: () =>
          router.push({
            pathname: "/topupflow",
            params: {
              title: "Cardless ATM deposit",
              method: "cash_agent",
              sourceRef: "CARDLESS_ATM_DEPOSIT",
            },
          }),
      },
      {
        key: "qr",
        title: "QR Code",
        subtitle: "Scan a QR and add money",
        icon: QrCode,
        onPress: () => router.push("/qrscan"),
      },
    ];
  }, [router]);

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
              backgroundColor: "#DCEDFA",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Plus size={18} color="#0786FD" strokeWidth={2.5} />
          </View>
          <Text style={{ color: textPrimary, fontSize: 18, fontWeight: "700" }}>
            Add money
          </Text>
        </View>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <X size={24} color={textPrimary} />
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 18, paddingTop: 16 }}>
          <Text style={{ color: textPrimary, fontSize: 14, fontWeight: "900" }}>
            Top-up options
          </Text>
          <Text
            style={{
              marginTop: 6,
              color: textMuted,
              fontSize: 13,
              fontWeight: "600",
            }}
          >
            Choose how you want to add money to your wallet.
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
            {options.map((o, index) => {
              const onPress = o.onPress || (() => comingSoon(o.title));
              return (
                <OptionRow
                  key={o.key}
                  title={o.title}
                  subtitle={o.subtitle}
                  icon={o.icon}
                  onPress={onPress}
                />
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
