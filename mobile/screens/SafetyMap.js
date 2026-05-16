import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions, ScrollView, Image } from 'react-native';
import MapView, { Marker, Circle, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Shield, Heart, MapPin, Phone, ArrowLeft, Search, Building2, 
  List, Bell, Info, Navigation, Layers, CheckCircle2, 
  AlertTriangle, Train, User, HelpCircle, UserCheck, Menu,
  Map as MapIcon, Ghost, HeartPulse, Smartphone
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

const SafetyMap = () => {
  const navigation = useNavigation();
  const { colors, isDarkMode } = useTheme();
  const [location, setLocation] = useState(null);
  const [userName, setUserName] = useState('User');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [mapData, setMapData] = useState({ dangerZones: [], safeHavens: [] });
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const mapRef = useRef(null);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    let locationWatcher = null;

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied');
        setLoading(false);
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation.coords);
      fetchMapData(currentLocation.coords);

      if (isFirstLoad.current && mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }, 1000);
        isFirstLoad.current = false;
      }

      locationWatcher = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 10000,
          distanceInterval: 10,
        },
        (newLocation) => {
          const coords = newLocation.coords;
          setLocation(coords);
          fetchMapData(coords);
        }
      );

      const storedName = await AsyncStorage.getItem('userName');
      if (storedName) setUserName(storedName);

      try {
        const reverseGeocode = await Location.reverseGeocodeAsync({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude
        });
        if (reverseGeocode && reverseGeocode.length > 0) {
          const item = reverseGeocode[0];
          setAddress(`${item.street || ''}, ${item.city || ''}`);
        }
      } catch (e) {
        console.log("Geocoding error:", e);
      }

      setLoading(false);
    })();

    return () => {
      if (locationWatcher) locationWatcher.remove();
    };
  }, []);

  const fetchMapData = async (coords) => {
    try {
      if (!coords) return;
      
      const response = await axios.get(`${API_URL}/sos/heatmap`, {
        params: {
          lat: coords.latitude,
          lng: coords.longitude
        }
      });
      const data = response.data;
      setMapData(data);

      const processed = data.safeHavens.map(haven => {
        const dist = calculateDistance(coords.latitude, coords.longitude, haven.latitude, haven.longitude);
        return {
          ...haven,
          distanceText: dist < 1 ? `${(dist * 1000).toFixed(0)} m away` : `${dist.toFixed(1)} km away`,
          distance: dist
        };
      }).sort((a, b) => a.distance - b.distance);
      setNearbyPlaces(processed);
    } catch (error) {
      console.error('Error fetching heatmap:', error);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const getHavenIcon = (type, size = 16, color = "#fff") => {
    switch(type) {
      case 'police': return <Shield color={color} size={size} />;
      case 'hospital': return <Heart color={color} size={size} />;
      case 'hotel': return <Building2 color={color} size={size} />;
      case 'metro': return <Train color={color} size={size} />;
      case 'help_center': return <UserCheck color={color} size={size} />;
      default: return <MapPin color={color} size={size} />;
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Locating Safety Zones...</Text>
      </View>
    );
  }

  const routeCoordinates = [
    { latitude: location?.latitude, longitude: location?.longitude },
    { latitude: location?.latitude + 0.005, longitude: location?.longitude + 0.002 },
    { latitude: location?.latitude + 0.008, longitude: location?.longitude + 0.005 }
  ];

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.primary,
      paddingBottom: 15,
      zIndex: 10,
    },
    headerTitle: {
      color: '#fff',
      fontSize: 18,
      fontWeight: '700',
    },
    legendBar: {
      backgroundColor: colors.card,
      borderRadius: 25,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 15,
      paddingVertical: 10,
      elevation: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },
    legendLabel: {
      fontSize: 12,
      color: colors.text,
      fontWeight: '600',
    },
    scoreCard: {
      position: 'absolute',
      top: 350,
      left: 20,
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 15,
      flexDirection: 'row',
      alignItems: 'center',
      elevation: 5,
      borderWidth: 1,
      borderColor: colors.border,
    },
    scoreLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    scoreValue: {
      fontSize: 24,
      fontWeight: '800',
      color: colors.success,
    },
    scoreMax: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    scoreStatus: {
      fontSize: 11,
      color: colors.success,
      fontWeight: '700',
    },
    bottomContent: {
      position: 'absolute',
      bottom: 80,
      left: 0,
      right: 0,
      paddingHorizontal: 20,
    },
    warningBanner: {
      backgroundColor: isDarkMode ? 'rgba(255, 59, 48, 0.1)' : '#FFEBEE',
      borderRadius: 16,
      padding: 12,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
      borderWidth: 1,
      borderColor: isDarkMode ? 'rgba(255, 59, 48, 0.2)' : '#FFCDD2',
    },
    nearbyHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
      backgroundColor: colors.card,
      padding: 10,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    nearbyTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    placeCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 12,
      marginRight: 12,
      alignItems: 'center',
      width: 100,
      elevation: 2,
      borderWidth: 1,
      borderColor: colors.border,
    },
    placeName: {
      fontSize: 10,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
    },
    bottomNav: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 80,
      backgroundColor: colors.card,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      paddingBottom: 15,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    }
  });

  const darkMapStyle = [
    { "elementType": "geometry", "stylers": [{ "color": "#212121" }] },
    { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
    { "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
    { "elementType": "labels.text.stroke", "stylers": [{ "color": "#212121" }] },
    { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "color": "#757575" }] },
    { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#181818" }] },
    { "featureType": "road", "elementType": "geometry.fill", "stylers": [{ "color": "#2c2c2c" }] },
    { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#000000" }] }
  ];

  return (
    <View style={dynamicStyles.container}>
      <SafeAreaView style={dynamicStyles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft color="#fff" size={24} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={dynamicStyles.headerTitle}>Women Safety Map</Text>
            <View style={styles.headerStatus}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Live • You are Safe</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.bellBtn}>
            <Bell color="#fff" size={24} />
            <View style={styles.badge}><Text style={styles.badgeText}>3</Text></View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <View style={styles.legendContainer}>
        <View style={dynamicStyles.legendBar}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
            <Text style={dynamicStyles.legendLabel}>Safe Area</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FFC107' }]} />
            <Text style={dynamicStyles.legendLabel}>Medium Risk</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#F44336' }]} />
            <Text style={dynamicStyles.legendLabel}>High Risk</Text>
          </View>
          <Info color={colors.textSecondary} size={20} />
        </View>
      </View>

      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        customMapStyle={isDarkMode ? darkMapStyle : []}
        initialRegion={{
          latitude: location?.latitude || 12.9716,
          longitude: location?.longitude || 77.5946,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        {location && (
          <Marker coordinate={location}>
            <View style={styles.userMarkerOuter}>
              <View style={styles.userMarkerInner} />
            </View>
          </Marker>
        )}

        {mapData.dangerZones.map((zone, index) => (
          <Circle
            key={`danger-${index}`}
            center={{ latitude: zone.latitude, longitude: zone.longitude }}
            radius={600}
            fillColor={zone.type === 'danger' ? "rgba(244, 67, 54, 0.2)" : "rgba(255, 193, 7, 0.2)"}
            strokeColor={zone.type === 'danger' ? "rgba(244, 67, 54, 0.4)" : "rgba(255, 193, 7, 0.4)"}
            strokeWidth={1}
          />
        ))}

        {nearbyPlaces.map((haven, index) => (
          <Marker
            key={`haven-${index}`}
            coordinate={{ latitude: haven.latitude, longitude: haven.longitude }}
          >
            <View style={styles.markerContainer}>
              <View style={[styles.markerIcon, { backgroundColor: haven.type === 'police' ? colors.success : haven.type === 'hospital' ? colors.primary : colors.accent }]}>
                {getHavenIcon(haven.type)}
              </View>
              <View style={styles.markerLabelContainer}>
                <Text style={[styles.markerTitle, { color: colors.text, textShadowColor: colors.background }]}>{haven.name}</Text>
                <Text style={styles.markerDist}>{haven.distanceText}</Text>
              </View>
            </View>
          </Marker>
        ))}

        <Polyline
          coordinates={routeCoordinates}
          strokeColor={colors.secondary}
          strokeWidth={4}
        />
      </MapView>

      <View style={styles.mapControls}>
        <TouchableOpacity style={[styles.controlBtn, { backgroundColor: colors.surface }]}>
          <Navigation color={colors.text} size={20} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.controlBtn, { backgroundColor: colors.surface }]}>
          <Layers color={colors.text} size={20} />
        </TouchableOpacity>
      </View>

      <View style={dynamicStyles.scoreCard}>
        <View style={dynamicStyles.scoreInfo}>
          <Text style={dynamicStyles.scoreLabel}>Safety Score</Text>
          <View style={styles.scoreRow}>
            <Text style={dynamicStyles.scoreValue}>82</Text>
            <Text style={dynamicStyles.scoreMax}>/100</Text>
          </View>
          <Text style={dynamicStyles.scoreStatus}>Safe Route</Text>
        </View>
        <View style={styles.scoreIconContainer}>
          <CheckCircle2 color={colors.success} size={28} />
        </View>
      </View>

      <TouchableOpacity style={[styles.sosFloatingBtn, { backgroundColor: colors.primary, shadowColor: colors.primary }]} onPress={() => navigation.navigate('SOSActive')}>
        <Phone color="#fff" size={32} />
        <Text style={styles.sosFloatingText}>SOS</Text>
      </TouchableOpacity>

      <View style={dynamicStyles.bottomContent}>
        <View style={dynamicStyles.warningBanner}>
          <AlertTriangle color={colors.primary} size={24} />
          <View style={styles.warningTextContainer}>
            <Text style={[styles.warningTitle, { color: colors.primary }]}>High Risk Area Ahead</Text>
            <Text style={[styles.warningSub, { color: colors.primary }]}>Old Industrial Area - Avoid if possible</Text>
          </View>
          <Text style={[styles.warningDist, { color: colors.primary }]}>250 m away</Text>
        </View>

        <View style={dynamicStyles.nearbyHeader}>
          <Text style={dynamicStyles.nearbyTitle}>Nearby Safe Places</Text>
          <TouchableOpacity onPress={() => navigation.navigate('SafeHavens')}>
            <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '600' }}>View All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carousel}>
          {nearbyPlaces.map((place, index) => (
            <TouchableOpacity key={index} style={dynamicStyles.placeCard}>
              <View style={[styles.placeIconBg, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f0f0f0' }]}>
                {getHavenIcon(place.type, 24, place.type === 'police' ? colors.success : place.type === 'hospital' ? colors.primary : colors.accent)}
              </View>
              <Text style={dynamicStyles.placeName}>{place.type === 'police' ? 'Police Station' : place.type === 'hospital' ? 'Hospital' : place.name}</Text>
              <Text style={styles.placeDist}>{place.distanceText}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={dynamicStyles.bottomNav}>
        <NavItem icon={<MapIcon color={colors.primary} size={24} />} label="Map" active colors={colors} />
        <NavItem icon={<Bell color={colors.textSecondary} size={24} />} label="Alerts" colors={colors} />
        <View style={styles.navSOSContainer}>
          <View style={[styles.navSOS, { backgroundColor: colors.primary }]}>
            <Shield color="#fff" size={24} />
          </View>
          <Text style={[styles.navSOSLabel, { color: colors.primary }]}>SOS</Text>
        </View>
        <NavItem icon={<UserCheck color={colors.textSecondary} size={24} />} label="Safe Walk" colors={colors} />
        <NavItem icon={<User color={colors.textSecondary} size={24} />} label="Profile" colors={colors} />
      </View>
    </View>
  );
};

const NavItem = ({ icon, label, active, colors }) => (
  <TouchableOpacity style={styles.navItem}>
    {icon}
    <Text style={[styles.navLabel, { color: active ? colors.primary : colors.textSecondary }]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
    marginRight: 5,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.9,
  },
  bellBtn: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#F44336',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ff3b30',
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '900',
  },
  legendContainer: {
    paddingHorizontal: 20,
    marginTop: -10,
    zIndex: 11,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  map: {
    width: width,
    height: height * 0.6,
  },
  userMarkerOuter: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(33, 150, 243, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userMarkerInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#2196F3',
    borderWidth: 2,
    borderColor: '#fff',
  },
  markerContainer: {
    alignItems: 'center',
  },
  markerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    elevation: 5,
  },
  markerLabelContainer: {
    alignItems: 'center',
    marginTop: 4,
  },
  markerTitle: {
    fontSize: 11,
    fontWeight: '700',
    textShadowRadius: 2,
  },
  markerDist: {
    fontSize: 10,
    color: '#616161',
    fontWeight: '500',
  },
  mapControls: {
    position: 'absolute',
    top: 150,
    right: 20,
    gap: 10,
  },
  controlBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 2,
  },
  scoreIconContainer: {
    marginLeft: 15,
  },
  sosFloatingBtn: {
    position: 'absolute',
    top: 450,
    right: 20,
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  sosFloatingText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  warningTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  warningTitle: {
    fontWeight: '700',
    fontSize: 14,
  },
  warningSub: {
    fontSize: 11,
    opacity: 0.8,
  },
  warningDist: {
    fontSize: 12,
    fontWeight: '700',
  },
  carousel: {
    flexDirection: 'row',
  },
  placeIconBg: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  placeDist: {
    fontSize: 9,
    color: '#9E9E9E',
    marginTop: 2,
  },
  navItem: {
    alignItems: 'center',
  },
  navLabel: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: '500',
  },
  navSOSContainer: {
    alignItems: 'center',
    marginTop: -20,
  },
  navSOS: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    borderWidth: 3,
    borderColor: '#fff',
  },
  navSOSLabel: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: '800',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default SafetyMap;
