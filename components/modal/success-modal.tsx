import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import IconComponent from "../icons/icons";
import { router } from "expo-router";
import { useThemeStore } from "@/stores/store";
import Animated, {
    useAnimatedStyle,
    withSpring,
    withSequence,
    withTiming,
    useSharedValue,
    runOnJS,
    FadeIn,
    ZoomIn,
} from 'react-native-reanimated';
import { useEffect } from "react";

export default function SuccessModal({ showModalSuccess, setShowModalSuccess, expGain, pointGain }: { showModalSuccess: boolean, setShowModalSuccess: React.Dispatch<React.SetStateAction<boolean>>, expGain: number, pointGain: number }) {
    const { isDarkMode } = useThemeStore((state) => state);
    const scale = useSharedValue(0);
    const checkmarkScale = useSharedValue(0);

    useEffect(() => {
        if (showModalSuccess) {
            scale.value = withSpring(1, { damping: 12 });
            checkmarkScale.value = withSequence(
                withTiming(1.2, { duration: 200 }),
                withSpring(1, { damping: 12 })
            );
        } else {
            scale.value = withTiming(0);
            checkmarkScale.value = withTiming(0);
        }
    }, [showModalSuccess]);

    const containerStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }]
    }));

    const checkmarkStyle = useAnimatedStyle(() => ({
        transform: [{ scale: checkmarkScale.value }]
    }));

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={showModalSuccess}
            onRequestClose={() => setShowModalSuccess(false)}
        >
            <View style={styles.modal}>
                <Animated.View style={[styles.modalContainer, containerStyle, { backgroundColor: isDarkMode ? "#1E1E1E" : "#FFF" }]}>
                    <View style={styles.modalContent}>
                        <Animated.View style={[styles.checkOutside, checkmarkStyle]}>
                            <View style={styles.checkInside}>
                                <IconComponent name="Check" size={40} color="#fff" />
                            </View>
                        </Animated.View>

                        <Animated.Text
                            entering={FadeIn.delay(400)}
                            style={[styles.modalTitle, { color: isDarkMode ? "#FFF" : "#000" }]}
                        >
                            Congratulations!
                        </Animated.Text>

                        <Animated.View
                            entering={FadeIn.delay(600)}
                            style={{ marginTop: 20, gap: 5 }}
                        >
                            <Text style={[styles.modalDescription, { color: isDarkMode ? "#FFF" : "#000" }]}>
                                You have completed the training
                            </Text>
                            <Text style={[styles.modalDescription, { color: isDarkMode ? "#FFF" : "#000" }]}>
                                And you get {expGain || 0} EXP & {pointGain || 0} Point
                            </Text>
                        </Animated.View>

                        <Animated.View
                            entering={ZoomIn.delay(800)}
                        >
                            <TouchableOpacity
                                style={styles.modalButton}
                                onPress={() => {
                                    scale.value = withTiming(0, {}, () => {
                                        runOnJS(setShowModalSuccess)(false);
                                        runOnJS(router.navigate)("/(tabs)/train" as never);
                                    });
                                }}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.modalButtonText}>Got it</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modal: {
        flex: 1,
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContainer: {
        backgroundColor: "#fff",
        margin: 25,
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 30,
        borderRadius: 10,
        elevation: 5,
    },
    modalContent: {
        alignItems: "center",
        justifyContent: "center",
        marginTop: 20
    },
    modalTitle: {
        fontFamily: "PoppinsSemiBold",
        fontSize: 20,
        textAlign: "center",
        marginTop: 20,
    },
    modalDescription: {
        fontFamily: "PoppinsRegular",
        fontSize: 14,
        textAlign: "center",
        opacity: 0.6
    },
    checkOutside: {
        width: 100,
        height: 100,
        backgroundColor: "#dcfce7",
        borderRadius: 50,
        alignItems: "center",
        justifyContent: "center",
    },
    checkInside: {
        width: 75,
        height: 75,
        backgroundColor: "#4ade80",
        borderRadius: 50,
        alignItems: "center",
        justifyContent: "center"
    },
    modalButton: {
        width: "90%",
        marginTop: 40,
        backgroundColor: "#22c55e",
        paddingVertical: 10,
        borderRadius: 5,
    },
    modalButtonText: {
        color: "#fff",
        fontFamily: "PoppinsSemiBold",
        fontSize: 16,
        textAlign: "center"
    }
})