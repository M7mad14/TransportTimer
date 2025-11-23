import React, { useState, useEffect } from "react";
import { View, StyleSheet, TextInput, Pressable, Alert, I18nManager } from "react-native";
import * as Clipboard from "expo-clipboard";

import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface TripEvent {
  id: number;
  label: string;
  time: Date;
  timeDiff?: number;
}

export default function TimerScreen() {
  const { theme } = useTheme();

  useEffect(() => {
    I18nManager.forceRTL(true);
    I18nManager.allowRTL(true);
  }, []);
  const [tripStarted, setTripStarted] = useState(false);
  const [events, setEvents] = useState<TripEvent[]>([]);
  const [customEventText, setCustomEventText] = useState("");
  const [summary, setSummary] = useState("");

  const formatTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  const formatTimeDiff = (seconds: number): string => {
    if (seconds === 0) return "-";

    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    if (mins === 0) {
      return `${secs} ث`;
    } else if (secs === 0) {
      return `${mins} د`;
    } else {
      return `${mins} د و ${secs} ث`;
    }
  };

  const generateSummary = (eventList: TripEvent[]): string => {
    if (eventList.length === 0) return "";

    let summaryText = "ملخص الرحلة:\n\n";

    eventList.forEach((event, index) => {
      const timeStr = formatTime(event.time);
      if (index === 0) {
        summaryText += `${index + 1}- ${event.label} عند ${timeStr}\n`;
      } else {
        const diffStr = formatTimeDiff(event.timeDiff || 0);
        summaryText += `${index + 1}- ${event.label} عند ${timeStr} (بعد ${diffStr} من الحدث السابق)\n`;
      }
    });

    if (eventList.length > 1) {
      const firstTime = eventList[0].time.getTime();
      const lastTime = eventList[eventList.length - 1].time.getTime();
      const totalSeconds = Math.floor((lastTime - firstTime) / 1000);
      summaryText += `\nإجمالي مدة الرحلة تقريباً: ${formatTimeDiff(totalSeconds)}`;
    }

    return summaryText;
  };

  const addEvent = (label: string) => {
    const now = new Date();
    let timeDiff = 0;

    if (events.length > 0) {
      const lastEvent = events[events.length - 1];
      timeDiff = Math.floor((now.getTime() - lastEvent.time.getTime()) / 1000);
    }

    const newEvent: TripEvent = {
      id: events.length + 1,
      label,
      time: now,
      timeDiff: events.length > 0 ? timeDiff : undefined,
    };

    const updatedEvents = [...events, newEvent];
    setEvents(updatedEvents);
    setSummary(generateSummary(updatedEvents));
  };

  const startTrip = () => {
    setEvents([]);
    setSummary("");
    setCustomEventText("");
    setTripStarted(true);
    addEvent("بداية الرحلة");
  };

  const resetTrip = () => {
    setEvents([]);
    setSummary("");
    setCustomEventText("");
    setTripStarted(false);
  };

  const handleCustomEvent = () => {
    if (customEventText.trim()) {
      addEvent(customEventText.trim());
      setCustomEventText("");
    }
  };

  const copySummary = async () => {
    try {
      await Clipboard.setStringAsync(summary);
      Alert.alert("", "تم نسخ الملخص إلى الحافظة ✅");
    } catch {
      Alert.alert("", "لم يتم النسخ تلقائياً، انسخ النص يدوياً.");
    }
  };

  return (
    <ScreenScrollView>
      <View style={styles.container}>
        <ThemedView style={styles.card}>
          <View style={styles.buttonGrid}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.primaryButton,
                { backgroundColor: theme.accent, opacity: pressed ? 0.7 : 1 },
              ]}
              onPress={startTrip}
            >
              <ThemedText style={styles.buttonText}>بدء الرحلة</ThemedText>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.secondaryButton,
                {
                  backgroundColor: theme.backgroundTertiary,
                  opacity: pressed ? 0.7 : tripStarted ? 1 : 0.5,
                },
              ]}
              onPress={() => addEvent("خروج من المنزل")}
              disabled={!tripStarted}
            >
              <ThemedText style={[styles.buttonText, { color: theme.text }]}>
                خروج من المنزل
              </ThemedText>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.secondaryButton,
                {
                  backgroundColor: theme.backgroundTertiary,
                  opacity: pressed ? 0.7 : tripStarted ? 1 : 0.5,
                },
              ]}
              onPress={() => addEvent("ركوب السيارة")}
              disabled={!tripStarted}
            >
              <ThemedText style={[styles.buttonText, { color: theme.text }]}>
                ركوب السيارة
              </ThemedText>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.secondaryButton,
                {
                  backgroundColor: theme.backgroundTertiary,
                  opacity: pressed ? 0.7 : tripStarted ? 1 : 0.5,
                },
              ]}
              onPress={() => addEvent("ركوب المترو")}
              disabled={!tripStarted}
            >
              <ThemedText style={[styles.buttonText, { color: theme.text }]}>
                ركوب المترو
              </ThemedText>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.secondaryButton,
                {
                  backgroundColor: theme.backgroundTertiary,
                  opacity: pressed ? 0.7 : tripStarted ? 1 : 0.5,
                },
              ]}
              onPress={() => addEvent("الوصول للوجهة")}
              disabled={!tripStarted}
            >
              <ThemedText style={[styles.buttonText, { color: theme.text }]}>
                الوصول للوجهة
              </ThemedText>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.destructiveButton,
                { backgroundColor: theme.destructive, opacity: pressed ? 0.7 : 1 },
              ]}
              onPress={resetTrip}
            >
              <ThemedText style={styles.buttonText}>إعادة تعيين</ThemedText>
            </Pressable>
          </View>

          <View style={styles.customEventSection}>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.backgroundSecondary,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
              placeholder="اكتب وصف الحدث (مثلاً: توقف عند محطة البنزين)"
              placeholderTextColor={theme.textSecondary}
              value={customEventText}
              onChangeText={setCustomEventText}
              editable={tripStarted}
              textAlign="right"
            />
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.secondaryButton,
                {
                  backgroundColor: theme.backgroundTertiary,
                  opacity: pressed ? 0.7 : tripStarted ? 1 : 0.5,
                },
              ]}
              onPress={handleCustomEvent}
              disabled={!tripStarted}
            >
              <ThemedText style={[styles.buttonText, { color: theme.text }]}>
                إضافة حدث مخصص
              </ThemedText>
            </Pressable>
          </View>

          {events.length > 0 && (
            <View style={styles.tableSection}>
              <View
                style={[
                  styles.tableHeader,
                  { backgroundColor: theme.backgroundSecondary },
                ]}
              >
                <ThemedText style={[styles.tableHeaderText, styles.colDiff]}>
                  الفرق عن الحدث السابق
                </ThemedText>
                <ThemedText style={[styles.tableHeaderText, styles.colTime]}>الوقت</ThemedText>
                <ThemedText style={[styles.tableHeaderText, styles.colEvent]}>الحدث</ThemedText>
                <ThemedText style={[styles.tableHeaderText, styles.colNum]}>#</ThemedText>
              </View>

              {events.map((event) => (
                <View
                  key={event.id}
                  style={[styles.tableRow, { borderBottomColor: theme.border }]}
                >
                  <ThemedText style={[styles.tableCell, styles.colDiff]}>
                    {event.timeDiff !== undefined ? formatTimeDiff(event.timeDiff) : "-"}
                  </ThemedText>
                  <ThemedText style={[styles.tableCell, styles.colTime]}>
                    {formatTime(event.time)}
                  </ThemedText>
                  <ThemedText style={[styles.tableCell, styles.colEvent]}>{event.label}</ThemedText>
                  <ThemedText style={[styles.tableCell, styles.colNum]}>{event.id}</ThemedText>
                </View>
              ))}
            </View>
          )}

          {summary && (
            <View style={styles.summarySection}>
              <ThemedText style={styles.summaryLabel}>ملخص الرحلة</ThemedText>
              <View
                style={[
                  styles.summaryBox,
                  { backgroundColor: theme.backgroundSecondary },
                ]}
              >
                <ThemedText style={styles.summaryText}>{summary}</ThemedText>
              </View>
              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  styles.primaryButton,
                  { backgroundColor: theme.accent, opacity: pressed ? 0.7 : 1 },
                ]}
                onPress={copySummary}
              >
                <ThemedText style={styles.buttonText}>نسخ الملخص</ThemedText>
              </Pressable>
            </View>
          )}

          <ThemedText style={[styles.footer, { color: theme.textSecondary }]}>
            الوقت يُحسب بحسب ساعة جهازك. يمكنك نسخ الملخص ولصقه في واتساب أو الملاحظات.
          </ThemedText>
        </ThemedView>
      </View>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  card: {
    padding: Spacing.lg,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  buttonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginBottom: Spacing["2xl"],
  },
  button: {
    minHeight: 44,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xs,
    alignItems: "center",
    justifyContent: "center",
    flexBasis: "48%",
  },
  primaryButton: {},
  secondaryButton: {},
  destructiveButton: {},
  buttonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  customEventSection: {
    marginBottom: Spacing["2xl"],
    gap: Spacing.md,
  },
  input: {
    height: Spacing.inputHeight,
    borderWidth: 1,
    borderRadius: BorderRadius.xs,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
    writingDirection: "rtl",
  },
  tableSection: {
    marginBottom: Spacing["2xl"],
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.xs,
    marginBottom: Spacing.xs,
  },
  tableHeaderText: {
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: 1,
  },
  tableCell: {
    fontSize: 14,
    textAlign: "center",
  },
  colNum: {
    width: "10%",
  },
  colEvent: {
    width: "30%",
  },
  colTime: {
    width: "25%",
  },
  colDiff: {
    width: "35%",
  },
  summarySection: {
    marginBottom: Spacing["2xl"],
    gap: Spacing.md,
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "right",
  },
  summaryBox: {
    minHeight: 120,
    padding: Spacing.md,
    borderRadius: BorderRadius.xs,
  },
  summaryText: {
    fontSize: 14,
    textAlign: "right",
  },
  footer: {
    fontSize: 12,
    textAlign: "center",
    marginTop: Spacing.md,
  },
});
