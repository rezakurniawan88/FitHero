import { useThemeStore } from "@/stores/store";
import { useEffect } from "react";
import { View } from "react-native";
import * as SecureStore from "expo-secure-store";

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const { isDarkMode, setTheme } = useThemeStore((state) => state);

    useEffect(() => {
        const loadTheme = async () => {
            const theme = await SecureStore.getItemAsync("isDarkMode");
            setTheme(theme === "true" ? true : false);
        };

        loadTheme();
    }, []);

    useEffect(() => {
        const saveTheme = async () => {
            await SecureStore.setItemAsync("isDarkMode", isDarkMode.toString());
        };

        saveTheme();
    }, [isDarkMode]);

    return (
        <View style={{ flex: 1, backgroundColor: isDarkMode ? "#000" : "#F5F5F5" }}>
            {children}
        </View>
    )
}

export default ThemeProvider;