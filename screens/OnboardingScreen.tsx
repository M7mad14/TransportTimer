import React from 'react';
import { View, StyleSheet, Pressable, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/constants/theme';

const { width } = Dimensions.get('window');

interface OnboardingScreenProps {
  onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const { theme } = useTheme();

  return (
    <LinearGradient
      colors={[theme.accent, theme.accentSecondary || theme.accent]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.content}>
        {/* Hero Icon */}
        <View style={[styles.heroIcon, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
          <Feather name="clock" size={80} color="#FFFFFF" />
        </View>

        {/* Title */}
        <ThemedText style={styles.title}>مؤقت الرحلات</ThemedText>
        <ThemedText style={styles.subtitle}>
          تتبع رحلاتك بسهولة ودقة
        </ThemedText>

        {/* Features */}
        <View style={styles.features}>
          <View style={styles.feature}>
            <View style={[styles.featureIcon, { backgroundColor: 'rgba(255, 255, 255, 0.25)' }]}>
              <Feather name="activity" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.featureText}>
              <ThemedText style={styles.featureTitle}>توقيت دقيق</ThemedText>
              <ThemedText style={styles.featureDesc}>سجل أحداث رحلتك بدقة الثانية</ThemedText>
            </View>
          </View>

          <View style={styles.feature}>
            <View style={[styles.featureIcon, { backgroundColor: 'rgba(255, 255, 255, 0.25)' }]}>
              <Feather name="map-pin" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.featureText}>
              <ThemedText style={styles.featureTitle}>تحديد المواقع</ThemedText>
              <ThemedText style={styles.featureDesc}>احفظ مواقع بداية ونهاية رحلاتك</ThemedText>
            </View>
          </View>

          <View style={styles.feature}>
            <View style={[styles.featureIcon, { backgroundColor: 'rgba(255, 255, 255, 0.25)' }]}>
              <Feather name="bar-chart-2" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.featureText}>
              <ThemedText style={styles.featureTitle}>إحصائيات مفصلة</ThemedText>
              <ThemedText style={styles.featureDesc}>شاهد تحليلات شاملة لرحلاتك</ThemedText>
            </View>
          </View>
        </View>

        {/* CTA Button */}
        <Pressable
          style={({ pressed }) => [
            styles.button,
            { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
          ]}
          onPress={onComplete}
        >
          <ThemedText style={styles.buttonText}>ابدأ الآن</ThemedText>
          <Feather name="arrow-left" size={20} color={theme.accent} />
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: Spacing['4xl'],
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroIcon: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing['3xl'],
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: Spacing['3xl'],
    textAlign: 'center',
  },
  features: {
    width: '100%',
    marginBottom: Spacing['3xl'],
    gap: Spacing.lg,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: Spacing.xs,
  },
  featureDesc: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: '#FFFFFF',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing['3xl'],
    borderRadius: BorderRadius.xl,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    width: '100%',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6366F1',
  },
});

