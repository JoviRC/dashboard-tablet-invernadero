import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  RefreshControl,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import Colors, { ColorHelpers } from '../config/colors';
import { useTheme } from '../contexts/ThemeContext';
import SensorCard from '../components/SensorCard';
import DeviceControl from '../components/DeviceControl';
import AlertsPanel from '../components/AlertsPanel';
import ApiTestComponent from '../components/ApiTestComponent';
import SensorManager from '../components/SensorManager';
import DeviceInfoPanel from '../components/DeviceInfoPanel';
import RealTimeStatus from '../components/RealTimeStatus';
import ConnectionStatus from '../components/ConnectionStatus';
import ThemeSelector from '../components/ThemeSelector';
import DataModeBanner from '../components/DataModeBanner';
import ApiService from '../services/ApiService';
import NotificationService from '../services/NotificationService';
import StorageUtils from '../utils/storage';
import { sensorData as fallbackSensorData, deviceStates as fallbackDeviceStates } from '../data/mockData';

const DashboardScreen = () => {
  const { theme, isDark } = useTheme();
  
  // Configuración responsive para móvil
  const screenData = Dimensions.get('screen');
  const windowData = Dimensions.get('window');
  
  // Dimensiones objetivo para móvil: 1179 x 2556
  const TARGET_MOBILE_WIDTH = 1179;
  const TARGET_MOBILE_HEIGHT = 2556;
  
  // Detectar si es móvil y calcular escalas
  const isMobile = screenData.width <= 1200 || windowData.width <= 1200;
  const scaleX = isMobile ? Math.min(screenData.width / TARGET_MOBILE_WIDTH, 1) : 1;
  const scaleY = isMobile ? Math.min(screenData.height / TARGET_MOBILE_HEIGHT, 1) : 1;
  const scale = Math.min(scaleX, scaleY);
  
  // Configuración responsive para notificaciones
  const responsiveConfig = {
    isMobile,
    scale,
    screenWidth: screenData.width,
    screenHeight: screenData.height,
    // Tamaños escalados para notificaciones
    notification: {
      floatingButtonSize: Math.max(56 * scale, 48), // Mínimo 48px
      alertBubbleWidth: Math.min(320 * scale, screenData.width * 0.9),
      alertBubbleMaxHeight: Math.min(400 * scale, screenData.height * 0.6),
      alertBadgeSize: Math.max(20 * scale, 16),
      alertIconSize: Math.max(24 * scale, 20),
      headerControlSize: Math.max(44 * scale, 36),
      fontSize: {
        badge: Math.max(11 * scale, 9),
        alertTitle: Math.max(16 * scale, 14),
        alertMessage: Math.max(13 * scale, 11),
        alertTime: Math.max(11 * scale, 9)
      }
    }
  };
  
  const styles = createStyles(theme, responsiveConfig);
  // Los sensores ahora están indexados por macAddress, no por id
  const [sensors, setSensors] = useState(fallbackSensorData);
  const [devices, setDevices] = useState(fallbackDeviceStates);
  const [currentAlerts, setCurrentAlerts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [apiConnected, setApiConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [showAlertsBubble, setShowAlertsBubble] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const previousAlertsRef = useRef([]);
  const [userPreferences, setUserPreferences] = useState(() => StorageUtils.getUserPreferences());
  // activeSensorIds ahora debe contener macAddress (string), no id numérico
  const [activeSensorIds, setActiveSensorIds] = useState(() => {
    const prefs = StorageUtils.getUserPreferences();
    return prefs.activeSensorIds || []; // Deben ser macAddress
  });
  const [availableSensorIds, setAvailableSensorIds] = useState([]); // Sensores detectados automáticamente

  // Cargar configuraciones guardadas al montar el componente
  useEffect(() => {
    const initializeApp = async () => {
      // Configurar notificaciones push
      await setupNotifications();
      
      // Limpiar alertas descartadas antiguas (más de 7 días)
      StorageUtils.cleanOldDismissedAlerts(7);
      
      // Cargar configuraciones de dispositivos
      const savedDeviceSettings = StorageUtils.getDeviceSettings();
      if (Object.keys(savedDeviceSettings).length > 0) {
        setDevices(prev => ({ ...prev, ...savedDeviceSettings }));
      }
      
      // Cargar datos iniciales
      loadDataFromAPI();
      loadSensorData();
    };

    initializeApp();
    
    // Actualizar datos cada 30 segundos (o según preferencias del usuario)
    const interval = setInterval(() => {
      loadSensorData(); // Solo actualizar datos de sensores en el intervalo
    }, userPreferences.refreshInterval || 30000);

    return () => {
      clearInterval(interval);
      NotificationService.cleanup();
    };
  }, [userPreferences.refreshInterval, activeSensorIds]);

  // Configurar sistema de notificaciones - RESPONSIVE
  const setupNotifications = async () => {
    try {
      console.log(`🔧 Configurando notificaciones para dispositivo: ${isMobile ? 'Móvil' : 'Desktop'}`);
      console.log(`📱 Dimensiones: ${responsiveConfig.screenWidth}x${responsiveConfig.screenHeight} (escala: ${scale.toFixed(2)})`);
      
      const token = await NotificationService.registerForPushNotificationsAsync();
      setExpoPushToken(token || '');

      // Configurar listeners de notificaciones con configuración responsive
      NotificationService.setupNotificationListeners(
        (notification) => {
          console.log('📨 Notificación recibida (responsive):', notification);
          
          // En móvil, mostrar feedback visual adicional
          if (isMobile && notification) {
            // Vibración suave en móviles si está disponible
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
              navigator.vibrate(100);
            }
          }
        },
        (response) => {
          console.log('👆 Respuesta a notificación (responsive):', response);
          
          // Abrir la burbuja de alertas si se toca una notificación de alerta
          if (response.notification.request.content.data?.alertType) {
            setShowAlertsBubble(true);
            
            // En móvil, asegurar que la burbuja sea visible
            if (isMobile) {
              // Scroll automático hacia arriba para asegurar visibilidad
              setTimeout(() => {
                console.log('📱 Ajustando vista móvil para mostrar alertas');
              }, 100);
            }
          }
        }
      );

      console.log(`✅ Sistema de notificaciones configurado correctamente para ${isMobile ? 'móvil' : 'desktop'}`);
      console.log(`🎯 Configuración responsive aplicada - Botón: ${responsiveConfig.notification.floatingButtonSize}px, Burbuja: ${responsiveConfig.notification.alertBubbleWidth}px`);
      
    } catch (error) {
      console.error('❌ Error configurando notificaciones responsive:', error);
      setNotificationsEnabled(false);
      
      // En móvil, mostrar alert más compacto
      if (isMobile) {
        Alert.alert(
          'Error de notificaciones',
          'Las notificaciones no están disponibles en este dispositivo.',
          [{ text: 'OK' }],
          { 
            cancelable: true,
            userInterfaceStyle: isDark ? 'dark' : 'light'
          }
        );
      }
    }
  };

  // Detectar nuevas alertas y enviar notificaciones
  useEffect(() => {
    if (currentAlerts.length === 0) return;

    const activeAlerts = currentAlerts.filter(alert => alert.isActive);
    const previousActiveAlerts = previousAlertsRef.current.filter(alert => alert.isActive);

    // Detectar nuevas alertas (no estaban en la lista anterior)
    const newAlerts = activeAlerts.filter(alert => 
      !previousActiveAlerts.find(prevAlert => prevAlert.id === alert.id)
    );

    // Solo enviar notificaciones push si están habilitadas
    if (newAlerts.length > 0 && notificationsEnabled) {
      console.log('Nuevas alertas detectadas - enviando notificaciones:', newAlerts);
      NotificationService.sendMultipleAlertNotifications(newAlerts);
    } else if (newAlerts.length > 0 && !notificationsEnabled) {
      console.log('Nuevas alertas detectadas - notificaciones silenciadas:', newAlerts);
    }

    // Actualizar referencia de alertas anteriores
    previousAlertsRef.current = [...currentAlerts];
  }, [currentAlerts, notificationsEnabled]);

  const loadDataFromAPI = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    
    try {
      console.log('🌐 Conectando a la API para obtener dispositivos...');
      
      // Obtener dispositivos del usuario 1
      const apiData = await ApiService.getDispositivosForUser(1);
      
      console.log('📡 Datos recibidos de la API:', apiData);
      
      // Extraer IDs de sensores de los dispositivos obtenidos
      const availableSensorIds = ApiService.extractSensorIds(apiData);
      console.log('🔍 IDs de sensores detectados automáticamente:', availableSensorIds);
      
      // Actualizar la lista de sensores disponibles
      setAvailableSensorIds(availableSensorIds);
      
      // Si no hay sensores activos configurados, usar los sensores disponibles
      if (activeSensorIds.length === 0 && availableSensorIds.length > 0) {
        console.log('⚙️ Configurando sensores activos automáticamente:', availableSensorIds);
        setActiveSensorIds(availableSensorIds);
        // Guardar los sensores encontrados como preferencia
        StorageUtils.saveUserPreferences({
          ...userPreferences,
          activeSensorIds: availableSensorIds
        });
      }
      
      // **PRIORIDAD: Obtener datos REALES de sensores si están disponibles**
      if (availableSensorIds.length > 0) {
        console.log('📊 Obteniendo datos REALES de sensores...');
        
        try {
          // Usar los sensores detectados o los activos
          const sensorsToQuery = activeSensorIds.length > 0 ? activeSensorIds : availableSensorIds;
          const realSensorsData = await ApiService.getMultipleSensorsData(sensorsToQuery, 1);
          
          if (realSensorsData && realSensorsData.length > 0) {
            console.log(`✅ Datos REALES obtenidos de ${realSensorsData.length} sensores`);
            
            // Transformar datos reales al formato del dashboard
            const transformedSensorData = ApiService.transformMultipleSensorsToDisplay(realSensorsData);
            
            // Marcar explícitamente como datos reales
            Object.keys(transformedSensorData).forEach(sensorKey => {
              transformedSensorData[sensorKey].source = 'API_REAL';
              transformedSensorData[sensorKey].lastApiUpdate = new Date();
            });
            
            setSensors(transformedSensorData);
            console.log('📈 Sensores actualizados con datos REALES');
          } else {
            console.warn('⚠️ No se obtuvieron datos reales de sensores, usando estructura base');
            setSensors(fallbackSensorData);
          }
          
        } catch (sensorError) {
          console.error('❌ Error al obtener datos reales de sensores:', sensorError);
          console.log('🔄 Usando estructura base de sensores');
          setSensors(fallbackSensorData);
        }
      } else {
        console.warn('⚠️ No se detectaron sensores en la API, usando datos base');
        setSensors(fallbackSensorData);
      }
      
      // Guardar historial de sensores en localStorage
      StorageUtils.saveSensorHistory(sensors);
      
      // Transformar datos de dispositivos usando información real
      const transformedDeviceStates = ApiService.transformRealDevicesToDashboard(apiData);
      setDevices(transformedDeviceStates);
      console.log('🎛️ Dispositivos actualizados con datos reales');
      
      // Generar alertas basadas en los datos de sensores
      const generatedAlerts = ApiService.generateAlertsFromSensorData(sensors);
      
      // Filtrar alertas que ya han sido descartadas por el usuario
      const filteredAlerts = StorageUtils.filterDismissedAlerts(generatedAlerts);
      setCurrentAlerts(filteredAlerts);
      
      setApiConnected(true);
      setLastUpdate(new Date());
      console.log('✅ Carga completa de API exitosa - todos los datos son REALES');
      
    } catch (error) {
      console.error('❌ Error al cargar datos de la API:', error);
      setApiConnected(false);
      
      // Si no se pueden cargar los datos de la API, usar datos de respaldo
      if (showLoading) {
        Alert.alert(
          'Error de conexión',
          'No se pudo conectar con el servidor. Verifique la conexión de red y la configuración de la API.',
          [
            { text: 'Reintentar', onPress: () => loadDataFromAPI(true) },
            { text: 'Continuar Offline' }
          ],
          { 
            cancelable: true,
            userInterfaceStyle: isDark ? 'dark' : 'light'
          }
        );
      }
      
      // Usar datos de respaldo si no hay datos previos
      if (Object.keys(sensors).length === 0) {
        console.log('🔄 Usando datos de respaldo por falta de conexión');
        setSensors(fallbackSensorData);
        setDevices(fallbackDeviceStates);
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Cargar datos específicos de sensores - VERSIÓN MEJORADA PARA DATOS REALES
  const loadSensorData = async () => {
    // Solo cargar si hay sensores activos
    if (activeSensorIds.length === 0) {
      console.log('⚠️ No hay sensores activos configurados - intentando detectar automáticamente...');
      // Intentar cargar dispositivos para detectar sensores
      await loadDataFromAPI(false);
      return;
    }
    
    try {
      console.log('🔄 Cargando datos REALES de sensores:', activeSensorIds);
      
      // Obtener datos de todos los sensores activos con timeout
      const sensorsData = await ApiService.getMultipleSensorsData(activeSensorIds, 1);
      
      if (sensorsData && sensorsData.length > 0) {
        console.log(`✅ Datos recibidos de ${sensorsData.length} sensores`);
        
        // Transformar datos al formato del dashboard - SOLO DATOS REALES
        const transformedSensorData = ApiService.transformMultipleSensorsToDisplay(sensorsData);
        
        // Marcar explícitamente todos los sensores como reales
        Object.keys(transformedSensorData).forEach(sensorKey => {
          if (transformedSensorData[sensorKey].isReal) {
            transformedSensorData[sensorKey].isReal = true;
            transformedSensorData[sensorKey].lastUpdate = new Date();
            transformedSensorData[sensorKey].source = 'API_REAL';
            console.log(`📊 ${sensorKey}: ${transformedSensorData[sensorKey].current}${transformedSensorData[sensorKey].unit} (REAL)`);
          }
        });
        
        setSensors(transformedSensorData);
        
        // Guardar historial de sensores en localStorage
        StorageUtils.saveSensorHistory(transformedSensorData);
        
        // Generar alertas basadas en los datos actualizados de sensores
        const generatedAlerts = ApiService.generateAlertsFromSensorData(transformedSensorData);
        
        // Filtrar alertas que ya han sido descartadas por el usuario
        const filteredAlerts = StorageUtils.filterDismissedAlerts(generatedAlerts);
        setCurrentAlerts(filteredAlerts);
        
        console.log('📈 Datos de sensores REALES actualizados correctamente');
        
        // Marcar como conectado si al menos un sensor responde
        setApiConnected(true);
    try {
      console.log('🔄 Cargando datos REALES de sensores (macAddress):', activeSensorIds);
      // Obtener datos de todos los sensores activos usando macAddress
      const sensorsData = await ApiService.getMultipleSensorsData(activeSensorIds, 1);
      if (sensorsData && sensorsData.length > 0) {
        console.log(`✅ Datos recibidos de ${sensorsData.length} sensores (macAddress)`);
        // Transformar datos al formato del dashboard - SOLO DATOS REALES
        const transformedSensorData = ApiService.transformMultipleSensorsToDisplay(sensorsData);
        // Marcar explícitamente todos los sensores como reales
        Object.keys(transformedSensorData).forEach(macAddress => {
          if (transformedSensorData[macAddress].isReal) {
            transformedSensorData[macAddress].isReal = true;
            transformedSensorData[macAddress].lastUpdate = new Date();
            transformedSensorData[macAddress].source = 'API_REAL';
            console.log(`📊 ${macAddress}: ${transformedSensorData[macAddress].current}${transformedSensorData[macAddress].unit} (REAL)`);
          }
        });
        setSensors(transformedSensorData);
        // Guardar historial de sensores en localStorage
        StorageUtils.saveSensorHistory(transformedSensorData);
        // Generar alertas basadas en los datos actualizados de sensores
        const generatedAlerts = ApiService.generateAlertsFromSensorData(transformedSensorData);
        // Filtrar alertas que ya han sido descartadas por el usuario
        const filteredAlerts = StorageUtils.filterDismissedAlerts(generatedAlerts);
        setCurrentAlerts(filteredAlerts);
        console.log('📈 Datos de sensores REALES actualizados correctamente (macAddress)');
        // Marcar como conectado si al menos un sensor responde
        setApiConnected(true);
        setLastUpdate(new Date());
      } else {
        console.warn('⚠️ No se recibieron datos de sensores - usando datos de respaldo');
        setApiConnected(false);
      }
    } catch (error) {
      console.error('❌ Error al cargar datos específicos de sensores:', error);
      setApiConnected(false);
      // Mostrar estado de desconexión pero mantener últimos datos
      console.warn('🔄 Manteniendo últimos datos conocidos debido a error de conexión');
    }
  };

  const updateDeviceLocally = (deviceKey, newState) => {
    const newDevices = {
      ...devices,
      [deviceKey]: {
        ...devices[deviceKey],
        isActive: deviceKey === 'windows' ? devices[deviceKey].isActive : newState,
        isOpen: deviceKey === 'windows' ? newState : devices[deviceKey].isOpen
      }
    };
    setDevices(newDevices);
    StorageUtils.saveDeviceSettings(newDevices);
  };

  const handleAutomaticToggle = (deviceKey) => {
    const newDevices = {
      ...devices,
      [deviceKey]: {
        ...devices[deviceKey],
        isAutomatic: !devices[deviceKey].isAutomatic
      }
    };
    setDevices(newDevices);
    
    // Guardar configuración de dispositivos
    StorageUtils.saveDeviceSettings(newDevices);
  };

  const handleDismissAlert = (alertId) => {
    // Encontrar la alerta que se va a descartar
    const alertToMiss = currentAlerts.find(alert => alert.id === alertId);
    
    if (alertToMiss) {
      // Marcar como descartada persistentemente
      StorageUtils.dismissAlert(alertToMiss);
      
      // Actualizar el estado local
      setCurrentAlerts(prev => 
        prev.map(alert => 
          alert.id === alertId 
            ? { ...alert, isActive: false }
            : alert
        )
      );
      
      console.log(`🚫 Alerta descartada permanentemente: ${alertToMiss.type} - ${alertToMiss.message}`);
    }
  };

  const handleToggleAlertsBubble = () => {
    setShowAlertsBubble(!showAlertsBubble);
  };

  const getAlertTypeIcon = (type) => {
    switch (type) {
      case 'critical': return 'warning';
      case 'warning': return 'alert-circle';
      case 'info': return 'information-circle';
      default: return 'alert-circle';
    }
  };

  const getAlertTypeColor = (type) => {
    return ColorHelpers.getAlertColor(type, theme);
  };

  // Cambiar sensores activos usando macAddress
  const handleSensorIdsChange = (newSensorMacs) => {
    setActiveSensorIds(newSensorMacs);
    // Guardar la configuración de sensores activos (macAddress)
    StorageUtils.saveUserPreferences({
      ...userPreferences,
      activeSensorIds: newSensorMacs
    });
  }

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      loadDataFromAPI(false),
      loadSensorData()
    ]);
    setRefreshing(false);
  };

  // Alternar notificaciones push - RESPONSIVE
  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    
    // Si se desactivan las notificaciones, cerrar la burbuja de alertas
    if (notificationsEnabled) {
      setShowAlertsBubble(false);
    }
    
    // Mensajes responsive según el dispositivo
    const messages = {
      activatedTitle: 'Notificaciones Activadas',
      activatedMessage: isMobile 
        ? 'Recibirás alertas como notificaciones push móviles y verás el botón flotante responsive.'
        : 'Recibirás alertas de tu invernadero como notificaciones push y verás el botón flotante de alertas.',
      deactivatedTitle: 'Notificaciones Desactivadas',
      deactivatedMessage: isMobile
        ? 'Notificaciones push móviles desactivadas. El botón flotante estará oculto.'
        : 'Ya no recibirás notificaciones push de alertas y el botón flotante estará oculto.'
    };
    
    if (!notificationsEnabled) {
      Alert.alert(
        messages.activatedTitle,
        messages.activatedMessage,
        [{ text: 'OK' }],
        { 
          cancelable: true,
          userInterfaceStyle: isDark ? 'dark' : 'light'
        }
      );
      console.log(`📱 Notificaciones activadas - Modo: ${isMobile ? 'Móvil' : 'Desktop'} (${responsiveConfig.screenWidth}x${responsiveConfig.screenHeight})`);
    } else {
      Alert.alert(
        messages.deactivatedTitle,
        messages.deactivatedMessage,
        [{ text: 'OK' }],
        { 
          cancelable: true,
          userInterfaceStyle: isDark ? 'dark' : 'light'
        }
      );
      console.log(`🔕 Notificaciones desactivadas - Modo: ${isMobile ? 'Móvil' : 'Desktop'}`);
    }
  };

  // Enviar notificación de prueba - RESPONSIVE
  const sendTestNotification = async () => {
    if (!notificationsEnabled) {
      const message = isMobile 
        ? 'Activa las notificaciones para enviar una prueba móvil.'
        : 'Activa las notificaciones para enviar una notificación de prueba.';
        
      Alert.alert(
        'Notificaciones Desactivadas',
        message,
        [{ text: 'OK' }],
        { 
          cancelable: true,
          userInterfaceStyle: isDark ? 'dark' : 'light'
        }
      );
      return;
    }

    try {
      console.log(`🧪 Enviando notificación de prueba responsive - Dispositivo: ${isMobile ? 'Móvil' : 'Desktop'}`);
      
      const testMessage = isMobile 
        ? `Sistema móvil funcionando correctamente (${responsiveConfig.screenWidth}x${responsiveConfig.screenHeight})`
        : 'El sistema de notificaciones está funcionando correctamente.';
      
      await NotificationService.sendLocalNotification(
        '🧪 Prueba Responsive',
        testMessage,
        { 
          type: 'test',
          deviceType: isMobile ? 'mobile' : 'desktop',
          scale: scale.toFixed(2),
          dimensions: `${responsiveConfig.screenWidth}x${responsiveConfig.screenHeight}`
        }
      );
      
      const successMessage = isMobile
        ? `Notificación móvil enviada correctamente. Escala aplicada: ${scale.toFixed(2)}`
        : 'Se ha enviado una notificación de prueba.';
      
      Alert.alert(
        'Notificación Enviada',
        successMessage,
        [{ text: 'OK' }],
        { 
          cancelable: true,
          userInterfaceStyle: isDark ? 'dark' : 'light'
        }
      );
      
      console.log(`✅ Notificación de prueba enviada - Configuración responsive aplicada`);
      
    } catch (error) {
      console.error('❌ Error enviando notificación de prueba responsive:', error);
      
      const errorMessage = isMobile
        ? 'No se pudo enviar la notificación móvil de prueba.'
        : 'No se pudo enviar la notificación de prueba.';
        
      Alert.alert(
        'Error',
        errorMessage,
        [{ text: 'OK' }],
        { 
          cancelable: true,
          userInterfaceStyle: isDark ? 'dark' : 'light'
        }
      );
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.success} />
          <Text style={styles.loadingText}>Cargando datos del invernadero...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      {/* Botón Flotante de Alertas */}
      {notificationsEnabled && currentAlerts.filter(alert => alert.isActive).length > 0 && (
        <>
          <TouchableOpacity 
            style={styles.floatingAlertButton}
            onPress={handleToggleAlertsBubble}
            activeOpacity={0.8}
          >
            <View style={styles.alertIcon}>
              <Ionicons name="notifications" size={responsiveConfig.notification.alertIconSize} color={theme.colors.onPrimary} />
              <View style={styles.alertBadge}>
                <Text style={styles.alertBadgeText}>
                  {currentAlerts.filter(alert => alert.isActive).length}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Burbuja de Alertas */}
          {showAlertsBubble && (
            <View style={styles.alertsBubble}>
              <View style={styles.alertsBubbleHeader}>
                <Text style={styles.alertsBubbleTitle}>
                  {notificationsEnabled ? 'Alertas Activas' : 'Alertas Silenciadas'}
                </Text>
                <TouchableOpacity 
                  onPress={handleToggleAlertsBubble}
                  style={styles.closeBubbleButton}
                >
                  <Ionicons name="close" size={Math.max(18 * scale, 16)} color={theme.colors.onSurfaceVariant} />
                </TouchableOpacity>
              </View>
              
              {!notificationsEnabled && (
                <View style={styles.silencedNotice}>
                  <Ionicons name="notifications-off" size={Math.max(14 * scale, 12)} color={theme.warning} />
                  <Text style={styles.silencedNoticeText}>
                    Notificaciones desactivadas - Solo visualización
                  </Text>
                </View>
              )}
              
              <ScrollView style={styles.alertsList} showsVerticalScrollIndicator={false}>
                {currentAlerts.filter(alert => alert.isActive).map((alert, index) => (
                  <View key={alert.id || index} style={styles.alertItem}>
                    <View style={styles.alertItemHeader}>
                      <Ionicons 
                        name={getAlertTypeIcon(alert.type)} 
                        size={Math.max(18 * scale, 16)} 
                        color={getAlertTypeColor(alert.type)} 
                      />
                      <Text style={[styles.alertItemTitle, { color: getAlertTypeColor(alert.type) }]}>
                        {alert.title || (alert.type === 'critical' ? 'Alerta Crítica' : alert.type === 'warning' ? 'Advertencia' : 'Información')}
                      </Text>
                    </View>
                    <Text style={styles.alertItemMessage}>{alert.message}</Text>
                    <Text style={styles.alertItemTime}>
                      {alert.timestamp ? new Date(alert.timestamp).toLocaleTimeString('es-ES') : 'Ahora'}
                    </Text>
                    <TouchableOpacity 
                      style={styles.dismissButton}
                      onPress={() => handleDismissAlert(alert.id)}
                    >
                      <Text style={styles.dismissButtonText}>Descartar</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </>
      )}

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerMain}>
            <Text style={styles.headerTitle}>Dashboard Invernadero</Text>
            
            {/* Status de Conexión */}
            <ConnectionStatus 
              compact={true} 
              style={styles.connectionStatus}
              onStatusPress={(info) => {
                Alert.alert(
                  'Estado de Conexión',
                  `API actual: ${info.isPrimary ? 'Local' : 'Remota'}\nURL: ${info.currentUrl}`,
                  [{ text: 'OK' }],
                  { 
                    cancelable: true,
                    userInterfaceStyle: isDark ? 'dark' : 'light'
                  }
                );
              }}
            />

            {/* Selector de Tema */}
            <ThemeSelector 
              compact={true}
              showLabels={false}
              style={styles.themeSelector}
            />
            
            <View style={styles.headerControls}>
              <TouchableOpacity 
                style={[styles.notificationToggle, { 
                  backgroundColor: notificationsEnabled ? theme.success : theme.disabled 
                }]}
                onPress={toggleNotifications}
              >
                <Ionicons 
                  name={notificationsEnabled ? "notifications" : "notifications-off"} 
                  size={Math.max(18 * scale, 16)} 
                  color="#fff" 
                />
              </TouchableOpacity>
              
              {!notificationsEnabled && currentAlerts.filter(alert => alert.isActive).length > 0 && (
                <TouchableOpacity 
                  style={[styles.silencedAlertsButton]}
                  onPress={() => setShowAlertsBubble(!showAlertsBubble)}
                >
                  <Ionicons name="eye-outline" size={Math.max(18 * scale, 16)} color={theme.warning} />
                  <View style={styles.silencedAlertsBadge}>
                    <Text style={styles.silencedAlertsBadgeText}>
                      {currentAlerts.filter(alert => alert.isActive).length}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={styles.testButton}
                onPress={sendTestNotification}
              >
                <Ionicons name="flask-outline" size={Math.max(18 * scale, 16)} color={theme.colors.onSurfaceVariant} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.headerInfo}>
            <View>
              <Text style={styles.headerSubtitle}>
                Última actualización: {lastUpdate.toLocaleTimeString('es-ES')}
              </Text>
              <Text style={styles.headerSubtitle}>
                Sensores activos: {activeSensorIds.length > 0 ? activeSensorIds.join(', ') : 'Ninguno'}
              </Text>
              {availableSensorIds.length > 0 && (
                <Text style={[styles.headerSubtitle, { color: theme.success, fontWeight: '500' }]}>
                  ✓ {availableSensorIds.length} sensor(es) detectado(s) - {Object.values(sensors).filter(s => s.isReal).length} transmitiendo datos
                </Text>
              )}
              {expoPushToken && (
                <Text style={[styles.headerSubtitle, { fontSize: 12, color: notificationsEnabled ? theme.success : theme.disabled }]}>
                  {notificationsEnabled ? '📱 Notificaciones: Activas' : '📱 Notificaciones: Desactivadas'}
                </Text>
              )}
              {!notificationsEnabled && currentAlerts.filter(alert => alert.isActive).length > 0 && (
                <Text style={[styles.headerSubtitle, { fontSize: 12, color: theme.warning, fontWeight: '500' }]}>
                  ⚠️ {currentAlerts.filter(alert => alert.isActive).length} alerta(s) silenciada(s)
                </Text>
              )}
            </View>
            <View style={[styles.connectionStatus, { 
              backgroundColor: apiConnected ? theme.success : theme.error 
            }]}>
              <Text style={[styles.connectionText, { color: theme.colors.onPrimary }]}>
                {apiConnected ? '🟢 Conectado' : '🔴 Sin conexión'}
              </Text>
            </View>
          </View>
        </View>

        {/* Banner de Estado de Datos */}
        <DataModeBanner 
          isUsingRealData={Object.values(sensors).some(sensor => sensor.isReal)}
          isConnected={apiConnected}
          sensorsCount={activeSensorIds.length}
          lastUpdate={lastUpdate}
          onRefresh={() => loadSensorData()}
          apiUrl={ApiService.getCurrentApiInfo().baseUrl}
        />

        {/* Sensores - Panel Principal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Monitoreo de Sensores</Text>
          <View style={styles.sensorsGrid}>
            <SensorCard
              title="Temperatura Ambiente"
              value={sensors.temperature.current}
              unit={sensors.temperature.unit}
              status={getSensorStatus(sensors.temperature)}
              icon="thermometer-outline"
              ideal={sensors.temperature.ideal}
              isReal={sensors.temperature.isReal || false}
              sensorId={sensors.temperature.sensorId}
              lastUpdate={sensors.temperature.lastUpdate}
              source={sensors.temperature.source || 'unknown'}
              isConnected={apiConnected}
            />
            <SensorCard
              title="Humedad del Aire"
              value={sensors.airHumidity.current}
              unit={sensors.airHumidity.unit}
              status={getSensorStatus(sensors.airHumidity)}
              icon="water-outline"
              ideal={sensors.airHumidity.ideal}
              isReal={sensors.airHumidity.isReal || false}
              sensorId={sensors.airHumidity.sensorId}
              lastUpdate={sensors.airHumidity.lastUpdate}
              source={sensors.airHumidity.source || 'unknown'}
              isConnected={apiConnected}
            />
            <SensorCard
              title="Humedad del Suelo"
              value={sensors.soilHumidity.current}
              unit={sensors.soilHumidity.unit}
              status={getSensorStatus(sensors.soilHumidity)}
              icon="leaf-outline"
              ideal={sensors.soilHumidity.ideal}
              isReal={sensors.soilHumidity.isReal || false}
              sensorId={sensors.soilHumidity.sensorId}
              lastUpdate={sensors.soilHumidity.lastUpdate}
              source={sensors.soilHumidity.source || 'unknown'}
              isConnected={apiConnected}
            />
            {sensors.soilSalinity && (
              <SensorCard
                title="Salinidad del Suelo"
                value={sensors.soilSalinity.current}
                unit={sensors.soilSalinity.unit}
                status={getSensorStatus(sensors.soilSalinity)}
                icon="beaker-outline"
                ideal={sensors.soilSalinity.ideal}
                isReal={sensors.soilSalinity.isReal || false}
                sensorId={sensors.soilSalinity.sensorId}
                lastUpdate={sensors.soilSalinity.lastUpdate}
                source={sensors.soilSalinity.source || 'unknown'}
                isConnected={apiConnected}
              />
            )}
            <SensorCard
              title="pH del Suelo"
              value={sensors.soilPH.current}
              unit={sensors.soilPH.unit}
              status={getSensorStatus(sensors.soilPH)}
              icon="flask-outline"
              ideal={sensors.soilPH.ideal}
              isReal={sensors.soilPH.isReal || false}
              sensorId={sensors.soilPH.sensorId}
              lastUpdate={sensors.soilPH.lastUpdate}
              isCalculated={sensors.soilPH.isCalculated}
              calculationMethod={sensors.soilPH.calculationMethod}
              source={sensors.soilPH.source || 'unknown'}
              isConnected={apiConnected}
            />
          </View>
        </View>

        {/* Estado en Tiempo Real - Panel Compacto */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estado en Tiempo Real</Text>
          <RealTimeStatus 
            sensors={sensors}
            activeSensorIds={activeSensorIds}
            apiConnected={apiConnected}
            lastUpdate={lastUpdate}
          />
        </View>

        {/* Gestión de Sensores */}
        <View style={styles.section}>
          <SensorManager 
            activeSensorIds={activeSensorIds}
            availableSensorIds={availableSensorIds}
            onSensorIdsChange={handleSensorIdsChange}
          />
        </View>

        {/* Información Detallada - Panel Expandible */}
        <View style={styles.section}>
          <DeviceInfoPanel devices={devices} sensors={sensors} />
        </View>

        {/* Prueba de API */}
        <View style={styles.section}>
          <ApiTestComponent />
        </View>

        {/* Controles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Controles Automáticos</Text>
          <View style={styles.controlsGrid}>
            <DeviceControl
              title={devices.irrigation.name}
              isActive={devices.irrigation.isActive}
              onToggle={() => handleDeviceToggle('irrigation')}
              icon="water"
              isAutomatic={devices.irrigation.isAutomatic}
              onAutomaticToggle={() => handleAutomaticToggle('irrigation')}
              additionalInfo={`Horario: ${devices.irrigation.schedule}`}
            />
            <DeviceControl
              title={devices.ventilation.name}
              isActive={devices.ventilation.isActive}
              onToggle={() => handleDeviceToggle('ventilation')}
              icon="refresh-outline"
              isAutomatic={devices.ventilation.isAutomatic}
              onAutomaticToggle={() => handleAutomaticToggle('ventilation')}
              additionalInfo={`Velocidad: ${devices.ventilation.speed}%`}
            />
            <DeviceControl
              title={devices.lighting.name}
              isActive={devices.lighting.isActive}
              onToggle={() => handleDeviceToggle('lighting')}
              icon="bulb-outline"
              isAutomatic={devices.lighting.isAutomatic}
              onAutomaticToggle={() => handleAutomaticToggle('lighting')}
              additionalInfo={`Intensidad: ${devices.lighting.intensity}%`}
            />
            <DeviceControl
              title={devices.heating.name}
              isActive={devices.heating.isActive}
              onToggle={() => handleDeviceToggle('heating')}
              icon="flame-outline"
              isAutomatic={devices.heating.isAutomatic}
              onAutomaticToggle={() => handleAutomaticToggle('heating')}
              additionalInfo={`Objetivo: ${devices.heating.targetTemperature}°C`}
            />
            <DeviceControl
              title={devices.windows.name}
              isActive={devices.windows.isOpen}
              onToggle={() => handleDeviceToggle('windows')}
              icon="home-outline"
              isAutomatic={devices.windows.isAutomatic}
              onAutomaticToggle={() => handleAutomaticToggle('windows')}
              additionalInfo={`Apertura: ${devices.windows.openPercentage}%`}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme, responsiveConfig) => {
  const { notification, isMobile, scale, screenWidth, screenHeight } = responsiveConfig;
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollView: {
      flex: 1,
    },
    header: {
      padding: isMobile ? 16 * scale : 20,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    headerMain: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    headerTitle: {
      fontSize: isMobile ? Math.max(20 * scale, 18) : 24,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
      flex: 1,
    },
    connectionStatus: {
      marginHorizontal: isMobile ? 8 * scale : 12,
    },
    themeSelector: {
      marginHorizontal: isMobile ? 6 * scale : 8,
    },
    headerControls: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: isMobile ? 8 * scale : 12,
    },
    notificationToggle: {
      width: notification.headerControlSize,
      height: notification.headerControlSize,
      borderRadius: notification.headerControlSize / 2,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: isMobile ? 3 : 4,
    },
    testButton: {
      width: notification.headerControlSize,
      height: notification.headerControlSize,
      borderRadius: notification.headerControlSize / 2,
      backgroundColor: theme.colors.surfaceVariant,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    silencedAlertsButton: {
      width: notification.headerControlSize,
      height: notification.headerControlSize,
      borderRadius: notification.headerControlSize / 2,
      backgroundColor: theme.colors.warningContainer,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.colors.warning,
      position: 'relative',
    },
    silencedAlertsBadge: {
      position: 'absolute',
      top: -6 * scale,
      right: -6 * scale,
      backgroundColor: theme.colors.warning,
      borderRadius: 8 * scale,
      minWidth: notification.alertBadgeSize * 0.8,
      height: notification.alertBadgeSize * 0.8,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.surface,
    },
    silencedAlertsBadgeText: {
      color: theme.colors.onWarning,
      fontSize: notification.fontSize.badge,
      fontWeight: 'bold',
    },
    silencedNotice: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: isMobile ? 10 * scale : 12,
      backgroundColor: theme.colors.warningContainer,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
      justifyContent: 'center',
  },
  silencedNoticeText: {
    fontSize: 12,
    color: theme.colors.onWarningContainer,
    marginLeft: 6,
    fontWeight: '500',
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.onSurface,
    marginTop: 4,
  },
  headerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  connectionStatus: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  connectionText: {
    color: theme.colors.onPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.onBackground,
  },
  section: {
    marginVertical: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    marginHorizontal: 12,
    paddingVertical: 16,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    marginBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.outline,
    paddingBottom: 12,
  },
  sensorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 16,
  },
  controlsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 16,
  },
  floatingAlertButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 56,
    height: 56,
    backgroundColor: theme.colors.warning,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    zIndex: 1000,
  },
  alertIcon: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: theme.colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },
  alertBadgeText: {
    color: theme.colors.onError,
    fontSize: 11,
    fontWeight: 'bold',
  },
  alertsBubble: {
    position: 'absolute',
    top: 125,
    right: 20,
    width: 320,
    maxHeight: 400,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    elevation: 12,
    zIndex: 999,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  alertsBubbleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline,
  },
  alertsBubbleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  closeBubbleButton: {
    padding: 4,
  },
  alertsList: {
    maxHeight: 300,
  },
  alertItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceVariant,
  },
  alertItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertItemTitle: {
    fontSize: 14,
    fontWeight: '600',
      marginLeft: 8,
      flex: 1,
    },
    alertItemMessage: {
      fontSize: notification.fontSize.alertMessage,
      color: theme.colors.onSurfaceVariant,
      lineHeight: isMobile ? 16 * scale : 18,
      marginBottom: 8,
    },
    alertItemTime: {
      fontSize: notification.fontSize.alertTime,
      color: theme.colors.outline,
      marginBottom: isMobile ? 10 * scale : 12,
    },
    dismissButton: {
      backgroundColor: theme.colors.surfaceVariant,
      paddingHorizontal: isMobile ? 10 * scale : 12,
      paddingVertical: isMobile ? 5 * scale : 6,
      borderRadius: isMobile ? 5 * scale : 6,
      alignSelf: 'flex-start',
    },
    dismissButtonText: {
      fontSize: isMobile ? Math.max(10 * scale, 8) : 12,
      color: theme.colors.onSurfaceVariant,
      fontWeight: '500',
    },
  });
};

}
export default DashboardScreen;
