import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../contexts/ThemeContext';

const DeviceInfoPanel = ({ devices, sensors }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const theme = useThemeColors();
  const styles = getStyles(theme);

  // Filtrar dispositivos que tienen información real
  const realDevices = Object.entries(devices).filter(([key, device]) => device.realDevice);
  const mockDevices = Object.entries(devices).filter(([key, device]) => !device.realDevice);
  
  // Contar sensores reales (que tienen datos actuales)
  const realSensorsCount = sensors ? Object.values(sensors).filter(sensor => sensor.isReal).length : 0;
  const totalSensorsCount = sensors ? Object.keys(sensors).length : 0;

  if (!isExpanded) {
    return (
      <View style={styles.container}>
        <TouchableOpacity 
          style={styles.toggleButton}
          onPress={() => setIsExpanded(true)}
        >
          <Ionicons name="information-circle-outline" size={20} color={theme.textSecondary} />
          <Text style={styles.toggleText}>
            Información Completa ({realDevices.length} dispositivos reales, {realSensorsCount} sensores reales)
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Información Completa de Dispositivos y Sensores</Text>
        <TouchableOpacity onPress={() => setIsExpanded(false)}>
          <Ionicons name="close" size={24} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Información de Sensores */}
        {sensors && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="analytics" size={16} color={theme.success} /> Sensores Activos
            </Text>
            {Object.entries(sensors).map(([key, sensor]) => (
              <View key={key} style={styles.sensorItem}>
                <View style={styles.sensorHeader}>
                  <Text style={styles.sensorName}>{sensor.name || key}</Text>
                  <View style={[styles.statusBadge, { 
                    backgroundColor: sensor.isReal ? theme.success : theme.inactive
                  }]}>
                    <Text style={styles.statusText}>
                      {sensor.isReal ? 'REAL' : 'SIMULADO'}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.sensorDetails}>
                  <Text style={styles.detailText}>
                    <Text style={styles.detailLabel}>Valor actual:</Text> {sensor.current} {sensor.unit}
                  </Text>
                  {sensor.ideal && (
                    <Text style={styles.detailText}>
                      <Text style={styles.detailLabel}>Rango ideal:</Text> {sensor.ideal.min} - {sensor.ideal.max} {sensor.unit}
                    </Text>
                  )}
                  {sensor.sensorId && (
                    <Text style={styles.detailText}>
                      <Text style={styles.detailLabel}>ID del sensor:</Text> {sensor.sensorId}
                    </Text>
                  )}
                  {sensor.lastUpdate && (
                    <Text style={styles.detailText}>
                      <Text style={styles.detailLabel}>Última lectura:</Text> {new Date(sensor.lastUpdate).toLocaleString('es-ES')}
                    </Text>
                  )}
                  {sensor.history && sensor.history.length > 0 && (
                    <Text style={styles.detailText}>
                      <Text style={styles.detailLabel}>Historial:</Text> {sensor.history.slice(-3).join(', ')} {sensor.unit}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Dispositivos Reales */}
        {realDevices.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="hardware-chip" size={16} color={theme.success} /> Dispositivos Reales
            </Text>
            {realDevices.map(([key, device]) => (
              <View key={key} style={styles.deviceItem}>
                <View style={styles.deviceHeader}>
                  <Text style={styles.deviceName}>{device.name}</Text>
                  <View style={[styles.statusBadge, { 
                    backgroundColor: device.isActive || device.isOpen ? theme.success : theme.error
                  }]}>
                    <Text style={styles.statusText}>
                      {device.isActive || device.isOpen ? 'ACTIVO' : 'INACTIVO'}
                    </Text>
                  </View>
                </View>
                
                {device.realDevice && (
                  <View style={styles.deviceDetails}>
                    <Text style={styles.detailText}>
                      <Text style={styles.detailLabel}>ID:</Text> {device.realDevice.id}
                    </Text>
                    {device.realDevice.description && (
                      <Text style={styles.detailText}>
                        <Text style={styles.detailLabel}>Descripción:</Text> {device.realDevice.description}
                      </Text>
                    )}
                    {device.realDevice.type && (
                      <Text style={styles.detailText}>
                        <Text style={styles.detailLabel}>Tipo:</Text> {device.realDevice.type}
                      </Text>
                    )}
                    {device.realDevice.location && (
                      <Text style={styles.detailText}>
                        <Text style={styles.detailLabel}>Ubicación:</Text> {device.realDevice.location}
                      </Text>
                    )}
                    {device.realDevice.voltage && (
                      <Text style={styles.detailText}>
                        <Text style={styles.detailLabel}>Voltaje:</Text> {device.realDevice.voltage}V
                      </Text>
                    )}
                    {device.realDevice.power && (
                      <Text style={styles.detailText}>
                        <Text style={styles.detailLabel}>Potencia:</Text> {device.realDevice.power}W
                      </Text>
                    )}
                    {device.realDevice.lastUpdate && (
                      <Text style={styles.detailText}>
                        <Text style={styles.detailLabel}>Última actualización:</Text> {new Date(device.realDevice.lastUpdate).toLocaleString('es-ES')}
                      </Text>
                    )}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Dispositivos Simulados */}
        {mockDevices.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.warning }]}>
              <Ionicons name="construct" size={16} color={theme.warning} /> Dispositivos Simulados
            </Text>
            {mockDevices.map(([key, device]) => (
              <View key={key} style={[styles.deviceItem, { borderLeftColor: theme.warning }]}>
                <View style={styles.deviceHeader}>
                  <Text style={styles.deviceName}>{device.name}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: theme.warning }]}>
                    <Text style={styles.statusText}>SIMULADO</Text>
                  </View>
                </View>
                <Text style={styles.simulatedText}>
                  Este dispositivo no está conectado al sistema real. Los controles son simulados.
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: {
    backgroundColor: theme.surface,
    margin: 16,
    borderRadius: 12,
    elevation: 2,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  toggleText: {
    marginLeft: 8,
    fontSize: 16,
    color: theme.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
  },
  content: {
    maxHeight: 400,
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.success,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceItem: {
    borderLeftWidth: 4,
    borderLeftColor: theme.success,
    paddingLeft: 12,
    paddingVertical: 8,
    marginBottom: 12,
    backgroundColor: theme.backgroundSecondary,
    borderRadius: 8,
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  deviceDetails: {
    marginTop: 8,
  },
  detailText: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 4,
  },
  detailLabel: {
    fontWeight: '600',
    color: theme.text,
  },
  simulatedText: {
    fontSize: 14,
    color: theme.warning,
    fontStyle: 'italic',
  },
  sensorItem: {
    backgroundColor: theme.backgroundSecondary,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: theme.success,
  },
  sensorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sensorName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    flex: 1,
  },
  sensorDetails: {
    marginTop: 4,
  },
});

export default DeviceInfoPanel;
