import { useEffect } from 'react';
import { Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import ThemeProvider from '@/components/ThemeProvider';
import { useThemeStore } from '@/stores/store';
import useRefreshToken from '@/hooks/useRefreshToken';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    PoppinsRegular: require('../assets/fonts/Poppins-Regular.ttf'),
    PoppinsMedium: require('../assets/fonts/Poppins-Medium.ttf'),
    PoppinsSemiBold: require('../assets/fonts/Poppins-SemiBold.ttf'),
    PoppinsBold: require('../assets/fonts/Poppins-Bold.ttf'),
  });
  const { isDarkMode } = useThemeStore((state) => state);
  const pathname = usePathname();
  const refreshToken = useRefreshToken();

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    const authPaths = ['/auth/login', '/auth/register'];
    if (!authPaths.includes(pathname)) {
      refreshToken();
    }
  }, [pathname]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <View style={{ flex: 1 }}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
          <Stack.Screen name="training/today-training" options={{ headerShown: false }} />
          <Stack.Screen name="training/custom-training" options={{ headerShown: false }} />
          <Stack.Screen name="profile/profile" options={{ headerShown: false }} />
          <Stack.Screen name="profile/goals" options={{ headerShown: false }} />
          <Stack.Screen name="profile/personal-info" options={{ headerShown: false }} />
          <Stack.Screen name="auth/login" options={{ headerShown: false }} />
          <Stack.Screen name="auth/register" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style={isDarkMode ? "light" : "dark"} />
      </View>
    </ThemeProvider>
  );
}
