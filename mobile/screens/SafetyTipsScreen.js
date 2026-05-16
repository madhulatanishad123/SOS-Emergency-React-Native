import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Shield, Phone, MapPin, Eye, ArrowLeft, Heart, Info } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';

const SafetyTipsScreen = () => {
  const navigation = useNavigation();
  const { colors, isDarkMode } = useTheme();

  const tips = [
    {
      title: 'Trust Your Instincts',
      desc: 'If a situation or person feels "off," remove yourself immediately without worrying about being polite.',
      icon: <Eye color="#ff2d55" size={24} />
    },
    {
      title: 'Be Aware of Surroundings',
      desc: 'Avoid using headphones or being distracted by your phone while walking in unfamiliar areas.',
      icon: <MapPin color={colors.secondary} size={24} />
    },
    {
      title: 'Share Your Schedule',
      desc: 'Let a trusted friend or family member know where you are going and when you expect to return.',
      icon: <Heart color={colors.warning} size={24} />
    },
    {
      title: 'Public Transport Safety',
      desc: 'Wait for buses/trains in well-lit areas and try to sit near the driver or in a crowded compartment.',
      icon: <Phone color={colors.success} size={24} />
    },
    {
      title: 'Digital Safety',
      desc: 'Be cautious about sharing your live location on social media. Check your privacy settings regularly.',
      icon: <Shield color={colors.accent} size={24} />
    },
    {
      title: 'Self-Defense Basics',
      desc: 'Consider taking a basic self-defense class. Knowing even a few moves can increase your confidence.',
      icon: <Info color={colors.primary} size={24} />
    }
  ];

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
    introTitle: {
      color: colors.text,
      fontSize: 22,
      fontWeight: '800',
      marginTop: 15,
    },
    introDesc: {
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 10,
      lineHeight: 20,
    },
    tipCard: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 20,
      marginBottom: 15,
      borderWidth: 1,
      borderColor: colors.border,
    },
    tipTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '700',
      flex: 1,
    },
    tipDesc: {
      color: colors.textSecondary,
      fontSize: 14,
      lineHeight: 22,
    }
  });

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color={colors.text} size={24} />
        </TouchableOpacity>
        <Text style={dynamicStyles.headerTitle}>Safety Tips</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.introCard, { backgroundColor: `${colors.primary}15`, borderColor: `${colors.primary}25` }]}>
          <Shield color={colors.primary} size={40} />
          <Text style={dynamicStyles.introTitle}>Stay Empowered</Text>
          <Text style={dynamicStyles.introDesc}>Knowledge is your best defense. Here are essential safety practices for your daily life.</Text>
        </View>

        {tips.map((tip, index) => (
          <View key={index} style={dynamicStyles.tipCard}>
            <View style={styles.tipHeader}>
              <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f0f0f0' }]}>{tip.icon}</View>
              <Text style={dynamicStyles.tipTitle}>{tip.title}</Text>
            </View>
            <Text style={dynamicStyles.tipDesc}>{tip.desc}</Text>
          </View>
        ))}

        <View style={[styles.emergencyBanner, { backgroundColor: colors.primary }]}>
          <Text style={styles.bannerText}>In case of immediate danger, use the SOS button on the home screen.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backBtn: {
    marginRight: 15,
  },
  content: {
    padding: 20,
  },
  introCard: {
    borderRadius: 24,
    padding: 25,
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 1,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  emergencyBanner: {
    borderRadius: 18,
    padding: 20,
    marginTop: 20,
    marginBottom: 40,
  },
  bannerText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 15,
  },
});

export default SafetyTipsScreen;
