import { useTrainingStore } from "@/stores/store";
import { useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";

export const useCheckCompletion = () => {
    const [isCompleteToday, setIsCompleteToday] = useState(false);
    const { setAllComplete } = useTrainingStore((state) => state);
    
    useEffect(() => {
        const checkCompleted = async () => {
            const lastCompletedDate = await SecureStore.getItemAsync("lastCompletedDate");
            const today = new Date().toDateString();

            if (lastCompletedDate === today) {
                setIsCompleteToday(true);
                setAllComplete();
            } else {
                setIsCompleteToday(false);
            }
        };

        checkCompleted();
    }, []);

    return { isCompleteToday };
}