import axiosInstance from "@/lib/axios";
import { useProfileStore } from "@/stores/store";
import { useCallback, useState } from "react";
import * as SecureStore from "expo-secure-store";

const useFetchPersonalInfo = () => {
    const { user, setPersonalInfo } = useProfileStore();
    const [loadingGetPersonalInfo, setLoadingGetPersonalInfo] = useState<boolean>(false);

    const fetchPersonalInfo = useCallback(async () => {
        setLoadingGetPersonalInfo(true);
        try {
            const token = await SecureStore.getItemAsync("accessToken");
            const response = await axiosInstance.get(`/personal-info/${user?.userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            setPersonalInfo(response?.data?.data);
            setLoadingGetPersonalInfo(false);
        } catch (error) {
            setLoadingGetPersonalInfo(false);
            console.log(error);
        }
    }, [user?.userId, setPersonalInfo]);

    return {fetchPersonalInfo, loadingGetPersonalInfo};
};

export default useFetchPersonalInfo;
