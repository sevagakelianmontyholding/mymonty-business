import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams, useRouter } from "expo-router";
import { X, Plus, Check } from "lucide-react-native";
import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";
import { apiFetch } from "@/utils/apiFetch";

function currencySymbol(curr) {
  if (curr === "USD") return "$";
  if (curr === "EUR") return "€";
  return "LBP ";
}

function toAmountString(curr, amountNumber) {
  if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
    return curr === "LBP" ? "0" : "0.00";
  }
  if (curr === "LBP") return String(Math.round(amountNumber));
  return amountNumber.toFixed(2);
}

export default function TopUpFlow() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const queryClient = useQueryClient();

  const paramTitle =
    typeof params?.title === "string" ? params.title : "Top up";
  const method = typeof params?.method === "string" ? params.method : "card";
  const sourceRef =
    typeof params?.sourceRef === "string" ? params.sourceRef : "MOCK_SOURCE";

  const [currency, setCurrency] = useState("USD");
  const [amount, setAmount] = useState("");

  const background = "#F8F9FA";
  const surface = "#FFFFFF";
  const textPrimary = "#0B0F14";
  const textMuted = "rgba(11,15,20,0.60)";
  const border = "rgba(11,15,20,0.08)";
  const accent = "#0786FD";

  const quickAmounts = useMemo(() => {
    if (currency === "LBP") {
      return ["500000", "1000000", "2000000", "5000000"]; // demo-friendly
    }
    return ["50", "100", "200", "500"];
  }, [currency]);

  const amountNumber = useMemo(() => {
    const n = Number.parseFloat(amount);
    if (!Number.isFinite(n)) return 0;
    return n;
  }, [amount]);

  const amountStr = useMemo(() => {
    return toAmountString(currency, amountNumber);
  }, [currency, amountNumber]);

  const symbol = useMemo(() => currencySymbol(currency), [currency]);

  const topUpMutation = useMutation({
    mutationFn: async () => {
      return apiFetch("/api/v1/wallets/topups", {
        method: "POST",
        idempotent: true,
        body: {
          amount: amountStr,
          currency,
          method,
          sourceRef,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["v1-wallets"] });
      queryClient.invalidateQueries({ queryKey: ["v1-transactions"] });
      setTimeout(() => router.back(), 1500);
    },
  });

  const safeMethodLabel = useMemo(() => {
    if (method === "cash_agent") return "cash agent";
    if (method === "bank_transfer") return "bank transfer";
    if (method === "card") return "card";
    return method;
  }, [method]);

  const handleTopUp = () => {
    if (!currency || amountNumber <= 0) return;

    if (!["card", "cash_agent", "bank_transfer"].includes(method)) {
      Alert.alert(
        "Not supported yet",
        "This top-up method isn't wired to the backend yet.",
      );
      return;
    }

    topUpMutation.mutate();
  };

  if (topUpMutation.isSuccess) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: background,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 24,
        }}
      >
        <StatusBar style="dark" />
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: "#1B9460",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
          }}
        >
          <Check size={40} color="#FFFFFF" strokeWidth={3} />
        </View>
        <Text
          style={{
            color: textPrimary,
            fontSize: 24,
            fontWeight: "700",
            textAlign: "center",
          }}
        >
          Funds added!
        </Text>
        <Text
          style={{
            marginTop: 8,
            color: textMuted,
            fontSize: 14,
            fontWeight: "500",
            textAlign: "center",
          }}
        >
          {symbol}
          {amountStr} added via {safeMethodLabel}
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingAnimatedView
      style={{ flex: 1, backgroundColor: background, paddingTop: insets.top }}
      behavior="padding"
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
            <Plus size={18} color={accent} strokeWidth={2.5} />
          </View>
          <Text style={{ color: textPrimary, fontSize: 18, fontWeight: "700" }}>
            {paramTitle}
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
        {topUpMutation.isError && (
          <View
            style={{
              backgroundColor: "#FEE2E2",
              borderRadius: 12,
              padding: 14,
              marginBottom: 20,
            }}
          >
            <Text style={{ color: "#DC2626", fontSize: 13, fontWeight: "600" }}>
              {topUpMutation.error?.message || "Failed to top-up"}
            </Text>
          </View>
        )}

        {/* Currency */}
        <View>
          <Text
            style={{
              color: textPrimary,
              fontSize: 14,
              fontWeight: "600",
              marginBottom: 8,
            }}
          >
            Currency
          </Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            {["USD", "EUR", "LBP"].map((curr) => {
              const selected = currency === curr;
              const bg = selected ? "#DCEDFA" : surface;
              const borderColor = selected ? accent : border;
              const color = selected ? accent : textPrimary;
              return (
                <Pressable
                  key={curr}
                  onPress={() => setCurrency(curr)}
                  disabled={topUpMutation.isPending}
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
                  <Text style={{ color, fontSize: 14, fontWeight: "700" }}>
                    {curr}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Quick amounts */}
        <View style={{ marginTop: 20 }}>
          <Text
            style={{
              color: textPrimary,
              fontSize: 14,
              fontWeight: "600",
              marginBottom: 8,
            }}
          >
            Quick amounts
          </Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            {quickAmounts.map((amt) => {
              const selected = amount === amt;
              return (
                <Pressable
                  key={amt}
                  onPress={() => setAmount(amt)}
                  disabled={topUpMutation.isPending}
                  style={{
                    flex: 1,
                    backgroundColor: surface,
                    borderWidth: 2,
                    borderColor: selected ? accent : border,
                    borderRadius: 14,
                    paddingVertical: 16,
                    alignItems: "center",
                    opacity: topUpMutation.isPending ? 0.6 : 1,
                  }}
                >
                  <Text
                    style={{
                      color: selected ? accent : textPrimary,
                      fontSize: 14,
                      fontWeight: "800",
                    }}
                  >
                    {symbol}
                    {amt}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Custom amount */}
        <View style={{ marginTop: 20 }}>
          <Text
            style={{
              color: textPrimary,
              fontSize: 14,
              fontWeight: "600",
              marginBottom: 8,
            }}
          >
            Amount
          </Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            placeholder={currency === "LBP" ? "0" : "0.00"}
            placeholderTextColor={textMuted}
            keyboardType="decimal-pad"
            style={{
              backgroundColor: surface,
              borderWidth: 1,
              borderColor: border,
              borderRadius: 14,
              paddingHorizontal: 16,
              paddingVertical: 14,
              fontSize: 15,
              color: textPrimary,
              fontWeight: "500",
            }}
            editable={!topUpMutation.isPending}
          />
        </View>

        {/* Action */}
        <Pressable
          onPress={handleTopUp}
          disabled={amountNumber <= 0 || topUpMutation.isPending}
          style={{
            marginTop: 32,
            backgroundColor:
              amountNumber > 0 && !topUpMutation.isPending ? accent : "#E5E7EB",
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
            gap: 10,
          }}
        >
          {topUpMutation.isPending && (
            <ActivityIndicator size="small" color="#FFFFFF" />
          )}
          <Text
            style={{
              color:
                amountNumber > 0 && !topUpMutation.isPending
                  ? "#FFFFFF"
                  : textMuted,
              fontSize: 16,
              fontWeight: "700",
            }}
          >
            {topUpMutation.isPending
              ? "Processing..."
              : `Add ${symbol}${amountStr}`}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingAnimatedView>
  );
}
