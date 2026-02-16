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
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { X, ArrowLeftRight, Check } from "lucide-react-native";
import { useState, useMemo } from "react";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";
import { apiFetch } from "@/utils/apiFetch";

export default function Exchange() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [fromAmount, setFromAmount] = useState("");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");

  const background = "#F8F9FA";
  const surface = "#FFFFFF";
  const textPrimary = "#0B0F14";
  const textMuted = "rgba(11,15,20,0.60)";
  const border = "rgba(11,15,20,0.08)";
  const accent = "#0786FD";

  const fromAmountNumber = useMemo(() => {
    const n = Number.parseFloat(fromAmount);
    if (!Number.isFinite(n)) return 0;
    return n;
  }, [fromAmount]);

  // Fetch wallet balance (v1)
  const { data: balanceData } = useQuery({
    queryKey: ["v1-wallets"],
    queryFn: async () => apiFetch("/api/v1/wallets"),
  });

  const availableBalance = useMemo(() => {
    if (!balanceData?.wallets) return 0;
    const wallet = balanceData.wallets.find((w) => w.currency === fromCurrency);
    return wallet ? Number(wallet.balance) : 0;
  }, [balanceData, fromCurrency]);

  // Quote (v1)
  const { data: quoteData, isFetching: quoteFetching } = useQuery({
    queryKey: ["v1-fx-quote", fromCurrency, toCurrency, fromAmount],
    enabled: fromAmountNumber > 0 && fromCurrency !== toCurrency,
    queryFn: async () => {
      const amountStr = fromAmountNumber.toFixed(2);
      return apiFetch(
        `/api/v1/fx/quote?from=${fromCurrency}&to=${toCurrency}&amount=${amountStr}`,
      );
    },
  });

  const quote = quoteData?.quote || null;

  const rate = useMemo(() => {
    const r = Number(quote?.rate);
    if (Number.isFinite(r)) return r;
    return 1;
  }, [quote]);

  const toAmount = useMemo(() => {
    if (quote?.toAmount) return quote.toAmount;
    if (fromAmountNumber <= 0) return "0.00";
    return (fromAmountNumber * rate).toFixed(2);
  }, [quote, fromAmountNumber, rate]);

  const feeDisplay = useMemo(() => {
    if (quote?.fee) return `${quote.fee} ${toCurrency}`;
    if (fromAmountNumber <= 0) return `0.00 ${toCurrency}`;
    return (fromAmountNumber * 0.01).toFixed(2) + ` ${toCurrency}`;
  }, [quote, fromAmountNumber, toCurrency]);

  const exchangeMutation = useMutation({
    mutationFn: async () => {
      const qid = quote?.id;
      if (!qid) {
        throw new Error("Could not get an FX quote. Please enter an amount.");
      }
      return apiFetch("/api/v1/fx/exchanges", {
        method: "POST",
        idempotent: true,
        body: { quoteId: qid },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["v1-wallets"] });
      queryClient.invalidateQueries({ queryKey: ["v1-transactions"] });
      setTimeout(() => router.back(), 1500);
    },
  });

  const handleExchange = () => {
    exchangeMutation.mutate();
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  if (exchangeMutation.isSuccess) {
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
          Exchange complete!
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
          Exchanged {fromCurrency} {fromAmount} to {toCurrency} {toAmount}
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
            <ArrowLeftRight size={18} color={accent} strokeWidth={2.5} />
          </View>
          <Text style={{ color: textPrimary, fontSize: 18, fontWeight: "700" }}>
            Exchange currency
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
        {/* Error Message */}
        {exchangeMutation.isError && (
          <View
            style={{
              backgroundColor: "#FEE2E2",
              borderRadius: 12,
              padding: 14,
              marginBottom: 20,
            }}
          >
            <Text style={{ color: "#DC2626", fontSize: 13, fontWeight: "600" }}>
              {exchangeMutation.error?.message || "Failed to exchange"}
            </Text>
          </View>
        )}

        <View
          style={{
            backgroundColor: surface,
            borderWidth: 1,
            borderColor: border,
            borderRadius: 20,
            padding: 16,
          }}
        >
          <Text style={{ color: textMuted, fontSize: 13, fontWeight: "600" }}>
            From
          </Text>
          <View
            style={{
              marginTop: 8,
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
            }}
          >
            <TextInput
              value={fromAmount}
              onChangeText={setFromAmount}
              placeholder="0.00"
              placeholderTextColor={textMuted}
              keyboardType="decimal-pad"
              editable={!exchangeMutation.isPending}
              style={{
                flex: 1,
                fontSize: 28,
                fontWeight: "600",
                color: textPrimary,
              }}
            />
            <Text
              style={{ fontSize: 18, fontWeight: "600", color: textPrimary }}
            >
              {fromCurrency}
            </Text>
          </View>
          <Text
            style={{
              color: textMuted,
              fontSize: 12,
              fontWeight: "500",
              marginTop: 8,
            }}
          >
            Available: {availableBalance.toFixed(2)} {fromCurrency}
          </Text>
        </View>

        <View style={{ alignItems: "center", marginVertical: 16 }}>
          <Pressable
            onPress={swapCurrencies}
            disabled={exchangeMutation.isPending}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: surface,
              borderWidth: 1,
              borderColor: border,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ArrowLeftRight size={20} color={accent} />
          </Pressable>
        </View>

        <View
          style={{
            backgroundColor: surface,
            borderWidth: 1,
            borderColor: border,
            borderRadius: 20,
            padding: 16,
          }}
        >
          <Text style={{ color: textMuted, fontSize: 13, fontWeight: "600" }}>
            To
          </Text>
          <View
            style={{
              marginTop: 8,
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
            }}
          >
            <Text
              style={{
                flex: 1,
                fontSize: 28,
                fontWeight: "600",
                color: textPrimary,
              }}
            >
              {toAmount}
            </Text>
            <Text
              style={{ fontSize: 18, fontWeight: "600", color: textPrimary }}
            >
              {toCurrency}
            </Text>
          </View>
        </View>

        <View style={{ marginTop: 16 }}>
          <View
            style={{
              backgroundColor: surface,
              borderWidth: 1,
              borderColor: border,
              borderRadius: 14,
              padding: 16,
              gap: 12,
            }}
          >
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text
                style={{ color: textMuted, fontSize: 13, fontWeight: "500" }}
              >
                Exchange rate
              </Text>
              <Text
                style={{ color: textPrimary, fontSize: 13, fontWeight: "600" }}
              >
                1 {fromCurrency} = {rate.toFixed(4)} {toCurrency}
              </Text>
            </View>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text
                style={{ color: textMuted, fontSize: 13, fontWeight: "500" }}
              >
                Fee (1%)
              </Text>
              <Text
                style={{ color: textPrimary, fontSize: 13, fontWeight: "600" }}
              >
                {feeDisplay}
              </Text>
            </View>
          </View>
        </View>

        <Pressable
          onPress={handleExchange}
          disabled={
            fromAmountNumber <= 0 ||
            fromAmountNumber > availableBalance ||
            fromCurrency === toCurrency ||
            exchangeMutation.isPending ||
            quoteFetching
          }
          style={{
            marginTop: 32,
            backgroundColor:
              fromAmountNumber > 0 &&
              fromAmountNumber <= availableBalance &&
              fromCurrency !== toCurrency &&
              !exchangeMutation.isPending &&
              !quoteFetching
                ? accent
                : "#E5E7EB",
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
            gap: 10,
          }}
        >
          {(exchangeMutation.isPending || quoteFetching) && (
            <ActivityIndicator size="small" color="#FFFFFF" />
          )}
          <Text
            style={{
              color:
                fromAmountNumber > 0 &&
                fromAmountNumber <= availableBalance &&
                fromCurrency !== toCurrency &&
                !exchangeMutation.isPending &&
                !quoteFetching
                  ? "#FFFFFF"
                  : textMuted,
              fontSize: 16,
              fontWeight: "700",
            }}
          >
            {exchangeMutation.isPending
              ? "Exchanging..."
              : quoteFetching
                ? "Getting quote..."
                : "Exchange"}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingAnimatedView>
  );
}
