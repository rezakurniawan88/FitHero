import { create } from 'zustand';
import { JwtPayload } from 'jwt-decode';

export type TDataTraining = {
    id?: string;
    userId?: string;
    date: string;
    isRestDay: boolean;
    calorieBurn: number;
    duration: number;
    createdAt?: string;
    updatedAt?: string;
    exercises: TExercise[];
    day?: string;
    index?: number | undefined;
}

type TExercise = {
    id: string;
    workoutId: string;
    name: string;
    repetitions: number;
    sets: number;
    weight: number;
    createdAt: string;
    updatedAt: string;
}

export type TDataPersonalInfo = {
    height: string;
    weight: string
    age: string;
    gender: string;
}

type TUser = {
    exp: number;
    iat: number;
    userId: string;
    email: string;
    username: string;
    profile_picture_url: string;
    role: string;
}

export type TCharacter = {
    id: string;
    userId: string;
    level: number;
    exp: number;
    points: number;
    strength: number;
    agility: number;
    endurance: number;
    createdAt: string;
    updatedAt: string;
}

interface ITrainingState {
    datasTraining: TDataTraining[];
    checkedItems: boolean[];
    trainingPercentage: number;
    toggleCheckbox: (index: number) => void;
    setDatasTraining: (data: TDataTraining[]) => void;
    getTodayTraining: () => TDataTraining | undefined;
    isCompleteToday: boolean;
    setIsCompleteToday: (isComplete: boolean) => void;
    setAllComplete: () => void;
}

interface IProfileState {
    personalInfo: TDataPersonalInfo;
    setPersonalInfo: (newInfo: TDataPersonalInfo) => void;
    targetWeight: string;
    setTargetWeight: (newWeight: string) => void;
    user: TUser;
    setUser: (data: JwtPayload) => void;
    resetUser: () => void;
    character: TCharacter;
    setCharacter: (data: TCharacter) => void;
    resetCharacter: () => void;
}

interface IThemeState {
    isDarkMode: boolean;
    toggleTheme: (theme: boolean) => void;
    setTheme: (theme: boolean) => void;
}

interface IConnectionState {
    isConnected: boolean,
    setConnected: (status: any) => void;
}


export const useTrainingStore = create<ITrainingState>((set, get) => ({
    datasTraining: [],
    setDatasTraining: (data: TDataTraining[]) => set({ datasTraining: data }),
    checkedItems: new Array(0).fill(false),
    trainingPercentage: 0,
    getTodayTraining: () => {
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const today = days[new Date().getDay()];
        return get().datasTraining.find(training => training.date === today);
    },
    toggleCheckbox: (index: number) => {
        set((state) => {
            const newCheckedItems = [...state.checkedItems];
            newCheckedItems[index] = !newCheckedItems[index];
            const todayTraining = get().getTodayTraining();
        
            const completed = newCheckedItems.filter(item => item).length;
            const percentage = todayTraining?.exercises.length 
                ? (completed / todayTraining?.exercises.length) * 100 
                : 0;

            return {
                checkedItems: newCheckedItems,
                trainingPercentage: percentage
            };
        });
    },
    isCompleteToday: false,
    setIsCompleteToday: (isComplete: boolean) => set({ isCompleteToday: isComplete }),
    setAllComplete: () => {
        const todayTraining = get().getTodayTraining();
        const newCheckedItems = new Array(todayTraining?.exercises?.length || 0).fill(true);
        
        set({
            checkedItems: newCheckedItems,
            trainingPercentage: 100
        });
    },
}));


export const useProfileStore = create<IProfileState>((set) => ({
    personalInfo: {
      height: "0",
      weight: "0",
      age: "0",
      gender: "Men"
    },
    setPersonalInfo: (newInfo: TDataPersonalInfo) => set({ personalInfo: newInfo }),
    targetWeight: "0",
    setTargetWeight: (newWeight: string) => set({ targetWeight: newWeight }),
    user: {
        exp: 0,
        iat: 0,
        userId: "",
        email: "",
        username: "",
        profile_picture_url: "",
        role: "USER",
    },
    setUser: (data: any) => set({ user: data }),
    resetUser: () => set({ user: { exp: 0, iat: 0, userId: "", email: "", username: "", profile_picture_url: "", role: "USER" } }),
    character: {
        id: "",
        userId: "",
        level: 1,
        exp: 0,
        points: 10,
        strength: 0,
        agility: 0,
        endurance: 0,
        createdAt: "",
        updatedAt: ""
    },
    setCharacter: (data: any) => set({ character: data }),
    resetCharacter: () => set({ character: { id: "", userId: "", level: 1, exp: 0, points: 0, strength: 1, agility: 1, endurance: 1, createdAt: "", updatedAt: "" } }),
}));

export const useThemeStore = create<IThemeState>((set) => ({
    isDarkMode: false,
    toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
    setTheme: (theme: boolean) => set({ isDarkMode: theme }),
}));

export const useConnectionStore = create<IConnectionState>((set) => ({
    isConnected: true,
    setConnected: (status: any) => set({ isConnected: status}),
}))