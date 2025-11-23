import React, { useState, useEffect } from "react";
import { StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";

import RootStackNavigator from "@/navigation/RootStackNavigator";
import AuthScreen from "@/screens/AuthScreen";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const savedPin = await AsyncStorage.getItem("@app_pin");
      if (!savedPin) {
        // First time - need to set PIN
        setIsAuthenticated(false);
      } else {
        // PIN exists but user is not logged in yet
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Error checking authentication:", error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <GestureHandlerRootView style={styles.root}>
          <KeyboardProvider>
            {!isAuthenticated ? (
              <AuthScreen onAuthenticated={() => setIsAuthenticated(true)} />
            ) : (
              <NavigationContainer>
                <RootStackNavigator />
              </NavigationContainer>
            )}
            <StatusBar style="auto" />
          </KeyboardProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
