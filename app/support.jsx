import {
  View,
  Text,
  Pressable,
  ScrollView,
  Linking,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import {
  X,
  HelpCircle,
  MessageCircle,
  Phone,
  Mail,
  ChevronRight,
} from "lucide-react-native";

export default function Support() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const background = "#F8F9FA";
  const surface = "#FFFFFF";
  const textPrimary = "#0B0F14";
  const textMuted = "rgba(11,15,20,0.60)";
  const border = "rgba(11,15,20,0.08)";
  const accent = "#0786FD";

  const faqs = [
    {
      question: "How do I transfer money internationally?",
      answer: "Coming soon",
    },
    { question: "What are the transaction limits?", answer: "Coming soon" },
    { question: "How long do withdrawals take?", answer: "Coming soon" },
    { question: "How do I add team members?", answer: "Coming soon" },
  ];

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
            <HelpCircle size={18} color={accent} strokeWidth={2.5} />
          </View>
          <Text style={{ color: textPrimary, fontSize: 18, fontWeight: "700" }}>
            Support
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
        {/* Contact options */}
        <View>
          <Text
            style={{
              color: textPrimary,
              fontSize: 14,
              fontWeight: "600",
              marginBottom: 12,
            }}
          >
            Get in touch
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
            <Pressable
              onPress={() =>
                Alert.alert(
                  "Live chat",
                  "Chat is not connected yet. For now, email us at support@mymonty.com.",
                )
              }
              style={{
                paddingVertical: 16,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
              }}
            >
              <MessageCircle size={20} color={accent} />
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: textPrimary,
                    fontSize: 15,
                    fontWeight: "600",
                  }}
                >
                  Live chat
                </Text>
                <Text
                  style={{
                    color: textMuted,
                    fontSize: 13,
                    fontWeight: "500",
                    marginTop: 2,
                  }}
                >
                  Average response time: 2 min
                </Text>
              </View>
              <ChevronRight size={18} color={textMuted} />
            </Pressable>

            <View style={{ height: 1, backgroundColor: border }} />

            <Pressable
              onPress={() => Linking.openURL("tel:+1234567890")}
              style={{
                paddingVertical: 16,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
              }}
            >
              <Phone size={20} color={accent} />
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: textPrimary,
                    fontSize: 15,
                    fontWeight: "600",
                  }}
                >
                  Call us
                </Text>
                <Text
                  style={{
                    color: textMuted,
                    fontSize: 13,
                    fontWeight: "500",
                    marginTop: 2,
                  }}
                >
                  Mon-Fri, 9am-6pm EST
                </Text>
              </View>
              <ChevronRight size={18} color={textMuted} />
            </Pressable>

            <View style={{ height: 1, backgroundColor: border }} />

            <Pressable
              onPress={() => Linking.openURL("mailto:support@mymonty.com")}
              style={{
                paddingVertical: 16,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
              }}
            >
              <Mail size={20} color={accent} />
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: textPrimary,
                    fontSize: 15,
                    fontWeight: "600",
                  }}
                >
                  Email us
                </Text>
                <Text
                  style={{
                    color: textMuted,
                    fontSize: 13,
                    fontWeight: "500",
                    marginTop: 2,
                  }}
                >
                  support@mymonty.com
                </Text>
              </View>
              <ChevronRight size={18} color={textMuted} />
            </Pressable>
          </View>
        </View>

        {/* FAQs */}
        <View style={{ marginTop: 24 }}>
          <Text
            style={{
              color: textPrimary,
              fontSize: 14,
              fontWeight: "600",
              marginBottom: 12,
            }}
          >
            Frequently asked questions
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
            {faqs.map((faq, idx) => (
              <Pressable
                key={idx}
                onPress={() => Alert.alert(faq.question, faq.answer)}
                style={{
                  paddingVertical: 16,
                  borderTopWidth: idx === 0 ? 0 : 1,
                  borderTopColor: border,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <Text
                  style={{
                    flex: 1,
                    color: textPrimary,
                    fontSize: 14,
                    fontWeight: "500",
                  }}
                >
                  {faq.question}
                </Text>
                <ChevronRight size={18} color={textMuted} />
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
