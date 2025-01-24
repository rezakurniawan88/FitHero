import { useThemeStore } from "@/stores/store";
import { ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ResetModal({ showModalReset, setShowModalReset, onReset, loadingReset }: { showModalReset: boolean, setShowModalReset: React.Dispatch<React.SetStateAction<boolean>>, onReset: () => void, loadingReset: boolean }) {
    const { isDarkMode } = useThemeStore((state) => state);

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={showModalReset}
            onRequestClose={() => setShowModalReset(false)}
        >
            <View style={styles.modalContainer}>
                <View style={[styles.modalContent, { backgroundColor: isDarkMode ? "#1E1E1E" : "#FFF" }]}>
                    <View style={{ flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 10, marginVertical: 10 }}>
                        <Text style={[styles.modalTitle, { color: isDarkMode ? "#FFF" : "#000" }]}>Reset</Text>
                        <Text style={[styles.modalDescription, { color: isDarkMode ? "#FFF" : "#000" }]}>Are you sure you want to reset?</Text>
                    </View>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: isDarkMode ? "#757575" : "#F5F5F5" }]}
                            onPress={() => setShowModalReset(false)}
                        >
                            <Text style={[styles.buttonText, { color: isDarkMode ? "#FFF" : "#000", opacity: 0.5 }]}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: isDarkMode ? "#E53935" : "#FF4444" }]}
                            onPress={onReset}
                        >
                            {loadingReset ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={[styles.buttonText, styles.resetText]}>Reset</Text>
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
        backgroundColor: "rgba(0,0,0,0.5)"
    },
    modalContent: {
        backgroundColor: "#fff",
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
        fontFamily: "PoppinsSemiBold",
    },
    resetText: {
        color: "white",
    }
});
