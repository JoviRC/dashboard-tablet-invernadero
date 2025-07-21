import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../contexts/ThemeContext';
import { ColorHelpers } from '../config/colors';

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
  calculationMethod
}) => {
  const theme = useThemeColors();
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
          {isReal && (
            <Ionicons name="radio" size={16} color={theme.success} style={styles.realIndicator} />
          )}
          <Ionicons 
            name={getTrendIcon()} 
            size={20} 
            color={getStatusColor()} 
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

      {isCalculated && (
        <View style={styles.calculatedContainer}>
          <Ionicons name="calculator-outline" size={12} color={theme.textSecondary} />
          <Text style={styles.calculatedText}>Calculado</Text>
        </View>
      )}
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
    borderColor: theme.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 10,
    color: theme.textPrimary,
    flex: 1,
  },
  indicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  realIndicator: {
    marginRight: 8,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginTop: 8,
  },
  value: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  unit: {
    fontSize: 18,
    color: theme.textSecondary,
    marginLeft: 6,
    fontWeight: '500',
  },
  idealContainer: {
    marginTop: 12,
    backgroundColor: theme.backgroundSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'center',
  },
  idealText: {
    fontSize: 12,
    color: theme.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  calculatedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  calculatedText: {
    fontSize: 11,
    color: theme.textSecondary,
    marginLeft: 4,
    fontStyle: 'italic',
  },
});

export default SensorCard;
