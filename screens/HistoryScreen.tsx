import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, Pressable, FlatList, Alert } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { getAllTrips, deleteTrip, SavedTrip } from "@/utils/storage";

export default function HistoryScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTrips = async () => {
    setLoading(true);
    try {
      const loadedTrips = await getAllTrips();
      setTrips(loadedTrips);
    } catch (error) {
      Alert.alert("", "حدث خطأ أثناء تحميل الرحلات");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadTrips();
    }, [])
  );

  const handleDeleteTrip = (tripId: string) => {
    Alert.alert(
      "حذف الرحلة؟",
      "هل أنت متأكد من حذف هذه الرحلة؟",
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "حذف",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteTrip(tripId);
              await loadTrips();
              Alert.alert("", "تم حذف الرحلة بنجاح");
            } catch (error) {
              Alert.alert("", "حدث خطأ أثناء حذف الرحلة");
            }
          },
        },
      ]
    );
  };

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${year}/${month}/${day} - ${hours}:${minutes}`;
  };

  const formatDuration = (startTime: Date, endTime: Date): string => {
    const durationSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
    const mins = Math.floor(durationSeconds / 60);
    const secs = durationSeconds % 60;

    if (mins === 0) {
      return `${secs} ث`;
    } else if (secs === 0) {
      return `${mins} د`;
    } else {
      return `${mins} د و ${secs} ث`;
    }
  };

  const renderTripItem = ({ item }: { item: SavedTrip }) => (
    <Pressable
      style={({ pressed }) => [
        styles.tripCard,
        {
          backgroundColor: theme.backgroundSecondary,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
      onPress={() => navigation.navigate("TripDetail" as never, { tripId: item.id } as never)}
    >
      <View style={styles.tripHeader}>
        <View style={styles.tripInfo}>
          <ThemedText style={styles.tripDate}>{formatDate(item.startTime)}</ThemedText>
          <View style={styles.tripMeta}>
            <Feather name="clock" size={14} color={theme.textSecondary} />
            <ThemedText style={[styles.tripDuration, { color: theme.textSecondary }]}>
              {formatDuration(item.startTime, item.endTime)}
            </ThemedText>
            <Feather name="map-pin" size={14} color={theme.textSecondary} style={{ marginRight: Spacing.md }} />
            <ThemedText style={[styles.eventCount, { color: theme.textSecondary }]}>
              {item.events.length} أحداث
            </ThemedText>
          </View>
        </View>
        <Pressable
          style={styles.deleteButton}
          onPress={() => handleDeleteTrip(item.id)}
          hitSlop={8}
        >
          <Feather name="trash-2" size={20} color={theme.destructive} />
        </Pressable>
      </View>
      <ThemedText style={[styles.tripPreview, { color: theme.textSecondary }]} numberOfLines={2}>
        {item.events.map((e) => e.label).join(" ← ")}
      </ThemedText>
    </Pressable>
  );

  if (loading) {
    return (
      <ScreenScrollView>
        <View style={styles.container}>
          <ThemedView style={styles.card}>
            <ThemedText style={styles.emptyText}>جاري التحميل...</ThemedText>
          </ThemedView>
        </View>
      </ScreenScrollView>
    );
  }

  if (trips.length === 0) {
    return (
      <ScreenScrollView>
        <View style={styles.container}>
          <ThemedView style={styles.card}>
            <View style={styles.emptyState}>
              <Feather name="clock" size={48} color={theme.textSecondary} />
              <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
                لا توجد رحلات محفوظة بعد
              </ThemedText>
              <ThemedText style={[styles.emptyHint, { color: theme.textSecondary }]}>
                ابدأ رحلة جديدة واحفظها لتظهر هنا
              </ThemedText>
            </View>
          </ThemedView>
        </View>
      </ScreenScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={trips}
        renderItem={renderTripItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
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
  listContent: {
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  tripCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.xs,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  tripHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
  },
  tripInfo: {
    flex: 1,
  },
  tripDate: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: Spacing.xs,
    textAlign: "right",
  },
  tripMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    justifyContent: "flex-end",
  },
  tripDuration: {
    fontSize: 14,
    marginLeft: Spacing.xs,
  },
  eventCount: {
    fontSize: 14,
  },
  deleteButton: {
    padding: Spacing.xs,
  },
  tripPreview: {
    fontSize: 14,
    textAlign: "right",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing["3xl"],
    gap: Spacing.md,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  emptyHint: {
    fontSize: 14,
    textAlign: "center",
  },
});
