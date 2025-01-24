import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useConnectionStore } from '@/stores/store';

export const useNetworkStatus = () => {
  const { isConnected, setConnected } = useConnectionStore((state) => state);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setConnected(state?.isConnected);
    });

    return () => unsubscribe();
  }, []);

  return { isConnected };
};
