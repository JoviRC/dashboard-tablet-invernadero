// Datos simulados para el dashboard del invernadero
export const sensorData = {
  temperature: {
    current: 24.5,
    min: 18,
    max: 30,
    ideal: { min: 20, max: 26 },
    unit: '°C',
    history: [22, 23, 24, 24.5, 25, 24.8, 24.5]
  },
  airHumidity: {
    current: 65,
    min: 40,
    max: 80,
    ideal: { min: 60, max: 70 },
    unit: '%',
    history: [62, 64, 66, 65, 67, 66, 65]
  },
  soilHumidity: {
    current: 45,
    min: 20,
    max: 80,
    ideal: { min: 40, max: 60 },
    unit: '%',
    history: [42, 44, 46, 45, 47, 46, 45]
  },
  soilPH: {
    current: 6.5,
    min: 5.5,
    max: 7.5,
    ideal: { min: 6.0, max: 7.0 },
    unit: 'pH',
    history: [6.3, 6.4, 6.5, 6.5, 6.6, 6.5, 6.5]
  }
};

export const deviceStates = {
  irrigation: {
    name: 'Sistema de Riego',
    isActive: false,
    isAutomatic: true,
    schedule: '06:00, 18:00',
    lastActivation: '2025-07-20 06:00'
  },
  ventilation: {
    name: 'Ventilación',
    isActive: true,
    isAutomatic: true,
    speed: 65,
    temperature_trigger: 25
  },
  lighting: {
    name: 'Iluminación Artificial',
    isActive: false,
    isAutomatic: true,
    schedule: '06:00-20:00',
    intensity: 80
  },
  heating: {
    name: 'Calefacción',
    isActive: false,
    isAutomatic: true,
    targetTemperature: 20,
    currentTemperature: 24.5
  },
  windows: {
    name: 'Ventanas',
    isOpen: true,
    isAutomatic: true,
    openPercentage: 30,
    temperature_trigger: 26
  }
};

export const alerts = [
  {
    id: 1,
    type: 'warning',
    message: 'Humedad del suelo baja',
    timestamp: '2025-07-20 14:30',
    isActive: true
  },
  {
    id: 2,
    type: 'info',
    message: 'Riego automático activado',
    timestamp: '2025-07-20 06:00',
    isActive: false
  }
];

export const schedules = {
  irrigation: [
    { time: '06:00', duration: 10, active: true },
    { time: '18:00', duration: 15, active: true }
  ],
  lighting: {
    startTime: '06:00',
    endTime: '20:00',
    active: true
  }
};
