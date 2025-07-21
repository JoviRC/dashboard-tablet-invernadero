# 🎨 Guía de Colores del Dashboard Invernadero

## 📋 Resumen

Este proyecto utiliza un sistema de colores basado en **semáforo** para una mejor usabilidad e intuición visual. Todos los colores están centralizados en `src/config/colors.js`.

## 🚦 Sistema de Colores Principal

### 🟢 Verde - Estados Positivos
- **Uso**: Estados normales, valores óptimos, éxito, elementos activos
- **Colores**: `Colors.success`, `Colors.good`, `Colors.optimal`, `Colors.active`
- **Ejemplo**: Sensores en rango normal, dispositivos funcionando correctamente

### 🟡 Amarillo/Naranja - Advertencias
- **Uso**: Advertencias, precaución, valores fuera del rango ideal pero no críticos
- **Colores**: `Colors.warning`, `Colors.caution`
- **Ejemplo**: Temperatura alta pero no peligrosa, humedad baja

### 🔴 Rojo - Peligro/Crítico
- **Uso**: Estados críticos, errores, valores peligrosos
- **Colores**: `Colors.danger`, `Colors.critical`, `Colors.error`
- **Ejemplo**: Sensor desconectado, temperatura crítica, fallo de sistema

### ⚫ Gris - Estados Neutros
- **Uso**: Elementos deshabilitados, valores neutros, estados inactivos
- **Colores**: `Colors.disabled`, `Colors.inactive`, `Colors.neutral`
- **Ejemplo**: Dispositivos apagados, sensores sin configurar

## 📖 Cómo Usar

### Importación
```javascript
import Colors from '../config/colors';
```

### Uso Directo
```javascript
// Colores principales
backgroundColor: Colors.success      // Verde
backgroundColor: Colors.warning      // Amarillo
backgroundColor: Colors.danger       // Rojo

// Colores específicos para UI
backgroundColor: Colors.ui.buttonPrimary
borderColor: Colors.ui.border
color: Colors.textPrimary
```

### Funciones Helper
```javascript
// Obtener color según estado de sensor
const sensorColor = Colors.getSensorColor('optimal'); // Verde
const sensorColor = Colors.getSensorColor('warning'); // Amarillo
const sensorColor = Colors.getSensorColor('danger');  // Rojo

// Obtener color según tipo de alerta
const alertColor = Colors.getAlertColor('critical'); // Rojo
const alertColor = Colors.getAlertColor('warning');  // Amarillo
const alertColor = Colors.getAlertColor('info');     // Verde

// Agregar transparencia
const transparentGreen = Colors.withOpacity(Colors.success, 0.3);
```

### Gradientes
```javascript
// Para componentes que soporten gradientes
backgroundGradient: Colors.gradients.success  // ['#27AE60', '#4CAF50']
backgroundGradient: Colors.gradients.warning  // ['#F39C12', '#FF9800']
backgroundGradient: Colors.gradients.danger   // ['#E74C3C', '#F44336']
```

## 🎯 Casos de Uso Específicos

### Sensores
```javascript
// Color según el estado del sensor
const sensorStatus = getSensorStatus(sensorValue);
const color = Colors.getSensorColor(sensorStatus);

// Estados: 'optimal', 'good', 'warning', 'danger', 'offline'
```

### Dispositivos
```javascript
// Estado de dispositivo
backgroundColor: device.isActive ? Colors.device.on : Colors.device.off

// Modo automático vs manual
thumbColor: isAutomatic ? Colors.device.automatic : Colors.device.manual
```

### Alertas
```javascript
// Color de alerta según tipo
const alertColor = Colors.getAlertColor(alert.type);
const backgroundColor = Colors.getAlertBackgroundColor(alert.type);

// Tipos: 'info', 'warning', 'critical'
```

### Estados de Conexión
```javascript
// Estado de conexión API
color: apiConnected ? Colors.ui.online : Colors.ui.offline

// Estados: 'online', 'offline', 'connecting'
```

## 🔧 Personalización

Para cambiar los colores del proyecto, edita `src/config/colors.js`:

```javascript
const Colors = {
  // Cambiar color principal de éxito
  success: '#27AE60',  // Cambiar a tu verde preferido
  
  // Cambiar color de advertencia
  warning: '#F39C12',  // Cambiar a tu amarillo preferido
  
  // Etc...
};
```

## ✅ Beneficios

1. **Consistencia**: Todos los colores en un lugar
2. **Mantenimiento**: Fácil cambiar colores globalmente
3. **Usabilidad**: Sistema de semáforo intuitivo
4. **Accesibilidad**: Colores con buen contraste
5. **Escalabilidad**: Fácil agregar nuevos colores

## 🧪 Testing de Colores

Para verificar que los colores funcionan correctamente:

1. Revisa que todos los estados de sensores usen los colores apropiados
2. Verifica que las alertas muestren los colores correctos
3. Comprueba que los dispositivos activos/inactivos sean visualmente distinguibles
4. Asegúrate de que el contraste sea adecuado para legibilidad

## 📱 Responsividad

Los colores se mantienen consistentes en:
- ✅ Web (localhost:3000)
- ✅ Móvil (iOS/Android)
- ✅ Tablet (orientación landscape)
- ✅ Diferentes tamaños de pantalla

---

**Última actualización**: Julio 2025
**Versión del sistema de colores**: 1.0.0
