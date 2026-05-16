import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('userTheme');
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'dark');
      } else {
        setIsDarkMode(systemColorScheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newMode = !isDarkMode;
      setIsDarkMode(newMode);
      await AsyncStorage.setItem('userTheme', newMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const theme = {
    isDarkMode,
    toggleTheme,
    colors: isDarkMode ? darkColors : lightColors,
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

const darkColors = {
  background: '#0a0a0c',
  surface: '#1c1c1e',
  surfaceLight: '#2c2c2e',
  text: '#ffffff',
  textSecondary: '#a0a0a0',
  primary: '#ff3b30',
  secondary: '#007aff',
  accent: '#5856d6',
  success: '#34c759',
  warning: '#ff9500',
  border: '#2c2c2e',
  card: '#161618',
  danger: '#ff3b30',
};

const lightColors = {
  background: '#f2f2f7',
  surface: '#ffffff',
  surfaceLight: '#f9f9f9',
  text: '#1c1c1e',
  textSecondary: '#8e8e93',
  primary: '#ff3b30',
  secondary: '#007aff',
  accent: '#5856d6',
  success: '#34c759',
  warning: '#ff9500',
  border: '#e5e5ea',
  card: '#ffffff',
  danger: '#ff3b30',
};
