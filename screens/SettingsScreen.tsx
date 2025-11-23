import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, Alert, Switch, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { useHaptics } from '@/hooks/useHaptics';
import { createBackup, restoreBackup, clearAllData } from '@/utils/backup';

const BIOMETRIC_ENABLED_KEY = '@biometric_enabled';

export default function SettingsScreen() {
  const { theme } = useTheme();
  const { playSuccess, playError, playWarning, playLight } = useHaptics();
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkBiometricSupport();
    loadBiometricPreference();
  }, []);

  const checkBiometricSupport = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setBiometricAvailable(compatible && enrolled);
    } catch (error) {
      console.error('Error checking biometric support:', error);
    }
  };

  const loadBiometricPreference = async () => {
    try {
      const value = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
      setBiometricEnabled(value === 'true');
    } catch (error) {
      console.error('Error loading biometric preference:', error);
    }
  };

  const toggleBiometric = async (value: boolean) => {
    try {
      if (value) {
        // Test biometric authentication before enabling
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'تأكيد الهوية',
          fallbackLabel: 'استخدام الرمز',
        });

        if (result.success) {
          await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true');
          setBiometricEnabled(true);
          playSuccess();
          Alert.alert('', 'تم تفعيل المصادقة البيومترية ✅');
        } else {
          playError();
        }
      } else {
        await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'false');
        setBiometricEnabled(false);
        playSuccess();
        Alert.alert('', 'تم تعطيل المصادقة البيومترية');
      }
    } catch (error) {
      playError();
      Alert.alert('', 'حدث خطأ أثناء تغيير الإعدادات');
    }
  };

  const handleCreateBackup = async () => {
    setLoading(true);
    playLight();
    
    try {
      const success = await createBackup();
      if (success) {
        playSuccess();
        Alert.alert('', 'تم إنشاء النسخة الاحتياطية بنجاح ✅');
      } else {
        playError();
        Alert.alert('', 'حدث خطأ أثناء إنشاء النسخة الاحتياطية');
      }
    } catch (error) {
      playError();
      Alert.alert('', 'حدث خطأ أثناء إنشاء النسخة الاحتياطية');
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreBackup = async () => {
    Alert.alert(
      'استعادة النسخة الاحتياطية',
      'سيتم استبدال جميع البيانات الحالية. هل تريد المتابعة؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'استعادة',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            playLight();
            
            try {
              const result = await restoreBackup();
              if (result.success) {
                playSuccess();
                Alert.alert(
                  'نجح الاستعادة',
                  `${result.message}\nتم استعادة ${result.tripsCount} رحلة`,
                  [{ text: 'موافق', onPress: () => {} }]
                );
              } else {
                playError();
                Alert.alert('', result.message);
              }
            } catch (error) {
              playError();
              Alert.alert('', 'حدث خطأ أثناء استعادة النسخة الاحتياطية');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleClearAllData = () => {
    Alert.alert(
      'مسح جميع البيانات',
      'سيتم حذف جميع الرحلات بشكل دائم. لا يمكن التراجع عن هذا الإجراء!',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'مسح الكل',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            playWarning();
            
            try {
              const success = await clearAllData();
              if (success) {
                playSuccess();
                Alert.alert('', 'تم مسح جميع البيانات');
              } else {
                playError();
                Alert.alert('', 'حدث خطأ أثناء مسح البيانات');
              }
            } catch (error) {
              playError();
              Alert.alert('', 'حدث خطأ أثناء مسح البيانات');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={styles.content}>
        {/* Security Section */}
        <ThemedView style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="shield" size={24} color={theme.accent} />
            <ThemedText style={styles.sectionTitle}>الأمان</ThemedText>
          </View>

          {biometricAvailable ? (
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <ThemedText style={styles.settingLabel}>المصادقة البيومترية</ThemedText>
                <ThemedText style={[styles.settingDesc, { color: theme.textSecondary }]}>
                  استخدم بصمة الإصبع أو التعرف على الوجه للدخول
                </ThemedText>
              </View>
              <Switch
                value={biometricEnabled}
                onValueChange={toggleBiometric}
                trackColor={{ false: theme.border, true: theme.accent }}
                thumbColor="#fff"
              />
            </View>
          ) : (
            <View style={[styles.infoBox, { backgroundColor: theme.backgroundSecondary }]}>
              <Feather name="info" size={18} color={theme.textSecondary} />
              <ThemedText style={[styles.infoText, { color: theme.textSecondary }]}>
                المصادقة البيومترية غير متاحة على هذا الجهاز
              </ThemedText>
            </View>
          )}
        </ThemedView>

        {/* Backup Section */}
        <ThemedView style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="database" size={24} color={theme.accent} />
            <ThemedText style={styles.sectionTitle}>النسخ الاحتياطي</ThemedText>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              {
                backgroundColor: theme.backgroundSecondary,
                borderColor: theme.border,
                opacity: pressed ? 0.7 : loading ? 0.5 : 1,
              },
            ]}
            onPress={handleCreateBackup}
            disabled={loading}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#10B981' + '20' }]}>
              <Feather name="upload" size={20} color="#10B981" />
            </View>
            <View style={styles.actionInfo}>
              <ThemedText style={styles.actionTitle}>إنشاء نسخة احتياطية</ThemedText>
              <ThemedText style={[styles.actionDesc, { color: theme.textSecondary }]}>
                حفظ جميع الرحلات والإعدادات
              </ThemedText>
            </View>
            <Feather name="chevron-left" size={20} color={theme.textSecondary} />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              {
                backgroundColor: theme.backgroundSecondary,
                borderColor: theme.border,
                opacity: pressed ? 0.7 : loading ? 0.5 : 1,
              },
            ]}
            onPress={handleRestoreBackup}
            disabled={loading}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#3B82F6' + '20' }]}>
              <Feather name="download" size={20} color="#3B82F6" />
            </View>
            <View style={styles.actionInfo}>
              <ThemedText style={styles.actionTitle}>استعادة نسخة احتياطية</ThemedText>
              <ThemedText style={[styles.actionDesc, { color: theme.textSecondary }]}>
                استيراد البيانات من نسخة سابقة
              </ThemedText>
            </View>
            <Feather name="chevron-left" size={20} color={theme.textSecondary} />
          </Pressable>
        </ThemedView>

        {/* Danger Zone */}
        <ThemedView style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="alert-triangle" size={24} color="#EF4444" />
            <ThemedText style={[styles.sectionTitle, { color: '#EF4444' }]}>منطقة الخطر</ThemedText>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              styles.dangerButton,
              {
                backgroundColor: theme.backgroundSecondary,
                borderColor: '#EF4444',
                opacity: pressed ? 0.7 : loading ? 0.5 : 1,
              },
            ]}
            onPress={handleClearAllData}
            disabled={loading}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#EF4444' + '20' }]}>
              <Feather name="trash-2" size={20} color="#EF4444" />
            </View>
            <View style={styles.actionInfo}>
              <ThemedText style={[styles.actionTitle, { color: '#EF4444' }]}>
                مسح جميع البيانات
              </ThemedText>
              <ThemedText style={[styles.actionDesc, { color: theme.textSecondary }]}>
                حذف جميع الرحلات بشكل دائم
              </ThemedText>
            </View>
            <Feather name="chevron-left" size={20} color="#EF4444" />
          </Pressable>
        </ThemedView>

        {/* App Info */}
        <View style={styles.appInfo}>
          <ThemedText style={[styles.appInfoText, { color: theme.textSecondary }]}>
            مؤقت الرحلات v1.0.0
          </ThemedText>
          <ThemedText style={[styles.appInfoText, { color: theme.textSecondary }]}>
            تطبيق لتسجيل وتتبع أوقات الرحلات والمواصلات
          </ThemedText>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.xl,
    paddingBottom: Spacing['4xl'],
  },
  section: {
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  settingInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  settingDesc: {
    fontSize: 12,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  infoText: {
    fontSize: 13,
    flex: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    marginBottom: Spacing.md,
    gap: Spacing.lg,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  dangerButton: {
    borderWidth: 2,
  },
  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 1,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  actionDesc: {
    fontSize: 12,
  },
  appInfo: {
    alignItems: 'center',
    paddingTop: Spacing.lg,
    gap: Spacing.xs,
  },
  appInfoText: {
    fontSize: 12,
    textAlign: 'center',
  },
});

