import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../contexts/ThemeContext';

const SensorManager = ({ activeSensorIds, onSensorIdsChange, availableSensorIds = [] }) => {
  const [newSensorId, setNewSensorId] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const theme = useThemeColors();
  const styles = getStyles(theme);

  const addSensor = () => {
    const sensorId = parseInt(newSensorId.trim());
    
    if (!sensorId || isNaN(sensorId)) {
      Alert.alert('Error', 'Por favor ingresa un ID de sensor válido');
      return;
    }
    
    if (activeSensorIds.includes(sensorId)) {
      Alert.alert('Error', 'Este sensor ya está en la lista');
      return;
    }
    
    onSensorIdsChange([...activeSensorIds, sensorId]);
    setNewSensorId('');
  };

  const addAvailableSensor = (sensorId) => {
    if (activeSensorIds.includes(sensorId)) {
      Alert.alert('Error', 'Este sensor ya está activo');
      return;
    }
    
    onSensorIdsChange([...activeSensorIds, sensorId]);
  };

  const removeSensor = (sensorId) => {
    if (activeSensorIds.length <= 1) {
      Alert.alert('Error', 'Debe haber al menos un sensor activo');
      return;
    }
    
    Alert.alert(
      'Confirmar',
      `¿Eliminar el sensor ${sensorId}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: () => onSensorIdsChange(activeSensorIds.filter(id => id !== sensorId))
        }
      ]
    );
  };

  if (!isExpanded) {
    return (
      <View style={styles.container}>
        <TouchableOpacity 
          style={styles.toggleButton}
          onPress={() => setIsExpanded(true)}
        >
          <Ionicons name="settings-outline" size={20} color={theme.textSecondary} />
          <Text style={styles.toggleText}>Gestionar Sensores</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gestión de Sensores</Text>
        <TouchableOpacity onPress={() => setIsExpanded(false)}>
          <Ionicons name="close" size={24} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.addSensorSection}>
        <TextInput
          style={styles.input}
          placeholder="ID del sensor (ej: 8875272)"
          value={newSensorId}
          onChangeText={setNewSensorId}
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.addButton} onPress={addSensor}>
          <Ionicons name="add" size={20} color="white" />
          <Text style={styles.addButtonText}>Agregar</Text>
        </TouchableOpacity>
      </View>
      
      {/* Sensores disponibles detectados automáticamente */}
      {availableSensorIds.length > 0 && (
        <View style={styles.availableSensorsSection}>
          <Text style={styles.subtitle}>Sensores Detectados Automáticamente:</Text>
          <View style={styles.availableSensorsList}>
            {availableSensorIds
              .filter(id => !activeSensorIds.includes(id))
              .map(sensorId => (
                <TouchableOpacity 
                  key={sensorId} 
                  style={styles.availableSensorItem}
                  onPress={() => addAvailableSensor(sensorId)}
                >
                  <Text style={styles.availableSensorText}>ID: {sensorId}</Text>
                  <Ionicons name="add-circle-outline" size={20} color={theme.success} />
                </TouchableOpacity>
              ))}
          </View>
          {availableSensorIds.filter(id => !activeSensorIds.includes(id)).length === 0 && (
            <Text style={styles.noAvailableText}>Todos los sensores detectados están activos</Text>
          )}
        </View>
      )}
      
      <View style={styles.sensorsList}>
        <Text style={styles.subtitle}>Sensores Activos:</Text>
        {activeSensorIds.length === 0 ? (
          <Text style={styles.noSensorsText}>No hay sensores activos configurados</Text>
        ) : (
          activeSensorIds.map(sensorId => (
            <View key={sensorId} style={styles.sensorItem}>
              <Text style={styles.sensorId}>ID: {sensorId}</Text>
              <TouchableOpacity 
                style={styles.removeButton}
                onPress={() => removeSensor(sensorId)}
              >
                <Ionicons name="trash-outline" size={16} color={theme.error} />
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    </View>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: {
    backgroundColor: theme.surface,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
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
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
  },
  addSensorSection: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    fontSize: 16,
    backgroundColor: theme.surface,
    color: theme.text,
  },
  addButton: {
    backgroundColor: theme.success,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  sensorsList: {
    marginTop: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 8,
  },
  sensorItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: theme.backgroundSecondary,
    borderRadius: 8,
    marginBottom: 4,
  },
  sensorId: {
    fontSize: 14,
    color: theme.text,
  },
  removeButton: {
    padding: 4,
  },
  availableSensorsSection: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: theme.backgroundSecondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.success,
  },
  availableSensorsList: {
    marginTop: 8,
  },
  availableSensorItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: theme.surface,
    borderRadius: 6,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: theme.success,
  },
  availableSensorText: {
    fontSize: 14,
    color: theme.text,
    fontWeight: '500',
  },
  noAvailableText: {
    fontSize: 12,
    color: theme.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  noSensorsText: {
    fontSize: 14,
    color: theme.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 16,
  },
});

export default SensorManager;
