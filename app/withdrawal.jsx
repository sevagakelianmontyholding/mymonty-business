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
import {
  X,
  Banknote,
  Check,
  Users,
  Smartphone,
  ChevronRight,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";
import { apiFetch } from "@/utils/apiFetch";

function currencySymbol(curr) {
  if (curr === "USD") return "$";
  return "LBP ";
}

function toAmountString(curr, amountNumber) {
  if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
    return curr === "LBP" ? "0" : "0.00";
  }
  if (curr === "LBP") return String(Math.round(amountNumber));
  return amountNumber.toFixed(2);
}

export default function Withdrawal() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [channel, setChannel] = useState("agent"); // agent | cardless_atm
  const [provider, setProvider] = useState("mymonty_agent");
  const [currency, setCurrency] = useState("USD");
  const [amount, setAmount] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const background = "#F8F9FA";
  const surface = "#FFFFFF";
  const textPrimary = "#0B0F14";
  const textMuted = "rgba(11,15,20,0.60)";
  const border = "rgba(11,15,20,0.08)";
  const accent = "#0786FD";

  const agentProviders = useMemo(() => {
    return [
      { id: "mymonty_agent", name: "MyMonty Agent" },
      { id: "omt", name: "OMT" },
    ];
  }, []);

  const atmProviders = useMemo(() => {
    return [
      { id: "fransabank_atm", name: "Fransabank ATM" },
      { id: "mymonty_atm", name: "MyMonty ATM" },
    ];
  }, []);

  const providers = channel === "agent" ? agentProviders : atmProviders;

  const amountNumber = useMemo(() => {
    const n = Number.parseFloat(amount);
    if (!Number.isFinite(n)) return 0;
    return n;
  }, [amount]);

  const effectiveAmountNumber = useMemo(() => {
    if (currency === "LBP") {
      return Math.round(amountNumber);
    }
    return amountNumber;
  }, [currency, amountNumber]);

  const amountStr = useMemo(() => {
    return toAmountString(currency, amountNumber);
  }, [currency, amountNumber]);

  const symbol = useMemo(() => currencySymbol(currency), [currency]);

  const { data: balanceData } = useQuery({
    queryKey: ["v1-wallets"],
    queryFn: async () => apiFetch("/api/v1/wallets"),
  });

  const available = useMemo(() => {
    const wallets = balanceData?.wallets || [];
    const wallet = wallets.find((w) => w.currency === currency);
    return wallet ? Number(wallet.balance) : 0;
  }, [balanceData, currency]);

  const withdrawMutation = useMutation({
    mutationFn: async () => {
      const method = channel === "agent" ? "cash_agent" : "cardless_atm";
      const destination = {
        provider,
        phoneNumber: phoneNumber || null,
      };

      return apiFetch("/api/v1/wallets/withdrawals", {
        method: "POST",
        idempotent: true,
        body: {
          amount: amountStr,
          currency,
          method,
          destination,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["v1-wallets"] });
      queryClient.invalidateQueries({ queryKey: ["v1-transactions"] });
      setTimeout(() => router.back(), 1500);
    },
  });

  const providerName = useMemo(() => {
    const found = providers.find((p) => p.id === provider);
    return found ? found.name : "";
  }, [provider, providers]);

  const channelLabel = useMemo(() => {
    if (channel === "agent") return "Agent";
    return "Cardless ATM";
  }, [channel]);

  const helperText = useMemo(() => {
    if (channel === "agent") {
      return "You will pick up cash at the selected agent.";
    }
    return "You will withdraw cash at the selected ATM.";
  }, [channel]);

  const canSubmit = useMemo(() => {
    if (withdrawMutation.isPending) return false;
    if (!provider) return false;
    if (effectiveAmountNumber <= 0) return false;
    if (effectiveAmountNumber > available) return false;
    return true;
  }, [withdrawMutation.isPending, provider, effectiveAmountNumber, available]);

  const submitLabel = useMemo(() => {
    if (withdrawMutation.isPending) return "Processing...";
    return `Withdraw ${symbol}${amountStr}`;
  }, [withdrawMutation.isPending, symbol, amountStr]);

  if (withdrawMutation.isSuccess) {
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
          Withdrawal initiated!
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
          {amountStr} via {channelLabel}
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
            <Banknote size={18} color={accent} strokeWidth={2.5} />
          </View>
          <Text style={{ color: textPrimary, fontSize: 18, fontWeight: "700" }}>
            Withdraw funds
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
        {withdrawMutation.isError && (
          <View
            style={{
              backgroundColor: "#FEE2E2",
              borderRadius: 12,
              padding: 14,
              marginBottom: 20,
            }}
          >
            <Text style={{ color: "#DC2626", fontSize: 13, fontWeight: "600" }}>
              {withdrawMutation.error?.message || "Failed to withdraw"}
            </Text>
          </View>
        )}

        {/* Withdrawal channel */}
        <View>
          <Text
            style={{
              color: textPrimary,
              fontSize: 14,
              fontWeight: "600",
              marginBottom: 8,
            }}
          >
            Withdraw through
          </Text>
          <View style={{ gap: 10 }}>
            <Pressable
              onPress={() => {
                setChannel("agent");
                setProvider("mymonty_agent");
              }}
              disabled={withdrawMutation.isPending}
              style={{
                backgroundColor: surface,
                borderWidth: 2,
                borderColor: channel === "agent" ? accent : border,
                borderRadius: 14,
                padding: 16,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                opacity: withdrawMutation.isPending ? 0.6 : 1,
              }}
            >
              <Users size={20} color={textPrimary} />
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: textPrimary,
                    fontSize: 15,
                    fontWeight: "700",
                  }}
                >
                  Agent
                </Text>
                <Text
                  style={{
                    color: textMuted,
                    fontSize: 13,
                    fontWeight: "600",
                    marginTop: 2,
                  }}
                >
                  Cash pickup at an agent location
                </Text>
              </View>
              <ChevronRight size={18} color={textMuted} />
            </Pressable>

            <Pressable
              onPress={() => {
                setChannel("cardless_atm");
                setProvider("fransabank_atm");
              }}
              disabled={withdrawMutation.isPending}
              style={{
                backgroundColor: surface,
                borderWidth: 2,
                borderColor: channel === "cardless_atm" ? accent : border,
                borderRadius: 14,
                padding: 16,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                opacity: withdrawMutation.isPending ? 0.6 : 1,
              }}
            >
              <Smartphone size={20} color={textPrimary} />
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: textPrimary,
                    fontSize: 15,
                    fontWeight: "700",
                  }}
                >
                  Cardless ATM
                </Text>
                <Text
                  style={{
                    color: textMuted,
                    fontSize: 13,
                    fontWeight: "600",
                    marginTop: 2,
                  }}
                >
                  Withdraw cash at an ATM without a card
                </Text>
              </View>
              <ChevronRight size={18} color={textMuted} />
            </Pressable>
          </View>
          <Text
            style={{
              marginTop: 10,
              color: textMuted,
              fontSize: 12,
              fontWeight: "600",
            }}
          >
            {helperText}
          </Text>
        </View>

        {/* Provider */}
        <View style={{ marginTop: 20 }}>
          <Text
            style={{
              color: textPrimary,
              fontSize: 14,
              fontWeight: "600",
              marginBottom: 8,
            }}
          >
            {channel === "agent" ? "Select agent" : "Select ATM"}
          </Text>

          <View style={{ gap: 10 }}>
            {providers.map((p) => {
              const selected = provider === p.id;
              const borderColor = selected ? accent : border;
              return (
                <Pressable
                  key={p.id}
                  onPress={() => setProvider(p.id)}
                  disabled={withdrawMutation.isPending}
                  style={{
                    backgroundColor: surface,
                    borderWidth: 2,
                    borderColor,
                    borderRadius: 14,
                    padding: 16,
                    opacity: withdrawMutation.isPending ? 0.6 : 1,
                  }}
                >
                  <Text
                    style={{
                      color: textPrimary,
                      fontSize: 15,
                      fontWeight: "800",
                    }}
                  >
                    {p.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Currency */}
        <View style={{ marginTop: 20 }}>
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
            {["USD", "LBP"].map((curr) => {
              const selected = currency === curr;
              const bg = selected ? "#DCEDFA" : surface;
              const borderColor = selected ? accent : border;
              const color = selected ? accent : textPrimary;
              return (
                <Pressable
                  key={curr}
                  onPress={() => setCurrency(curr)}
                  disabled={withdrawMutation.isPending}
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

        {/* Amount */}
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
            editable={!withdrawMutation.isPending}
          />
          <Text
            style={{
              color: textMuted,
              fontSize: 12,
              fontWeight: "600",
              marginTop: 8,
            }}
          >
            Available balance: {symbol}
            {Number.isFinite(available) ? available : 0}
          </Text>
        </View>

        {/* Phone number */}
        <View style={{ marginTop: 20 }}>
          <Text
            style={{
              color: textPrimary,
              fontSize: 14,
              fontWeight: "600",
              marginBottom: 8,
            }}
          >
            Phone number (optional)
          </Text>
          <TextInput
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="e.g. +961 70 000 000"
            placeholderTextColor={textMuted}
            keyboardType="phone-pad"
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
            editable={!withdrawMutation.isPending}
          />
          <Text
            style={{
              marginTop: 8,
              color: textMuted,
              fontSize: 12,
              fontWeight: "600",
              lineHeight: 16,
            }}
          >
            {channel === "cardless_atm"
              ? "We may use this to send a one-time code for ATM withdrawal."
              : "We may use this for pickup confirmation."}
          </Text>
        </View>

        {/* Withdraw Button */}
        <Pressable
          onPress={() => withdrawMutation.mutate()}
          disabled={!canSubmit}
          style={{
            marginTop: 32,
            backgroundColor: canSubmit ? accent : "#E5E7EB",
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
            gap: 10,
          }}
        >
          {withdrawMutation.isPending && (
            <ActivityIndicator size="small" color="#FFFFFF" />
          )}
          <Text
            style={{
              color: canSubmit ? "#FFFFFF" : textMuted,
              fontSize: 16,
              fontWeight: "700",
            }}
          >
            {submitLabel}
          </Text>
        </Pressable>

        {/* Small summary */}
        <View
          style={{
            marginTop: 14,
            padding: 14,
            borderRadius: 14,
            backgroundColor: surface,
            borderWidth: 1,
            borderColor: border,
          }}
        >
          <Text style={{ color: textPrimary, fontSize: 13, fontWeight: "800" }}>
            Summary
          </Text>
          <Text
            style={{
              marginTop: 6,
              color: textMuted,
              fontSize: 12,
              fontWeight: "600",
              lineHeight: 16,
            }}
          >
            {channelLabel} • {providerName || ""}
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingAnimatedView>
  );
}
