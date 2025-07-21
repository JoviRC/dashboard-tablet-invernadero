import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const RealTimeStatus = ({ sensors, activeSensorIds, apiConnected, lastUpdate }) => {
  const getConnectionStatusIcon = () => {
    if (apiConnected) {
      return <Ionicons name="wifi" size={16} color="#4CAF50" />;
    } else {
      return <Ionicons name="wifi-off" size={16} color="#F44336" />;
    }
  };

  const getDataFreshnessColor = () => {
    if (!lastUpdate) return '#999';
    
    const timeDiff = (new Date() - lastUpdate) / 1000; // segundos
    if (timeDiff < 60) return '#4CAF50'; // Menos de 1 minuto - verde
    if (timeDiff < 300) return '#FF9800'; // Menos de 5 minutos - naranja
    return '#F44336'; // Más de 5 minutos - rojo
  };

  const getTimeSinceUpdate = () => {
    if (!lastUpdate) return 'N/A';
    
    const timeDiff = (new Date() - lastUpdate) / 1000;
    if (timeDiff < 60) return `${Math.floor(timeDiff)}s`;
    if (timeDiff < 3600) return `${Math.floor(timeDiff / 60)}m`;
    return `${Math.floor(timeDiff / 3600)}h`;
  };

  const hasRealSensorData = activeSensorIds.length > 0 && apiConnected;

  return (
    <View style={styles.container}>
      <View style={styles.statusRow}>
        <View style={styles.statusItem}>
          {getConnectionStatusIcon()}
          <Text style={styles.statusText}>
            {apiConnected ? 'Conectado' : 'Desconectado'}
          </Text>
        </View>
        
        <View style={styles.statusItem}>
          <Ionicons name="hardware-chip" size={16} color={hasRealSensorData ? '#4CAF50' : '#999'} />
          <Text style={[styles.statusText, { color: hasRealSensorData ? '#4CAF50' : '#999' }]}>
            {activeSensorIds.length} sensor(es)
          </Text>
        </View>
        
        <View style={styles.statusItem}>
          <Ionicons name="time" size={16} color={getDataFreshnessColor()} />
          <Text style={[styles.statusText, { color: getDataFreshnessColor() }]}>
            {getTimeSinceUpdate()}
          </Text>
        </View>
      </View>
      
      {!hasRealSensorData && activeSensorIds.length === 0 && (
        <View style={styles.noSensorsWarning}>
          <Ionicons name="warning" size={16} color="#FF9800" />
          <Text style={styles.warningText}>
            No hay sensores configurados. Configure sensores en la sección "Gestión de Sensores".
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    margin: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 12,
    marginLeft: 4,
    color: '#666',
    fontWeight: '500',
  },
  sensorValues: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  valuesTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  valuesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  sensorValueCard: {
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 6,
    marginBottom: 6,
    width: '48%',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  sensorLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666',
    marginBottom: 2,
  },
  sensorValue: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  idealRange: {
    fontSize: 9,
    color: '#999',
  },
  noSensorsWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  warningText: {
    fontSize: 11,
    color: '#856404',
    marginLeft: 6,
    flex: 1,
  },
  valueItem: {
    fontSize: 11,
    color: '#666',
    backgroundColor: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
});

export default RealTimeStatus;
