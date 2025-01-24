import OfflinePage from '@/components/offline-page';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import axiosInstance from '@/lib/axios';
import { useProfileStore, useThemeStore } from '@/stores/store';
import { useEffect, useState } from 'react';
import { Text, View, StyleSheet, ScrollView, Pressable } from 'react-native';
import * as SecureStore from "expo-secure-store";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

type TWorkoutStats = {
    id: string;
    currentStreak: number;
    longestStreak: number;
    totalCalories: number;
}

type WorkoutData = {
    id: string;
    date: string;
    duration: number;
    calorieBurn: number;
    isCompleted: boolean;
}

export default function ActivityScreen() {
    const [selectedBar, setSelectedBar] = useState<number | null>(null);
    const { user, character } = useProfileStore((state) => state);
    const { isDarkMode } = useThemeStore((state) => state);
    const [workoutData, setWorkoutData] = useState<WorkoutData[]>([]);
    const [workoutStats, setWorkoutStats] = useState<TWorkoutStats>({
        id: "",
        currentStreak: 0,
        longestStreak: 0,
        totalCalories: 0
    });
    const { isConnected } = useNetworkStatus();
    const [loadingGetStats, setLoadingGetStats] = useState<boolean>(false);
    const [loadingGetWorkoutData, setLoadingGetWorkoutData] = useState<boolean>(false);

    const chartDatas = [
        { label: "Mon", value: 0 },
        { label: "Tue", value: 0 },
        { label: "Wed", value: 0 },
        { label: "Thu", value: 0 },
        { label: "Fri", value: 0 },
        { label: "Sat", value: 0 },
        { label: "Sun", value: 0 }
    ].map(day => {
        const workout = workoutData.find(w => {
            const workoutDate = new Date(w.date);
            const dayName = workoutDate.toLocaleDateString('en-US', { weekday: 'short' });
            return dayName.toLowerCase() === day.label.toLowerCase();
        });

        return {
            label: day.label,
            value: workout ? workout.duration : 0
        };
    });

    useEffect(() => {
        const getWorkoutStats = async () => {
            setLoadingGetStats(true);
            try {
                const token = await SecureStore.getItemAsync("accessToken");
                const response = await axiosInstance.get(`/workout/stats/${user?.userId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setWorkoutStats(response?.data?.data);
                setLoadingGetStats(false);
            } catch (error) {
                console.log(error);
                setLoadingGetStats(false);
            }
        };

        const getWorkoutData = async () => {
            setLoadingGetWorkoutData(true);
            try {
                const token = await SecureStore.getItemAsync("accessToken");
                const response = await axiosInstance.get(`/workout/weekly/${user?.userId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setWorkoutData(response?.data?.data);
                setLoadingGetWorkoutData(false);
            } catch (error) {
                console.log(error);
                setLoadingGetWorkoutData(false);
            }
        }

        getWorkoutData();
        getWorkoutStats();
    }, [user?.userId])

    const shimmerOpacity = useSharedValue(0.3);

    useEffect(() => {
        if (loadingGetStats) {
            shimmerOpacity.value = withRepeat(
                withSequence(
                    withTiming(1, { duration: 1000 }),
                    withTiming(0.3, { duration: 1000 })
                ),
                -1
            );
        }
    }, [loadingGetStats]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: shimmerOpacity.value
        };
    });

    if (!isConnected) {
        return (
            <OfflinePage />
        )
    }

    return (
        <View style={[styles.container, { backgroundColor: isDarkMode ? "#181C14" : "#FFF" }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={[styles.title, { color: isDarkMode ? "#FFF" : "#000" }]}>Activity</Text>

                <View style={styles.cardsContainer}>
                    <View style={[styles.streakCard, { backgroundColor: isDarkMode ? "#1E1E1E" : "#FAFAFA" }]}>
                        <Text style={[styles.cardTitle, { color: isDarkMode ? "#FFF" : "#000" }]}>Streak</Text>
                        <View>
                            {loadingGetStats ? (
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                                    <Animated.View style={[styles.skeletonText, { width: 35, height: 30, marginBottom: 10, backgroundColor: isDarkMode ? "#2A2E26" : "#E1E9EE" }, animatedStyle]} />
                                    <Text style={styles.title}>🎯</Text>
                                </View>
                            ) : (
                                <Text style={[styles.title, { color: isDarkMode ? "#FFF" : "#000" }]}>{workoutStats?.currentStreak || 0} 🎯</Text>
                            )}
                            <Text style={styles.subtitle}>Days</Text>
                        </View>
                    </View>
                    <View style={[styles.streakCard, { backgroundColor: isDarkMode ? "#1E1E1E" : "#FAFAFA" }]}>
                        <Text style={[styles.cardTitle, { color: isDarkMode ? "#FFF" : "#000" }]}>Calories</Text>
                        <View>
                            {loadingGetStats ? (
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                                    <Animated.View style={[styles.skeletonText, { width: 55, height: 30, marginBottom: 10, backgroundColor: isDarkMode ? "#2A2E26" : "#E1E9EE" }, animatedStyle]} />
                                    <Text style={styles.title}>🔥</Text>
                                </View>
                            ) : (
                                <Text style={[styles.title, { color: isDarkMode ? "#FFF" : "#000" }]}>{workoutStats?.totalCalories || 0} 🔥</Text>
                            )}
                            <Text style={styles.subtitle}>Kal</Text>
                        </View>
                    </View>
                </View>

                <View style={[styles.chartContainer, { backgroundColor: isDarkMode ? "#1E1E1E" : "#FAFAFA" }]}>
                    <Text style={[styles.sectionTitle, { color: isDarkMode ? "#FFF" : "#000", opacity: 0.5 }]}>Workout Time ⏲</Text>
                    <View style={{ display: "flex", flexDirection: "row", gap: 5, paddingTop: 15, paddingBottom: 5, alignItems: "flex-end", minHeight: 120 }}>
                        {loadingGetWorkoutData ? (
                            chartDatas.map((datas, index) => (
                                <View key={index}>
                                    <View style={{ flexDirection: "row", justifyContent: "center", gap: 5 }}>
                                        <View key={index} style={{ flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 10 }}>
                                            <Animated.View
                                                style={[{
                                                    width: 35,
                                                    height: 70,
                                                    backgroundColor: isDarkMode ? "#2A2E26" : "#E1E9EE",
                                                    borderRadius: 10
                                                }, animatedStyle]}
                                            />
                                        </View>
                                    </View>
                                    <Text style={[styles.statsLabel, { color: isDarkMode ? "#FFF" : "#000" }]}>
                                        {datas?.label}
                                    </Text>
                                </View>
                            ))
                        ) : (
                            chartDatas.map((data, index) => (
                                <View style={{ width: 35, gap: 5 }} key={index}>
                                    <View style={{ position: "relative", alignItems: "center" }}>
                                        {selectedBar === index && (
                                            <View style={{ position: "absolute", top: -30, backgroundColor: "#525252", padding: 5, borderRadius: 5 }}>
                                                <Text style={{ fontFamily: "PoppinsRegular", fontSize: 10, color: "white" }}>
                                                    {data.value} m
                                                </Text>
                                            </View>
                                        )}
                                        <Pressable
                                            onPress={() => setSelectedBar(selectedBar === index ? null : index)}
                                            style={({ pressed }) => ({
                                                height: data?.value,
                                                width: 35,
                                                backgroundColor: selectedBar === index ? "#525252" : "#B5B5B5",
                                                borderRadius: 10,
                                                opacity: pressed ? 0.7 : 1,
                                            })}
                                        />
                                    </View>
                                    <Text style={[styles.statsLabel, { color: isDarkMode ? "#FFF" : "#000" }]}>
                                        {data?.label}
                                    </Text>
                                </View>
                            ))
                        )}
                    </View>
                </View>

                <View style={[styles.statsContainer, { backgroundColor: isDarkMode ? "#1E1E1E" : "#FAFAFA" }]}>
                    <Text style={[styles.sectionTitle, { color: isDarkMode ? "#FFF" : "#000", opacity: 0.5 }]}>Player Stats 📊</Text>
                    <View style={styles.statsSection}>
                        <View style={styles.statsCardWrap}>
                            <View style={[styles.statsCard, { backgroundColor: isDarkMode ? "#272727" : "#525252" }]}>
                                <Text style={styles.statsTitle}>{character?.strength || 0}</Text>
                            </View>
                            <Text style={[styles.statsLabel, { color: isDarkMode ? "#FFF" : "#000" }]}>Strength</Text>
                        </View>
                        <View style={styles.statsCardWrap}>
                            <View style={[styles.statsCard, { backgroundColor: isDarkMode ? "#272727" : "#525252" }]}>
                                <Text style={styles.statsTitle}>{character?.agility || 0}</Text>
                            </View>
                            <Text style={[styles.statsLabel, { color: isDarkMode ? "#FFF" : "#000" }]}>Agility</Text>
                        </View>
                        <View style={styles.statsCardWrap}>
                            <View style={[styles.statsCard, { backgroundColor: isDarkMode ? "#272727" : "#525252" }]}>
                                <Text style={styles.statsTitle}>{character?.endurance || 0}</Text>
                            </View>
                            <Text style={[styles.statsLabel, { color: isDarkMode ? "#FFF" : "#000" }]}>Endurance</Text>
                        </View>
                    </View>
                </View>

            </ScrollView>
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingTop: 50,
        paddingHorizontal: 25,
    },
    title: {
        fontSize: 24,
        fontFamily: "PoppinsSemiBold",
    },
    cardsContainer: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        gap: 20,
    },
    streakCard: {
        width: "46%",
        borderRadius: 10,
        padding: 20,
        marginTop: 20,
        flexDirection: "column",
        gap: 30,
    },
    cardTitle: {
        fontSize: 18,
        fontFamily: "PoppinsSemiBold",
        opacity: 0.5
    },
    subtitle: {
        fontSize: 12,
        fontFamily: "PoppinsRegular",
        opacity: 0.5,
        marginTop: -10
    },
    chartContainer: {
        marginTop: 30,
        padding: 20,
        borderRadius: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: "PoppinsSemiBold",
        marginBottom: 15,
    },
    chart: {
        width: "100%",
        borderRadius: 10,
        paddingRight: 0,
        paddingLeft: 0,
        marginVertical: 10,
    },
    statsContainer: {
        marginVertical: 25,
        padding: 20,
        borderRadius: 10
    },
    statsSection: {
        flexDirection: "row",
        gap: 12,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 8
    },
    statsCardWrap: {
        width: "30%",
        gap: 15
    },
    statsCard: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: "center",
        justifyContent: "center"
    },
    statsTitle: {
        fontFamily: "PoppinsBold",
        fontSize: 24,
        color: "white"
    },
    statsLabel: {
        fontFamily: "PoppinsRegular",
        fontSize: 12,
        textAlign: "center",
        opacity: 0.6
    },
    skeletonText: {
        borderRadius: 4,
        opacity: 0.7
    }
});
