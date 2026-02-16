import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { X, Gift, ChevronRight } from "lucide-react-native";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/utils/apiFetch";

export default function Cashback() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const background = "#F8F9FA";
  const surface = "#FFFFFF";
  const textPrimary = "#0B0F14";
  const textMuted = "rgba(11,15,20,0.60)";
  const border = "rgba(11,15,20,0.08)";
  const accent = "#0786FD";

  const { data, isLoading } = useQuery({
    queryKey: ["v1-cashback"],
    queryFn: async () => {
      return apiFetch("/api/v1/transactions?type=cashback&limit=200");
    },
  });

  const rewards = useMemo(() => {
    const items = data?.items || [];

    return items.map((t) => {
      const created = new Date(t.createdAt);
      const date = created.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      return {
        merchant: t.description || "Cash-back",
        category: "Rewards",
        rate: "—",
        earned: `+$${Number(t.amount).toFixed(2)}`,
        date,
      };
    });
  }, [data]);

  const totalEarned = useMemo(() => {
    return rewards.reduce(
      (sum, r) => sum + parseFloat(r.earned.replace(/[+$]/g, "")),
      0,
    );
  }, [rewards]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: background,
        paddingTop: insets.top,
      }}
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
            <Gift size={18} color={accent} strokeWidth={2.5} />
          </View>
          <Text style={{ color: textPrimary, fontSize: 18, fontWeight: "700" }}>
            Cash-back rewards
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
        {/* Total earned */}
        <View
          style={{
            backgroundColor: surface,
            borderWidth: 1,
            borderColor: border,
            borderRadius: 20,
            padding: 20,
          }}
        >
          <Text style={{ color: textMuted, fontSize: 13, fontWeight: "600" }}>
            Total earned this month
          </Text>
          <Text
            style={{
              marginTop: 6,
              color: "#1B9460",
              fontSize: 32,
              fontWeight: "700",
            }}
          >
            ${totalEarned.toFixed(2)}
          </Text>
        </View>

        {/* Rewards list */}
        <View style={{ marginTop: 20 }}>
          <Text
            style={{
              color: textPrimary,
              fontSize: 14,
              fontWeight: "600",
              marginBottom: 12,
            }}
          >
            Recent rewards
          </Text>
          <View
            style={{
              backgroundColor: surface,
              borderWidth: 1,
              borderColor: border,
              borderRadius: 20,
              paddingHorizontal: 14,
              paddingBottom: 6,
            }}
          >
            {isLoading ? (
              <ActivityIndicator
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                }}
                size="large"
                color={accent}
              />
            ) : (
              rewards.map((reward, idx) => (
                <View
                  key={idx}
                  style={{
                    paddingVertical: 14,
                    borderTopWidth: idx === 0 ? 0 : 1,
                    borderTopColor: border,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: textPrimary,
                        fontSize: 14,
                        fontWeight: "600",
                      }}
                    >
                      {reward.merchant}
                    </Text>
                    <Text
                      style={{
                        marginTop: 3,
                        color: textMuted,
                        fontSize: 12,
                        fontWeight: "500",
                      }}
                    >
                      {reward.category} · {reward.rate} cash-back
                    </Text>
                  </View>
                  <View
                    style={{
                      alignItems: "flex-end",
                      flexDirection: "row",
                      gap: 10,
                    }}
                  >
                    <View style={{ alignItems: "flex-end" }}>
                      <Text
                        style={{
                          color: "#1B9460",
                          fontSize: 14,
                          fontWeight: "700",
                        }}
                      >
                        {reward.earned}
                      </Text>
                      <Text
                        style={{
                          marginTop: 2,
                          color: textMuted,
                          fontSize: 11,
                          fontWeight: "500",
                        }}
                      >
                        {reward.date}
                      </Text>
                    </View>
                    <ChevronRight size={18} color={textMuted} />
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
