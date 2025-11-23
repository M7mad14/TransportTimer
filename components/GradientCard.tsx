import React from 'react';
import { ViewProps, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';
import { BorderRadius } from '@/constants/theme';

interface GradientCardProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger';
}

export const GradientCard: React.FC<GradientCardProps> = ({
  children,
  variant = 'primary',
  style,
  ...props
}) => {
  const { theme } = useTheme();

  const getColors = () => {
    switch (variant) {
      case 'primary':
        return [theme.accent, theme.accentSecondary || theme.accent];
      case 'success':
        return ['#10B981', '#34D399'];
      case 'warning':
        return ['#F59E0B', '#FBBF24'];
      case 'danger':
        return ['#EF4444', '#F87171'];
      default:
        return [theme.accent, theme.accentSecondary || theme.accent];
    }
  };

  return (
    <LinearGradient
      colors={getColors()}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, style]}
      {...props}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    padding: 20,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
  },
});

