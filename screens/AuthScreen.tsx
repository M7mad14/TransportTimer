import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Alert,
  I18nManager,
  TextInput,
  ScrollView,
  SafeAreaView,
} from "react-native";
import * as Haptics from "expo-haptics";
import * as LocalAuthentication from "expo-local-authentication";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BIOMETRIC_ENABLED_KEY = '@biometric_enabled';

interface AuthScreenProps {
  onAuthenticated: () => void;
}

export default function AuthScreen({ onAuthenticated }: AuthScreenProps) {
  const { theme } = useTheme();
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    I18nManager.forceRTL(true);
    I18nManager.allowRTL(true);
    checkExistingPin();
    checkBiometric();
  }, []);

  const checkBiometric = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      const biometricEnabled = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
      
      if (compatible && enrolled && biometricEnabled === 'true') {
        setBiometricAvailable(true);
        // Auto-trigger biometric authentication
        setTimeout(() => {
          handleBiometricAuth();
        }, 500);
      }
    } catch (error) {
      console.error('Error checking biometric:', error);
    }
  };

  const handleBiometricAuth = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'تسجيل الدخول',
        fallbackLabel: 'استخدام الرمز',
        cancelLabel: 'إلغاء',
      });

      if (result.success) {
        setPin("");
        onAuthenticated();
      }
    } catch (error) {
      console.error('Biometric auth error:', error);
    }
  };

  const checkExistingPin = async () => {
    try {
      const savedPin = await AsyncStorage.getItem("@app_pin");
      setIsSettingPin(!savedPin);
    } catch (error) {
      console.error("Error checking PIN:", error);
    }
  };

  const playClickSound = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Silent fail if haptics not available
    }
  };

  const handleSetPin = async () => {
    if (pin.length < 4) {
      Alert.alert("", "يجب أن يكون الرمز 4 أرقام على الأقل");
      return;
    }
    if (pin !== confirmPin) {
      Alert.alert("", "الرموز غير متطابقة");
      setPin("");
      setConfirmPin("");
      return;
    }
    try {
      await AsyncStorage.setItem("@app_pin", pin);
      setPin("");
      setConfirmPin("");
      setIsSettingPin(false);
      Alert.alert("", "تم تعيين الرمز بنجاح");
    } catch (error) {
      Alert.alert("", "خطأ في حفظ الرمز");
    }
  };

  const handleVerifyPin = async () => {
    if (pin.length === 0) {
      Alert.alert("", "يرجى إدخال الرمز");
      return;
    }
    try {
      const savedPin = await AsyncStorage.getItem("@app_pin");
      if (pin === savedPin) {
        setPin("");
        onAuthenticated();
      } else {
        Alert.alert("", "رمز غير صحيح");
        setPin("");
      }
    } catch (error) {
      Alert.alert("", "خطأ في التحقق من الرمز");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
        <ThemedView style={styles.card}>
          <View style={styles.headerSection}>
            <Feather name="lock" size={48} color={theme.accent} />
            <ThemedText style={styles.title}>
              {isSettingPin ? "تعيين الرمز الأمني" : "الدخول إلى التطبيق"}
            </ThemedText>
          </View>

          <View style={styles.form}>
            <View>
              <ThemedText style={styles.label}>
                {isSettingPin ? "أدخل رمز جديد" : "أدخل الرمز"}
              </ThemedText>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.backgroundSecondary,
                      borderColor: theme.border,
                      color: theme.text,
                    },
                  ]}
                  placeholder="0000"
                  placeholderTextColor={theme.textSecondary}
                  value={pin}
                  onChangeText={setPin}
                  secureTextEntry={!showPassword}
                  keyboardType="numeric"
                  maxLength={6}
                  textAlign="center"
                />
                <Pressable
                  style={styles.eyeButton}
                  onPress={() => {
                    playClickSound();
                    setShowPassword(!showPassword);
                  }}
                  hitSlop={8}
                >
                  <Feather
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color={theme.text}
                  />
                </Pressable>
              </View>
            </View>

            {isSettingPin && (
              <View>
                <ThemedText style={styles.label}>تأكيد الرمز</ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.backgroundSecondary,
                      borderColor: theme.border,
                      color: theme.text,
                    },
                  ]}
                  placeholder="0000"
                  placeholderTextColor={theme.textSecondary}
                  value={confirmPin}
                  onChangeText={setConfirmPin}
                  secureTextEntry={!showPassword}
                  keyboardType="numeric"
                  maxLength={6}
                  textAlign="center"
                />
              </View>
            )}

            <Pressable
              style={({ pressed }) => [
                styles.button,
                {
                  backgroundColor: theme.accent,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
              onPress={() => {
                playClickSound();
                if (isSettingPin) {
                  handleSetPin();
                } else {
                  handleVerifyPin();
                }
              }}
            >
              <ThemedText style={styles.buttonText}>
                {isSettingPin ? "تعيين الرمز" : "دخول"}
              </ThemedText>
            </Pressable>

            {!isSettingPin && biometricAvailable && (
              <Pressable
                style={({ pressed }) => [
                  styles.biometricButton,
                  {
                    backgroundColor: theme.backgroundSecondary,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
                onPress={() => {
                  playClickSound();
                  handleBiometricAuth();
                }}
              >
                <Feather name="smartphone" size={20} color={theme.accent} />
                <ThemedText style={[styles.biometricButtonText, { color: theme.accent }]}>
                  استخدام البصمة / الوجه
                </ThemedText>
              </Pressable>
            )}
          </View>

          <ThemedText style={styles.hint}>
            {isSettingPin
              ? "ستحتاج إلى هذا الرمز لتسجيل الدخول إلى التطبيق"
              : "أدخل الرمز الذي قمت بتعيينه مسبقاً"}
          </ThemedText>
        </ThemedView>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  container: {
    paddingHorizontal: Spacing.lg,
    justifyContent: "center",
  },
  card: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.15)',
  },
  headerSection: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
    gap: Spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  form: {
    gap: Spacing.lg,
    marginBottom: Spacing["2xl"],
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: Spacing.sm,
  },
  inputContainer: {
    position: "relative",
  },
  input: {
    height: 56,
    borderWidth: 2,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    fontSize: 24,
    fontWeight: "600",
    letterSpacing: 4,
  },
  eyeButton: {
    position: "absolute",
    left: Spacing.md,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  button: {
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  hint: {
    fontSize: 12,
    textAlign: "center",
    opacity: 0.6,
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  biometricButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
