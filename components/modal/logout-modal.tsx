import { ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import IconComponent from "../icons/icons";
import axiosInstance from "@/lib/axios";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import { useState } from "react";
import { useProfileStore, useThemeStore } from "@/stores/store";

export default function LogoutModal({ showModalLogout, setShowModalLogout }: { showModalLogout: boolean, setShowModalLogout: React.Dispatch<React.SetStateAction<boolean>> }) {
    const [loading, setLoading] = useState<boolean>(false);
    const { resetUser, resetCharacter } = useProfileStore((state) => state);
    const { isDarkMode } = useThemeStore((state) => state);

    const onLogout = async () => {
        setLoading(true);
        try {
            const token = await SecureStore.getItemAsync("refreshToken");
            const response = await axiosInstance.delete("/auth/logout", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.status === 200) {
                await SecureStore.deleteItemAsync("accessToken");
                await SecureStore.deleteItemAsync("refreshToken");
                resetUser();
                resetCharacter();
                alert("Logout Successfully");
                router.push("/auth/login");
                setShowModalLogout(false);
                setLoading(false);
            }
        } catch (error) {
            console.log(error);
            setLoading(false);
        }
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={showModalLogout}
            onRequestClose={() => setShowModalLogout(false)}
        >
            <View style={styles.modalContainer}>
                <View style={[styles.modalContent, { backgroundColor: isDarkMode ? "#1E1E1E" : "#FFF" }]}>
                    <View style={{ flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 10, marginVertical: 10 }}>
                        <IconComponent name="CircleAlert" size={80} color="red" style={{ opacity: 0.9 }} />
                        <Text style={[styles.modalTitle, { color: isDarkMode ? "#FFF" : "#000" }]}>Logout</Text>
                        <Text style={[styles.modalDescription, { color: isDarkMode ? "#FFF" : "#000" }]}>Are you sure you want to logout?</Text>
                    </View>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: isDarkMode ? "#757575" : "#F5F5F5" }]}
                            onPress={() => setShowModalLogout(false)}
                        >
                            <Text style={[styles.buttonText, { color: isDarkMode ? "#FFF" : "#000", opacity: 0.5 }]}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: isDarkMode ? "#E53935" : "#FF4444" }]}
                            onPress={onLogout}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) :
                                <Text style={[styles.buttonText, styles.logoutText]}>Logout</Text>
                            }
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContent: {
        margin: 25,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 30,
        borderRadius: 10,
        elevation: 5,
    },
    modalTitle: {
        fontFamily: "PoppinsSemiBold",
        fontSize: 22,
        textAlign: "center",
    },
    modalDescription: {
        fontFamily: "PoppinsRegular",
        fontSize: 16,
        textAlign: "center",
        opacity: 0.5,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        marginHorizontal: 8,
    },
    buttonText: {
        textAlign: "center",
        fontSize: 16,
        fontFamily: "PoppinsRegular",
    },
    logoutText: {
        color: "white",
    }
});
