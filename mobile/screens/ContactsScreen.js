import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Phone, Trash2, Plus, Heart, ArrowLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import * as Contacts from 'expo-contacts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../constants';
import { useTheme } from '../context/ThemeContext';

const ContactsScreen = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const { colors, isDarkMode } = useTheme();

  useEffect(() => {
    fetchSavedContacts();
  }, []);

  const fetchSavedContacts = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const response = await axios.get(`${API_URL}/auth/profile/${userId}`);
      setContacts(response.data.emergencyContacts || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const pickContact = async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status === 'granted') {
      const contact = await Contacts.presentContactPickerAsync();
      if (contact) {
        const newContact = {
          name: contact.name,
          phone: contact.phoneNumbers?.[0]?.number || '',
          relation: 'Emergency'
        };
        
        if (!newContact.phone) {
          Alert.alert('Error', 'This contact has no phone number');
          return;
        }

        saveContact(newContact);
      }
    } else {
      Alert.alert('Permission Denied', 'Allow contact access to pick emergency contacts');
    }
  };

  const saveContact = async (newContact) => {
    const updatedContacts = [...contacts, newContact];
    updateBackend(updatedContacts);
  };

  const deleteContact = (index) => {
    const updatedContacts = contacts.filter((_, i) => i !== index);
    updateBackend(updatedContacts);
  };

  const updateBackend = async (updatedContacts) => {
    setLoading(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      await axios.put(`${API_URL}/auth/contacts/${userId}`, {
        emergencyContacts: updatedContacts
      });
      setContacts(updatedContacts);
      Alert.alert('Success', 'Contacts updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update contacts');
    } finally {
      setLoading(false);
    }
  };

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
    subtitle: {
      color: colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 25,
    },
    contactCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.card,
      borderRadius: 18,
      padding: 15,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.surfaceLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    contactName: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
    },
    contactPhone: {
      color: colors.textSecondary,
      fontSize: 14,
    },
    addBtn: {
      backgroundColor: colors.primary,
      height: 60,
      borderRadius: 18,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      marginBottom: 20,
      marginTop: 10,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    }
  });

  const renderItem = ({ item, index }) => (
    <View style={dynamicStyles.contactCard}>
      <View style={styles.contactInfo}>
        <View style={dynamicStyles.avatar}>
          <User color={colors.textSecondary} size={24} />
        </View>
        <View>
          <Text style={dynamicStyles.contactName}>{item.name}</Text>
          <View style={styles.phoneRow}>
            <Phone size={14} color={colors.textSecondary} />
            <Text style={dynamicStyles.contactPhone}>{item.phone}</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity onPress={() => deleteContact(index)}>
        <Trash2 color={colors.danger} size={20} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color={colors.text} size={24} />
        </TouchableOpacity>
        <View style={styles.headerTitleRow}>
          <Heart color="#ff2d55" size={24} fill="#ff2d55" />
          <Text style={dynamicStyles.headerTitle}>Emergency Contacts</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={dynamicStyles.subtitle}>
          These contacts will be notified instantly in case of an emergency alert.
        </Text>

        {loading && contacts.length === 0 ? (
          <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={contacts}
            renderItem={renderItem}
            keyExtractor={(_, index) => index.toString()}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <User size={60} color={colors.border} />
                <Text style={{ color: colors.textSecondary, marginTop: 15, fontSize: 16 }}>No emergency contacts added yet</Text>
              </View>
            }
            contentContainerStyle={styles.list}
          />
        )}

        <TouchableOpacity style={dynamicStyles.addBtn} onPress={pickContact}>
          <Plus color="#fff" size={24} />
          <Text style={styles.addBtnText}>Add From Contacts</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backBtn: {
    marginRight: 15,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  list: {
    paddingBottom: 20,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
});

export default ContactsScreen;
