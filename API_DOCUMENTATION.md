# Documentación de API - Dashboard Invernadero

## 📡 Estructura Real de la API

### Endpoint Principal
```
GET http://192.168.100.17:4201/ControllerDHT11/GetDispositivosForUser?user=1
```

### Respuesta de la API
La API devuelve un array de dispositivos con la siguiente estructura:

```json
[
  {
    "id": 1,
    "macAddress": "8875272                                                                                             ",
    "idusuario": 1,
    "name": "Sensor Clima",
    "description": "ESP32, DHT11, Sensor Humedad Tierra",
    "estado": null
  },
  {
    "id": 3,
    "macAddress": "ebde71784db0820181e5up                                                                              ",
    "idusuario": 1,
    "name": "Switch",
    "description": "Switch Ventilador",
    "estado": "False"
  }
]
```

## 🔄 Mapeo de Dispositivos

### Sensores de Clima (DHT11)
**Identificación:**
- `name`: Contiene "Sensor Clima" o "DHT11"
- `description`: Contiene "DHT11" o "ESP32"

**Datos Generados:**
- **Temperatura**: Basada en ID del dispositivo (22-29°C) + variación aleatoria (±3°C)
- **Humedad del Aire**: Basada en ID del dispositivo (55-79%) + variación aleatoria (±10%)

### Sensores de Humedad del Suelo
**Identificación:**
- `description`: Contiene "Humedad Tierra"

**Datos Generados:**
- **Humedad del Suelo**: Basada en ID del dispositivo (45-64%) + variación aleatoria (±10%)

### Dispositivos de Control (Switches/Relés)
**Identificación:**
- `name`: Contiene "Switch"
- `description`: Especifica el dispositivo controlado

**Estados:**
- `estado`: "True" = Activo, "False" = Inactivo, `null` = Desconocido

## 🛠️ Transformación de Datos

### Función: `transformApiDataToSensorData()`

```javascript
// Ejemplo de transformación para sensor DHT11
if (name.includes('sensor clima') || description.includes('dht11')) {
  const baseTemp = 22 + (device.id % 8); // 22-29°C
  const baseHum = 55 + (device.id % 25);  // 55-79%
  
  sensorData.temperature.current = baseTemp + (Math.random() * 6 - 3);
  sensorData.airHumidity.current = baseHum + (Math.random() * 20 - 10);
}
```

### Función: `transformApiDataToDeviceStates()`

```javascript
// Ejemplo de transformación para switch de ventilador
if (description.includes('ventilador')) {
  const isActive = device.estado === 'True';
  
  deviceStates.ventilation = {
    ...deviceStates.ventilation,
    isActive: isActive,
    deviceId: device.id,
    speed: isActive ? 75 : 0
  };
}
```

## 📊 Datos Simulados vs Reales

### Estado Actual
- **Datos de Sensores**: Simulados basados en dispositivos detectados
- **Estados de Dispositivos**: Reales desde la API
- **Historiales**: Simulados con valores realistas

### Próximas Mejoras
- Endpoint para obtener valores reales de sensores
- Endpoint para controlar dispositivos (POST/PUT)
- Históricos reales desde base de datos

## 🔧 Configuración

### Cambiar IP del Servidor
Editar el archivo `src/config/config.js`:

```javascript
const CONFIG = {
  API_BASE_URL: 'http://192.168.100.17:4201', // Cambiar aquí
  // ...
};
```

### Intervalos de Actualización
- **Datos de sensores**: 30 segundos
- **Estados de dispositivos**: 30 segundos
- **Reintento en error**: 30 segundos

## 🧪 Pruebas de Conectividad

### Componente de Prueba
El dashboard incluye un componente expandible que permite:

1. **Probar la conexión** con el servidor
2. **Ver dispositivos detectados** con información detallada
3. **Diagnosticar errores** de conectividad

### Información Mostrada por Dispositivo
- **ID**: Identificador único
- **Nombre**: Nombre descriptivo del dispositivo
- **Descripción**: Detalles técnicos
- **MAC Address**: Dirección física del dispositivo
- **Usuario**: ID del usuario propietario
- **Estado**: Estado actual del dispositivo

## 🚨 Manejo de Errores

### Fallback a Datos Simulados
Si la API no está disponible:
- Se muestran datos simulados realistas
- Se indica el estado de "Sin conexión"
- Se reintentan las conexiones automáticamente

### Mensajes de Error Comunes
- **Connection refused**: Servidor no ejecutándose
- **Network error**: Problemas de red
- **Timeout**: Servidor lento o sobrecargado

## 📈 Análisis de Rendimiento

### Optimizaciones Implementadas
- **Cache de respuestas** para evitar llamadas repetitivas
- **Actualización inteligente** solo cuando cambian los datos
- **Fallback inmediato** para mejor experiencia de usuario

### Métricas de Conectividad
- **Tiempo de respuesta**: Medido en cada llamada
- **Tasa de éxito**: Porcentaje de llamadas exitosas
- **Disponibilidad**: Estado del servidor en tiempo real

---

**Última actualización**: 20 de julio de 2025
**Versión de API**: v1.0
**Estado**: Integración básica completada
