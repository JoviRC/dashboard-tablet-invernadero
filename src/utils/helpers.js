// Utilidades para el dashboard del invernadero

export const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getStatusColor = (status) => {
  const colors = {
    optimal: '#4CAF50',
    warning: '#FF9800',
    critical: '#F44336',
    inactive: '#9E9E9E'
  };
  return colors[status] || colors.inactive;
};

export const checkSensorStatus = (current, ideal) => {
  if (current >= ideal.min && current <= ideal.max) {
    return 'optimal';
  }
  if (current < ideal.min * 0.8 || current > ideal.max * 1.2) {
    return 'critical';
  }
  return 'warning';
};

export const generateAlerts = (sensors) => {
  const alerts = [];
  
  Object.entries(sensors).forEach(([key, sensor]) => {
    const status = checkSensorStatus(sensor.current, sensor.ideal);
    const sensorNames = {
      temperature: 'Temperatura',
      airHumidity: 'Humedad del aire',
      soilHumidity: 'Humedad del suelo',
      soilPH: 'pH del suelo'
    };
    
    if (status === 'critical') {
      alerts.push({
        id: Date.now() + Math.random(),
        type: 'critical',
        message: `${sensorNames[key]} en nivel crítico: ${sensor.current}${sensor.unit}`,
        timestamp: new Date().toISOString(),
        isActive: true
      });
    } else if (status === 'warning') {
      alerts.push({
        id: Date.now() + Math.random(),
        type: 'warning',
        message: `${sensorNames[key]} fuera del rango ideal: ${sensor.current}${sensor.unit}`,
        timestamp: new Date().toISOString(),
        isActive: true
      });
    }
  });
  
  return alerts;
};

export const simulateDeviceAction = (deviceName, action) => {
  // Simular acción del dispositivo
  console.log(`${deviceName}: ${action}`);
  return {
    success: true,
    timestamp: new Date().toISOString(),
    message: `${deviceName} ${action} exitosamente`
  };
};

export const validateTimeFormat = (time) => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

export const calculateOptimalConditions = (sensors) => {
  // Algoritmo simple para sugerir acciones basadas en sensores
  const suggestions = [];
  
  if (sensors.temperature.current > sensors.temperature.ideal.max) {
    suggestions.push('Activar ventilación para reducir temperatura');
  }
  
  if (sensors.soilHumidity.current < sensors.soilHumidity.ideal.min) {
    suggestions.push('Activar sistema de riego');
  }
  
  if (sensors.airHumidity.current < sensors.airHumidity.ideal.min) {
    suggestions.push('Considerar nebulización para aumentar humedad');
  }
  
  return suggestions;
};

export const exportData = (data, filename) => {
  // Función para exportar datos (placeholder para implementación futura)
  const csvContent = Object.entries(data)
    .map(([key, value]) => `${key},${JSON.stringify(value)}`)
    .join('\n');
  
  console.log(`Exportando datos a ${filename}:`, csvContent);
  return csvContent;
};
