import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Mail, Lock, Phone, ArrowRight, Shield } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { API_URL } from '../constants';
import { useTheme } from '../context/ThemeContext';

const RegisterScreen = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const { colors } = useTheme();

  const handleRegister = async () => {
    const { name, email, password, phone } = formData;
    if (!name || !email || !password || !phone) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/register`, formData);
      Alert.alert('Success', 'Account created successfully!', [
        { text: 'Login Now', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (error) {
      Alert.alert('Registration Failed', error.response?.data?.message || 'Something went wrong');
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
      fontSize: 26,
      fontWeight: '800',
    },
    subtitle: {
      color: colors.textSecondary,
      marginTop: 8,
      fontSize: 15,
    },
    registerBtn: {
      height: 60,
      backgroundColor: colors.primary,
      borderRadius: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      marginTop: 15,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 5,
    },
    footerText: {
      color: colors.textSecondary,
    },
    loginText: {
      color: colors.primary,
      fontWeight: '700',
    }
  });

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoContainer}>
          <View style={[styles.logoCircle, { backgroundColor: colors.primary }]}>
            <Shield size={40} color="white" />
          </View>
          <Text style={dynamicStyles.title}>Create Account</Text>
          <Text style={dynamicStyles.subtitle}>Join us for real-time protection</Text>
        </View>

        <View style={styles.form}>
          <Input 
            icon={<User size={20} color={colors.textSecondary} />} 
            placeholder="Full Name"
            colors={colors}
            value={formData.name}
            onChangeText={(v) => setFormData({...formData, name: v})}
          />
          <Input 
            icon={<Mail size={20} color={colors.textSecondary} />} 
            placeholder="Email Address"
            colors={colors}
            keyboardType="email-address"
            value={formData.email}
            onChangeText={(v) => setFormData({...formData, email: v})}
          />
          <Input 
            icon={<Phone size={20} color={colors.textSecondary} />} 
            placeholder="Phone Number"
            colors={colors}
            keyboardType="phone-pad"
            value={formData.phone}
            onChangeText={(v) => setFormData({...formData, phone: v})}
          />
          <Input 
            icon={<Lock size={20} color={colors.textSecondary} />} 
            placeholder="Password"
            colors={colors}
            secureTextEntry
            value={formData.password}
            onChangeText={(v) => setFormData({...formData, password: v})}
          />

          <TouchableOpacity 
            style={dynamicStyles.registerBtn} 
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text style={styles.registerBtnText}>Create Account</Text>
                <ArrowRight size={20} color="white" />
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={dynamicStyles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={dynamicStyles.loginText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const Input = ({ icon, colors, ...props }) => (
  <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
    <View style={styles.inputIcon}>{icon}</View>
    <TextInput
      style={[styles.input, { color: colors.text }]}
      placeholderTextColor={colors.textSecondary}
      {...props}
    />
  </View>
);

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 30,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 70,
    height: 70,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  form: {
    gap: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 55,
    fontSize: 16,
  },
  registerBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
});

export default RegisterScreen;
