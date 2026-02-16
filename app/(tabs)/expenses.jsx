import { apiFetch } from "@/utils/apiFetch";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft, Calendar, ChevronDown, Info } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Text as SvgText } from "react-native-svg";

function Segmented({ items, value, onChange }) {
  const border = "rgba(11,15,20,0.08)";
  const surface = "#FFFFFF";
  const textPrimary = "#0B0F14";
  const muted = "rgba(11,15,20,0.55)";

  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: surface,
        borderWidth: 1,
        borderColor: border,
        borderRadius: 14,
        padding: 4,
        gap: 6,
      }}
    >
      {items.map((item) => {
        const isActive = item.value === value;
        const bg = isActive ? "#E6F3FF" : "transparent";
        const textColor = isActive ? "#0786FD" : muted;

        return (
          <Pressable
            key={item.value}
            onPress={() => onChange(item.value)}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 10,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: bg,
            }}
            accessibilityLabel={item.label}
          >
            <Text style={{ color: textColor, fontSize: 12, fontWeight: "500" }}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function DonutChart({ segments, totalLabel, amountLabel, isLBP }) {
  const size = 220;
  const stroke = 36; // thicker stroke
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  const total = useMemo(() => {
    return segments.reduce((sum, s) => sum + s.value, 0);
  }, [segments]);

  let acc = 0;

  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke="#EEF0F2"
            strokeWidth={stroke}
            fill="none"
          />

          {segments.map((s, idx) => {
            const dash = total === 0 ? 0 : (c * s.value) / total;
            const dashArray = `${dash} ${c - dash}`;
            const dashOffset = -acc;

            // Calculate angle for text position (middle of segment)
            const startAngle = (acc / c) * 2 * Math.PI - Math.PI / 2;
            const sweepAngle = (dash / c) * 2 * Math.PI;
            const midAngle = startAngle + sweepAngle / 2;

            // Position text in the middle of the arc - centered vertically in the colored section
            const textRadius = r;
            const textX = size / 2 + textRadius * Math.cos(midAngle);
            const textY = size / 2 + textRadius * Math.sin(midAngle);

            // Calculate rotation to follow the arc
            const rotationDeg = (midAngle * 180) / Math.PI + 90;

            const pct = total === 0 ? 0 : Math.round((s.value / total) * 100);

            acc += dash;

            return (
              <React.Fragment key={s.label}>
                <Circle
                  cx={size / 2}
                  cy={size / 2}
                  r={r}
                  stroke={s.color}
                  strokeWidth={stroke}
                  fill="none"
                  strokeDasharray={dashArray}
                  strokeDashoffset={dashOffset}
                  originX={size / 2}
                  originY={size / 2}
                  rotation={-90}
                />
                {pct > 5 && (
                  <SvgText
                    x={textX}
                    y={textY}
                    fill="#FFFFFF"
                    fontSize="12"
                    fontWeight="500"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    rotation={rotationDeg}
                    origin={`${textX}, ${textY}`}
                  >
                    {pct}%
                  </SvgText>
                )}
              </React.Fragment>
            );
          })}
        </Svg>

        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 20,
          }}
        >
          <Text
            style={{
              color: "rgba(11,15,20,0.50)",
              fontSize: 11,
              fontWeight: "600",
            }}
          >
            {totalLabel}
          </Text>
          <Text
            style={{
              marginTop: 4,
              color: "#0B0F14",
              fontSize: isLBP ? 14 : 20,
              fontWeight: "500",
              textAlign: "center",
            }}
          >
            {amountLabel}
          </Text>
        </View>
      </View>
    </View>
  );
}

// add demo expenses so charts and color indicators show even when there is no data yet
function demoExpenseSegments(currency) {
  const demo = {
    USD: [
      { label: "Shopping", value: 2140.0, color: "#0786FD" },
      { label: "Bills", value: 1520.5, color: "#1B9460" },
      { label: "Travel", value: 880.25, color: "#F59E0B" },
      { label: "Utilities", value: 610.1, color: "#A855F7" },
      { label: "Fees", value: 149.15, color: "#F97316" },
    ],
    EUR: [
      { label: "Shopping", value: 1820.0, color: "#0786FD" },
      { label: "Bills", value: 1302.3, color: "#1B9460" },
      { label: "Travel", value: 799.0, color: "#F59E0B" },
      { label: "Utilities", value: 639.0, color: "#A855F7" },
      { label: "Fees", value: 332.0, color: "#F97316" },
    ],
    LBP: [
      { label: "Shopping", value: 52000000, color: "#0786FD" },
      { label: "Bills", value: 41000000, color: "#1B9460" },
      { label: "Travel", value: 29000000, color: "#F59E0B" },
      { label: "Utilities", value: 18000000, color: "#A855F7" },
      { label: "Fees", value: 6000000, color: "#F97316" },
    ],
  };

  return demo[currency] || demo.USD;
}

export default function Expenses() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const background = "#F1F3F5"; // darker background
  const surface = "#FFFFFF";
  const textPrimary = "#0B0F14";
  const textMuted = "rgba(11,15,20,0.60)";
  const border = "rgba(11,15,20,0.08)";
  const accent = "#0786FD"; // blue instead of purple

  const [currency, setCurrency] = useState("USD");
  const [monthYear, setMonthYear] = useState("2026-02");

  const { data: expenseData, isLoading: expensesLoading } = useQuery({
    queryKey: ["v1-expenses", monthYear, currency],
    queryFn: async () => {
      return apiFetch(
        `/api/v1/expenses?month=${monthYear}&currency=${currency}`,
      );
    },
  });

  const segments = useMemo(() => {
    const colors = {
      Shopping: "#0786FD",
      Bills: "#1B9460",
      Travel: "#F59E0B",
      Utilities: "#A855F7",
      Fees: "#F97316",
      Marketing: "#0786FD",
      Office: "#F59E0B",
    };
    const categories = expenseData?.categories || [];

    const mapped = categories.map((c) => ({
      label: c.name,
      value: Number(c.amount || 0),
      color: colors[c.name] || "#9CA3AF",
    }));

    // fallback: show demo spend so the chart/list isn't empty in a fresh account
    if (mapped.length === 0) {
      return demoExpenseSegments(currency);
    }

    return mapped;
  }, [expenseData, currency]);

  const total = useMemo(
    () => segments.reduce((sum, s) => sum + s.value, 0),
    [segments],
  );

  const formattedTotal = useMemo(() => {
    if (currency === "LBP") {
      return `LBP ${total.toFixed(0)}`;
    }
    if (currency === "EUR") {
      return `€${total.toFixed(2)}`;
    }
    return `$${total.toFixed(2)}`;
  }, [currency, total]);

  const incomeFontSize = useMemo(() => {
    return currency === "LBP" ? 16 : 22;
  }, [currency]);

  return (
    <View
      style={{ flex: 1, backgroundColor: background, paddingTop: insets.top }}
    >
      <StatusBar style="dark" />

      {/* Header (matches the screenshot style) */}
      <View
        style={{
          paddingHorizontal: 18,
          paddingTop: 10,
          paddingBottom: 12,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={{
            height: 40,
            width: 40,
            borderRadius: 14,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: surface,
            borderWidth: 1,
            borderColor: border,
          }}
          accessibilityLabel="Back"
        >
          <ArrowLeft size={18} color={textPrimary} />
        </Pressable>

        <Text style={{ color: textPrimary, fontSize: 16, fontWeight: "500" }}>
          My Expenses
        </Text>

        <Pressable
          onPress={() => {
            Alert.alert(
              "About expenses",
              "This page shows a spend breakdown by category for the selected month.",
            );
          }}
          style={{
            height: 40,
            width: 40,
            borderRadius: 14,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: surface,
            borderWidth: 1,
            borderColor: border,
          }}
          accessibilityLabel="Info"
        >
          <Info size={18} color={textPrimary} />
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 18, marginTop: 10 }}>
          <Segmented
            value={currency}
            onChange={setCurrency}
            items={[
              { label: "USD", value: "USD" },
              { label: "EUR", value: "EUR" },
              { label: "LBP", value: "LBP" },
            ]}
          />
        </View>

        {/* Income and Month on same row */}
        <View
          style={{
            paddingHorizontal: 18,
            marginTop: 14,
            flexDirection: "row",
            gap: 12,
          }}
        >
          <View
            style={{
              flex: 1,
              borderRadius: 20,
              backgroundColor: surface,
              borderWidth: 1,
              borderColor: border,
              padding: 16,
            }}
          >
            <Text style={{ color: textMuted, fontSize: 12, fontWeight: "500" }}>
              Income in January
            </Text>
            <Text
              style={{
                marginTop: 6,
                color: "#1B9460",
                fontSize: incomeFontSize,
                fontWeight: "500",
              }}
            >
              {currency === "LBP" ? "LBP 520,000,000" : "$8,250.00"}
            </Text>
          </View>

          <Pressable
            onPress={() => {
              Alert.alert("Select Month", "Choose a month to view expenses", [
                { text: "December 2025", onPress: () => {} },
                { text: "January 2026", onPress: () => {} },
                { text: "February 2026", onPress: () => {} },
                { text: "Cancel", style: "cancel" },
              ]);
            }}
            style={{
              flex: 1,
              borderRadius: 20,
              backgroundColor: surface,
              borderWidth: 1,
              borderColor: border,
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
            accessibilityLabel="Select month"
          >
            <View style={{ flex: 1 }}>
              <Text
                style={{ color: textMuted, fontSize: 12, fontWeight: "500" }}
              >
                Month
              </Text>
              <View
                style={{
                  marginTop: 4,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Calendar size={14} color={textPrimary} />
                <Text
                  style={{
                    color: textPrimary,
                    fontSize: 14,
                    fontWeight: "500",
                  }}
                >
                  January
                </Text>
              </View>
            </View>
            <ChevronDown size={18} color={textMuted} />
          </Pressable>
        </View>

        {/* Chart + list */}
        <View style={{ paddingHorizontal: 18, marginTop: 14 }}>
          <View
            style={{
              borderRadius: 20,
              backgroundColor: surface,
              borderWidth: 1,
              borderColor: border,
              padding: 16,
            }}
          >
            <Text
              style={{ color: textPrimary, fontSize: 14, fontWeight: "500" }}
            >
              Spend analysis
            </Text>
            <Text
              style={{
                marginTop: 4,
                color: textMuted,
                fontSize: 12,
                fontWeight: "500",
              }}
            >
              By category
            </Text>

            {expensesLoading ? (
              <View style={{ paddingVertical: 40, alignItems: "center" }}>
                <ActivityIndicator size="large" color={accent} />
                <Text
                  style={{
                    marginTop: 12,
                    color: textMuted,
                    fontSize: 13,
                    fontWeight: "500",
                  }}
                >
                  Loading expenses...
                </Text>
              </View>
            ) : (
              <>
                <View style={{ marginTop: 14 }}>
                  <DonutChart
                    segments={segments}
                    totalLabel="Total spent"
                    amountLabel={formattedTotal}
                    isLBP={currency === "LBP"}
                  />
                </View>

                <View style={{ marginTop: 14, gap: 12 }}>
                  {segments.map((s) => {
                    const pct =
                      total === 0 ? 0 : Math.round((s.value / total) * 100);
                    const amountText =
                      currency === "LBP"
                        ? `LBP ${s.value.toFixed(0)}`
                        : currency === "EUR"
                          ? `€${s.value.toFixed(0)}`
                          : `$${s.value.toFixed(0)}`;

                    return (
                      <View
                        key={s.label}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 10,
                          borderTopWidth: 1,
                          borderTopColor: "rgba(11,15,20,0.08)",
                          paddingTop: 12,
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 10,
                            flex: 1,
                          }}
                        >
                          <View
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: 3,
                              backgroundColor: s.color,
                            }}
                          />
                          <Text
                            style={{
                              color: textPrimary,
                              fontSize: 13,
                              fontWeight: "500",
                            }}
                          >
                            {s.label}
                          </Text>
                          <Text
                            style={{
                              color: textMuted,
                              fontSize: 12,
                              fontWeight: "500",
                            }}
                          >
                            ({pct}%)
                          </Text>
                        </View>
                        <Text
                          style={{
                            color: textPrimary,
                            fontSize: 13,
                            fontWeight: "500",
                          }}
                        >
                          {amountText}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
