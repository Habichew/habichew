import React, { useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
} from "react-native";
import { useUser } from "@/context/UserContext";
import { ScaledSheet } from "react-native-size-matters";

import FlipCard from "react-native-flip-card";
import Postcard from "@/components/ui/Postcard";
import Carousel, {
  ICarouselInstance,
} from "react-native-reanimated-carousel";
import { Image } from 'expo-image';

export default function PetScreen(this: any) {
  const { pet, loadPet } = useUser(); // use user data
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
              <Text style={styles.textLine}>{pet?.hunger}</Text>
              <Text style={styles.level}>{pet?.level}</Text>
            </View>
          </View>
        </View>

        <View style={styles.postcards}>
          <Text style={styles.postcardsTitle}>Postcards</Text>

          <View style={{marginBottom: 30}}>
            <View style={{flexDirection: 'row', justifyContent: 'space-evenly', marginHorizontal: 20, marginBottom: 10}}>
              <Postcard source={postCardImgs[0].frontUrl} unlockScore={postCardImgs[0].unlockScore} />
              <Postcard source={postCardImgs[1].frontUrl} unlockScore={postCardImgs[1].unlockScore} />
              <Postcard source={postCardImgs[2].frontUrl} unlockScore={postCardImgs[2].unlockScore} />
            </View>
            <View style={{flexDirection: 'row', justifyContent: 'space-evenly', marginHorizontal: 20, marginBottom: 10}}>
              <Postcard source={postCardImgs[3].frontUrl} unlockScore={postCardImgs[3].unlockScore} />
              <Postcard source={postCardImgs[4].frontUrl} unlockScore={postCardImgs[4].unlockScore} />
              <Postcard source={postCardImgs[5].frontUrl} unlockScore={postCardImgs[5].unlockScore} />
            </View>
            <View style={{flexDirection: 'row', justifyContent: 'space-evenly', marginHorizontal: 20}}>
              <Postcard source={postCardImgs[6].frontUrl} unlockScore={postCardImgs[6].unlockScore} />
              <Postcard source={postCardImgs[7].frontUrl} unlockScore={postCardImgs[7].unlockScore} />
              <Postcard source={postCardImgs[8].frontUrl} unlockScore={postCardImgs[8].unlockScore} />
            </View>
          </View>

          <Carousel
              ref={ref}
              width={width}
              data={postCardImgs.filter((item, index) => {
                if (item.unlockScore < 1000) return item;
              }).reverse()}
              pagingEnabled={true}
              snapEnabled={true}
              style={{
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                paddingTop: 50,
                top: 0,
                marginBottom: Dimensions.get('window').height * 0.5
              }}
              mode={"vertical-stack"}
              modeConfig={{
                snapDirection: "left",
                stackInterval: -10,
                opacityInterval: 0
              }}
              customConfig={() => ({ type: "positive", viewCount: 5 })}
              renderItem={({index, item}) => (
                  <FlipCard style={{flexDirection: 'row', width: '100%'}} flipHorizontal={true} flipVertical={false} friction={8} perspective={2000} useNativeDriver={true}>
                    {/* Face Side */}
                    <View style={styles.face}>
                      <Image style={[styles.faceImg]} source={item.frontUrl} key={"postcard-"+index}></Image>
                    </View>
                    {/* Back Side */}
                    <View style={styles.back}>
                      <Image style={styles.backImg} source={item.backUrl} key={"postcard-"+index}/>
                    </View>
                  </FlipCard>
              )}
              loop={false}
          />
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
});
