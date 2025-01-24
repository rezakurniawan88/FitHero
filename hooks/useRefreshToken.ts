import * as SecureStore from "expo-secure-store";
import axiosInstance from "@/lib/axios";
import { useCallback } from "react";
import { router } from "expo-router";

const useRefreshToken = () => {
    const refreshToken = useCallback(async () => {
        try {
            const token = await SecureStore.getItemAsync("refreshToken");
            if(!token) router.push("/auth/login");

            const response = await axiosInstance.post("/auth/refresh-token", null, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            
            await SecureStore.setItemAsync("accessToken", response?.data?.data?.accessToken);
            return response?.data?.data?.accessToken;
        } catch (error) {
            console.log(error);
            return null;
        }
    }, []);

    return refreshToken;
};

export default useRefreshToken;
