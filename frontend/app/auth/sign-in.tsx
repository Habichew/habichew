import {ActivityIndicator, Alert, Platform, StyleSheet, Text, TouchableOpacity, View,} from "react-native";
import {useEffect, useState} from "react";
import {useRouter} from "expo-router";
import CustomInput from "@/components/ui/input";
import {User, useUser} from "../../context/UserContext";
import {useSafeAreaInsets} from "react-native-safe-area-context";
// import AsyncStorage from '@react-native-async-storage/async-storage';
import {MMKV, Mode, useMMKVString} from 'react-native-mmkv';
import {CacheHandler} from "@/context/CacheHandler";

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setUser } = useUser();
  const [focusedInput, setFocusedInput] = useState<"email" | "password" | null>(
    null,
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState('');
  const isFormValid = email && password;
  const insets = useSafeAreaInsets();
  // const [user, setUser] = useMMKVString('user');
  const {
    synchronise
  } = useUser();

  useEffect(() => {
    async function login() {

      const response = await fetch(
        process.env.EXPO_PUBLIC_BACKEND_URL + "/users/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        },
      );

      console.log('Received login response!');


      const logicStartTime = performance.now();
      console.log('前端逻辑处理开始时间:', logicStartTime);

      const data = await response.json();

      if (response.ok) {
        const loggedInUser = data[0];
        setUser(loggedInUser); //save user data for global use
        console.log("check signed in user", loggedInUser.email);
        // TODO: synchronise offline storage and server
        await synchronise();
        CacheHandler.saveUser(loggedInUser);

        router.replace("../(tabs)/home");
      } else {
        Alert.alert("Login Failed", data.message || "Invalid password or username");
      }
    }

    async function skipLoginIfUserCached() {
      // const cachedUser = await AsyncStorage.getItem("user");
      console.log('reading from local storage');
      const cachedUser: User | null = CacheHandler.loadUser();
      console.log('cached user', cachedUser);
      if (cachedUser !== undefined) {
        // set user to cached user
        setUser(cachedUser);
        router.replace("../(tabs)/home");
      }
    }

    if (Platform.OS === 'android') skipLoginIfUserCached();
  }, []);

  const handleSignIn = async () => {
    if (email && password) {
      try {
        setLoading(true);
        setStatusMessage('Entering Login');

        const networkStartTime = performance.now();
        console.log('--- Login Begin ---');
        console.log('API request start at: ', networkStartTime);

        const response = await fetch(
          process.env.EXPO_PUBLIC_BACKEND_URL + "/users/login",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
          },
        );

        const networkEndTime = performance.now();
        const networkTime = networkEndTime - networkStartTime;
        console.log('API request end at:', networkEndTime);
        console.log(`API request costs: ${networkTime.toFixed(2)} ms in total`);

        const logicStartTime = performance.now();
        console.log('Frontend logic start at:', logicStartTime);

        const data = await response.json();

        if (response.ok) {
          const loggedInUser = data[0];
          setUser(loggedInUser); //save user data for global use
          CacheHandler.saveUser(loggedInUser);
          router.replace("../(tabs)/home");
        } else {
          Alert.alert("Login Failed", data.message || "Invalid credentials");
        }
        const logicEndTime = performance.now();
        const logicTime = logicEndTime - logicStartTime;
        console.log('Frontend logic end at: ', logicEndTime);
        console.log(`Frontend logic cost: ${logicTime.toFixed(2)} ms in total`);

        // Record total cost of login process
        const totalTime = logicEndTime - networkStartTime;
        console.log(`Total cost: ${totalTime.toFixed(2)} ms`);
        console.log('--- Login end ---');

        setStatusMessage('Login successful');
        setLoading(false);
      } catch (error) {
        Alert.alert(
          "Error",
          "Failed to connect to the server " +
            process.env.EXPO_PUBLIC_BACKEND_URL +
            " " +
            error,
        );
        setLoading(false);
      }
    } else {
      Alert.alert("Missing input", "Please enter email and password");
    }
  };

  return (
    <View style={[styles.screen, {marginTop: -insets.top}]}>
      <View style={styles.purpleBackground}>
        <Text style={styles.title}>Welcome back,{"\n"}ready to continue?</Text>
        <CustomInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
        />
        <CustomInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={true}
        />
        {/* <TouchableOpacity>
        <Text style={styles.link}>Forgot password?</Text>
      </TouchableOpacity> */}
      </View>

      <TouchableOpacity
        style={[
          styles.signInButton,
          { opacity: isFormValid && !loading ? 1 : 0.6 },
        ]}
        onPress={handleSignIn}
        disabled={loading || !isFormValid}
      >
        {loading ? (
          <ActivityIndicator size={"small"} />
        ) : (
          <Text style={styles.signInText}>Sign In</Text>
        )}
      </TouchableOpacity>

      {/*<Text style={styles.orText}>OR LOG IN WITH</Text>*/}

      {/*<View style={styles.iconRow}>*/}
      {/*  <FontAwesome name="google" size={24} color="#555" />*/}
      {/*  <FontAwesome name="apple" size={24} color="#555" style={styles.icon} />*/}
      {/*  <FontAwesome*/}
      {/*    name="facebook"*/}
      {/*    size={24}*/}
      {/*    color="#555"*/}
      {/*    style={styles.icon}*/}
      {/*  />*/}
      {/*</View>*/}

      <TouchableOpacity onPress={() => router.push("/auth/sign-up")} style={{marginTop: 20}}>
        <Text style={styles.link}>
          Don&#39;t have an account?{" "}
          <Text style={{ fontWeight: "bold" }}>Sign up</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  purpleBackground: {
    width: "100%",
    backgroundColor: "#DAB7FF",
    paddingBottom: 40,
    paddingTop: 200,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    alignItems: "center",
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    marginBottom: 32,
  },
  signInButton: {
    backgroundColor: "#1CC282",
    paddingVertical: 14,
    paddingHorizontal: 60,
    borderRadius: 25,
    marginTop: 40,
  },
  signInText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
  link: {
    color: "#444",
    textAlign: "center",
    marginVertical: 8,
  },
  orText: {
    textAlign: "center",
    color: "#999",
    marginBottom: 20,
    marginTop: 30,
  },
  iconRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginBottom: 24,
  },
  icon: {
    marginLeft: 20,
  },
  inputFocused: {
    backgroundColor: "#f0f0f0",
  },
});
