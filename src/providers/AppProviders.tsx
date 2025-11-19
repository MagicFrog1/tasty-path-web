import React from 'react';
import { ThemeProvider } from 'styled-components';
import { theme } from '../styles/theme';
import { AuthProvider } from '../context/AuthContext';
import { SubscriptionProvider } from '../context/SubscriptionContext';
import { NavigationProvider } from '../context/NavigationContext';
import { RevenueCatProvider } from '../context/RevenueCatContext';
import { UserProfileProvider } from '../context/UserProfileContext';
import { WeeklyPlanProvider } from '../context/WeeklyPlanContext';
import { ShoppingListProvider } from '../context/ShoppingListContext';

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <SubscriptionProvider>
          <NavigationProvider>
            <RevenueCatProvider>
              <UserProfileProvider>
                <WeeklyPlanProvider>
                  <ShoppingListProvider>{children}</ShoppingListProvider>
                </WeeklyPlanProvider>
              </UserProfileProvider>
            </RevenueCatProvider>
          </NavigationProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};





