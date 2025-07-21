import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  RefreshControl,
  Alert,
  ActivityIndicator,
  TouchableOpacity 
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
import ApiService from '../services/ApiService';
import NotificationService from '../services/NotificationService';
import StorageUtils from '../utils/storage';
import { sensorData as fallbackSensorData, deviceStates as fallbackDeviceStates } from '../data/mockData';

const DashboardScreen = () => {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme);
  const [sensors, setSensors] = useState(fallbackSensorData);
  const [devices, setDevices] = useState(fallbackDeviceStates);
  const [currentAlerts, setCurrentAlerts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [apiConnected, setApiConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [showAlertsBubble, setShowAlertsBubble] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const previousAlertsRef = useRef([]);
  const [userPreferences, setUserPreferences] = useState(() => StorageUtils.getUserPreferences());
  const [activeSensorIds, setActiveSensorIds] = useState(() => {
    const prefs = StorageUtils.getUserPreferences();
    return prefs.activeSensorIds || []; // Inicialmente vacío, se llenará desde la API
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

  // Configurar sistema de notificaciones
  const setupNotifications = async () => {
    try {
      const token = await NotificationService.registerForPushNotificationsAsync();
      setExpoPushToken(token || '');

      // Configurar listeners de notificaciones
      NotificationService.setupNotificationListeners(
        (notification) => {
          console.log('Notificación recibida:', notification);
        },
        (response) => {
          console.log('Respuesta a notificación:', response);
          // Abrir la burbuja de alertas si se toca una notificación de alerta
          if (response.notification.request.content.data?.alertType) {
            setShowAlertsBubble(true);
          }
        }
      );

      console.log('Sistema de notificaciones configurado correctamente');
    } catch (error) {
      console.error('Error configurando notificaciones:', error);
      setNotificationsEnabled(false);
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
      // Obtener dispositivos del usuario 1
      const apiData = await ApiService.getDispositivosForUser(1);
      
      console.log('Datos de la API:', apiData);
      
      // Extraer IDs de sensores de los dispositivos obtenidos
      const availableSensorIds = ApiService.extractSensorIds(apiData);
      console.log('IDs de sensores disponibles:', availableSensorIds);
      
      // Actualizar la lista de sensores disponibles
      setAvailableSensorIds(availableSensorIds);
      
      // Si no hay sensores activos configurados, usar los sensores disponibles
      if (activeSensorIds.length === 0 && availableSensorIds.length > 0) {
        setActiveSensorIds(availableSensorIds);
        // Guardar los sensores encontrados como preferencia
        StorageUtils.saveUserPreferences({
          ...userPreferences,
          activeSensorIds: availableSensorIds
        });
      }
      
      // Transformar datos de sensores
      const transformedSensorData = ApiService.transformApiDataToSensorData(apiData);
      setSensors(transformedSensorData);
      
      // Guardar historial de sensores en localStorage
      StorageUtils.saveSensorHistory(transformedSensorData);
      
      // Transformar datos de dispositivos usando información real
      const transformedDeviceStates = ApiService.transformRealDevicesToDashboard(apiData);
      setDevices(transformedDeviceStates);
      
      // Generar alertas basadas en los datos de sensores
      const generatedAlerts = ApiService.generateAlertsFromSensorData(transformedSensorData);
      
      // Filtrar alertas que ya han sido descartadas por el usuario
      const filteredAlerts = StorageUtils.filterDismissedAlerts(generatedAlerts);
      setCurrentAlerts(filteredAlerts);
      
      setApiConnected(true);
      setLastUpdate(new Date());
      
    } catch (error) {
      console.error('Error al cargar datos de la API:', error);
      setApiConnected(false);
      
      // Si no se pueden cargar los datos de la API, usar datos de respaldo
      if (showLoading) {
        Alert.alert(
          'Error de conexión',
          'No se pudo conectar con el servidor. Usando datos simulados.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Cargar datos específicos de sensores
  const loadSensorData = async () => {
    // Solo cargar si hay sensores activos
    if (activeSensorIds.length === 0) {
      console.log('No hay sensores activos configurados');
      return;
    }
    
    try {
      console.log('Cargando datos específicos de sensores:', activeSensorIds);
      
      // Obtener datos de todos los sensores activos
      const sensorsData = await ApiService.getMultipleSensorsData(activeSensorIds, 1);
      
      if (sensorsData && sensorsData.length > 0) {
        // Transformar datos al formato del dashboard
        const transformedSensorData = ApiService.transformMultipleSensorsToDisplay(sensorsData);
        setSensors(transformedSensorData);
        
        // Guardar historial de sensores en localStorage
        StorageUtils.saveSensorHistory(transformedSensorData);
        
        // Generar alertas basadas en los datos actualizados de sensores
        const generatedAlerts = ApiService.generateAlertsFromSensorData(transformedSensorData);
        
        // Filtrar alertas que ya han sido descartadas por el usuario
        const filteredAlerts = StorageUtils.filterDismissedAlerts(generatedAlerts);
        setCurrentAlerts(filteredAlerts);
        
        console.log('Datos de sensores actualizados:', transformedSensorData);
        
        // Marcar como conectado si al menos un sensor responde
        setApiConnected(true);
        setLastUpdate(new Date());
      }
      
    } catch (error) {
      console.warn('Error al cargar datos específicos de sensores:', error);
      // No mostrar alerta aquí ya que pueden fallar sensores individuales
    }
  };

  const updateSensorData = () => {
    setSensors(prevSensors => {
      const newSensors = { ...prevSensors };
      
      // Simular cambios pequeños en los valores
      Object.keys(newSensors).forEach(key => {
        const current = newSensors[key].current;
        const variation = (Math.random() - 0.5) * 2; // Variación de -1 a +1
        newSensors[key].current = Math.round((current + variation) * 10) / 10;
        
        // Actualizar historial
        newSensors[key].history = [
          ...newSensors[key].history.slice(1),
          newSensors[key].current
        ];
      });
      
      return newSensors;
    });
  };

  const getSensorStatus = (sensor) => {
    const { current, ideal } = sensor;
    if (current >= ideal.min && current <= ideal.max) return 'optimal';
    if (current < ideal.min * 0.8 || current > ideal.max * 1.2) return 'critical';
    return 'warning';
  };

  const handleDeviceToggle = async (deviceKey) => {
    const device = devices[deviceKey];
    const newState = !device.isActive && !device.isOpen;
    
    // Si hay un dispositivo real conectado, intentar controlarlo
    if (device.realDevice && device.realDevice.id) {
      try {
        console.log(`Controlando dispositivo real: ${device.realDevice.name} (ID: ${device.realDevice.id})`);
        await ApiService.controlSwitch(device.realDevice.id, newState);
        
        // Si el control fue exitoso, actualizar el estado local
        const newDevices = {
          ...devices,
          [deviceKey]: {
            ...devices[deviceKey],
            isActive: deviceKey === 'windows' ? device.isOpen : newState,
            isOpen: deviceKey === 'windows' ? newState : device.isOpen
          }
        };
        setDevices(newDevices);
        StorageUtils.saveDeviceSettings(newDevices);
        
        // Mostrar confirmación
        Alert.alert(
          'Control exitoso',
          `${device.name} ${newState ? 'activado' : 'desactivado'} correctamente`,
          [{ text: 'OK' }]
        );
        
      } catch (error) {
        console.error('Error al controlar dispositivo real:', error);
        Alert.alert(
          'Error de control',
          `No se pudo controlar ${device.name}. Modo simulado activado.`,
          [{ text: 'OK' }]
        );
        
        // Continuar con simulación si falla el control real
        updateDeviceLocally(deviceKey, newState);
      }
    } else {
      // Dispositivo simulado
      updateDeviceLocally(deviceKey, newState);
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

  const handleSensorIdsChange = (newSensorIds) => {
    setActiveSensorIds(newSensorIds);
    // Guardar la configuración de sensores activos
    StorageUtils.saveUserPreferences({
      ...userPreferences,
      activeSensorIds: newSensorIds
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      loadDataFromAPI(false),
      loadSensorData()
    ]);
    setRefreshing(false);
  };

  // Alternar notificaciones push
  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    
    // Si se desactivan las notificaciones, cerrar la burbuja de alertas
    if (notificationsEnabled) {
      setShowAlertsBubble(false);
    }
    
    if (!notificationsEnabled) {
      Alert.alert(
        'Notificaciones Activadas',
        'Recibirás alertas de tu invernadero como notificaciones push y verás el botón flotante de alertas.',
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        'Notificaciones Desactivadas',
        'Ya no recibirás notificaciones push de alertas y el botón flotante estará oculto.',
        [{ text: 'OK' }]
      );
    }
  };

  // Enviar notificación de prueba
  const sendTestNotification = async () => {
    if (!notificationsEnabled) {
      Alert.alert(
        'Notificaciones Desactivadas',
        'Activa las notificaciones para enviar una notificación de prueba.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      await NotificationService.sendLocalNotification(
        '🧪 Notificación de Prueba',
        'El sistema de notificaciones está funcionando correctamente.',
        { type: 'test' }
      );
      
      Alert.alert(
        'Notificación Enviada',
        'Se ha enviado una notificación de prueba.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error enviando notificación de prueba:', error);
      Alert.alert(
        'Error',
        'No se pudo enviar la notificación de prueba.',
        [{ text: 'OK' }]
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
              <Ionicons name="notifications" size={24} color="#fff" />
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
                  <Ionicons name="close" size={20} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>
              
              {!notificationsEnabled && (
                <View style={styles.silencedNotice}>
                  <Ionicons name="notifications-off" size={16} color={theme.warning} />
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
                        size={20} 
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
                  [{ text: 'OK' }]
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
                  size={20} 
                  color="#fff" 
                />
              </TouchableOpacity>
              
              {!notificationsEnabled && currentAlerts.filter(alert => alert.isActive).length > 0 && (
                <TouchableOpacity 
                  style={[styles.silencedAlertsButton]}
                  onPress={() => setShowAlertsBubble(!showAlertsBubble)}
                >
                  <Ionicons name="eye-outline" size={20} color={theme.warning} />
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
                <Ionicons name="flask-outline" size={20} color={theme.textSecondary} />
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
              <Text style={[styles.connectionText, { color: theme.textOnPrimary }]}>
                {apiConnected ? '🟢 Conectado' : '🔴 Sin conexión'}
              </Text>
            </View>
          </View>
        </View>

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
              isReal={sensors.temperature.isReal}
              sensorId={sensors.temperature.sensorId}
              lastUpdate={sensors.temperature.lastUpdate}
            />
            <SensorCard
              title="Humedad del Aire"
              value={sensors.airHumidity.current}
              unit={sensors.airHumidity.unit}
              status={getSensorStatus(sensors.airHumidity)}
              icon="water-outline"
              ideal={sensors.airHumidity.ideal}
              isReal={sensors.airHumidity.isReal}
              sensorId={sensors.airHumidity.sensorId}
              lastUpdate={sensors.airHumidity.lastUpdate}
            />
            <SensorCard
              title="Humedad del Suelo"
              value={sensors.soilHumidity.current}
              unit={sensors.soilHumidity.unit}
              status={getSensorStatus(sensors.soilHumidity)}
              icon="leaf-outline"
              ideal={sensors.soilHumidity.ideal}
              isReal={sensors.soilHumidity.isReal}
              sensorId={sensors.soilHumidity.sensorId}
              lastUpdate={sensors.soilHumidity.lastUpdate}
            />
            {sensors.soilSalinity && (
              <SensorCard
                title="Salinidad del Suelo"
                value={sensors.soilSalinity.current}
                unit={sensors.soilSalinity.unit}
                status={getSensorStatus(sensors.soilSalinity)}
                icon="beaker-outline"
                ideal={sensors.soilSalinity.ideal}
                isReal={sensors.soilSalinity.isReal}
                sensorId={sensors.soilSalinity.sensorId}
                lastUpdate={sensors.soilSalinity.lastUpdate}
              />
            )}
            <SensorCard
              title="pH del Suelo"
              value={sensors.soilPH.current}
              unit={sensors.soilPH.unit}
              status={getSensorStatus(sensors.soilPH)}
              icon="flask-outline"
              ideal={sensors.soilPH.ideal}
              isReal={sensors.soilPH.isReal}
              sensorId={sensors.soilPH.sensorId}
              lastUpdate={sensors.soilPH.lastUpdate}
              isCalculated={sensors.soilPH.isCalculated}
              calculationMethod={sensors.soilPH.calculationMethod}
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

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: theme.headerBackground,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  headerMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.textPrimary,
    flex: 1,
  },
  connectionStatus: {
    marginHorizontal: 12,
  },
  themeSelector: {
    marginHorizontal: 8,
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationToggle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  testButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  silencedAlertsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.dashboard?.alertBackground || '#fff3e0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.warning,
    position: 'relative',
  },
  silencedAlertsBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: theme.warning,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  silencedAlertsBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  silencedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff3e0',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    justifyContent: 'center',
  },
  silencedNoticeText: {
    fontSize: 12,
    color: theme.warning,
    marginLeft: 6,
    fontWeight: '500',
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.textSecondary,
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
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.backgroundSecondary,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.textSecondary,
  },
  section: {
    marginVertical: 12,
    backgroundColor: theme.surface,
    borderRadius: 12,
    marginHorizontal: 12,
    paddingVertical: 16,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 2,
    borderBottomColor: theme.border,
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
    backgroundColor: theme.warning,
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
    backgroundColor: '#F44336',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  alertBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  alertsBubble: {
    position: 'absolute',
    top: 125,
    right: 20,
    width: 320,
    maxHeight: 400,
    backgroundColor: theme.surface,
    borderRadius: 16,
    elevation: 12,
    zIndex: 999,
    borderWidth: 1,
    borderColor: theme.border,
  },
  alertsBubbleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  alertsBubbleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.text,
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
    borderBottomColor: '#f5f5f5',
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
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 8,
  },
  alertItemTime: {
    fontSize: 11,
    color: '#999',
    marginBottom: 12,
  },
  dismissButton: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  dismissButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
});

export default DashboardScreen;
