import axiosInstance from "@/lib/axios";
import { TDataTraining, useProfileStore, useTrainingStore } from "@/stores/store";
import { useCallback, useState } from "react";
import * as SecureStore from "expo-secure-store";

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const useFetchWorkouts = () => {
    const { user } = useProfileStore();
    const { setDatasTraining } = useTrainingStore();
    const [loadingGetWorkouts, setLoadingGetWorkouts] = useState<boolean>(false);

    const fetchWorkouts = useCallback(async () => {
        setLoadingGetWorkouts(true);
        try {
            const token = await SecureStore.getItemAsync("accessToken");
            const response = await axiosInstance.get(`/workouts/${user?.userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            const sortedData = response?.data?.data.sort((a: TDataTraining, b: TDataTraining) => {
                return DAYS_OF_WEEK.indexOf(a.date) - DAYS_OF_WEEK.indexOf(b.date);
            });
            setDatasTraining(sortedData);
            setLoadingGetWorkouts(false);
        } catch (error) {
            console.log(error);
            setLoadingGetWorkouts(false);
        }
    }, [user?.userId, setDatasTraining]);

    return {fetchWorkouts, loadingGetWorkouts};
};

export default useFetchWorkouts;
