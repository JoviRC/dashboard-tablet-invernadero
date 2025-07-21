// Sistema de colores con soporte para temas light, dark y auto
// Configuración global de colores para el Dashboard del Invernadero

// === COLORES BASE (independientes del tema) ===
const BaseColors = {
  // Colores de estado (semáforo)
  success: '#27AE60',
  good: '#4CAF50',
  warning: '#F39C12',
  caution: '#FF9800',
  danger: '#E74C3C',
  critical: '#E74C3C',
  error: '#F44336',
  
  // Colores de acento
  primary: '#2196F3',
  secondary: '#FF5722',
  accent: '#9C27B0',
  
  // Transparencias
  overlay: 'rgba(0, 0, 0, 0.5)',
  shadow: 'rgba(0, 0, 0, 0.15)',
};

// === TEMA CLARO ===
const LightTheme = {
  ...BaseColors,
  
  // Fondos
  background: '#F8F9FA',
  surface: '#FFFFFF',
  surfaceVariant: '#F5F5F5',
  cardBackground: '#FFFFFF',
  headerBackground: '#FFFFFF',
  
  // Textos
  text: '#212121',              // Alias para textPrimary
  textPrimary: '#212121',
  textSecondary: '#757575',
  textTertiary: '#9E9E9E',
  textOnSurface: '#212121',
  textOnPrimary: '#FFFFFF',
  textOnDark: '#FFFFFF',        // Texto sobre fondos oscuros
  textLight: '#BDBDBD',
  
  // Bordes y divisores
  border: '#E0E0E0',
  divider: '#E0E0E0',
  separator: '#F0F0F0',
  
  // Estados
  disabled: '#E0E0E0',
  inactive: '#F5F5F5',
  active: '#4CAF50',            // Color para estados activos
  selected: '#E3F2FD',
  pressed: '#F0F0F0',
  
  // Fondos secundarios
  backgroundSecondary: '#F8F9FA',
  
  // Sensor específicos
  sensor: {
    optimal: '#27AE60',
    good: '#4CAF50',
    warning: '#F39C12',
    danger: '#E74C3C',
    offline: '#9E9E9E',
    background: '#FFFFFF',
    border: '#E0E0E0',
  },
  
  // Colores específicos del dashboard
  dashboard: {
    alertBackground: '#FFF3E0',
    alertBorder: '#FFB74D',
    connectionSuccess: '#E8F5E8',
    connectionWarning: '#FFF3E0',
    connectionError: '#FFEBEE',
  }
};

// === TEMA OSCURO ===
const DarkTheme = {
  ...BaseColors,
  
  // Fondos
  background: '#121212',
  surface: '#1E1E1E',
  surfaceVariant: '#2C2C2C',
  cardBackground: '#1E1E1E',
  headerBackground: '#1E1E1E',
  
  // Textos
  text: '#E0E0E0',              // Alias para textPrimary
  textPrimary: '#E0E0E0',
  textSecondary: '#B0B0B0',
  textTertiary: '#888888',
  textOnSurface: '#E0E0E0',
  textOnPrimary: '#121212',
  textOnDark: '#E0E0E0',        // Texto sobre fondos oscuros
  textLight: '#666666',
  
  // Bordes y divisores
  border: '#404040',
  divider: '#404040',
  separator: '#2C2C2C',
  
  // Estados
  disabled: '#404040',
  inactive: '#2C2C2C',
  active: '#4CAF50',            // Color para estados activos
  selected: '#1A237E',
  pressed: '#404040',
  
  // Fondos secundarios
  backgroundSecondary: '#2C2C2C',
  
  // Sensor específicos
  sensor: {
    optimal: '#4CAF50',
    good: '#66BB6A',
    warning: '#FFA726',
    danger: '#EF5350',
    offline: '#757575',
    background: '#1E1E1E',
    border: '#404040',
  },
  
  // Colores específicos del dashboard
  dashboard: {
    alertBackground: '#2C1810',
    alertBorder: '#5D4037',
    connectionSuccess: '#1B2A1B',
    connectionWarning: '#2C1810',
    connectionError: '#2C1214',
  }
};

// === TEMAS DISPONIBLES ===
export const Themes = {
  light: LightTheme,
  dark: DarkTheme,
};

// === FUNCIONES HELPER ===
export const ColorHelpers = {
  // Función para obtener color con transparencia
  withOpacity: (color, opacity) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  },
  
  // Función para obtener color según estado de sensor
  getSensorColor: (status, theme = LightTheme) => {
    switch (status) {
      case 'optimal': 
      case 'good': 
      case 'normal': 
        return theme.sensor.optimal;
      case 'warning': 
      case 'caution': 
        return theme.sensor.warning;
      case 'danger': 
      case 'critical': 
      case 'error': 
        return theme.sensor.danger;
      case 'offline': 
      case 'disconnected': 
        return theme.sensor.offline;
      default: 
        return theme.sensor.optimal;
    }
  },
  
  // Función para obtener color según tipo de alerta
  getAlertColor: (type, theme = LightTheme) => {
    switch (type) {
      case 'info': 
        return theme.success;
      case 'warning': 
        return theme.warning;
      case 'critical': 
      case 'error': 
        return theme.danger;
      default: 
        return theme.warning;
    }
  }
};

// === COLORES LEGACY (para compatibilidad) ===
const Colors = LightTheme;

export { BaseColors, LightTheme, DarkTheme };
export default Colors;
