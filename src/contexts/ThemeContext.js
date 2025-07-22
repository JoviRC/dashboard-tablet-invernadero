import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance, Platform } from 'react-native';
import StorageUtils from '../utils/storage';

// Definir temas disponibles
const themes = {
  light: {
    name: 'light',
    isDark: false,
    colors: {
      // Material Design 3 - Light Theme
      background: '#ffffff',
      onBackground: '#1C1B1F',
      surface: '#f5f5f5',
      onSurface: '#1C1B1F',
      surfaceVariant: '#e7e0ec',
      onSurfaceVariant: '#49454F',
      outline: '#79747E',
      primary: '#4CAF50',
      onPrimary: '#ffffff',
      primaryContainer: '#C8E6C9',
      onPrimaryContainer: '#2E7D32',
      secondary: '#2196F3',
      onSecondary: '#ffffff',
      secondaryContainer: '#BBDEFB',
      onSecondaryContainer: '#0D47A1',
      tertiary: '#FF9800',
      onTertiary: '#ffffff',
      tertiaryContainer: '#FFE0B2',
      onTertiaryContainer: '#E65100',
      error: '#F44336',
      onError: '#ffffff',
      errorContainer: '#FFEBEE',
      onErrorContainer: '#B71C1C',
      warning: '#FF9800',
      onWarning: '#ffffff',
      warningContainer: '#FFF3E0',
      onWarningContainer: '#E65100',
      success: '#4CAF50',
      onSuccess: '#ffffff',
      successContainer: '#E8F5E8',
      onSuccessContainer: '#2E7D32',
      info: '#2196F3',
      onInfo: '#ffffff',
      infoContainer: '#E3F2FD',
      onInfoContainer: '#0D47A1',
      // Legacy compatibility
      shadow: 'rgba(0, 0, 0, 0.1)',
    }
  },
  dark: {
    name: 'dark',
    isDark: true,
    colors: {
      // Material Design 3 - Dark Theme
      background: '#121212',
      onBackground: '#C7C7C7',
      surface: '#1e1e1e',
      onSurface: '#C7C7C7',
      surfaceVariant: '#49454F',
      onSurfaceVariant: '#A0A0A0',
      outline: '#7A7A7A',
      primary: '#66BB6A',
      onPrimary: '#1B5E20',
      primaryContainer: '#2E7D32',
      onPrimaryContainer: '#C8E6C9',
      secondary: '#42A5F5',
      onSecondary: '#0D47A1',
      secondaryContainer: '#1976D2',
      onSecondaryContainer: '#BBDEFB',
      tertiary: '#FFB74D',
      onTertiary: '#E65100',
      tertiaryContainer: '#FF9800',
      onTertiaryContainer: '#FFE0B2',
      error: '#EF5350',
      onError: '#B71C1C',
      errorContainer: '#D32F2F',
      onErrorContainer: '#FFEBEE',
      warning: '#FFB74D',
      onWarning: '#E65100',
      warningContainer: '#FF9800',
      onWarningContainer: '#FFF3E0',
      success: '#66BB6A',
      onSuccess: '#1B5E20',
      successContainer: '#2E7D32',
      onSuccessContainer: '#E8F5E8',
      info: '#42A5F5',
      onInfo: '#0D47A1',
      infoContainer: '#1976D2',
      onInfoContainer: '#E3F2FD',
      // Legacy compatibility
      shadow: 'rgba(0, 0, 0, 0.3)',
    }
  },
  green: {
    name: 'green',
    isDark: false,
    colors: {
      // Green themed - Light
      background: '#f1f8e9',
      onBackground: '#1B5E20',
      surface: '#e8f5e8',
      onSurface: '#1B5E20',
      surfaceVariant: '#C8E6C9',
      onSurfaceVariant: '#2E7D32',
      outline: '#66BB6A',
      primary: '#2E7D32',
      onPrimary: '#ffffff',
      primaryContainer: '#A5D6A7',
      onPrimaryContainer: '#1B5E20',
      secondary: '#388E3C',
      onSecondary: '#ffffff',
      secondaryContainer: '#C8E6C9',
      onSecondaryContainer: '#1B5E20',
      tertiary: '#66BB6A',
      onTertiary: '#ffffff',
      tertiaryContainer: '#E8F5E8',
      onTertiaryContainer: '#2E7D32',
      error: '#F44336',
      onError: '#ffffff',
      errorContainer: '#FFEBEE',
      onErrorContainer: '#B71C1C',
      warning: '#FF9800',
      onWarning: '#ffffff',
      warningContainer: '#FFF3E0',
      onWarningContainer: '#E65100',
      success: '#4CAF50',
      onSuccess: '#ffffff',
      successContainer: '#E8F5E8',
      onSuccessContainer: '#2E7D32',
      info: '#2196F3',
      onInfo: '#ffffff',
      infoContainer: '#E3F2FD',
      onInfoContainer: '#0D47A1',
      shadow: 'rgba(46, 125, 50, 0.1)',
    }
  },
  blue: {
    name: 'blue',
    isDark: false,
    colors: {
      // Blue themed - Light
      background: '#e3f2fd',
      onBackground: '#0D47A1',
      surface: '#e1f5fe',
      onSurface: '#0D47A1',
      surfaceVariant: '#BBDEFB',
      onSurfaceVariant: '#1565C0',
      outline: '#42A5F5',
      primary: '#1565C0',
      onPrimary: '#ffffff',
      primaryContainer: '#90CAF9',
      onPrimaryContainer: '#0D47A1',
      secondary: '#1976D2',
      onSecondary: '#ffffff',
      secondaryContainer: '#BBDEFB',
      onSecondaryContainer: '#0D47A1',
      tertiary: '#42A5F5',
      onTertiary: '#ffffff',
      tertiaryContainer: '#E3F2FD',
      onTertiaryContainer: '#1565C0',
      error: '#F44336',
      onError: '#ffffff',
      errorContainer: '#FFEBEE',
      onErrorContainer: '#B71C1C',
      warning: '#FF9800',
      onWarning: '#ffffff',
      warningContainer: '#FFF3E0',
      onWarningContainer: '#E65100',
      success: '#4CAF50',
      onSuccess: '#ffffff',
      successContainer: '#E8F5E8',
      onSuccessContainer: '#2E7D32',
      info: '#2196F3',
      onInfo: '#ffffff',
      infoContainer: '#E3F2FD',
      onInfoContainer: '#0D47A1',
      shadow: 'rgba(21, 101, 192, 0.1)',
    }
  }
};

// Crear el contexto
const ThemeContext = createContext();

// Provider del contexto
export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('light');
  const [isSystemTheme, setIsSystemTheme] = useState(true);

  // Cargar tema guardado al inicializar
  useEffect(() => {
    loadSavedTheme();
  }, []);

  // Escuchar cambios del tema del sistema
  useEffect(() => {
    if (isSystemTheme) {
      const subscription = Appearance.addChangeListener(({ colorScheme }) => {
        if (colorScheme === 'dark' || colorScheme === 'light') {
          setCurrentTheme(colorScheme);
        }
      });

      return () => subscription?.remove();
    }
  }, [isSystemTheme]);

  const loadSavedTheme = async () => {
    try {
      const savedTheme = await StorageUtils.getItem('selectedTheme');
      const savedIsSystemTheme = await StorageUtils.getItem('isSystemTheme');
      
      if (savedIsSystemTheme !== null) {
        const useSystemTheme = JSON.parse(savedIsSystemTheme);
        setIsSystemTheme(useSystemTheme);
        
        if (useSystemTheme) {
          const systemTheme = Appearance.getColorScheme();
          setCurrentTheme(systemTheme === 'dark' ? 'dark' : 'light');
        } else if (savedTheme) {
          setCurrentTheme(savedTheme);
        }
      } else {
        // Primera vez - usar tema del sistema por defecto
        const systemTheme = Appearance.getColorScheme();
        setCurrentTheme(systemTheme === 'dark' ? 'dark' : 'light');
      }
    } catch (error) {
      console.warn('Error loading saved theme:', error);
      // Fallback al tema del sistema
      const systemTheme = Appearance.getColorScheme();
      setCurrentTheme(systemTheme === 'dark' ? 'dark' : 'light');
    }
  };

  const changeTheme = async (themeName) => {
    try {
      setCurrentTheme(themeName);
      setIsSystemTheme(false);
      await StorageUtils.setItem('selectedTheme', themeName);
      await StorageUtils.setItem('isSystemTheme', JSON.stringify(false));
    } catch (error) {
      console.warn('Error saving theme:', error);
    }
  };

  const toggleSystemTheme = async (useSystem) => {
    try {
      setIsSystemTheme(useSystem);
      await StorageUtils.setItem('isSystemTheme', JSON.stringify(useSystem));
      
      if (useSystem) {
        const systemTheme = Appearance.getColorScheme();
        setCurrentTheme(systemTheme === 'dark' ? 'dark' : 'light');
      }
    } catch (error) {
      console.warn('Error toggling system theme:', error);
    }
  };

  const theme = themes[currentTheme] || themes.light;
  const isDark = theme.isDark;

  const value = {
    theme,
    isDark,
    currentTheme,
    isSystemTheme,
    availableThemes: Object.keys(themes),
    changeTheme,
    toggleSystemTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook para usar el contexto
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
