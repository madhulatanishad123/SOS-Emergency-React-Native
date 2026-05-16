import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Clock, Play, AlertCircle, Shield, ArrowLeft, Download, Trash2, Video } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useAudioPlayer } from 'expo-audio';
import { API_URL } from '../constants';
import { useTheme } from '../context/ThemeContext';

const HistoryScreen = () => {
  const navigation = useNavigation();
  const { colors, isDarkMode } = useTheme();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState(null);
  const player = useAudioPlayer();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const response = await axios.get(`${API_URL}/sos/history/${userId}`);
      setHistory(response.data);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const playRecording = async (url, id) => {
    try {
      if (player.playing && playingId === id) {
        player.pause();
        setPlayingId(null);
        return;
      }

      const fullUrl = `http://10.39.45.142:5000${url}`;
      player.replace(fullUrl);
      player.play();
      setPlayingId(id);

      const subscription = player.addListener('playbackStatusUpdate', (status) => {
        if (status.didJustFinish) {
          setPlayingId(null);
          subscription.remove();
        }
      });
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  const deleteAlert = (id) => {
    Alert.alert(
      "Delete History",
      "Are you sure you want to permanently remove this emergency record?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            try {
              await axios.delete(`${API_URL}/sos/history/${id}`);
              setHistory(history.filter(item => item._id !== id));
            } catch (error) {
              console.error('Delete Error:', error);
              Alert.alert("Error", "Could not delete the record. Please try again.");
            }
          } 
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    title: {
      color: colors.text,
      fontSize: 20,
      fontWeight: '700',
    },
    historyCard: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 15,
      marginBottom: 15,
      borderWidth: 1,
      borderColor: colors.border,
    },
    locationLabel: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    locationText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '500',
    },
    playBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.secondary,
      padding: 12,
      borderRadius: 12,
      justifyContent: 'center',
      gap: 10,
    },
    noEvidenceText: {
      color: colors.textSecondary,
      fontSize: 12,
    }
  });

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft color={colors.text} size={24} />
        </TouchableOpacity>
        <Text style={dynamicStyles.title}>SOS History</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {history.length === 0 ? (
          <View style={styles.emptyState}>
            <Shield color={colors.textSecondary} size={60} />
            <Text style={{ color: colors.text, marginTop: 20, fontSize: 16 }}>No emergency history found.</Text>
          </View>
        ) : (
          history.map((item) => (
            <View key={item._id} style={dynamicStyles.historyCard}>
              <View style={styles.cardHeader}>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={[styles.tag, { backgroundColor: `${colors.primary}15` }]}>
                    <AlertCircle color={colors.primary} size={14} />
                    <Text style={[styles.tagText, { color: colors.primary }]}>{item.triggerType.toUpperCase()}</Text>
                  </View>
                  {item.status === 'pending' && (
                    <View style={[styles.tag, { backgroundColor: `${colors.textSecondary}15` }]}>
                      <Text style={[styles.tagText, { color: colors.textSecondary }]}>CANCELLED</Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity 
                  onPress={() => deleteAlert(item._id)}
                  style={{ padding: 10, marginRight: -10 }}
                >
                  <Trash2 color={colors.textSecondary} size={18} />
                </TouchableOpacity>
              </View>

              <View style={styles.cardBody}>
                <View style={styles.locationInfo}>
                  <Text style={dynamicStyles.locationLabel}>Location Snapshot:</Text>
                  <Text style={dynamicStyles.locationText}>{item.location.lat.toFixed(4)}, {item.location.lng.toFixed(4)}</Text>
                </View>

              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  content: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 5,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '800',
  },
  cardBody: {
    gap: 10,
  },
  locationInfo: {
    marginBottom: 10,
  },
  playText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  noEvidence: {
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyState: {
    marginTop: 100,
    alignItems: 'center',
    opacity: 0.5,
  },
});

export default HistoryScreen;
