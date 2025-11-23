import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import TimerScreen from "@/screens/TimerScreen";
import HistoryScreen from "@/screens/HistoryScreen";
import TripDetailScreen from "@/screens/TripDetailScreen";
import StatisticsScreen from "@/screens/StatisticsScreen";
import ExportScreen from "@/screens/ExportScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import { getCommonScreenOptions } from "./screenOptions";
import { HeaderTitle } from "@/components/HeaderTitle";
import { useTheme } from "@/hooks/useTheme";
import { useColorScheme } from "@/hooks/useColorScheme";

export type RootStackParamList = {
  Timer: undefined;
  History: undefined;
  TripDetail: { tripId: string };
  Statistics: undefined;
  Export: undefined;
  Settings: undefined;
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
      <Stack.Screen
        name="History"
        component={HistoryScreen}
        options={{
          headerShown: true,
          headerTitle: () => <HeaderTitle title="الرحلات السابقة" />,
        }}
      />
      <Stack.Screen
        name="TripDetail"
        component={TripDetailScreen}
        options={{
          headerShown: true,
          headerTitle: () => <HeaderTitle title="تفاصيل الرحلة" />,
        }}
      />
      <Stack.Screen
        name="Statistics"
        component={StatisticsScreen}
        options={{
          headerShown: true,
          headerTitle: () => <HeaderTitle title="الإحصائيات" />,
        }}
      />
      <Stack.Screen
        name="Export"
        component={ExportScreen}
        options={{
          headerShown: true,
          headerTitle: () => <HeaderTitle title="تصدير البيانات" />,
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerShown: true,
          headerTitle: () => <HeaderTitle title="الإعدادات" />,
        }}
      />
    </Stack.Navigator>
  );
}
