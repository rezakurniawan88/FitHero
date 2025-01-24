import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

export default function CircleProgressBar({ progress, size, strokeWidth }: { progress: number, size: number, strokeWidth: number }) {
    const circumference = 2 * Math.PI * (size / 2 - strokeWidth / 2);
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <View>
            <Svg width={size} height={size}>
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={size / 2 - strokeWidth / 2}
                    stroke="#DCFCE7"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                />
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={size / 2 - strokeWidth / 2}
                    stroke="#34D399"
                    strokeWidth={strokeWidth}
                    strokeDashoffset={strokeDashoffset}
                    strokeDasharray={circumference}
                    strokeLinecap="round"
                    fill="transparent"
                />
            </Svg>
            <View style={{ position: 'absolute', top: 0, left: 0, width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: "#fff" }}>{progress}%</Text>
            </View>
        </View>
    );
};