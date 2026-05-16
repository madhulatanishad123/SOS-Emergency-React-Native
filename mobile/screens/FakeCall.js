import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Phone, PhoneOff, User, MessageSquare } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';

const FakeCall = () => {
  const [status, setStatus] = useState('incoming'); // incoming, active, ended
  const [seconds, setSeconds] = useState(0);
  const navigation = useNavigation();
  const { colors, isDarkMode } = useTheme();

  useEffect(() => {
    let interval;
    if (status === 'active') {
      interval = setInterval(() => setSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [status]);

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: 'space-between',
      paddingVertical: 60,
    },
    callerName: {
      color: colors.text,
      fontSize: 28,
      fontWeight: '600',
    },
    callStatus: {
      color: colors.textSecondary,
      fontSize: 16,
      marginTop: 8,
    },
    avatarContainer: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: colors.card,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    iconCircle: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.surfaceLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
    },
    iconLabel: {
      color: colors.text,
      fontSize: 12,
    }
  });

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <View style={styles.topSection}>
        <View style={dynamicStyles.avatarContainer}>
          <User size={60} color={colors.textSecondary} />
        </View>
        <Text style={dynamicStyles.callerName}>Mom ❤️</Text>
        <Text style={dynamicStyles.callStatus}>
          {status === 'incoming' ? 'Mobile' : status === 'active' ? formatTime(seconds) : 'Call Ended'}
        </Text>
      </View>

      {status === 'incoming' && (
        <View style={styles.middleSection}>
          <View style={styles.utilityIcon}>
            <View style={dynamicStyles.iconCircle}>
              <MessageSquare size={24} color={colors.text} />
            </View>
            <Text style={dynamicStyles.iconLabel}>Message</Text>
          </View>
          <View style={styles.utilityIcon}>
            <View style={dynamicStyles.iconCircle}>
              <PhoneOff size={24} color={colors.text} />
            </View>
            <Text style={dynamicStyles.iconLabel}>Remind Me</Text>
          </View>
        </View>
      )}

      <View style={styles.bottomSection}>
        {status === 'incoming' ? (
          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={[styles.callBtn, { backgroundColor: colors.primary }]}
              onPress={() => { setStatus('ended'); setTimeout(() => navigation.goBack(), 1000); }}
            >
              <PhoneOff size={30} color="#fff" style={{ transform: [{ rotate: '135deg' }] }} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.callBtn, { backgroundColor: colors.success }]}
              onPress={() => setStatus('active')}
            >
              <Phone size={30} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={[styles.callBtn, { backgroundColor: colors.primary }]}
            onPress={() => { setStatus('ended'); setTimeout(() => navigation.goBack(), 1000); }}
          >
            <PhoneOff size={30} color="#fff" style={{ transform: [{ rotate: '135deg' }] }} />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  topSection: {
    alignItems: 'center',
  },
  middleSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  utilityIcon: {
    alignItems: 'center',
  },
  bottomSection: {
    alignItems: 'center',
    width: '100%',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 40,
  },
  callBtn: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    alignItems: 'center',
    justifyContent: 'center',
  }
});

export default FakeCall;
