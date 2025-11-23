import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, TextInput, Pressable, Alert, I18nManager, Image } from "react-native";
import * as Clipboard from "expo-clipboard";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { useNavigation } from "@react-navigation/native";

import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { TripEvent, saveTrip } from "@/utils/storage";
import { Feather } from "@expo/vector-icons";

export default function TimerScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();

  const [tripStarted, setTripStarted] = useState(false);
  const [tripStartTime, setTripStartTime] = useState<Date | null>(null);
  const [events, setEvents] = useState<TripEvent[]>([]);
  const [customEventText, setCustomEventText] = useState("");
  const [summary, setSummary] = useState("");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    I18nManager.forceRTL(true);
    I18nManager.allowRTL(true);
  }, []);

  const playClickSound = async () => {
    try {
      // Play haptic feedback on click
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Silent fail if haptics not available
    }
  };

  useEffect(() => {
    if (!tripStarted || !tripStartTime) {
      setElapsedSeconds(0);
      return;
    }

    const interval = setInterval(() => {
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - tripStartTime.getTime()) / 1000);
      setElapsedSeconds(diffInSeconds);
    }, 1000);

    return () => clearInterval(interval);
  }, [tripStarted, tripStartTime]);

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

  const formatElapsedTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
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
    const now = new Date();
    setTripStartTime(now);
    setEvents([]);
    setSummary("");
    setCustomEventText("");
    setTripStarted(true);
    
    const firstEvent: TripEvent = {
      id: 1,
      label: "بداية الرحلة",
      time: now,
      timeDiff: undefined,
    };
    setEvents([firstEvent]);
    setSummary(generateSummary([firstEvent]));
  };

  const saveAndResetTrip = async () => {
    if (events.length > 0 && tripStartTime) {
      try {
        await saveTrip({
          startTime: tripStartTime,
          endTime: events[events.length - 1].time,
          events,
          summary,
        });
        Alert.alert("", "تم حفظ الرحلة بنجاح ✅");
      } catch (error) {
        Alert.alert("", "حدث خطأ أثناء حفظ الرحلة");
      }
    }
    setEvents([]);
    setSummary("");
    setCustomEventText("");
    setTripStarted(false);
    setTripStartTime(null);
  };

  const resetTrip = () => {
    if (events.length > 0) {
      Alert.alert(
        "حفظ الرحلة؟",
        "هل تريد حفظ هذه الرحلة قبل المسح؟",
        [
          { text: "مسح بدون حفظ", onPress: () => {
            setEvents([]);
            setSummary("");
            setCustomEventText("");
            setTripStarted(false);
            setTripStartTime(null);
          }, style: "destructive" },
          { text: "حفظ ثم مسح", onPress: saveAndResetTrip },
          { text: "إلغاء", style: "cancel" },
        ]
      );
    } else {
      setEvents([]);
      setSummary("");
      setCustomEventText("");
      setTripStarted(false);
      setTripStartTime(null);
    }
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

  const attachPhotoToLastEvent = async () => {
    if (events.length === 0) {
      Alert.alert("", "لا توجد أحداث لإرفاق صورة بها");
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("", "نحتاج إلى إذن للوصول إلى معرض الصور");
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        const updatedEvents = [...events];
        const lastEventIndex = updatedEvents.length - 1;
        updatedEvents[lastEventIndex] = {
          ...updatedEvents[lastEventIndex],
          photoUri: result.assets[0].uri,
        };
        setEvents(updatedEvents);
        setSummary(generateSummary(updatedEvents));
        Alert.alert("", "تم إرفاق الصورة بآخر حدث ✅");
      }
    } catch (error) {
      Alert.alert("", "حدث خطأ أثناء اختيار الصورة");
    }
  };

  return (
    <ScreenScrollView>
      <View style={styles.container}>
        <ThemedView style={styles.card}>
          {tripStarted && (
            <View style={styles.timerDisplay}>
              <ThemedText style={styles.timerLabel}>الوقت المنقضي</ThemedText>
              <ThemedText style={styles.timerValue}>{formatElapsedTime(elapsedSeconds)}</ThemedText>
            </View>
          )}
          <View style={styles.buttonGrid}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.primaryButton,
                { backgroundColor: theme.accent, opacity: pressed ? 0.7 : 1 },
              ]}
              onPress={() => {
                playClickSound();
                startTrip();
              }}
            >
              <ThemedText style={styles.buttonText}>بدء الرحلة</ThemedText>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.secondaryButton,
                {
                  backgroundColor: theme.backgroundTertiary,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
              onPress={() => {
                playClickSound();
                navigation.navigate("History" as never);
              }}
            >
              <View style={styles.buttonContent}>
                <Feather name="clock" size={20} color={theme.text} />
                <ThemedText style={[styles.buttonText, { color: theme.text, marginRight: Spacing.sm }]}>
                  الرحلات السابقة
                </ThemedText>
              </View>
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
              onPress={() => {
                playClickSound();
                addEvent("خروج من المنزل");
              }}
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
              onPress={() => {
                playClickSound();
                addEvent("ركوب السيارة");
              }}
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
              onPress={() => {
                playClickSound();
                addEvent("ركوب المترو");
              }}
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
              onPress={() => {
                playClickSound();
                addEvent("الوصول للوجهة");
              }}
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
              onPress={() => {
                playClickSound();
                resetTrip();
              }}
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
              onPress={() => {
                playClickSound();
                handleCustomEvent();
              }}
              disabled={!tripStarted}
            >
              <ThemedText style={[styles.buttonText, { color: theme.text }]}>
                إضافة حدث مخصص
              </ThemedText>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.secondaryButton,
                {
                  backgroundColor: theme.backgroundTertiary,
                  opacity: pressed ? 0.7 : events.length > 0 ? 1 : 0.5,
                },
              ]}
              onPress={() => {
                playClickSound();
                attachPhotoToLastEvent();
              }}
              disabled={events.length === 0}
            >
              <View style={styles.buttonContent}>
                <Feather name="camera" size={20} color={theme.text} />
                <ThemedText style={[styles.buttonText, { color: theme.text, marginRight: Spacing.sm }]}>
                  إرفاق صورة للحدث الأخير
                </ThemedText>
              </View>
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
                  <View style={[styles.tableCell, styles.colEvent, styles.eventCell]}>
                    <ThemedText style={styles.eventText}>{event.label}</ThemedText>
                    {event.photoUri ? (
                      <Feather name="image" size={16} color={theme.accent} />
                    ) : null}
                  </View>
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
    padding: Spacing["2xl"],
    borderRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    marginVertical: Spacing.lg,
  },
  buttonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginBottom: Spacing["3xl"],
  },
  button: {
    minHeight: 52,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    flexBasis: "48%",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryButton: {},
  secondaryButton: {},
  destructiveButton: {},
  buttonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  customEventSection: {
    marginBottom: Spacing["3xl"],
    gap: Spacing.lg,
  },
  input: {
    height: Spacing.inputHeight,
    borderWidth: 1.5,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
    writingDirection: "rtl",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tableSection: {
    marginBottom: Spacing["3xl"],
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  tableHeaderText: {
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 0.3,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1.5,
    borderRadius: BorderRadius.xs,
  },
  tableCell: {
    fontSize: 13,
    textAlign: "center",
    fontWeight: "500",
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
  eventCell: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
  },
  eventText: {
    fontSize: 14,
    textAlign: "center",
  },
  summarySection: {
    marginBottom: Spacing["3xl"],
    gap: Spacing.lg,
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "right",
    letterSpacing: 0.3,
  },
  summaryBox: {
    minHeight: 140,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryText: {
    fontSize: 13,
    textAlign: "right",
    lineHeight: 22,
  },
  timerDisplay: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing["3xl"],
    paddingVertical: Spacing["2xl"],
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  timerLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: Spacing.md,
    letterSpacing: 0.5,
  },
  timerValue: {
    fontSize: 56,
    fontWeight: "700",
    letterSpacing: -1,
  },
  footer: {
    fontSize: 12,
    textAlign: "center",
    marginTop: Spacing.md,
  },
});
