// Monitor de conexión para gestionar el estado de la API
import apiService from '../services/ApiService';

class ConnectionMonitor {
  constructor() {
    this.isMonitoring = false;
    this.monitorInterval = null;
    this.listeners = [];
    this.lastConnectionInfo = null;
    this.retryInterval = 60000; // 1 minuto
  }

  // Añadir listener para cambios de conexión
  addListener(callback) {
    this.listeners.push(callback);
    
    // Retornar función para remover el listener
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // Notificar a todos los listeners
  notifyListeners(connectionInfo) {
    this.listeners.forEach(callback => {
      try {
        callback(connectionInfo);
      } catch (error) {
        console.error('Error en listener de ConnectionMonitor:', error);
      }
    });
  }

  // Obtener información actual de la conexión
  getCurrentConnectionInfo() {
    return apiService.getCurrentApiInfo();
  }

  // Iniciar monitoreo automático
  startMonitoring() {
    if (this.isMonitoring) {
      return;
    }

    this.isMonitoring = true;
    console.log('🔍 Iniciando monitoreo de conexión API...');

    // Verificar inmediatamente
    this.checkConnection();

    // Configurar verificación periódica
    this.monitorInterval = setInterval(() => {
      this.checkConnection();
    }, this.retryInterval);
  }

  // Detener monitoreo
  stopMonitoring() {
    if (!this.isMonitoring) {
      return;
    }

    this.isMonitoring = false;
    
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }

    console.log('🛑 Monitoreo de conexión API detenido');
  }

  // Verificar conexión y intentar reconectar si es necesario
  async checkConnection() {
    try {
      const connectionInfo = this.getCurrentConnectionInfo();
      
      // Si estamos en fallback, intentar reconectar a primaria
      if (!connectionInfo.isPrimary) {
        const reconnected = await apiService.retryPrimaryConnection();
        
        if (reconnected) {
          const newConnectionInfo = this.getCurrentConnectionInfo();
          console.log('✅ Reconectado a API primaria');
          this.notifyListeners({
            ...newConnectionInfo,
            event: 'reconnected_to_primary',
            timestamp: new Date().toISOString()
          });
        }
      }

      // Siempre notificar el estado actual si ha cambiado
      const currentInfo = this.getCurrentConnectionInfo();
      if (!this.lastConnectionInfo || 
          this.lastConnectionInfo.currentUrl !== currentInfo.currentUrl) {
        
        this.lastConnectionInfo = currentInfo;
        this.notifyListeners({
          ...currentInfo,
          event: 'connection_status_update',
          timestamp: new Date().toISOString()
        });
      }

    } catch (error) {
      console.error('Error durante verificación de conexión:', error);
      this.notifyListeners({
        event: 'connection_check_error',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Forzar verificación manual
  async forceCheck() {
    console.log('🔍 Verificación manual de conexión...');
    await this.checkConnection();
  }

  // Forzar cambio de URL
  forceApiUrl(url) {
    apiService.forceApiUrl(url);
    this.forceCheck();
  }

  // Obtener estadísticas
  getStats() {
    const connectionInfo = this.getCurrentConnectionInfo();
    return {
      ...connectionInfo,
      isMonitoring: this.isMonitoring,
      retryInterval: this.retryInterval,
      listenersCount: this.listeners.length,
      lastCheck: this.lastConnectionInfo?.timestamp || null
    };
  }
}

// Crear instancia singleton
const connectionMonitor = new ConnectionMonitor();

export default connectionMonitor;
