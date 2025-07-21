import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SensorCard from '../components/SensorCard';

const DashboardScreen = () => {
  const [sensors] = useState({
    temperature: {
      current: 24.5,
      unit: '°C',
      ideal: { min: 20, max: 26 },
      isReal: true,
      sensorId: '8875272',
      lastUpdate: new Date()
    }
  });

  const getSensorStatus = (sensor) => {
    if (!sensor.ideal || sensor.current === null) return 'unknown';
    
    if (sensor.current >= sensor.ideal.min && sensor.current <= sensor.ideal.max) {
      return 'optimal';
    } else if (sensor.current < sensor.ideal.min - 2 || sensor.current > sensor.ideal.max + 2) {
      return 'critical';
    } else {
      return 'warning';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Monitoreo de Sensores</Text>
          <View style={styles.sensorsGrid}>
            <SensorCard
              title="Temperatura Ambiente"
              value={sensors.temperature.current}
              unit={sensors.temperature.unit}
              status={getSensorStatus(sensors.temperature)}
              icon="thermometer-outline"
              ideal={sensors.temperature.ideal}
              isReal={sensors.temperature.isReal}
              sensorId={sensors.temperature.sensorId}
              lastUpdate={sensors.temperature.lastUpdate}
            />
          </View>
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
  section: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  sensorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
});

export default DashboardScreen;
