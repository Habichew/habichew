import React, {useContext, useRef, useState} from 'react';
import { useRouter } from 'expo-router';
import { Text } from 'react-native-paper';
import {ScaledSheet} from 'react-native-size-matters';
import {Animated, Dimensions, Image, View} from 'react-native';
import {useUser} from "@/app/context/UserContext";
import {ImageBackground, useImage} from "expo-image";

type PostcardProps = {
    // title: string;
    unlockScore: number;
    // story: string;
    // img: NodeRequire;
    // cardsPanResponder: any;
    // cardsPan: any;
    // viewStyle: any;
    source: any;
};

export default function Postcard(props: PostcardProps) {
    console.log('blur?', props.unlockScore);

    return (
        <>
            <ImageBackground source={props.source} style={styles.postcardImg} imageStyle={{borderRadius: 30, borderWidth: 2, borderColor: '#bbb' }} blurRadius={1000 < props.unlockScore ? 50 : 0}>
                {1000 < props.unlockScore ? <View style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center'}}>
                    <Text style={{fontSize: 30}}>?</Text>
                </View> : null}

            </ImageBackground>
        </>
    );
}

const styles = ScaledSheet.create({
    postcard: { position: 'absolute', marginVertical: -500, backgroundColor: 'white',  borderRadius: 20},
    cardHeader: {},
    cardTitle: {},
    story: {color: 'black', fontSize: 16, height: 100},
    cardBody: {height: 100, padding: 10},
    cardContent: {height: 100},
    score: {},
    postcardImg: {
        margin: 2,
        borderRadius: 30,
        backgroundColor: 'white',
        width: Dimensions.get('window').width / 4,
        height: Dimensions.get('window').width / 4,
    },
});

