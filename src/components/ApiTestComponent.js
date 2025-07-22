import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import ApiService from '../services/ApiService';

const ApiTestComponent = () => {
  const { theme } = useTheme();
  const [testResult, setTestResult] = useState(null);
  const [ventilatorTestResult, setVentilatorTestResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ventilatorLoading, setVentilatorLoading] = useState(false);
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

  const testVentilatorControl = async (action) => {
    setVentilatorLoading(true);
    try {
      console.log(`Iniciando prueba de control de ventilador: ${action ? 'ENCENDER' : 'APAGAR'}...`);
      
      const result = await ApiService.controlVentilatorAutomatic(action, 1);
      
      setVentilatorTestResult({
        success: result.success,
        action: action ? 'ENCENDER' : 'APAGAR',
        message: result.message,
        controlledDevices: result.controlledDevices || [],
        successCount: result.successCount || 0,
        failedCount: result.failedCount || 0,
        timestamp: new Date().toLocaleString('es-ES')
      });
      
      console.log('Prueba de control de ventilador:', result);
      
    } catch (error) {
      console.error('Error en prueba de control de ventilador:', error);
      setVentilatorTestResult({
        success: false,
        error: error.message,
        action: action ? 'ENCENDER' : 'APAGAR',
        timestamp: new Date().toLocaleString('es-ES')
      });
    } finally {
      setVentilatorLoading(false);
    }
  };

  const renderDeviceInfo = (device, index) => (
    <View key={device.id || index} style={[styles.deviceCard, { backgroundColor: theme.colors.surface, borderLeftColor: device.estado === 'True' ? theme.colors.success : device.estado === 'False' ? theme.colors.error : theme.colors.border }]}> 
      <View style={styles.deviceHeader}>
        <Text style={[styles.deviceName, { color: theme.colors.text }]}>{device.name}</Text>
        <Text style={[styles.deviceId, { color: theme.colors.onSurfaceVariant, backgroundColor: theme.colors.background }]}>
          ID: {device.id}
        </Text>
      </View>
      <Text style={[styles.deviceDescription, { color: theme.colors.textTertiary }]}>{device.description}</Text>
      <View style={styles.deviceDetails}>
        <Text style={[styles.deviceMac, { color: theme.colors.onSurfaceVariant }]}>MAC: {device.macAddress ? device.macAddress.trim() : 'N/A'}</Text>
        <Text style={[styles.deviceUser, { color: theme.colors.onSurfaceVariant }]}>Usuario: {device.idusuario}</Text>
        <Text style={[styles.deviceStatus, { color: device.estado === 'True' ? theme.colors.success : device.estado === 'False' ? theme.colors.error : theme.colors.onSurfaceVariant }]}>Estado: {device.estado || 'N/A'}</Text>
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
            color={theme.colors.onSurfaceVariant} 
            style={styles.headerIcon}
          />
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Prueba de Conectividad API</Text>
        </View>
        <Ionicons 
          name={expanded ? "chevron-up" : "chevron-down"} 
          size={20} 
          color={theme.colors.onSurfaceVariant} 
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.content}>
          <TouchableOpacity
            style={[styles.testButton, { backgroundColor: loading ? theme.colors.disabled : theme.colors.primary } ]}
            onPress={testApiConnection}
            disabled={loading}
          >
            <Ionicons 
              name={loading ? "refresh" : "play-circle-outline"} 
              size={16} 
              color={theme.colors.onPrimary} 
              style={[styles.buttonIcon, loading && styles.rotating]}
            />
            <Text style={[styles.testButtonText, { color: theme.colors.onPrimary }] }>
              {loading ? 'Probando...' : 'Probar Conexión'}
            </Text>
          </TouchableOpacity>

          {/* Botones de prueba de control del ventilador */}
          <View style={styles.ventilatorTestSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Control Automático del Ventilador
            </Text>
            
            <View style={styles.ventilatorButtons}>
              <TouchableOpacity
                style={[styles.ventilatorButton, styles.onButton, { backgroundColor: ventilatorLoading ? theme.colors.disabled : theme.colors.success } ]}
                onPress={() => testVentilatorControl(true)}
                disabled={ventilatorLoading}
              >
                <Ionicons 
                  name={ventilatorLoading ? "refresh" : "power"} 
                  size={16} 
                  color={theme.colors.onSuccess} 
                  style={[styles.buttonIcon, ventilatorLoading && styles.rotating]}
                />
                <Text style={[styles.ventilatorButtonText, { color: theme.colors.onSuccess }]}>
                  {ventilatorLoading ? 'Controlando...' : 'Encender'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.ventilatorButton, styles.offButton, { backgroundColor: ventilatorLoading ? theme.colors.disabled : theme.colors.error } ]}
                onPress={() => testVentilatorControl(false)}
                disabled={ventilatorLoading}
              >
                <Ionicons 
                  name={ventilatorLoading ? "refresh" : "power-off"} 
                  size={16} 
                  color={theme.colors.onError} 
                  style={[styles.buttonIcon, ventilatorLoading && styles.rotating]}
                />
                <Text style={[styles.ventilatorButtonText, { color: theme.colors.onError }]}>
                  {ventilatorLoading ? 'Controlando...' : 'Apagar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {testResult && (
            <View style={styles.resultContainer}>
            <View style={styles.resultHeader}>
              <Ionicons 
                name={testResult.success ? "checkmark-circle" : "close-circle"} 
                size={16} 
                color={testResult.success ? theme.colors.success : theme.colors.error} 
              />
              <Text style={[styles.resultStatus, { color: testResult.success ? theme.colors.success : theme.colors.error }]}>
                {testResult.success ? 'Conexión Exitosa' : 'Error de Conexión'}
              </Text>
            </View>
              
              <Text style={[styles.resultTime, { color: theme.colors.onSurfaceVariant }] }>
                Prueba realizada: {testResult.timestamp}
              </Text>

              {testResult.success ? (
                <View style={styles.successDetails}>
                  <Text style={[styles.deviceCountText, { color: theme.colors.text }] }>
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
                  <Text style={[styles.errorText, { color: theme.colors.error }]}>Error: {testResult.error}</Text>
                  <Text style={[styles.errorHint, { color: theme.colors.onSurfaceVariant }] }>
                    Verifica que el servidor esté ejecutándose en http://192.168.100.17:4201
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Resultado del test del ventilador */}
          {ventilatorTestResult && (
            <View style={[styles.resultContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
              <View style={styles.resultHeader}>
                <Ionicons 
                  name={ventilatorTestResult.success ? "checkmark-circle" : "close-circle"} 
                  size={16} 
                  color={ventilatorTestResult.success ? theme.colors.success : theme.colors.error} 
                />
                <Text style={[styles.resultStatus, { color: ventilatorTestResult.success ? theme.colors.success : theme.colors.error }]}>
                  {ventilatorTestResult.success ? 
                    `Ventilador ${ventilatorTestResult.action} Exitosamente` : 
                    `Error al ${ventilatorTestResult.action} Ventilador`}
                </Text>
              </View>
                
              <Text style={[styles.resultTime, { color: theme.colors.onSurfaceVariant }] }>
                Prueba realizada: {ventilatorTestResult.timestamp}
              </Text>

              {ventilatorTestResult.success ? (
                <View style={styles.successDetails}>
                  <Text style={[styles.deviceCountText, { color: theme.colors.text }] }>
                    Dispositivos controlados: {ventilatorTestResult.successCount}
                  </Text>
                  
                  {ventilatorTestResult.controlledDevices.length > 0 && (
                    <ScrollView 
                      style={styles.devicesContainer}
                      nestedScrollEnabled={true}
                    >
                      {ventilatorTestResult.controlledDevices.map((device, index) => (
                        <View key={index} style={[styles.deviceCard, { 
                          backgroundColor: theme.colors.surface, 
                          borderLeftColor: device.success ? theme.colors.success : theme.colors.error 
                        }]}> 
                          <View style={styles.deviceHeader}>
                            <Text style={[styles.deviceName, { color: theme.colors.text }]}>
                              {device.deviceName}
                            </Text>
                            <Text style={[styles.deviceId, { color: theme.colors.onSurfaceVariant, backgroundColor: theme.colors.background }]}>
                              {device.success ? 'OK' : 'Error'}
                            </Text>
                          </View>
                          <Text style={[styles.deviceDescription, { color: theme.colors.textTertiary }]}>
                            MAC: {device.macAddress}
                          </Text>
                          {device.error && (
                            <Text style={[styles.errorText, { color: theme.colors.error }]}>
                              {device.error}
                            </Text>
                          )}
                        </View>
                      ))}
                    </ScrollView>
                  )}
                </View>
              ) : (
                <View style={styles.errorDetails}>
                  <Text style={[styles.errorText, { color: theme.colors.error }]}>
                    Error: {ventilatorTestResult.error}
                  </Text>
                  <Text style={[styles.errorHint, { color: theme.colors.onSurfaceVariant }] }>
                    Verifica que los dispositivos estén configurados y el token sea válido
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
  },
  content: {
    padding: 16,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  buttonIcon: {
    marginRight: 8,
  },
  rotating: {
    transform: [{ rotate: '45deg' }],
  },
  testButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  resultContainer: {
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
    marginBottom: 12,
  },
  successDetails: {
    marginTop: 8,
  },
  deviceCountText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  devicesContainer: {
    maxHeight: 200,
  },
  deviceCard: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
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
    flex: 1,
  },
  deviceId: {
    fontSize: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  deviceDescription: {
    fontSize: 13,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  deviceDetails: {
    gap: 4,
  },
  deviceMac: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  deviceUser: {
    fontSize: 12,
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
    marginBottom: 8,
  },
  errorHint: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  // Estilos para la sección de control del ventilador
  ventilatorTestSection: {
    marginTop: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  ventilatorButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  ventilatorButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  ventilatorButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  onButton: {
    // Estilos específicos para el botón de encender si es necesario
  },
  offButton: {
    // Estilos específicos para el botón de apagar si es necesario
  },
});

export default ApiTestComponent;
