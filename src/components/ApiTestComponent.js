import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../config/colors';
import ApiService from '../services/ApiService';

const ApiTestComponent = () => {
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const testApiConnection = async () => {
    setLoading(true);
    try {
      console.log('Iniciando prueba de API...');
      const data = await ApiService.getDispositivosForUser(1);
      
      setTestResult({
        success: true,
        data: data,
        timestamp: new Date().toLocaleString('es-ES'),
        deviceCount: Array.isArray(data) ? data.length : 0,
        devices: Array.isArray(data) ? data : []
      });
      
      console.log('Prueba de API exitosa:', data);
      
    } catch (error) {
      console.error('Error en prueba de API:', error);
      setTestResult({
        success: false,
        error: error.message,
        timestamp: new Date().toLocaleString('es-ES')
      });
    } finally {
      setLoading(false);
    }
  };

  const renderDeviceInfo = (device, index) => (
    <View key={device.id || index} style={styles.deviceCard}>
      <View style={styles.deviceHeader}>
        <Text style={styles.deviceName}>{device.name}</Text>
        <Text style={styles.deviceId}>ID: {device.id}</Text>
      </View>
      
      <Text style={styles.deviceDescription}>{device.description}</Text>
      
      <View style={styles.deviceDetails}>
        <Text style={styles.deviceMac}>
          MAC: {device.macAddress ? device.macAddress.trim() : 'N/A'}
        </Text>
        <Text style={styles.deviceUser}>Usuario: {device.idusuario}</Text>
        <Text style={[
          styles.deviceStatus,
          { color: device.estado === 'True' ? '#4CAF50' : device.estado === 'False' ? '#F44336' : '#666' }
        ]}>
          Estado: {device.estado || 'N/A'}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
      >
        <View style={styles.headerContent}>
          <Ionicons 
            name="wifi-outline" 
            size={20} 
            color="#666" 
            style={styles.headerIcon}
          />
          <Text style={styles.headerTitle}>Prueba de Conectividad API</Text>
        </View>
        <Ionicons 
          name={expanded ? "chevron-up" : "chevron-down"} 
          size={20} 
          color="#666" 
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.content}>
          <TouchableOpacity
            style={[styles.testButton, loading && styles.testButtonDisabled]}
            onPress={testApiConnection}
            disabled={loading}
          >
            <Ionicons 
              name={loading ? "refresh" : "play-circle-outline"} 
              size={16} 
              color="#fff" 
              style={[styles.buttonIcon, loading && styles.rotating]}
            />
            <Text style={styles.testButtonText}>
              {loading ? 'Probando...' : 'Probar Conexión'}
            </Text>
          </TouchableOpacity>

          {testResult && (
            <View style={styles.resultContainer}>
              <View style={styles.resultHeader}>
                <Ionicons 
                  name={testResult.success ? "checkmark-circle" : "close-circle"} 
                  size={16} 
                  color={testResult.success ? "#4CAF50" : "#F44336"} 
                />
                <Text style={[
                  styles.resultStatus,
                  { color: testResult.success ? "#4CAF50" : "#F44336" }
                ]}>
                  {testResult.success ? 'Conexión Exitosa' : 'Error de Conexión'}
                </Text>
              </View>
              
              <Text style={styles.resultTime}>
                Prueba realizada: {testResult.timestamp}
              </Text>

              {testResult.success ? (
                <View style={styles.successDetails}>
                  <Text style={styles.deviceCountText}>
                    Dispositivos encontrados: {testResult.deviceCount}
                  </Text>
                  
                  <ScrollView 
                    style={styles.devicesContainer}
                    nestedScrollEnabled={true}
                  >
                    {testResult.devices.map((device, index) => 
                      renderDeviceInfo(device, index)
                    )}
                  </ScrollView>
                </View>
              ) : (
                <View style={styles.errorDetails}>
                  <Text style={styles.errorText}>Error: {testResult.error}</Text>
                  <Text style={styles.errorHint}>
                    Verifica que el servidor esté ejecutándose en http://192.168.100.17:4201
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    padding: 16,
  },
  testButton: {
    backgroundColor: Colors.success,  // Verde para botón de prueba
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  testButtonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonIcon: {
    marginRight: 8,
  },
  rotating: {
    transform: [{ rotate: '45deg' }],
  },
  testButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  resultContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultStatus: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  resultTime: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  successDetails: {
    marginTop: 8,
  },
  deviceCountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  devicesContainer: {
    maxHeight: 200,
  },
  deviceCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  deviceName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  deviceId: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  deviceDescription: {
    fontSize: 13,
    color: '#555',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  deviceDetails: {
    gap: 4,
  },
  deviceMac: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  deviceUser: {
    fontSize: 12,
    color: '#666',
  },
  deviceStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  errorDetails: {
    marginTop: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#F44336',
    marginBottom: 8,
  },
  errorHint: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default ApiTestComponent;
