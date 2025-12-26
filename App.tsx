import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { AuthProvider } from "./src/context/AuthProvider";
import { NetworkProvider } from "./src/context/NetworkProvider";
import { store } from "./src/redux/MyStore";
import MySplashScreen from "./src/screens/AuthScreen/SplashScreen";
import { Provider } from "react-redux";
import RootNavigator from "./src/navigation/RootNavigator";

function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <NetworkProvider>
            <Provider store={store}>
              <BottomSheetModalProvider>
                <AppContent />
              </BottomSheetModalProvider>
            </Provider>
          </NetworkProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();
  const [appReady, setAppReady] = useState(false);

  if (!appReady) {
    return <MySplashScreen onAnimationComplete={() => setAppReady(true)} />;
  }
  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: safeAreaInsets.bottom,
        },
      ]}
    >
      <RootNavigator />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
