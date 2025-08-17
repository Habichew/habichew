import React, { useContext, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  FlatList,
  Animated,
  PanResponder,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import TopBar from "@/components/bottomBar";
import { useUser } from "@/app/context/UserContext";
import BottomBar from "@/components/bottomBar";
import { ScaledSheet } from "react-native-size-matters";
import { Button } from "@react-navigation/elements";
import { placeholder } from "@babel/types";
import Value = Animated.Value;
import FlipCard from "react-native-flip-card";
import Postcard from "@/components/ui/Postcard";
import Carousel, {
  ICarouselInstance,
  Pagination,
} from "react-native-reanimated-carousel";
import { useSharedValue } from "react-native-reanimated";

export default function PetScreen(this: any) {
  const router = useRouter();
  const { pet, loadPet, user } = useUser(); // use user data
  const [petPostcards, setPetPostcards] = useState([]);
  const postCardImgs = [
    {
      unlockScore: 50,
      frontUrl: require("@/assets/images/postcard 1.png"),
      backUrl: require("@/assets/images/postcard 1 back.png"),
    },
    {
      unlockScore: 150,
      frontUrl: require("@/assets/images/postcard 2.png"),
      backUrl: require("@/assets/images/postcard 2 back.png"),
    },
    {
      unlockScore: 500,
      frontUrl: require("@/assets/images/postcard 3.png"),
      backUrl: require("@/assets/images/postcard 3 back.png"),
    },
    {
      unlockScore: 1000,
      frontUrl: require("@/assets/images/postcard 4.png"),
      backUrl: require("@/assets/images/postcard 4 back.png"),
    },
    {
      unlockScore: 2000,
      frontUrl: require("@/assets/images/postcard 5.png"),
      backUrl: require("@/assets/images/postcard 5 back.png"),
    },
    {
      unlockScore: 5000,
      frontUrl: require("@/assets/images/postcard 6.png"),
      backUrl: require("@/assets/images/postcard 6 back.png"),
    },
    {
      unlockScore: 10000,
      frontUrl: require("@/assets/images/postcard 7.png"),
      backUrl: require("@/assets/images/postcard 7 back.png"),
    },
    {
      unlockScore: 25000,
      frontUrl: require("@/assets/images/postcard 8.png"),
      backUrl: require("@/assets/images/postcard 8 back.png"),
    },
    {
      unlockScore: 50000,
      frontUrl: require("@/assets/images/postcard 9.png"),
      backUrl: require("@/assets/images/postcard 9 back.png"),
    },
  ];
  const rotateAnim: Value = useRef(new Animated.Value(0)).current;
  const cardsPan = useRef(new Animated.ValueXY()).current;
  const cardsStackedAnim = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);

  const cardsPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onStartShouldSetPanResponderCapture: () => true,
    onMoveShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponderCapture: () => true,
    onPanResponderMove: (event, gestureState) => {
      cardsPan.setValue({ x: gestureState.dx, y: Number(cardsPan.y) });
    },
    onPanResponderTerminationRequest: () => false,
    onPanResponderRelease: (event, gestureState) => {
      // bring the translationX back to 0
      Animated.timing(cardsPan, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start(); // will be used to interpolate values in each view
      Animated.timing(cardsStackedAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        // reset cardsStackedAnim's value to 0 when animation ends
        cardsStackedAnim.setValue(0); // increment card position when animation ends
        setCurrentIndex((currentIndex + 1) % 3);
        console.log("currentIndex", currentIndex);
      });
    },
  });

  useState(() => {
    console.log("load user pet");
    loadPet();
    console.log("PetScreen", pet);
  });

  const ref = React.useRef<ICarouselInstance>(null);
  const width = Dimensions.get("window").width;
  const progress = useSharedValue<number>(0);

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Pet Postcards</Text>
      </View>

      <View style={styles.scrollContainer}>
        {/* Pet Info */}
        <View style={styles.petInfoContainer}>
          <View style={styles.petInfo}>
            <Image
              source={require("@/assets/images/pet profile.png")}
              style={styles.avatar}
            />
            <View style={styles.avatarDescription}>
              <Text style={styles.petName}>{pet?.name}</Text>
              <Text style={styles.personality}>{pet?.personality}</Text>
              <Text style={styles.textLine}>{pet?.hunger}</Text>
              <Text style={styles.level}>{pet?.level}</Text>
              {/*<Text style={styles.textLine}>Pet's Working Style</Text>
              <Text style={styles.textLine}>Pet's Current Planet</Text>*/}
            </View>
          </View>
        </View>

        {/*/!* Hall of Fame *!/*/}
        {/*<View style={styles.sectionBox}>*/}
        {/*  <Text style={styles.sectionTitle}>Hall of Fame</Text>*/}
        {/*  <Text style={styles.subText}>this will have all badges, from travel et</Text>*/}
        {/*  <TouchableOpacity style={styles.rowEnd} onPress={() => router.push('./(tabs)/insights')}>*/}
        {/*    <Text style={styles.linkText}>View Insights</Text>*/}
        {/*    <Ionicons name="arrow-forward" size={16} />*/}
        {/*  </TouchableOpacity>*/}
        {/*</View>*/}

        {/* Tip of the Day */}
        {/*<View style={styles.sectionBox}>*/}
        {/*  <Text style={styles.sectionTitle}>Tip of the day</Text>*/}
        {/*</View>*/}

        {/* Mood Tracker */}
        {/*<View style={styles.sectionBox}>*/}
        {/*  <Text style={styles.sectionTitle}>Mood Tracker</Text>*/}
        {/*  <View style={styles.grid}>*/}
        {/*    {Array.from({ length: 30 }).map((_, idx) => (*/}
        {/*        <View key={idx} style={styles.dotBox}>*/}
        {/*          <View style={styles.dot} />*/}
        {/*        </View>*/}
        {/*    ))}*/}
        {/*  </View>*/}
        {/*</View>*/}

        {/* Travel Unlock */}
        {/*<View style={styles.sectionBox}>*/}
        {/*  <Text style={styles.sectionTitle}>Unlock something by travelling</Text>*/}
        {/*  <TouchableOpacity style={styles.rowEnd} onPress={() => router.push('../Travel')}>*/}
        {/*    <Text style={styles.linkText}>Travel</Text>*/}
        {/*    <Ionicons name="arrow-forward" size={16} />*/}
        {/*  </TouchableOpacity>*/}
        {/*</View>*/}

        <View style={styles.postcards}>
          <Text style={styles.postcardsTitle}>Postcards</Text>
          <Carousel
            ref={ref}
            width={width - 20}
            data={postCardImgs}
            autoPlayInterval={2000}
            pagingEnabled={true}
            snapEnabled={true}
            style={{
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              paddingTop: 100,
            }}
            mode={"vertical-stack"}
            modeConfig={{
              snapDirection: "left",
              stackInterval: -35,
              opacityInterval: 0,
            }}
            customConfig={() => ({ type: "positive", viewCount: 5 })}
            renderItem={({ index, item }) => (
              <FlipCard
                style={{ flexDirection: "row" }}
                flipHorizontal={true}
                flipVertical={false}
                friction={8}
                perspective={1000}
                useNativeDriver={true}
              >
                {/* Face Side */}
                <View style={styles.face}>
                  <Image
                    style={styles.faceImg}
                    source={item.frontUrl}
                    key={"postcard-" + index}
                  ></Image>
                </View>
                {/* Back Side */}
                <View style={styles.back}>
                  <Image
                    style={styles.backImg}
                    source={item.backUrl}
                    key={"postcard-" + index}
                  />
                </View>
              </FlipCard>
            )}
            loop={false}
          />
          <Carousel
              ref={ref}
              width={width - 20}
              data={postCardImgs}
              autoPlayInterval={2000}
              pagingEnabled={true}
              snapEnabled={true}
              style={{
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                paddingTop: 100
              }}
              mode={"vertical-stack"}
              modeConfig={{
                snapDirection: "left",
                stackInterval: -35,
                opacityInterval: 0
              }}
              customConfig={() => ({ type: "positive", viewCount: 5 })}
              renderItem={({index, item}) => (
                  <FlipCard style={{flexDirection: 'row'}} flipHorizontal={true} flipVertical={false} friction={8} perspective={1000} useNativeDriver={true}>
                    {/* Face Side */}
                    <View style={styles.face}>
                      <Image style={styles.faceImg} source={item.frontUrl} key={"postcard-"+index}></Image>
                    </View>
                    {/* Back Side */}
                    <View style={styles.back}>
                      <Image style={styles.backImg} source={item.backUrl} key={"postcard-"+index}/>
                    </View>
                  </FlipCard>
              )}
              loop={false}
          />
          {/*<FlatList*/}
          {/*    data={postCardImgs}*/}
          {/*    renderItem={(item) => (*/}
          {/*          <FlipCard style={{flexDirection: 'row'}} flipHorizontal={true} flipVertical={false} friction={8} perspective={1000} useNativeDriver={true}>*/}
          {/*            /!* Face Side *!/*/}
          {/*            <View style={{width: '100%'}}>*/}
          {/*              <Image style={styles.faceImg} source={item.item.frontUrl} key={"postcard-"+item.index}></Image>*/}
          {/*            </View>*/}
          {/*            /!* Back Side *!/*/}
          {/*            <View style={styles.back}>*/}
          {/*              <Image style={styles.backImg} source={item.item.backUrl} key={"postcard-"+item.index}/>*/}
          {/*              </View>*/}
          {/*          </FlipCard>*/}
          {/*        )*/}
          {/*    }*/}
          {/*    numColumns={1}*/}
          {/*    keyExtractor={(item) => item.unlockScore.toString()}*/}
          {/*    style={{margin: 10, marginBottom: Dimensions.get('window').height * 0.6}}*/}
          {/*>*/}
          {/*</FlatList>*/}
        </View>
      </View>
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
    height: Dimensions.get("window").height * 0.25,
    borderWidth: 1,
    borderColor: "#00000069",
  },
  backImg: {
    alignSelf: "center",
    marginVertical: 8,
    backgroundColor: "white",
    aspectRatio: 3 / 2,
    height: Dimensions.get("window").height * 0.25,
    borderWidth: 1,
    borderColor: "#00000069",
  },
});
