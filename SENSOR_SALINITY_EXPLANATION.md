# 🌱 Medición de Salinidad del Suelo - Explicación Técnica

## 📊 Principio de Funcionamiento

### 1. Conductividad Eléctrica (EC)
```
Suelo con sales → Mayor conductividad → Menor resistencia eléctrica
EC = 1 / Resistencia
```

### 2. Relación EC ↔ Salinidad
```
Conductividad Eléctrica (μS/cm) → TDS (ppm)
Factor de conversión típico: TDS = EC × 0.64
```

## 🔧 Implementación en Arduino

### Sensor de Humedad + Conductividad
```cpp
// Lectura típica de un sensor combinado
int humidityRaw = analogRead(A0);      // Pin de humedad
int conductivityRaw = analogRead(A1);   // Pin de conductividad

// Conversión de humedad (ya implementada)
float humidity = mapHumidity(humidityRaw, 1300, 2800); // 0-100%

// Conversión de conductividad a salinidad
float ec = mapConductivity(conductivityRaw, 0, 1023);   // μS/cm
float salinity = ec * 0.64;  // Conversión a ppm (TDS)
```

## 📈 Calibración Requerida

### Valores de Referencia
```
Agua destilada:     0 ppm     (EC: 0 μS/cm)
Agua de grifo:      150-300 ppm (EC: 200-400 μS/cm)
Suelo normal:       400-800 ppm (EC: 600-1200 μS/cm)
Suelo salino:       >2000 ppm   (EC: >3000 μS/cm)
```

### Proceso de Calibración
1. **Punto 0**: Agua destilada o suelo seco
2. **Punto medio**: Solución salina conocida (1000 ppm)
3. **Punto alto**: Solución salina concentrada (3000 ppm)

## 🛠️ Implementación en el Código

### Función de Conversión Actual
```javascript
// ApiService.js - Línea 324
soilSalinity: {
  current: parseFloat(apiData.salinidadSuelo) || 0,
  unit: 'ppm'
}
```

### Función Mejorada (Propuesta)
```javascript
convertConductivityToSalinity: (conductivityValue) => {
  // Valores de calibración del sensor
  const minConductivity = 0;     // Valor analógico mínimo
  const maxConductivity = 1023;  // Valor analógico máximo
  
  // Mapear a μS/cm (microsiemens por centímetro)
  const ecValue = (conductivityValue / maxConductivity) * 3000; // 0-3000 μS/cm
  
  // Convertir EC a TDS (Total Dissolved Solids) en ppm
  const salinityPpm = ecValue * 0.64; // Factor de conversión estándar
  
  return Math.round(salinityPpm * 10) / 10; // 1 decimal
}
```

## 🔬 Factores que Afectan la Medición

### Variables del Entorno
- **Temperatura**: Afecta la conductividad (+2%/°C)
- **Humedad del suelo**: Necesaria para conductividad
- **Tipo de sales**: NaCl, KCl, etc. tienen diferentes factores
- **Textura del suelo**: Arena vs arcilla vs limo

### Compensación de Temperatura
```javascript
compensateTemperature: (ecValue, temperature, referenceTemp = 25) => {
  const tempCoeff = 0.02; // 2% por grado Celsius
  return ecValue / (1 + tempCoeff * (temperature - referenceTemp));
}
```

## 📱 Visualización en Dashboard

### Estado Actual
```javascript
// DashboardScreen.js - Líneas 389-399
<SensorCard
  title="Salinidad del Suelo"
  value={sensors.soilSalinity.current}
  unit={sensors.soilSalinity.unit}
  status={getSensorStatus(sensors.soilSalinity)}
  icon="beaker-outline"
  ideal={sensors.soilSalinity.ideal}
  isReal={sensors.soilSalinity.isReal}
  sensorId={sensors.soilSalinity.sensorId}
  lastUpdate={sensors.soilSalinity.lastUpdate}
/>
```

### Rangos Ideales
```javascript
ideal: { 
  min: 0,     // Agua pura
  max: 500    // Límite seguro para plantas
},
// Alertas:
// 500-1000 ppm: Precaución
// 1000-2000 ppm: Advertencia  
// >2000 ppm: Crítico (puede dañar plantas)
```

## 🌿 Interpretación Agronómica

### Efectos en las Plantas
- **0-400 ppm**: Óptimo para la mayoría de cultivos
- **400-800 ppm**: Aceptable, monitorear crecimiento
- **800-1500 ppm**: Estrés moderado, reducir fertilización
- **>1500 ppm**: Estrés severo, riego con agua baja en sales

### Acciones Correctivas
- **Riego abundante**: Lavar sales del suelo
- **Drenaje mejorado**: Evitar acumulación
- **Agua de calidad**: Usar agua con baja EC
- **Materia orgánica**: Mejorar estructura del suelo

## 🔄 Integración con Sistema Actual

Tu sistema ya tiene la estructura para manejar salinidad, solo necesita:
1. **Calibración del sensor** en Arduino
2. **Función de conversión** mejorada en ApiService
3. **Alertas automáticas** basadas en rangos críticos
4. **Compensación por temperatura** para mayor precisión
