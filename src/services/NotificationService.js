import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Configurar cómo se muestran las notificaciones cuando la app está activa
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class NotificationService {
  constructor() {
    this.expoPushToken = null;
    this.notificationListener = null;
    this.responseListener = null;
  }

  // Registrar para notificaciones push
  async registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return null;
      }
      
      try {
        // Obtener el token de push con configuración para web
        const projectId = Constants.expoConfig?.extra?.eas?.projectId || 
                         Constants.expoConfig?.extra?.applicationId || 
                         'com.dashboardtablet.invernadero';
        
        const pushTokenConfig = {
          projectId: projectId,
        };
        
        // En web, agregar applicationId si está disponible
        if (Platform.OS === 'web') {
          const applicationId = Constants.expoConfig?.extra?.applicationId || 
                               Constants.expoConfig?.android?.package || 
                               Constants.expoConfig?.ios?.bundleIdentifier;
          if (applicationId) {
            pushTokenConfig.applicationId = applicationId;
          }
        }
        
        token = (await Notifications.getExpoPushTokenAsync(pushTokenConfig)).data;
        
        console.log('Expo Push Token:', token);
      } catch (error) {
        console.warn('Error getting push token:', error);
        // En web, las notificaciones pueden funcionar sin token push
        if (Platform.OS === 'web') {
          console.log('Web notifications will work with local notifications only');
          return 'web-notifications-enabled';
        }
      }
    } else {
      console.log('Must use physical device for Push Notifications');
      // En desarrollo web, permitir notificaciones locales
      if (Platform.OS === 'web') {
        return 'web-dev-notifications';
      }
    }

    this.expoPushToken = token;
    return token;
  }

  // Configurar listeners de notificaciones
  setupNotificationListeners(onNotificationReceived, onNotificationResponse) {
    // Listener para notificaciones recibidas mientras la app está activa
    this.notificationListener = Notifications.addNotificationReceivedListener(onNotificationReceived);

    // Listener para cuando el usuario toca una notificación
    this.responseListener = Notifications.addNotificationResponseReceivedListener(onNotificationResponse);
  }

  // Limpiar listeners
  cleanup() {
    if (this.notificationListener) {
      this.notificationListener.remove();
    }
    if (this.responseListener) {
      this.responseListener.remove();
    }
  }

  // Enviar notificación local inmediata
  async sendLocalNotification(title, body, data = {}) {
    try {
      // En web, usar la API nativa de notificaciones si está disponible
      if (Platform.OS === 'web' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification(title, {
            body: body,
            icon: '/favicon.png',
            badge: '/favicon.png',
            data: data
          });
          return;
        }
      }
      
      // Para plataformas nativas o web con expo-notifications
      await Notifications.scheduleNotificationAsync({
        content: {
          title: title,
          body: body,
          data: data,
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
          color: this.getNotificationColor(data.alertType),
        },
        trigger: null, // Inmediata
      });
    } catch (error) {
      console.warn('Error sending notification:', error);
      // En web, intentar notificación del navegador como fallback
      if (Platform.OS === 'web' && 'Notification' in window) {
        if (Notification.permission === 'default') {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            new Notification(title, { body: body, icon: '/favicon.png' });
          }
        }
      }
    }
  }

  // Enviar notificación de alerta
  async sendAlertNotification(alert) {
    const title = this.getAlertTitle(alert.type);
    const icon = this.getAlertIcon(alert.type);
    
    await this.sendLocalNotification(
      `🔔 ${title}`,
      alert.message,
      {
        alertType: alert.type,
        alertId: alert.id,
        sensorKey: alert.sensorKey,
        timestamp: alert.timestamp,
      }
    );
  }

  // Enviar múltiples notificaciones de alerta
  async sendMultipleAlertNotifications(alerts) {
    const activeAlerts = alerts.filter(alert => alert.isActive);
    
    if (activeAlerts.length === 0) return;

    if (activeAlerts.length === 1) {
      await this.sendAlertNotification(activeAlerts[0]);
    } else {
      // Notificación resumen para múltiples alertas
      const criticalCount = activeAlerts.filter(a => a.type === 'critical').length;
      const warningCount = activeAlerts.filter(a => a.type === 'warning').length;
      
      let summaryText = '';
      if (criticalCount > 0) {
        summaryText += `${criticalCount} crítica(s)`;
      }
      if (warningCount > 0) {
        if (summaryText) summaryText += ', ';
        summaryText += `${warningCount} advertencia(s)`;
      }

      await this.sendLocalNotification(
        `🚨 ${activeAlerts.length} Alertas Activas`,
        `Invernadero: ${summaryText}`,
        {
          alertType: 'multiple',
          alertCount: activeAlerts.length,
          criticalCount,
          warningCount,
        }
      );
    }
  }

  // Cancelar todas las notificaciones pendientes
  async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  // Obtener el color de la notificación según el tipo
  getNotificationColor(alertType) {
    switch (alertType) {
      case 'critical': return '#F44336';
      case 'warning': return '#FF9800';
      case 'info': return '#2196F3';
      default: return '#FF9800';
    }
  }

  // Obtener el título según el tipo de alerta
  getAlertTitle(type) {
    switch (type) {
      case 'critical': return 'Alerta Crítica';
      case 'warning': return 'Advertencia';
      case 'info': return 'Información';
      default: return 'Notificación';
    }
  }

  // Obtener icono según el tipo de alerta
  getAlertIcon(type) {
    switch (type) {
      case 'critical': return '🚨';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '🔔';
    }
  }

  // Programar notificaciones periódicas de resumen
  async schedulePeriodicSummary() {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📊 Resumen del Invernadero',
        body: 'Toca para ver el estado actual de tus sensores',
        data: { type: 'summary' },
      },
      trigger: {
        seconds: 3600, // Cada hora
        repeats: true,
      },
    });
  }
}

export default new NotificationService();
