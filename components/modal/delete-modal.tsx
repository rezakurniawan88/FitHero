import { ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import IconComponent from "../icons/icons";
import { useState } from "react";
import axiosInstance from "@/lib/axios";
import useFetchWorkouts from "@/hooks/useFetchWorkouts";
import { useThemeStore } from "@/stores/store";
import * as SecureStore from "expo-secure-store";

export default function DeleteModal({ showModalDelete, setShowModalDelete, workoutId }: { showModalDelete: boolean, setShowModalDelete: React.Dispatch<React.SetStateAction<boolean>>, workoutId: string | undefined }) {
    const [loadingDelete, setLoadingDelete] = useState<boolean>(false);
    const { fetchWorkouts } = useFetchWorkouts();
    const { isDarkMode } = useThemeStore((state) => state);

    const onDeleteWorkout = async (workoutId: string | undefined) => {
        setLoadingDelete(true);
        try {
            if (!workoutId) {
                alert("Login First");
            }
            const token = await SecureStore.getItemAsync("accessToken");
            await axiosInstance.delete(`/workout/${workoutId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            alert("Workout deleted successfully!");
            setShowModalDelete(false);
            setLoadingDelete(false);
            fetchWorkouts();
        } catch (error) {
            console.log(error);
            setLoadingDelete(false);
        }
    }

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={showModalDelete}
            onRequestClose={() => setShowModalDelete(false)}
        >
            <View style={styles.modalContainer}>
                <View style={[styles.modalContent, { backgroundColor: isDarkMode ? "#1E1E1E" : "#FFF" }]}>
                    <View style={{ flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 10, marginVertical: 10 }}>
                        <IconComponent name="Trash" size={80} color="red" style={{ opacity: 0.9 }} />
                        <Text style={[styles.modalTitle, { color: isDarkMode ? "#FFF" : "#000" }]}>Delete</Text>
                        <Text style={[styles.modalDescription, { color: isDarkMode ? "#FFF" : "#000" }]}>Are you sure you want to delete?</Text>
                    </View>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: isDarkMode ? "#757575" : "#F5F5F5" }]}
                            onPress={() => setShowModalDelete(false)}
                        >
                            <Text style={[styles.buttonText, { color: isDarkMode ? "#FFF" : "#000", opacity: 0.5 }]}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: isDarkMode ? "#E53935" : "#FF4444" }]}
                            onPress={() => onDeleteWorkout(workoutId)}
                        >
                            {loadingDelete ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={[styles.buttonText, styles.deleteText]}>Delete</Text>
                            )
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
    deleteText: {
        color: "white",
    }
});
