import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput,
  TouchableOpacity,
  Switch,
  Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { sensorData, schedules } from '../data/mockData';

const SettingsScreen = () => {
  const [sensorRanges, setSensorRanges] = useState(
    Object.fromEntries(
      Object.entries(sensorData).map(([key, data]) => [
        key,
        { min: data.ideal.min.toString(), max: data.ideal.max.toString() }
      ])
    )
  );

  const [irrigationSchedule, setIrrigationSchedule] = useState(
    schedules.irrigation.map(item => ({
      ...item,
      time: item.time,
      duration: item.duration.toString()
    }))
  );

  const [lightingSchedule, setLightingSchedule] = useState({
    startTime: schedules.lighting.startTime,
    endTime: schedules.lighting.endTime,
    active: schedules.lighting.active
  });

  const [notifications, setNotifications] = useState({
    criticalAlerts: true,
    warningAlerts: true,
    systemUpdates: true,
    dailyReports: false
  });

  const getSensorDisplayName = (key) => {
    const names = {
      temperature: 'Temperatura Ambiente',
      airHumidity: 'Humedad del Aire', 
      soilHumidity: 'Humedad del Suelo',
      soilPH: 'pH del Suelo'
    };
    return names[key] || key;
  };

  const getSensorUnit = (key) => {
    return sensorData[key].unit;
  };

  const handleSensorRangeChange = (sensorKey, type, value) => {
    setSensorRanges(prev => ({
      ...prev,
      [sensorKey]: {
        ...prev[sensorKey],
        [type]: value
      }
    }));
  };

  const handleIrrigationChange = (index, field, value) => {
    setIrrigationSchedule(prev => 
      prev.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  const addIrrigationTime = () => {
    if (irrigationSchedule.length < 4) {
      setIrrigationSchedule(prev => [
        ...prev,
        { time: '12:00', duration: '10', active: true }
      ]);
    } else {
      Alert.alert('Límite alcanzado', 'Máximo 4 horarios de riego permitidos');
    }
  };

  const removeIrrigationTime = (index) => {
    if (irrigationSchedule.length > 1) {
      setIrrigationSchedule(prev => prev.filter((_, i) => i !== index));
    } else {
      Alert.alert('Error', 'Debe mantener al menos un horario de riego');
    }
  };

  const handleSave = () => {
    Alert.alert(
      'Configuración Guardada',
      'Los cambios han sido aplicados correctamente',
      [{ text: 'OK', style: 'default' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Configuración</Text>
          <Text style={styles.headerSubtitle}>
            Personaliza los parámetros del invernadero
          </Text>
        </View>

        {/* Rangos de Sensores */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rangos Ideales de Sensores</Text>
          {Object.entries(sensorRanges).map(([key, range]) => (
            <View key={key} style={styles.sensorRangeCard}>
              <Text style={styles.sensorName}>
                {getSensorDisplayName(key)}
              </Text>
              <View style={styles.rangeInputs}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Mínimo</Text>
                  <TextInput
                    style={styles.rangeInput}
                    value={range.min}
                    onChangeText={(value) => handleSensorRangeChange(key, 'min', value)}
                    keyboardType="numeric"
                    placeholder="Min"
                  />
                  <Text style={styles.unitText}>{getSensorUnit(key)}</Text>
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Máximo</Text>
                  <TextInput
                    style={styles.rangeInput}
                    value={range.max}
                    onChangeText={(value) => handleSensorRangeChange(key, 'max', value)}
                    keyboardType="numeric"
                    placeholder="Max"
                  />
                  <Text style={styles.unitText}>{getSensorUnit(key)}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Programación de Riego */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Horarios de Riego</Text>
            <TouchableOpacity onPress={addIrrigationTime} style={styles.addButton}>
              <Ionicons name="add" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          
          {irrigationSchedule.map((schedule, index) => (
            <View key={index} style={styles.scheduleCard}>
              <View style={styles.scheduleHeader}>
                <Text style={styles.scheduleIndex}>Riego {index + 1}</Text>
                {irrigationSchedule.length > 1 && (
                  <TouchableOpacity 
                    onPress={() => removeIrrigationTime(index)}
                    style={styles.removeButton}
                  >
                    <Ionicons name="trash-outline" size={16} color="#F44336" />
                  </TouchableOpacity>
                )}
              </View>
              
              <View style={styles.scheduleInputs}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Hora</Text>
                  <TextInput
                    style={styles.timeInput}
                    value={schedule.time}
                    onChangeText={(value) => handleIrrigationChange(index, 'time', value)}
                    placeholder="HH:MM"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Duración (min)</Text>
                  <TextInput
                    style={styles.durationInput}
                    value={schedule.duration}
                    onChangeText={(value) => handleIrrigationChange(index, 'duration', value)}
                    keyboardType="numeric"
                    placeholder="10"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Activo</Text>
                  <Switch
                    value={schedule.active}
                    onValueChange={(value) => handleIrrigationChange(index, 'active', value)}
                    trackColor={{ false: '#E0E0E0', true: '#C8E6C9' }}
                    thumbColor={schedule.active ? '#4CAF50' : '#9E9E9E'}
                  />
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Programación de Iluminación */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Horario de Iluminación</Text>
          <View style={styles.lightingCard}>
            <View style={styles.lightingInputs}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Inicio</Text>
                <TextInput
                  style={styles.timeInput}
                  value={lightingSchedule.startTime}
                  onChangeText={(value) => setLightingSchedule(prev => ({...prev, startTime: value}))}
                  placeholder="HH:MM"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Fin</Text>
                <TextInput
                  style={styles.timeInput}
                  value={lightingSchedule.endTime}
                  onChangeText={(value) => setLightingSchedule(prev => ({...prev, endTime: value}))}
                  placeholder="HH:MM"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Activo</Text>
                <Switch
                  value={lightingSchedule.active}
                  onValueChange={(value) => setLightingSchedule(prev => ({...prev, active: value}))}
                  trackColor={{ false: '#E0E0E0', true: '#C8E6C9' }}
                  thumbColor={lightingSchedule.active ? '#4CAF50' : '#9E9E9E'}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Notificaciones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notificaciones</Text>
          <View style={styles.notificationsCard}>
            {Object.entries(notifications).map(([key, value]) => {
              const labels = {
                criticalAlerts: 'Alertas Críticas',
                warningAlerts: 'Alertas de Advertencia',
                systemUpdates: 'Actualizaciones del Sistema',
                dailyReports: 'Reportes Diarios'
              };
              
              return (
                <View key={key} style={styles.notificationRow}>
                  <Text style={styles.notificationLabel}>{labels[key]}</Text>
                  <Switch
                    value={value}
                    onValueChange={(newValue) => setNotifications(prev => ({...prev, [key]: newValue}))}
                    trackColor={{ false: '#E0E0E0', true: '#C8E6C9' }}
                    thumbColor={value ? '#4CAF50' : '#9E9E9E'}
                  />
                </View>
              );
            })}
          </View>
        </View>

        {/* Botón Guardar */}
        <View style={styles.saveContainer}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Ionicons name="save-outline" size={20} color="#fff" />
            <Text style={styles.saveButtonText}>Guardar Configuración</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  section: {
    marginTop: 8,
    backgroundColor: '#fff',
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sensorRangeCard: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  sensorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  rangeInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputGroup: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  inputLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  rangeInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 8,
    textAlign: 'center',
    backgroundColor: '#fff',
    minWidth: 60,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 8,
    textAlign: 'center',
    backgroundColor: '#fff',
    minWidth: 70,
  },
  durationInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 8,
    textAlign: 'center',
    backgroundColor: '#fff',
    minWidth: 50,
  },
  unitText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  scheduleCard: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  scheduleIndex: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  removeButton: {
    padding: 4,
  },
  scheduleInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lightingCard: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
  },
  lightingInputs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  notificationsCard: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
  },
  notificationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  notificationLabel: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  saveContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default SettingsScreen;
