import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import HomeScreen from './screens/HomeScreen';
import SOSTriggered from './screens/SOSTriggered';
import FakeCall from './screens/FakeCall';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import VoiceSOS from './screens/VoiceSOS';
import ContactsScreen from './screens/ContactsScreen';
import SafetyTipsScreen from './screens/SafetyTipsScreen';
import SafeHavensScreen from './screens/SafeHavensScreen';
import HistoryScreen from './screens/HistoryScreen';
import ChatAssistant from './screens/ChatAssistant';
import SafetyMap from './screens/SafetyMap';
import { ThemeProvider, useTheme } from './context/ThemeContext';

const Stack = createStackNavigator();

function AppInner() {
  const { colors } = useTheme();
  
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{ 
          headerShown: false,
          cardStyle: { backgroundColor: colors.background }
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="SOSActive" component={SOSTriggered} />
        <Stack.Screen name="FakeCall" component={FakeCall} />
        <Stack.Screen name="VoiceSOS" component={VoiceSOS} />
        <Stack.Screen name="Contacts" component={ContactsScreen} />
        <Stack.Screen name="SafetyTips" component={SafetyTipsScreen} />
        <Stack.Screen name="SafeHavens" component={SafeHavensScreen} />
        <Stack.Screen name="History" component={HistoryScreen} />
        <Stack.Screen name="ChatAssistant" component={ChatAssistant} />
        <Stack.Screen name="SafetyMap" component={SafetyMap} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppInner />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
