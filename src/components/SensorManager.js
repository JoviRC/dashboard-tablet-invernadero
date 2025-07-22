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
import { useTheme } from '../contexts/ThemeContext';

const SensorManager = ({ activeSensorIds, onSensorIdsChange, availableSensorIds = [] }) => {
  const { theme } = useTheme();
  const [newSensorId, setNewSensorId] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

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
      <View style={[styles.container, { backgroundColor: theme.colors.surface }] }>
        <TouchableOpacity 
          style={styles.toggleButton}
          onPress={() => setIsExpanded(true)}
        >
          <Ionicons name="settings-outline" size={20} color={theme.colors.onSurfaceVariant} />
          <Text style={[styles.toggleText, { color: theme.colors.text }] }>Gestionar Sensores</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }] }>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }] }>Gestión de Sensores</Text>
        <TouchableOpacity onPress={() => setIsExpanded(false)}>
          <Ionicons name="close" size={24} color={theme.colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>
      <View style={styles.addSensorSection}>
        <TextInput
          style={[styles.input, { color: theme.colors.text, backgroundColor: theme.colors.background }] }
          placeholder="ID del sensor (ej: 8875272)"
          placeholderTextColor={theme.colors.onSurfaceVariant}
          value={newSensorId}
          onChangeText={setNewSensorId}
          keyboardType="numeric"
        />
        <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.colors.primary }]} onPress={addSensor}>
          <Ionicons name="add" size={20} color={theme.colors.onPrimary} />
          <Text style={[styles.addButtonText, { color: theme.colors.onPrimary }] }>Agregar</Text>
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
                  <Ionicons name="add-circle-outline" size={20} color="#4CAF50" />
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
                <Ionicons name="trash-outline" size={16} color="#F44336" />
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
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
    color: '#666',
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
    color: '#333',
  },
  addSensorSection: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#4CAF50',
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
    color: '#333',
    marginBottom: 8,
  },
  sensorItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 4,
  },
  sensorId: {
    fontSize: 14,
    color: '#333',
  },
  removeButton: {
    padding: 4,
  },
  availableSensorsSection: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f0f8f0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
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
    backgroundColor: 'white',
    borderRadius: 6,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  availableSensorText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  noAvailableText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  noSensorsText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 16,
  },
});

export default SensorManager;
