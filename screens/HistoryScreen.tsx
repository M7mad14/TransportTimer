import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, StyleSheet, Pressable, FlatList, Alert, TextInput } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { getAllTrips, deleteTrip, SavedTrip } from "@/utils/storage";
import { useHaptics } from "@/hooks/useHaptics";

type SortOption = 'newest' | 'oldest' | 'longest' | 'shortest';

export default function HistoryScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { playLight } = useHaptics();
  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showSortOptions, setShowSortOptions] = useState(false);

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

  const filteredAndSortedTrips = useMemo(() => {
    let result = [...trips];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(trip => {
        const hasMatchingEvent = trip.events.some(e => e.label.toLowerCase().includes(query));
        const hasMatchingLocation = trip.startLocation?.toLowerCase().includes(query);
        const hasMatchingSummary = trip.summary.toLowerCase().includes(query);
        return hasMatchingEvent || hasMatchingLocation || hasMatchingSummary;
      });
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
        break;
      case 'oldest':
        result.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
        break;
      case 'longest':
        result.sort((a, b) => {
          const durationA = b.endTime.getTime() - b.startTime.getTime();
          const durationB = a.endTime.getTime() - a.startTime.getTime();
          return durationA - durationB;
        });
        break;
      case 'shortest':
        result.sort((a, b) => {
          const durationA = a.endTime.getTime() - a.startTime.getTime();
          const durationB = b.endTime.getTime() - b.startTime.getTime();
          return durationA - durationB;
        });
        break;
    }

    return result;
  }, [trips, searchQuery, sortBy]);

  const getSortLabel = (option: SortOption): string => {
    switch (option) {
      case 'newest': return 'الأحدث أولاً';
      case 'oldest': return 'الأقدم أولاً';
      case 'longest': return 'الأطول مدة';
      case 'shortest': return 'الأقصر مدة';
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
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      {/* Header Actions */}
      <View style={[styles.header, { backgroundColor: theme.backgroundDefault }]}>
        <View style={styles.headerActions}>
          <Pressable
            style={({ pressed }) => [
              styles.headerButton,
              { backgroundColor: theme.backgroundSecondary, opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={() => {
              playLight();
              navigation.navigate('Statistics' as never);
            }}
          >
            <Feather name="bar-chart-2" size={20} color={theme.text} />
            <ThemedText style={styles.headerButtonText}>إحصائيات</ThemedText>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.headerButton,
              { backgroundColor: theme.backgroundSecondary, opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={() => {
              playLight();
              navigation.navigate('Export' as never);
            }}
          >
            <Feather name="download" size={20} color={theme.text} />
            <ThemedText style={styles.headerButtonText}>تصدير</ThemedText>
          </Pressable>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color={theme.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[
              styles.searchInput,
              {
                backgroundColor: theme.backgroundSecondary,
                color: theme.text,
              },
            ]}
            placeholder="ابحث في الرحلات..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            textAlign="right"
          />
          {searchQuery.length > 0 && (
            <Pressable
              onPress={() => setSearchQuery('')}
              hitSlop={8}
              style={styles.clearButton}
            >
              <Feather name="x" size={20} color={theme.textSecondary} />
            </Pressable>
          )}
        </View>

        {/* Sort Options */}
        <Pressable
          style={({ pressed }) => [
            styles.sortButton,
            {
              backgroundColor: theme.backgroundSecondary,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
          onPress={() => {
            playLight();
            setShowSortOptions(!showSortOptions);
          }}
        >
          <Feather name="filter" size={18} color={theme.text} />
          <ThemedText style={styles.sortButtonText}>{getSortLabel(sortBy)}</ThemedText>
          <Feather name={showSortOptions ? 'chevron-up' : 'chevron-down'} size={18} color={theme.text} />
        </Pressable>

        {showSortOptions && (
          <View style={[styles.sortDropdown, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
            {(['newest', 'oldest', 'longest', 'shortest'] as SortOption[]).map(option => (
              <Pressable
                key={option}
                style={({ pressed }) => [
                  styles.sortOption,
                  {
                    backgroundColor: sortBy === option ? theme.accent + '20' : 'transparent',
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
                onPress={() => {
                  playLight();
                  setSortBy(option);
                  setShowSortOptions(false);
                }}
              >
                <ThemedText style={[styles.sortOptionText, sortBy === option && { color: theme.accent }]}>
                  {getSortLabel(option)}
                </ThemedText>
                {sortBy === option && <Feather name="check" size={18} color={theme.accent} />}
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <FlatList
        data={filteredAndSortedTrips}
        renderItem={renderTripItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="search" size={48} color={theme.textSecondary} />
            <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
              لم يتم العثور على رحلات
            </ThemedText>
            {searchQuery.length > 0 && (
              <Pressable
                style={({ pressed }) => [
                  styles.clearSearchButton,
                  { backgroundColor: theme.accent, opacity: pressed ? 0.7 : 1 },
                ]}
                onPress={() => setSearchQuery('')}
              >
                <ThemedText style={styles.clearSearchButtonText}>مسح البحث</ThemedText>
              </Pressable>
            )}
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
    gap: Spacing.md,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(99, 102, 241, 0.1)',
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  headerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  headerButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    right: Spacing.md,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    height: 48,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingRight: 44,
    paddingLeft: 44,
    fontSize: 15,
    fontWeight: '500',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  clearButton: {
    position: 'absolute',
    left: Spacing.md,
    zIndex: 1,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sortDropdown: {
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    overflow: 'hidden',
    marginTop: -Spacing.xs,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  sortOptionText: {
    fontSize: 14,
    fontWeight: '500',
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
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  tripCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.1)',
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
  clearSearchButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.md,
  },
  clearSearchButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
});
