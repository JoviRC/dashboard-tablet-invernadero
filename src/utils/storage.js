// Utilidades para almacenamiento local de datos del invernadero

class StorageUtils {
  static KEYS = {
    USER_PREFERENCES: 'greenhouse_user_preferences',
    SENSOR_HISTORY: 'greenhouse_sensor_history',
    DEVICE_SETTINGS: 'greenhouse_device_settings',
    CUSTOM_RANGES: 'greenhouse_custom_ranges',
    DISMISSED_ALERTS: 'greenhouse_dismissed_alerts'
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

  // === GESTIÓN DE ALERTAS DESCARTADAS ===

  // Generar un ID único para una alerta basado en su contenido
  static generateAlertHash(alert) {
    // Crear un hash simple basado en el contenido de la alerta
    const content = `${alert.type}_${alert.sensorKey}_${alert.message}`;
    return btoa(content).replace(/[^A-Za-z0-9]/g, ''); // Base64 limpio
  }

  // Marcar una alerta como descartada
  static dismissAlert(alert) {
    try {
      const dismissedAlerts = this.getDismissedAlerts();
      const alertHash = this.generateAlertHash(alert);
      
      // Añadir a la lista de descartadas con timestamp
      dismissedAlerts[alertHash] = {
        dismissedAt: new Date().toISOString(),
        alertType: alert.type,
        sensorKey: alert.sensorKey,
        message: alert.message,
        count: (dismissedAlerts[alertHash]?.count || 0) + 1
      };

      localStorage.setItem(this.KEYS.DISMISSED_ALERTS, JSON.stringify(dismissedAlerts));
      console.log(`📝 Alerta descartada: ${alert.type} - ${alert.message}`);
    } catch (error) {
      console.warn('Error dismissing alert:', error);
    }
  }

  // Obtener alertas descartadas
  static getDismissedAlerts() {
    try {
      const stored = localStorage.getItem(this.KEYS.DISMISSED_ALERTS);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.warn('Error loading dismissed alerts:', error);
      return {};
    }
  }

  // Verificar si una alerta ya fue descartada
  static isAlertDismissed(alert) {
    try {
      const dismissedAlerts = this.getDismissedAlerts();
      const alertHash = this.generateAlertHash(alert);
      return !!dismissedAlerts[alertHash];
    } catch (error) {
      console.warn('Error checking dismissed alert:', error);
      return false;
    }
  }

  // Filtrar alertas, excluyendo las ya descartadas
  static filterDismissedAlerts(alerts) {
    try {
      const dismissedAlerts = this.getDismissedAlerts();
      
      return alerts.filter(alert => {
        const alertHash = this.generateAlertHash(alert);
        const isDismissed = !!dismissedAlerts[alertHash];
        
        if (isDismissed) {
          console.log(`🚫 Alerta filtrada (ya descartada): ${alert.type} - ${alert.message}`);
        }
        
        return !isDismissed;
      });
    } catch (error) {
      console.warn('Error filtering dismissed alerts:', error);
      return alerts; // En caso de error, devolver todas las alertas
    }
  }

  // Limpiar alertas descartadas antiguas (más de X días)
  static cleanOldDismissedAlerts(daysOld = 7) {
    try {
      const dismissedAlerts = this.getDismissedAlerts();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);
      
      let cleanedCount = 0;
      Object.keys(dismissedAlerts).forEach(hash => {
        const dismissedAt = new Date(dismissedAlerts[hash].dismissedAt);
        if (dismissedAt < cutoffDate) {
          delete dismissedAlerts[hash];
          cleanedCount++;
        }
      });

      if (cleanedCount > 0) {
        localStorage.setItem(this.KEYS.DISMISSED_ALERTS, JSON.stringify(dismissedAlerts));
        console.log(`🧹 Limpiadas ${cleanedCount} alertas descartadas antiguas`);
      }
    } catch (error) {
      console.warn('Error cleaning old dismissed alerts:', error);
    }
  }

  // Obtener estadísticas de alertas descartadas
  static getDismissedAlertsStats() {
    try {
      const dismissedAlerts = this.getDismissedAlerts();
      const totalDismissed = Object.keys(dismissedAlerts).length;
      
      const byType = {};
      const bySensor = {};
      
      Object.values(dismissedAlerts).forEach(alert => {
        // Por tipo
        byType[alert.alertType] = (byType[alert.alertType] || 0) + alert.count;
        
        // Por sensor
        if (alert.sensorKey) {
          bySensor[alert.sensorKey] = (bySensor[alert.sensorKey] || 0) + alert.count;
        }
      });

      return {
        totalDismissed,
        byType,
        bySensor,
        oldestDismissal: Object.values(dismissedAlerts).reduce((oldest, current) => {
          return !oldest || new Date(current.dismissedAt) < new Date(oldest.dismissedAt) 
            ? current 
            : oldest;
        }, null)
      };
    } catch (error) {
      console.warn('Error getting dismissed alerts stats:', error);
      return { totalDismissed: 0, byType: {}, bySensor: {} };
    }
  }
}

export default StorageUtils;
