// Componente para mostrar el estado de conexión de la API
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import useConnectionMonitor from '../hooks/useConnectionMonitor';

const ConnectionStatus = ({ 
  showControls = false, 
  compact = false,
  style = {},
  onStatusPress = null 
}) => {
  const {
    connectionInfo,
    isLoading,
    isPrimary,
    isFallback,
    currentUrl,
    forceCheck,
    switchToPrimary,
    switchToFallback,
    getStats
  } = useConnectionMonitor();

  if (!connectionInfo && !isLoading) {
    return null;
  }

  const getStatusColor = () => {
    if (isLoading) return '#FFA500'; // Naranja
    if (isPrimary) return '#4CAF50'; // Verde
    if (isFallback) return '#FF9800'; // Amarillo/Naranja
    return '#F44336'; // Rojo
  };

  const getStatusText = () => {
    if (isLoading) return 'Verificando...';
    if (isPrimary) return 'API Local';
    if (isFallback) return 'API Remota';
    return 'Sin conexión';
  };

  const getStatusIcon = () => {
    if (isLoading) return '🔄';
    if (isPrimary) return '🏠';
    if (isFallback) return '☁️';
    return '❌';
  };

  const handleStatusPress = () => {
    if (onStatusPress) {
      onStatusPress({
        connectionInfo,
        isPrimary,
        isFallback,
        currentUrl,
        stats: getStats()
      });
    }
  };

  if (compact) {
    return (
      <TouchableOpacity 
        style={[styles.compactContainer, { borderColor: getStatusColor() }, style]}
        onPress={handleStatusPress}
        disabled={!onStatusPress}
      >
        <Text style={styles.compactIcon}>{getStatusIcon()}</Text>
        <Text style={[styles.compactText, { color: getStatusColor() }]}>
          {getStatusText()}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.statusRow}>
        <View style={styles.statusInfo}>
          <Text style={styles.statusIcon}>{getStatusIcon()}</Text>
          <View style={styles.statusTextContainer}>
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {getStatusText()}
            </Text>
            {currentUrl && (
              <Text style={styles.urlText} numberOfLines={1}>
                {currentUrl.replace('http://', '').replace('https://', '')}
              </Text>
            )}
          </View>
        </View>
        
        {!isLoading && (
          <TouchableOpacity style={styles.refreshButton} onPress={forceCheck}>
            <Text style={styles.refreshIcon}>🔄</Text>
          </TouchableOpacity>
        )}
      </View>

      {showControls && !isLoading && (
        <View style={styles.controlsContainer}>
          <TouchableOpacity 
            style={[
              styles.controlButton, 
              isPrimary && styles.activeButton
            ]} 
            onPress={switchToPrimary}
            disabled={isPrimary}
          >
            <Text style={[
              styles.controlButtonText,
              isPrimary && styles.activeButtonText
            ]}>
              🏠 Local
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.controlButton, 
              isFallback && styles.activeButton
            ]} 
            onPress={switchToFallback}
            disabled={isFallback}
          >
            <Text style={[
              styles.controlButtonText,
              isFallback && styles.activeButtonText
            ]}>
              ☁️ Remota
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  compactIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  compactText: {
    fontSize: 12,
    fontWeight: '500',
  },
  urlText: {
    fontSize: 11,
    color: '#6c757d',
    marginTop: 2,
  },
  refreshButton: {
    padding: 4,
  },
  refreshIcon: {
    fontSize: 16,
  },
  controlsContainer: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  controlButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#e9ecef',
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#007bff',
  },
  controlButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#495057',
  },
  activeButtonText: {
    color: 'white',
  },
});

export default ConnectionStatus;
