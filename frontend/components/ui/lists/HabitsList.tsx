import {
    View,
    Text,
    Pressable, Dimensions, FlatList, RefreshControl, ActivityIndicator,
} from "react-native";
import {Habit, useUser} from "@/context/UserContext";
import React from "react";
import {ScaledSheet} from "react-native-size-matters";
import {Skeleton} from "moti/skeleton";
import HabitCard from "@/components/ui/cards/HabitCard";
import {scale} from "@/hooks/scale";

interface HabitsListProps {
    flatListRef: any;
    filteredHabits: any;
    showArchivedHabits: boolean;
    refreshing: boolean;
    setToDeleteHabit: any;
    setShowConfirmDelete: any;
    setEditHabit: any;
    setModalVisible: any;
    row: any;
    riveRef: any;
}

const screenWidth = Dimensions.get("window").width;

export default function
    HabitsList({
                   flatListRef,
                   filteredHabits,
                   showArchivedHabits,
                   refreshing,
                   setToDeleteHabit,
                   setShowConfirmDelete,
                   setEditHabit,
                   setModalVisible,
                   row,
                   riveRef,
               }: HabitsListProps) {

    const {
        loadHabits,
        calculateHabitProgress,
    } = useUser();

    const renderHabit = ({item, index}: { item: any, index: any }) => {
        const progressMap: Record<number, any> = calculateHabitProgress();
        let percent, allTasks, completedTasks;
        if (item.userHabitId) {
            percent = progressMap?.[item.userHabitId]?.percent ?? 0;
            allTasks = progressMap?.[item.userHabitId]?.all ?? 0;
            completedTasks = progressMap?.[item.userHabitId]?.done ?? 0;
        }
        else if (item.offlineUserHabitId) {
            percent = progressMap?.[item.offlineUserHabitId]?.percent ?? 0;
            allTasks = progressMap?.[item.offlineUserHabitId]?.all ?? 0;
            completedTasks = progressMap?.[item.offlineUserHabitId]?.done ?? 0;
        }

        console.log('item', item, 'percent', percent,
            'allTasks', allTasks,
            'completedTasks', completedTasks);

        return (
            <HabitCard
                row={row}
                item={item}
                index={index}
                riveRef={riveRef}
                setToDeleteHabit={setToDeleteHabit}
                setShowConfirmDelete={setShowConfirmDelete}
                setEditHabit={setEditHabit}
                setModalVisible={setModalVisible}
                progressMap={progressMap}
                completedTasks={completedTasks}
                allTasks={allTasks}
                percent={percent}
            />
        );
    };

    return (
        <>
            {refreshing ?
                <HabitSkeleton/>
                :
                <FlatList
                    ref={flatListRef}
                    style={{paddingBottom: 10, width: "100%", alignSelf: 'center'}}
                    initialNumToRender={10}
                    data={filteredHabits.filter((h: Habit) =>
                        h.isArchived !== undefined && !(+showArchivedHabits ^ +(h.isArchived)))
                    }

                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={async () => {
                            console.log("refresh");
                            await loadHabits()
                        }}/>
                    }
                    keyExtractor={(item, index) => item.userHabitId ? String(item.userHabitId) : String(index)}
                    renderItem={renderHabit}
                    ListEmptyComponent={() => (
                        refreshing ? <ActivityIndicator size="large"/> :
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>
                                    There are no habits to display. Try adding one!
                                </Text>
                            </View>
                    )}
                />
            }
        </>
    );
}

class HabitSkeleton extends React.Component {
    render() {
        return (
            <>
                <View style={{
                    borderRadius: 16,
                    backgroundColor: 'white',
                    zIndex: 3,
                    marginHorizontal: 10,
                    marginBottom: 12
                }}>
                    <Pressable style={styles.card}
                               android_ripple={{color: '#00000010', borderless: true, radius: 300}}>
                        <View style={styles.headerRow}>
                            <Skeleton colorMode={'light'} width={screenWidth * 0.55}/>
                        </View>
                        <View style={[styles.progressBarBackground, {height: scale(16)}]}>
                            <Skeleton colorMode={'light'}/>
                        </View>
                        <View style={[styles.tagRow, {height: scale(20)}]}>
                            <Skeleton colorMode={'light'} width={100} height={scale(20)}/>
                        </View>
                    </Pressable>
                </View>
                <View style={{
                    borderRadius: 16,
                    backgroundColor: 'white',
                    zIndex: 3,
                    marginHorizontal: 10,
                    marginBottom: 12
                }}>
                    <Pressable style={styles.card}
                               android_ripple={{color: '#00000010', borderless: true, radius: 300}}>
                        <View style={styles.headerRow}>
                            <Skeleton colorMode={'light'} width={screenWidth * 0.55}/>
                        </View>
                        <View style={[styles.progressBarBackground, {height: scale(16)}]}>
                            <Skeleton colorMode={'light'}/>
                        </View>
                        <View style={[styles.tagRow, {height: scale(20)}]}>
                            <Skeleton colorMode={'light'} width={100} height={scale(20)}/>
                            <Skeleton colorMode={'light'} width={100} height={scale(20)}/>
                        </View>
                    </Pressable>
                </View>
                <View style={{
                    borderRadius: 16,
                    backgroundColor: 'white',
                    zIndex: 3,
                    marginHorizontal: 10,
                    marginBottom: 12
                }}>
                    <Pressable style={styles.card}
                               android_ripple={{color: '#00000010', borderless: true, radius: 300}}>
                        <View style={styles.headerRow}>
                            <Skeleton colorMode={'light'} width={screenWidth * 0.55}/>
                        </View>
                        <View style={[styles.progressBarBackground, {height: scale(16)}]}>
                            <Skeleton colorMode={'light'}/>
                        </View>
                        <View style={[styles.tagRow, {height: scale(20)}]}>
                            <Skeleton colorMode={'light'} width={100} height={scale(25)}/>
                        </View>
                    </Pressable>
                </View></>
        );
    }
}

const styles = ScaledSheet.create({
    card: {padding: 16, width: '100%'},
    headerRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
    progressBarBackground: {
        height: scale(16),
        backgroundColor: '#DCDCDC',
        borderRadius: scale(8),
        marginTop: scale(8),
        overflow: 'hidden',
        width: '100%'
    },
    tagRow: {flexDirection: 'row', flexWrap: 'wrap', gap: scale(8), marginTop: 8},
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#DCDCDC',
        paddingHorizontal: scale(12),
        paddingVertical: scale(6),
        borderRadius: scale(20),
        marginBottom: scale(4)
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 20,
    },
    emptyText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        fontStyle: 'italic',
    },
});

