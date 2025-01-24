import { PropsWithChildren, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import IconComponent from './icons/icons';
import { useThemeStore } from '@/stores/store';

export function Accordion({ children, title }: PropsWithChildren & { title: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const { isDarkMode } = useThemeStore((state) => state);

    return (
        <View style={[styles.container, { backgroundColor: isDarkMode ? "#1E1E1E" : "#F8F8F8" }]}>
            <TouchableOpacity style={styles.heading} onPress={() => setIsOpen((value) => !value)} activeOpacity={0.8}>
                <Text style={{ fontSize: 14, fontFamily: "PoppinsSemiBold", color: isDarkMode ? "#FFF" : "#000", opacity: 0.6 }}>{title}</Text>
                <IconComponent name="ChevronRight" color={isDarkMode ? "#FFF" : "#000"} size={18} style={{ transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }} />
            </TouchableOpacity>
            {isOpen && <View style={styles.content}>{children}</View>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 12,
        borderRadius: 8,
    },
    heading: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 8,
    },
    content: {
        marginLeft: 12,
    },
});
