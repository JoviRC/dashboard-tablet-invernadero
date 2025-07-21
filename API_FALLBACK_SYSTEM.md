# Sistema de Fallback de API

## Descripción
El sistema de fallback automáticamente cambia entre dos URLs de API cuando la conexión principal no está disponible:

- **API Primaria (Local)**: `http://192.168.100.17:4201`
- **API de Respaldo (Remota)**: `http://autoindoor.duckdns.org:4201`

## Funcionamiento

### Detección Automática
1. **Verificación Inicial**: Al hacer una llamada a la API, el sistema verifica si la URL primaria responde
2. **Cambio Automático**: Si la API primaria no responde, cambia automáticamente a la URL de respaldo
3. **Reconexión**: Cada minuto verifica si la API primaria está disponible nuevamente

### Componentes del Sistema

#### ApiService.js
- `testApiConnection()`: Prueba conectividad con timeout de 5 segundos
- `getActiveApiUrl()`: Obtiene la URL activa con verificación automática
- `fetchWithFallback()`: Realiza peticiones con fallback automático
- `getCurrentApiInfo()`: Información sobre la conexión actual
- `retryPrimaryConnection()`: Intenta reconectar con la API primaria
- `forceApiUrl()`: Fuerza el cambio a una URL específica

#### ConnectionMonitor.js
- Monitoreo automático cada 60 segundos
- Listeners para cambios de estado
- Intentos de reconexión automática
- Estadísticas de conexión

#### useConnectionMonitor Hook
- Estado de conexión en tiempo real
- Funciones de control desde componentes React
- Estado reactivo para la UI

#### ConnectionStatus Component
- Indicador visual del estado de conexión
- Controles para cambio manual de API
- Versión compacta para headers

## Uso en Componentes

```javascript
import useConnectionMonitor from '../hooks/useConnectionMonitor';
import ConnectionStatus from '../components/ConnectionStatus';

const MyComponent = () => {
  const { 
    isPrimary, 
    isFallback, 
    currentUrl,
    forceCheck,
    switchToPrimary,
    switchToFallback 
  } = useConnectionMonitor();

  return (
    <View>
      <ConnectionStatus compact={true} showControls={false} />
      
      {isPrimary && <Text>Conectado a API local</Text>}
      {isFallback && <Text>Conectado a API remota</Text>}
      
      <Button title="Verificar Conexión" onPress={forceCheck} />
    </View>
  );
};
```

## Configuración

### config.js
```javascript
export const CONFIG = {
  API_URLS: {
    PRIMARY: 'http://192.168.100.17:4201',
    FALLBACK: 'http://autoindoor.duckdns.org:4201'
  }
};
```

### Personalización
- **Timeout de conexión**: Modificar en `testApiConnection()` (default: 5s)
- **Intervalo de monitoreo**: Modificar `retryInterval` en ConnectionMonitor (default: 60s)
- **URLs**: Cambiar en `CONFIG.API_URLS`

## Estados de Conexión

### Indicadores Visuales
- 🏠 **Verde**: API Local (primaria) activa
- ☁️ **Amarillo**: API Remota (respaldo) activa  
- 🔄 **Naranja**: Verificando conexión
- ❌ **Rojo**: Sin conexión

### Logs en Consola
- `🔄 API primaria no responde, cambiando a URL de respaldo...`
- `✅ Conectado exitosamente a la API de respaldo`
- `✅ Reconectado a API primaria`
- `❌ Ni la API primaria ni la de respaldo responden`

## Flujo de Fallback

1. **Petición Inicial** → Probar API primaria
2. **Error/Timeout** → Cambiar a API respaldo
3. **Monitoreo** → Cada 60s verificar API primaria
4. **Reconexión** → Si primaria responde, cambiar de vuelta

## Ventajas

✅ **Continuidad de Servicio**: La aplicación funciona aunque la API local falle
✅ **Reconexión Automática**: Vuelve a la API local cuando esté disponible
✅ **Transparente**: Las funciones de la aplicación no cambian
✅ **Monitoreo Visual**: El usuario ve el estado de conexión
✅ **Control Manual**: Posibilidad de forzar cambio de API

## Casos de Uso

- **Red Local Inestable**: Cambio automático a API remota
- **Mantenimiento Local**: Funcionamiento continuo con API remota  
- **Pruebas**: Cambio manual entre APIs para testing
- **Desarrollo**: Flexibilidad entre diferentes entornos
