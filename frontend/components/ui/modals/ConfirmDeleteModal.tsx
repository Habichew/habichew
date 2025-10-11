import {
    View,
    Text,
    Dimensions,
    TouchableOpacity,
} from "react-native";
import {useUser} from "@/context/UserContext";
import React from "react";
import {ScaledSheet} from "react-native-size-matters";

interface ConfirmDeleteModalProps {
    swipeRef: any;
    closeHabits: any;
    toDeleteHabit: any;
    setToDeleteHabit: any;
    setShowConfirmDelete: any;
}

export default function
    ConfirmDeleteModal({
                           swipeRef,
                           closeHabits,
                           toDeleteHabit,
                           setShowConfirmDelete,
                       }: ConfirmDeleteModalProps) {

    const {
        deleteHabit,
    } = useUser();

    return (
        <>
            <View style={styles.confirmOverlay}>
                <View style={styles.confirmBox}>
                    <Text style={styles.confirmText}>Are you sure you want to delete this
                        habit?{'\n'}All related tasks will be deleted.</Text>
                    <View style={styles.confirmButtons}>
                        <TouchableOpacity style={styles.cancelBtn}
                                          onPress={() => {
                                              setShowConfirmDelete(false);
                                              console.log('close delete', swipeRef.current);
                                              closeHabits();
                                          }}><Text
                            style={styles.cancelText}>Cancel</Text></TouchableOpacity>
                        <TouchableOpacity style={styles.saveBtn} onPress={() => {
                            console.log('test delete habit', toDeleteHabit?.userHabitId);
                            if (deleteHabit && toDeleteHabit?.userHabitId) {
                                deleteHabit(toDeleteHabit?.userHabitId);
                                setShowConfirmDelete(false);
                            }
                        }}><Text style={styles.saveText}>Delete</Text></TouchableOpacity>
                    </View>
                </View>
            </View>
        </>
    );

}
const styles = ScaledSheet.create({
    confirmOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#00000088',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 5
    },
    confirmBox: {backgroundColor: '#fff', padding: 24, borderRadius: 24, width: '80%', alignItems: 'center'},
    confirmText: {fontSize: 16, color: '#000', marginBottom: 16, textAlign: 'center'},
    confirmButtons: {flexDirection: 'row', justifyContent: 'space-between', width: '100%'},
    cancelBtn: {backgroundColor: '#000', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24},
    cancelText: {fontSize: 20, color: '#dab7ff', fontWeight: 'bold'},
    saveBtn: {backgroundColor: '#1CC282', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24},
    saveText: {fontSize: 20, color: '#000', fontWeight: 'bold', marginRight: 5},
});