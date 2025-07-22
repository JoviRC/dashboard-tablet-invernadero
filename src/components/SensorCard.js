import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { ColorHelpers } from '../config/colors';
import DataSourceIndicator from './DataSourceIndicator';

const SensorCard = ({ 
  title, 
  value, 
  unit, 
  icon, 
  status = 'normal',
  trend = 'stable',
  ideal,
  isReal = false,
  sensorId,
  lastUpdate,
  isCalculated = false,
  calculationMethod,
  source = 'unknown',
  isConnected = false
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const getStatusColor = () => {
    return ColorHelpers.getSensorColor(status, theme);
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return 'trending-up';
      case 'down': return 'trending-down';
      default: return 'remove';
    }
  };

  const formatValue = (value) => {
    if (typeof value === 'number') {
      return value % 1 === 0 ? value.toString() : value.toFixed(1);
    }
    return value?.toString() || '—';
  };

  return (
    <View style={[styles.card, { borderLeftColor: getStatusColor() }]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name={icon} size={26} color={getStatusColor()} />
          <Text style={styles.title}>{title}</Text>
        </View>
        <View style={styles.indicatorContainer}>
          <DataSourceIndicator 
            isReal={isReal}
            isConnected={isConnected}
            lastUpdate={lastUpdate}
            sensorId={sensorId}
            source={source}
            size="small"
          />
          <Ionicons 
            name={getTrendIcon()} 
            size={20} 
            color={getStatusColor()} 
            style={styles.trendIcon}
          />
        </View>
      </View>
      
      <View style={styles.valueContainer}>
        <Text style={[styles.value, { color: getStatusColor() }]}>
          {formatValue(value)}
        </Text>
        <Text style={styles.unit}>{unit}</Text>
      </View>

      {ideal && (
        <View style={styles.idealContainer}>
          <Text style={styles.idealText}>
            Ideal: {ideal.min}-{ideal.max}{unit}
          </Text>
        </View>
      )}

      <View style={styles.bottomRow}>
        {isCalculated && (
          <View style={styles.calculatedContainer}>
            <Ionicons name="calculator-outline" size={12} color={theme.colors.onSurfaceVariant} />
            <Text style={styles.calculatedText}>Calculado</Text>
          </View>
        )}
        
        {isReal && lastUpdate && (
          <View style={styles.updateContainer}>
            <Text style={styles.updateText}>
              {lastUpdate.toLocaleTimeString('es-ES', { 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit'
              })}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const createStyles = (theme) => StyleSheet.create({
  card: {
    backgroundColor: theme.cardBackground,
    borderRadius: 12,
    padding: 16,
    margin: 8,
    elevation: 3,
    minWidth: 160,
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    borderLeftWidth: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginLeft: 8,
    flex: 1,
  },
  indicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendIcon: {
    marginLeft: 4,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  value: {
    fontSize: 28,
    fontWeight: 'bold',
    marginRight: 4,
  },
  unit: {
    fontSize: 16,
    color: theme.colors.onSurfaceVariant,
    fontWeight: '500',
  },
  idealContainer: {
    marginBottom: 8,
  },
  idealText: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    fontStyle: 'italic',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  calculatedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceVariant,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  calculatedText: {
    fontSize: 10,
    color: theme.colors.onSurfaceVariant,
    marginLeft: 4,
    fontWeight: '500',
  },
  updateContainer: {
    backgroundColor: theme.colors.surfaceVariant,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  updateText: {
    fontSize: 10,
    color: theme.colors.onSurfaceVariant,
    fontFamily: 'monospace',
  },
});

export default SensorCard;
