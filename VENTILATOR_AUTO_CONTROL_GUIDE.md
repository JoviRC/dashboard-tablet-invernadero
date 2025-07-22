# Guía de Control Automático del Ventilador

## Descripción
Sistema de control automático del ventilador que utiliza la API de Tuya para controlar dispositivos físicos basándose en las condiciones de los sensores del invernadero.

## Funcionalidades Implementadas

### 1. Control Manual Mejorado
- **Función**: `handleDeviceToggle('ventilation')`
- **Descripción**: Permite encender/apagar el ventilador manualmente
- **Integración**: Si el modo automático está activado, utiliza la API de Tuya real

### 2. Control Automático por Temperatura
- **Función**: `evaluateAutomaticControl()`
- **Lógica**: 
  - Encender ventilador si temperatura > temperatura ideal máxima
  - Apagar ventilador si temperatura ≤ (temperatura ideal máxima - 2°C)
- **Activación**: Solo funciona si `devices.ventilation.isAutomatic = true`

### 3. API de Control de Dispositivos Tuya
- **Endpoint**: `https://px1.tuyaeu.com/homeassistant/skill`
- **Función**: `controlTuyaDevice(macAddress, newState, userId)`
- **Método**: POST con payload específico de Tuya
- **Token**: Obtenido dinámicamente desde la base de datos por usuario

## Estructura de la API

### Request a Tuya
```json
{
  "header": {
    "name": "turnOnOff",
    "namespace": "control",
    "payloadVersion": 1
  },
  "payload": {
    "accessToken": "TOKEN_DEL_USUARIO",
    "devId": "MAC_ADDRESS_DEL_DISPOSITIVO",
    "value": 1  // 1 = encender, 0 = apagar
  }
}
```

### Response de Tuya
```json
{
  "payload": {},
  "header": {
    "code": "SUCCESS",
    "payloadVersion": 1
  }
}
```

## Configuración Requerida

### 1. Base de Datos
- **Tabla**: Usuarios con token de acceso de Tuya
- **Endpoint**: `/ControllerUser/GetUserToken?userId={id}`
- **Response esperada**: 
  ```json
  {
    "accessToken": "string",  // o "token" o "access_token"
  }
  ```

### 2. Dispositivos
- **Requisito**: Dispositivos con nombre que contenga "switch", "ventilador" o "fan"
- **Campo requerido**: `macAddress` (usado como `devId` en Tuya)
- **Ejemplo**:
  ```json
  {
    "id": 1,
    "nombre": "Switch Ventilador Principal",
    "macAddress": "AA:BB:CC:DD:EE:FF",
    "estado": "True"
  }
  ```

## Funciones Principales

### ApiService.js

#### `getUserAccessToken(userId)`
- Obtiene el token de acceso de Tuya para el usuario
- Manejo de errores con token de desarrollo como fallback

#### `controlTuyaDevice(macAddress, newState, userId)`
- Controla un dispositivo específico usando la API de Tuya
- Manejo de errores y logging detallado

#### `controlVentilatorAutomatic(newState, userId)`
- Busca todos los switches/ventiladores del usuario
- Controla múltiples dispositivos en paralelo
- Retorna resumen de éxitos y fallos

### DashboardScreen.js

#### `handleDeviceToggle(deviceKey)`
- Control manual con integración automática
- Diferenciación entre dispositivos según el `deviceKey`

#### `evaluateAutomaticControl()`
- Evaluación periódica basada en sensores
- Lógica de histéresis para evitar oscilación

#### `handleAutomaticToggle(deviceKey)`
- Activación/desactivación del modo automático
- Verificación de dispositivos disponibles

## Testing y Debugging

### Componente de Prueba
- **Ubicación**: `ApiTestComponent.js`
- **Funciones**:
  - Botón "Encender" ventilador
  - Botón "Apagar" ventilador  
  - Mostrar resultados detallados
  - Lista de dispositivos controlados

### Logs de Debug
```javascript
// Ejemplos de logs generados
🌀 [TUYA API] Controlando dispositivo AA:BB:CC:DD:EE:FF -> ON
🔑 Token: abcdef1234...
✅ Dispositivo AA:BB:CC:DD:EE:FF controlado exitosamente
🌡️ Evaluando control automático: Temp actual 28°C vs máximo ideal 25°C
🔥 Temperatura alta detectada - Encendiendo ventilador automáticamente
```

## Flujo de Trabajo

1. **Usuario activa modo automático** → `handleAutomaticToggle('ventilation')`
2. **Sensores se actualizan** → Llama a `evaluateAutomaticControl()`
3. **Evaluación de temperatura** → Compara con umbrales
4. **Control de dispositivos** → `controlVentilatorAutomatic(true/false)`
5. **API de Tuya** → `controlTuyaDevice()` para cada switch
6. **Actualización local** → `updateDeviceLocally()` refleja cambios en UI

## Consideraciones

### Seguridad
- Token de acceso almacenado en base de datos
- Validación de respuestas de Tuya API
- Manejo de errores de red

### Performance
- Control en paralelo de múltiples dispositivos
- Timeout configurado para requests
- Fallback a estado local en caso de error

### UX
- Feedback visual inmediato
- Logs detallados para debugging
- Estados de carga durante operaciones

## Próximas Mejoras

1. **Configuración de umbrales personalizables**
2. **Historial de acciones automáticas**
3. **Notificaciones push para cambios automáticos**
4. **Scheduling avanzado basado en horarios**
5. **Integración con más tipos de sensores**
