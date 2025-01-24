import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity } from "react-native";
import { View } from "react-native";
import IconComponent from "@/components/icons/icons";
import { Link, router } from "expo-router";
import { useProfileStore, useThemeStore } from "@/stores/store";
import axiosInstance from "@/lib/axios";
import { jwtDecode } from "jwt-decode"
import * as SecureStore from "expo-secure-store";

export default function LoginScreen() {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const { setUser, setCharacter } = useProfileStore((state) => state);
    const { isDarkMode } = useThemeStore((state) => state);

    const getCharacterData = async (userId: string) => {
        try {
            const token = await SecureStore.getItemAsync("accessToken");
            const response = await axiosInstance.get(`/auth/character/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            setCharacter(response?.data?.data);
        } catch (error) {
            console.log(error);
        }
    }

    const onLogin = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.post("/auth/login", {
                email,
                password
            }, {
                headers: {
                    "Content-Type": "application/json",
                }
            });

            await SecureStore.setItemAsync("accessToken", response?.data?.data?.accessToken);
            await SecureStore.setItemAsync("refreshToken", response?.data?.data?.refreshToken);
            const dataUser = jwtDecode(response?.data?.data?.accessToken) as any;
            setUser(dataUser);
            getCharacterData(dataUser?.userId);
            setLoading(false);
            router.push("/");
        } catch (error: any) {
            setLoading(false);
            alert(error?.response?.data?.message);
            console.log(error);
        }
    }
    return (
        <View style={[styles.container, { backgroundColor: isDarkMode ? "#181C14" : "#FFF" }]}>
            <View style={styles.content}>
                <View style={{ marginBottom: 50 }}>
                    <Text style={[styles.title, { color: isDarkMode ? "#FFF" : "#000" }]}>Welcome 👋</Text>
                    <Text style={[styles.description, { color: isDarkMode ? "#FFF" : "#000" }]}>We happy to see you, enter your email and password to login.</Text>
                </View>
                <View>
                    <View style={styles.inputContainer}>
                        <IconComponent name="Mail" size={18} color={isDarkMode ? "#FFF" : "#666"} style={styles.inputIcon} />
                        <TextInput
                            style={[styles.input, { paddingLeft: 45, backgroundColor: isDarkMode ? "#181C14" : "#FFF", borderColor: isDarkMode ? "#373737" : "#DDD", color: isDarkMode ? "#FFF" : "#000" }]}
                            keyboardType="email-address"
                            placeholder="Email"
                            placeholderTextColor={isDarkMode ? "#757575" : "#666"}
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <IconComponent name="Lock" size={18} color={isDarkMode ? "#FFF" : "#666"} style={styles.inputIcon} />
                        <TextInput
                            style={[styles.input, { paddingLeft: 45, paddingRight: 45, backgroundColor: isDarkMode ? "#181C14" : "#FFF", borderColor: isDarkMode ? "#373737" : "#DDD", color: isDarkMode ? "#FFF" : "#000" }]}
                            secureTextEntry={!showPassword}
                            placeholder="Password"
                            placeholderTextColor={isDarkMode ? "#757575" : "#666"}
                            value={password}
                            onChangeText={setPassword}
                        />
                        <TouchableOpacity
                            style={styles.passwordIcon}
                            onPress={() => setShowPassword(!showPassword)}
                        >
                            <IconComponent name={showPassword ? "Eye" : "EyeOff"} size={18} color={isDarkMode ? "#FFF" : "#666"} />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity onPress={() => onLogin()} style={styles.loginButton} activeOpacity={0.6}>
                        {loading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.loginButtonText}>Login</Text>
                        )}
                    </TouchableOpacity>
                </View>
                <View style={{ width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 40, gap: 4 }}>
                    <Text style={{ fontFamily: "PoppinsRegular", textAlign: "center", color: isDarkMode ? "#FFF" : "#000" }}>Don't have an account?
                    </Text>
                    <Link href="/auth/register" asChild>
                        <Text style={{ fontFamily: "PoppinsBold", textDecorationLine: "underline", color: isDarkMode ? "#FFF" : "#000" }}> Register</Text>
                    </Link>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
        paddingTop: 50,
        paddingHorizontal: 30,
    },
    content: {
        marginTop: "40%",
        height: "100%",
    },
    title: {
        fontSize: 30,
        fontFamily: "PoppinsBold",
    },
    description: {
        fontFamily: "PoppinsRegular",
        fontSize: 14,
        opacity: 0.5
    },
    inputContainer: {
        position: 'relative',
        marginBottom: 15,
    },
    inputIcon: {
        position: 'absolute',
        left: 15,
        top: 15,
        zIndex: 1,
    },
    passwordIcon: {
        position: 'absolute',
        right: 15,
        top: 15,
        zIndex: 1,
    },
    input: {
        fontFamily: "PoppinsRegular",
        padding: 15,
        borderRadius: 5,
        borderWidth: 1,
    },
    loginButton: {
        width: "100%",
        padding: 15,
        borderRadius: 30,
        marginTop: 15,
        backgroundColor: "#000"
    },
    loginButtonText: {
        fontFamily: "PoppinsSemiBold",
        color: "#fff",
        textAlign: "center",
        fontSize: 16,
    }
})