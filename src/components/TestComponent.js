import React from 'react';
import { View, Text } from 'react-native';

// Test imports uno por uno
import SensorCard from '../components/SensorCard';

const TestComponent = () => {
  return (
    <View>
      <Text>Test Component</Text>
      <SensorCard
        title="Test"
        value={25}
        unit="°C"
        status="optimal"
        icon="thermometer-outline"
      />
    </View>
  );
};

export default TestComponent;
