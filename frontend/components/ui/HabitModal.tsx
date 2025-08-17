import React, { useState, useEffect, useRef } from 'react';
import {View,Text,TextInput,Modal,StyleSheet,Platform,FlatList,ActivityIndicator,TouchableWithoutFeedback,TouchableOpacity,ScrollView,Dimensions,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import CustomDropdown from './select';
import { webDateInputWrapper, webDateInput } from './webDateStyles';
import { useFocusEffect } from '@react-navigation/native';
import { ScaledSheet } from 'react-native-size-matters';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Reanimated, { SharedValue, useAnimatedStyle } from 'react-native-reanimated';

type Props = {
  visible: boolean;
  initialData?: {
    habitTitle?: string;
    goalDate?: string | null;
    priority?: number | null;
    frequency?: string | null;
    tasks?: string[] | null;
  };
  onClose: () => void;
  onSave: (data: {
    habitTitle: string;
    goalDate?: string | null;
    startDate: string;
    priority?: number | null;
    frequency?: string | null;
    tasks?: string[];
  }) => void;
  onDelete?: (habitId: number) => void | Promise<void>;
  habitId?: number;
};

const HabitModal: React.FC<Props> = ({ visible, initialData, onClose, onSave, onDelete, habitId }) => {
  const isEdit = !!initialData;

  const [formData, setFormData] = useState<any>({
    habitTitle: '',
    goalDate: '',
    priority: '',
    frequency: '',
    tasks: [],
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [generatedTasks, setGeneratedTasks] = useState<string[]>([]);
  const [loadingTasks, setLoadingTasks] = useState<boolean>(false);
  const [savingOrCreating, setSavingOrCreating] = useState<boolean>(false);
  const windowHeight = Dimensions.get('window').height;

  const inputRef = useRef(null); // Attach a ref to the TextInput

  useFocusEffect(() => {
    // setTimeout(() => {
    //   inputRef.current?.focus()
    // }, 50)  // Delay the focus by 50ms to allow modal to complete its render
  });

  useEffect(() => {
    if (initialData) {
      const formatDate = (d: string | Date) => new Date(d).toISOString().split('T')[0];
      setFormData({
        habitTitle: initialData.habitTitle || '',
        goalDate: initialData.goalDate ? formatDate(initialData.goalDate) : '',
        priority: initialData.priority != null ? reversePriorityMap[initialData.priority] : '',
        frequency: initialData.frequency || '',
        tasks: initialData.tasks,
      });
    } else {
      setFormData({ habitTitle: '', goalDate: '', priority: '', frequency: '' });
    }
  }, [initialData]);

  const reversePriorityMap: Record<number, string> = { 1: 'High', 2: 'Medium', 3: 'Low' };
  const priorityMap: Record<string, number> = { Low: 3, Medium: 2, High: 1 };

  const handleSave = () => {
    if (!formData.habitTitle) return alert('Please enter a habit name.');
    const today = new Date().toISOString().split('T')[0];
    setSavingOrCreating(true);
    onSave({
      habitTitle: formData.habitTitle,
      goalDate: formData.goalDate || null,
      startDate: today,
      priority: formData.priority ? priorityMap[formData.priority] : null,
      frequency: formData.frequency || null,
      tasks: generatedTasks || null,
    });
    setSavingOrCreating(false);
    setGeneratedTasks([]);
    onClose();
  };

  function addTaskInput() {
    setGeneratedTasks([...generatedTasks, '']);
  }

  function handleChangeTask(text: string, i: number) {
    console.log('changing text at index', i, ' to ', text);
    let newTasks = generatedTasks;
    newTasks = newTasks.map((value, index, array) => {
      if (index === i) {
        return text;
      }
      return value;
    });
    setGeneratedTasks(newTasks);
  }

  function handleGenerateTasks() {
    if (!formData.habitTitle) return alert('Please enter a habit name.');
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Authorization', 'Bearer ' + process.env.EXPO_PUBLIC_OPENAI_API_KEY);

    const raw = JSON.stringify({
      model: 'gpt-4.1',
      messages: [
        {
          role: 'user',
          content:
            "In short sentences, break down this habit into a bulleted list of max. 6 tasks that are directly executable: '" +
            formData.habitTitle +
            "'. Only respond with a bulleted list",
        },
      ],
    });

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow',
    };

    // setGeneratedTasks(["Find a private or comfortable space", "Acknowledge your emotions", "Allow your feelings to flow without holding back", "Breathe deeply and steadily", "Use tissues or a cloth if needed", "Take time afterwards to rest or reflect"]);
    setLoadingTasks(true);
    fetch('https://api.openai.com/v1/chat/completions', requestOptions)
      .then(response => response.json())
      .then(result => {
        console.log(result);
        let newTasks = result.choices[0].message.content;
        newTasks = newTasks.split('\n').map((t: string) => {
          if (t.startsWith('- ')) {
            return t.slice(2);
          }
          return t;
        });
        setGeneratedTasks(newTasks);
        console.log('set generated tasks', newTasks, 'length', newTasks.length);
        setLoadingTasks(false);
      })
      .catch(error => {
        console.error(error);
        setLoadingTasks(false);
      });
  }

  const renderTask = (item: any, index: number) => {
    console.log('task index', index, 'item', item);

    function RightAction(prog: SharedValue<number>, drag: SharedValue<number>) {
      const styleAnimation = useAnimatedStyle(() => {
        console.log('showRightProgress:', prog.value);
        console.log('appliedTranslation:', drag.value);

        return {
          transform: [{ translateX: drag.value + 50 }],
        };
      });

      return (
        <Reanimated.View style={styleAnimation}>
          <Text>Text</Text>
        </Reanimated.View>
      );
    }

    return (
      // <ReanimatedSwipeable>
      <View style={styles.task}>
        <TextInput
          placeholderTextColor="gray"
          style={{ backgroundColor: 'white', padding: 4, color: 'black' }}
          placeholder="Task name"
          value={item}
          onChangeText={text => handleChangeTask(text, index)}
        />
      </View>
      // </ReanimatedSwipeable>
      // <GestureHandlerRootView>
      //   <ReanimatedSwipeable
      //     friction={1}
      //     enableTrackpadTwoFingerGesture
      //     rightThreshold={40}
      //     renderRightActions={RightAction}
      //     containerStyle={styles.task}
      //   >
      //     <Text>Swipe me!</Text>
      //   </ReanimatedSwipeable>
      // </GestureHandlerRootView>
    );
  };

return (
  <Modal
    onRequestClose={() => {
      onClose();
      setGeneratedTasks([]);
    }}
    visible={visible}
    transparent
    animationType="slide"
  >
    <TouchableOpacity
      activeOpacity={1}
      style={styles.overlay}
      onPressOut={() => {
        onClose();
        setGeneratedTasks([]);
      }}
    >
      <View>
        <TouchableWithoutFeedback>
          <View style={{ maxHeight: Dimensions.get('window').height, width: Dimensions.get('window').width }}>
            <View style={styles.modal}>
              <View style={styles.modalHeader}>

                <View style={styles.habitSection}>  {/* habit section */}
                  <TextInput
                    ref={inputRef}
                    autoFocus
                    placeholder="Habit Title"
                    placeholderTextColor="#bbb"  
                    style={styles.title}
                    value={formData.habitTitle}
                    onChangeText={text => setFormData({ ...formData, habitTitle: text })}
                  />

                  {/* date */}
                  <View style={styles.inputGroup}>
                    {Platform.OS === 'web' ? (
                      <View style={webDateInputWrapper}>
                        <input
                          type="date"
                          value={formData.goalDate}
                          onChange={e => setFormData({ ...formData, goalDate: e.target.value })}
                          style={{ ...webDateInput, color: formData.goalDate ? '#000' : '#bbb' }}
                        />
                      </View>
                    ) : (
                      <TouchableOpacity style={styles.dateInput} onPress={() => setShowDatePicker(true)}>
                        <Text style={styles.dateText}>
                          {formData.goalDate
                            ? new Date(formData.goalDate).toLocaleDateString()
                            : 'Due Date'}
                        </Text>
                        <Ionicons name="calendar-outline" size={24} color="#bbb" />
                      </TouchableOpacity>

                    )}
                    {showDatePicker && (
                      <DateTimePicker
                        value={formData.goalDate ? new Date(formData.goalDate) : new Date()}
                        mode="date"
                        display="calendar"
                        onChange={(event, selectedDate) => {
                          setShowDatePicker(false);
                          if (selectedDate) {
                            const y = selectedDate.getFullYear();
                            const m = selectedDate.getMonth() + 1;
                            const d = selectedDate.getDate();
                            const formattedDate = `${y}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
                            setFormData({ ...formData, goalDate: formattedDate });
                          }
                        }}
                      />
                    )}
                  </View>

                  {/* Frequency */}
                  <CustomDropdown
                    items={[
                      { label: 'Daily', value: 'Daily' },
                      { label: 'Weekly', value: 'Weekly' },
                      { label: 'Monthly', value: 'Monthly' },
                    ]}
                    placeholder="Select Frequency"
                    value={formData.frequency}
                    setValue={val => val && setFormData({ ...formData, frequency: val })}
                  />

                  {/* Priority */}
                  <CustomDropdown
                    items={[
                      { label: 'Low', value: 'Low' },
                      { label: 'Medium', value: 'Medium' },
                      { label: 'High', value: 'High' },
                    ]}
                    placeholder="Select Priority"
                    value={formData.priority}
                    setValue={val => val && setFormData({ ...formData, priority: val })}
                  />
                </View>
              </View>

              {/* Tasks section*/}
              <View style={styles.modalBody}>
                {/* Tasks Header */}
                <View style={{ flexDirection: 'row', minHeight: 50, alignItems: 'center' }}>
                  <Text style={styles.taskTitle}>Tasks</Text>
                  <TouchableOpacity style={{ marginLeft: 'auto', width: 30, height: 30 }} onPress={addTaskInput}>
                    <Ionicons name="add" size={24} color="#000" />
                  </TouchableOpacity>
                </View>

                {/* Tasks Content */}
                {loadingTasks ? (
                  <ActivityIndicator size="large" />
                ) : generatedTasks.length === 0 ? (
                  <>
                    <Text style={{ marginHorizontal: 'auto', marginVertical: 20 }}>No tasks created.</Text>
                    <TouchableOpacity style={styles.generateTextBtn} onPress={handleGenerateTasks}>
                      <Text style={styles.generateText}>Generate Tasks</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <FlatList
                    data={generatedTasks}
                    keyExtractor={(item, index) => index}
                    renderItem={({ item, index }) => renderTask(item, index)}
                    style={styles.taskList}
                  />
                )}

                {/* Create Button */}
                <View style={styles.centeredButtons}>
                  <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
                    <Text style={styles.saveText}>{isEdit ? 'Save' : 'Create'}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm delete */}
              {showConfirmDelete && (
                <View style={styles.confirmOverlay}>
                  <View style={styles.confirmBox}>
                    <Text style={styles.confirmText}>
                      Are you sure you want to delete this habit?{'\n'}All related tasks will be deleted.
                    </Text>
                    <View style={styles.confirmButtons}>
                      <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowConfirmDelete(false)}>
                        <Text style={styles.cancelText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.saveBtn}
                        onPress={() => {
                          if (onDelete && habitId) {
                            onDelete(habitId);
                            setShowConfirmDelete(false);
                            onClose();
                          }
                        }}
                      >
                        <Text style={styles.saveText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableOpacity>
  </Modal>
);

};

export default HabitModal;

const styles = ScaledSheet.create({
  overlay: { flexDirection: 'row', flex: 1, alignItems: 'flex-end', overflow: 'hidden', marginTop: 'auto' },
  modal: { backgroundColor: '#DAB7FF', borderTopLeftRadius: 24, borderTopRightRadius: 24, position: 'relative' },

  /* HEADER */
  modalHeader: { padding: 24, paddingBottom: 16 },
  titleRow: {  flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'nowrap' }, // CHANGED: keep single row, consistent gap
  title: {backgroundColor: '#fff',borderRadius: 24,paddingHorizontal: 16,minHeight: 50,fontWeight: 'bold',fontSize: 16, color: '#000',marginBottom: 15,}, // CHANGED: larger title, take remaining space
  headerGrid: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginTop: 16}, // row for date & priority
  headerLeft: { flex: 1, gap: 12 }, // NEW
  headerRight: { width: 180 }, // NEW: keep priority width consistent on web & mobile
  chipRow: { flexDirection: 'row', gap: 16, alignItems: 'center' }, // NEW
  dateInput: {backgroundColor: '#fff',borderRadius: 24,paddingHorizontal: 16,minHeight: 50,flexDirection: 'row',alignItems: 'center',justifyContent: 'space-between',},
  dateText: {fontSize: 16,fontWeight: 'bold',color: '#bbb',},

  /* BODY */
  modalBody: { padding: 24, paddingTop: 16, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#cda6ff' }, // CHANGED: soft divider line
  sectionDivider: { height: StyleSheet.hairlineWidth, backgroundColor: '#DAB7FF', marginVertical: 12, borderRadius: 1 }, // NEW optional
  taskTitle: { fontWeight: '700', fontSize: 18, height: 30 },
  taskHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }, // NEW: Tasks title + plus icon on one line
  taskList: { maxHeight: 320 }, // CHANGED: stable height across devices
  task: { backgroundColor: '#fff', padding: 12, borderRadius: 16, fontWeight: 'bold', fontSize: 16, color: '#000', marginBottom: 8, shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 1 }, shadowRadius: 2, elevation: 1 }, // CHANGED: subtle shadow

  /* EMPTY STATE + GENERATE BUTTON */
  emptyWrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 12, gap: 16 }, // NEW: center empty text & button
  generateTextBtn: { alignSelf: 'center', width:'50%', backgroundColor: '#1CC282', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 24 },
  generateText: { alignSelf: 'center', fontSize: 16, color: '#000', fontWeight: 'bold' },

  /* FOOTER BUTTONS */
  buttons: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 },
  cancelBtn: { backgroundColor: '#000', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 },
  cancelText: { fontSize: 18, color: '#DAB7FF', fontWeight: 'bold' },
  saveBtn: { backgroundColor: '#000',  borderWidth: 1, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 24 }, // CHANGED: closer to your preview style
  saveText: { fontSize: 18, color: '#fff', fontWeight: '700', marginRight: 6 },

  /* CONFIRM DELETE */
  deleteIcon: { position: 'absolute', top: 16, right: 16 },
  confirmOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#00000088', justifyContent: 'center', alignItems: 'center', zIndex: 5 },
  confirmBox: { backgroundColor: '#fff', padding: 24, borderRadius: 24, width: '80%', alignItems: 'center' },
  confirmText: { fontSize: 16, color: '#000', marginBottom: 16, textAlign: 'center' },
  confirmButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },

  /* INPUTS */
  description: { fontWeight: 'normal', fontSize: '13@ms' },
  habitSection: { backgroundColor: '#cda6ff', padding: 10, borderRadius: 16 },
  inputGroup: { marginBottom: 16 },
  dropdownLabel: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  picker: { backgroundColor: '#fff', borderRadius: 10, height: 40 },
  centeredButtons: { alignItems: 'center', marginTop: 24 },
});

