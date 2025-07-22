// Utilidades para almacenamiento local de datos del invernadero

class StorageUtils {
  static KEYS = {
    USER_PREFERENCES: 'greenhouse_user_preferences',
    SENSOR_HISTORY: 'greenhouse_sensor_history',
    DEVICE_SETTINGS: 'greenhouse_device_settings',
    CUSTOM_RANGES: 'greenhouse_custom_ranges'
  };

  // Guardar preferencias del usuario
  static saveUserPreferences(preferences) {
    try {
      localStorage.setItem(this.KEYS.USER_PREFERENCES, JSON.stringify(preferences));
    } catch (error) {
      console.warn('Error saving user preferences:', error);
    }
  }

  // Obtener preferencias del usuario
  static getUserPreferences() {
    try {
      const stored = localStorage.getItem(this.KEYS.USER_PREFERENCES);
      return stored ? JSON.parse(stored) : {
        refreshInterval: 30000,
        temperatureUnit: 'C',
        theme: 'light',
        chartTimeRange: '24h'
      };
    } catch (error) {
      console.warn('Error loading user preferences:', error);
      return {};
    }
  }

  // Guardar historial de sensores (solo los últimos N valores)
  static saveSensorHistory(sensorData, maxItems = 100) {
    try {
      const currentHistory = this.getSensorHistory();
      const timestamp = new Date().toISOString();
      
      // Agregar nuevos datos
      Object.keys(sensorData).forEach(sensorKey => {
        if (!currentHistory[sensorKey]) {
          currentHistory[sensorKey] = {
            values: [],
            timestamps: []
          };
        }
        
        currentHistory[sensorKey].values.push(sensorData[sensorKey].current);
        currentHistory[sensorKey].timestamps.push(timestamp);
        
        // Mantener solo los últimos maxItems
        if (currentHistory[sensorKey].values.length > maxItems) {
          currentHistory[sensorKey].values = currentHistory[sensorKey].values.slice(-maxItems);
          currentHistory[sensorKey].timestamps = currentHistory[sensorKey].timestamps.slice(-maxItems);
        }
      });
      
      localStorage.setItem(this.KEYS.SENSOR_HISTORY, JSON.stringify(currentHistory));
    } catch (error) {
      console.warn('Error saving sensor history:', error);
    }
  }

  // Obtener historial de sensores
  static getSensorHistory() {
    try {
      const stored = localStorage.getItem(this.KEYS.SENSOR_HISTORY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.warn('Error loading sensor history:', error);
      return {};
    }
  }

  // Guardar configuraciones de dispositivos
  static saveDeviceSettings(deviceSettings) {
    try {
      localStorage.setItem(this.KEYS.DEVICE_SETTINGS, JSON.stringify(deviceSettings));
    } catch (error) {
      console.warn('Error saving device settings:', error);
    }
  }

  // Obtener configuraciones de dispositivos
  static getDeviceSettings() {
    try {
      const stored = localStorage.getItem(this.KEYS.DEVICE_SETTINGS);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.warn('Error loading device settings:', error);
      return {};
    }
  }

  // Guardar rangos personalizados
  static saveCustomRanges(ranges) {
    try {
      localStorage.setItem(this.KEYS.CUSTOM_RANGES, JSON.stringify(ranges));
    } catch (error) {
      console.warn('Error saving custom ranges:', error);
    }
  }

  // Obtener rangos personalizados
  static getCustomRanges() {
    try {
      const stored = localStorage.getItem(this.KEYS.CUSTOM_RANGES);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.warn('Error loading custom ranges:', error);
      return {};
    }
  }

  // Limpiar todos los datos almacenados
  static clearAllData() {
    try {
      Object.values(this.KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.warn('Error clearing storage:', error);
    }
  }

  // Obtener tamaño total del almacenamiento usado
  static getStorageSize() {
    try {
      let totalSize = 0;
      Object.values(this.KEYS).forEach(key => {
        const item = localStorage.getItem(key);
        if (item) {
          totalSize += item.length;
        }
      });
      return totalSize;
    } catch (error) {
      return 0;
    }
  }

  // Métodos genéricos para cualquier clave
  static async setItem(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn('Error setting item:', error);
      return false;
    }
  }

  static async getItem(key) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('Error getting item:', error);
      return null;
    }
  }

  static async removeItem(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn('Error removing item:', error);
      return false;
    }
  }

  // Limpiar alertas descartadas antiguas
  static cleanOldDismissedAlerts(maxAgeHours = 24) {
    try {
      const dismissed = this.getDismissedAlerts();
      const now = Date.now();
      const maxAge = maxAgeHours * 60 * 60 * 1000; // Convertir horas a milisegundos
      
      const filteredDismissed = dismissed.filter(item => {
        return (now - item.timestamp) < maxAge;
      });
      
      this.setDismissedAlerts(filteredDismissed);
      
      return filteredDismissed.length;
    } catch (error) {
      console.warn('Error cleaning old dismissed alerts:', error);
      return 0;
    }
  }

  // Obtener alertas descartadas
  static getDismissedAlerts() {
    try {
      const stored = localStorage.getItem('dismissed_alerts');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Error getting dismissed alerts:', error);
      return [];
    }
  }

  // Guardar alertas descartadas
  static setDismissedAlerts(dismissedAlerts) {
    try {
      localStorage.setItem('dismissed_alerts', JSON.stringify(dismissedAlerts));
      return true;
    } catch (error) {
      console.warn('Error setting dismissed alerts:', error);
      return false;
    }
  }

  // Agregar una alerta descartada
  static addDismissedAlert(alertId) {
    try {
      const dismissed = this.getDismissedAlerts();
      const timestamp = Date.now();
      
      // Evitar duplicados
      if (!dismissed.find(item => item.id === alertId)) {
        dismissed.push({ id: alertId, timestamp });
        this.setDismissedAlerts(dismissed);
      }
      
      return true;
    } catch (error) {
      console.warn('Error adding dismissed alert:', error);
      return false;
    }
  }

  // Verificar si una alerta está descartada
  static isAlertDismissed(alertId) {
    try {
      const dismissed = this.getDismissedAlerts();
      return dismissed.some(item => item.id === alertId);
    } catch (error) {
      console.warn('Error checking dismissed alert:', error);
      return false;
    }
  }

  // Filtrar alertas que han sido descartadas
  static filterDismissedAlerts(alerts) {
    try {
      if (!Array.isArray(alerts)) {
        console.warn('filterDismissedAlerts: alerts is not an array:', alerts);
        return [];
      }
      
      const dismissed = this.getDismissedAlerts();
      const dismissedIds = dismissed.map(item => item.id);
      
      return alerts.filter(alert => {
        const alertId = alert.id || alert.alertId || alert.key;
        return !dismissedIds.includes(alertId);
      });
    } catch (error) {
      console.warn('Error filtering dismissed alerts:', error);
      return alerts || [];
    }
  }
}

export default StorageUtils;
