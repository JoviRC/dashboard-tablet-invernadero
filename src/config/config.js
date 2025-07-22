// Configuración de la aplicación
export const CONFIG = {
  // URL base de la API
  API_BASE_URL: 'http://192.168.100.17:4201',
  
  // ID del usuario por defecto para pruebas
  DEFAULT_USER_ID: 1,
  
  // Intervalos de actualización (en milisegundos)
  UPDATE_INTERVALS: {
    SENSORS: 30000,      // 30 segundos
    DEVICES: 30000,      // 30 segundos
    CHARTS: 60000,       // 1 minuto
  },
  
  // Configuración de los sensores
  SENSOR_DEFAULTS: {
    temperature: {
      min: 0,
      max: 50,
      ideal: { min: 18, max: 30 },
      unit: '°C'
    },
    airHumidity: {
      min: 0,
      max: 100,
      ideal: { min: 40, max: 80 },
      unit: '%'
    },
    soilHumidity: {
      min: 0,
      max: 100,
      ideal: { min: 30, max: 70 },
      unit: '%'
    },
    soilPH: {
      min: 0,
      max: 14,
      ideal: { min: 6.0, max: 7.5 },
      unit: 'pH'
    }
  },
  
  // Configuración de alertas
  ALERT_THRESHOLDS: {
    CRITICAL_MULTIPLIER: 0.8,  // 80% del rango ideal para alertas críticas
    WARNING_MULTIPLIER: 0.9,   // 90% del rango ideal para alertas de advertencia
  },
  
  // Configuración de la aplicación
  APP: {
    NAME: 'Dashboard Invernadero',
    VERSION: '1.0.0',
    ORIENTATION: 'landscape',
  }
};

export default CONFIG;
