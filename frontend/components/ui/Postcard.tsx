import React from 'react';
import { Text } from 'react-native-paper';
import { ScaledSheet } from 'react-native-size-matters';
import {
    Dimensions,
    View,
    TouchableOpacity, Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ImageBackground } from 'expo-image';
import {PlatformPressable} from "@react-navigation/elements";
import * as Haptics from "expo-haptics";

type PostcardProps = {
    unlockScore: number;
    isUnlocked: boolean;
    source: any;
    onPress?: () => void; // Allows clickable postcards, zoom and flip
};

export default function Postcard(props: PostcardProps) {
    return (
        <View style={{borderRadius: 30, borderWidth: 1, borderColor: '#00000050', overflow: 'hidden'}}>
            <PlatformPressable
                pressOpacity={0.9}
                disabled={!props.isUnlocked} // Clickable when it's unlocked
                onPress={() => {props.onPress?.()}} // Safely called
                onPressIn={() => {if (props.isUnlocked) Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Gesture_Start)}}
                pressColor={'#00000030'}
                android_disableSound={!props.isUnlocked}
                android_ripple={props.isUnlocked ? {borderless: true, foreground: true} : undefined}
            >
                <ImageBackground
                    source={props.source}
                    style={styles.postcardImg}
                    imageStyle={{
                        borderRadius: 30,
                        borderWidth: 2,
                        borderColor: '#bbb',
                    }}
                    blurRadius={props.isUnlocked ? 0 : 60}
                >
                    {!props.isUnlocked && (
                        <View
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <Ionicons name="lock-closed" size={20} color="#333" margin={5} />
                            <Text style={styles.unlockedCredit}>{props.unlockScore}</Text>
                        </View>
                    )}
                </ImageBackground>
            </PlatformPressable>
        </View>
    );
}

const styles = ScaledSheet.create({
    postcard: {
        position: 'absolute',
        marginVertical: -500,
        backgroundColor: 'white',
        borderRadius: 20,
    },
    cardHeader: {},
    cardTitle: {},
    story: { color: 'black', fontSize: 16, height: 100 },
    cardBody: { height: 100, padding: 10 },
    cardContent: { height: 100 },
    score: {},
    postcardImg: {
        margin: 2,
        borderRadius: 30,
        backgroundColor: 'white',
        width: Dimensions.get('window').width / 4,
        height: Dimensions.get('window').width / 4,
    },
    unlockedCredit: {
        fontSize: 12,
        fontWeight: '600',
        color: 'black',
    },
});
