import IconComponent from '@/components/icons/icons';
import ResetModal from '@/components/modal/reset-modal';
import OfflinePage from '@/components/offline-page';
import useFetchPersonalInfo from '@/hooks/useFetchPersonalInfo';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import axiosInstance from '@/lib/axios';
import { useProfileStore, useThemeStore } from '@/stores/store';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import * as SecureStore from "expo-secure-store";
import { Text, View, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

export default function ProfileScreen() {
    const [selectedTab, setSelectedTab] = useState<string>("personal");
    const { personalInfo, user, character, setCharacter } = useProfileStore((state) => state);
    const { fetchPersonalInfo, loadingGetPersonalInfo } = useFetchPersonalInfo();
    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingReset, setLoadingReset] = useState<boolean>(false);
    const [showModalReset, setShowModalReset] = useState<boolean>(false);
    const [strengthIncrease, setStrengthIncrease] = useState<number>(0);
    const [agilityIncrease, setAgilityIncrease] = useState<number>(0);
    const [enduranceIncrease, setEnduranceIncrease] = useState<number>(0);
    const { isDarkMode } = useThemeStore((state) => state);
    const { isConnected } = useNetworkStatus();

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

    const onSetCharacterAbility = async () => {
        setLoading(true);
        try {
            const token = await SecureStore.getItemAsync("accessToken");
            await axiosInstance.patch(`/auth/character/${user?.userId}`, {
                strengthIncrease,
                agilityIncrease,
                enduranceIncrease
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setLoading(false);
            setIsEditMode(false);
            setStrengthIncrease(0);
            setAgilityIncrease(0);
            setEnduranceIncrease(0);
            fetchCharacterData();
        } catch (error) {
            console.log(error);
            setLoading(false);
        }
    }

    const onResetAbility = async () => {
        setLoadingReset(true);
        try {
            const token = await SecureStore.getItemAsync("accessToken");
            await axiosInstance.patch(`/auth/character/reset/${user?.userId}`, null, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setLoadingReset(false);
            setShowModalReset(false);
            fetchCharacterData();
        } catch (error) {
            console.log(error);
            setLoadingReset(false);
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
                    <Text style={[styles.title, { color: isDarkMode ? "#FFF" : "#000" }]}>Profile</Text>
                </View>
                <View style={styles.profileContainer}>
                    <View style={styles.avatar}>
                        {user?.profile_picture_url ? (
                            <Image source={user?.profile_picture_url} contentFit="cover" style={{ width: "100%", height: "100%" }} />
                        ) : null
                        }
                    </View>
                    <View style={{ marginBottom: 20 }}>
                        <Text style={{ fontFamily: "PoppinsSemiBold", fontSize: 20, textAlign: "center", color: isDarkMode ? "#FFF" : "#000" }}>{user?.username || "Guest"}</Text>
                        <Text style={{ fontFamily: "PoppinsSemiBold", fontSize: 16, color: "#BABABA", textAlign: "center" }}>Level {character?.level || 0}</Text>
                    </View>
                    <View style={{ display: "flex", flexDirection: "row", width: "100%", gap: 20 }}>
                        <View style={[styles.cardInfo, { backgroundColor: isDarkMode ? "#1E1E1E" : "#FAFAFA" }]}>
                            <View style={[styles.cardInfoIcon, { backgroundColor: "#B6FFA8" }]}>
                                <Text style={{ fontFamily: "PoppinsSemiBold", fontSize: 24 }}>📊</Text>
                            </View>
                            <View style={{ display: "flex", flexDirection: "column" }}>
                                <Text style={[styles.cardInfoTitle, { color: isDarkMode ? "#FFF" : "#000" }]}>EXP</Text>
                                <Text style={[styles.cardInfoValue, { color: isDarkMode ? "#FFF" : "#000" }]}>{character?.exp || 0}</Text>
                            </View>
                        </View>
                        <View style={[styles.cardInfo, { backgroundColor: isDarkMode ? "#1E1E1E" : "#FAFAFA" }]}>
                            <View style={[styles.cardInfoIcon, { backgroundColor: "#ABCFFF" }]}>
                                <Text style={{ fontFamily: "PoppinsSemiBold", fontSize: 24 }}>💎</Text>
                            </View>
                            <View style={{ display: "flex", flexDirection: "column" }}>
                                <Text style={[styles.cardInfoTitle, { color: isDarkMode ? "#FFF" : "#000" }]}>Point</Text>
                                <Text style={[styles.cardInfoValue, { color: isDarkMode ? "#FFF" : "#000" }]}>{character?.points || 0}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={{ width: "100%", marginTop: 20, backgroundColor: isDarkMode ? "#1E1E1E" : "#F5F5F5", flexDirection: "row", alignItems: "center", borderRadius: 15, padding: 7, gap: 5 }}>
                        <TouchableOpacity
                            style={{
                                justifyContent: "space-between",
                                alignItems: "center",
                                width: "47%",
                                marginLeft: 5,
                                backgroundColor: selectedTab === 'personal' ? isDarkMode ? "#1A1A1D" : "#FDFDFD" : isDarkMode ? "#1E1E1E" : "#F5F5F5",
                                padding: 10,
                                borderRadius: 15
                            }}
                            onPress={() => setSelectedTab('personal')}
                        >
                            <Text style={{ fontFamily: "PoppinsSemiBold", fontSize: 14, color: isDarkMode ? "#FFF" : "#000" }}>Profile</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{
                                justifyContent: "space-between",
                                alignItems: "center",
                                width: "47%",
                                marginLeft: 5,
                                backgroundColor: selectedTab === 'stats' ? isDarkMode ? "#1A1A1D" : "#FDFDFD" : isDarkMode ? "#1E1E1E" : "#F5F5F5",
                                padding: 10,
                                borderRadius: 15
                            }}
                            onPress={() => setSelectedTab('stats')}
                        >
                            <Text style={{ fontFamily: "PoppinsSemiBold", fontSize: 14, color: isDarkMode ? "#FFF" : "#000" }}>Stats</Text>
                        </TouchableOpacity>
                    </View>

                    {selectedTab === "personal" ? (
                        <View style={[styles.personalInfoSection, { backgroundColor: isDarkMode ? "#1E1E1E" : "#FAFAFA" }]}>
                            <Text style={[styles.sectionTitle, { color: isDarkMode ? "#FFF" : "#000" }]}>Personal Info</Text>
                            <View style={styles.infoContainer}>
                                <View style={[styles.infoItem, { backgroundColor: isDarkMode ? "#1A1A1D" : "#FFF" }]}>
                                    <Text style={styles.infoLabel}>Height</Text>
                                    {loadingGetPersonalInfo ? (
                                        <View>
                                            <Animated.View style={[styles.skeletonText, { width: 70, height: 25, marginTop: 5, backgroundColor: isDarkMode ? "#2A2E26" : "#E1E9EE" }, animatedStyle]} />
                                        </View>
                                    ) : (
                                        <View>
                                            <Text style={[styles.infoValue, { color: isDarkMode ? "#FFF" : "#000" }]}>{personalInfo?.height || 0} cm</Text>
                                        </View>
                                    )}
                                </View>
                                <View style={[styles.infoItem, { backgroundColor: isDarkMode ? "#1A1A1D" : "#FFF" }]}>
                                    <Text style={styles.infoLabel}>Weight</Text>
                                    {loadingGetPersonalInfo ? (
                                        <View>
                                            <Animated.View style={[styles.skeletonText, { width: 70, height: 25, marginTop: 5, backgroundColor: isDarkMode ? "#2A2E26" : "#E1E9EE" }, animatedStyle]} />
                                        </View>
                                    ) : (
                                        <Text style={[styles.infoValue, { color: isDarkMode ? "#FFF" : "#000" }]}>{personalInfo?.weight || 0} kg</Text>
                                    )}
                                </View>
                                <View style={[styles.infoItem, { backgroundColor: isDarkMode ? "#1A1A1D" : "#FFF" }]}>
                                    <Text style={styles.infoLabel}>Age</Text>
                                    {loadingGetPersonalInfo ? (
                                        <View>
                                            <Animated.View style={[styles.skeletonText, { width: 70, height: 25, marginTop: 5, backgroundColor: isDarkMode ? "#2A2E26" : "#E1E9EE" }, animatedStyle]} />
                                        </View>
                                    ) : (
                                        <View>
                                            <Text style={[styles.infoValue, { color: isDarkMode ? "#FFF" : "#000" }]}>{personalInfo?.age || 0}</Text>
                                        </View>
                                    )}
                                </View>
                                <View style={[styles.infoItem, { backgroundColor: isDarkMode ? "#1A1A1D" : "#FFF" }]}>
                                    <Text style={styles.infoLabel}>Gender</Text>
                                    {loadingGetPersonalInfo ? (
                                        <View>
                                            <Animated.View style={[styles.skeletonText, { width: 70, height: 25, marginTop: 5, backgroundColor: isDarkMode ? "#2A2E26" : "#E1E9EE" }, animatedStyle]} />
                                        </View>
                                    ) : (
                                        <View>
                                            <Text style={[styles.infoValue, { color: isDarkMode ? "#FFF" : "#000" }]}>{personalInfo?.gender || "Men"}</Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        </View>
                    ) : (
                        <View style={[styles.personalInfoSection, { backgroundColor: isDarkMode ? "#1E1E1E" : "#FAFAFA" }]}>
                            <View style={styles.characterHeader}>
                                <Text style={[styles.sectionTitle, { color: isDarkMode ? "#FFF" : "#000", marginBottom: 0 }]}>Player Stats</Text>
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                                    <TouchableOpacity onPress={() => setShowModalReset(true)} style={{ paddingHorizontal: 10, borderRadius: 10 }}>
                                        <IconComponent name="RotateCcw" size={18} color={isDarkMode ? "#FFF" : "#000"} />
                                    </TouchableOpacity>
                                    <ResetModal showModalReset={showModalReset} setShowModalReset={setShowModalReset} onReset={onResetAbility} loadingReset={loadingReset} />
                                    {loading ? (
                                        <ActivityIndicator size="small" color={isDarkMode ? "#FFF" : "#000"} />
                                    ) : (
                                        <TouchableOpacity onPress={isEditMode ? onSetCharacterAbility : () => setIsEditMode(!isEditMode)} style={{ paddingHorizontal: 10, borderRadius: 10 }}>
                                            <IconComponent name={isEditMode ? "Save" : "Pencil"} size={18} color={isDarkMode ? "#FFF" : "#000"} />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                            <View style={styles.characterContainer}>
                                <View style={[styles.characterItem, { backgroundColor: isDarkMode ? "#1A1A1D" : "#FFF" }]}>
                                    <Text style={styles.infoLabel}>Strength</Text>
                                    <Text style={[styles.infoValue, { color: isDarkMode ? "#FFF" : "#000" }]}>{character?.strength || 0}</Text>
                                    <View style={[styles.statsButtonContainer, { display: isEditMode ? "flex" : "none" }]}>
                                        <TouchableOpacity
                                            style={[styles.statButton, { opacity: character?.strength <= 0 ? 0.5 : 1 }]}
                                            onPress={() => {
                                                useProfileStore.setState
                                                    ({
                                                        character: {
                                                            ...character,
                                                            strength: (character.strength || 0) - 1,
                                                            points: character.points + 1
                                                        }
                                                    });
                                                setStrengthIncrease(strengthIncrease - 1);
                                            }}
                                            disabled={character?.strength <= 0}
                                        >
                                            <Text style={styles.buttonText}>-</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.statButton, { opacity: character?.points <= 0 ? 0.5 : 1 }]}
                                            onPress={() => {
                                                if (character?.points > 0) {
                                                    useProfileStore.setState
                                                        ({
                                                            character: {
                                                                ...character,
                                                                strength: (character.strength || 0) + 1,
                                                                points: character.points - 1
                                                            }
                                                        });
                                                    setStrengthIncrease(strengthIncrease + 1);
                                                }
                                            }}
                                            disabled={character?.points <= 0}
                                        >
                                            <Text style={styles.buttonText}>+</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View style={[styles.characterItem, { backgroundColor: isDarkMode ? "#1A1A1D" : "#FFF" }]}>
                                    <Text style={styles.infoLabel}>Agility</Text>
                                    <Text style={[styles.infoValue, { color: isDarkMode ? "#FFF" : "#000" }]}>{character?.agility || 0}</Text>
                                    <View style={[styles.statsButtonContainer, { display: isEditMode ? "flex" : "none" }]}>
                                        <TouchableOpacity
                                            style={[styles.statButton, { opacity: character?.agility <= 0 ? 0.5 : 1 }]}
                                            onPress={() => {
                                                useProfileStore.setState
                                                    ({
                                                        character: {
                                                            ...character,
                                                            agility: (character.agility || 0) - 1,
                                                            points: character.points + 1
                                                        }
                                                    });
                                                setAgilityIncrease(agilityIncrease - 1);
                                            }}
                                            disabled={character?.agility <= 0}
                                        >
                                            <Text style={styles.buttonText}>-</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.statButton, { opacity: character?.points <= 0 ? 0.5 : 1 }]}
                                            onPress={() => {
                                                if (character?.points > 0) {
                                                    useProfileStore.setState
                                                        ({
                                                            character: {
                                                                ...character,
                                                                agility: (character.agility || 0) + 1,
                                                                points: character.points - 1
                                                            }
                                                        });
                                                    setAgilityIncrease(agilityIncrease + 1);
                                                }
                                            }}
                                            disabled={character?.points <= 0}
                                        >
                                            <Text style={styles.buttonText}>+</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View style={[styles.characterItem, { backgroundColor: isDarkMode ? "#1A1A1D" : "#FFF" }]}>
                                    <Text style={styles.infoLabel}>Endurance</Text>
                                    <Text style={[styles.infoValue, { color: isDarkMode ? "#FFF" : "#000" }]}>{character?.endurance || 0}</Text>
                                    <View style={[styles.statsButtonContainer, { display: isEditMode ? "flex" : "none" }]}>
                                        <TouchableOpacity
                                            style={[styles.statButton, { opacity: character?.endurance <= 0 ? 0.5 : 1 }]}
                                            onPress={() => {
                                                useProfileStore.setState
                                                    ({
                                                        character: {
                                                            ...character,
                                                            endurance: (character.endurance || 0) - 1,
                                                            points: character.points + 1
                                                        }
                                                    });
                                                setEnduranceIncrease(enduranceIncrease - 1);
                                            }}
                                            disabled={character?.endurance <= 0}
                                        >
                                            <Text style={styles.buttonText}>-</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.statButton, { opacity: character?.points <= 0 ? 0.5 : 1 }]}
                                            onPress={() => {
                                                if (character?.points > 0) {
                                                    useProfileStore.setState
                                                        ({
                                                            character: {
                                                                ...character,
                                                                endurance: (character.endurance || 0) + 1,
                                                                points: character.points - 1
                                                            }
                                                        });
                                                    setEnduranceIncrease(enduranceIncrease + 1);
                                                }
                                            }}
                                            disabled={character?.points <= 0}
                                        >
                                            <Text style={styles.buttonText}>+</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </View>
                    )}

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
    },
    backButton: {
        width: 24
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#6075FF",
        overflow: "hidden"
    },
    profileContainer: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
        marginVertical: 20
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
    cardInfoIcon: {
        width: 42,
        height: 42,
        borderRadius: 10,
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
    },
    cardInfoTitle: {
        fontFamily: "PoppinsMedium",
        fontSize: 11,
        opacity: 0.5
    },
    cardInfoValue: {
        fontFamily: "PoppinsSemiBold",
        fontSize: 20
    },
    personalInfoSection: {
        width: "100%",
        marginTop: 15,
        padding: 20,
        borderRadius: 15,
    },
    sectionTitle: {
        fontFamily: "PoppinsSemiBold",
        fontSize: 18,
        marginBottom: 15,
    },
    infoContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        gap: 15,
    },
    infoItem: {
        width: "45%",
        padding: 12,
        borderRadius: 10,
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
    characterHeader: {
        width: "100%",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 15,
    },
    characterContainer: {
        width: "100%",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 15,
    },
    characterItem: {
        width: "30%",
        alignItems: "center",
        justifyContent: "center",
        padding: 10,
        borderRadius: 10,
    },
    statsButtonContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingBottom: 5
    },
    statButton: {
        backgroundColor: '#6075FF',
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'PoppinsSemiBold',
    },
    saveButton: {
        backgroundColor: '#6075FF',
        padding: 12,
        borderRadius: 10,
        marginTop: 20,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'PoppinsSemiBold',
    },
    skeletonText: {
        borderRadius: 4,
        opacity: 0.7
    },
});