# Dashboard Invernadero - Tablet

Una aplicación de dashboard para tablets desarrollada con React Native y Expo, diseñada específicamente para el control y monitoreo de un sistema de domótica de invernadero con **integración de API real**.

## 🌱 Características Principales

### Monitoreo de Sensores (Datos Reales)
- **Temperatura Ambiente**: Control en tiempo real con datos de la API
- **Humedad del Aire**: Monitoreo continuo con alertas automáticas
- **Humedad del Suelo**: Seguimiento para optimizar el riego
- **pH del Suelo**: Control de la acidez para mejor crecimiento

### Controles Automáticos (Integrados con API)
- **Sistema de Riego**: Programación automática con estado real
- **Ventilación**: Control de velocidad basado en temperatura
- **Iluminación Artificial**: Programación de horarios y intensidad
- **Calefacción/Enfriamiento**: Mantenimiento automático de temperatura
- **Apertura/Cierre de Ventanas**: Control automático de ventilación

### Integración de API
- **Conexión en tiempo real** con servidor `http://192.168.100.17:4201`
- **Obtención de dispositivos** del usuario via endpoint `/ControllerDHT11/GetDispositivosForUser`
- **Transformación automática** de datos de API a formato de la aplicación
- **Fallback a datos simulados** en caso de pérdida de conexión
- **Indicador de estado** de conexión en tiempo real

### Interfaz Visual
- **Gráficos en Tiempo Real**: Visualización de tendencias históricas
- **Alertas y Notificaciones**: Sistema de avisos basado en datos reales
- **Historial de Datos**: Análisis de datos históricos con estadísticas
- **Panel Intuitivo**: Diseño optimizado para tablets

## 🔌 Configuración de API

### Endpoint Principal
```
GET http://192.168.100.17:4201/ControllerDHT11/GetDispositivosForUser?user=1
```

### Estructura de Datos Esperada
La aplicación espera un array de dispositivos con la siguiente estructura:
```json
[
  {
    "id": 1,
    "nombre": "Sensor DHT11",
    "tipo": "DHT11",
    "temperatura": 24.5,
    "humedad": 65,
    "estado": true,
    "historial": [22, 23, 24, 24.5, 25],
    "ideal": {
      "min": 20,
      "max": 26
    }
  }
]
```

### Configuración de Red
Para cambiar la IP del servidor, edita el archivo:
```
src/config/config.js
```

## 🚀 Tecnologías Utilizadas

- **React Native**: Framework principal
- **Expo**: Plataforma de desarrollo
- **React Navigation**: Navegación entre pantallas
- **React Native Chart Kit**: Gráficos y visualizaciones
- **Expo Vector Icons**: Iconografía
- **AsyncStorage**: Almacenamiento local
- **Fetch API**: Comunicación con servidor

## 📱 Estructura de la Aplicación

```
src/
├── components/          # Componentes reutilizables
│   ├── SensorCard.js   # Tarjetas de sensores
│   ├── DeviceControl.js # Controles de dispositivos
│   ├── AlertsPanel.js  # Panel de alertas
│   └── ApiTestComponent.js # Pruebas de API
├── screens/            # Pantallas principales
│   ├── DashboardScreen.js # Dashboard principal
│   ├── ChartsScreen.js    # Gráficos e históricos
│   └── SettingsScreen.js  # Configuración
├── services/           # Servicios de API
│   └── ApiService.js   # Manejo de llamadas API
├── config/             # Configuración
│   └── config.js       # URLs y configuraciones
├── navigation/         # Navegación
│   └── AppNavigator.js # Navegador principal
├── data/              # Datos y configuración
│   └── mockData.js    # Datos de respaldo
└── utils/             # Utilidades
    └── helpers.js     # Funciones auxiliares
```

## 🛠️ Instalación y Configuración

1. **Clonar el repositorio**
   ```bash
   git clone [tu-repositorio]
   cd dashboard-tablet
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar la API** (opcional)
   - Editar `src/config/config.js` si necesitas cambiar la IP del servidor
   - Por defecto usa: `http://192.168.100.17:4201`

4. **Iniciar la aplicación**
   ```bash
   npm start
   ```

5. **Ejecutar en dispositivo**
   - Escanea el código QR con Expo Go
   - O ejecuta `npm run android` / `npm run ios`

## 📊 Funcionalidades de API

### Obtención de Datos
- **Actualización automática** cada 30 segundos
- **Reintento automático** en caso de fallo
- **Transformación de datos** de formato API a formato aplicación
- **Generación de alertas** basada en rangos ideales

### Mapeo de Dispositivos
La aplicación mapea automáticamente los dispositivos según su tipo:
- `DHT11` o `temperature` → Sensores de temperatura y humedad
- `soilMoisture` → Sensor de humedad del suelo
- `pH` → Sensor de pH del suelo
- `relay` → Dispositivos de control (riego, ventilación, etc.)

### Estados de Conexión
- 🟢 **Conectado**: Datos en tiempo real de la API
- 🔴 **Sin conexión**: Usando datos de respaldo simulados

## 🔧 Configuración del Sistema

### Rangos por Defecto
- **Temperatura**: 18°C - 30°C
- **Humedad Aire**: 40% - 80%
- **Humedad Suelo**: 30% - 70%
- **pH Suelo**: 6.0 - 7.5

### Intervalos de Actualización
- **Sensores**: 30 segundos
- **Dispositivos**: 30 segundos
- **Gráficos**: 1 minuto

## 🧪 Pruebas de Conectividad

La aplicación incluye un **componente de prueba de API** en el dashboard principal que permite:
- Probar la conexión con el servidor
- Ver la respuesta cruda de la API
- Diagnosticar problemas de conectividad

### ⚠️ Importante: Problema CORS en Navegador Web
Si ejecutas la app en navegador web (`npm start` y abrir en web), verás un error CORS:
```
Access to fetch at 'http://192.168.100.17:4201/...' has been blocked by CORS policy
```

**Soluciones:**
1. **Cambiar puerto de desarrollo** - `npm run start:web` (usa puerto 3001)
2. **Usar dispositivo móvil** - `npm run android` / `npm run ios` o Expo Go
3. **Configurar CORS en el servidor** - Añadir headers `Access-Control-Allow-Origin`
4. **Ver archivo `CORS_SOLUTION.md`** para más detalles

✅ **Script añadido**: `npm run start:web` para evitar conflictos de puerto.

La aplicación funciona perfectamente con datos simulados cuando no puede conectar a la API.

## 🎨 Diseño y UX

- **Orientación**: Landscape (horizontal) optimizada para tablets
- **Tema**: Colores verdes (agricultura) con contraste alto
- **Indicadores**: Estado de conexión en tiempo real
- **Navegación**: Tabs inferiores para acceso rápido

## 🔮 Futuras Mejoras

- [ ] Control de dispositivos via API (POST/PUT endpoints)
- [ ] Notificaciones push basadas en alertas reales
- [ ] Históricos extendidos desde base de datos
- [ ] Configuración remota de parámetros
- [ ] Múltiples usuarios y permisos
- [ ] Análisis predictivo con IA
- [ ] Exportación de reportes

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver `LICENSE` para más detalles.

## 🤝 Contribuir

Las contribuciones son bienvenidas. Para cambios relacionados con la API:

1. Documentar la estructura de datos esperada
2. Probar con el servidor real
3. Mantener compatibilidad con datos de respaldo
4. Actualizar la documentación

## 📞 Soporte

Para soporte o preguntas sobre la integración de API:
- Verificar conectividad de red con el servidor
- Revisar logs en la consola de desarrollo
- Usar el componente de prueba de API incluido

---

**Desarrollado con 🌱 para la agricultura inteligente**
