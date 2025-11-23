import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { useTrips } from '@/hooks/useTrips';
import { calculateStatistics, formatDuration, TripStatistics } from '@/utils/tripAnalytics';

const { width: screenWidth } = Dimensions.get('window');

export default function StatisticsScreen() {
  const { theme } = useTheme();
  const { trips, loadTrips } = useTrips();
  const [stats, setStats] = useState<TripStatistics | null>(null);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  useEffect(() => {
    if (trips.length > 0) {
      const calculatedStats = calculateStatistics(trips);
      setStats(calculatedStats);
    }
  }, [trips]);

  if (!stats || trips.length === 0) {
    return (
      <ScrollView style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <View style={styles.emptyState}>
          <Feather name="bar-chart-2" size={64} color={theme.textSecondary} />
          <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
            لا توجد بيانات كافية للإحصائيات
          </ThemedText>
          <ThemedText style={[styles.emptyHint, { color: theme.textSecondary }]}>
            ابدأ رحلات جديدة لرؤية إحصائياتك هنا
          </ThemedText>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={styles.content}>
        {/* Overview Cards */}
        <View style={styles.cardsRow}>
          <ThemedView style={[styles.statCard, styles.cardHalf]}>
            <View style={[styles.iconCircle, { backgroundColor: theme.accent + '20' }]}>
              <Feather name="activity" size={24} color={theme.accent} />
            </View>
            <ThemedText style={styles.statValue}>{stats.totalTrips}</ThemedText>
            <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
              إجمالي الرحلات
            </ThemedText>
          </ThemedView>

          <ThemedView style={[styles.statCard, styles.cardHalf]}>
            <View style={[styles.iconCircle, { backgroundColor: '#10B981' + '20' }]}>
              <Feather name="clock" size={24} color="#10B981" />
            </View>
            <ThemedText style={styles.statValue}>
              {formatDuration(stats.averageDuration)}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
              متوسط الوقت
            </ThemedText>
          </ThemedView>
        </View>

        <View style={styles.cardsRow}>
          <ThemedView style={[styles.statCard, styles.cardHalf]}>
            <View style={[styles.iconCircle, { backgroundColor: '#F59E0B' + '20' }]}>
              <Feather name="zap" size={24} color="#F59E0B" />
            </View>
            <ThemedText style={styles.statValue}>{stats.totalEvents}</ThemedText>
            <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
              إجمالي الأحداث
            </ThemedText>
          </ThemedView>

          <ThemedView style={[styles.statCard, styles.cardHalf]}>
            <View style={[styles.iconCircle, { backgroundColor: '#8B5CF6' + '20' }]}>
              <Feather name="trending-up" size={24} color="#8B5CF6" />
            </View>
            <ThemedText style={styles.statValue}>{stats.averageEventsPerTrip}</ThemedText>
            <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
              أحداث لكل رحلة
            </ThemedText>
          </ThemedView>
        </View>

        {/* Duration Stats */}
        <ThemedView style={styles.card}>
          <View style={styles.cardHeader}>
            <Feather name="clock" size={20} color={theme.text} />
            <ThemedText style={styles.cardTitle}>إحصائيات المدة</ThemedText>
          </View>
          
          <View style={styles.durationRow}>
            <View style={styles.durationItem}>
              <ThemedText style={[styles.durationLabel, { color: theme.textSecondary }]}>
                الوقت الإجمالي
              </ThemedText>
              <ThemedText style={styles.durationValue}>
                {formatDuration(stats.totalDuration)}
              </ThemedText>
            </View>
          </View>

          {stats.shortestTrip && (
            <View style={styles.durationRow}>
              <View style={styles.durationItem}>
                <ThemedText style={[styles.durationLabel, { color: theme.textSecondary }]}>
                  أقصر رحلة
                </ThemedText>
                <ThemedText style={styles.durationValue}>
                  {formatDuration(stats.shortestTrip.duration)}
                </ThemedText>
              </View>
            </View>
          )}

          {stats.longestTrip && (
            <View style={styles.durationRow}>
              <View style={styles.durationItem}>
                <ThemedText style={[styles.durationLabel, { color: theme.textSecondary }]}>
                  أطول رحلة
                </ThemedText>
                <ThemedText style={styles.durationValue}>
                  {formatDuration(stats.longestTrip.duration)}
                </ThemedText>
              </View>
            </View>
          )}
        </ThemedView>

        {/* Recent Trends */}
        <ThemedView style={styles.card}>
          <View style={styles.cardHeader}>
            <Feather name="trending-up" size={20} color={theme.text} />
            <ThemedText style={styles.cardTitle}>الاتجاهات الأخيرة</ThemedText>
          </View>
          
          <View style={styles.trendRow}>
            <ThemedText style={styles.trendValue}>{stats.recentTrends.last7Days}</ThemedText>
            <ThemedText style={[styles.trendLabel, { color: theme.textSecondary }]}>
              رحلات في آخر 7 أيام
            </ThemedText>
          </View>

          <View style={styles.trendRow}>
            <ThemedText style={styles.trendValue}>{stats.recentTrends.last30Days}</ThemedText>
            <ThemedText style={[styles.trendLabel, { color: theme.textSecondary }]}>
              رحلات في آخر 30 يوماً
            </ThemedText>
          </View>
        </ThemedView>

        {/* Most Common Events */}
        {stats.mostCommonEvents.length > 0 && (
          <ThemedView style={styles.card}>
            <View style={styles.cardHeader}>
              <Feather name="star" size={20} color={theme.text} />
              <ThemedText style={styles.cardTitle}>الأحداث الأكثر شيوعاً</ThemedText>
            </View>
            
            {stats.mostCommonEvents.map((event, index) => (
              <View key={index} style={[styles.eventRow, { borderBottomColor: theme.border }]}>
                <View style={styles.eventInfo}>
                  <ThemedText style={styles.eventLabel}>{event.label}</ThemedText>
                  <View style={styles.eventBar}>
                    <View
                      style={[
                        styles.eventBarFill,
                        {
                          backgroundColor: theme.accent,
                          width: `${(event.count / stats.mostCommonEvents[0].count) * 100}%`,
                        },
                      ]}
                    />
                  </View>
                </View>
                <ThemedText style={styles.eventCount}>{event.count}</ThemedText>
              </View>
            ))}
          </ThemedView>
        )}

        {/* Day of Week Distribution */}
        <ThemedView style={styles.card}>
          <View style={styles.cardHeader}>
            <Feather name="calendar" size={20} color={theme.text} />
            <ThemedText style={styles.cardTitle}>الرحلات حسب اليوم</ThemedText>
          </View>
          
          {Object.entries(stats.tripsByDayOfWeek).map(([day, count]) => (
            <View key={day} style={[styles.dayRow, { borderBottomColor: theme.border }]}>
              <View style={styles.dayInfo}>
                <ThemedText style={styles.dayLabel}>{day}</ThemedText>
                <View style={styles.dayBar}>
                  <View
                    style={[
                      styles.dayBarFill,
                      {
                        backgroundColor: theme.accent,
                        width: stats.totalTrips > 0 ? `${(count / stats.totalTrips) * 100}%` : '0%',
                      },
                    ]}
                  />
                </View>
              </View>
              <ThemedText style={styles.dayCount}>{count}</ThemedText>
            </View>
          ))}
        </ThemedView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing['3xl'],
  },
  cardsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  statCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.15)',
  },
  cardHalf: {
    flex: 1,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: Spacing.xs,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  card: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.1)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  durationRow: {
    marginBottom: Spacing.md,
  },
  durationItem: {
    alignItems: 'center',
  },
  durationLabel: {
    fontSize: 14,
    marginBottom: Spacing.xs,
  },
  durationValue: {
    fontSize: 20,
    fontWeight: '600',
  },
  trendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  trendValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  trendLabel: {
    fontSize: 14,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  eventInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  eventLabel: {
    fontSize: 14,
    marginBottom: Spacing.xs,
  },
  eventBar: {
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  eventBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  eventCount: {
    fontSize: 18,
    fontWeight: '600',
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  dayInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  dayLabel: {
    fontSize: 14,
    marginBottom: Spacing.xs,
  },
  dayBar: {
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  dayBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  dayCount: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['5xl'],
    gap: Spacing.md,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyHint: {
    fontSize: 14,
    textAlign: 'center',
  },
});

