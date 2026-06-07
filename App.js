import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import { colors } from './src/constants/colors';
import TrainingLoggerScreen from './src/screens/TrainingLoggerScreen';
import HomeScreen from './src/screens/HomeScreen';
import MealPlanScreen from './src/screens/MealPlanScreen';
import SupplementsScreen from './src/screens/SupplementsScreen';
import ProgressScreen from './src/screens/ProgressScreen';

enableScreens();

const Tab = createBottomTabNavigator();

const TAB_ICON = {
  Home: ['home', 'home-outline'],
  Training: ['barbell', 'barbell-outline'],
  Meals: ['restaurant', 'restaurant-outline'],
  Supps: ['fitness', 'fitness-outline'],
  Progress: ['trending-up', 'trending-up-outline'],
};

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" backgroundColor={colors.bg} />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarStyle: {
              backgroundColor: colors.surface,
              borderTopColor: colors.cardBorder,
              borderTopWidth: 1,
              height: 62,
              paddingBottom: 10,
              paddingTop: 8,
            },
            tabBarActiveTintColor: colors.accent,
            tabBarInactiveTintColor: colors.textMuted,
            tabBarLabelStyle: {
              fontSize: 9,
              fontWeight: '700',
              letterSpacing: 0.8,
            },
            tabBarIcon: ({ focused, color }) => {
              const [active, inactive] = TAB_ICON[route.name] || ['ellipse', 'ellipse-outline'];
              return <Ionicons name={focused ? active : inactive} size={22} color={color} />;
            },
          })}
        >
          <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'HOME' }} />
          <Tab.Screen name="Training" component={TrainingLoggerScreen} options={{ tabBarLabel: 'TRAIN' }} />
          <Tab.Screen name="Meals" component={MealPlanScreen} options={{ tabBarLabel: 'MEALS' }} />
          <Tab.Screen name="Supps" component={SupplementsScreen} options={{ tabBarLabel: 'SUPPS' }} />
          <Tab.Screen name="Progress" component={ProgressScreen} options={{ tabBarLabel: 'PROGRESS' }} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
