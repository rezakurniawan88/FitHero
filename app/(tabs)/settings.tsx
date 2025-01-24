import IconComponent from '@/components/icons/icons';
import LogoutModal from '@/components/modal/logout-modal';
import OfflinePage from '@/components/offline-page';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useProfileStore, useThemeStore } from '@/stores/store';
import { Image } from 'expo-image';
import { Link, useNavigation } from 'expo-router';
import { useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, TouchableHighlight, Switch } from 'react-native';

export default function SettingsScreen() {
    const navigation = useNavigation();
    const [showModalLogout, setShowModalLogout] = useState<boolean>(false);
    const { user, character } = useProfileStore((state) => state);
    const { isDarkMode, toggleTheme } = useThemeStore((state) => state);
    const { isConnected } = useNetworkStatus();

    if (!isConnected) {
        return (
            <OfflinePage />
        )
    }

    return (
        <View style={isDarkMode ? styles.containerDark : styles.container}>
            <Text style={[styles.title, { color: isDarkMode ? "#FFF" : "#000" }]}>Settings</Text>
            <TouchableHighlight
                style={styles.profileContainer}
                underlayColor={isDarkMode ? "#1E1E1E" : "#FAFAFA"}
                onPress={() => navigation.navigate("profile/profile" as never)}>
                <View style={styles.profile}>
                    <View style={styles.profileCard}>
                        <View style={styles.avatar}>
                            {user?.profile_picture_url ? (
                                <Image source={user?.profile_picture_url} contentFit="cover" style={{ width: "100%", height: "100%" }} />
                            ) : null
                            }
                        </View>
                        <View>
                            <Text style={[styles.profileTextUser, { color: isDarkMode ? "#FFF" : "#000" }]}>{user?.username || "Guest"}</Text>
                            <Text style={styles.profileTextLevel}>Level {character?.level || 0}</Text>
                        </View>
                    </View>
                    <IconComponent name="ChevronRight" size={24} color={isDarkMode ? "#FFF" : "#000"} />
                </View>
            </TouchableHighlight>
            <View style={styles.settingsContainer}>
                <View>
                    <Text style={[styles.title, { color: "#909090" }]}>Others</Text>
                    <View style={styles.settingsContent}>

                        <Link href="/profile/personal-info" asChild>
                            <TouchableOpacity style={styles.settingsButton}>
                                <View style={styles.settingsButtonContent}>
                                    <IconComponent name="UserRound" size={20} color={isDarkMode ? "#FFF" : "#000"} />
                                    <Text style={[styles.settingsButtonText, { color: isDarkMode ? "#FFF" : "#000" }]}>Personal Info</Text>
                                </View>
                                <IconComponent name="ChevronRight" size={24} color={isDarkMode ? "#FFF" : "#000"} />
                            </TouchableOpacity>
                        </Link>

                        <Link href="/profile/goals" asChild>
                            <TouchableOpacity style={styles.settingsButton}>
                                <View style={styles.settingsButtonContent}>
                                    <IconComponent name="Goal" size={20} color={isDarkMode ? "#FFF" : "#000"} />
                                    <Text style={[styles.settingsButtonText, { color: isDarkMode ? "#FFF" : "#000" }]}>Goals</Text>
                                </View>
                                <IconComponent name="ChevronRight" size={24} color={isDarkMode ? "#FFF" : "#000"} />
                            </TouchableOpacity>
                        </Link>

                        <TouchableOpacity activeOpacity={1} style={styles.settingsButton}>
                            <View style={styles.settingsButtonContent}>
                                <IconComponent name="Moon" size={20} color={isDarkMode ? "#FFF" : "#000"} />
                                <Text style={[styles.settingsButtonText, { color: isDarkMode ? "#FFF" : "#000" }]}>Dark Mode</Text>
                            </View>
                            <Switch value={isDarkMode} onValueChange={toggleTheme} />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setShowModalLogout(true)} style={styles.settingsButton}>
                            <View style={styles.settingsButtonContent}>
                                <IconComponent name="LogOut" size={20} color="red" />
                                <Text style={[styles.settingsButtonText, { color: "red" }]}>Logout</Text>
                            </View>
                        </TouchableOpacity>
                        <LogoutModal showModalLogout={showModalLogout} setShowModalLogout={setShowModalLogout} />
                    </View>
                </View>
                <Text style={[styles.appVerText, { color: isDarkMode ? "#FFF" : "#000" }]}>App ver 1.0</Text>
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
    title: {
        fontFamily: "PoppinsSemiBold",
        fontSize: 24,
    },
    profileContainer: {
        marginVertical: 30,
        paddingVertical: 10,
        borderRadius: 10
    },
    profile: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    profileCard: {
        flexDirection: "row",
        alignItems: "center",
        gap: 30
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "#6075FF",
        overflow: "hidden"
    },
    profileTextUser: {
        fontFamily: "PoppinsSemiBold",
        fontSize: 20
    },
    profileTextLevel: {
        fontFamily: "PoppinsSemiBold",
        fontSize: 16,
        color: "#BABABA"
    },
    settingsContainer: {
        height: "70%",
        justifyContent: "space-between",
        alignItems: "center"
    },
    settingsContent: {
        gap: 5,
        marginTop: 10
    },
    settingsButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 20,
        paddingVertical: 10,
        opacity: 0.6,
        width: "100%",
    },
    settingsButtonContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: 20
    },
    settingsButtonText: {
        fontFamily: "PoppinsSemiBold",
        fontSize: 16
    },
    appVerText: {
        fontFamily: "PoppinsMedium",
        fontSize: 12,
        textAlign: "center",
        opacity: 0.6
    }
});
