import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Alert, Share, Linking, Platform, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertCircle, CheckCircle, Share2, Shield, MessageCircle, Mic, Disc } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { AudioModule, RecordingPresets, setAudioModeAsync, requestRecordingPermissionsAsync } from 'expo-audio';
import { CameraView, Camera } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import io from 'socket.io-client';
import axios from 'axios';
import { API_URL, SOCKET_URL } from '../constants';
import { useTheme } from '../context/ThemeContext';

const SOSTriggered = () => {
  const { colors, isDarkMode } = useTheme();
  const [countdown, setCountdown] = useState(5);
  const [isSharing, setIsSharing] = useState(false);
  const [isStealth, setIsStealth] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState('');
  const [contacts, setContacts] = useState([]);
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [currentAlertId, setCurrentAlertId] = useState(null);
  
  const navigation = useNavigation();
  const pulse = useRef(new Animated.Value(1)).current;
  const socketRef = useRef(null);
  const cameraRef = useRef(null);
  const locationSubscription = useRef(null);
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  
  const recorderRef = useRef(null);
  const alertIdRef = useRef(null); // Use ref to ensure upload logic always has latest alertId

  useEffect(() => {
    const init = async () => {
      const id = await AsyncStorage.getItem('userId');
      const name = await AsyncStorage.getItem('userName');
      setUserId(id);
      setUserName(name);
      
      try {
        const response = await axios.get(`${API_URL}/auth/profile/${id}`);
        setContacts(response.data.emergencyContacts || []);
      } catch (err) {
        console.error('Error fetching contacts:', err);
      }
      
      try {
        const location = await Location.getCurrentPositionAsync({});
        const res = await axios.post(`${API_URL}/sos/trigger`, {
          userId: id,
          location: { lat: location.coords.latitude, lng: location.coords.longitude },
          triggerType: 'manual',
          status: 'pending'
        });
        if (res.data._id) {
          setCurrentAlertId(res.data._id);
          alertIdRef.current = res.data._id;
        }
      } catch (err) {
        console.error('Initial Alert Error:', err);
      }
    };
    init();

    socketRef.current = io(SOCKET_URL);
    
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.2, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1000, useNativeDriver: true })
      ])
    ).start();

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
      if (locationSubscription.current) locationSubscription.current.remove();
      // Emergency cleanup: try to stop and upload if still recording
      cleanupRecordings();
    };
  }, []);

  const cleanupRecordings = async () => {
    if (recorderRef.current) {
      try {
        const rec = recorderRef.current;
        recorderRef.current = null;
        const uri = await rec.stop();
        if (alertIdRef.current) uploadEvidence(uri, alertIdRef.current, 'audio');
      } catch (err) {}
    }
    if (cameraRef.current && isRecordingVideo) {
      try {
        cameraRef.current.stopRecording();
      } catch (err) {}
    }
  };

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (!isSharing) {
      startLocationSharing();
    }
  }, [countdown, isSharing]);

  const startRecording = async () => {
    if (isRecordingAudio || recorderRef.current || isRecordingVideo) return;
    try {
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) return;
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      const recorder = new AudioModule.AudioRecorder(RecordingPresets.HIGH_QUALITY);
      await recorder.prepareToRecordAsync();
      recorder.record();
      recorderRef.current = recorder;
      setIsRecordingAudio(true);
      console.log('Audio recording started');
    } catch (err) {
      console.error('Failed to start audio recording:', err);
      setIsRecordingAudio(false);
    }
  };

  const startVideoRecording = async () => {
    if (isRecordingVideo) return;
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      const audioStatus = await Camera.requestMicrophonePermissionsAsync();
      if (status === 'granted' && audioStatus.status === 'granted') {
        // If audio recorder is running, stop it first to avoid conflict
        if (recorderRef.current) {
          const rec = recorderRef.current;
          recorderRef.current = null;
          setIsRecordingAudio(false);
          const uri = await rec.stop();
          if (alertIdRef.current) uploadEvidence(uri, alertIdRef.current, 'audio');
        }

        setIsRecordingVideo(true);
        if (cameraRef.current) {
          console.log('Starting video recording...');
          const video = await cameraRef.current.recordAsync({ maxDuration: 60, quality: '480p' });
          console.log('Video recording finished:', video.uri);
          if (alertIdRef.current) uploadEvidence(video.uri, alertIdRef.current, 'video');
        }
      }
    } catch (err) {
      console.error('Video Recording Error:', err);
      setIsRecordingVideo(false);
    }
  };

  const stopRecording = async () => {
    try {
      if (cameraRef.current && isRecordingVideo) {
        cameraRef.current.stopRecording();
        setIsRecordingVideo(false);
      }
      if (recorderRef.current) {
        const rec = recorderRef.current;
        recorderRef.current = null;
        setIsRecordingAudio(false);
        const uri = await rec.stop();
        if (alertIdRef.current) uploadEvidence(uri, alertIdRef.current, 'audio');
      }
    } catch (err) {
      console.error('Failed to stop recording:', err);
    }
  };

  const uploadEvidence = async (uri, alertId, type = 'audio') => {
    if (!alertId || !uri) return;
    console.log(`Uploading ${type} evidence...`);
    try {
      // Use base64 for BOTH audio and video for maximum reliability in React Native
      const response = await fetch(uri);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64data = reader.result;
        try {
          await axios.post(`${API_URL}/sos/upload/${alertId}`, {
            base64: base64data,
            fileType: type
          }, { timeout: 120000 }); // Increased timeout for large files
          console.log(`${type} upload successful`);
        } catch (err) {
          console.error(`${type} upload failed:`, err.message);
        }
      };
    } catch (err) {
      console.error(`Failed to prepare ${type} for upload:`, err);
    }
  };

  const startLocationSharing = async () => {
    setIsSharing(true);
    // Prioritize video recording if possible
    startVideoRecording();
    
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      const currentUserId = await AsyncStorage.getItem('userId');
      const currentUserName = await AsyncStorage.getItem('userName');
      
      if (alertIdRef.current) {
        await axios.post(`${API_URL}/sos/trigger`, {
          userId: currentUserId,
          location: { lat: latitude, lng: longitude },
          triggerType: 'manual',
          alertId: alertIdRef.current
        });
      }

      socketRef.current.emit('trigger_sos', {
        userId: currentUserId,
        userName: currentUserName,
        lat: latitude,
        lng: longitude,
        timestamp: new Date()
      });

      locationSubscription.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 10 },
        (newLocation) => {
          const { latitude: newLat, longitude: newLng } = newLocation.coords;
          socketRef.current.emit('update_location', {
            userId: currentUserId,
            userName: currentUserName,
            lat: newLat,
            lng: newLng,
            timestamp: new Date()
          });
        }
      );
    } catch (error) {
      console.error('Location Sharing Error:', error);
    }
  };

  const stopSharing = async () => {
    await stopRecording();
    setIsSharing(false);
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
    navigation.goBack();
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    },
    statusText: {
      color: colors.primary,
      fontSize: 24,
      fontWeight: '900',
      marginLeft: 10,
    },
    recordingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 5,
      backgroundColor: `${colors.primary}15`,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
      alignSelf: 'center',
    },
    recordingText: {
      color: colors.primary,
      fontSize: 10,
      fontWeight: '800',
    },
    subtitle: {
      color: colors.textSecondary,
    },
    pulseCircle: {
      position: 'absolute',
      width: 180,
      height: 180,
      borderRadius: 90,
      backgroundColor: `${colors.primary}25`,
    },
    countdownCircle: {
      width: 160,
      height: 160,
      borderRadius: 80,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2,
    },
    infoText: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '500',
      marginVertical: 40,
    },
    cancelButton: {
      flex: 1,
      backgroundColor: colors.card,
      padding: 18,
      borderRadius: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    cancelText: {
      color: colors.text,
      fontWeight: '600',
    },
    stealthBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      padding: 15,
      borderRadius: 16,
      width: '100%',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    shareLinkBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: `${colors.secondary}15`,
      padding: 15,
      borderRadius: 16,
      width: '100%',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: `${colors.secondary}25`,
    },
    shareLinkText: {
      color: colors.secondary,
      fontWeight: '700',
      fontSize: 14,
    },
    directSMSBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.secondary,
      padding: 15,
      borderRadius: 16,
      width: '100%',
      justifyContent: 'center',
      shadowColor: colors.secondary,
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 3,
    },
    bottomText: {
      color: colors.textSecondary,
      fontSize: 14,
      marginTop: 40,
    },
  });

  if (isStealth) {
    return (
      <View style={styles.calcContainer}>
        <View style={styles.calcDisplayContainer}>
          <View style={{ position: 'absolute', top: 20, left: 20, width: 4, height: 4, borderRadius: 2, backgroundColor: (isRecordingAudio || isRecordingVideo) ? colors.success : '#1a1a1a', zIndex: 999 }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end' }}>
            <Text style={styles.calcDisplay}>{calcDisplay}</Text>
          </View>
        </View>
        <View style={styles.calcGrid}>
          {['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', 'C', '0', '=', '+'].map((btn) => (
            <TouchableOpacity 
              key={btn} 
              style={[styles.calcBtn, (btn === '/' || btn === '*' || btn === '-' || btn === '+' || btn === '=') ? styles.calcBtnOp : {}]}
              onPress={() => handleCalcPress(btn)}
              onLongPress={btn === 'C' ? () => setIsStealth(false) : null}
              delayLongPress={2000}
            >
              <Text style={styles.calcBtnText}>{btn}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.stealthHint}>Long press 'C' to exit</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <View style={styles.header}>
        <View style={styles.statusRow}>
          <AlertCircle color={colors.primary} size={24} />
          <Text style={dynamicStyles.statusText}>SOS {isSharing ? 'LIVE' : 'ACTIVATED'}</Text>
        </View>
        {(isRecordingAudio || isRecordingVideo) && (
          <View style={dynamicStyles.recordingRow}>
            <Disc color={colors.primary} size={16} />
            <Text style={dynamicStyles.recordingText}>
              {isRecordingVideo ? 'VIDEO + AUDIO ACTIVE' : 'AUDIO RECORDING ACTIVE'}
            </Text>
          </View>
        )}
        <Text style={dynamicStyles.subtitle}>{isSharing ? 'Sharing live location...' : 'Shake / Voice / Button Triggered'}</Text>
      </View>

      <View style={styles.visualContainer}>
        <Animated.View style={[dynamicStyles.pulseCircle, { transform: [{ scale: pulse }] }]} />
        <View style={dynamicStyles.countdownCircle}>
          <Text style={styles.countdownText}>{countdown > 0 ? countdown : 'LIVE'}</Text>
        </View>
      </View>

      <Text style={dynamicStyles.infoText}>
        {countdown > 0 ? 'Sending Alert in...' : 'Your location is being shared'}
      </Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={dynamicStyles.cancelButton} onPress={stopSharing}>
          <Text style={dynamicStyles.cancelText}>CANCEL</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.safeButton} onPress={stopSharing}>
          <CheckCircle color="#fff" size={20} style={{ marginRight: 8 }} />
          <Text style={styles.safeText}>I'M SAFE</Text>
        </TouchableOpacity>
      </View>

      {isSharing && (
        <View style={{ width: '100%', gap: 10 }}>
          <TouchableOpacity 
            style={dynamicStyles.stealthBtn}
            onPress={() => {
              setIsStealth(true);
              // In stealth mode, if not already recording, start audio at least
              if (!isRecordingVideo && !isRecordingAudio) startRecording();
            }}
          >
            <Shield color="#fff" size={20} style={{ marginRight: 10 }} />
            <Text style={styles.stealthBtnText}>ENTER STEALTH MODE</Text>
          </TouchableOpacity>

          <TouchableOpacity style={dynamicStyles.directSMSBtn} onPress={sendDirectSMS}>
            <MessageCircle color="#fff" size={20} style={{ marginRight: 10 }} />
            <Text style={styles.directSMSText}>SEND DIRECT SMS TO CONTACTS</Text>
          </TouchableOpacity>

          <TouchableOpacity style={dynamicStyles.shareLinkBtn} onPress={shareTrackingLink}>
            <Share2 color={colors.secondary} size={20} style={{ marginRight: 10 }} />
            <Text style={dynamicStyles.shareLinkText}>SHARE TRACKING LINK</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={dynamicStyles.bottomText}>
        {isSharing ? 'Contacts can see your location in real-time' : 'Live location will be shared with emergency contacts'}
      </Text>

      <View style={{ position: 'absolute', width: 1, height: 1, opacity: 0.01 }}>
        <CameraView ref={cameraRef} style={{ flex: 1 }} facing="front" mode="video" />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: { alignItems: 'center', marginBottom: 40 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  visualContainer: { width: 250, height: 250, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  countdownText: { color: '#fff', fontSize: 48, fontWeight: '900' },
  buttonRow: { flexDirection: 'row', width: '100%', gap: 15 },
  safeButton: { flex: 1, backgroundColor: '#34c759', padding: 18, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  safeText: { color: '#fff', fontWeight: '600' },
  stealthBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  directSMSText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  calcContainer: { flex: 1, backgroundColor: '#000', padding: 20, justifyContent: 'flex-end' },
  calcDisplayContainer: { padding: 20, alignItems: 'flex-end', marginBottom: 20 },
  calcDisplay: { color: '#fff', fontSize: 70, fontWeight: '300' },
  calcGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  calcBtn: { width: (Dimensions.get('window').width - 70) / 4, height: (Dimensions.get('window').width - 70) / 4, borderRadius: 50, backgroundColor: '#333', alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  calcBtnOp: { backgroundColor: '#ff9500' },
  calcBtnText: { color: '#fff', fontSize: 28, fontWeight: '500' },
  stealthHint: { color: '#111', textAlign: 'center', marginTop: 10, fontSize: 10 }
});

export default SOSTriggered;
