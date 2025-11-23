import { useCallback } from 'react';
import * as Haptics from 'expo-haptics';

export const useHaptics = () => {
  const playLight = useCallback(async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Silent fail if haptics not available
    }
  }, []);

  const playMedium = useCallback(async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      // Silent fail if haptics not available
    }
  }, []);

  const playHeavy = useCallback(async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (error) {
      // Silent fail if haptics not available
    }
  }, []);

  const playSuccess = useCallback(async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      // Silent fail if haptics not available
    }
  }, []);

  const playWarning = useCallback(async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (error) {
      // Silent fail if haptics not available
    }
  }, []);

  const playError = useCallback(async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (error) {
      // Silent fail if haptics not available
    }
  }, []);

  return {
    playLight,
    playMedium,
    playHeavy,
    playSuccess,
    playWarning,
    playError,
  };
};

