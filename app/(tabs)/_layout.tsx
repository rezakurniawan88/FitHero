import { Tabs } from 'expo-router';
import IconComponent from '@/components/icons/icons';
import { TouchableOpacity } from 'react-native';
import { useConnectionStore, useThemeStore } from '@/stores/store';

export default function TabLayout() {
    const { isDarkMode } = useThemeStore((state) => state);
    const { isConnected } = useConnectionStore((state) => state);

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: isDarkMode ? "#FFF" : "#000",
                headerShown: false,
                tabBarButton: (props: any) => <TouchableOpacity {...props} activeOpacity={1} />,
                tabBarStyle: {
                    display: isConnected ? "flex" : "none",
                    backgroundColor: isDarkMode ? "#181C14" : "#fff",
                    height: 70,
                    paddingTop: 8,
                    borderColor: isDarkMode ? "#373737" : "#EBEBEB",
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarLabelStyle: {
                        fontFamily: "PoppinsMedium",
                        fontSize: 10,
                    },
                    tabBarIcon: ({ color }) => (
                        <IconComponent name="House" size={20} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="train"
                options={{
                    title: 'Train',
                    tabBarLabelStyle: {
                        fontFamily: "PoppinsMedium",
                        fontSize: 10,
                    },
                    tabBarIcon: ({ color }) => (
                        <IconComponent name="Dumbbell" size={20} color={color} style={{ transform: [{ rotate: '135deg' }] }} />
                    ),
                }}
            />
            <Tabs.Screen
                name="activity"
                options={{
                    title: 'Activity',
                    tabBarLabelStyle: {
                        fontFamily: "PoppinsMedium",
                        fontSize: 10,
                    },
                    tabBarIcon: ({ color }) => (
                        <IconComponent name="ChartLine" size={20} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    tabBarLabelStyle: {
                        fontFamily: "PoppinsMedium",
                        fontSize: 10,
                    },
                    tabBarIcon: ({ color }) => (
                        <IconComponent name="Settings" size={20} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
