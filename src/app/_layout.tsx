import { Stack } from 'expo-router';
import { CartProvider } from '../context/CartContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.host}>
      <SafeAreaProvider>
        <CartProvider>
          <View style={styles.host}>
            <Stack screenOptions={{ headerShown: false }} />
          </View>
        </CartProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  host: {
    flex: 1,
  },
});