import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import {
  Eye,
  EyeOff,
  Plus,
  ChevronRight,
  CreditCard,
  Lock,
  Unlock,
  Gift,
  RotateCcw,
  UserPlus,
  Gauge,
  ArrowUpFromLine,
  AlertCircle,
  XCircle,
} from "lucide-react-native";

function QuickActionButton({ label, icon: Icon, onPress }) {
  const border = "rgba(11,15,20,0.08)";
  const textPrimary = "#0B0F14";

  return (
    <Pressable
      onPress={onPress}
      style={{
        width: 110,
        borderWidth: 1,
        borderColor: border,
        borderRadius: 16,
        paddingVertical: 14,
        paddingHorizontal: 10,
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        gap: 8,
      }}
    >
      <View
        style={{
          height: 40,
          width: 40,
          borderRadius: 14,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F1F3F5",
        }}
      >
        <Icon size={20} color="#0786FD" strokeWidth={2.5} />
      </View>
      <Text
        style={{
          color: textPrimary,
          fontSize: 12,
          fontWeight: "500",
          textAlign: "center",
        }}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {label}
      </Text>
    </Pressable>
  );
}

function SettingRow({ title, icon: Icon, onPress }) {
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
        gap: 10,
      }}
      accessibilityLabel={title}
    >
      <View
        style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}
      >
        <View
          style={{
            height: 36,
            width: 36,
            borderRadius: 12,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#F1F3F5",
          }}
        >
          <Icon size={18} color="#0786FD" strokeWidth={2.5} />
        </View>
        <Text
          style={{
            color: textPrimary,
            fontSize: 14,
            fontWeight: "500",
            flex: 1,
          }}
        >
          {title}
        </Text>
      </View>
      <ChevronRight size={18} color={textMuted} />
    </Pressable>
  );
}

function TransactionRow({ title, subtitle, amount, kind }) {
  const border = "rgba(11,15,20,0.08)";
  const textPrimary = "#0B0F14";
  const textMuted = "rgba(11,15,20,0.60)";

  const color = useMemo(() => {
    if (kind === "in") return "#1B9460";
    if (kind === "out") return "#FF5A6A";
    return textPrimary;
  }, [kind]);

  return (
    <View
      style={{
        paddingVertical: 14,
        borderTopWidth: 1,
        borderTopColor: border,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ color: textPrimary, fontSize: 14, fontWeight: "500" }}>
          {title}
        </Text>
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
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Text style={{ color, fontSize: 14, fontWeight: "500" }}>{amount}</Text>
        <ChevronRight size={18} color={textMuted} />
      </View>
    </View>
  );
}

export default function Cards() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const background = "#F8F9FA";
  const surface = "#FFFFFF";
  const textPrimary = "#0B0F14";
  const textMuted = "rgba(11,15,20,0.60)";
  const border = "rgba(11,15,20,0.08)";
  const accent = "#0786FD";

  const [isFrozen, setIsFrozen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(true);

  const cardNumber = useMemo(
    () => (showDetails ? "5412  7534  8901  1289" : "••••  ••••  ••••  1289"),
    [showDetails],
  );
  const cvv = useMemo(() => (showDetails ? "234" : "•••"), [showDetails]);

  const transactions = useMemo(
    () => [
      {
        title: "Amazon.com",
        subtitle: "Today · 14:32",
        amount: "-$89.99",
        kind: "out",
      },
      {
        title: "Starbucks",
        subtitle: "Today · 09:15",
        amount: "-$6.75",
        kind: "out",
      },
      {
        title: "Refund · Nike Store",
        subtitle: "Yesterday · 16:20",
        amount: "+$129.00",
        kind: "in",
      },
      {
        title: "Uber",
        subtitle: "Jan 12 · 22:45",
        amount: "-$18.50",
        kind: "out",
      },
      {
        title: "Apple.com",
        subtitle: "Jan 11 · 11:30",
        amount: "-$2.99",
        kind: "out",
      },
    ],
    [],
  );

  const openComingSoon = (title) => {
    Alert.alert(title, "Coming soon");
  };

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
        {/* Header with Add Card button */}
        <View
          style={{
            paddingHorizontal: 18,
            paddingTop: 5,
            flexDirection: "row",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{ color: textPrimary, fontSize: 24, fontWeight: "900" }}
            >
              Cards
            </Text>
          </View>
          <Pressable
            onPress={() => openComingSoon("Add card")}
            style={{
              marginTop: 4,
              height: 40,
              paddingHorizontal: 16,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: border,
              backgroundColor: "#0786FD",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
            accessibilityLabel="Add a card"
          >
            <Plus size={18} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={{ color: "#FFFFFF", fontSize: 13, fontWeight: "600" }}>
              Add
            </Text>
          </Pressable>
        </View>

        {/* Card Balance */}
        <View style={{ paddingHorizontal: 18, marginTop: 20 }}>
          <View
            style={{
              borderRadius: 20,
              backgroundColor: surface,
              borderWidth: 1,
              borderColor: border,
              paddingHorizontal: 18,
              paddingVertical: 16,
              alignItems: "center",
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <Text
                style={{
                  color: textPrimary,
                  fontSize: 26,
                  fontWeight: "600",
                  letterSpacing: -0.5,
                }}
              >
                {balanceVisible ? "$12,450.00" : "••••••"}
              </Text>
              <Pressable
                onPress={() => setBalanceVisible(!balanceVisible)}
                accessibilityLabel={
                  balanceVisible ? "Hide balance" : "Show balance"
                }
              >
                {balanceVisible ? (
                  <Eye size={22} color={textMuted} />
                ) : (
                  <EyeOff size={22} color={textMuted} />
                )}
              </Pressable>
            </View>
            <Text
              style={{
                marginTop: 4,
                color: textMuted,
                fontSize: 12,
                fontWeight: "500",
              }}
            >
              Available to spend
            </Text>
          </View>
        </View>

        {/* Card - with uploaded image */}
        <View style={{ paddingHorizontal: 18, marginTop: 16 }}>
          <View style={{ borderRadius: 24, overflow: "hidden" }}>
            <Image
              source={{
                uri: "https://ucarecdn.com/79ec8d02-f783-40d1-8957-64cedc8a1e0e/-/format/auto/",
              }}
              style={{ width: "100%", aspectRatio: 1.586, borderRadius: 24 }}
              contentFit="cover"
            />
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                paddingLeft: 44,
                paddingRight: 24,
                paddingTop: 9,
                paddingBottom: 64,
                justifyContent: "flex-end",
              }}
            >
              {/* All text aligned to single left vertical axis */}
              <View style={{ alignItems: "flex-start" }}>
                {/* Cardholder name - small, uppercase, light */}
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 10,
                    fontWeight: "300",
                    letterSpacing: 1.5,
                    textTransform: "uppercase",
                    lineHeight: 10,
                    marginBottom: 1,
                    opacity: 0.85,
                  }}
                >
                  RAMI HADDAD
                </Text>

                {/* Card number - primary element, larger, evenly spaced */}
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 18,
                    fontWeight: "400",
                    letterSpacing: 3,
                    lineHeight: 18,
                    marginBottom: 2,
                  }}
                >
                  {cardNumber}
                </Text>

                {/* Valid Till and CVV - same baseline, smaller secondary */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "baseline",
                    gap: 32,
                  }}
                >
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontSize: 9,
                      fontWeight: "300",
                      letterSpacing: 1.2,
                      textTransform: "uppercase",
                      lineHeight: 9,
                      opacity: 0.8,
                    }}
                  >
                    Valid Till {showDetails ? "12/28" : "12/28"}
                  </Text>
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontSize: 9,
                      fontWeight: "300",
                      letterSpacing: 1.2,
                      textTransform: "uppercase",
                      lineHeight: 9,
                      opacity: 0.8,
                    }}
                  >
                    CVV {cvv}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Quick actions - centered, no label */}
        <View style={{ marginTop: 18 }}>
          <View style={{ alignItems: "center", paddingHorizontal: 18 }}>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <QuickActionButton
                label={showDetails ? "Hide details" : "Show details"}
                icon={showDetails ? EyeOff : Eye}
                onPress={() => setShowDetails((v) => !v)}
              />
              <QuickActionButton
                label="Load card"
                icon={CreditCard}
                onPress={() => router.push("/topup")}
              />
              <QuickActionButton
                label={isFrozen ? "Unlock card" : "Lock card"}
                icon={isFrozen ? Unlock : Lock}
                onPress={() => setIsFrozen((v) => !v)}
              />
            </View>
          </View>
        </View>

        {/* Manage Card */}
        <View style={{ paddingHorizontal: 18, marginTop: 18 }}>
          <Text style={{ color: textPrimary, fontSize: 14, fontWeight: "500" }}>
            Manage Card
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
            <SettingRow
              title="View Benefits"
              icon={Gift}
              onPress={() => openComingSoon("View Benefits")}
            />
            <SettingRow
              title="Reset pin"
              icon={RotateCcw}
              onPress={() => openComingSoon("Reset pin")}
            />
            <SettingRow
              title="Issue Supplementary Card"
              icon={UserPlus}
              onPress={() => openComingSoon("Issue Supplementary Card")}
            />
            <SettingRow
              title="Manage Card Limit"
              icon={Gauge}
              onPress={() => openComingSoon("Manage Card Limit")}
            />
            <SettingRow
              title="Top-Up wallet from card"
              icon={ArrowUpFromLine}
              onPress={() => openComingSoon("Top-Up wallet from card")}
            />
            <SettingRow
              title="Reissue Damaged Card"
              icon={AlertCircle}
              onPress={() => openComingSoon("Reissue Damaged Card")}
            />
            <SettingRow
              title="Terminate"
              icon={XCircle}
              onPress={() => openComingSoon("Terminate card")}
            />
          </View>
        </View>

        {/* Transactions */}
        <View style={{ paddingHorizontal: 18, marginTop: 18 }}>
          <Text style={{ color: textPrimary, fontSize: 14, fontWeight: "500" }}>
            Transactions
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
            <View
              style={{
                paddingTop: 14,
                paddingBottom: 10,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{ color: textPrimary, fontSize: 14, fontWeight: "500" }}
              >
                Recent activity
              </Text>
              <Pressable
                onPress={() => router.push("/activity")}
                accessibilityLabel="View all transactions"
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 999,
                  backgroundColor: "#DCEDFA",
                }}
              >
                <Text
                  style={{ color: accent, fontSize: 12, fontWeight: "500" }}
                >
                  View all
                </Text>
              </Pressable>
            </View>

            {transactions.map((row, index) => (
              <TransactionRow
                key={index}
                title={row.title}
                subtitle={row.subtitle}
                amount={row.amount}
                kind={row.kind}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
