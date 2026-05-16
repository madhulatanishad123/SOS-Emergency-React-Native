import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Shield, Mail, Lock, ArrowRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { API_URL } from '../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const { colors } = useTheme();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { token, user } = response.data;
      
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userId', user.id);
      await AsyncStorage.setItem('userName', user.name);
      
      navigation.replace('Home');
    } catch (error) {
      let errorMessage = 'Something went wrong. Please try again.';
      
      if (error.response) {
        // Server responded with a status code outside the 2xx range
        errorMessage = error.response.data?.message || `Server Error: ${error.response.status}`;
      } else if (error.request) {
        // Request was made but no response was received
        errorMessage = 'Network Error: Cannot reach the server. Please check your internet connection and ensure the backend is running.';
        console.log('Network Error Details:', error.request);
      } else {
        // Something happened in setting up the request
        errorMessage = error.message;
      }
      
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    title: {
      color: colors.text,
      fontSize: 28,
      fontWeight: '800',
    },
    subtitle: {
      color: colors.textSecondary,
      marginTop: 10,
      fontSize: 16,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 15,
    },
    input: {
      flex: 1,
      height: 60,
      color: colors.text,
      fontSize: 16,
    },
    loginBtn: {
      height: 60,
      backgroundColor: colors.primary,
      borderRadius: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      marginTop: 20,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 5,
    },
    footerText: {
      color: colors.textSecondary,
    },
    signUpText: {
      color: colors.primary,
      fontWeight: '700',
    },
    forgotPassText: {
      color: colors.primary,
      fontWeight: '600',
    }
  });

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={[styles.logoCircle, { backgroundColor: colors.primary, shadowColor: colors.primary }]}>
            <Shield size={40} color="white" />
          </View>
          <Text style={dynamicStyles.title}>Welcome Back</Text>
          <Text style={dynamicStyles.subtitle}>Sign in to stay protected</Text>
        </View>

        <View style={styles.form}>
          <View style={dynamicStyles.inputContainer}>
            <Mail size={20} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={dynamicStyles.input}
              placeholder="Email Address"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={dynamicStyles.inputContainer}>
            <Lock size={20} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={dynamicStyles.input}
              placeholder="Password"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={styles.forgotPass}>
            <Text style={dynamicStyles.forgotPassText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={dynamicStyles.loginBtn} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text style={styles.loginBtnText}>Sign In</Text>
                <ArrowRight size={20} color="white" />
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={dynamicStyles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={dynamicStyles.signUpText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 5,
  },
  form: {
    gap: 20,
  },
  inputIcon: {
    marginRight: 12,
  },
  forgotPass: {
    alignSelf: 'flex-end',
  },
  loginBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
  },
});

export default LoginScreen;
