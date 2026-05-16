import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mic, MicOff, Shield, AlertTriangle, ArrowLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { AudioModule, setAudioModeAsync, requestRecordingPermissionsAsync, RecordingPresets } from 'expo-audio';
import { useTheme } from '../context/ThemeContext';

const VoiceSOS = () => {
  const [isListening, setIsListening] = useState(false);
  const [volume, setVolume] = useState(0);
  const navigation = useNavigation();
  const { colors, isDarkMode } = useTheme();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  const recorderRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isListening) {
      startPulsing();
      startMonitoring();
    } else {
      stopPulsing();
      stopMonitoring();
    }
    return () => {
      stopMonitoring();
    };
  }, [isListening]);

  const startPulsing = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.5,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPulsing = () => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  };

  const startMonitoring = async () => {
    try {
      const response = await requestRecordingPermissionsAsync();
      if (!response.granted) return;

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      const recorder = new AudioModule.AudioRecorder({
        ...RecordingPresets.HIGH_QUALITY,
        isMeteringEnabled: true,
      });

      await recorder.prepareToRecordAsync();
      recorder.record();
      
      recorderRef.current = recorder;
      setIsRecording(true);

      intervalRef.current = setInterval(() => {
        if (recorderRef.current) {
          const status = recorderRef.current.getStatus();
          if (status && status.metering !== undefined) {
            const level = Math.max(0, (status.metering + 160) / 160);
            setVolume(level);
            if (level > 0.8) triggerSOS();
          }
        }
      }, 100);

    } catch (err) {
      console.error('Failed to start recording', err);
      setIsRecording(false);
    }
  };

  const stopMonitoring = async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (recorderRef.current) {
      try {
        const rec = recorderRef.current;
        recorderRef.current = null;
        setIsRecording(false);
        await rec.stop();
      } catch (err) {}
    }
  };

  const triggerSOS = () => {
    setIsListening(false);
    navigation.navigate('SOSActive', { triggerType: 'voice' });
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 20,
    },
    headerTitle: {
      color: colors.text,
      fontSize: 22,
      fontWeight: '700',
    },
    instruction: {
      color: colors.textSecondary,
      textAlign: 'center',
      fontSize: 16,
      lineHeight: 24,
      marginBottom: 60,
    },
    micButton: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: colors.card,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    micButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    pulseRing: {
      position: 'absolute',
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: colors.primary,
    },
    volumeBarContainer: {
      width: '80%',
      height: 6,
      backgroundColor: colors.surfaceLight,
      borderRadius: 3,
      marginTop: 60,
      overflow: 'hidden',
    },
    volumeBar: {
      height: '100%',
      backgroundColor: colors.success,
    }
  });

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft color={colors.text} size={24} style={{ marginRight: 10 }} />
        </TouchableOpacity>
        <Shield color={colors.primary} size={32} />
        <Text style={dynamicStyles.headerTitle}>Voice Recognition</Text>
      </View>

      <View style={styles.main}>
        <Text style={dynamicStyles.instruction}>
          {isListening 
            ? "Listening for your distress signal...\nSay 'HELP HELP' or shout to trigger SOS" 
            : "Voice SOS is currently inactive.\nTap the button to start monitoring."}
        </Text>

        <View style={styles.micContainer}>
          {isListening && (
            <Animated.View 
              style={[
                dynamicStyles.pulseRing, 
                { 
                  transform: [{ scale: pulseAnim }],
                  opacity: pulseAnim.interpolate({
                    inputRange: [1, 1.5],
                    outputRange: [0.5, 0]
                  })
                }
              ]} 
            />
          )}
          <TouchableOpacity 
            style={[dynamicStyles.micButton, isListening && dynamicStyles.micButtonActive]}
            onPress={() => setIsListening(!isListening)}
            activeOpacity={0.8}
          >
            {isListening ? (
              <Mic color="#fff" size={50} />
            ) : (
              <MicOff color={colors.textSecondary} size={50} opacity={0.5} />
            )}
          </TouchableOpacity>
        </View>

        {isListening && (
          <View style={dynamicStyles.volumeBarContainer}>
            <View style={[dynamicStyles.volumeBar, { width: `${volume * 100}%` }]} />
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <View style={[styles.warningBox, { backgroundColor: `${colors.warning}15` }]}>
          <AlertTriangle color={colors.warning} size={20} />
          <Text style={[styles.warningText, { color: colors.warning }]}>
            This feature works best in quiet environments. Manual SOS is always recommended for emergencies.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  main: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micContainer: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  footer: {
    marginBottom: 20,
  },
  warningBox: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 16,
    alignItems: 'center',
    gap: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});

export default VoiceSOS;
