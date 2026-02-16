import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import {
  Search,
  ChevronRight,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react-native";

function Segmented({ items, value, onChange }) {
  const border = "rgba(11,15,20,0.08)";
  const textPrimary = "#0B0F14";
  const accent = "#6B5BFF";

  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: "#F1F3F5",
        borderWidth: 1,
        borderColor: border,
        borderRadius: 16,
        padding: 4,
        gap: 6,
      }}
    >
      {items.map((item) => {
        const isActive = item.value === value;
        const bg = isActive ? "#FFFFFF" : "transparent";
        const textColor = isActive ? textPrimary : "rgba(11,15,20,0.55)";

        return (
          <Pressable
            key={item.value}
            onPress={() => onChange(item.value)}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 12,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: bg,
            }}
            accessibilityLabel={item.label}
          >
            <Text style={{ color: textColor, fontSize: 12, fontWeight: "800" }}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function PaymentRow({ title, subtitle, amount, direction, onPress }) {
  const border = "rgba(11,15,20,0.08)";
  const textPrimary = "#0B0F14";
  const textMuted = "rgba(11,15,20,0.60)";
  const color = direction === "out" ? "#FF5A6A" : "#1B9460";
  const Icon = direction === "out" ? ArrowUpRight : ArrowDownLeft;

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
      accessibilityLabel={`${title} ${amount}`}
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
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Text style={{ color, fontSize: 14, fontWeight: "900" }}>{amount}</Text>
        <ChevronRight size={18} color={textMuted} />
      </View>
    </Pressable>
  );
}

export default function Payments() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const background = "#F8F9FA";
  const surface = "#FFFFFF";
  const textPrimary = "#0B0F14";
  const textMuted = "rgba(11,15,20,0.60)";
  const border = "rgba(11,15,20,0.08)";

  const [filter, setFilter] = useState("all");

  const allRows = useMemo(
    () => [
      {
        title: "Transfer to · Supplier XYZ",
        subtitle: "SEPA · Pending",
        amount: "-€540.00",
        direction: "out",
      },
      {
        title: "Client payment · INV-1204",
        subtitle: "Incoming · Completed",
        amount: "+€3,200.00",
        direction: "in",
      },
      {
        title: "Transfer to · Payroll",
        subtitle: "Scheduled · Jan 15",
        amount: "-€7,890.00",
        direction: "out",
      },
    ],
    [],
  );

  const rows = useMemo(() => {
    if (filter === "in") {
      return allRows.filter((r) => r.direction === "in");
    }
    if (filter === "out") {
      return allRows.filter((r) => r.direction === "out");
    }
    return allRows;
  }, [allRows, filter]);

  const openDetails = (row) => {
    Alert.alert(
      "Payment details",
      `${row.title}\n${row.subtitle}\n${row.amount}`,
    );
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
        <View style={{ paddingHorizontal: 18, paddingTop: 10 }}>
          <Text style={{ color: textPrimary, fontSize: 24, fontWeight: "900" }}>
            Payments
          </Text>
          <Text
            style={{
              marginTop: 6,
              color: textMuted,
              fontSize: 13,
              fontWeight: "600",
            }}
          >
            Track transfers and incoming payments.
          </Text>

          <View style={{ marginTop: 14 }}>
            <Segmented
              value={filter}
              onChange={setFilter}
              items={[
                { label: "All", value: "all" },
                { label: "Incoming", value: "in" },
                { label: "Outgoing", value: "out" },
              ]}
            />
          </View>

          <Pressable
            onPress={() => Alert.alert("Search", "Search is coming soon")}
            style={{
              marginTop: 12,
              borderRadius: 18,
              backgroundColor: surface,
              borderWidth: 1,
              borderColor: border,
              paddingHorizontal: 14,
              paddingVertical: 12,
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
            accessibilityLabel="Search payments"
          >
            <Search size={18} color={textMuted} />
            <Text style={{ color: textMuted, fontSize: 13, fontWeight: "700" }}>
              Search
            </Text>
          </Pressable>
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
            {rows.map((r) => (
              <PaymentRow
                key={r.title}
                title={r.title}
                subtitle={r.subtitle}
                amount={r.amount}
                direction={r.direction}
                onPress={() => openDetails(r)}
              />
            ))}

            {rows.length === 0 ? (
              <View style={{ paddingVertical: 18 }}>
                <Text style={{ color: textMuted, fontWeight: "700" }}>
                  No payments in this filter.
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
