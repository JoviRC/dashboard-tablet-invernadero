import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Dimensions,
  ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import ApiService from '../services/ApiService';
import { sensorData as fallbackSensorData } from '../data/mockData';

const { width } = Dimensions.get('window');

const ChartsScreen = () => {
  const [selectedSensor, setSelectedSensor] = useState('temperature');
  const [sensorData, setSensorData] = useState(fallbackSensorData);
  const [loading, setLoading] = useState(true);
  const [apiConnected, setApiConnected] = useState(false);

  useEffect(() => {
    loadSensorData();
    // Actualizar cada minuto
    const interval = setInterval(loadSensorData, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadSensorData = async () => {
    try {
      const apiData = await ApiService.getDispositivosForUser(1);
      const transformedData = ApiService.transformApiDataToSensorData(apiData);
      setSensorData(transformedData);
      setApiConnected(true);
    } catch (error) {
      console.error('Error cargando datos de sensores:', error);
      setApiConnected(false);
      // Usar datos de respaldo si hay error
    } finally {
      setLoading(false);
    }
  };

  const getSensorDisplayName = (key) => {
    const names = {
      temperature: 'Temperatura Ambiente',
      airHumidity: 'Humedad del Aire',
      soilHumidity: 'Humedad del Suelo',
      soilPH: 'pH del Suelo'
    };
    return names[key] || key;
  };

  const getSensorColor = (key) => {
    const colors = {
      temperature: '#FF6B6B',
      airHumidity: '#4ECDC4',
      soilHumidity: '#45B7D1',
      soilPH: '#96CEB4'
    };
    return colors[key] || '#999';
  };

  const generateTimeLabels = () => {
    const labels = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 30 * 60000); // 30 min intervals
      labels.push(time.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }));
    }
    return labels;
  };

  const chartConfig = {
    backgroundColor: '#fff',
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    decimalPlaces: 1,
    color: (opacity = 1) => getSensorColor(selectedSensor),
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: getSensorColor(selectedSensor),
    },
  };

  const data = {
    labels: generateTimeLabels(),
    datasets: [
      {
        data: sensorData[selectedSensor]?.history || [0, 0, 0, 0, 0, 0, 0],
        color: (opacity = 1) => getSensorColor(selectedSensor),
        strokeWidth: 3,
      },
    ],
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Cargando historial de sensores...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Historial de Sensores</Text>
          <View style={styles.headerInfo}>
            <Text style={styles.headerSubtitle}>
              Datos de las últimas 3 horas
            </Text>
            <View style={[styles.connectionStatus, { 
              backgroundColor: apiConnected ? '#4CAF50' : '#F44336' 
            }]}>
              <Text style={styles.connectionText}>
                {apiConnected ? '🟢 API' : '🔴 Local'}
              </Text>
            </View>
          </View>
        </View>

        {/* Selector de sensores */}
        <View style={styles.selectorContainer}>
          <Text style={styles.selectorTitle}>Seleccionar Sensor:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.sensorButtons}>
              {Object.keys(sensorData).map((key) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.sensorButton,
                    selectedSensor === key && styles.sensorButtonActive,
                    { borderColor: getSensorColor(key) }
                  ]}
                  onPress={() => setSelectedSensor(key)}
                >
                  <Text
                    style={[
                      styles.sensorButtonText,
                      selectedSensor === key && styles.sensorButtonTextActive,
                      { color: selectedSensor === key ? '#fff' : getSensorColor(key) }
                    ]}
                  >
                    {getSensorDisplayName(key)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Información del sensor actual */}
        <View style={styles.currentValueContainer}>
          <Text style={styles.currentValueLabel}>Valor Actual</Text>
          <View style={styles.currentValueRow}>
            <Text style={[styles.currentValue, { color: getSensorColor(selectedSensor) }]}>
              {sensorData[selectedSensor]?.current || 0}
            </Text>
            <Text style={styles.currentUnit}>
              {sensorData[selectedSensor]?.unit || ''}
            </Text>
          </View>
          <Text style={styles.idealRange}>
            Rango ideal: {sensorData[selectedSensor]?.ideal?.min || 0} - {sensorData[selectedSensor]?.ideal?.max || 0} {sensorData[selectedSensor]?.unit || ''}
          </Text>
        </View>

        {/* Gráfico */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>
            Tendencia - {getSensorDisplayName(selectedSensor)}
          </Text>
          <LineChart
            data={data}
            width={width - 32}
            height={220}
            chartConfig={chartConfig}
            style={styles.chart}
            bezier
          />
        </View>

        {/* Estadísticas */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Estadísticas del Período</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Mínimo</Text>
              <Text style={[styles.statValue, { color: getSensorColor(selectedSensor) }]}>
                {Math.min(...(sensorData[selectedSensor]?.history || [0])).toFixed(1)} {sensorData[selectedSensor]?.unit || ''}
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Máximo</Text>
              <Text style={[styles.statValue, { color: getSensorColor(selectedSensor) }]}>
                {Math.max(...(sensorData[selectedSensor]?.history || [0])).toFixed(1)} {sensorData[selectedSensor]?.unit || ''}
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Promedio</Text>
              <Text style={[styles.statValue, { color: getSensorColor(selectedSensor) }]}>
                {((sensorData[selectedSensor]?.history || [0]).reduce((a, b) => a + b, 0) / (sensorData[selectedSensor]?.history?.length || 1)).toFixed(1)} {sensorData[selectedSensor]?.unit || ''}
              </Text>
            </View>
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
  headerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  connectionStatus: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  connectionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  selectorContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
  },
  selectorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  sensorButtons: {
    flexDirection: 'row',
  },
  sensorButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    marginRight: 12,
  },
  sensorButtonActive: {
    backgroundColor: '#999',
  },
  sensorButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sensorButtonTextActive: {
    color: '#fff',
  },
  currentValueContainer: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 8,
    alignItems: 'center',
  },
  currentValueLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  currentValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  currentValue: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  currentUnit: {
    fontSize: 18,
    color: '#666',
    marginLeft: 4,
  },
  idealRange: {
    fontSize: 14,
    color: '#666',
  },
  chartContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  chart: {
    borderRadius: 16,
  },
  statsContainer: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 8,
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ChartsScreen;
