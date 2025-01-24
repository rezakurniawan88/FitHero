import IconComponent from "@/components/icons/icons";
import useFetchPersonalInfo from "@/hooks/useFetchPersonalInfo";
import { useProfileStore, useThemeStore } from "@/stores/store";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import * as SecureStore from "expo-secure-store";
import OfflinePage from "@/components/offline-page";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

export default function GoalsScreen() {
    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const { user, personalInfo, targetWeight, setTargetWeight } = useProfileStore((state) => state);
    const { fetchPersonalInfo } = useFetchPersonalInfo();
    const [editTargetWeight, setEditTargetWeight] = useState<string>("");
    const { isDarkMode } = useThemeStore((state) => state);
    const { isConnected } = useNetworkStatus();

    const toggleEditMode = () => {
        setIsEditMode(!isEditMode);
    };

    const saveEditTarget = async () => {
        setTargetWeight(editTargetWeight);
        await SecureStore.setItemAsync("targetWeight", editTargetWeight);
        setIsEditMode(false);
    }

    const calculateCompletion = (target: string, current: string) => {
        const targetNum = parseFloat(target) || 0;
        const currentNum = parseFloat(current) || 0;

        if (targetNum >= currentNum) {
            return Math.round((currentNum / targetNum) * 100);
        } else {
            return Math.round((targetNum / currentNum) * 100);
        }
    };

    useEffect(() => {
        fetchPersonalInfo();
    }, [user?.userId, fetchPersonalInfo]);

    useEffect(() => {
        const getTargetWeight = async () => {
            const targetWeight = await SecureStore.getItemAsync("targetWeight");
            if (targetWeight) {
                setTargetWeight(targetWeight);
            }
        };

        getTargetWeight();
    }, [])

    if (!isConnected) {
        return (
            <OfflinePage />
        )
    }

    return (
        <View style={[styles.container, { backgroundColor: isDarkMode ? "#181C14" : "#FFF" }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <IconComponent name="ChevronLeft" size={24} color={isDarkMode ? "#FFF" : "#000"} />
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: isDarkMode ? "#FFF" : "#000" }]}>Goals</Text>
                    <TouchableOpacity onPress={isEditMode ? saveEditTarget : toggleEditMode} style={styles.editButton}>
                        <IconComponent name={isEditMode ? "Save" : "SquarePen"} size={22} color={isDarkMode ? "#FFF" : "#000"} />
                    </TouchableOpacity>
                </View>

                <View style={styles.cardContainer}>
                    <View style={[styles.cardInfo, { backgroundColor: isDarkMode ? "#1E1E1E" : "#FAFAFA" }]}>
                        <View style={{ display: "flex", flexDirection: "column" }}>
                            <Text style={[styles.cardInfoTitle, { color: isDarkMode ? "#FFF" : "#000" }]}>Current</Text>
                            <Text style={[styles.cardInfoValue, { color: isDarkMode ? "#FFF" : "#000" }]}>{personalInfo?.weight || 0} kg</Text>
                        </View>
                    </View>
                    <View style={[styles.cardInfo, { backgroundColor: isDarkMode ? "#1E1E1E" : "#FAFAFA" }]}>
                        <View style={{ display: "flex", flexDirection: "column" }}>
                            <Text style={[styles.cardInfoTitle, { color: isDarkMode ? "#FFF" : "#000" }]}>Target</Text>
                            <Text style={[styles.cardInfoValue, { color: isDarkMode ? "#FFF" : "#000" }]}>{targetWeight || 0} kg</Text>
                        </View>
                    </View>
                </View>

                <View style={{ marginTop: 24 }}>
                    <View style={[styles.goalCard, { backgroundColor: isDarkMode ? "#1E1E1E" : "#FAFAFA" }]}>
                        <Text style={[styles.goalTitle, { color: isDarkMode ? "#FFF" : "#000" }]}>Weight Goal</Text>
                        <View style={styles.goalDetails}>
                            <View style={styles.goalInfo}>
                                <Text style={[styles.goalLabel, { color: isDarkMode ? "#FFF" : "#000" }]}>Current:</Text>
                                <Text style={[styles.goalValue, { color: isDarkMode ? "#FFF" : "#000" }]}>
                                    {`${personalInfo?.weight || 0} kg`}
                                </Text>
                            </View>
                            <View style={styles.goalInfo}>
                                <Text style={[styles.goalLabel, { color: isDarkMode ? "#FFF" : "#000" }]}>Target:</Text>
                                {isEditMode ? (
                                    <TextInput
                                        style={[styles.input, { color: isDarkMode ? "#FFF" : "#000" }]}
                                        value={editTargetWeight}
                                        onChangeText={(text) => setEditTargetWeight(text)}
                                        keyboardType="numeric"
                                    />
                                ) : (
                                    <Text style={[styles.goalValue, { color: isDarkMode ? "#FFF" : "#000" }]}>
                                        {`${targetWeight || 0} kg`}
                                    </Text>
                                )}
                            </View>
                        </View>
                        <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { width: `${calculateCompletion(targetWeight, personalInfo?.weight)}%` }]} />
                        </View>
                        <Text style={styles.progressText}>{calculateCompletion(targetWeight, personalInfo?.weight)}% Complete</Text>
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
        flex: 1,
        textAlign: "center",
        marginRight: 24
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },
    backButton: {
        width: 24
    },
    cardContainer: {
        display: "flex",
        flexDirection: "row",
        width: "100%",
        gap: 20,
        marginTop: 16
    },
    cardInfo: {
        width: "47%",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        padding: 15,
        borderRadius: 10
    },
    cardInfoTitle: {
        fontFamily: "PoppinsMedium",
        fontSize: 12,
        opacity: 0.5
    },
    cardInfoValue: {
        fontFamily: "PoppinsSemiBold",
        fontSize: 20
    },
    goalCard: {
        padding: 20,
        borderRadius: 15,
        marginBottom: 15,
    },
    editButton: {
        position: "absolute",
        right: 0,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 5,
        padding: 5,
        width: 60,
        marginLeft: 5,
        fontFamily: "PoppinsMedium",
        fontSize: 14,
    },
    goalTitle: {
        fontSize: 18,
        fontFamily: "PoppinsSemiBold",
        marginBottom: 10,
    },
    goalDetails: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 15,
    },
    goalInfo: {
        flexDirection: "row",
        alignItems: "center",
    },
    goalLabel: {
        fontSize: 14,
        fontFamily: "PoppinsRegular",
        marginRight: 5,
        opacity: 0.5
    },
    goalValue: {
        fontSize: 14,
        fontFamily: "PoppinsMedium",
    },
    progressBar: {
        height: 8,
        backgroundColor: "#E0E0E0",
        borderRadius: 4,
        marginBottom: 5,
    },
    progressFill: {
        height: "100%",
        backgroundColor: "#4A90E2",
        borderRadius: 4,
    },
    progressText: {
        fontSize: 12,
        fontFamily: "PoppinsRegular",
        color: "#666",
        textAlign: "right",
    },
});