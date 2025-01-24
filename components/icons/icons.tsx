import { icons } from 'lucide-react-native';

export default function IconComponent({ name, color, size, style }: { name: keyof typeof icons; color: string; size: number; style?: object }) {
    const LucideIcon = icons[name];

    return <LucideIcon color={color} size={size} style={style} />;
};