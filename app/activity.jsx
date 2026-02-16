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
import { useQuery } from "@tanstack/react-query";
import { X, Clock, ChevronRight } from "lucide-react-native";
import { useMemo } from "react";
import { apiFetch } from "@/utils/apiFetch";

export default function Activity() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const background = "#F8F9FA";
  const surface = "#FFFFFF";
  const textPrimary = "#0B0F14";
  const textMuted = "rgba(11,15,20,0.60)";
  const border = "rgba(11,15,20,0.08)";
  const accent = "#0786FD";

  const { data: transactionsData, isLoading } = useQuery({
    queryKey: ["v1-transactions", 100],
    queryFn: async () => {
      return apiFetch("/api/v1/transactions?limit=100");
    },
  });

  const allActivity = useMemo(() => {
    const items = transactionsData?.items || [];

    return items.map((txn) => {
      const date = new Date(txn.createdAt);
      const now = new Date();
      const diffHours = (now - date) / (1000 * 60 * 60);

      let formattedDate;
      if (diffHours < 24) {
        formattedDate = `Today · ${date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })}`;
      } else if (diffHours < 48) {
        formattedDate = `Yesterday · ${date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })}`;
      } else {
        formattedDate = `${date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })} · ${date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })}`;
      }

      const prefix = txn.direction === "in" ? "+" : "-";
      const symbol =
        txn.currency === "EUR" ? "€" : txn.currency === "LBP" ? "LBP " : "$";
      const amountText = `${prefix}${symbol}${Number(txn.amount).toFixed(txn.currency === "LBP" ? 0 : 2)}`;

      return {
        title: txn.description,
        subtitle: formattedDate,
        amount: amountText,
        kind: txn.direction,
      };
    });
  }, [transactionsData]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: background,
        paddingTop: insets.top,
      }}
    >
      <StatusBar style="dark" />

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
            <Clock size={18} color={accent} strokeWidth={2.5} />
          </View>
          <Text style={{ color: textPrimary, fontSize: 18, fontWeight: "700" }}>
            All activity
          </Text>
        </View>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <X size={24} color={textPrimary} />
        </Pressable>
      </View>

      {isLoading ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator size="large" color={accent} />
        </View>
      ) : (
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
              borderRadius: 20,
              paddingHorizontal: 14,
              paddingBottom: 6,
            }}
          >
            {allActivity.length === 0 ? (
              <View style={{ padding: 40, alignItems: "center" }}>
                <Text
                  style={{ color: textMuted, fontSize: 14, fontWeight: "500" }}
                >
                  No transactions yet
                </Text>
              </View>
            ) : (
              allActivity.map((item, idx) => (
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
                        fontWeight: "500",
                      }}
                    >
                      {item.title}
                    </Text>
                    <Text
                      style={{
                        marginTop: 3,
                        color: textMuted,
                        fontSize: 12,
                        fontWeight: "600",
                      }}
                    >
                      {item.subtitle}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <Text
                      style={{
                        color: item.kind === "in" ? "#1B9460" : "#FF5A6A",
                        fontSize: 14,
                        fontWeight: "500",
                      }}
                    >
                      {item.amount}
                    </Text>
                    <ChevronRight size={18} color={textMuted} />
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
