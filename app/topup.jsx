import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { X, Plus, Check } from "lucide-react-native";
import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";
import { apiFetch } from "@/utils/apiFetch";

export default function TopUp() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [amount, setAmount] = useState("");

  const background = "#F8F9FA";
  const surface = "#FFFFFF";
  const textPrimary = "#0B0F14";
  const textMuted = "rgba(11,15,20,0.60)";
  const border = "rgba(11,15,20,0.08)";
  const accent = "#0786FD";

  const quickAmounts = ["50", "100", "200", "500"];

  const amountNumber = useMemo(() => {
    const n = Number.parseFloat(amount);
    if (!Number.isFinite(n)) return 0;
    return n;
  }, [amount]);

  const topUpMutation = useMutation({
    mutationFn: async (data) => {
      return apiFetch("/api/v1/wallets/topups", {
        method: "POST",
        idempotent: true,
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["v1-wallets"] });
      queryClient.invalidateQueries({ queryKey: ["v1-transactions"] });
      setTimeout(() => router.back(), 1500);
    },
  });

  const handleTopUp = () => {
    topUpMutation.mutate({
      amount: amountNumber.toFixed(2),
      currency: "USD",
      method: "card",
      sourceRef: "MOCK_CARD_4242",
    });
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
          ${amountNumber.toFixed(2)} added to your wallet
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
            Top-up wallet
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

        {/* Quick amounts */}
        <View>
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
            {quickAmounts.map((amt) => (
              <Pressable
                key={amt}
                onPress={() => setAmount(amt)}
                disabled={topUpMutation.isPending}
                style={{
                  flex: 1,
                  backgroundColor: surface,
                  borderWidth: 2,
                  borderColor: amount === amt ? accent : border,
                  borderRadius: 14,
                  paddingVertical: 16,
                  alignItems: "center",
                  opacity: topUpMutation.isPending ? 0.6 : 1,
                }}
              >
                <Text
                  style={{
                    color: amount === amt ? accent : textPrimary,
                    fontSize: 16,
                    fontWeight: "700",
                  }}
                >
                  ${amt}
                </Text>
              </Pressable>
            ))}
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
            Custom amount
          </Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
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

        {/* Payment method */}
        <View style={{ marginTop: 20 }}>
          <Text
            style={{
              color: textPrimary,
              fontSize: 14,
              fontWeight: "600",
              marginBottom: 8,
            }}
          >
            Payment method
          </Text>
          <View
            style={{
              backgroundColor: surface,
              borderWidth: 1,
              borderColor: border,
              borderRadius: 14,
              padding: 16,
            }}
          >
            <Text
              style={{ color: textPrimary, fontSize: 15, fontWeight: "600" }}
            >
              •••• 4242
            </Text>
            <Text
              style={{
                color: textMuted,
                fontSize: 13,
                fontWeight: "500",
                marginTop: 2,
              }}
            >
              Visa ending in 4242
            </Text>
          </View>
        </View>

        {/* Top-up Button */}
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
              : `Add $${amountNumber > 0 ? amountNumber.toFixed(2) : "0.00"}`}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingAnimatedView>
  );
}
