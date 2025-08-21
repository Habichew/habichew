import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Dimensions, Modal, Pressable, TouchableWithoutFeedback,
} from "react-native";
import { useUser } from "@/context/UserContext";
import { ScaledSheet } from "react-native-size-matters";

import FlipCard from "react-native-flip-card";
import Postcard from "@/components/ui/Postcard";
import {postcardImgs} from "@/constants/PostcardData"
/*import Carousel, {
  ICarouselInstance,
} from "react-native-reanimated-carousel";*/
import { Image } from 'expo-image';
import {Ionicons} from "@expo/vector-icons";

export default function PetScreen(this: any) {
  const { pet, loadPet, user } = useUser(); // use user data
  const [selectedCard, setSelectedCard] = useState<{
    frontUrl: any;
    backUrl: any;
    unlockScore: number;
  } | null>(null);

  const [modalVisible, setModalVisible] = useState(false);

  useState(() => {
    console.log("load user pet");
    loadPet();
    console.log('PetScreen', pet);
  });

  const ref = React.useRef<ICarouselInstance>(null);
  const width = Dimensions.get("window").width;

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>{pet ? `${pet.name}'s` : 'Pet'} Journey</Text>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {/* Pet Info */}
        <View style={styles.petInfoContainer}>
          <View style={styles.petInfo}>
            <Image source={require('@/assets/images/pet profile.png')} style={styles.avatar} />
            <View style={styles.avatarDescription}>
              <Text style={styles.petName}>{pet?.name}</Text>
              <Text style={styles.personality}>{pet?.personality}</Text>
              {/*<Text style={styles.textLine}>Mood: {pet?.mood}</Text>*/}
              <Text style={styles.level}>Level: {pet?.level}</Text>
              <View style={styles.creditContainer}>
                <Ionicons name="star" size={20} color="#1CC282"/>
                <Text style={{ lineHeight:20 }}> {user?.credits|0}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.postcards}>
          <Text style={styles.postcardsTitle}>Postcards</Text>

          <View style={{ marginBottom: 30 }}>
            {postcardImgs.reduce((rows, current, index) => {
              if (index % 3 === 0) rows.push([]);
              rows[rows.length - 1].push(current);
              return rows;
            }, []).map((row, rowIndex) => (
                <View key={rowIndex} style={{ flexDirection: 'row', justifyContent: 'space-evenly', marginHorizontal: 20, marginBottom: 10 }}>
                  {row.map((item, idx) => (
                      <Postcard
                          key={`postcard-${rowIndex}-${idx}`}
                          source={item.frontUrl}
                          unlockScore={item.unlockScore}
                          isUnlocked={user.credits >= item.unlockScore}
                          onPress={() => {
                            setSelectedCard(item);        // select the unlocked postcard
                            setModalVisible(true);        // Open the modal to flip the postcard
                          }}
                      />
                  ))}
                </View>
            ))}
          </View>

          <Modal
              visible={modalVisible}
              transparent={true}
              animationType="fade"
          >
            <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
              <View style={styles.modalBackground}>
                <TouchableWithoutFeedback onPress={() => {}}>
                  <View style={styles.modalContainer}>
                    <FlipCard
                        flipHorizontal
                        flipVertical={false}
                        friction={8}
                        perspective={2000}
                        useNativeDriver
                    >
                    {/* Front Side of Postcard */}
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                      <Image style={[styles.faceImg]} source={selectedCard?.frontUrl} key={`front`}></Image>
                    </View>
                    {/* Back Side of Postcard */}
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                      <Image style={[styles.faceImg]} source={selectedCard?.backUrl} key={"back"}></Image>
                    </View>
                    </FlipCard>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>

          {/*<Carousel*/}
          {/*    ref={ref}*/}
          {/*    width={width}*/}
          {/*    data={postCardImgs.filter((item, index) => {*/}
          {/*      if (item.unlockScore < user.credits) return item;*/}
          {/*    }).reverse()}*/}
          {/*    pagingEnabled={true}*/}
          {/*    snapEnabled={true}*/}
          {/*    style={{*/}
          {/*      alignItems: "center",*/}
          {/*      justifyContent: "center",*/}
          {/*      width: "100%",*/}
          {/*      paddingTop: 50,*/}
          {/*      top: 0,*/}
          {/*      marginBottom: Dimensions.get('window').height * 0.5*/}
          {/*    }}*/}
          {/*    mode={"vertical-stack"}*/}
          {/*    modeConfig={{*/}
          {/*      snapDirection: "left",*/}
          {/*      stackInterval: -10,*/}
          {/*      opacityInterval: 0*/}
          {/*    }}*/}
          {/*    customConfig={() => ({ type: "positive", viewCount: 5 })}*/}
          {/*    renderItem={({index, item}) => (*/}
          {/*        <FlipCard style={{flexDirection: 'row', width: '100%'}} flipHorizontal={true} flipVertical={false} friction={8} perspective={2000} useNativeDriver={true}>*/}
          {/*          /!* Face Side *!/*/}
          {/*          <View style={styles.face}>*/}
          {/*            <Image style={[styles.faceImg]} source={item.frontUrl} key={"postcard-"+index}></Image>*/}
          {/*          </View>*/}
          {/*          /!* Back Side *!/*/}
          {/*          <View style={styles.back}>*/}
          {/*            <Image style={styles.backImg} source={item.backUrl} key={"postcard-"+index}/>*/}
          {/*          </View>*/}
          {/*        </FlipCard>*/}
          {/*    )}*/}
          {/*    loop={false}*/}
          {/*/>*/}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = ScaledSheet.create({
  headerContainer: { backgroundColor: "white", paddingTop: 20 },
  title: {
    fontSize: 15,
    fontFamily: "Poppins",
    fontWeight: "900",
    letterSpacing: 0,
    alignSelf: "center",
    marginVertical: 8,
    marginBottom: 20,
  },
  container: { flex: 1, backgroundColor: "#D7B5FC" },
  petInfoContainer: {
    width: "100%",
    height: "auto",
    backgroundColor: "white",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingVertical: 20,
    paddingTop: 120,
    marginTop: -100,
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  sectionBox: {
    backgroundColor: "#fdfdfe",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  petInfo: {
    flexDirection: "row",
    alignSelf: "flex-start",
    gap: 12,
    paddingHorizontal: "30@ms",
    paddingBottom: "10@ms",
  },
  avatar: {
    width: "120@ms",
    height: "120@ms",
    borderRadius: 8,
    backgroundColor: "#ddd",
  },
  textLine: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  subText: {
    fontSize: 12,
    color: "#555",
    marginBottom: 8,
  },
  rowEnd: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 6,
  },
  linkText: {
    fontSize: 14,
    fontWeight: "500",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 6,
  },
  dotBox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: "#bbb",
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    width: 6,
    height: 6,
    backgroundColor: "#333",
    borderRadius: 3,
  },
  petName: {
    fontSize: 32,
    color: "#1CC282",
    fontWeight: "bold",
    fontFamily: "Poppins",
  },
  creditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  personality: {
    fontSize: 14,
    fontFamily: "Poppins",
  },
  avatarDescription: {
    paddingHorizontal: 10,
  },
  level: {
    fontSize: 15,
    fontWeight: "600",
  },
  postcards: {
    paddingTop: 50,
    paddingBottom: 100
  },
  postcardsTitle: {
    fontSize: 24,
    fontWeight: "bold",
    fontFamily: "Poppins",
    alignSelf: "flex-start",
    marginBottom: 15,
    paddingHorizontal: "40@ms",
  },
  postcardsButton: {
    backgroundColor: "#1CC282",
    fontWeight: "bold",
    minWidth: "175@ms",
    marginHorizontal: "auto",
    marginVertical: 30,
  },
  postcardsImgs: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: "16@ms",
    gap: 12,
    marginHorizontal: "auto",
  },
  postcard: {
    flex: 1,
  },
  face: {
    width: "auto",
  },
  back: {},
  faceImg: {
    alignSelf: "center",
    marginVertical: 8,
    backgroundColor: "white",
    aspectRatio: 3 / 2,
    width: Dimensions.get("window").width * 0.8,
    borderWidth: 1,
    borderColor: "#00000069",
  },
  backImg: {
    alignSelf: "center",
    marginVertical: 8,
    backgroundColor: "white",
    aspectRatio: 3 / 2,
    width: Dimensions.get("window").width * 0.8,
    borderWidth: 1,
    borderColor: "#00000069",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: Dimensions.get("window").width * 0.8,
    aspectRatio: 3/2,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
