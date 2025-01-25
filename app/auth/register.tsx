import { useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from "react-native";
import { View } from "react-native";
import IconComponent from "@/components/icons/icons";
import { Link, router } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import axiosInstance from "@/lib/axios";
import { Image } from "expo-image";
import { useThemeStore } from "@/stores/store";

export default function RegisterScreen() {
    const [username, setUsername] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [imageAsset, setImageAsset] = useState<any>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const { isDarkMode } = useThemeStore((state) => state);

    const pickImage = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            type: "image/*",
        });
        if (!result.assets) return;
        setImageAsset(result.assets);
        setImagePreview(result.assets[0].uri);
    }

    const onRegister = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            const file = imageAsset[0];

            formData.append("username", username);
            formData.append("email", email);
            formData.append("password", password);
            formData.append("profile_picture", {
                uri: file.uri,
                name: file.name,
                type: file.mimeType,
                size: file.size
            } as any);

            const response = await axiosInstance.post("/auth/register", formData,
                {
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "multipart/form-data",
                    }
                }
            );
            setLoading(false);
            alert(response?.data?.message);
            router.push("/auth/login");
        } catch (error: any) {
            setLoading(false);
            alert(error?.response?.data?.message);
            console.log(error?.response?.data?.message);
        }
    }

    return (
        <View style={[styles.container, { backgroundColor: isDarkMode ? "#181C14" : "#FFF" }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    <View style={{ marginBottom: 50 }}>
                        <Text style={[styles.title, { color: isDarkMode ? "#FFF" : "#000" }]}>Create an account</Text>
                        <Text style={[styles.description, { color: isDarkMode ? "#FFF" : "#000" }]}>Create your account, enter your required information.</Text>
                    </View>
                    <View>
                        <View style={styles.inputContainer}>
                            <IconComponent name="User" size={18} color="#666" style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { paddingLeft: 45, backgroundColor: isDarkMode ? "#181C14" : "#FFF", borderColor: isDarkMode ? "#373737" : "#DDD", color: isDarkMode ? "#FFF" : "#000" }]}
                                placeholder="Username"
                                placeholderTextColor={isDarkMode ? "#757575" : "#666"}
                                value={username}
                                onChangeText={setUsername}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <IconComponent name="Mail" size={18} color="#666" style={styles.inputIcon} />
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
                            <IconComponent name="Lock" size={18} color="#666" style={styles.inputIcon} />
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
                                <IconComponent name={showPassword ? "Eye" : "EyeOff"} size={18} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.imageUploadContainer}>
                            {imagePreview ? (
                                <View style={styles.previewContainer}>
                                    <Image
                                        source={{ uri: imagePreview }}
                                        style={styles.imagePreview}
                                        contentFit="cover"
                                    />
                                    <TouchableOpacity
                                        onPress={() => {
                                            setImagePreview(null);
                                            setImageAsset(null);
                                        }}
                                        style={styles.removeButton}
                                    >
                                        <IconComponent name="X" size={16} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <TouchableOpacity
                                    onPress={pickImage}
                                    activeOpacity={0.7}
                                    style={[styles.uploadButton, { backgroundColor: isDarkMode ? "#181C14" : "#F5F5F5", borderColor: isDarkMode ? "#373737" : "#DDD" }]}
                                >
                                    <IconComponent name="Image" size={24} color="#666" />
                                    <Text style={styles.uploadText}>Upload Profile Picture</Text>
                                </TouchableOpacity>
                            )}
                        </View>


                        <TouchableOpacity onPress={() => onRegister()} style={styles.loginButton} activeOpacity={0.6}>
                            {loading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.loginButtonText}>Sign up</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                    <View style={{ width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "center", marginVertical: 40, gap: 4 }}>
                        <Text style={{ fontFamily: "PoppinsRegular", textAlign: "center", color: isDarkMode ? "#FFF" : "#000" }}>Already have an account?
                        </Text>
                        <Link href="/auth/login" asChild>
                            <Text style={{ fontFamily: "PoppinsBold", textDecorationLine: "underline", color: isDarkMode ? "#FFF" : "#000" }}> Login</Text>
                        </Link>
                    </View>
                </View>
            </ScrollView>
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
        marginTop: "20%",
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
        backgroundColor: "#000",
        padding: 15,
        borderRadius: 30,
        marginTop: 15,
    },
    loginButtonText: {
        fontFamily: "PoppinsSemiBold",
        color: "#fff",
        textAlign: "center",
        fontSize: 16,
    },
    imageUploadContainer: {
        marginBottom: 20,
    },
    uploadButton: {
        borderRadius: 10,
        borderWidth: 2,
        borderStyle: "dashed",
        padding: 20,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 10,
    },
    uploadText: {
        fontFamily: "PoppinsRegular",
        color: "#666",
        fontSize: 14,
    },
    previewContainer: {
        position: "relative",
        alignItems: "center",
        justifyContent: "center",
    },
    imagePreview: {
        width: "100%",
        height: 200,
        borderRadius: 10,
    },
    removeButton: {
        position: "absolute",
        top: 10,
        right: 10,
        backgroundColor: "rgba(0,0,0,0.5)",
        borderRadius: 15,
        padding: 5,
    },
})