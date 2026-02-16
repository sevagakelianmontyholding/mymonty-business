import React, { useCallback, useMemo, useState } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { CameraView, useCameraPermissions } from "expo-camera";
import { X, QrCode, Scan, RefreshCcw } from "lucide-react-native";

function safeParseJson(str) {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

function parseQueryString(search) {
  const out = {};
  const s = String(search || "").replace(/^\?/, "");
  if (!s) return out;
  for (const part of s.split("&")) {
    if (!part) continue;
    const [kRaw, vRaw] = part.split("=");
    const k = decodeURIComponent(kRaw || "").trim();
    if (!k) continue;
    const v = decodeURIComponent(vRaw || "");
    out[k] = v;
  }
  return out;
}

function parseQrPayload(raw) {
  // Supported:
  // 1) JSON: { recipient, amount, note, currency }
  // 2) URL-ish:  ...?recipient=..&amount=..&currency=..&note=..
  // 3) Simple: email / phone (treated as recipient)
  const trimmed = String(raw || "").trim();
  if (!trimmed) return null;

  const json = safeParseJson(trimmed);
  if (json && typeof json === "object") {
    const recipient = json.recipient || json.to || json.email || null;
    const amount = json.amount || null;
    const note = json.note || null;
    const currency = json.currency || null;
    return { recipient, amount, note, currency };
  }

  const qIndex = trimmed.indexOf("?");
  if (qIndex >= 0) {
    const query = parseQueryString(trimmed.slice(qIndex + 1));
    const recipient = query.recipient || null;
    const amount = query.amount || null;
    const note = query.note || null;
    const currency = query.currency || null;
    if (recipient) {
      return { recipient, amount, note, currency };
    }
  }

  // Basic: treat as recipient
  return {
    recipient: trimmed,
    amount: null,
    note: "QR payment",
    currency: null,
  };
}

export default function QRScan() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [error, setError] = useState(null);

  const background = "#0B0F14";
  const textPrimary = "#FFFFFF";
  const accent = "#0786FD";

  const onBarcodeScanned = useCallback(
    (event) => {
      if (scanned) {
        return;
      }

      const raw = event?.data;
      setScanned(true);
      setError(null);

      const parsed = parseQrPayload(raw);
      const recipient = parsed?.recipient;

      if (!recipient) {
        setError("Could not read this QR code");
        setTimeout(() => setScanned(false), 1200);
        return;
      }

      const amount = parsed?.amount ? String(parsed.amount) : "";
      const note = parsed?.note ? String(parsed.note) : "";
      const currency = parsed?.currency ? String(parsed.currency) : "";

      router.replace({
        pathname: "/send",
        params: {
          recipient,
          amount,
          note,
          currency,
        },
      });
    },
    [router, scanned],
  );

  const overlayText = useMemo(() => {
    if (scanned) return "Scanning...";
    return "Position QR code within frame";
  }, [scanned]);

  if (!permission) {
    return <View style={{ flex: 1, backgroundColor: background }} />;
  }

  if (!permission.granted) {
    return (
      <View
        style={{ flex: 1, backgroundColor: background, paddingTop: insets.top }}
      >
        <StatusBar style="light" />

        <View
          style={{
            paddingHorizontal: 18,
            paddingVertical: 14,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                backgroundColor: "rgba(255,255,255,0.1)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <QrCode size={18} color={textPrimary} strokeWidth={2.5} />
            </View>
            <Text
              style={{ color: textPrimary, fontSize: 18, fontWeight: "700" }}
            >
              Scan QR code
            </Text>
          </View>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <X size={24} color={textPrimary} />
          </Pressable>
        </View>

        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 28,
          }}
        >
          <Text
            style={{
              color: textPrimary,
              fontSize: 16,
              fontWeight: "700",
              textAlign: "center",
            }}
          >
            Camera permission needed
          </Text>
          <Text
            style={{
              marginTop: 10,
              color: "rgba(255,255,255,0.7)",
              fontSize: 13,
              fontWeight: "500",
              textAlign: "center",
              lineHeight: 18,
            }}
          >
            To scan QR codes, please allow camera access.
          </Text>

          <Pressable
            onPress={requestPermission}
            style={{
              marginTop: 20,
              backgroundColor: accent,
              borderRadius: 16,
              paddingVertical: 14,
              paddingHorizontal: 22,
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
            accessibilityLabel="Grant camera permission"
          >
            <Scan size={18} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "700" }}>
              Allow camera
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: background }}>
      <StatusBar style="light" />

      <CameraView
        style={{ flex: 1 }}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={onBarcodeScanned}
      />

      {/* Top header overlay */}
      <View
        style={{
          position: "absolute",
          top: insets.top,
          left: 0,
          right: 0,
          paddingHorizontal: 18,
          paddingVertical: 14,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              backgroundColor: "rgba(0,0,0,0.35)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <QrCode size={18} color={textPrimary} strokeWidth={2.5} />
          </View>
          <Text style={{ color: textPrimary, fontSize: 18, fontWeight: "700" }}>
            Scan QR code
          </Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Pressable
            onPress={() => {
              setScanned(false);
              setError(null);
            }}
            hitSlop={8}
            accessibilityLabel="Scan again"
            style={{
              height: 40,
              width: 40,
              borderRadius: 14,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(0,0,0,0.35)",
            }}
          >
            <RefreshCcw size={18} color={textPrimary} strokeWidth={2.5} />
          </Pressable>

          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            accessibilityLabel="Close"
          >
            <X size={24} color={textPrimary} />
          </Pressable>
        </View>
      </View>

      {/* Frame overlay */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 32,
        }}
      >
        <View
          style={{
            width: 280,
            height: 280,
            borderWidth: 3,
            borderColor: accent,
            borderRadius: 24,
            backgroundColor: "rgba(7,134,253,0.06)",
          }}
        />

        <Text
          style={{
            marginTop: 30,
            color: textPrimary,
            fontSize: 16,
            fontWeight: "700",
            textAlign: "center",
            textShadowColor: "rgba(0,0,0,0.4)",
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 4,
          }}
        >
          {overlayText}
        </Text>

        {error ? (
          <Text
            style={{
              marginTop: 10,
              color: "rgba(255,255,255,0.85)",
              fontSize: 13,
              fontWeight: "600",
              textAlign: "center",
              maxWidth: 320,
            }}
          >
            {error}
          </Text>
        ) : (
          <Text
            style={{
              marginTop: 10,
              color: "rgba(255,255,255,0.7)",
              fontSize: 13,
              fontWeight: "500",
              textAlign: "center",
              maxWidth: 320,
            }}
          >
            Scanning is automatic — hold steady.
          </Text>
        )}

        {scanned && (
          <View
            style={{
              marginTop: 14,
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            <ActivityIndicator color={accent} />
            <Text
              style={{
                color: "rgba(255,255,255,0.85)",
                fontSize: 13,
                fontWeight: "700",
              }}
            >
              Reading QR…
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
