import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Modal, TouchableWithoutFeedback, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Shield, Phone, Mic, Heart, Bell, User as UserIcon, Menu, X, LogOut, Settings, AlertTriangle, MapPin, Clock, MessageCircle, Sun, Moon } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Accelerometer } from 'expo-sensors';
import axios from 'axios';
import { API_URL } from '../constants';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation();
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const [userName, setUserName] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [aiStatus, setAiStatus] = useState({
    status: 'ANALYZING',
    color: '#a0a0a0',
    recommendation: 'AI is analyzing your environment...',
    score: 0
  });
  const [guardianModal, setGuardianModal] = useState({
    visible: false,
    message: ''
  });
  const [isGuarded, setIsGuarded] = useState(false);
  const [guardTimer, setGuardTimer] = useState(0);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const name = await AsyncStorage.getItem('userName');
        if (name) setUserName(name);
        const userId = await AsyncStorage.getItem('userId');
        if (userId) fetchAIStatus(userId);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    fetchUser();

    _subscribe();

    const statusInterval = setInterval(async () => {
      const userId = await AsyncStorage.getItem('userId');
      if (userId) fetchAIStatus(userId);
    }, 30000);

    const checkInInterval = setInterval(async () => {
      const userId = await AsyncStorage.getItem('userId');
      if (userId && !isGuarded) fetchAICheckIn(userId);
    }, 60000);

    return () => {
      if (statusInterval) clearInterval(statusInterval);
      if (checkInInterval) clearInterval(checkInInterval);
      _unsubscribe();
    };
  }, []);

  const _subscribe = () => {
    setSubscription(
      Accelerometer.addListener(accelerometerData => {
        const { x, y, z } = accelerometerData;
        const totalForce = Math.sqrt(x*x + y*y + z*z);
        if (totalForce > 2.8) {
          navigation.navigate('SOSActive');
        }
      })
    );
    Accelerometer.setUpdateInterval(200);
  };

  const _unsubscribe = () => {
    subscription && subscription.remove();
    setSubscription(null);
  };

  const fetchAIStatus = async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/ai/status/${userId}`);
      setAiStatus(response.data);
    } catch (error) {
      console.error('Error fetching AI status:', error);
    }
  };

  const fetchAICheckIn = async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/ai/check-in/${userId}`);
      if (response.data.needsCheckIn) {
        setGuardianModal({
          visible: true,
          message: response.data.message
        });
      }
    } catch (error) {
      console.error('Error fetching AI check-in:', error);
    }
  };

  const activateGuardianMode = () => {
    setIsGuarded(true);
    setGuardTimer(20 * 60);
    setGuardianModal({ visible: false, message: '' });
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    navigation.replace('Login');
  };

  const menuItems = [
    { icon: <AlertTriangle color={colors.primary} size={20} />, label: 'Trigger SOS', action: () => navigation.navigate('SOSActive') },
    { icon: <MapPin color={colors.secondary} size={20} />, label: 'Safety Map', action: () => navigation.navigate('SafetyMap') },
    { icon: <Heart color={colors.primary} size={20} />, label: 'Safe Havens', action: () => navigation.navigate('SafeHavens') },
    { icon: <Phone color={colors.secondary} size={20} />, label: 'Fake Call', action: () => navigation.navigate('FakeCall') },
    { icon: <Mic color={colors.warning} size={20} />, label: 'Voice SOS', action: () => navigation.navigate('VoiceSOS') },
    { icon: <Heart color="#ff2d55" size={20} />, label: 'Emergency Contacts', action: () => navigation.navigate('Contacts') },
    { icon: <Shield color={colors.success} size={20} />, label: 'Safety Tips', action: () => navigation.navigate('SafetyTips') },
    { icon: <MessageCircle color={colors.secondary} size={20} />, label: 'AI Assistant', action: () => navigation.navigate('ChatAssistant') },
    { icon: <Clock color={colors.secondary} size={20} />, label: 'SOS History', action: () => navigation.navigate('History') },
    { icon: <LogOut color={colors.textSecondary} size={20} />, label: 'Logout', action: handleLogout },
  ];

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 20,
    },
    title: {
      color: colors.text,
      fontSize: 24,
      fontWeight: '700',
    },
    subtitle: {
      color: colors.textSecondary,
      fontSize: 14,
      marginTop: 4,
    },
    sosButton: {
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 20,
      elevation: 10,
    },
    card: {
      width: (width - 55) / 2,
      backgroundColor: colors.card,
      borderRadius: 24,
      paddingVertical: 25,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDarkMode ? 0.4 : 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    cardLabel: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '600',
      marginTop: 12,
    },
    aiCard: {
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: 15,
      marginTop: 30,
      borderWidth: 1,
      borderColor: colors.border,
    },
    aiText: {
      color: colors.text,
      fontWeight: '700',
      fontSize: 16,
    },
    aiRecommendation: {
      color: colors.textSecondary,
      fontSize: 12,
      marginTop: 2,
    },
    menuDropdown: {
      width: 220,
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 10,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 5,
    },
    menuItemLabel: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '500',
    },
    menuTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '700',
    },
    guardianModal: {
      width: '100%',
      backgroundColor: colors.surface,
      borderRadius: 30,
      padding: 25,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.success,
    },
    guardianMessage: {
      color: colors.text,
      fontSize: 16,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 30,
    }
  });

  return (
    <SafeAreaView style={dynamicStyles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={dynamicStyles.title}>Women Safety</Text>
          <Text style={dynamicStyles.subtitle}>Hi, {userName || 'User'} 👋 You are safe</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={toggleTheme} style={{ marginRight: 15 }}>
            {isDarkMode ? <Sun color="#ffcc00" size={24} /> : <Moon color="#5856d6" size={24} />}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMenuOpen(true)}>
            <Menu color={colors.text} size={28} />
          </TouchableOpacity>
        </View>
      </View>

      {/* SOS Button */}
      <View style={styles.sosContainer}>
        <TouchableOpacity 
          style={dynamicStyles.sosButton}
          onPress={() => navigation.navigate('SOSActive')}
          activeOpacity={0.8}
        >
          <Text style={styles.sosText}>SOS</Text>
          <Text style={styles.sosSubtext}>TAP TO ALERT</Text>
        </TouchableOpacity>
      </View>

      {/* Scrollable Feature List or Grid */}
      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        <FeatureCard 
          icon={<MapPin color={colors.primary} size={24} />} 
          label="Safety Map" 
          colors={colors}
          isDarkMode={isDarkMode}
          onPress={() => navigation.navigate('SafetyMap')}
        />
        <FeatureCard 
          icon={<Heart color={colors.success} size={24} />} 
          label="Safe Havens" 
          colors={colors}
          isDarkMode={isDarkMode}
          onPress={() => navigation.navigate('SafeHavens')}
        />
        <FeatureCard 
          icon={<Phone color={colors.secondary} size={24} />} 
          label="Fake Call" 
          colors={colors}
          isDarkMode={isDarkMode}
          onPress={() => navigation.navigate('FakeCall')}
        />
        <FeatureCard 
          icon={<Mic color={colors.warning} size={24} />} 
          label="Voice SOS" 
          colors={colors}
          isDarkMode={isDarkMode}
          onPress={() => navigation.navigate('VoiceSOS')}
        />
        <FeatureCard 
          icon={<Shield color={colors.success} size={24} />} 
          label="Safety Tips" 
          colors={colors}
          isDarkMode={isDarkMode}
          onPress={() => navigation.navigate('SafetyTips')}
        />
        <FeatureCard 
          icon={<Heart color="#ff2d55" size={24} />} 
          label="My Contacts" 
          colors={colors}
          isDarkMode={isDarkMode}
          onPress={() => navigation.navigate('Contacts')}
        />
        <FeatureCard 
          icon={<MessageCircle color={colors.secondary} size={24} />} 
          label="AI Assistant" 
          colors={colors}
          isDarkMode={isDarkMode}
          onPress={() => navigation.navigate('ChatAssistant')}
        />
        <FeatureCard 
          icon={<Clock color={colors.secondary} size={24} />} 
          label="SOS History" 
          colors={colors}
          isDarkMode={isDarkMode}
          onPress={() => navigation.navigate('History')}
        />
      </ScrollView>

      {/* AI Status */}
      <View style={dynamicStyles.aiCard}>
        <View style={styles.aiStatusRow}>
          <View style={[styles.statusDot, { backgroundColor: aiStatus.color }]} />
          <View>
            <Text style={dynamicStyles.aiText}>AI Status: {aiStatus.status}</Text>
            <Text style={dynamicStyles.aiRecommendation}>{aiStatus.recommendation}</Text>
          </View>
        </View>
      </View>

      {/* AI Guardian Modal */}
      <Modal
        visible={guardianModal.visible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.guardianOverlay}>
          <View style={dynamicStyles.guardianModal}>
            <View style={styles.guardianHeader}>
              <Shield color={colors.success} size={32} />
              <Text style={styles.guardianTitle}>AI Guardian</Text>
            </View>
            <Text style={dynamicStyles.guardianMessage}>{guardianModal.message}</Text>
            <View style={styles.guardianActions}>
              <TouchableOpacity 
                style={styles.guardianBtnSecondary}
                onPress={() => setGuardianModal({ visible: false, message: '' })}
              >
                <Text style={styles.guardianBtnTextSecondary}>I'm Okay</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.guardianBtnPrimary}
                onPress={activateGuardianMode}
              >
                <Text style={styles.guardianBtnTextPrimary}>Activate Guard</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Guard Mode Indicator */}
      {isGuarded && (
        <View style={styles.guardBar}>
          <View style={styles.guardPulse} />
          <Text style={styles.guardBarText}>GUARDIAN MODE ACTIVE</Text>
          <TouchableOpacity onPress={() => setIsGuarded(false)}>
            <X color="#fff" size={16} />
          </TouchableOpacity>
        </View>
      )}

      {/* Dropdown Menu Modal */}
      <Modal
        visible={menuOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMenuOpen(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={dynamicStyles.menuDropdown}>
                <View style={styles.menuHeader}>
                  <Text style={dynamicStyles.menuTitle}>Navigation</Text>
                  <TouchableOpacity onPress={() => setMenuOpen(false)}>
                    <X color={colors.textSecondary} size={20} />
                  </TouchableOpacity>
                </View>
                
                {menuItems.map((item, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={styles.menuItem} 
                    onPress={() => {
                      setMenuOpen(false);
                      item.action();
                    }}
                  >
                    <View style={styles.menuIconContainer}>{item.icon}</View>
                    <Text style={dynamicStyles.menuItemLabel}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
};

const FeatureCard = ({ icon, label, onPress, colors, isDarkMode }) => (
  <TouchableOpacity 
    style={[
      styles.card, 
      { 
        backgroundColor: colors.card, 
        borderColor: colors.border,
        shadowOpacity: isDarkMode ? 0.4 : 0.1 
      }
    ]} 
    onPress={onPress} 
    activeOpacity={0.7}
  >
    {icon}
    <Text style={[styles.cardLabel, { color: colors.text }]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sosContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 40,
  },
  sosText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '900',
  },
  sosSubtext: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.8,
    marginTop: 5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15,
  },
  card: {
    width: (width - 55) / 2,
    borderRadius: 24,
    paddingVertical: 25,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
  },
  aiStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  // Modal & Dropdown Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 100,
    paddingRight: 20,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  menuIconContainer: {
    width: 35,
    height: 35,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  // Guardian Modal Styles
  guardianOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  guardianHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  guardianTitle: {
    color: '#34c759',
    fontSize: 22,
    fontWeight: '800',
  },
  guardianActions: {
    flexDirection: 'row',
    gap: 15,
    width: '100%',
  },
  guardianBtnPrimary: {
    flex: 1,
    backgroundColor: '#34c759',
    padding: 15,
    borderRadius: 16,
    alignItems: 'center',
  },
  guardianBtnSecondary: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 15,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  guardianBtnTextPrimary: {
    color: '#fff',
    fontWeight: '700',
  },
  guardianBtnTextSecondary: {
    color: '#a0a0a0',
    fontWeight: '600',
  },
  guardBar: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#34c759',
    height: 50,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    zIndex: 100,
  },
  guardBarText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 1,
  },
  guardPulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    opacity: 0.8,
  }
});

export default HomeScreen;
