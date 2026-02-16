import React, { useEffect, useMemo, useState } from "react";
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/utils/apiFetch";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";
import { X, ArrowUpRight, Check } from "lucide-react-native";

function currencySymbol(currency) {
  if (currency === "EUR") return "€";
  if (currency === "LBP") return "LBP ";
  return "$";
}

function SegmentedCurrency({ value, onChange, disabled }) {
  const border = "rgba(11,15,20,0.08)";
  const surface = "#FFFFFF";
  const muted = "rgba(11,15,20,0.55)";

  const items = [
    { label: "USD", value: "USD" },
    { label: "EUR", value: "EUR" },
    { label: "LBP", value: "LBP" },
  ];

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
        opacity: disabled ? 0.6 : 1,
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
            disabled={disabled}
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

export default function Send() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const queryClient = useQueryClient();

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
    if (typeof params?.currency === "string") {
      const upper = params.currency.toUpperCase();
      const supported = ["USD", "EUR", "LBP"];
      const nextCurrency = supported.includes(upper) ? upper : null;
      if (nextCurrency && nextCurrency !== currency) {
        setCurrency(nextCurrency);
      }
    }
  }, [params, recipient, amount, note, currency]);

  const amountNumber = useMemo(() => {
    const n = Number.parseFloat(amount);
    if (!Number.isFinite(n)) return 0;
    return n;
  }, [amount]);

  const amountString = useMemo(() => {
    if (amountNumber <= 0) {
      return currency === "LBP" ? "0" : "0.00";
    }
    if (currency === "LBP") {
      return String(Math.round(amountNumber));
    }
    return amountNumber.toFixed(2);
  }, [amountNumber, currency]);

  const sendMutation = useMutation({
    mutationFn: async (data) => {
      return apiFetch("/api/v1/transfers", {
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

  const handleSend = () => {
    sendMutation.mutate({
      recipient: {
        type: recipient.includes("@") ? "email" : "phone",
        value: recipient,
      },
      amount: amountString,
      currency,
      note: note || undefined,
    });
  };

  if (sendMutation.isSuccess) {
    const sym = currencySymbol(currency);
    const sentText =
      currency === "LBP" ? amountString : Number(amountString).toFixed(2);

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
          Payment sent!
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
          {sym}
          {sentText} sent to {recipient}
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
            <ArrowUpRight size={18} color={accent} strokeWidth={2.5} />
          </View>
          <Text style={{ color: textPrimary, fontSize: 18, fontWeight: "700" }}>
            Send money
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
        {sendMutation.isError && (
          <View
            style={{
              backgroundColor: "#FEE2E2",
              borderRadius: 12,
              padding: 14,
              marginBottom: 20,
            }}
          >
            <Text style={{ color: "#DC2626", fontSize: 13, fontWeight: "600" }}>
              {sendMutation.error?.message || "Failed to send money"}
            </Text>
          </View>
        )}

        {/* Recipient */}
        <View>
          <Text
            style={{
              color: textPrimary,
              fontSize: 14,
              fontWeight: "600",
              marginBottom: 8,
            }}
          >
            Recipient
          </Text>
          <TextInput
            value={recipient}
            onChangeText={setRecipient}
            placeholder="Email or phone number"
            placeholderTextColor={textMuted}
            editable={!sendMutation.isPending}
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
          <SegmentedCurrency
            value={currency}
            onChange={setCurrency}
            disabled={sendMutation.isPending}
          />
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
            editable={!sendMutation.isPending}
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
          />
          <Text
            style={{
              marginTop: 8,
              color: textMuted,
              fontSize: 12,
              fontWeight: "500",
            }}
          >
            You will send {currencySymbol(currency)}
            {amountString}
          </Text>
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
            Note (optional)
          </Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="What's this for?"
            placeholderTextColor={textMuted}
            multiline
            numberOfLines={3}
            editable={!sendMutation.isPending}
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
          />
        </View>

        {/* Send Button */}
        <Pressable
          onPress={handleSend}
          disabled={!recipient || amountNumber <= 0 || sendMutation.isPending}
          style={{
            marginTop: 32,
            backgroundColor:
              recipient && amountNumber > 0 && !sendMutation.isPending
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
          {sendMutation.isPending && (
            <ActivityIndicator size="small" color="#FFFFFF" />
          )}
          <Text
            style={{
              color:
                recipient && amountNumber > 0 && !sendMutation.isPending
                  ? "#FFFFFF"
                  : textMuted,
              fontSize: 16,
              fontWeight: "700",
            }}
          >
            {sendMutation.isPending
              ? "Sending..."
              : `Send ${currencySymbol(currency)}${amountString}`}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingAnimatedView>
  );
}
