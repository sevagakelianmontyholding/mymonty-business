import { useRequireAuth } from "@/utils/auth/useAuth";
import { Tabs } from "expo-router";
import { ArrowRightLeft, BanknoteArrowDown, CircleEllipsis, CreditCard, Home } from "lucide-react-native";

export default function TabLayout() {
  useRequireAuth({ mode: "signin" });

  const background = "#FFFFFF";
  const border = "rgba(11,15,20,0.08)";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: background,
          borderTopWidth: 1,
          borderTopColor: border,
          paddingTop: 6,
        },
        tabBarActiveTintColor: "#6B5BFF",
        tabBarInactiveTintColor: "rgba(11,15,20,0.45)",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Home color={color} size={size ?? 24} />
          ),
        }}
      />
      <Tabs.Screen
        name="payments"
        options={{
          title: "Payments",
          tabBarIcon: ({ color, size }) => (
            <ArrowRightLeft color={color} size={size ?? 24} />
          ),
        }}
      />
      <Tabs.Screen
        name="cards"
        options={{
          title: "Cards",
          tabBarIcon: ({ color, size }) => (
            <CreditCard color={color} size={size ?? 24} />
          ),
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          title: "Expenses",
          tabBarIcon: ({ color, size }) => (
            <BanknoteArrowDown color={color} size={size ?? 24} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "More",
          tabBarIcon: ({ color, size }) => (
            <CircleEllipsis color={color} size={size ?? 24} />
          ),
        }}
      />
    </Tabs>
  );
}
