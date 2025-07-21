# 🧪 Cálculo del pH del Suelo - Métodos Alternativos

## 📊 Relaciones Conocidas para Estimar pH

### 1. **Relación EC/Salinidad → pH**
```
📈 Tendencia General:
- Mayor salinidad → Tendencia a pH más ácido
- Menor salinidad → pH más neutro/básico
```

### 2. **Correlación Empírica**
```javascript
// Fórmula empírica basada en conductividad
pH ≈ 7.5 - (EC_μS/cm / 1000) * 1.2

Ejemplo:
- EC = 500 μS/cm → pH ≈ 6.9 (ligeramente ácido)
- EC = 1000 μS/cm → pH ≈ 6.3 (ácido)
- EC = 200 μS/cm → pH ≈ 7.3 (neutro)
```

### 3. **Algoritmo Complejo Multi-Variable**
```javascript
pH = base_pH + 
     (salinidad_factor * -0.001) + 
     (humedad_factor * 0.002) + 
     (temperatura_factor * -0.01)
```

## 🛠️ Implementación Práctica

### Método 1: Correlación Simple EC-pH
```javascript
calculatePHFromEC: (ecValue) => {
  // Valores base
  const basePH = 7.5;
  const ecFactor = 1.2;
  
  // Convertir EC a pH estimado
  const estimatedPH = basePH - (ecValue / 1000) * ecFactor;
  
  // Limitar a rango realistic (4.5 - 8.5)
  return Math.max(4.5, Math.min(8.5, estimatedPH));
}
```

### Método 2: Multi-Variable
```javascript
calculatePHFromMultipleFactors: (salinity, soilMoisture, temperature) => {
  let basePH = 7.0; // pH neutro base
  
  // Factor de salinidad (-0.5 a +0.5)
  const salinityFactor = Math.max(-0.5, Math.min(0.5, 
    (salinity - 400) * -0.001
  ));
  
  // Factor de humedad (-0.3 a +0.3)
  const moistureFactor = Math.max(-0.3, Math.min(0.3,
    (soilMoisture - 50) * 0.004
  ));
  
  // Factor de temperatura (-0.2 a +0.2)
  const tempFactor = Math.max(-0.2, Math.min(0.2,
    (temperature - 25) * -0.01
  ));
  
  const calculatedPH = basePH + salinityFactor + moistureFactor + tempFactor;
  
  // Rango realista para suelos
  return Math.max(5.0, Math.min(8.0, calculatedPH));
}
```

## 📈 Calibración Recomendada

### Valores de Referencia para Suelos
```
🌱 Tipos de Suelo:
- Suelo arenoso: pH 6.0 - 7.0
- Suelo arcilloso: pH 6.5 - 7.5  
- Suelo orgánico: pH 5.5 - 6.5
- Suelo calcáreo: pH 7.5 - 8.5

🧂 Correlación Salinidad-pH:
- 0-200 ppm: pH 7.0-7.5 (neutro-básico)
- 200-500 ppm: pH 6.5-7.0 (ligeramente ácido)
- 500-1000 ppm: pH 6.0-6.5 (ácido)
- >1000 ppm: pH 5.5-6.0 (muy ácido)
```

## ⚠️ Limitaciones

### Precisión Estimada
- **Sensor dedicado pH**: ±0.1 pH
- **Cálculo por EC**: ±0.5 pH  
- **Multi-variable**: ±0.3 pH

### Factores No Considerados
- Tipo específico de suelo
- Materia orgánica
- Fertilizantes aplicados
- Tiempo desde último riego
- Profundidad de medición

## 🎯 Recomendación Final

Para **mayor precisión**:
1. Usar sensor de pH dedicado
2. Calibrar con muestras conocidas
3. Compensar por temperatura

Para **estimación útil**:
1. Implementar cálculo multi-variable
2. Ajustar según tipo de cultivo
3. Mostrar como "pH estimado"
