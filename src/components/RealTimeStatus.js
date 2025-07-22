import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

const RealTimeStatus = ({ sensors, activeSensorIds, apiConnected, lastUpdate }) => {
  const { theme } = useTheme();
  const getConnectionStatusIcon = () => {
    if (apiConnected) {
      return <Ionicons name="wifi" size={16} color={theme.colors.success} />;
    } else {
      return <Ionicons name="wifi-off" size={16} color={theme.colors.error} />;
    }
  };

  const getDataFreshnessColor = () => {
    if (!lastUpdate) return theme.colors.onSurfaceVariant;
    const timeDiff = (new Date() - lastUpdate) / 1000; // segundos
    if (timeDiff < 60) return theme.colors.success; // Menos de 1 minuto - verde
    if (timeDiff < 300) return theme.colors.warning; // Menos de 5 minutos - naranja
    return theme.colors.error; // Más de 5 minutos - rojo
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
    <View style={[styles.container, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }] }>
      <View style={styles.statusRow}>
        <View style={styles.statusItem}>
          {getConnectionStatusIcon()}
          <Text style={[styles.statusText, { color: theme.colors.text }] }>
            {apiConnected ? 'Conectado' : 'Desconectado'}
          </Text>
        </View>
        <View style={styles.statusItem}>
          <Ionicons name="hardware-chip" size={16} color={hasRealSensorData ? theme.colors.success : theme.colors.onSurfaceVariant} />
          <Text style={[styles.statusText, { color: hasRealSensorData ? theme.colors.success : theme.colors.onSurfaceVariant }]}>
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
        <View style={[styles.noSensorsWarning, { backgroundColor: theme.colors.warningBackground, borderColor: theme.colors.warning }] }>
          <Ionicons name="warning" size={16} color={theme.colors.warning} />
          <Text style={[styles.warningText, { color: theme.colors.warningText }] }>
            No hay sensores configurados. Configure sensores en la sección "Gestión de Sensores".
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
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
    marginBottom: 8,
  },
  valuesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  sensorValueCard: {
    padding: 8,
    borderRadius: 6,
    marginBottom: 6,
    width: '48%',
    borderWidth: 1,
  },
  sensorLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 2,
  },
  sensorValue: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  idealRange: {
    fontSize: 9,
  },
  noSensorsWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
    borderWidth: 1,
  },
  warningText: {
    fontSize: 11,
    marginLeft: 6,
    flex: 1,
  },
  valueItem: {
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
    borderWidth: 1,
  },
});

export default RealTimeStatus;
