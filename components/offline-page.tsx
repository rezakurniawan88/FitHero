import { useThemeStore } from "@/stores/store";
import { StyleSheet, Text, View } from "react-native";

export default function OfflinePage() {
    const { isDarkMode } = useThemeStore((state) => state);

    return (
        <View style={isDarkMode ? styles.containerDark : styles.container}>
            <View style={styles.offlineContainer}>
                <Text style={[styles.title, { color: isDarkMode ? "#FFF" : "#000", textAlign: 'center' }]}>
                    No Internet Connection
                </Text>
                <Text style={[styles.subtitle, { color: "#A8A8A8", textAlign: 'center' }]}>
                    Please check your connection and try again
                </Text>
            </View>
        </View>
    )
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
        fontSize: 24,
        fontFamily: "PoppinsSemiBold",
    },
    offlineContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    subtitle: {
        fontSize: 16,
        fontFamily: "PoppinsRegular",
        marginTop: 10,
    },
})