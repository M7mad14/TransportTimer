import React, { useState, useEffect } from "react";
import { View, StyleSheet, Pressable, Alert, TextInput, Image, Modal } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import * as Clipboard from "expo-clipboard";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { Feather } from "@expo/vector-icons";

import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { getAllTrips, updateTrip, recalculateTripData, SavedTrip, TripEvent } from "@/utils/storage";

export default function TripDetailScreen() {
  const { theme } = useTheme();
  const route = useRoute();
  const navigation = useNavigation();
  const { tripId } = route.params as { tripId: string };
  
  const [trip, setTrip] = useState<SavedTrip | null>(null);
  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [viewingPhoto, setViewingPhoto] = useState<string | null>(null);

  useEffect(() => {
    loadTrip();
  }, [tripId]);

  const loadTrip = async () => {
    try {
      const trips = await getAllTrips();
      const foundTrip = trips.find((t) => t.id === tripId);
      if (foundTrip) {
        setTrip(foundTrip);
      } else {
        Alert.alert("", "لم يتم العثور على الرحلة");
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert("", "حدث خطأ أثناء تحميل الرحلة");
    }
  };

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

  const handleDeleteEvent = (eventId: number) => {
    if (!trip) return;

    if (trip.events.length <= 1) {
      Alert.alert("", "لا يمكن حذف جميع الأحداث. احذف الرحلة بالكامل بدلاً من ذلك");
      return;
    }

    Alert.alert(
      "حذف الحدث؟",
      "هل أنت متأكد من حذف هذا الحدث؟",
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "حذف",
          style: "destructive",
          onPress: async () => {
            const filteredEvents = trip.events.filter((e) => e.id !== eventId);
            const reindexedEvents = filteredEvents.map((e, index) => ({ ...e, id: index + 1 }));
            
            try {
              const recalculated = recalculateTripData(reindexedEvents);
              const updatedTrip = {
                ...trip,
                ...recalculated,
              };
              await updateTrip(updatedTrip);
              setTrip(updatedTrip);
              Alert.alert("", "تم حذف الحدث بنجاح");
            } catch (error) {
              Alert.alert("", "حدث خطأ أثناء حذف الحدث");
            }
          },
        },
      ]
    );
  };

  const handleEditEvent = (event: TripEvent) => {
    setEditingEventId(event.id);
    setEditText(event.label);
  };

  const handleSaveEdit = async () => {
    if (!trip || editingEventId === null) return;

    if (!editText.trim()) {
      Alert.alert("", "الرجاء إدخال وصف للحدث");
      return;
    }

    const updatedEvents = trip.events.map((e) =>
      e.id === editingEventId ? { ...e, label: editText.trim() } : e
    );

    try {
      const recalculated = recalculateTripData(updatedEvents);
      const updatedTrip = {
        ...trip,
        ...recalculated,
      };
      await updateTrip(updatedTrip);
      setTrip(updatedTrip);
      setEditingEventId(null);
      setEditText("");
      Alert.alert("", "تم تحديث الحدث بنجاح");
    } catch (error) {
      Alert.alert("", "حدث خطأ أثناء تحديث الحدث");
    }
  };

  const handleCancelEdit = () => {
    setEditingEventId(null);
    setEditText("");
  };

  const copySummary = async () => {
    if (!trip) return;
    try {
      await Clipboard.setStringAsync(trip.summary);
      Alert.alert("", "تم نسخ الملخص إلى الحافظة ✅");
    } catch {
      Alert.alert("", "لم يتم النسخ تلقائياً، انسخ النص يدوياً.");
    }
  };

  const shareTrip = async () => {
    if (!trip) return;
    
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      await Clipboard.setStringAsync(trip.summary);
      Alert.alert("نسخ الملخص", "تم نسخ الملخص إلى الحافظة. يمكنك الآن لصقه في أي تطبيق آخر مثل واتساب أو البريد الإلكتروني.");
      return;
    }

    try {
      const fileUri = FileSystem.documentDirectory + `trip_${trip.id}.txt`;
      await FileSystem.writeAsStringAsync(fileUri, trip.summary);
      await Sharing.shareAsync(fileUri, {
        mimeType: "text/plain",
        dialogTitle: "مشاركة ملخص الرحلة",
      });
    } catch (error) {
      await Clipboard.setStringAsync(trip.summary);
      Alert.alert("", "تم نسخ الملخص إلى الحافظة. يمكنك لصقه في التطبيق الذي تريد.");
    }
  };

  if (!trip) {
    return (
      <ScreenScrollView>
        <View style={styles.container}>
          <ThemedView style={styles.card}>
            <ThemedText>جاري التحميل...</ThemedText>
          </ThemedView>
        </View>
      </ScreenScrollView>
    );
  }

  return (
    <ScreenScrollView>
      <View style={styles.container}>
        <ThemedView style={styles.card}>
          <View style={styles.actionButtons}>
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                { backgroundColor: theme.backgroundTertiary, opacity: pressed ? 0.7 : 1 },
              ]}
              onPress={copySummary}
            >
              <Feather name="copy" size={20} color={theme.text} />
              <ThemedText style={[styles.actionButtonText, { color: theme.text }]}>
                نسخ
              </ThemedText>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                { backgroundColor: theme.accent, opacity: pressed ? 0.7 : 1 },
              ]}
              onPress={shareTrip}
            >
              <Feather name="share-2" size={20} color="#fff" />
              <ThemedText style={[styles.actionButtonText, { color: "#fff" }]}>
                مشاركة
              </ThemedText>
            </Pressable>
          </View>

          <View style={styles.tableSection}>
            <View
              style={[
                styles.tableHeader,
                { backgroundColor: theme.backgroundSecondary },
              ]}
            >
              <ThemedText style={[styles.tableHeaderText, styles.colActions]}>
                إجراءات
              </ThemedText>
              <ThemedText style={[styles.tableHeaderText, styles.colDiff]}>
                الفرق
              </ThemedText>
              <ThemedText style={[styles.tableHeaderText, styles.colTime]}>الوقت</ThemedText>
              <ThemedText style={[styles.tableHeaderText, styles.colEvent]}>الحدث</ThemedText>
              <ThemedText style={[styles.tableHeaderText, styles.colNum]}>#</ThemedText>
            </View>

            {trip.events.map((event) => (
              <View
                key={event.id}
                style={[styles.tableRow, { borderBottomColor: theme.border }]}
              >
                <View style={styles.colActions}>
                  {editingEventId === event.id ? (
                    <View style={styles.editActions}>
                      <Pressable onPress={handleSaveEdit} hitSlop={8}>
                        <Feather name="check" size={18} color={theme.accent} />
                      </Pressable>
                      <Pressable onPress={handleCancelEdit} hitSlop={8}>
                        <Feather name="x" size={18} color={theme.destructive} />
                      </Pressable>
                    </View>
                  ) : (
                    <View style={styles.editActions}>
                      <Pressable onPress={() => handleEditEvent(event)} hitSlop={8}>
                        <Feather name="edit-2" size={16} color={theme.text} />
                      </Pressable>
                      <Pressable onPress={() => handleDeleteEvent(event.id)} hitSlop={8}>
                        <Feather name="trash-2" size={16} color={theme.destructive} />
                      </Pressable>
                    </View>
                  )}
                </View>
                <ThemedText style={[styles.tableCell, styles.colDiff]}>
                  {event.timeDiff !== undefined ? formatTimeDiff(event.timeDiff) : "-"}
                </ThemedText>
                <ThemedText style={[styles.tableCell, styles.colTime]}>
                  {formatTime(event.time)}
                </ThemedText>
                {editingEventId === event.id ? (
                  <TextInput
                    style={[
                      styles.editInput,
                      styles.colEvent,
                      {
                        backgroundColor: theme.backgroundSecondary,
                        borderColor: theme.border,
                        color: theme.text,
                      },
                    ]}
                    value={editText}
                    onChangeText={setEditText}
                    textAlign="right"
                    autoFocus
                  />
                ) : (
                  <View style={[styles.tableCell, styles.colEvent, styles.eventWithPhoto]}>
                    <ThemedText style={styles.eventLabel}>{event.label}</ThemedText>
                    {event.photoUri ? (
                      <Pressable onPress={() => setViewingPhoto(event.photoUri || null)}>
                        <Image source={{ uri: event.photoUri }} style={styles.photoThumbnail} />
                      </Pressable>
                    ) : null}
                  </View>
                )}
                <ThemedText style={[styles.tableCell, styles.colNum]}>{event.id}</ThemedText>
              </View>
            ))}
          </View>

          {trip.startLocation && (
            <View style={styles.locationSection}>
              <ThemedText style={styles.locationLabel}>نقطة البداية</ThemedText>
              <ThemedText style={styles.locationValue}>{trip.startLocation}</ThemedText>
            </View>
          )}

          {trip.notes && (
            <View style={styles.notesSection}>
              <ThemedText style={styles.notesLabel}>ملاحظات الرحلة</ThemedText>
              <ThemedText style={styles.notesValue}>{trip.notes}</ThemedText>
            </View>
          )}

          <View style={styles.summarySection}>
            <ThemedText style={styles.summaryLabel}>ملخص الرحلة</ThemedText>
            <View
              style={[
                styles.summaryBox,
                { backgroundColor: theme.backgroundSecondary },
              ]}
            >
              <ThemedText style={styles.summaryText}>{trip.summary}</ThemedText>
            </View>
          </View>
        </ThemedView>
      </View>

      <Modal
        visible={viewingPhoto !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setViewingPhoto(null)}
      >
        <Pressable
          style={styles.photoModal}
          onPress={() => setViewingPhoto(null)}
        >
          <View style={styles.photoModalContent}>
            {viewingPhoto ? (
              <Image
                source={{ uri: viewingPhoto }}
                style={styles.photoFullSize}
                resizeMode="contain"
              />
            ) : null}
            <Pressable
              style={styles.closeButton}
              onPress={() => setViewingPhoto(null)}
            >
              <Feather name="x" size={24} color="#fff" />
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  card: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.1)',
  },
  actionButtons: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing["2xl"],
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "500",
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
    alignItems: "center",
  },
  tableCell: {
    fontSize: 14,
    textAlign: "center",
  },
  colNum: {
    width: "10%",
  },
  colEvent: {
    width: "25%",
  },
  colTime: {
    width: "20%",
  },
  colDiff: {
    width: "20%",
  },
  colActions: {
    width: "25%",
  },
  editActions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.md,
  },
  editInput: {
    height: 36,
    borderWidth: 1,
    borderRadius: BorderRadius.xs,
    paddingHorizontal: Spacing.sm,
    fontSize: 14,
  },
  locationSection: {
    marginBottom: Spacing.lg,
    padding: Spacing.md,
    borderRadius: BorderRadius.xs,
    backgroundColor: "rgba(0, 128, 128, 0.08)",
  },
  locationLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: Spacing.xs,
    opacity: 0.7,
  },
  locationValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  notesSection: {
    marginBottom: Spacing.lg,
    padding: Spacing.md,
    borderRadius: BorderRadius.xs,
    backgroundColor: "rgba(139, 92, 246, 0.08)",
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: Spacing.xs,
    opacity: 0.7,
  },
  notesValue: {
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },
  summarySection: {
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
  eventWithPhoto: {
    flexDirection: "column",
    gap: Spacing.xs,
    alignItems: "center",
  },
  eventLabel: {
    fontSize: 14,
    textAlign: "center",
  },
  photoThumbnail: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.xs,
  },
  photoModal: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  photoModalContent: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  photoFullSize: {
    width: "90%",
    height: "80%",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    padding: Spacing.md,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: BorderRadius.full,
  },
});
