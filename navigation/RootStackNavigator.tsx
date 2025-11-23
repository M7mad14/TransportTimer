import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import TimerScreen from "@/screens/TimerScreen";
import { getCommonScreenOptions } from "./screenOptions";
import { HeaderTitle } from "@/components/HeaderTitle";
import { useTheme } from "@/hooks/useTheme";
import { useColorScheme } from "@/hooks/useColorScheme";

export type RootStackParamList = {
  Timer: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const { theme } = useTheme();
  const colorScheme = useColorScheme();

  return (
    <Stack.Navigator
      screenOptions={getCommonScreenOptions({
        theme,
        isDark: colorScheme === "dark",
        transparent: true,
      })}
    >
      <Stack.Screen
        name="Timer"
        component={TimerScreen}
        options={{
          headerShown: true,
          headerTitle: () => <HeaderTitle title="مؤقّت الرحلات" />,
        }}
      />
    </Stack.Navigator>
  );
}
