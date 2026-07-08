import 'react-native-get-random-values';
import { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SecureStore from 'expo-secure-store';
import OnboardingScreen from './screens/OnboardingScreen';
import HomeScreen from './screens/HomeScreen';
import ImportScreen from './screens/ImportScreen';
import SendScreen from './screens/SendScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [hasWallet, setHasWallet] = useState(null);

  useEffect(() => {
    checkWallet();
  }, []);

  const checkWallet = async () => {
    const mnemonic = await SecureStore.getItemAsync('mnemonic');
    setHasWallet(!!mnemonic);
  };

  if (hasWallet === null) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#0B0B0F' }, headerTintColor: '#fff' }}>
        {hasWallet ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Efikcoin Wallet' }} />
            <Stack.Screen name="Send" component={SendScreen} options={{ title: 'Send EFC' }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Import" component={ImportScreen} options={{ title: 'Import Wallet' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
