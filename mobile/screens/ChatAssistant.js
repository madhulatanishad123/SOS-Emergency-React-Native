import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, Shield, User, Bot, ArrowLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { API_URL } from '../constants';
import { useTheme } from '../context/ThemeContext';

const ChatAssistant = () => {
  const navigation = useNavigation();
  const { colors, isDarkMode } = useTheme();
  const [messages, setMessages] = useState([
    { text: "Hello! I am your 24/7 Safety Assistant. How can I help you stay safe today?", sender: 'AI_ASSISTANT', time: new Date() }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef();

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMsg = { text: inputText, sender: 'USER', time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/chat/message`, { message: inputText });
      const aiMsg = { text: response.data.reply, sender: 'AI_ASSISTANT', time: new Date() };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const errMsg = { text: "I'm having trouble connecting. Please try again or use the SOS button.", sender: 'AI_ASSISTANT', time: new Date() };
      setMessages(prev => [...prev, errMsg]);
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
      fontSize: 18,
      fontWeight: '700',
    },
    messageText: {
      color: '#fff',
      fontSize: 15,
      lineHeight: 20,
    },
    aiBubble: {
      alignSelf: 'flex-start',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderBottomLeftRadius: 4,
    },
    aiMessageText: {
      color: colors.text,
      fontSize: 15,
      lineHeight: 20,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 15,
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: 12,
    },
    input: {
      flex: 1,
      minHeight: 50,
      maxHeight: 100,
      backgroundColor: colors.surfaceLight,
      borderRadius: 25,
      paddingHorizontal: 20,
      paddingVertical: 12,
      color: colors.text,
      fontSize: 15,
      borderWidth: 1,
      borderColor: colors.border,
    }
  });

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft color={colors.text} size={24} />
        </TouchableOpacity>
        <View style={[styles.headerIcon, { backgroundColor: colors.primary }]}>
          <Shield size={24} color="white" />
        </View>
        <View>
          <Text style={dynamicStyles.headerTitle}>Safety Assistant</Text>
          <Text style={styles.headerStatus}>Online 24/7</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.chatArea}
        ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
      >
        {messages.map((msg, index) => (
          <View 
            key={index} 
            style={[
              styles.messageBubble, 
              msg.sender === 'USER' ? styles.userBubble : dynamicStyles.aiBubble,
              msg.sender === 'USER' && { backgroundColor: colors.primary }
            ]}
          >
            <Text style={msg.sender === 'USER' ? dynamicStyles.messageText : dynamicStyles.aiMessageText}>
              {msg.text}
            </Text>
            <Text style={[styles.messageTime, msg.sender === 'AI_ASSISTANT' && { color: colors.textSecondary }]}>
              {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        ))}
        {loading && (
          <View style={[styles.messageBubble, dynamicStyles.aiBubble, styles.loadingBubble]}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        )}
      </ScrollView>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={dynamicStyles.inputContainer}>
          <TextInput
            style={dynamicStyles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type your safety concern..."
            placeholderTextColor={colors.textSecondary}
            multiline
          />
          <TouchableOpacity style={[styles.sendButton, { backgroundColor: colors.primary }]} onPress={handleSend}>
            <Send size={24} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    gap: 15,
  },
  headerIcon: {
    width: 45,
    height: 45,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerStatus: {
    color: '#34c759',
    fontSize: 12,
    fontWeight: '600',
  },
  chatArea: {
    flex: 1,
    padding: 15,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 18,
    marginBottom: 15,
    maxWidth: '85%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  messageTime: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
    marginTop: 5,
    alignSelf: 'flex-end',
  },
  loadingBubble: {
    width: 60,
    alignItems: 'center',
  },
  sendButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ChatAssistant;
