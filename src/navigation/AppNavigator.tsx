// @ts-nocheck
import React from 'react';
import type { NavigationContainerRef } from '@react-navigation/native';
import { NavigationContainer } from '@react-navigation/native';
import {
  createStackNavigator,
  CardStyleInterpolators,
  StackCardInterpolationProps,
} from '@react-navigation/stack';

import HomeScreen from '../screens/HomeScreen';
import MealPlanScreen from '../screens/MealPlanScreen';
import DietConfigScreen from '../screens/DietConfigScreen';
import ShoppingListScreen from '../screens/ShoppingListScreen';
import ProfileScreen from '../screens/ProfileScreen';
import TermsScreen from '../screens/TermsScreen';
import PrivacyScreen from '../screens/PrivacyScreen';
import SecurityScreen from '../screens/SecurityScreen';
import LegalInfoScreen from '../screens/LegalInfoScreen';
import MedicalSourcesScreen from '../screens/MedicalSourcesScreen';
import PlanManagementScreen from '../screens/PlanManagementScreen';
import PlanGeneratorScreen from '../screens/PlanGeneratorScreen';
import PlanDetailScreen from '../screens/PlanDetailScreen';
import WeeklyPlannerScreen from '../screens/WeeklyPlannerScreen';
import RecipeDetailScreen from '../screens/RecipeDetailScreen';
import SavedPlansScreen from '../screens/SavedPlansScreen';
import SubscriptionScreen from '../screens/SubscriptionScreen';
const Stack = createStackNavigator();

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="MealPlan" component={MealPlanScreen} />
        <Stack.Screen name="DietConfig" component={DietConfigScreen} />
        <Stack.Screen name="PlanGenerator" component={PlanGeneratorScreen} />
        <Stack.Screen name="PlanManagement" component={PlanManagementScreen} />
        <Stack.Screen name="PlanDetail" component={PlanDetailScreen} />
        <Stack.Screen name="WeeklyPlanner" component={WeeklyPlannerScreen} />
        <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
        <Stack.Screen name="SavedPlans" component={SavedPlansScreen} />
        <Stack.Screen name="ShoppingList" component={ShoppingListScreen} />

        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Subscription" component={SubscriptionScreen} />
        <Stack.Screen name="Terms" component={TermsScreen} />
        <Stack.Screen name="Privacy" component={PrivacyScreen} />
        <Stack.Screen name="Security" component={SecurityScreen} />
        <Stack.Screen name="LegalInfo" component={LegalInfoScreen} />
        <Stack.Screen name="MedicalSources" component={MedicalSourcesScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
