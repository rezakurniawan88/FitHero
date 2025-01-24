import { Text, View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Edit } from "lucide-react-native";
import CircleProgressBar from '@/components/circle-progress-bar';
import { Accordion } from '@/components/accordion';
import { Link } from 'expo-router';
import { useProfileStore, useThemeStore, useTrainingStore } from '@/stores/store';
import IconComponent from '@/components/icons/icons';
import { useEffect } from 'react';
import useFetchWorkouts from '@/hooks/useFetchWorkouts';
import { useCheckCompletion } from '@/hooks/useCheckCompletion';
import OfflinePage from '@/components/offline-page';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

export default function TrainScreen() {
    const { trainingPercentage, datasTraining, getTodayTraining } = useTrainingStore((state) => state);
    const { user } = useProfileStore((state) => state);
    const { fetchWorkouts, loadingGetWorkouts } = useFetchWorkouts();
    const todayTraining = getTodayTraining();
    const { isCompleteToday } = useCheckCompletion();
    const { isDarkMode } = useThemeStore((state) => state);
    const { isConnected } = useNetworkStatus();

    const shimmerOpacity = useSharedValue(0.3);

    useEffect(() => {
        if (loadingGetWorkouts) {
            shimmerOpacity.value = withRepeat(
                withSequence(
                    withTiming(1, { duration: 1000 }),
                    withTiming(0.3, { duration: 1000 })
                ),
                -1
            );
        }
    }, [loadingGetWorkouts]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: shimmerOpacity.value
        };
    });

    useEffect(() => {
        fetchWorkouts();
    }, [user?.userId, fetchWorkouts]);

    if (!isConnected) {
        return (
            <OfflinePage />
        )
    }

    return (
        <View style={[styles.container, { backgroundColor: isDarkMode ? "#181C14" : "#FFF" }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: isDarkMode ? "#FFF" : "#000" }]}>Training</Text>
                    <Link href="/training/custom-training" asChild>
                        <TouchableOpacity>
                            <Edit size={24} color={isDarkMode ? "#FFF" : "#000"} />
                        </TouchableOpacity>
                    </Link>
                </View>
                <View style={{ marginVertical: 25 }}>
                    <Text style={[styles.secondaryTitle, { color: isDarkMode ? "#FFF" : "#000" }]}>Today</Text>
                    <Link href="/training/today-training" asChild>
                        <TouchableOpacity style={styles.todayTraining} activeOpacity={0.8}>
                            <View>
                                <Text style={{ color: "#E9E9E9", fontFamily: "PoppinsSemiBold", fontSize: 12, paddingBottom: 20 }}>{todayTraining?.date || "Today"}</Text>
                                <Text style={{ color: "#E9E9E9", fontFamily: "PoppinsBold", fontSize: 15 }}>{todayTraining?.isRestDay ? "Rest Day" : `${todayTraining?.exercises?.length || 0} Exercise`}</Text>
                            </View>
                            <CircleProgressBar progress={trainingPercentage} size={60} strokeWidth={8} />
                        </TouchableOpacity>
                    </Link>
                </View>
                <View style={{ marginBottom: 20 }}>
                    <Text style={[styles.secondaryTitle, { color: isDarkMode ? "#FFF" : "#000" }]}>List Workout</Text>
                    <View style={{ gap: 10, marginTop: 10 }}>
                        {loadingGetWorkouts ? (
                            <View style={{ gap: 8 }}>
                                <Animated.View style={[styles.skeletonText, { backgroundColor: isDarkMode ? "#2A2E26" : "#E1E9EE" }, animatedStyle]}></Animated.View>
                                <Animated.View style={[styles.skeletonText, { backgroundColor: isDarkMode ? "#2A2E26" : "#E1E9EE" }, animatedStyle]}></Animated.View>
                                <Animated.View style={[styles.skeletonText, { backgroundColor: isDarkMode ? "#2A2E26" : "#E1E9EE" }, animatedStyle]}></Animated.View>
                                <Animated.View style={[styles.skeletonText, { backgroundColor: isDarkMode ? "#2A2E26" : "#E1E9EE" }, animatedStyle]}></Animated.View>
                                <Animated.View style={[styles.skeletonText, { backgroundColor: isDarkMode ? "#2A2E26" : "#E1E9EE" }, animatedStyle]}></Animated.View>
                            </View>
                        ) : (
                            datasTraining?.length === 0 ? (
                                <View style={{ height: 200, alignItems: "center", justifyContent: "center" }}>
                                    <Text style={{ fontFamily: "PoppinsSemiBold", fontSize: 16, opacity: 0.3, color: isDarkMode ? "#FFF" : "#000" }}>Empty Workout Data</Text>
                                </View>
                            ) : (
                                datasTraining.map((workout: any) => (
                                    <Accordion title={workout.date} key={workout.date}>
                                        {workout.isRestDay ? (
                                            <Text style={{ color: isDarkMode ? "#FFF" : "#A8A8A8", fontFamily: "PoppinsMedium", fontSize: 16 }}>Rest Day</Text>
                                        ) : workout?.exercises?.map((exercise: any, index: number) => (
                                            <Text style={[styles.workoutListText, { color: isDarkMode ? "#FFF" : "#000" }]} key={index}>- {`${exercise?.name} ${exercise?.sets} Sets ${exercise?.repetitions} Reps`}</Text>
                                        ))
                                        }
                                        <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
                                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 }}>
                                                <IconComponent name="Flame" size={14} color={isDarkMode ? "#FFF" : "#000"} />
                                                <Text style={{ fontFamily: "PoppinsRegular", fontSize: 14, color: isDarkMode ? "#FFF" : "#000", paddingTop: 4, opacity: 0.8 }}>{workout.calorieBurn} cal</Text>
                                            </View>
                                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 }}>
                                                <IconComponent name="Timer" size={14} color={isDarkMode ? "#FFF" : "#000"} />
                                                <Text style={{ fontFamily: "PoppinsRegular", fontSize: 14, color: isDarkMode ? "#FFF" : "#000", paddingTop: 4, opacity: 0.8 }}>{workout.duration} min</Text>
                                            </View>
                                        </View>
                                    </Accordion>
                                ))
                            )
                        )}

                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
        paddingTop: 50,
        paddingHorizontal: 25,
    },
    title: {
        fontSize: 24,
        fontFamily: "PoppinsSemiBold",
    },
    secondaryTitle: {
        fontSize: 20,
        fontFamily: "PoppinsSemiBold",
        opacity: 0.6
    },
    header: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    todayTraining: {
        backgroundColor: "#202020",
        paddingVertical: 15,
        paddingHorizontal: 20,
        marginVertical: 20,
        borderRadius: 10,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    workoutListText: {
        fontFamily: "PoppinsRegular",
        fontSize: 14,
        opacity: 0.7
    },
    skeletonText: {
        borderRadius: 8,
        padding: 30
    }
});
