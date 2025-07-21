// Hook para monitorear el estado de conexión de la API
import { useState, useEffect, useCallback } from 'react';
import connectionMonitor from '../utils/ConnectionMonitor';

export const useConnectionMonitor = (autoStart = true) => {
  const [connectionInfo, setConnectionInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Callback para manejar cambios de conexión
  const handleConnectionChange = useCallback((info) => {
    setConnectionInfo(info);
    setLastUpdate(new Date());
    setIsLoading(false);
    
    // Log del cambio para debugging
    if (info.event === 'reconnected_to_primary') {
      console.log('🔄 Hook: Reconectado a API primaria');
    } else if (info.event === 'connection_status_update') {
      console.log(`🔗 Hook: Estado de conexión - ${info.isPrimary ? 'Primaria' : 'Respaldo'}`);
    }
  }, []);

  // Efecto para configurar el listener y iniciar monitoreo
  useEffect(() => {
    // Obtener estado inicial
    const initialInfo = connectionMonitor.getCurrentConnectionInfo();
    setConnectionInfo({
      ...initialInfo,
      event: 'initial_load',
      timestamp: new Date().toISOString()
    });

    // Añadir listener
    const removeListener = connectionMonitor.addListener(handleConnectionChange);

    // Iniciar monitoreo si está habilitado
    if (autoStart) {
      connectionMonitor.startMonitoring();
    }

    setIsLoading(false);

    // Cleanup
    return () => {
      removeListener();
      if (autoStart) {
        connectionMonitor.stopMonitoring();
      }
    };
  }, [autoStart, handleConnectionChange]);

  // Funciones de control
  const forceCheck = useCallback(async () => {
    setIsLoading(true);
    await connectionMonitor.forceCheck();
  }, []);

  const forceApiUrl = useCallback((url) => {
    connectionMonitor.forceApiUrl(url);
  }, []);

  const startMonitoring = useCallback(() => {
    connectionMonitor.startMonitoring();
  }, []);

  const stopMonitoring = useCallback(() => {
    connectionMonitor.stopMonitoring();
  }, []);

  const getStats = useCallback(() => {
    return connectionMonitor.getStats();
  }, []);

  return {
    // Estado
    connectionInfo,
    isLoading,
    lastUpdate,
    
    // Estado derivado
    isConnected: connectionInfo?.currentUrl ? true : false,
    isPrimary: connectionInfo?.isPrimary || false,
    isFallback: connectionInfo?.isFallback || false,
    currentUrl: connectionInfo?.currentUrl || null,
    
    // Funciones de control
    forceCheck,
    forceApiUrl,
    startMonitoring,
    stopMonitoring,
    getStats,
    
    // Funciones de conveniencia
    switchToPrimary: () => forceApiUrl('primary'),
    switchToFallback: () => forceApiUrl('fallback'),
  };
};

export default useConnectionMonitor;
