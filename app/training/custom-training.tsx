import IconComponent from '@/components/icons/icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, TextInput, ScrollView, Switch, Modal, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { TDataTraining, useProfileStore, useThemeStore, useTrainingStore } from '@/stores/store';
import axiosInstance from '@/lib/axios';
import useFetchWorkouts from '@/hooks/useFetchWorkouts';
import DeleteModal from '@/components/modal/delete-modal';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import OfflinePage from '@/components/offline-page';
import * as SecureStore from "expo-secure-store";

type TExercises = {
    name: string;
    repetitions: number;
    sets: number;
    weight?: number;
}

export default function CustomTrainingScreen() {
    const { datasTraining } = useTrainingStore((state) => state);
    const { user } = useProfileStore((state) => state);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
    const [showModalDelete, setShowModalDelete] = useState<boolean>(false);
    const [day, setDay] = useState<string>('');
    const [isRestDay, setIsRestDay] = useState<boolean>(false);
    const [calories, setCalories] = useState<string>('0');
    const [duration, setDuration] = useState<string>('0');
    const [reps, setReps] = useState<string>('0');
    const [sets, setSets] = useState<string>('0');
    const [exercise, setExercise] = useState<string>('');
    const [exercises, setExercises] = useState<TExercises[]>([]);
    const [editWorkout, setEditWorkout] = useState<TDataTraining | any>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingOnUpdate, setLoadingOnUpdate] = useState<boolean>(false);
    const [deleteWorkoutId, setDeleteWorkoutId] = useState<string | undefined>("");
    const { fetchWorkouts } = useFetchWorkouts();
    const { isDarkMode } = useThemeStore((state) => state);
    const { isConnected } = useNetworkStatus();

    const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const getDayIndex = (day: string) => DAYS_OF_WEEK.indexOf(day);
    const availableDays = DAYS_OF_WEEK.filter(day => !datasTraining.find((workout: TDataTraining) => workout.date === day));

    const onAddWorkout = async () => {
        setLoading(true);
        try {
            const token = await SecureStore.getItemAsync("accessToken");
            await axiosInstance.post("/workout/create", {
                userId: `${user?.userId}`,
                date: day,
                isRestDay,
                calorieBurn: parseInt(calories, 10),
                duration: parseInt(duration, 10),
                exercises: isRestDay ? [] : exercises as [],
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            fetchWorkouts();
            alert("Workout created successfully!");
            setModalVisible(false);
            resetForm();
            setLoading(false);
        } catch (error) {
            console.log(error);
            setLoading(false);
        }
    }

    const addExercise = () => {
        if (exercise.trim()) {
            setExercises([...exercises, {
                name: exercise,
                repetitions: parseInt(reps, 10),
                sets: parseInt(sets, 10),
            }]);
            setExercise('');
            setReps('0');
            setSets('0');
        }
    };

    const resetForm = () => {
        setDay('');
        setIsRestDay(false);
        setCalories('0');
        setDuration('0');
        setExercises([]);
        setExercise('');
    };

    const editWorkoutDay = (workout: TDataTraining, index: number) => {
        setEditWorkout({ ...workout, index });
        setIsRestDay(workout.isRestDay);
        setCalories(workout.calorieBurn.toString());
        setDuration(workout.duration.toString());
        setExercises([...workout.exercises]);
        setEditModalVisible(true);
    };

    const onUpdate = async (workoutId: string) => {
        setLoadingOnUpdate(true);
        try {
            if (editWorkout && typeof editWorkout.index === 'number') {
                const updatedWorkouts = {
                    ...editWorkout,
                    isRestDay,
                    calorieBurn: parseInt(calories, 10),
                    duration: parseInt(duration, 10),
                    exercises: isRestDay ? [] : exercises as []
                };
                const token = await SecureStore.getItemAsync("accessToken");
                await axiosInstance.patch(`/workout/${workoutId}`, updatedWorkouts, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                alert("Workout updated successfully!");
                setEditModalVisible(false);
                fetchWorkouts();
                setEditWorkout(null);
                setExercises([]);
                setIsRestDay(false);
                setCalories('0');
                setDuration('0');
                setLoadingOnUpdate(false);
            }
        } catch (error) {
            console.log(error);
            setLoadingOnUpdate(false);
        }
    };

    if (!isConnected) {
        return (
            <OfflinePage />
        )
    }

    return (
        <View style={[styles.container, { backgroundColor: isDarkMode ? "#181C14" : "#FFF" }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <IconComponent name="ChevronLeft" size={24} color={isDarkMode ? "#FFF" : "#000"} />
                </TouchableOpacity>
                <Text style={[styles.title, { flex: 1, textAlign: "center", marginRight: 24, color: isDarkMode ? "#FFF" : "#000" }]}>Custom Training</Text>
            </View>

            <TouchableOpacity
                style={[styles.addWorkoutButton, { backgroundColor: isDarkMode ? "#272727" : "#000" }]}
                onPress={() => setModalVisible(true)}
                activeOpacity={0.7}
            >
                <IconComponent name="Plus" size={24} color="#FFF" />
            </TouchableOpacity>

            <ScrollView style={styles.content}>
                {datasTraining.length === 0 ? (
                    <View style={styles.emptyWorkout}>
                        <Text style={[styles.emptyWorkoutText, { color: isDarkMode ? "#FFF" : "#000" }]}>No workouts added yet.</Text>
                    </View>
                ) : (
                    datasTraining.map((workout: TDataTraining, index: number) => (
                        <View key={index} style={[styles.workoutCard, { backgroundColor: isDarkMode ? "#1E1E1E" : "#F5F5F5" }]}>
                            <View style={styles.workoutHeader}>
                                <Text style={[styles.dayText, { color: isDarkMode ? "#FFF" : "#000" }]}>{workout.date}</Text>
                                <View style={styles.actionButtons}>
                                    <TouchableOpacity onPress={() => editWorkoutDay(workout, index)} style={styles.editButton}>
                                        <IconComponent name="Pencil" size={18} color={isDarkMode ? "#FFF" : "#000"} />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => {
                                        setDeleteWorkoutId(workout.id);
                                        setShowModalDelete(true);
                                    }}>
                                        <IconComponent name="Trash" size={18} color="red" />
                                        <DeleteModal
                                            showModalDelete={showModalDelete}
                                            setShowModalDelete={setShowModalDelete}
                                            workoutId={deleteWorkoutId} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            {workout.isRestDay ? (
                                <Text style={[styles.restDayText, { color: isDarkMode ? "#FFF" : "#A8A8A8" }]}>Rest Day</Text>
                            ) : (
                                workout.exercises.map((exercise, i: number) => (
                                    <Text key={i} style={[styles.exerciseText, { color: isDarkMode ? "#FFF" : "#000" }]}>- {`${exercise?.name} ${exercise?.sets} Sets ${exercise?.repetitions} Reps`}</Text>
                                ))
                            )}
                            <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
                                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 }}>
                                    <IconComponent name="Flame" size={14} color={isDarkMode ? "#FFF" : "#000"} />
                                    <Text style={{ fontFamily: "PoppinsRegular", fontSize: 14, paddingTop: 4, color: isDarkMode ? "#FFF" : "#000", opacity: 0.8 }}>{workout.calorieBurn} cal</Text>
                                </View>
                                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 }}>
                                    <IconComponent name="Timer" size={14} color={isDarkMode ? "#FFF" : "#000"} />
                                    <Text style={{ fontFamily: "PoppinsRegular", fontSize: 14, paddingTop: 4, color: isDarkMode ? "#FFF" : "#000", opacity: 0.8 }}>{workout.duration} min</Text>
                                </View>
                            </View>
                        </View>
                    )))}
            </ScrollView>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={[styles.modalContent, { backgroundColor: isDarkMode ? "#1E1E1E" : "#FFF" }]}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={[styles.modalTitle, { color: isDarkMode ? "#FFF" : "#000" }]}>Add New Workout</Text>

                            <Text style={[styles.modalLabel, { color: isDarkMode ? "#FFF" : "#000" }]}>Day</Text>
                            <Picker
                                selectedValue={day}
                                onValueChange={(itemValue) => setDay(itemValue)}
                                style={[styles.picker, { backgroundColor: isDarkMode ? "#181C14" : "#FFF" }]}
                            >
                                <Picker.Item label="Select day" value="" style={{ color: isDarkMode ? "#FFF" : "#000", backgroundColor: isDarkMode ? "#181C14" : "#FFF" }} />
                                {availableDays.map((day) => (
                                    <Picker.Item key={day} label={day} value={day} style={{ color: isDarkMode ? "#FFF" : "#000", backgroundColor: isDarkMode ? "#181C14" : "#FFF" }} />
                                ))}
                            </Picker>

                            <View style={styles.restDayContainer}>
                                <Text style={{ fontFamily: "PoppinsMedium", fontSize: 14, color: isDarkMode ? "#FFF" : "#000" }}>Rest Day</Text>
                                <Switch value={isRestDay} onValueChange={setIsRestDay} />
                            </View>

                            <View>
                                <Text style={[styles.modalLabel, { color: isDarkMode ? "#FFF" : "#000" }]}>Calories Burn</Text>
                                <TextInput keyboardType="numeric" style={[styles.input, { backgroundColor: isDarkMode ? "#181C14" : "#FFF", color: isDarkMode ? "#FFF" : "#000", borderColor: isDarkMode ? "#373737" : "#DDD" }]} placeholderTextColor={isDarkMode ? "#757575" : "#666"} placeholder="Calorie Burn" value={calories} onChangeText={setCalories} />
                            </View>

                            <View>
                                <Text style={[styles.modalLabel, { color: isDarkMode ? "#FFF" : "#000" }]}>Duration (minutes)</Text>
                                <TextInput keyboardType="numeric" style={[styles.input, { backgroundColor: isDarkMode ? "#181C14" : "#FFF", color: isDarkMode ? "#FFF" : "#000", borderColor: isDarkMode ? "#373737" : "#DDD" }]} placeholderTextColor={isDarkMode ? "#757575" : "#666"} placeholder="Workout Time" value={duration} onChangeText={setDuration} />
                            </View>

                            {!isRestDay && (
                                <View>
                                    <View style={{ flexDirection: "row", gap: 5 }}>
                                        <View style={{ width: "55%" }}>
                                            <Text style={[styles.modalLabel, { color: isDarkMode ? "#FFF" : "#000" }]}>Exercise</Text>
                                            <TextInput
                                                style={[styles.input, { backgroundColor: isDarkMode ? "#181C14" : "#FFF", color: isDarkMode ? "#FFF" : "#000", borderColor: isDarkMode ? "#373737" : "#DDD" }]}
                                                placeholderTextColor={isDarkMode ? "#757575" : "#666"} placeholder="Add exercise"
                                                value={exercise}
                                                onChangeText={setExercise}
                                            />
                                        </View>
                                        <View style={{ width: "20%" }}>
                                            <Text style={[styles.modalLabel, { color: isDarkMode ? "#FFF" : "#000" }]}>Sets</Text>
                                            <TextInput
                                                style={[styles.input, { backgroundColor: isDarkMode ? "#181C14" : "#FFF", color: isDarkMode ? "#FFF" : "#000", borderColor: isDarkMode ? "#373737" : "#DDD" }]}
                                                placeholderTextColor={isDarkMode ? "#757575" : "#666"} placeholder="Sets"
                                                value={sets}
                                                onChangeText={setSets}
                                                keyboardType="numeric"
                                            />
                                        </View>
                                        <View style={{ width: "20%" }}>
                                            <Text style={[styles.modalLabel, { color: isDarkMode ? "#FFF" : "#000" }]}>Reps</Text>
                                            <TextInput
                                                style={[styles.input, { backgroundColor: isDarkMode ? "#181C14" : "#FFF", color: isDarkMode ? "#FFF" : "#000", borderColor: isDarkMode ? "#373737" : "#DDD" }]}
                                                placeholderTextColor={isDarkMode ? "#757575" : "#666"} placeholder="Reps"
                                                value={reps}
                                                onChangeText={setReps}
                                                keyboardType="numeric"
                                            />
                                        </View>
                                    </View>
                                    <TouchableOpacity style={styles.addButton} onPress={addExercise}>
                                        <Text style={styles.buttonText}>Add Exercise</Text>
                                    </TouchableOpacity>

                                    {exercises.map((exercise: TExercises, index: number) => (
                                        <Text key={index} style={[styles.exerciseItem, { color: isDarkMode ? "#FFF" : "#000", backgroundColor: isDarkMode ? "#181C14" : "#E0E0E0" }]}>- {`${exercise?.name} ${exercise?.sets} Sets ${exercise?.repetitions} Reps`}</Text>
                                    ))}
                                </View>
                            )}

                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelButton]}
                                    onPress={() => {
                                        setModalVisible(false);
                                    }}
                                >
                                    <Text style={styles.buttonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalButton, { backgroundColor: isDarkMode ? "#000" : "#202020" }]}
                                    onPress={onAddWorkout}
                                >
                                    {loading ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <Text style={styles.buttonText}>Create</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>


            <Modal
                animationType="slide"
                transparent={true}
                visible={editModalVisible}
                onRequestClose={() => setEditModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={[styles.modalContent, { backgroundColor: isDarkMode ? "#1E1E1E" : "#FFF" }]}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={[styles.modalTitle, { color: isDarkMode ? "#FFF" : "#000" }]}>Edit Workout for {editWorkout?.date}</Text>

                            <View style={styles.restDayContainer}>
                                <Text style={{ fontFamily: "PoppinsMedium", fontSize: 14, color: isDarkMode ? "#FFF" : "#A8A8A8" }}>Rest Day</Text>
                                <Switch value={isRestDay} onValueChange={setIsRestDay} />
                            </View>

                            <View>
                                <Text style={[styles.modalLabel, { color: isDarkMode ? "#FFF" : "#000" }]}>Calories Burn</Text>
                                <TextInput keyboardType="numeric" style={[styles.input, { backgroundColor: isDarkMode ? "#181C14" : "#FFF", color: isDarkMode ? "#FFF" : "#000", borderColor: isDarkMode ? "#373737" : "#DDD" }]} placeholderTextColor={isDarkMode ? "#757575" : "#666"} placeholder="Calorie Burn" value={calories} onChangeText={setCalories} />
                            </View>

                            <View>
                                <Text style={[styles.modalLabel, { color: isDarkMode ? "#FFF" : "#000" }]}>Duration (minutes)</Text>
                                <TextInput keyboardType="numeric" style={[styles.input, { backgroundColor: isDarkMode ? "#181C14" : "#FFF", color: isDarkMode ? "#FFF" : "#000", borderColor: isDarkMode ? "#373737" : "#DDD" }]} placeholderTextColor={isDarkMode ? "#757575" : "#666"} placeholder="Workout Time" value={duration} onChangeText={setDuration} />
                            </View>

                            {!isRestDay && (
                                <View>
                                    <View style={{ flexDirection: "row", gap: 5 }}>
                                        <View style={{ width: "55%" }}>
                                            <Text style={[styles.modalLabel, { color: isDarkMode ? "#FFF" : "#000" }]}>Exercise</Text>
                                            <TextInput
                                                style={[styles.input, { backgroundColor: isDarkMode ? "#181C14" : "#FFF", color: isDarkMode ? "#FFF" : "#000", borderColor: isDarkMode ? "#373737" : "#DDD" }]}
                                                placeholderTextColor={isDarkMode ? "#757575" : "#666"} placeholder="Add exercise"
                                                value={exercise}
                                                onChangeText={setExercise}
                                            />
                                        </View>
                                        <View style={{ width: "20%" }}>
                                            <Text style={[styles.modalLabel, { color: isDarkMode ? "#FFF" : "#000" }]}>Sets</Text>
                                            <TextInput
                                                style={[styles.input, { backgroundColor: isDarkMode ? "#181C14" : "#FFF", color: isDarkMode ? "#FFF" : "#000", borderColor: isDarkMode ? "#373737" : "#DDD" }]}
                                                placeholderTextColor={isDarkMode ? "#757575" : "#666"} placeholder="Sets"
                                                value={sets}
                                                onChangeText={setSets}
                                                keyboardType="numeric"
                                            />
                                        </View>
                                        <View style={{ width: "20%" }}>
                                            <Text style={[styles.modalLabel, { color: isDarkMode ? "#FFF" : "#000" }]}>Reps</Text>
                                            <TextInput
                                                style={[styles.input, { backgroundColor: isDarkMode ? "#181C14" : "#FFF", color: isDarkMode ? "#FFF" : "#000", borderColor: isDarkMode ? "#373737" : "#DDD" }]}
                                                placeholderTextColor={isDarkMode ? "#757575" : "#666"} placeholder="Reps"
                                                value={reps}
                                                onChangeText={setReps}
                                                keyboardType="numeric"
                                            />
                                        </View>
                                    </View>
                                    <TouchableOpacity style={styles.addButton} onPress={addExercise}>
                                        <Text style={styles.buttonText}>Add Exercise</Text>
                                    </TouchableOpacity>

                                    {exercises.map((exercise: TExercises, index: number) => (
                                        <View key={index} style={[styles.exerciseListItem, { backgroundColor: isDarkMode ? "#181C14" : "#E0E0E0" }]}>
                                            <Text style={[styles.exerciseText, { color: isDarkMode ? "#FFF" : "#000" }]}>- {`${exercise?.name} ${exercise?.sets} Sets ${exercise?.repetitions} Reps`}</Text>
                                            <TouchableOpacity onPress={() => {
                                                setExercises(exercises.filter((_: TExercises, i: number) => i !== index));
                                            }}>
                                                <IconComponent name="Trash" size={16} color="red" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            )}

                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelButton]}
                                    onPress={() => {
                                        setEditModalVisible(false);
                                        setEditWorkout(null);
                                        setExercises([]);
                                        setIsRestDay(false);
                                    }}
                                >
                                    <Text style={styles.buttonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalButton, { backgroundColor: isDarkMode ? "#000" : "#202020" }]}
                                    onPress={() => onUpdate(editWorkout?.id)}
                                >
                                    {loadingOnUpdate ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <Text style={styles.buttonText}>Save</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>


        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
        paddingTop: 50,
        paddingHorizontal: 25,
        position: "relative"
    },
    title: {
        fontSize: 20,
        fontFamily: "PoppinsSemiBold",
        color: "#000",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
    },
    backButton: {
        width: 24
    },
    content: {
        marginTop: 20,
    },
    addWorkoutButton: {
        position: "absolute",
        bottom: 20,
        right: 20,
        padding: 20,
        borderRadius: 50,
        zIndex: 10
    },
    input: {
        fontFamily: "PoppinsRegular",
        padding: 15,
        borderRadius: 5,
        marginBottom: 15,
        borderWidth: 1,
    },
    picker: {
        marginLeft: -15
    },
    restDayContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    addButton: {
        backgroundColor: "#34D399",
        padding: 10,
        borderRadius: 5,
        alignItems: "center",
        marginBottom: 10,
    },
    buttonText: {
        fontFamily: "PoppinsSemiBold",
        color: "#fff",
    },
    exerciseItem: {
        fontFamily: "PoppinsRegular",
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginBottom: 5,
        borderRadius: 5,
    },
    workoutCard: {
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
    },
    workoutHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    dayText: {
        fontSize: 18,
        fontWeight: "bold",
        opacity: 0.6
    },
    exerciseRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 5,
        paddingHorizontal: 10,
    },
    exerciseText: {
        fontFamily: "PoppinsRegular",
        fontSize: 14,
        opacity: 0.7
    },
    restDayText: {
        fontFamily: "PoppinsMedium",
        fontSize: 16,
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContent: {
        margin: 25,
        padding: 25,
        borderRadius: 10,
        elevation: 5,
    },
    modalTitle: {
        fontFamily: "PoppinsSemiBold",
        fontSize: 18,
        marginBottom: 15,
        textAlign: "center",
    },
    modalLabel: {
        fontFamily: "PoppinsMedium",
        fontSize: 14,
        marginBottom: 5,
    },
    modalButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 15,
    },
    modalButton: {
        flex: 1,
        padding: 15,
        borderRadius: 5,
        marginHorizontal: 5,
        alignItems: "center",
    },
    cancelButton: {
        backgroundColor: "#f44336",
    },
    exerciseListItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        // backgroundColor: "#f1f5f9",
        padding: 10,
        paddingLeft: 15,
        marginBottom: 5,
        borderRadius: 5,
    },
    actionButtons: {
        flexDirection: "row",
        gap: 3,
    },
    editButton: {
        marginRight: 10,
    },
    emptyWorkout: {
        height: 500,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    emptyWorkoutText: {
        fontFamily: "PoppinsMedium",
        fontSize: 16,
        opacity: 0.4,
    }
});
