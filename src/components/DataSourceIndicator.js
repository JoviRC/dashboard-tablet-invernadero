import React from 'react';
import { View } from 'react-native';

const DataSourceIndicator = ({ isReal, isConnected, lastUpdate, sensorId, source, size = 'small' }) => {
  // Render mínimo para evitar errores
  return (
    <View style={{ width: size === 'small' ? 12 : 20, height: size === 'small' ? 12 : 20, borderRadius: 10, backgroundColor: isReal ? (isConnected ? '#4CAF50' : '#FF9800') : '#2196F3', marginRight: 4 }} />
  );
};

export default DataSourceIndicator;
