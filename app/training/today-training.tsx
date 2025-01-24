import IconComponent from '@/components/icons/icons';
import SuccessModal from '@/components/modal/success-modal';
import axiosInstance from '@/lib/axios';
import { useProfileStore, useThemeStore, useTrainingStore } from '@/stores/store';
import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as SecureStore from "expo-secure-store";
import { useCheckCompletion } from '@/hooks/useCheckCompletion';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import OfflinePage from '@/components/offline-page';

export default function TodayTrainingScreen() {
    const { checkedItems, trainingPercentage, toggleCheckbox, getTodayTraining } = useTrainingStore((state) => state);
    const { user, setCharacter } = useProfileStore((state) => state);
    const [showModalSuccess, setShowModalSuccess] = useState<boolean>(false);
    const todayTraining = getTodayTraining();
    const expGain = 100;
    const pointGain = 1;
    const [loading, setLoading] = useState<boolean>(false);
    const { isCompleteToday } = useCheckCompletion();
    const { isDarkMode } = useThemeStore((state) => state);
    const { isConnected } = useNetworkStatus();

    const formatDuration = (min: number) => {
        const hours = Math.floor(min / 60);
        const remainingMinutes = min % 60;
        return `${hours} h ${remainingMinutes} min`;
    }

    const fetchCharacterData = async () => {
        try {
            const token = await SecureStore.getItemAsync("accessToken");
            const response = await axiosInstance.get(`/auth/character/${user?.userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setCharacter(response?.data?.data);
        } catch (error) {
            console.log(error);
        }
    }

    const onCompleteTraining = async () => {
        setLoading(true);
        try {
            const token = await SecureStore.getItemAsync("accessToken");
            await axiosInstance.patch(`/workout/complete/${user?.userId}`, {
                workoutId: todayTraining?.id,
                exp: expGain,
                points: pointGain,
                calorieBurn: todayTraining?.calorieBurn,
                duration: todayTraining?.duration
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const today = new Date().toDateString();
            await SecureStore.setItemAsync("lastCompletedDate", today);
            setShowModalSuccess(true);
            setLoading(false);
            fetchCharacterData();
        } catch (error) {
            setLoading(false);
            console.log(error);
            alert("Failed to complete training. Please try again.");
        }
    }

    if (!isConnected) {
        return (
            <OfflinePage />
        )
    }

    return (
        <View style={[styles.container, { backgroundColor: isDarkMode ? "#181C14" : "#FFF" }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <IconComponent name="ChevronLeft" size={24} color={isDarkMode ? "#FFF" : "#000"} />
                </TouchableOpacity>
                <Text style={[styles.title, { flex: 1, textAlign: "center", color: isDarkMode ? "#FFF" : "#000", marginRight: 24 }]}>Today Training</Text>
            </View>
            <View style={{ borderWidth: 1, borderColor: isDarkMode ? "#373737" : "#E8E8E8", borderRadius: 10, padding: 15, marginTop: 30, display: todayTraining?.exercises?.length === undefined ? "none" : "flex", flexDirection: "row", gap: 30 }}>
                <View style={{ gap: 5 }}>
                    <Text style={[styles.description, { color: isDarkMode ? "#FFF" : "#000", opacity: 0.8 }]}>Day : {todayTraining?.date || "Today"}</Text>
                    <Text style={[styles.description, { color: isDarkMode ? "#FFF" : "#000", opacity: 0.8 }]}>EXP : 100 EXP</Text>
                    <Text style={[styles.description, { color: isDarkMode ? "#FFF" : "#000", opacity: 0.8 }]}>Burn : {todayTraining?.calorieBurn || 1} Cal</Text>
                </View>
                <View style={{ gap: 5 }}>
                    <Text style={[styles.description, { color: isDarkMode ? "#FFF" : "#000", opacity: 0.8 }]}>Completed : {trainingPercentage.toFixed()}%</Text>
                    <Text style={[styles.description, { color: isDarkMode ? "#FFF" : "#000", opacity: 0.8 }]}>Total Exercises : {todayTraining?.exercises?.length || 0} Exercise</Text>
                    <Text style={[styles.description, { color: isDarkMode ? "#FFF" : "#000", opacity: 0.8 }]}>Time : {formatDuration(todayTraining?.duration || 1)}</Text>
                </View>
            </View>
            <Text style={[styles.title, { fontSize: 20, marginTop: 30, display: todayTraining?.exercises?.length === undefined ? "none" : "flex", color: isDarkMode ? "#FFF" : "#000" }]}>List Exercise</Text>
            <View>
                {todayTraining?.exercises?.length === undefined ? (
                    <View style={{ height: "70%", display: "flex", justifyContent: "center", alignItems: "center", marginTop: 20 }}>
                        <Text style={{ fontFamily: "PoppinsRegular", fontSize: 16, textAlign: "center", color: isDarkMode ? "#FFF" : "#000" }}>No Exercise</Text>
                    </View>
                ) :
                    todayTraining?.exercises?.map((train, index) => (
                        <View key={index} style={[styles.exerciseItem, { backgroundColor: isDarkMode ? "#1E1E1E" : "#F8F8F8" }]}>
                            <TouchableOpacity
                                onPress={() => toggleCheckbox(index)}
                                disabled={isCompleteToday}
                                style={[styles.checkbox, { backgroundColor: checkedItems[index] ? isDarkMode ? "#fff" : "#000" : "transparent", borderColor: isDarkMode ? "#373737" : "#8F8F8F" }]}
                            >
                                {checkedItems[index] && (
                                    <IconComponent name="Check" size={16} color={isDarkMode ? "#000" : "#fff"} />
                                )}
                            </TouchableOpacity>
                            <Text style={{ fontFamily: "PoppinsRegular", fontSize: 14, color: isDarkMode ? "#FFF" : "#000" }}>{`${train?.name} ${train?.sets} Sets ${train?.repetitions} Reps`}</Text>
                        </View>
                    ))}
                {todayTraining !== undefined ? (
                    <View>
                        <TouchableOpacity onPress={() => onCompleteTraining()} style={[styles.doneButton, { backgroundColor: trainingPercentage < 100 ? isDarkMode ? "#2c2c2c" : "#e2e8f0" : "#000", display: isCompleteToday ? "none" : "flex" }]} activeOpacity={0.7} disabled={trainingPercentage < 100}>
                            {loading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={[styles.doneButtonText, { color: trainingPercentage < 100 ? isDarkMode ? "#727272" : "#94a3b8" : "#FFF" }]}>DONE</Text>
                            )}
                        </TouchableOpacity>
                        <SuccessModal showModalSuccess={showModalSuccess} setShowModalSuccess={setShowModalSuccess} expGain={expGain} pointGain={pointGain} />
                    </View>
                ) : null}
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
    },
    title: {
        fontSize: 20,
        fontFamily: "PoppinsSemiBold",
    },
    description: {
        fontFamily: "PoppinsRegular",
        fontSize: 14
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
    },
    backButton: {
        width: 24
    },
    exerciseItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        padding: 15,
        marginTop: 10,
        borderRadius: 10
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 1,
        borderRadius: 4,
        justifyContent: "center",
        alignItems: "center",
    },
    doneButton: {
        padding: 15,
        borderRadius: 10,
        marginVertical: 20,
        alignItems: "center",
    },
    doneButtonText: {
        fontFamily: "PoppinsBold",
        fontSize: 16,
        color: "#fff",
        textAlign: "center"
    }
});
