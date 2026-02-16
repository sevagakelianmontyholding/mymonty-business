import { apiFetch } from "@/utils/apiFetch";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Gift,
  HelpCircle,
  Plus,
  QrCode,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BRAND_LOGO = require("@/assets/images/mymonty-business-logo.png");

function currencySymbol(currency) {
  if (currency === "EUR") return "€";
  if (currency === "LBP") return "LBP ";
  return "$";
}

// add demo expenses so the wallet expense color bar always shows (matches design)
function demoExpenseCategories(currency) {
  if (currency === "LBP") {
    return [
      { name: "Shopping", amount: 52000000, color: "#0786FD" },
      { name: "Bills", amount: 41000000, color: "#1B9460" },
      { name: "Travel", amount: 29000000, color: "#F59E0B" },
      { name: "Utilities", amount: 18000000, color: "#A855F7" },
      { name: "Fees", amount: 6000000, color: "#F97316" },
    ];
  }

  if (currency === "EUR") {
    // total ~€4,892.30 (like the screenshot)
    return [
      { name: "Shopping", amount: 1820.0, color: "#0786FD" },
      { name: "Bills", amount: 1302.3, color: "#1B9460" },
      { name: "Travel", amount: 799.0, color: "#F59E0B" },
      { name: "Utilities", amount: 639.0, color: "#A855F7" },
      { name: "Fees", amount: 332.0, color: "#F97316" },
    ];
  }

  // USD fallback
  return [
    { name: "Shopping", amount: 2140.0, color: "#0786FD" },
    { name: "Bills", amount: 1520.5, color: "#1B9460" },
    { name: "Travel", amount: 880.25, color: "#F59E0B" },
    { name: "Utilities", amount: 610.1, color: "#A855F7" },
    { name: "Fees", amount: 149.15, color: "#F97316" },
  ];
}

function formatMoney(currency, absAmountString, direction) {
  const sym = currencySymbol(currency);
  const abs = Number(absAmountString || 0);
  const amount = currency === "LBP" ? abs.toFixed(0) : abs.toFixed(2);
  const prefix = direction === "in" ? "+" : direction === "out" ? "-" : "";
  return `${prefix}${sym}${amount}`;
}

function QuickActionButton({ label, icon: Icon, onPress }) {
  const border = "rgba(11,15,20,0.08)";
  const textPrimary = "#0B0F14";

  return (
    <Pressable
      onPress={onPress}
      style={{
        width: 110,
        borderWidth: 1,
        borderColor: border,
        borderRadius: 16,
        paddingVertical: 14,
        paddingHorizontal: 10,
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        gap: 8,
      }}
    >
      <View
        style={{
          height: 40,
          width: 40,
          borderRadius: 14,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F1F3F5",
        }}
      >
        <Icon size={20} color="#0786FD" strokeWidth={2.5} />
      </View>
      <Text
        style={{
          color: textPrimary,
          fontSize: 12,
          fontWeight: "500",
          textAlign: "center",
        }}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {label}
      </Text>
    </Pressable>
  );
}

function RowItem({ title, subtitle, amount, kind }) {
  const border = "rgba(11,15,20,0.08)";
  const textPrimary = "#0B0F14";
  const textMuted = "rgba(11,15,20,0.60)";

  const color = useMemo(() => {
    if (kind === "in") return "#1B9460";
    if (kind === "out") return "#FF5A6A";
    return textPrimary;
  }, [kind]);

  return (
    <View
      style={{
        paddingVertical: 14,
        borderTopWidth: 1,
        borderTopColor: border,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ color: textPrimary, fontSize: 14, fontWeight: "500" }}>
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

      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Text style={{ color, fontSize: 14, fontWeight: "500" }}>{amount}</Text>
        <ChevronRight size={18} color={textMuted} />
      </View>
    </View>
  );
}

export default function Home() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const background = "#F1F3F5";
  const surface = "#FFFFFF";
  const textPrimary = "#0B0F14";
  const textMuted = "rgba(11,15,20,0.60)";
  const border = "rgba(11,15,20,0.08)";
  const accent = "#0786FD";

  const [balanceVisible, setBalanceVisible] = useState(true);
  const [currency, setCurrency] = useState("USD");

  const currencies = ["USD", "EUR", "LBP"];

  const expensesMonth = "2026-02";
  const walletExpensesCurrency = "EUR"; // show wallet expenses in EUR (matches the design)

  // Fetch wallet balance (v1)
  const { data: balanceData, isLoading: balanceLoading } = useQuery({
    queryKey: ["v1-wallets"],
    queryFn: async () => {
      return apiFetch("/api/v1/wallets");
    },
  });

  // Fetch transactions (v1)
  const { data: transactionsData } = useQuery({
    queryKey: ["v1-transactions", 8],
    queryFn: async () => {
      return apiFetch("/api/v1/transactions?limit=8");
    },
  });

  // Fetch expenses (v1)
  const { data: expensesData, isLoading: expensesLoading } = useQuery({
    queryKey: ["v1-expenses", expensesMonth, walletExpensesCurrency],
    queryFn: async () => {
      return apiFetch(
        `/api/v1/expenses?month=${expensesMonth}&currency=${walletExpensesCurrency}`,
      );
    },
  });

  const toggleCurrency = () => {
    const currentIndex = currencies.indexOf(currency);
    const nextIndex = (currentIndex + 1) % currencies.length;
    setCurrency(currencies[nextIndex]);
  };

  const balanceValue = useMemo(() => {
    if (balanceLoading || !balanceData?.wallets)
      return `${currencySymbol(currency)}0.00`;
    const wallet = balanceData.wallets.find((w) => w.currency === currency);
    if (!wallet) return `${currencySymbol(currency)}0.00`;

    const balanceN = Number(wallet.balance || 0);
    if (currency === "LBP") {
      return `${currencySymbol(currency)}${balanceN.toFixed(0)}`;
    }

    return `${currencySymbol(currency)}${balanceN.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }, [currency, balanceData, balanceLoading]);

  const balanceFontSize = useMemo(() => {
    return currency === "LBP" ? 28 : 38;
  }, [currency]);

  const walletCategories = useMemo(() => {
    const categories = expensesData?.categories || [];
    const colors = {
      Shopping: "#0786FD",
      Bills: "#1B9460",
      Travel: "#F59E0B",
      Utilities: "#A855F7",
      Fees: "#F97316",
      Marketing: "#0786FD",
      Office: "#F59E0B",
    };

    const fromApi = categories.map((c) => ({
      name: c.name,
      amount: Number(c.amount || 0),
      color: colors[c.name] || "#9CA3AF",
    }));

    // If there are no expense rows yet, show demo categories so the color bar is visible.
    if (fromApi.length === 0) {
      return demoExpenseCategories(walletExpensesCurrency);
    }

    return fromApi;
  }, [expensesData, walletExpensesCurrency]);

  const walletTotal = useMemo(() => {
    return walletCategories.reduce((sum, c) => sum + Number(c.amount || 0), 0);
  }, [walletCategories]);

  const formattedWalletTotal = useMemo(() => {
    if (walletExpensesCurrency === "LBP") {
      return `LBP ${walletTotal.toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })}`;
    }

    const sym = currencySymbol(walletExpensesCurrency);
    return `${sym}${walletTotal.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }, [walletExpensesCurrency, walletTotal]);

  const activity = useMemo(() => {
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

      return {
        title: txn.description,
        subtitle: formattedDate,
        amount: formatMoney(txn.currency, txn.amount, txn.direction),
        kind: txn.direction,
      };
    });
  }, [transactionsData]);

  return (
    <View
      style={{ flex: 1, backgroundColor: background, paddingTop: insets.top }}
    >
      <StatusBar style="dark" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View
          style={{
            paddingHorizontal: 18,
            paddingTop: 10,
            paddingBottom: 14,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <View style={{ flex: 1, paddingRight: 6 }}>
            <Image
              source={ BRAND_LOGO }
              style={{ width: 240, height: 34, flexShrink: 1 }}
              contentFit="contain"
            />
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Pressable
              onPress={() => router.push("/support")}
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
              accessibilityLabel="Support"
            >
              <HelpCircle size={18} color={textPrimary} />
            </Pressable>

            <Pressable
              onPress={() => router.push("/qrscan")}
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
              accessibilityLabel="QR Code scan"
            >
              <QrCode size={18} color={textPrimary} />
            </Pressable>
          </View>
        </View>

        {/* Balance card */}
        <View style={{ paddingHorizontal: 18 }}>
          <View
            style={{
              borderRadius: 22,
              backgroundColor: surface,
              borderWidth: 1,
              borderColor: border,
              paddingHorizontal: 16,
              paddingBottom: 16,
              paddingTop: 8,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{ color: textMuted, fontSize: 12, fontWeight: "500" }}
              >
                Total balance
              </Text>
              <Pressable
                onPress={toggleCurrency}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 999,
                  backgroundColor: "#F1F3F5",
                }}
                accessibilityLabel="Change currency"
              >
                <Text
                  style={{
                    color: textPrimary,
                    fontSize: 12,
                    fontWeight: "500",
                  }}
                >
                  {currency}
                </Text>
                <ChevronDown size={14} color={textPrimary} />
              </Pressable>
            </View>

            <View
              style={{
                marginTop: 8,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
              }}
            >
              {balanceLoading ? (
                <ActivityIndicator size="small" color={accent} />
              ) : (
                <Text
                  style={{
                    color: textPrimary,
                    fontSize: balanceFontSize,
                    fontWeight: "500",
                    letterSpacing: -0.9,
                  }}
                >
                  {balanceVisible ? balanceValue : "••••••"}
                </Text>
              )}
              <Pressable
                onPress={() => setBalanceVisible(!balanceVisible)}
                accessibilityLabel={
                  balanceVisible ? "Hide balance" : "Show balance"
                }
              >
                {balanceVisible ? (
                  <Eye size={22} color={textMuted} />
                ) : (
                  <EyeOff size={22} color={textMuted} />
                )}
              </Pressable>
            </View>

            <View
              style={{
                marginTop: 14,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <Pressable
                onPress={() => router.push("/addmoney")}
                style={{
                  flex: 1,
                  borderRadius: 16,
                  backgroundColor: "#F1F3F5",
                  paddingVertical: 12,
                  paddingHorizontal: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderWidth: 1,
                  borderColor: border,
                }}
                accessibilityLabel="Add money"
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <Plus size={18} color={textPrimary} />
                  <Text
                    style={{
                      color: textPrimary,
                      fontWeight: "500",
                      fontSize: 13,
                    }}
                  >
                    Add money
                  </Text>
                </View>
                <ChevronRight size={18} color={textMuted} />
              </Pressable>

              <Pressable
                onPress={() => router.push("/exchange")}
                style={{
                  flex: 1,
                  borderRadius: 16,
                  backgroundColor: "#F1F3F5",
                  paddingVertical: 12,
                  paddingHorizontal: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderWidth: 1,
                  borderColor: border,
                }}
                accessibilityLabel="Exchange"
              >
                <Text
                  style={{
                    color: textPrimary,
                    fontWeight: "500",
                    fontSize: 13,
                  }}
                >
                  Exchange
                </Text>
                <ChevronRight size={18} color={textMuted} />
              </Pressable>
            </View>
          </View>
        </View>

        {/* Quick actions */}
        <View style={{ marginTop: 16 }}>
          <View style={{ paddingHorizontal: 18 }}>
            <Text
              style={{ color: textPrimary, fontSize: 14, fontWeight: "500" }}
            >
              Quick actions
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 18, gap: 10 }}
            style={{ marginTop: 10, flexGrow: 0 }}
          >
            <QuickActionButton
              label="Send"
              icon={ArrowUpRight}
              onPress={() => router.push("/send")}
            />
            <QuickActionButton
              label="Request"
              icon={ArrowDownLeft}
              onPress={() => router.push("/request")}
            />
            <QuickActionButton
              label="Withdrawal"
              icon={Banknote}
              onPress={() => router.push("/withdrawal")}
            />
            <QuickActionButton
              label="Top-up"
              icon={Plus}
              onPress={() => router.push("/topup")}
            />
            <QuickActionButton
              label="Cash-back"
              icon={Gift}
              onPress={() => router.push("/cashback")}
            />
          </ScrollView>
        </View>

        {/* PFM - Wallet Expense Section */}
        <View style={{ marginTop: 18, paddingHorizontal: 18 }}>
          <View
            style={{
              borderRadius: 20,
              backgroundColor: surface,
              borderWidth: 1,
              borderColor: border,
              padding: 16,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{
                  color: textPrimary,
                  fontSize: 14,
                  fontWeight: "500",
                }}
              >
                Wallet expenses
              </Text>
              <Pressable
                onPress={() => router.push("/(tabs)/expenses")}
                accessibilityLabel="View all expenses"
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 999,
                  backgroundColor: "#DCEDFA",
                }}
              >
                <Text
                  style={{ color: accent, fontSize: 12, fontWeight: "500" }}
                >
                  View all
                </Text>
              </Pressable>
            </View>

            {expensesLoading ? (
              <View style={{ paddingVertical: 22, alignItems: "center" }}>
                <ActivityIndicator size="small" color={accent} />
                <Text
                  style={{
                    marginTop: 10,
                    color: textMuted,
                    fontSize: 12,
                    fontWeight: "600",
                  }}
                >
                  Loading wallet expenses…
                </Text>
              </View>
            ) : walletCategories.length === 0 ? (
              <View style={{ paddingVertical: 22, alignItems: "center" }}>
                <Text
                  style={{
                    color: textMuted,
                    fontSize: 12,
                    fontWeight: "600",
                  }}
                >
                  No expenses yet for this month.
                </Text>
              </View>
            ) : (
              <>
                <View
                  style={{
                    marginTop: 12,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <View>
                    <Text
                      style={{
                        color: textMuted,
                        fontSize: 12,
                        fontWeight: "500",
                      }}
                    >
                      This month
                    </Text>
                    <Text
                      style={{
                        marginTop: 4,
                        color: textPrimary,
                        fontSize: 24,
                        fontWeight: "500",
                      }}
                    >
                      {formattedWalletTotal}
                    </Text>
                  </View>
                </View>

                <View
                  style={{
                    marginTop: 14,
                    height: 12,
                    borderRadius: 999,
                    backgroundColor: "#EEF0F2",
                    overflow: "hidden",
                    flexDirection: "row",
                  }}
                >
                  {walletCategories.map((c) => (
                    <View
                      key={c.name}
                      style={{
                        flex: c.amount <= 0 ? 0.0001 : c.amount,
                        backgroundColor: c.color,
                      }}
                    />
                  ))}
                </View>

                <View style={{ marginTop: 14, gap: 10 }}>
                  {walletCategories.slice(0, 4).map((c) => {
                    const pct =
                      walletTotal <= 0
                        ? 0
                        : Math.round((c.amount / walletTotal) * 100);

                    const amountText = `€${Number(c.amount || 0).toLocaleString(
                      "en-US",
                      {
                        maximumFractionDigits: 0,
                        minimumFractionDigits: 0,
                      },
                    )}`;

                    return (
                      <View
                        key={c.name}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 10,
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
                              backgroundColor: c.color,
                            }}
                          />
                          <Text
                            style={{
                              color: textPrimary,
                              fontSize: 13,
                              fontWeight: "500",
                            }}
                          >
                            {c.name}
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

        {/* Recent activity */}
        <View style={{ marginTop: 18, paddingHorizontal: 18 }}>
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
            <View
              style={{
                paddingTop: 14,
                paddingBottom: 10,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{ color: textPrimary, fontSize: 14, fontWeight: "500" }}
              >
                Recent activity
              </Text>
              <Pressable
                onPress={() => router.push("/activity")}
                accessibilityLabel="View all activity"
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 999,
                  backgroundColor: "#DCEDFA",
                }}
              >
                <Text
                  style={{ color: accent, fontSize: 12, fontWeight: "500" }}
                >
                  View all
                </Text>
              </Pressable>
            </View>

            {activity.map((row, index) => (
              <RowItem
                key={index}
                title={row.title}
                subtitle={row.subtitle}
                amount={row.amount}
                kind={row.kind}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
