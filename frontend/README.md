# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Test on Mobiles via Expo go

1. Install Expo Go on your mobile
2. Run the project through Expo module
3. Switch to Expo Go mode
   ```bash
   Press 's' to enter Expo Go
   ```
4. Enter EAS account (the account for Expo.dev) in the IDE. This step might take a while.
5. Open your mobile and scan the QR code to see the preview.

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## File Structure

```
frontend/
├── .env
├── app/ # Main routing & screen entry points
│ ├── (tabs)/ # Tab-based layout routing
│ │ ├── _layout.tsx # Root layout for tab navigation
│ │ ├── explore.tsx # Tab: Explore
│ │ ├── index.tsx # Tab: Home (default route)
│ │ ├── pet.tsx # Tab: Pet system
│ │ ├── tasks.tsx # Tab: Task manager
│ │ └── Travel.tsx # Tab: Travel reward system
│ │
│ ├── auth/ # Authentication screens
│ │ ├── sign-in.tsx
│ │ └── sign-up.tsx
│ │
│ ├── main/ # Primary pages in the app
│ │ ├── AddTasks.tsx
│ │ ├── Insights.tsx
│ │ ├── Kitchen.tsx
│ │ └── MoodCheck.tsx
│ │
│ ├── onboarding/ # wip pages
│ └── +not-found.tsx # Fallback route for unknown paths
│
├── assets/ # Static assets (images, fonts, etc.)
│ ├── fonts/
│ └── images/
│
├── components/ # Reusable visual UI components
│ ├── ui/
│ │ ├── Collapsible.tsx # Expand/collapse UI component
│ │ ├── ExternalLink.tsx # Safe external URL handling
│ │ ├── HapticTab.tsx # Haptic tab button wrapper
│ │ ├── HelloWave.tsx # Greeting animation
│ │ ├── ParallaxScrollView.tsx # Custom scroll experience
│ │ ├── ThemedText.tsx # Text with theme adaptation
│ │ └── ThemedView.tsx # View wrapper with theming
│ └── topbar.tsx # Topbar with dynamic title/theme
│
├── constants/ # Constant values (e.g. color theme)
│ └── Colors.ts
│
├── hooks/ # Custom React hooks
│ ├── useColorScheme.ts
│ ├── useColorScheme.web.ts
│ └── useThemeColor.ts
│
├── node_modules/ # Installed dependencies (auto-generated)
├── .gitignore # Files/directories to exclude from Git
├── app.json # Expo configuration
├── eas.json # EAS (Expo Application Services) build config
├── eslint.config.js # Linting rules
├── expo-env.d.ts # Type declarations for Expo env
├── package.json # Project metadata and dependencies
├── package-lock.json # Locked dependency versions
├── tsconfig.json # TypeScript configuration
└── README.md # You are here
```

## Test on Android via development build

A React Native app consists of two parts: the JavaScript bundle and the native app.
The JavaScript bundle (`npx expo start`) contains app's UI code and business logic are and it can be live reloaded during development.
The native app contains all of the app's native code and requires a build and signature before being installed on an Android device. Every time a new library with native code is added to the app, a native app has to be rebuilt and re-installed.

### Difference between Expo Go and development builds

Expo Go is a native app that comes with a number of native libraries so that developers can easily update their app's JavaScript code on their local machine and see the changes on Expo Go. It cannot be modified, meaning you can only rely on the native code and tools that exist in Expo Go when it was uploaded to the app store.
This means that when we try use Expo Go to test our app and add a library that is not included in [this file](https://github.com/expo/expo/blob/main/apps/expo-go/package.json#L23), the app will hot-reload and immediately run into errors, because it cannot find the package.

If we want to develop and test other libraries (e.g. rive-react-native), we instead have to use a development build. This allows adding any native libraries as well as see changes to the app icon, name and splash screen.

There are two main ways of creating a development build with Expo:

- Build on EAS (easiest way, can be done remotely)
- Build on your local machine (more set-up required)

Both Expo Go and development builds require a development server to be running.

### Build on EAS

Sources:

- https://docs.expo.dev/build/setup/
- https://docs.expo.dev/develop/development-builds/create-a-build/

EAS Build is a service hosted by Expo for building app binaries for your Expo and React Native projects. You will need an [Expo user account](https://expo.dev/signup) to use EAS Build.

#### Log in to your Expo account

`eas login`

#### Run an android build

`eas build --platform android --profile development`

This process will take a long time (up to an hour) because in the free plan of EAS, we will usually have to wait in a queue.

#### Deploy the build

Once the build has finished, the Expo page of the organisation will be updated and your terminal will show a QR code and link to the APK file. Now, you can download the apk and install the native app. Once you have downloaded this app, start a local development server with `npx expo start` and connect your Android device to the same local network.
Once you have a development build installed, you do not need to reinstall it until you add a new library that is not already included in Expo Go.

### Build on your local machine

This process takes more time to prepare but is much faster once it is set up (on my laptop, it takes up to 15 minutes). It requires installing Android Studio, to get the Android SDK and Android Debug Bridge, and Java.

#### Start the ADB server

`adb start-server`

Note: the terminal should respond with a message like "\* daemon not running; starting now at tcp:5037 - daemon started successfully". If not, try shutting down the server with `adb kill-server` and starting it again.

#### Build native Android project
Connect your Android device to build your project on and enable USB-debugging in the settings (activate developer mode first). Then run the following command: 
`npx expo run:android`

Alternatively, you can also use an emulator.
If there are no errors, the terminal should eventually display the path to the .apk file.

#### Deploy the build

You can then copy the .apk to your device and install it from there. Alternatively, you can also enable USB-debugging in the settings of your Android device (activate developer mode first), run `npx expo start` and press 'A' to let expo install the app automatically.

Note: if you the error message `Error: could not connect to TCP port 5562`, try restarting the adb server.
