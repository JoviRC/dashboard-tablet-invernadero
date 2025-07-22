// Servicio para manejar las llamadas a la API del invernadero
import CONFIG from '../config/config';
import { sensorData as fallbackSensorData, deviceStates as fallbackDeviceStates } from '../data/mockData';

const API_BASE_URL = CONFIG.API_BASE_URL;

const apiService = {
  // Obtener dispositivos del usuario
  async getDispositivosForUser(userId = 1) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/ControllerDHT11/GetDispositivosForUser?user=${userId}`,
        {
          method: 'GET',
          headers: {
            'accept': '*/*',
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log('Datos recibidos de la API:', data);
      return data;
    } catch (error) {
      console.error('Error al obtener dispositivos:', error);
      throw error;
    }
  },

  // Obtener datos específicos de un sensor por ID
  async getSensorData(sensorId, segundos = 1) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/ControllerDHT11/GetTemperaturaSegundos?segundos=${segundos}&idSensor=${sensorId}`,
        {
          method: 'GET',
          headers: {
            'accept': '*/*',
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log(`Datos del sensor ${sensorId}:`, data);
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

    const sensorIds = [];
    
    apiData.forEach(device => {
      // Buscar dispositivos que tengan "Sensor" en el nombre
      const deviceName = (device.nombre || device.name || '').toLowerCase();
      
      if (deviceName.includes('sensor')) {
        let sensorId = null;
        
        // Verificar propiedades comunes donde puede estar el ID del sensor
        if (device.idSensor || device.idsensor || device.sensorId) {
          sensorId = device.idSensor || device.idsensor || device.sensorId;
        } else if (device.id) {
          sensorId = device.id;
        } else if (device.codigo && !isNaN(parseInt(device.codigo))) {
          sensorId = parseInt(device.codigo);
        }
        
        // Agregar el sensor ID si es válido y no está duplicado
        if (sensorId && !isNaN(parseInt(sensorId)) && !sensorIds.includes(parseInt(sensorId))) {
          sensorIds.push(parseInt(sensorId));
          console.log(`Sensor encontrado: ID ${sensorId} - Nombre: ${device.nombre || device.name || 'Sin nombre'}`);
        }
      }
    });

    console.log('IDs de sensores extraídos:', sensorIds);
    return sensorIds;
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
      // Aquí necesitarías el endpoint específico para controlar switches
      // Por ahora simulo la estructura, deberás ajustar según tu API
      const response = await fetch(
        `${API_BASE_URL}/ControllerSwitch/SetSwitch?id=${switchId}&estado=${newState ? 1 : 0}`,
        {
          method: 'POST', // o PUT según tu API
          headers: {
            'accept': '*/*',
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

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
      const promises = sensorIds.map(sensorId => 
        this.getSensorData(sensorId, segundos)
      );
      
      const results = await Promise.allSettled(promises);
      
      const successfulResults = [];
      const errors = [];
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successfulResults.push({
            sensorId: sensorIds[index],
            data: result.value
          });
        } else {
          errors.push({
            sensorId: sensorIds[index],
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
      sensorId: apiData.idsensor || sensorId,
      timestamp: new Date(apiData.fecha),
      temperature: {
        current: parseFloat(apiData.temperatura) || 0,
        unit: '°C'
      },
      airHumidity: {
        current: parseFloat(apiData.humedad) || 0,
        unit: '%'
      },
      soilHumidity: {
        current: apiService.convertSoilHumidityToPercentage(parseFloat(apiData.humedadSuelo) || 0),
        unit: '%'
      },
      soilSalinity: {
        // OPCIÓN 1: Si apiData.salinidadSuelo ya viene en ppm (valor directo del sensor)
        current: parseFloat(apiData.salinidadSuelo) || 0,
        
        // OPCIÓN 2: Si apiData.salinidadSuelo es un valor analógico que necesita conversión
        // current: ApiService.convertConductivityToSalinity(
        //   parseFloat(apiData.salinidadSuelo) || 0,
        //   parseFloat(apiData.temperatura) || 25
        // ),
        
        unit: 'ppm', // partes por millón típicamente
        
        // Logging detallado para análisis
        rawValue: apiData.salinidadSuelo, // Valor original sin procesar
        analysisInfo: (() => {
          const rawVal = parseFloat(apiData.salinidadSuelo) || 0;
          console.log(`🔬 ANÁLISIS SALINIDAD - Sensor ${sensorId}:`);
          console.log(`   📊 Valor crudo: ${apiData.salinidadSuelo} (tipo: ${typeof apiData.salinidadSuelo})`);
          console.log(`   🔢 Valor parseado: ${rawVal}`);
          console.log(`   📏 Rango estimado:`);
          if (rawVal < 10) console.log(`      → Probablemente ya en ppm (muy bajo)`);
          else if (rawVal < 100) console.log(`      → Probablemente ppm o EC convertido`);
          else if (rawVal < 1000) console.log(`      → Podría ser ppm, EC μS/cm, o analógico`);
          else console.log(`      → Probablemente valor analógico (0-1023 o 0-4095)`);
          
          return { raw: apiData.salinidadSuelo, parsed: rawVal };
        })()
      },
      // Agregar pH - directo del sensor O calculado por otros parámetros
      soilPH: (() => {
        // Si hay datos directos de pH del sensor, usarlos
        if (apiData.ph && parseFloat(apiData.ph) > 0) {
          const directPH = parseFloat(apiData.ph);
          console.log(`🧪 pH DIRECTO del sensor: ${directPH}`);
          return {
            current: directPH,
            unit: 'pH',
            method: 'sensor_directo',
            isCalculated: false
          };
        }
        
        // Si no hay sensor de pH, calcularlo usando otros parámetros
        const salinityValue = parseFloat(apiData.salinidadSuelo) || 0;
        const soilHumidityAnalog = parseFloat(apiData.humedadSuelo) || 2000;
        const temperature = parseFloat(apiData.temperatura) || 25;
        
        // Convertir humedad analógica a porcentaje
        const soilMoisturePercent = apiService.convertSoilHumidityToPercentage(soilHumidityAnalog);
        
        let calculatedPH;
        let method;
        
        if (salinityValue > 0) {
          // Método avanzado si tenemos salinidad
          calculatedPH = apiService.calculatePHFromMultipleFactors(
            salinityValue, 
            soilMoisturePercent, 
            temperature
          );
          method = 'multi_factor';
          console.log(`🧪 pH CALCULADO (multi-factor): ${calculatedPH} (sal: ${salinityValue}, hum: ${soilMoisturePercent}%, temp: ${temperature}°C)`);
        } else {
          // Método simple basado solo en humedad y temperatura
          calculatedPH = 7.0 + (soilMoisturePercent - 50) * 0.002 + (25 - temperature) * 0.01;
          calculatedPH = Math.max(5.5, Math.min(7.5, calculatedPH));
          method = 'humedad_temperatura';
          console.log(`🧪 pH CALCULADO (simple): ${calculatedPH} (hum: ${soilMoisturePercent}%, temp: ${temperature}°C)`);
        }
        
        return {
          current: Math.round(calculatedPH * 10) / 10,
          unit: 'pH',
          method: method,
          isCalculated: true,
          calculationInputs: {
            salinity: salinityValue,
            soilMoisture: soilMoisturePercent,
            temperature: temperature
          }
        };
      })(),
      ledStatus: {
        blue: apiData.ledAzul === "1" || apiData.ledAzul === true
      }
    };

    console.log(`Datos transformados del sensor ${sensorId}:`, transformedData);
    return transformedData;
  },

  // Transformar múltiples sensores al formato del dashboard
  transformMultipleSensorsToDisplay: (sensorsData) => {
    if (!Array.isArray(sensorsData) || sensorsData.length === 0) {
      console.log('No hay datos de sensores para transformar, usando datos de respaldo');
      return fallbackSensorData;
    }

    console.log('Transformando datos de sensores para display:', sensorsData);

    // Usar datos de respaldo como base
    const displayData = { ...fallbackSensorData };
    
    // Procesar cada sensor y actualizar los datos correspondientes
    sensorsData.forEach(({ sensorId, data }) => {
      console.log(`Procesando sensor ${sensorId} con datos:`, data);
      
      const transformed = apiService.transformSensorApiData(data, sensorId);
      if (transformed) {
        console.log(`Datos transformados para sensor ${sensorId}:`, transformed);
        
        // Actualizar datos de temperatura
        if (transformed.temperature) {
          displayData.temperature.current = transformed.temperature.current;
          displayData.temperature.lastUpdate = transformed.timestamp;
          displayData.temperature.sensorId = sensorId;
          displayData.temperature.isReal = true;
          displayData.temperature.name = 'Temperatura Ambiente';
          console.log(`Temperatura actualizada: ${transformed.temperature.current}°C`);
        }
        
        // Actualizar humedad del aire
        if (transformed.airHumidity) {
          displayData.airHumidity.current = transformed.airHumidity.current;
          displayData.airHumidity.lastUpdate = transformed.timestamp;
          displayData.airHumidity.sensorId = sensorId;
          displayData.airHumidity.isReal = true;
          displayData.airHumidity.name = 'Humedad del Aire';
          console.log(`Humedad del aire actualizada: ${transformed.airHumidity.current}%`);
        }
        
        // Actualizar humedad del suelo
        if (transformed.soilHumidity) {
          displayData.soilHumidity.current = transformed.soilHumidity.current;
          displayData.soilHumidity.lastUpdate = transformed.timestamp;
          displayData.soilHumidity.sensorId = sensorId;
          displayData.soilHumidity.isReal = true;
          displayData.soilHumidity.name = 'Humedad del Suelo';
          console.log(`Humedad del suelo actualizada: ${transformed.soilHumidity.current}`);
        }
        
        // Actualizar salinidad del suelo
        if (transformed.soilSalinity) {
          if (!displayData.soilSalinity) {
            displayData.soilSalinity = {
              current: 0,
              unit: 'ppm',
              ideal: { min: 0, max: 500 },
              history: [],
              name: 'Salinidad del Suelo'
            };
          }
          displayData.soilSalinity.current = transformed.soilSalinity.current;
          displayData.soilSalinity.lastUpdate = transformed.timestamp;
          displayData.soilSalinity.sensorId = sensorId;
          displayData.soilSalinity.isReal = true;
          
          // Logging detallado para análisis de salinidad
          console.log(`📈 SALINIDAD ACTUALIZADA - Sensor ${sensorId}:`);
          console.log(`   💧 Valor mostrado: ${transformed.soilSalinity.current} ppm`);
          if (transformed.soilSalinity.rawValue !== undefined) {
            console.log(`   🔍 Valor crudo original: ${transformed.soilSalinity.rawValue}`);
          }
          if (transformed.soilSalinity.analysisInfo) {
            console.log(`   📊 Información de análisis:`, transformed.soilSalinity.analysisInfo);
          }
          
          // Interpretación del valor
          const interpretation = apiService.interpretSalinityLevel(transformed.soilSalinity.current);
          console.log(`   ⚠️  Nivel interpretado: ${interpretation.level} - ${interpretation.message}`);
        }
        
        // Actualizar pH del suelo (sensor directo o calculado)
        if (transformed.soilPH) {
          displayData.soilPH.current = transformed.soilPH.current;
          displayData.soilPH.lastUpdate = transformed.timestamp;
          displayData.soilPH.sensorId = sensorId;
          // Marcar como real si viene de sensor directo O si está calculado con datos reales de sensores
          displayData.soilPH.isReal = true; // Siempre real porque usa datos de sensores reales
          displayData.soilPH.name = 'pH del Suelo';
          
          // Logging detallado para pH
          console.log(`🧪 pH DEL SUELO ACTUALIZADO - Sensor ${sensorId}:`);
          console.log(`   📊 Valor: ${transformed.soilPH.current} pH`);
          console.log(`   🔬 Método: ${transformed.soilPH.method}`);
          console.log(`   ${transformed.soilPH.isCalculated ? '🧮 CALCULADO con datos reales' : '📡 SENSOR DIRECTO'}`);
          
          if (transformed.soilPH.isCalculated && transformed.soilPH.calculationInputs) {
            console.log(`   📥 Inputs de cálculo:`, transformed.soilPH.calculationInputs);
          }
          
          // Interpretación del nivel de pH
          const phInterpretation = apiService.interpretPHLevel(transformed.soilPH.current);
          console.log(`   ⚠️  Nivel pH: ${phInterpretation.level} - ${phInterpretation.message}`);
          
          // Marcar si es calculado en el objeto de datos
          displayData.soilPH.isCalculated = transformed.soilPH.isCalculated;
          displayData.soilPH.calculationMethod = transformed.soilPH.method;
        }
        
        // Actualizar historial para todos los sensores que recibieron datos reales
        ['temperature', 'airHumidity', 'soilHumidity', 'soilSalinity', 'soilPH'].forEach(sensorType => {
          if (displayData[sensorType] && displayData[sensorType].isReal) {
            if (!displayData[sensorType].history) {
              displayData[sensorType].history = [];
            }
            // Mantener solo los últimos 10 valores
            displayData[sensorType].history = [
              ...displayData[sensorType].history.slice(-9),
              displayData[sensorType].current
            ];
          }
        });
      }
    });

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
