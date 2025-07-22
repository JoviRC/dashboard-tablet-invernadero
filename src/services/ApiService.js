// Servicio para manejar las llamadas a la API del invernadero
import CONFIG from '../config/config';
// Utilidad para almacenamiento local (web y móvil)
let storage;
try {
  storage = window.localStorage;
} catch {
  try {
    storage = require('@react-native-async-storage/async-storage').default;
  } catch {
    storage = null;
  }
}

const STORAGE_KEY = 'API_BASE_URL_SELECTED';

async function getStoredApiUrl() {
  if (!storage) return null;
  if (storage.getItem) {
    return storage.getItem(STORAGE_KEY);
  } else if (storage.getItemAsync) {
    return await storage.getItemAsync(STORAGE_KEY);
  }
  return null;
}

async function setStoredApiUrl(url) {
  if (!storage) return;
  if (storage.setItem) {
    storage.setItem(STORAGE_KEY, url);
  } else if (storage.setItemAsync) {
    await storage.setItemAsync(STORAGE_KEY, url);
  }
}

// Detecta automáticamente la IP funcional y la recuerda
async function fetchWithAutoIp(path, options = {}) {
  let apiUrl = await getStoredApiUrl();
  const urlsToTry = apiUrl ? [apiUrl, ...CONFIG.API_BASE_URLS.filter(u => u !== apiUrl)] : CONFIG.API_BASE_URLS;
  let lastError;
  for (const url of urlsToTry) {
    try {
      // Mostrar el curl equivalente en terminal
      const fullUrl = `${url}${path}`;
      let curl = `curl -X ${options?.method || 'GET'} '${fullUrl}'`;
      if (options?.headers) {
        Object.entries(options.headers).forEach(([k, v]) => {
          curl += ` -H '${k}: ${v}'`;
        });
      }
      if (options?.body) {
        curl += ` -d '${typeof options.body === 'string' ? options.body : JSON.stringify(options.body)}'`;
      }
      console.log(`🌀 [CURL] ${curl}`);
      const response = await fetch(fullUrl, options);
      if (response.ok) {
        await setStoredApiUrl(url);
        return response;
      }
      lastError = new Error(`Error HTTP: ${response.status} (${url})`);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error('No se pudo conectar a ninguna API');
}
import { sensorData as fallbackSensorData, deviceStates as fallbackDeviceStates } from '../data/mockData';

const API_BASE_URLS = CONFIG.API_BASE_URLS;

// Helper para intentar fetch en múltiples URLs (redirige a lógica de IP automática)
async function fetchWithFallback(path, options = {}) {
  // Redirigir a la lógica principal de selección de IP
  return await fetchWithAutoIp(path, options);
}
const apiService = {
  // Obtener dispositivos del usuario
  async getDispositivosForUser(userId = 1) {
    try {
      const response = await fetchWithAutoIp(`/ControllerDHT11/GetDispositivosForUser?user=${userId}`, {
        method: 'GET',
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      console.log('Datos recibidos de la API:', data);
      // Guardar la lista de dispositivos para búsquedas posteriores
      apiService._lastDevicesList = Array.isArray(data) ? data : [];
      return data;
    } catch (error) {
      console.error('Error al obtener dispositivos:', error);
      throw error;
    }
  },

  // Obtener datos específicos de un sensor por ID
  async getSensorData(sensorId, segundos = 1) {
    try {
      // Si sensorId es un objeto, usar macAddress
      let macAddress = null;
      if (typeof sensorId === 'object' && sensorId.macAddress) {
        macAddress = sensorId.macAddress;
      } else if (typeof sensorId === 'string' && sensorId.length > 0) {
        macAddress = sensorId;
      } else if (typeof sensorId === 'number') {
        // Buscar el objeto sensor en la lista global de dispositivos y extraer el macAddress
        if (this._lastDevicesList && Array.isArray(this._lastDevicesList)) {
          const found = this._lastDevicesList.find(dev => dev.id === sensorId || dev.idSensor === sensorId);
          if (found && found.macAddress) {
            macAddress = found.macAddress;
          }
        }
        if (!macAddress) {
          console.warn(`No se encontró macAddress para el id numérico ${sensorId}. No se realiza petición.`);
          return null;
        }
      }
      if (macAddress) macAddress = String(macAddress).trim();
      else {
        console.warn(`No se pudo determinar macAddress para sensorId:`, sensorId);
        return null;
      }
      // El endpoint requiere idSensor=<macAddress>
      const response = await fetchWithAutoIp(`/ControllerDHT11/GetTemperaturaSegundos?segundos=${segundos}&idSensor=${macAddress}`, {
        method: 'GET',
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json',
        },
      });
      // Verificar si la respuesta está vacía o no es JSON
      const text = await response.text();
      if (!text || text.trim() === '') {
        console.warn(`Respuesta vacía al obtener datos del sensor ${macAddress}. Usando datos de respaldo.`);
        return null;
      }
      let data;
      try {
        data = JSON.parse(text);
      } catch (jsonError) {
        console.error(`Respuesta inválida (no JSON) para sensor ${macAddress}:`, text);
        return null;
      }
      console.log(`Datos del sensor ${macAddress}:`, data);
      return data;
    } catch (error) {
      console.error(`Error al obtener datos del sensor ${sensorId}:`, error);
      throw error;
    }
  },

  // Extraer IDs de sensores desde la respuesta de GetDispositivosForUser
  extractSensorIds: (apiData) => {
    if (!Array.isArray(apiData) || apiData.length === 0) {
      console.log('No hay datos de dispositivos para extraer sensores');
      return [];
    }

    const sensorMacs = [];
    apiData.forEach(device => {
      const deviceName = (device.nombre || device.name || '').toLowerCase();
      if (deviceName.includes('sensor')) {
        // Usar el macAddress como identificador para los requests
        let macAddress = device.macAddress || device.macaddress || device.mac || null;
        if (macAddress) macAddress = macAddress.trim();
        if (macAddress && !sensorMacs.includes(macAddress)) {
          sensorMacs.push(macAddress);
          console.log(`Sensor encontrado: macAddress ${macAddress} - Nombre: ${device.nombre || device.name || 'Sin nombre'}`);
        }
      }
    });
    console.log('macAddress de sensores extraídos:', sensorMacs);
    return sensorMacs;
  },

  // Extraer información de switches desde la respuesta de GetDispositivosForUser
  extractSwitchesInfo: (apiData) => {
    if (!Array.isArray(apiData) || apiData.length === 0) {
      console.log('No hay datos de dispositivos para extraer switches');
      return [];
    }

    const switches = [];
    
    apiData.forEach(device => {
      // Buscar dispositivos que tengan "Switch" en el nombre
      const deviceName = (device.nombre || device.name || '').toLowerCase();
      
      if (deviceName.includes('switch')) {
        const switchInfo = {
          id: device.id || device.idSwitch || device.switchId,
          name: device.nombre || device.name || 'Switch sin nombre',
          description: device.descripcion || device.description || '',
          isActive: device.estado === 1 || device.estado === true || device.isActive === true,
          type: device.tipoDispositivo || device.tipo || 'switch',
          location: device.ubicacion || device.location || '',
          // Propiedades adicionales que puedan venir
          voltage: device.voltaje || device.voltage,
          power: device.potencia || device.power,
          lastUpdate: device.fechaActualizacion || device.lastUpdate
        };
        
        switches.push(switchInfo);
        console.log(`Switch encontrado: ID ${switchInfo.id} - Nombre: ${switchInfo.name} - Estado: ${switchInfo.isActive}`);
      }
    });

    console.log('Switches extraídos:', switches);
    return switches;
  },

  // Transformar datos de dispositivos reales a formato del dashboard
  transformRealDevicesToDashboard: (apiData) => {
    const switches = apiService.extractSwitchesInfo(apiData);
    
    // Crear estructura base de dispositivos
    const deviceStates = {
      irrigation: {
        name: 'Sistema de Riego',
        isActive: false,
        isAutomatic: false,
        schedule: '06:00-18:00',
        realDevice: null
      },
      ventilation: {
        name: 'Ventilación',
        isActive: false,
        isAutomatic: true,
        speed: 75,
        realDevice: null
      },
      lighting: {
        name: 'Iluminación LED',
        isActive: false,
        isAutomatic: true,
        intensity: 80,
        realDevice: null
      },
      heating: {
        name: 'Calefacción',
        isActive: false,
        isAutomatic: false,
        targetTemperature: 22,
        realDevice: null
      },
      windows: {
        name: 'Ventanas Automatizadas',
        isOpen: false,
        isAutomatic: true,
        openPercentage: 0,
        realDevice: null
      }
    };

    // Mapear switches reales a categorías del dashboard
    switches.forEach(switchInfo => {
      const switchName = switchInfo.name.toLowerCase();
      
      // Mapear según palabras clave en el nombre
      if (switchName.includes('riego') || switchName.includes('irrigation') || switchName.includes('water')) {
        deviceStates.irrigation.name = switchInfo.name;
        deviceStates.irrigation.isActive = switchInfo.isActive;
        deviceStates.irrigation.realDevice = switchInfo;
      } else if (switchName.includes('ventil') || switchName.includes('fan') || switchName.includes('aire')) {
        deviceStates.ventilation.name = switchInfo.name;
        deviceStates.ventilation.isActive = switchInfo.isActive;
        deviceStates.ventilation.realDevice = switchInfo;
      } else if (switchName.includes('luz') || switchName.includes('led') || switchName.includes('light')) {
        deviceStates.lighting.name = switchInfo.name;
        deviceStates.lighting.isActive = switchInfo.isActive;
        deviceStates.lighting.realDevice = switchInfo;
      } else if (switchName.includes('calef') || switchName.includes('heat') || switchName.includes('temperatura')) {
        deviceStates.heating.name = switchInfo.name;
        deviceStates.heating.isActive = switchInfo.isActive;
        deviceStates.heating.realDevice = switchInfo;
      } else if (switchName.includes('ventana') || switchName.includes('window') || switchName.includes('apertura')) {
        deviceStates.windows.name = switchInfo.name;
        deviceStates.windows.isOpen = switchInfo.isActive;
        deviceStates.windows.realDevice = switchInfo;
      }
    });

    console.log('Dispositivos transformados para dashboard:', deviceStates);
    return deviceStates;
  },

  // Controlar un switch (encender/apagar)
  async controlSwitch(switchId, newState) {
    try {
      const response = await fetchWithAutoIp(`/ControllerSwitch/SetSwitch?id=${switchId}&estado=${newState ? 1 : 0}`, {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      console.log(`Switch ${switchId} controlado. Nuevo estado: ${newState}`, data);
      return data;
    } catch (error) {
      console.error(`Error al controlar switch ${switchId}:`, error);
      throw error;
    }
  },

  // Obtener datos de múltiples sensores
  async getMultipleSensorsData(sensorIds, segundos = 1) {
    try {
      // sensorIds puede ser array de objetos, usar macAddress
      const promises = sensorIds.map(sensorObj => {
        let macAddress = sensorObj;
        if (typeof sensorObj === 'object' && sensorObj.macAddress) {
          macAddress = sensorObj.macAddress;
        }
        return this.getSensorData(macAddress, segundos);
      });
      
      const results = await Promise.allSettled(promises);
      
      const successfulResults = [];
      const errors = [];
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successfulResults.push({
            sensorId: typeof sensorIds[index] === 'object' ? sensorIds[index].macAddress : sensorIds[index],
            data: result.value
          });
        } else {
          errors.push({
            sensorId: typeof sensorIds[index] === 'object' ? sensorIds[index].macAddress : sensorIds[index],
            error: result.reason
          });
        }
      });
      
      if (errors.length > 0) {
        console.warn('Errores al obtener datos de sensores:', errors);
      }
      
      // Ejecutar diagnóstico de salinidad en todos los datos obtenidos
      if (successfulResults.length > 0) {
        apiService.diagnoseSalinityValues(successfulResults);
      }
      
      return successfulResults;
    } catch (error) {
      console.error('Error al obtener datos de múltiples sensores:', error);
      throw error;
    }
  },

  // Transformar datos específicos del sensor al formato de la aplicación
  // Convertir valor analógico de humedad del suelo a porcentaje
  convertSoilHumidityToPercentage: (analogValue) => {
    // Valores típicos para sensores de humedad del suelo:
    // - Aire (seco): ~2800-3000 (0% humedad)
    // - Agua (húmedo): ~1300-1500 (100% humedad)
    // Los valores pueden variar según el sensor específico
    
    const dryValue = 2800;    // Valor cuando está completamente seco (0%)
    const wetValue = 1300;    // Valor cuando está completamente húmedo (100%)
    
    // Asegurar que el valor esté dentro del rango esperado
    const clampedValue = Math.max(wetValue, Math.min(dryValue, analogValue));
    
    // Calcular porcentaje (invertido porque menor valor = más húmedo)
    const percentage = ((dryValue - clampedValue) / (dryValue - wetValue)) * 100;
    
    // Redondear a 1 decimal
    const result = Math.round(percentage * 10) / 10;
    
    console.log(`Conversión humedad del suelo: ${analogValue} (analógico) -> ${result}% (húmedo: ${wetValue}, seco: ${dryValue})`);
    
    return result;
  },

  // Convertir valor analógico de conductividad a salinidad en ppm
  convertConductivityToSalinity: (conductivityValue, temperatureC = 25) => {
    // Valores de calibración para sensor de conductividad
    // Estos valores deben ajustarse según tu sensor específico
    const minAnalog = 0;      // Valor analógico mínimo (agua destilada)
    const maxAnalog = 1023;   // Valor analógico máximo (10-bit ADC)
    const maxEC = 3000;       // EC máxima en μS/cm (microsiemens por centímetro)
    
    // Mapear valor analógico a conductividad eléctrica (EC)
    const ecValue = (conductivityValue / maxAnalog) * maxEC;
    
    // Compensación por temperatura (EC aumenta ~2% por cada grado sobre 25°C)
    const tempCoefficient = 0.02;
    const referenceTemp = 25;
    const compensatedEC = ecValue / (1 + tempCoefficient * (temperatureC - referenceTemp));
    
    // Convertir EC a TDS (Total Dissolved Solids) en ppm
    // Factor de conversión típico para sales de suelo: 0.64
    const salinityPpm = compensatedEC * 0.64;
    
    // Redondear a 1 decimal
    const result = Math.round(salinityPpm * 10) / 10;
    
    console.log(`Conversión salinidad: ${conductivityValue} (analógico) -> ${compensatedEC.toFixed(1)} μS/cm -> ${result} ppm (Temp: ${temperatureC}°C)`);
    
    return result;
  },

  // Interpretar nivel de salinidad para alertas
  interpretSalinityLevel: (salinityPpm) => {
    if (salinityPpm <= 400) return { level: 'optimal', message: 'Nivel óptimo para cultivos' };
    if (salinityPpm <= 800) return { level: 'good', message: 'Aceptable, monitorear' };
    if (salinityPpm <= 1500) return { level: 'warning', message: 'Estrés moderado en plantas' };
    if (salinityPpm <= 2500) return { level: 'high', message: 'Estrés severo, riego necesario' };
    return { level: 'critical', message: 'Nivel crítico, plantas en peligro' };
  },

  // Calcular pH estimado basado en conductividad eléctrica (método simple)
  calculatePHFromEC: (ecMicroSiemens) => {
    // Fórmula empírica: pH disminuye con mayor conductividad
    const basePH = 7.5;
    const ecFactor = 1.2;
    
    // Convertir EC a pH estimado
    const estimatedPH = basePH - (ecMicroSiemens / 1000) * ecFactor;
    
    // Limitar a rango realista para suelos (4.5 - 8.5)
    const result = Math.max(4.5, Math.min(8.5, estimatedPH));
    
    console.log(`🧪 Cálculo pH por EC: ${ecMicroSiemens} μS/cm → pH ${result.toFixed(2)} (método simple)`);
    return Math.round(result * 10) / 10; // 1 decimal
  },

  // Calcular pH usando múltiples factores (método avanzado)
  calculatePHFromMultipleFactors: (salinityPpm, soilMoisturePercent, temperatureC = 25) => {
    let basePH = 7.0; // pH neutro base
    
    // Factor de salinidad: más sal = más ácido
    // Rango: -0.8 a +0.3
    const salinityFactor = Math.max(-0.8, Math.min(0.3, 
      (400 - salinityPpm) * 0.001
    ));
    
    // Factor de humedad: más humedad = ligeramente más básico
    // Rango: -0.2 a +0.2
    const moistureFactor = Math.max(-0.2, Math.min(0.2,
      (soilMoisturePercent - 50) * 0.003
    ));
    
    // Factor de temperatura: más calor = ligeramente más ácido
    // Rango: -0.15 a +0.15
    const tempFactor = Math.max(-0.15, Math.min(0.15,
      (25 - temperatureC) * 0.01
    ));
    
    const calculatedPH = basePH + salinityFactor + moistureFactor + tempFactor;
    
    // Rango realista para suelos agrícolas
    const result = Math.max(5.0, Math.min(8.0, calculatedPH));
    
    console.log(`🧪 Cálculo pH multi-factor:`);
    console.log(`   📊 Salinidad: ${salinityPpm} ppm → factor: ${salinityFactor.toFixed(3)}`);
    console.log(`   💧 Humedad: ${soilMoisturePercent}% → factor: ${moistureFactor.toFixed(3)}`);
    console.log(`   🌡️  Temperatura: ${temperatureC}°C → factor: ${tempFactor.toFixed(3)}`);
    console.log(`   🎯 pH final: ${result.toFixed(2)}`);
    
    return Math.round(result * 10) / 10; // 1 decimal
  },

  // Convertir salinidad (ppm) a conductividad eléctrica (μS/cm)
  convertSalinityToEC: (salinityPpm) => {
    // Factor de conversión típico: EC = TDS / 0.64
    return salinityPpm / 0.64;
  },

  // Interpretar nivel de pH para alertas
  interpretPHLevel: (phValue) => {
    if (phValue >= 6.0 && phValue <= 7.5) return { level: 'optimal', message: 'pH ideal para la mayoría de cultivos' };
    if (phValue >= 5.5 && phValue < 6.0) return { level: 'acidic', message: 'Suelo ácido, considerar cal agrícola' };
    if (phValue > 7.5 && phValue <= 8.0) return { level: 'alkaline', message: 'Suelo básico, monitor nutrientes' };
    if (phValue < 5.5) return { level: 'very_acidic', message: 'Muy ácido, tratamiento urgente' };
    if (phValue > 8.0) return { level: 'very_alkaline', message: 'Muy básico, ajuste necesario' };
    return { level: 'unknown', message: 'Valor fuera de rango normal' };
  },

  // Función de diagnóstico para analizar valores de salinidad
  diagnoseSalinityValues: (allSensorData) => {
    console.log(`\n🔬 === DIAGNÓSTICO DE SALINIDAD - ${new Date().toLocaleTimeString()} ===`);
    
    let salinityValues = [];
    allSensorData.forEach((sensor, index) => {
      if (sensor && sensor.salinidadSuelo !== undefined && sensor.salinidadSuelo !== null) {
        const rawValue = sensor.salinidadSuelo;
        const parsedValue = parseFloat(rawValue) || 0;
        
        salinityValues.push({
          sensor: sensor.idsensor || `Sensor ${index}`,
          raw: rawValue,
          parsed: parsedValue,
          type: typeof rawValue
        });
        
        console.log(`📊 Sensor ${sensor.idsensor || index}:`);
        console.log(`   🔢 Valor: ${rawValue} (${typeof rawValue})`);
        console.log(`   🧮 Parseado: ${parsedValue}`);
        
        // Análisis del tipo de valor
        if (parsedValue === 0) {
          console.log(`   ❌ Valor cero - sensor sin datos o desconectado`);
        } else if (parsedValue < 50) {
          console.log(`   ✅ Probablemente ya en ppm (agua muy pura)`);
        } else if (parsedValue < 500) {
          console.log(`   ✅ Probablemente ppm (rango normal para plantas)`);
        } else if (parsedValue < 3000) {
          console.log(`   ⚠️  Podría ser ppm alto o μS/cm (conductividad)`);
        } else {
          console.log(`   🔄 Probablemente valor analógico - necesita conversión`);
        }
      }
    });
    
    console.log(`\n📈 RESUMEN:`);
    console.log(`   🔍 Total sensores con salinidad: ${salinityValues.length}`);
    if (salinityValues.length > 0) {
      const avgValue = salinityValues.reduce((sum, s) => sum + s.parsed, 0) / salinityValues.length;
      console.log(`   📊 Valor promedio: ${avgValue.toFixed(1)}`);
      
      if (avgValue > 2000) {
        console.log(`   💡 RECOMENDACIÓN: Los valores parecen analógicos, considera usar convertConductivityToSalinity()`);
      } else if (avgValue > 500) {
        console.log(`   💡 RECOMENDACIÓN: Valores altos, verificar si son ppm o necesitan conversión`);
      } else {
        console.log(`   💡 RECOMENDACIÓN: Los valores parecen correctos en ppm`);
      }
    }
    console.log(`🔬 === FIN DIAGNÓSTICO ===\n`);
    
    return salinityValues;
  },

  transformSensorApiData: (apiData, sensorId) => {
    if (!apiData) {
      console.log(`No hay datos válidos para el sensor ${sensorId}`);
      return null;
    }

    // Mapear los datos del sensor al formato esperado
    const transformedData = {
      sensorId: apiData.idsensor || apiData.id || sensorId,
      timestamp: apiData.fecha ? new Date(apiData.fecha) : new Date(),
      temperature: {
        current: typeof apiData.temperatura === 'number' ? apiData.temperatura : parseFloat(apiData.temperatura) || null,
        unit: '°C'
      },
      airHumidity: {
        current: typeof apiData.humedad === 'number' ? apiData.humedad : parseFloat(apiData.humedad) || null,
        unit: '%'
      },
      soilHumidity: {
        current: apiData.humedadSuelo !== undefined ? apiService.convertSoilHumidityToPercentage(parseFloat(apiData.humedadSuelo)) : null,
        unit: '%'
      },
      soilSalinity: {
        current: typeof apiData.salinidadSuelo === 'number' ? apiData.salinidadSuelo : parseFloat(apiData.salinidadSuelo) || null,
        unit: 'ppm',
        rawValue: apiData.salinidadSuelo
      },
      soilPH: {
        current: null,
        unit: 'pH',
        method: 'none',
        isCalculated: false
      },
      ledStatus: {
        blue: apiData.ledAzul === "1" || apiData.ledAzul === true
      }
    };

    // Si en el futuro el endpoint retorna pH, se puede mapear aquí

    console.log(`Datos transformados del sensor ${sensorId}:`, transformedData);
    return transformedData;
  },

  // Transformar múltiples sensores al formato del dashboard
  transformMultipleSensorsToDisplay: (sensorsData) => {
    if (!Array.isArray(sensorsData) || sensorsData.length === 0) {
      console.log('No hay datos de sensores para mostrar.');
      return {};
    }

    console.log('Transformando datos de sensores para display:', sensorsData);

    // Solo mostrar datos reales obtenidos del API
    const displayData = {};

    sensorsData.forEach(({ sensorId, data }) => {
      const transformed = apiService.transformSensorApiData(data, sensorId);
      // Usar el macAddress real como clave si existe
      const key = transformed && transformed.sensorId ? transformed.sensorId : sensorId;
      if (transformed) {
        displayData[key] = transformed;
      } else {
        // Si no hay datos, retornar estructura vacía para ese sensorId, usando todos los keys de SENSOR_DEFAULTS
        const { SENSOR_DEFAULTS } = require('../config/config').CONFIG;
        const emptySensor = { sensorId: key };
        Object.entries(SENSOR_DEFAULTS).forEach(([k, defaults]) => {
          emptySensor[k] = {
            current: null,
            min: defaults.min,
            max: defaults.max,
            ideal: defaults.ideal,
            unit: defaults.unit,
            history: [],
            deviceId: null,
            macAddress: null
          };
        });
        // ledStatus puede tener estructura especial (ejemplo: blue)
        if (emptySensor.ledStatus) {
          emptySensor.ledStatus.blue = null;
        }
        displayData[key] = emptySensor;
      }
    });

    // Si no hay datos transformados, retornar objeto vacío para evitar errores en el render
    if (Object.keys(displayData).length === 0) {
      console.log('No hay datos transformados para mostrar. Retornando objeto vacío.');
      return {};
    }

    console.log('Datos finales para display:', displayData);
    return displayData;
  },

  // Transformar datos de la API al formato esperado por la aplicación
  transformApiDataToSensorData: (apiData) => {
    if (!Array.isArray(apiData) || apiData.length === 0) {
      console.log('No hay datos de API válidos, usando datos de respaldo');
      return fallbackSensorData;
    }

    // Crear objeto de sensores basado en los datos de la API
    const sensorData = { ...fallbackSensorData };
    
    console.log('Transformando datos de API a sensores...');

    apiData.forEach(device => {
      console.log('Procesando dispositivo:', device);
      
      // Limpiar nombre y descripción para comparación
      const name = device.name ? device.name.toLowerCase().trim() : '';
      const description = device.description ? device.description.toLowerCase().trim() : '';
      
      // Sensor de clima (DHT11) - temperatura y humedad del aire
      if (name.includes('sensor clima') || name.includes('dht11') || description.includes('dht11') || description.includes('sensor clima')) {
        console.log('Encontrado sensor de clima DHT11');
        
        // Para sensores de clima, simular valores realistas basados en el dispositivo
        // (hasta que tengamos endpoints que devuelvan los valores reales)
        const baseTemp = 22 + (device.id % 8); // Temperatura base entre 22-29°C
        const baseHum = 55 + (device.id % 25);  // Humedad base entre 55-79%
        
        // Aplicar pequeñas variaciones aleatorias
        const tempVariation = (Math.random() * 6 - 3); // ±3°C
        const humVariation = (Math.random() * 20 - 10); // ±10%
        
        sensorData.temperature.current = Math.round((baseTemp + tempVariation) * 10) / 10;
        sensorData.airHumidity.current = Math.round((baseHum + humVariation) * 10) / 10;
        
        // Actualizar historial con valores simulados realistas
        sensorData.temperature.history = Array.from({length: 10}, (_, i) => 
          Math.round((baseTemp + (Math.random() * 4 - 2)) * 10) / 10
        );
        sensorData.airHumidity.history = Array.from({length: 10}, (_, i) => 
          Math.round((baseHum + (Math.random() * 15 - 7.5)) * 10) / 10
        );
        
        // Agregar información del dispositivo
        sensorData.temperature.deviceId = device.id;
        sensorData.temperature.macAddress = device.macAddress?.trim();
        sensorData.airHumidity.deviceId = device.id;
        sensorData.airHumidity.macAddress = device.macAddress?.trim();
      }
      
      // Sensores de humedad del suelo
      if (description.includes('humedad tierra') || description.includes('soil') || name.includes('suelo')) {
        console.log('Encontrado sensor de humedad del suelo');
        
        const baseSoilHum = 45 + (device.id % 20); // Base entre 45-64%
        const soilVariation = (Math.random() * 20 - 10); // ±10%
        
        sensorData.soilHumidity.current = Math.round((baseSoilHum + soilVariation) * 10) / 10;
        sensorData.soilHumidity.history = Array.from({length: 10}, (_, i) => 
          Math.round((baseSoilHum + (Math.random() * 15 - 7.5)) * 10) / 10
        );
        sensorData.soilHumidity.deviceId = device.id;
        sensorData.soilHumidity.macAddress = device.macAddress?.trim();
      }
    });

    console.log('Datos de sensores transformados:', sensorData);
    return sensorData;
  },

  // Transformar datos de la API para estados de dispositivos
  transformApiDataToDeviceStates: (apiData) => {
    if (!Array.isArray(apiData) || apiData.length === 0) {
      console.log('No hay datos de API válidos para dispositivos, usando datos de respaldo');
      return fallbackDeviceStates;
    }

    // Crear objeto de dispositivos basado en los datos de la API
    const deviceStates = { ...fallbackDeviceStates };
    
    console.log('Transformando datos de API a dispositivos...');

    apiData.forEach(device => {
      console.log('Procesando dispositivo para controles:', device);
      
      // Limpiar nombre y descripción para comparación
      const name = device.name ? device.name.toLowerCase().trim() : '';
      const description = device.description ? device.description.toLowerCase().trim() : '';
      
      // Switch/Relé para ventilador
      if (name.includes('switch') || description.includes('ventilador') || description.includes('switch ventilador')) {
        console.log('Encontrado switch de ventilador');
        
        // Interpretar el estado del switch
        const isActive = device.estado === 'True' || device.estado === true || device.estado === '1';
        
        deviceStates.ventilation = {
          ...deviceStates.ventilation,
          isActive: isActive,
          deviceId: device.id,
          macAddress: device.macAddress?.trim(),
          name: device.name || 'Ventilación',
          description: device.description || 'Control de ventilador',
          speed: isActive ? 75 : 0 // Si está activo, asumir velocidad del 75%
        };
      }
      
      // Otros dispositivos de control podrían añadirse aquí
      // Por ejemplo, si hay más switches para riego, luces, etc.
    });

    console.log('Estados de dispositivos transformados:', deviceStates);
    return deviceStates;
  },

  // Generar alertas basadas en los datos de sensores
  generateAlertsFromSensorData: (sensorData) => {
    const alerts = [];
    let alertId = 1;

    const sensorNames = {
      temperature: 'Temperatura',
      airHumidity: 'Humedad del aire',
      soilHumidity: 'Humedad del suelo',
      soilPH: 'pH del suelo',
      soilSalinity: 'Salinidad del suelo'
    };

    Object.entries(sensorData).forEach(([key, sensor]) => {
      if (sensor.current < sensor.ideal.min || sensor.current > sensor.ideal.max) {
        let alertType = 'warning';
        let title = '';
        let message = '';
        
        if (sensor.current < sensor.ideal.min * 0.8 || sensor.current > sensor.ideal.max * 1.2) {
          alertType = 'critical';
          title = 'Alerta Crítica';
        } else {
          title = 'Advertencia';
        }
        
        if (sensor.current < sensor.ideal.min) {
          message = `${sensorNames[key]} muy baja: ${sensor.current}${sensor.unit} (ideal: ${sensor.ideal.min}-${sensor.ideal.max}${sensor.unit})`;
        } else {
          message = `${sensorNames[key]} muy alta: ${sensor.current}${sensor.unit} (ideal: ${sensor.ideal.min}-${sensor.ideal.max}${sensor.unit})`;
        }

        alerts.push({
          id: alertId++,
          type: alertType,
          title: title,
          message: message,
          timestamp: new Date().toLocaleString('es-ES'),
          isActive: true,
          sensorKey: key,
          deviceId: sensor.deviceId,
          macAddress: sensor.macAddress
        });
      }
    });

    console.log('Alertas generadas:', alerts);
    return alerts;
  },

  // Obtener información actual de la API
  getCurrentApiInfo() {
    return {
      isConnected: this.isConnected,
      lastUpdate: this.lastUpdate,
      currentMode: this.usingFallback ? 'fallback' : 'api',
      baseUrl: this.API_BASE_URL,
      endpoints: {
        devices: `${this.API_BASE_URL}/api/device`,
        sensors: `${this.API_BASE_URL}/api/sensor`,
        switches: `${this.API_BASE_URL}/api/switch`
      },
      status: this.isConnected ? 'online' : 'offline',
      connectionAttempts: this.connectionAttempts || 0,
      lastError: this.lastError || null
    };
  }
};

export default apiService;
