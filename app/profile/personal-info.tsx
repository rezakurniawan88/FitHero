import IconComponent from "@/components/icons/icons";
import OfflinePage from "@/components/offline-page";
import useFetchPersonalInfo from "@/hooks/useFetchPersonalInfo";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import axiosInstance from "@/lib/axios";
import { useProfileStore, useThemeStore } from "@/stores/store";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

export default function PersonalInfoScreen() {
    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const { user, personalInfo, setPersonalInfo } = useProfileStore((state) => state);
    const [loading, setLoading] = useState<boolean>(false);
    const { fetchPersonalInfo, loadingGetPersonalInfo } = useFetchPersonalInfo();
    const [editedInfo, setEditedInfo] = useState({
        height: "0",
        weight: "0",
        age: "0",
        gender: ""
    });
    const { isDarkMode } = useThemeStore((state) => state);
    const { isConnected } = useNetworkStatus();

    const toggleEditMode = () => setIsEditMode(!isEditMode);

    const onUpdatePersonalInfo = async () => {
        setLoading(true);
        try {
            const token = await SecureStore.getItemAsync("accessToken");
            const response = await axiosInstance.patch(`/personal-info/${user?.userId}`, {
                height: parseInt(editedInfo.height),
                weight: parseInt(editedInfo.weight),
                age: parseInt(editedInfo.age),
                gender: editedInfo.gender
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            alert(response?.data?.message);
            fetchPersonalInfo();
            setPersonalInfo(editedInfo);
            setIsEditMode(false);
            setLoading(false);
        } catch (error) {
            console.log(error);
            alert("Error updating personal info");
            setLoading(false);
        }
    }

    const shimmerOpacity = useSharedValue(0.3);

    useEffect(() => {
        if (loadingGetPersonalInfo) {
            shimmerOpacity.value = withRepeat(
                withSequence(
                    withTiming(1, { duration: 1000 }),
                    withTiming(0.3, { duration: 1000 })
                ),
                -1
            );
        }
    }, [loadingGetPersonalInfo]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: shimmerOpacity.value
        };
    });

    useEffect(() => {
        fetchPersonalInfo();
    }, [user?.userId, fetchPersonalInfo]);

    useEffect(() => {
        setEditedInfo({
            height: personalInfo?.height?.toString() || "0",
            weight: personalInfo?.weight?.toString() || "0",
            age: personalInfo?.age?.toString() || "0",
            gender: personalInfo?.gender || ""
        });
    }, [personalInfo]);

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
                    <Text style={[styles.title, { color: isDarkMode ? "#FFF" : "#000" }]}>Personal Info</Text>
                    {loading ? (
                        <ActivityIndicator size="small" color={isDarkMode ? "#FFF" : "#000"} />
                    ) : (
                        <TouchableOpacity onPress={isEditMode ? onUpdatePersonalInfo : toggleEditMode} style={styles.editButton}>
                            <IconComponent name={isEditMode ? "Check" : "Pen"} size={20} color={isDarkMode ? "#FFF" : "#000"} />
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.infoContainer}>
                    <View style={styles.infoItem}>
                        <View>
                            <Text style={styles.infoLabel}>Height</Text>
                            {isEditMode ? (
                                <TextInput
                                    style={[styles.infoInput, { backgroundColor: isDarkMode ? "#1A1A1D" : "#FFF", borderColor: isDarkMode ? "#373737" : "rgba(0,0,0,0.1)", color: isDarkMode ? "#FFF" : "#000" }]}
                                    value={editedInfo.height}
                                    placeholderTextColor={isDarkMode ? "#757575" : "#666"}
                                    onChangeText={(value) => setEditedInfo({ ...editedInfo, height: value })}
                                    keyboardType="numeric"
                                />
                            ) : (
                                loadingGetPersonalInfo ? (
                                    <View>
                                        <Animated.View style={[styles.skeletonText, { width: 70, height: 25, marginTop: 5, backgroundColor: isDarkMode ? "#2A2E26" : "#E1E9EE" }, animatedStyle]} />
                                    </View>
                                ) : (
                                    <View>
                                        <Text style={[styles.infoValue, { color: isDarkMode ? "#FFF" : "#000" }]}>{`${personalInfo?.height || 0} cm`}</Text>
                                    </View>
                                )
                            )}
                        </View>
                        <View>
                            <Text style={styles.infoLabel}>Weight</Text>
                            {isEditMode ? (
                                <TextInput
                                    style={[styles.infoInput, { backgroundColor: isDarkMode ? "#1A1A1D" : "#FFF", borderColor: isDarkMode ? "#373737" : "rgba(0,0,0,0.1)", color: isDarkMode ? "#FFF" : "#000" }]}
                                    value={editedInfo.weight}
                                    placeholderTextColor={isDarkMode ? "#757575" : "#666"}
                                    onChangeText={(value) => setEditedInfo({ ...editedInfo, weight: value })}
                                    keyboardType="numeric"
                                />
                            ) : (
                                loadingGetPersonalInfo ? (
                                    <View>
                                        <Animated.View style={[styles.skeletonText, { width: 70, height: 25, marginTop: 5, backgroundColor: isDarkMode ? "#2A2E26" : "#E1E9EE" }, animatedStyle]} />
                                    </View>
                                ) : (
                                    <View>
                                        <Text style={[styles.infoValue, { color: isDarkMode ? "#FFF" : "#000" }]}>{`${personalInfo?.weight || 0} kg`}</Text>
                                    </View>
                                )
                            )}
                        </View>
                        <View>
                            <Text style={styles.infoLabel}>Age</Text>
                            {isEditMode ? (
                                <TextInput
                                    style={[styles.infoInput, { backgroundColor: isDarkMode ? "#1A1A1D" : "#FFF", borderColor: isDarkMode ? "#373737" : "rgba(0,0,0,0.1)", color: isDarkMode ? "#FFF" : "#000" }]}
                                    value={editedInfo.age}
                                    placeholderTextColor={isDarkMode ? "#757575" : "#666"}
                                    onChangeText={(value) => setEditedInfo({ ...editedInfo, age: value })}
                                    keyboardType="numeric"
                                />
                            ) : (
                                loadingGetPersonalInfo ? (
                                    <View>
                                        <Animated.View style={[styles.skeletonText, { width: 70, height: 25, marginTop: 5, backgroundColor: isDarkMode ? "#2A2E26" : "#E1E9EE" }, animatedStyle]} />
                                    </View>
                                ) : (
                                    <View>
                                        <Text style={[styles.infoValue, { color: isDarkMode ? "#FFF" : "#000" }]}>{personalInfo?.age || 0}</Text>
                                    </View>
                                )
                            )}
                        </View>
                        <View>
                            <Text style={styles.infoLabel}>Gender</Text>
                            {isEditMode ? (
                                <TextInput
                                    style={[styles.infoInput, { backgroundColor: isDarkMode ? "#1A1A1D" : "#FFF", borderColor: isDarkMode ? "#373737" : "rgba(0,0,0,0.1)", color: isDarkMode ? "#FFF" : "#000" }]}
                                    value={editedInfo.gender}
                                    placeholderTextColor={isDarkMode ? "#757575" : "#666"}
                                    onChangeText={(value) => setEditedInfo({ ...editedInfo, gender: value })}
                                />
                            ) : (
                                loadingGetPersonalInfo ? (
                                    <View>
                                        <Animated.View style={[styles.skeletonText, { width: 70, height: 25, marginTop: 5, backgroundColor: isDarkMode ? "#2A2E26" : "#E1E9EE" }, animatedStyle]} />
                                    </View>
                                ) : (
                                    <View>
                                        <Text style={[styles.infoValue, { color: isDarkMode ? "#FFF" : "#000" }]}>{personalInfo?.gender || "Men"}</Text>
                                    </View>
                                )
                            )}
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
    editButton: {
        position: "absolute",
        right: 0,
    },
    infoContainer: {
        flexDirection: "column",
        gap: 15,
        marginTop: 20
    },
    infoItem: {
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 10,
        gap: 20,
    },
    infoLabel: {
        fontFamily: "PoppinsMedium",
        fontSize: 12,
        color: "#BABABA",
    },
    infoValue: {
        fontFamily: "PoppinsSemiBold",
        fontSize: 16,
        marginTop: 5,
    },
    infoInput: {
        fontFamily: "PoppinsSemiBold",
        fontSize: 16,
        marginTop: 5,
        padding: 5,
        borderRadius: 5,
        borderWidth: 1,
    },
    skeletonText: {
        borderRadius: 4,
        opacity: 0.7
    },
});
