import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Link, router } from 'expo-router';
import { useProfileStore, useThemeStore } from '@/stores/store';
import { useEffect, useState } from 'react';
import * as SecureStore from "expo-secure-store";
import levelThresholds from '@/utils/levelThresholds';
import axiosInstance from '@/lib/axios';
import { jwtDecode } from 'jwt-decode';
import OfflinePage from '@/components/offline-page';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import Animated, { useAnimatedStyle, withRepeat, withSequence, withTiming, useSharedValue } from 'react-native-reanimated';

export default function Index() {
  const { user, setUser, character, setCharacter } = useProfileStore((state) => state);
  const { isDarkMode } = useThemeStore((state) => state);
  const [accessToken, setAccessToken] = useState<string | null>("");
  const { isConnected } = useNetworkStatus();
  const [loadingGetCharacter, setLoadingGetCharacter] = useState<boolean>(false);

  const fetchData = async () => {
    try {
      const token = await SecureStore.getItemAsync("accessToken");

      if (!token) {
        router.push("/auth/login");
        return;
      }
    } catch (error) {
      console.log(error);
      router.push("/auth/login");
    }
  }

  const getCharacterData = async () => {
    setLoadingGetCharacter(true);
    try {
      const token = await SecureStore.getItemAsync("accessToken");
      setAccessToken(token);

      if (token === null) {
        throw new Error("Access token is null");
      }

      const decoded = jwtDecode<any>(token);
      setUser(decoded);
      const userId = decoded?.userId;

      const response = await axiosInstance.get(`/auth/character/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      setCharacter(response?.data?.data);
      setLoadingGetCharacter(false);
    } catch (error: any) {
      console.log(error);
      setLoadingGetCharacter(false);
      if (error?.response?.data?.message?.name === "TokenExpiredError") {
        alert("Login session expired.");
      }
      router.push("/auth/login");
    }
  }

  const shimmerOpacity = useSharedValue(0.3);

  useEffect(() => {
    if (loadingGetCharacter) {
      shimmerOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1000 }),
          withTiming(0.3, { duration: 1000 })
        ),
        -1
      );
    }
  }, [loadingGetCharacter]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: shimmerOpacity.value
    };
  });

  useEffect(() => {
    getCharacterData()
    fetchData();
  }, [accessToken, user?.userId])

  if (!isConnected) {
    return (
      <OfflinePage />
    )
  }

  return (
    <View style={isDarkMode ? styles.containerDark : styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: "#A8A8A8" }]}>Hello 👋,</Text>
          <Text style={[styles.title, { color: isDarkMode ? "#FFF" : "#000" }]}>{user?.username || "Guest"}</Text>
        </View>
        <Link href="/profile/profile" asChild>
          <TouchableOpacity style={styles.avatar}>
            {user?.profile_picture_url ? (
              <Image source={user?.profile_picture_url} contentFit="cover" style={{ width: "100%", height: "100%" }} />
            ) : null
            }
          </TouchableOpacity>
        </Link>
      </View>
      <View style={styles.playerContainer}>
        {character?.level >= 1 && character?.level <= 3 ? isDarkMode ? (
          <Image source={require('../../assets/images/player-dark.png')} contentFit="contain" style={[styles.player]} />
        ) : (
          <Image source={require('../../assets/images/player.png')} contentFit="contain" style={[styles.player]} />
        )
          : character?.level >= 4 && character?.level <= 6 ? (
            <Image source={require('../../assets/images/player2.png')} contentFit="contain" style={[styles.player]} />
          ) : character?.level >= 7 && character?.level <= 9 ? (
            <Image source={require('../../assets/images/player3.png')} contentFit="contain" style={[styles.player]} />
          ) : character?.level >= 10 ? (
            <Image source={require('../../assets/images/player4.png')} contentFit="contain" style={[styles.player]} />
          ) : isDarkMode ? (
            <Image source={require('../../assets/images/player-dark.png')} contentFit="contain" style={[styles.player]} />
          ) : (
            <Image source={require('../../assets/images/player.png')} contentFit="contain" style={[styles.player]} />
          )}
        <View style={{ marginTop: 20 }}>
          {loadingGetCharacter ? (
            <View>
              <Animated.View style={[styles.skeletonText, { width: 120, height: 30, backgroundColor: isDarkMode ? "#2A2E26" : "#E1E9EE", marginBottom: 8 }, animatedStyle]} />
              <Animated.View style={[styles.skeletonText, { width: 200, height: 30, backgroundColor: isDarkMode ? "#2A2E26" : "#E1E9EE" }, animatedStyle]} />
            </View>
          ) : (
            <View>
              <Text style={[styles.title, { textAlign: "center", color: isDarkMode ? "#FFF" : "#000" }]}>LEVEL {character?.level > 10 ? "MAX" : character?.level || 0}</Text>
              <Text style={[styles.title, { color: "#A8A8A8", textAlign: "center" }]}>EXP {character?.exp?.toLocaleString() || 0}{character?.level < 10 ? `/${levelThresholds[character?.level as keyof typeof levelThresholds || 1000]}` : null}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    paddingTop: 50,
    paddingHorizontal: 25,
    backgroundColor: "#fff",
  },
  containerDark: {
    flex: 1,
    flexDirection: "column",
    paddingTop: 50,
    paddingHorizontal: 25,
    backgroundColor: "#181C14",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: "PoppinsSemiBold",
  },
  text: {
    color: "#fff",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#6075FF",
    overflow: "hidden"
  },
  playerContainer: {
    width: "100%",
    height: "80%",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  player: {
    width: 400,
    height: 400,
  },
  skeletonText: {
    borderRadius: 4,
    alignSelf: "center",
    opacity: 0.7
  },
});
