import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, Alert, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { ScreenScrollView } from '@/components/ScreenScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { useTrips } from '@/hooks/useTrips';
import { useHaptics } from '@/hooks/useHaptics';
import { exportTripsToJSON, exportTripsToCSV, exportTripsToText } from '@/utils/exportTrips';

export default function ExportScreen() {
  const { theme } = useTheme();
  const { trips, loadTrips } = useTrips();
  const { playSuccess, playError } = useHaptics();
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  const handleExport = async (format: 'json' | 'csv' | 'text') => {
    if (trips.length === 0) {
      Alert.alert('', 'لا توجد رحلات للتصدير');
      playError();
      return;
    }

    setExporting(true);
    let success = false;

    try {
      switch (format) {
        case 'json':
          success = await exportTripsToJSON(trips);
          break;
        case 'csv':
          success = await exportTripsToCSV(trips);
          break;
        case 'text':
          success = await exportTripsToText(trips);
          break;
      }

      if (success) {
        Alert.alert('', 'تم تصدير الرحلات بنجاح ✅');
        playSuccess();
      } else {
        Alert.alert('', 'حدث خطأ أثناء التصدير');
        playError();
      }
    } catch (error) {
      Alert.alert('', 'حدث خطأ أثناء التصدير');
      playError();
    } finally {
      setExporting(false);
    }
  };

  return (
    <ScreenScrollView>
      <View style={styles.container}>
        <ThemedView style={styles.card}>
          <View style={styles.header}>
            <Feather name="download" size={48} color={theme.accent} />
            <ThemedText style={styles.title}>تصدير الرحلات</ThemedText>
            <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
              اختر صيغة التصدير المناسبة لك
            </ThemedText>
          </View>

          <View style={styles.infoBox}>
            <Feather name="info" size={20} color={theme.accent} />
            <ThemedText style={[styles.infoText, { color: theme.textSecondary }]}>
              لديك {trips.length} رحلة محفوظة
            </ThemedText>
          </View>

          <View style={styles.exportOptions}>
            {/* JSON Export */}
            <Pressable
              style={({ pressed }) => [
                styles.exportButton,
                {
                  backgroundColor: theme.backgroundSecondary,
                  borderColor: theme.border,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
              onPress={() => handleExport('json')}
              disabled={exporting || trips.length === 0}
            >
              <View style={[styles.exportIcon, { backgroundColor: '#3B82F6' + '20' }]}>
                <Feather name="code" size={24} color="#3B82F6" />
              </View>
              <View style={styles.exportInfo}>
                <ThemedText style={styles.exportTitle}>JSON</ThemedText>
                <ThemedText style={[styles.exportDesc, { color: theme.textSecondary }]}>
                  مناسب للنسخ الاحتياطي واستيراد البيانات
                </ThemedText>
              </View>
              <Feather name="chevron-left" size={20} color={theme.textSecondary} />
            </Pressable>

            {/* CSV Export */}
            <Pressable
              style={({ pressed }) => [
                styles.exportButton,
                {
                  backgroundColor: theme.backgroundSecondary,
                  borderColor: theme.border,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
              onPress={() => handleExport('csv')}
              disabled={exporting || trips.length === 0}
            >
              <View style={[styles.exportIcon, { backgroundColor: '#10B981' + '20' }]}>
                <Feather name="file-text" size={24} color="#10B981" />
              </View>
              <View style={styles.exportInfo}>
                <ThemedText style={styles.exportTitle}>CSV</ThemedText>
                <ThemedText style={[styles.exportDesc, { color: theme.textSecondary }]}>
                  مناسب لجداول البيانات (Excel, Google Sheets)
                </ThemedText>
              </View>
              <Feather name="chevron-left" size={20} color={theme.textSecondary} />
            </Pressable>

            {/* Text Export */}
            <Pressable
              style={({ pressed }) => [
                styles.exportButton,
                {
                  backgroundColor: theme.backgroundSecondary,
                  borderColor: theme.border,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
              onPress={() => handleExport('text')}
              disabled={exporting || trips.length === 0}
            >
              <View style={[styles.exportIcon, { backgroundColor: '#F59E0B' + '20' }]}>
                <Feather name="file" size={24} color="#F59E0B" />
              </View>
              <View style={styles.exportInfo}>
                <ThemedText style={styles.exportTitle}>نص عادي</ThemedText>
                <ThemedText style={[styles.exportDesc, { color: theme.textSecondary }]}>
                  مناسب للقراءة والمشاركة السريعة
                </ThemedText>
              </View>
              <Feather name="chevron-left" size={20} color={theme.textSecondary} />
            </Pressable>
          </View>

          {exporting && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.accent} />
              <ThemedText style={[styles.loadingText, { color: theme.textSecondary }]}>
                جاري التصدير...
              </ThemedText>
            </View>
          )}

          <View style={styles.footer}>
            <Feather name="shield" size={16} color={theme.textSecondary} />
            <ThemedText style={[styles.footerText, { color: theme.textSecondary }]}>
              جميع بياناتك محفوظة محلياً على جهازك
            </ThemedText>
          </View>
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
    borderRadius: BorderRadius.md,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    marginVertical: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
    gap: Spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
    marginBottom: Spacing.lg,
  },
  infoText: {
    fontSize: 14,
    flex: 1,
  },
  exportOptions: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    gap: Spacing.md,
  },
  exportIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exportInfo: {
    flex: 1,
  },
  exportTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  exportDesc: {
    fontSize: 12,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  footerText: {
    fontSize: 12,
  },
});

