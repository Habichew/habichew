// app/(tabs)/Profile.tsx
import React from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView, Switch,
} from "react-native";
import {useRouter} from "expo-router";
import {useUser} from "@/context/UserContext";
import BottomBar from "@/components/bottomBar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {Ionicons} from "@expo/vector-icons";
import {CacheHandler} from "@/context/CacheHandler";

/**
 * This component contains the Profile screen, which contains account settings as well as general app settings.
 * @category Frontend
 * @returns {ReactNode} A React element that renders the Profile screen.
 */
export default function ProfileScreen() {
    const router = useRouter();
    const {user, offlineMode, setOfflineMode, taskGeneration, setTaskGeneration} = useUser(); // use user data

    const navigateTo = (screen: string) => {
        router.push(`./profile-sub/${screen}`);
    };

    const handleLogout = async () => {
        // await AsyncStorage.clear();
        CacheHandler.clearUserCache();
        if (user) router.replace("../auth/sign-in");
        else router.replace("../auth/sign-up");

    };

    const handleDelete = () => {
        navigateTo("delete-account");
    };

    return (
        <>
            <ScrollView
                style={styles.container}
                contentContainerStyle={{paddingBottom: 100}}
            >
                {user ?
                    (<>
                        {/* Avatar & Name */}
                        <View style={styles.header}>
                            {/* <Image source={require('@/assets/images/purplecat.png')} style={styles.avatar} /> */}
                            <Text style={styles.name}>{user?.username || "Unknown User"}</Text>
                        </View>

                    </>)
                    : undefined}

                {/* Section: Settings */}
                <Text style={styles.sectionTitle}>Settings</Text>
                <ProfileItem
                    label="Offline Mode"
                    toggleButton={true}
                    toggleValue={offlineMode}
                    onPress={() => {
                        console.log('toggling offline mode');
                        setOfflineMode(!offlineMode);
                        CacheHandler.setOfflineMode(!offlineMode);
                    }
                    }
                />
                {/* Section: My Profile */}
                {user ?
                    (
                        <><Text style={styles.sectionTitle}>My Profile</Text><ProfileItem
                            label="Email"
                            value={user?.email || "no@email.com"}
                            onPress={() => navigateTo("email")}/><ProfileItem
                            label="Name"
                            value={user?.username || "No Name"}
                            onPress={() => navigateTo("name")}/><ProfileItem
                            label="Change psw"
                            onPress={() => navigateTo("change-psw")}/><ProfileItem label="Delete Account"
                                                                                   onPress={handleDelete}/></>
                    ) : undefined}

                {/* Section: Support */}
                <Text style={styles.sectionTitle}>Support</Text>
                <ProfileItem
                    label="Send Feedback"
                    onPress={() => navigateTo("send-feedback")}
                />
                <ProfileItem label="FAQs" onPress={() => navigateTo("faqs")}/>
                <ProfileItem label="About Us" onPress={() => navigateTo("about-us")}/>
                <ProfileItem label="Policy" onPress={() => navigateTo("policy")}/>

                {/* Clear cache button */}
                <TouchableOpacity style={styles.clearCacheBtn} onPress={() => CacheHandler.clearUserCache()}>
                    <Text style={styles.clearCacheText}>Clear Cache</Text>
                </TouchableOpacity>

                {/* Sign out/in button */}
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Sign {user ? "Out" : "Up"}</Text>
                </TouchableOpacity>
            </ScrollView>
        </>
    );
}

function ProfileItem({
                         label,
                         value,
                         toggleButton,
                         onPress,
                         toggleValue
                     }: {
    label: string,
    value?: string,
    toggleButton?: boolean,
    onPress: () => void,
    toggleValue?: boolean
}) {
    return (
        <TouchableOpacity onPress={toggleButton ? onPress : undefined} style={styles.item}>
            <View>
                <Text style={styles.label}>{label}</Text>
                {value && <Text style={styles.value}>{value}</Text>}
            </View>
            {toggleButton ?
                <View>
                    <Switch
                        trackColor={{false: '#767577', true: '#D9D9D9'}}
                        thumbColor={toggleValue ? '#DAB7FF' : '#f4f3f4'}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={onPress}
                        value={toggleValue}
                    />
                </View>
                :
                <>
                    <Ionicons name={"chevron-forward-outline"}></Ionicons>
                    {/*<Text style={styles.arrow}>{">"}</Text>*/}
                </>
            }

        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 50,
        paddingHorizontal: 24,
        paddingBottom: 20,
        backgroundColor: "#fff",
        marginBottom: 80,
    },
    header: {
        alignItems: "center",
        marginBottom: 15,
    },
    avatar: {
        width: 60,
        height: 60,
        resizeMode: "contain",
        marginBottom: 12,
    },
    name: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#000",
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "bold",
        marginTop: 20,
        marginBottom: 8,
        color: "#D9D9D9",
    },
    item: {
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    label: {
        fontSize: 15,
        color: "#000",
    },
    value: {
        fontSize: 13,
        color: "#888",
        marginTop: 4,
    },
    arrow: {
        fontSize: 18,
        color: "#888",
    },
    logoutBtn: {
        marginTop: 15,
        backgroundColor: "black",
        paddingVertical: 14,
        borderRadius: 24,
        alignItems: "center",
    },
    logoutText: {
        fontSize: 16,
        color: "white",
        fontWeight: "bold",
    },
    clearCacheBtn: {
        marginTop: 15,
        backgroundColor: "#D9D9D9",
        paddingVertical: 14,
        borderRadius: 24,
        alignItems: "center"
    },
    clearCacheText: {
        fontSize: 16,
        color: "black",
        fontWeight: "bold",
    }
});
