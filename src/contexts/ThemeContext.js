// Contexto de tema para gestionar light, dark y auto
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Themes, LightTheme, DarkTheme } from '../config/colors';
import CONFIG from '../config/config';

// Clave para almacenar la preferencia de tema
const THEME_STORAGE_KEY = '@dashboard_theme';

// Crear el contexto
const ThemeContext = createContext({
  theme: LightTheme,
  themeMode: 'auto',
  isDark: false,
  isLight: true,
  setThemeMode: () => {},
  toggleTheme: () => {},
  systemTheme: 'light',
});

// Provider del tema
export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeModeState] = useState(CONFIG.DEFAULT_THEME || 'auto');
  const [systemTheme, setSystemTheme] = useState(Appearance.getColorScheme() || 'light');

  // Calcular el tema actual basado en el modo y tema del sistema
  const currentTheme = (() => {
    if (themeMode === 'auto') {
      return systemTheme === 'dark' ? DarkTheme : LightTheme;
    }
    return themeMode === 'dark' ? DarkTheme : LightTheme;
  })();

  const isDark = currentTheme === DarkTheme;
  const isLight = currentTheme === LightTheme;

  // Cargar tema guardado al inicializar
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme && Object.values(CONFIG.THEMES).includes(savedTheme)) {
          setThemeModeState(savedTheme);
        }
      } catch (error) {
        console.log('Error cargando tema guardado:', error);
      }
    };

    loadTheme();
  }, []);

  // Escuchar cambios del tema del sistema
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemTheme(colorScheme || 'light');
      console.log(`🎨 Tema del sistema cambió a: ${colorScheme}`);
    });

    return () => subscription?.remove();
  }, []);

  // Función para cambiar el modo de tema
  const setThemeMode = useCallback(async (mode) => {
    if (!Object.values(CONFIG.THEMES).includes(mode)) {
      console.warn(`Modo de tema no válido: ${mode}`);
      return;
    }

    setThemeModeState(mode);
    
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      console.log(`🎨 Tema cambiado a: ${mode}`);
    } catch (error) {
      console.error('Error guardando tema:', error);
    }
  }, []);

  // Función para alternar entre light y dark (excluye auto)
  const toggleTheme = useCallback(() => {
    const newMode = isDark ? 'light' : 'dark';
    setThemeMode(newMode);
  }, [isDark, setThemeMode]);

  // Función para obtener el siguiente tema en el ciclo
  const cycleTheme = useCallback(() => {
    const modes = ['light', 'dark', 'auto'];
    const currentIndex = modes.indexOf(themeMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setThemeMode(modes[nextIndex]);
  }, [themeMode, setThemeMode]);

  // Funciones de conveniencia
  const setLightTheme = useCallback(() => setThemeMode('light'), [setThemeMode]);
  const setDarkTheme = useCallback(() => setThemeMode('dark'), [setThemeMode]);
  const setAutoTheme = useCallback(() => setThemeMode('auto'), [setThemeMode]);

  // Información del tema
  const getThemeInfo = useCallback(() => {
    return {
      mode: themeMode,
      system: systemTheme,
      effective: isDark ? 'dark' : 'light',
      isUsingSystemTheme: themeMode === 'auto',
    };
  }, [themeMode, systemTheme, isDark]);

  const value = {
    // Estado del tema
    theme: currentTheme,
    themeMode,
    isDark,
    isLight,
    systemTheme,
    
    // Funciones de control
    setThemeMode,
    toggleTheme,
    cycleTheme,
    
    // Funciones de conveniencia
    setLightTheme,
    setDarkTheme,
    setAutoTheme,
    
    // Información adicional
    getThemeInfo,
    
    // Acceso directo a temas
    themes: Themes,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook para usar el tema
export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme debe ser usado dentro de un ThemeProvider');
  }
  
  return context;
};

// Hook para obtener solo los colores del tema actual
export const useThemeColors = () => {
  const { theme } = useTheme();
  return theme;
};

// Hook para obtener información del tema
export const useThemeInfo = () => {
  const { getThemeInfo } = useTheme();
  return getThemeInfo();
};

export default ThemeProvider;
