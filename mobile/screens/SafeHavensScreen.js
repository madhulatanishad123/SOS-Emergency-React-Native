import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Shield, Heart, MapPin, Phone, ArrowLeft, Search, Building2 } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { API_URL } from '../constants';
import * as Location from 'expo-location';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const SafeHavensScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [havens, setHavens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      let coords = null;
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        coords = location.coords;
        setUserLocation(coords);
      }

      const response = await axios.get(`${API_URL}/sos/heatmap`, {
        params: {
          lat: coords?.latitude,
          lng: coords?.longitude
        }
      });
      const rawHavens = response.data.safeHavens || [];

      const processedHavens = rawHavens.map(haven => {
        let distance = 'Unknown';
        if (coords) {
          const dist = calculateDistance(
            coords.latitude,
            coords.longitude,
            haven.latitude,
            haven.longitude
          );
          distance = dist < 1 ? `${(dist * 1000).toFixed(0)} m` : `${dist.toFixed(1)} km`;
          haven.numericDistance = dist;
        } else {
          haven.numericDistance = 9999;
        }

        let color = colors.success;
        if (haven.type === 'police') color = colors.secondary;
        if (haven.type === 'hospital') color = colors.primary;
        if (haven.type === 'hotel') color = colors.accent;

        return {
          ...haven,
          distance,
          color,
          displayType: haven.type.charAt(0).toUpperCase() + haven.type.slice(1)
        };
      });

      processedHavens.sort((a, b) => a.numericDistance - b.numericDistance);
      setHavens(processedHavens);
    } catch (error) {
      console.error('Error fetching safe havens:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d;
  };

  const deg2rad = (deg) => deg * (Math.PI / 180);

  const getIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'police': return <Shield size={24} />;
      case 'hospital': return <Heart size={24} />;
      case 'hotel': return <Building2 size={24} />;
      default: return <MapPin size={24} />;
    }
  };

  const handleCall = (phone) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Finding nearby safe places...</Text>
      </View>
    );
  }

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    headerTitle: {
      color: colors.text,
      fontSize: 20,
      fontWeight: '700',
    },
    mapPlaceholder: {
      height: 200,
      backgroundColor: colors.card,
      borderRadius: 24,
      marginBottom: 30,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    havenCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 15,
      marginBottom: 15,
      borderWidth: 1,
      borderColor: colors.border,
    },
    havenName: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 5,
    },
    distanceText: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    callBtn: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: colors.surfaceLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 10,
      borderWidth: 1,
      borderColor: colors.border,
    }
  });

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft color={colors.text} size={24} />
          </TouchableOpacity>
          <Text style={dynamicStyles.headerTitle}>Nearby Safe Places</Text>
          <TouchableOpacity onPress={fetchData}>
            <Search color={colors.textSecondary} size={24} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={dynamicStyles.mapPlaceholder}>
          <MapPin color={colors.primary} size={40} />
          <Text style={{ color: colors.textSecondary, marginTop: 10, fontSize: 14 }}>
            {userLocation ? 'Showing places near your current location' : 'Locating Nearby Help...'}
          </Text>
        </View>

        {havens.length > 0 ? (
          havens.map((haven, index) => (
            <View key={index} style={dynamicStyles.havenCard}>
              <View style={styles.havenInfo}>
                <View style={[styles.iconContainer, { backgroundColor: `${haven.color}15` }]}>
                  {React.cloneElement(getIcon(haven.type), { color: haven.color })}
                </View>
                <View style={styles.textContainer}>
                  <Text style={dynamicStyles.havenName}>{haven.name}</Text>
                  <View style={styles.tagRow}>
                    <Text style={[styles.typeTag, { color: haven.color, backgroundColor: `${haven.color}10` }]}>
                      {haven.displayType}
                    </Text>
                    <Text style={dynamicStyles.distanceText}>{haven.distance}</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                style={dynamicStyles.callBtn}
                onPress={() => handleCall(haven.phone)}
              >
                <Phone color={haven.color} size={20} />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={{ color: colors.textSecondary, fontSize: 16 }}>No safe places found nearby.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  havenInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  typeTag: {
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    textTransform: 'uppercase',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 50,
  },
});

export default SafeHavensScreen;
