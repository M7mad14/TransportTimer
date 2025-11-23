import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, TextInput, Pressable, Alert, I18nManager, Image, Platform, Dimensions } from "react-native";
import * as Clipboard from "expo-clipboard";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import * as Linking from "expo-linking";
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
  const [showEventDropdown, setShowEventDropdown] = useState(false);
  const [selectedEventForPhoto, setSelectedEventForPhoto] = useState<number | null>(null);
  const [startLocation, setStartLocation] = useState("");
  const [tripNotes, setTripNotes] = useState("");

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

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("", "نحتاج إلى إذن الوصول إلى الموقع");
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      if (address.length > 0) {
        const locationName = address[0].name || address[0].city || "الموقع الحالي";
        setStartLocation(locationName);
        setSummary(generateSummary(events));
      }
    } catch (error) {
      Alert.alert("", "خطأ في الحصول على الموقع الحالي");
    }
  };

  const openMapsForLocation = async () => {
    try {
      let mapUrl = "";
      if (Platform.OS === "ios") {
        mapUrl = "maps://";
      } else {
        mapUrl = "geo://0,0?q=";
      }
      await Linking.openURL(mapUrl);
    } catch (error) {
      Alert.alert("", "لا يمكن فتح تطبيق الخرائط");
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
    
    if (startLocation) {
      summaryText += `من: ${startLocation}\n\n`;
    }

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
    setStartLocation("");
    setTripNotes("");
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
          startLocation: startLocation || undefined,
          notes: tripNotes || undefined,
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
    setTripNotes("");
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
      setTripNotes("");
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

  const attachPhotoToEvent = async (eventId: number) => {
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
        const updatedEvents = events.map((event) =>
          event.id === eventId
            ? { ...event, photoUri: result.assets[0].uri }
            : event
        );
        setEvents(updatedEvents);
        setSummary(generateSummary(updatedEvents));
        Alert.alert("", "تم إرفاق الصورة ✅");
        setSelectedEventForPhoto(null);
      }
    } catch (error) {
      Alert.alert("", "حدث خطأ أثناء اختيار الصورة");
    }
  };

  const removePhotoFromEvent = (eventId: number) => {
    const updatedEvents = events.map((event) =>
      event.id === eventId
        ? { ...event, photoUri: undefined }
        : event
    );
    setEvents(updatedEvents);
    setSummary(generateSummary(updatedEvents));
    setSelectedEventForPhoto(null);
  };

  const attachPhotoToLastEvent = async () => {
    if (events.length === 0) {
      Alert.alert("", "لا توجد أحداث لإرفاق صورة بها");
      return;
    }
    await attachPhotoToEvent(events[events.length - 1].id);
  };

  return (
    <ScreenScrollView>
      <View style={styles.container}>
        {/* Timer Display Card - Only shown when trip started */}
        {tripStarted && (
          <ThemedView style={[styles.timerCard, { backgroundColor: theme.accent }]}>
            <ThemedText style={styles.timerLabel}>الوقت المنقضي</ThemedText>
            <ThemedText style={styles.timerValue}>{formatElapsedTime(elapsedSeconds)}</ThemedText>
            
            {/* Location Input */}
            <View style={styles.locationContainer}>
              <TextInput
                style={[
                  styles.locationInput,
                  {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    color: '#FFFFFF',
                    flex: 1,
                  },
                ]}
                placeholder="من أين تبدأ؟"
                placeholderTextColor="rgba(255, 255, 255, 0.7)"
                value={startLocation}
                onChangeText={(text) => {
                  setStartLocation(text);
                  setSummary(generateSummary(events));
                }}
                textAlign="right"
              />
              <Pressable
                style={({ pressed }) => [
                  styles.locationIconButton,
                  { backgroundColor: 'rgba(255, 255, 255, 0.25)', opacity: pressed ? 0.7 : 1 },
                ]}
                onPress={() => {
                  playClickSound();
                  getCurrentLocation();
                }}
                hitSlop={8}
              >
                <Feather name="navigation" size={18} color="#fff" />
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.locationIconButton,
                  { backgroundColor: 'rgba(255, 255, 255, 0.25)', opacity: pressed ? 0.7 : 1, marginRight: Spacing.xs },
                ]}
                onPress={() => {
                  playClickSound();
                  openMapsForLocation();
                }}
                hitSlop={8}
              >
                <Feather name="map-pin" size={18} color="#fff" />
              </Pressable>
            </View>
          </ThemedView>
        )}

        {/* Main Action Button */}
        <ThemedView style={styles.actionCard}>
          <Pressable
            style={({ pressed }) => [
              styles.startButton,
              { backgroundColor: theme.accent, opacity: pressed ? 0.95 : 1 },
            ]}
            onPress={() => {
              playClickSound();
              startTrip();
            }}
          >
            <View style={styles.startButtonContent}>
              <View style={styles.startIconCircle}>
                <Feather name="play" size={32} color="#FFFFFF" />
              </View>
              <View style={styles.startTextContainer}>
                <ThemedText style={styles.startButtonTitle}>بدء رحلة جديدة</ThemedText>
                <ThemedText style={styles.startButtonSubtitle}>اضغط لبدء تتبع الوقت</ThemedText>
              </View>
            </View>
          </Pressable>
        </ThemedView>

        {/* Quick Actions Grid */}
        <View style={styles.quickActionsGrid}>
          <Pressable
            style={({ pressed }) => [
              styles.quickActionCard,
              { backgroundColor: theme.backgroundDefault, opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={() => {
              playClickSound();
              navigation.navigate("History" as never);
            }}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: theme.accent + '15' }]}>
              <Feather name="clock" size={24} color={theme.accent} />
            </View>
            <ThemedText style={styles.quickActionText}>الرحلات</ThemedText>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.quickActionCard,
              { backgroundColor: theme.backgroundDefault, opacity: pressed ? 0.7 : tripStarted ? 1 : 0.5 },
            ]}
            onPress={() => {
              playClickSound();
              setShowEventDropdown(!showEventDropdown);
            }}
            disabled={!tripStarted}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: theme.accentSecondary + '15' }]}>
              <Feather name="map" size={24} color={theme.accentSecondary} />
            </View>
            <ThemedText style={styles.quickActionText}>الأحداث</ThemedText>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.quickActionCard,
              { backgroundColor: theme.backgroundDefault, opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={() => {
              playClickSound();
              navigation.navigate("Settings" as never);
            }}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: theme.success + '15' }]}>
              <Feather name="settings" size={24} color={theme.success} />
            </View>
            <ThemedText style={styles.quickActionText}>الإعدادات</ThemedText>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.quickActionCard,
              { backgroundColor: theme.backgroundDefault, opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={() => {
              playClickSound();
              resetTrip();
            }}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: theme.destructive + '15' }]}>
              <Feather name="refresh-cw" size={24} color={theme.destructive} />
            </View>
            <ThemedText style={styles.quickActionText}>إعادة تعيين</ThemedText>
          </Pressable>
        </View>

        {/* Event Shortcuts - Grid Layout */}
        {showEventDropdown && tripStarted && (
          <ThemedView style={styles.eventsCard}>
            <ThemedText style={styles.eventsCardTitle}>أحداث سريعة</ThemedText>
            <View style={styles.eventsGrid}>
              <Pressable
                style={({ pressed }) => [
                  styles.eventButton,
                  { backgroundColor: theme.backgroundSecondary, opacity: pressed ? 0.7 : 1 },
                ]}
                onPress={() => {
                  playClickSound();
                  addEvent("خروج من المنزل");
                  setShowEventDropdown(false);
                }}
              >
                <Feather name="home" size={20} color={theme.accent} />
                <ThemedText style={styles.eventButtonText}>خروج من المنزل</ThemedText>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.eventButton,
                  { backgroundColor: theme.backgroundSecondary, opacity: pressed ? 0.7 : 1 },
                ]}
                onPress={() => {
                  playClickSound();
                  addEvent("ركوب السيارة");
                  setShowEventDropdown(false);
                }}
              >
                <Feather name="truck" size={20} color={theme.accent} />
                <ThemedText style={styles.eventButtonText}>ركوب السيارة</ThemedText>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.eventButton,
                  { backgroundColor: theme.backgroundSecondary, opacity: pressed ? 0.7 : 1 },
                ]}
                onPress={() => {
                  playClickSound();
                  addEvent("ركوب المترو");
                  setShowEventDropdown(false);
                }}
              >
                <Feather name="navigation" size={20} color={theme.accent} />
                <ThemedText style={styles.eventButtonText}>ركوب المترو</ThemedText>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.eventButton,
                  { backgroundColor: theme.backgroundSecondary, opacity: pressed ? 0.7 : 1 },
                ]}
                onPress={() => {
                  playClickSound();
                  addEvent("الوصول للوجهة");
                  setShowEventDropdown(false);
                }}
              >
                <Feather name="map-pin" size={20} color={theme.success} />
                <ThemedText style={styles.eventButtonText}>الوصول للوجهة</ThemedText>
              </Pressable>
            </View>
          </ThemedView>
        )}

        {/* Custom Event Section */}
        {tripStarted && (
          <ThemedView style={styles.customEventCard}>
            <View style={styles.customEventHeader}>
              <Feather name="edit-3" size={20} color={theme.accent} />
              <ThemedText style={styles.customEventTitle}>إضافة حدث مخصص</ThemedText>
            </View>
            
            <TextInput
              style={[
                styles.customEventInput,
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
              textAlign="right"
            />
            
            <View style={styles.customEventActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.customEventButton,
                  {
                    backgroundColor: theme.accent,
                    opacity: pressed ? 0.7 : 1,
                    flex: 1,
                  },
                ]}
                onPress={() => {
                  playClickSound();
                  handleCustomEvent();
                }}
              >
                <Feather name="plus" size={18} color="#FFFFFF" />
                <ThemedText style={styles.customEventButtonText}>إضافة</ThemedText>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.customEventButton,
                  {
                    backgroundColor: theme.backgroundSecondary,
                    opacity: pressed ? 0.7 : events.length > 0 ? 1 : 0.5,
                  },
                ]}
                onPress={() => {
                  playClickSound();
                  attachPhotoToLastEvent();
                }}
                disabled={events.length === 0}
              >
                <Feather name="camera" size={18} color={theme.text} />
              </Pressable>
            </View>
          </ThemedView>
        )}

        {/* Events Table */}
        {events.length > 0 && (
          <ThemedView style={styles.tableCard}>
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
                <Pressable
                  key={event.id}
                  onPress={() => setSelectedEventForPhoto(selectedEventForPhoto === event.id ? null : event.id)}
                  style={({ pressed }) => [
                    styles.tableRow,
                    { 
                      borderBottomColor: theme.border,
                      backgroundColor: selectedEventForPhoto === event.id ? theme.backgroundTertiary : "transparent",
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
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
                </Pressable>
              ))}
              
              {selectedEventForPhoto !== null && (
                <View style={[styles.photoActionPanel, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
                  <ThemedText style={styles.photoActionLabel}>خيارات الصورة:</ThemedText>
                  <View style={styles.photoActionButtons}>
                    <Pressable
                      style={({ pressed }) => [
                        styles.photoActionButton,
                        { backgroundColor: theme.accent, opacity: pressed ? 0.7 : 1 },
                      ]}
                      onPress={() => {
                        playClickSound();
                        attachPhotoToEvent(selectedEventForPhoto);
                      }}
                    >
                      <Feather name="plus" size={18} color={theme.buttonText} />
                      <ThemedText style={[styles.photoActionButtonText, { color: theme.buttonText }]}>
                        إضافة صورة
                      </ThemedText>
                    </Pressable>

                    {events.find(e => e.id === selectedEventForPhoto)?.photoUri ? (
                      <Pressable
                        style={({ pressed }) => [
                          styles.photoActionButton,
                          { backgroundColor: theme.destructive, opacity: pressed ? 0.7 : 1 },
                        ]}
                        onPress={() => {
                          playClickSound();
                          removePhotoFromEvent(selectedEventForPhoto);
                        }}
                      >
                        <Feather name="trash-2" size={18} color={theme.buttonText} />
                        <ThemedText style={[styles.photoActionButtonText, { color: theme.buttonText }]}>
                          حذف الصورة
                        </ThemedText>
                      </Pressable>
                    ) : null}
                  </View>
                </View>
              )}
            </View>
          </ThemedView>
        )}

        {/* Trip Notes */}
        {tripStarted && (
          <ThemedView style={styles.notesCard}>
            <ThemedText style={styles.notesLabel}>ملاحظات الرحلة (اختياري)</ThemedText>
            <TextInput
              style={[
                styles.notesInput,
                {
                  backgroundColor: theme.backgroundSecondary,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
              placeholder="أضف ملاحظات أو تفاصيل إضافية عن الرحلة..."
              placeholderTextColor={theme.textSecondary}
              value={tripNotes}
              onChangeText={setTripNotes}
              multiline
              numberOfLines={3}
              textAlign="right"
            />
          </ThemedView>
        )}

        {/* Summary Section */}
        {summary && (
          <ThemedView style={styles.summaryCard}>
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
                  styles.copySummaryButton,
                  { backgroundColor: theme.accent, opacity: pressed ? 0.7 : 1 },
                ]}
                onPress={copySummary}
              >
                <Feather name="copy" size={18} color="#FFFFFF" />
                <ThemedText style={styles.copySummaryButtonText}>نسخ الملخص</ThemedText>
              </Pressable>
            </View>
          </ThemedView>
        )}

        {/* Footer */}
        <ThemedText style={[styles.footer, { color: theme.textSecondary }]}>
          الوقت يُحسب بحسب ساعة جهازك. يمكنك نسخ الملخص ولصقه في واتساب أو الملاحظات.
        </ThemedText>
      </View>
    </ScreenScrollView>
  );
}

const screenWidth = Dimensions.get("window").width;
const isSmallScreen = screenWidth < 400;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.lg,
  },
  timerCard: {
    padding: Spacing["2xl"],
    borderRadius: BorderRadius.xl,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
    alignItems: 'center',
  },
  actionCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  startButton: {
    paddingVertical: Spacing["2xl"],
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
  },
  startButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  startIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startTextContainer: {
    flex: 1,
  },
  startButtonTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: Spacing.xs,
  },
  startButtonSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  quickActionCard: {
    width: (screenWidth - Spacing.lg * 2 - Spacing.md) / 2,
    aspectRatio: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  customEventCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  customEventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  customEventTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  customEventInput: {
    height: 52,
    borderWidth: 2,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    fontSize: 15,
    writingDirection: "rtl",
  },
  customEventActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  customEventButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    minWidth: 56,
  },
  customEventButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  eventsCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  eventsCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  eventsGrid: {
    gap: Spacing.sm,
  },
  eventButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
  },
  eventButtonText: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  tableSection: {
    gap: Spacing.sm,
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: isSmallScreen ? Spacing.sm : Spacing.lg,
    paddingHorizontal: isSmallScreen ? Spacing.sm : Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  tableHeaderText: {
    fontSize: isSmallScreen ? 11 : 13,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 0.3,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: isSmallScreen ? Spacing.sm : Spacing.lg,
    paddingHorizontal: isSmallScreen ? Spacing.sm : Spacing.md,
    borderBottomWidth: 1.5,
    borderRadius: BorderRadius.xs,
  },
  tableCell: {
    fontSize: isSmallScreen ? 11 : 13,
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
    gap: Spacing.lg,
  },
  summaryLabel: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "right",
  },
  summaryBox: {
    minHeight: 120,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
  },
  summaryText: {
    fontSize: 14,
    textAlign: "right",
    lineHeight: 22,
  },
  timerLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: Spacing.md,
    letterSpacing: 0.5,
    color: 'rgba(255, 255, 255, 0.9)',
    textTransform: 'uppercase',
  },
  timerValue: {
    fontSize: 56,
    fontWeight: "900",
    letterSpacing: -2,
    color: '#FFFFFF',
    marginBottom: Spacing.lg,
  },
  photoActionPanel: {
    borderWidth: 1.5,
    borderRadius: BorderRadius.md,
    padding: isSmallScreen ? Spacing.md : Spacing.lg,
    marginTop: Spacing.sm,
    marginBottom: isSmallScreen ? Spacing.md : Spacing["2xl"],
  },
  photoActionLabel: {
    fontSize: isSmallScreen ? 12 : 14,
    fontWeight: "600",
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  photoActionButtons: {
    flexDirection: isSmallScreen ? "column" : "row",
    gap: Spacing.sm,
  },
  photoActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: isSmallScreen ? 6 : Spacing.sm,
    paddingHorizontal: isSmallScreen ? Spacing.xs : Spacing.md,
    borderRadius: BorderRadius.sm,
    gap: Spacing.xs,
  },
  photoActionButtonText: {
    fontSize: isSmallScreen ? 10 : 12,
    fontWeight: "600",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    width: '100%',
  },
  locationInput: {
    height: 48,
    borderWidth: 2,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    fontSize: 14,
    writingDirection: "rtl",
    fontWeight: '500',
  },
  locationIconButton: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  tableCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  notesCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
    gap: Spacing.md,
  },
  notesLabel: {
    fontSize: 16,
    fontWeight: "700",
  },
  notesInput: {
    minHeight: 100,
    borderWidth: 2,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: 15,
    writingDirection: "rtl",
    textAlignVertical: "top",
  },
  summaryCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  copySummaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
  },
  copySummaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  footer: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    lineHeight: 18,
  },
});
