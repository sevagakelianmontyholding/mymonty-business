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
import { useLocalSearchParams, useRouter } from "expo-router";
import { X, ArrowDownLeft, Check } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";
import { apiFetch } from "@/utils/apiFetch";

export default function Request() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [currency, setCurrency] = useState("USD");

  const background = "#F8F9FA";
  const surface = "#FFFFFF";
  const textPrimary = "#0B0F14";
  const textMuted = "rgba(11,15,20,0.60)";
  const border = "rgba(11,15,20,0.08)";
  const accent = "#0786FD";

  useEffect(() => {
    if (typeof params?.recipient === "string" && !recipient) {
      setRecipient(params.recipient);
    }
    if (typeof params?.amount === "string" && !amount) {
      setAmount(params.amount);
    }
    if (typeof params?.note === "string" && !note) {
      setNote(params.note);
    }
    if (typeof params?.currency === "string" && params.currency) {
      const curr = String(params.currency).toUpperCase();
      if (["USD", "EUR", "LBP"].includes(curr)) {
        setCurrency(curr);
      }
    }
  }, [params, recipient, amount, note]);

  const amountNumber = useMemo(() => {
    const n = Number.parseFloat(amount);
    if (!Number.isFinite(n)) return 0;
    return n;
  }, [amount]);

  const currencySymbol = useMemo(() => {
    if (currency === "USD") return "$";
    if (currency === "EUR") return "€";
    return "LBP ";
  }, [currency]);

  const amountString = useMemo(() => {
    if (amountNumber <= 0) {
      return currency === "LBP" ? "0" : "0.00";
    }
    if (currency === "LBP") {
      return String(Math.round(amountNumber));
    }
    return amountNumber.toFixed(2);
  }, [amountNumber, currency]);

  const requestMutation = useMutation({
    mutationFn: async (data) => {
      return apiFetch("/api/v1/transfer-requests", {
        method: "POST",
        idempotent: true,
        body: data,
      });
    },
    onSuccess: () => {
      setTimeout(() => router.back(), 1500);
    },
  });

  const handleRequest = () => {
    requestMutation.mutate({
      recipient: {
        type: "email",
        value: recipient,
      },
      amount: amountString,
      currency,
      note: note || undefined,
    });
  };

  if (requestMutation.isSuccess) {
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
            backgroundColor: "#0786FD",
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
          Request sent!
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
          Request for {currencySymbol}
          {amountString} sent to {recipient}
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
            <ArrowDownLeft size={18} color={accent} strokeWidth={2.5} />
          </View>
          <Text style={{ color: textPrimary, fontSize: 18, fontWeight: "700" }}>
            Request money
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
        {requestMutation.isError && (
          <View
            style={{
              backgroundColor: "#FEE2E2",
              borderRadius: 12,
              padding: 14,
              marginBottom: 20,
            }}
          >
            <Text style={{ color: "#DC2626", fontSize: 13, fontWeight: "600" }}>
              {requestMutation.error?.message || "Failed to request money"}
            </Text>
          </View>
        )}

        {/* From */}
        <View>
          <Text
            style={{
              color: textPrimary,
              fontSize: 14,
              fontWeight: "600",
              marginBottom: 8,
            }}
          >
            Request from
          </Text>
          <TextInput
            value={recipient}
            onChangeText={setRecipient}
            placeholder="Email or phone number"
            placeholderTextColor={textMuted}
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
            editable={!requestMutation.isPending}
          />
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
            {["USD", "EUR", "LBP"].map((curr) => {
              const selected = currency === curr;
              const bg = selected ? "#DCEDFA" : surface;
              const borderColor = selected ? accent : border;
              const color = selected ? accent : textPrimary;
              return (
                <Pressable
                  key={curr}
                  onPress={() => setCurrency(curr)}
                  disabled={requestMutation.isPending}
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
            editable={!requestMutation.isPending}
          />
        </View>

        {/* Note */}
        <View style={{ marginTop: 20 }}>
          <Text
            style={{
              color: textPrimary,
              fontSize: 14,
              fontWeight: "600",
              marginBottom: 8,
            }}
          >
            Reason (optional)
          </Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="What's this for?"
            placeholderTextColor={textMuted}
            multiline
            numberOfLines={3}
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
              textAlignVertical: "top",
            }}
            editable={!requestMutation.isPending}
          />
        </View>

        {/* Request Button */}
        <Pressable
          onPress={handleRequest}
          disabled={
            !recipient || amountNumber <= 0 || requestMutation.isPending
          }
          style={{
            marginTop: 32,
            backgroundColor:
              recipient && amountNumber > 0 && !requestMutation.isPending
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
          {requestMutation.isPending && (
            <ActivityIndicator size="small" color="#FFFFFF" />
          )}
          <Text
            style={{
              color:
                recipient && amountNumber > 0 && !requestMutation.isPending
                  ? "#FFFFFF"
                  : textMuted,
              fontSize: 16,
              fontWeight: "700",
            }}
          >
            {requestMutation.isPending
              ? "Requesting..."
              : `Request ${currencySymbol}${amountString}`}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingAnimatedView>
  );
}
