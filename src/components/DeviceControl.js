import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../contexts/ThemeContext';
import { ColorHelpers } from '../config/colors';

const DeviceControl = ({ 
  title, 
  isActive, 
  onToggle, 
  icon, 
  isAutomatic = false,
  onAutomaticToggle,
  additionalInfo,
  showControls = true 
}) => {
  const theme = useThemeColors();
  const styles = getStyles(theme);
  
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons 
            name={icon} 
            size={24} 
            color={isActive ? theme.success : theme.textSecondary} 
          />
          <Text style={styles.title}>{title}</Text>
        </View>
        
        {showControls && (
          <Switch
            value={isActive}
            onValueChange={onToggle}
            trackColor={{ false: '#E0E0E0', true: '#C8E6C9' }}
            thumbColor={isActive ? '#4CAF50' : '#9E9E9E'}
          />
        )}
      </View>
      
      {additionalInfo && (
        <Text style={styles.info}>{additionalInfo}</Text>
      )}
      
      {showControls && (
        <View style={styles.automaticContainer}>
          <Text style={styles.automaticLabel}>Automático</Text>
          <Switch
            value={isAutomatic}
            onValueChange={onAutomaticToggle}
            trackColor={{ false: theme.inactive, true: ColorHelpers.withOpacity(theme.success, 0.3) }}
            thumbColor={isAutomatic ? theme.success : theme.disabled}
            style={styles.automaticSwitch}
          />
        </View>
      )}
      
      <View style={[styles.statusIndicator, { 
        backgroundColor: isActive ? theme.active : theme.inactive 
      }]}>
        <Text style={[styles.statusText, { 
          color: isActive ? theme.textOnDark : theme.textSecondary 
        }]}>
          {isActive ? 'ACTIVO' : 'INACTIVO'}
        </Text>
      </View>
    </View>
  );
};

const getStyles = (theme) => StyleSheet.create({
  card: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 16,
    margin: 8,
    elevation: 3,
    // Removed deprecated shadow* properties
    minWidth: 160,
    flex: 1,
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
    marginLeft: 8,
    color: theme.text,
    flex: 1,
  },
  info: {
    fontSize: 12,
    color: theme.textSecondary,
    marginBottom: 12,
    lineHeight: 16,
  },
  automaticContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  automaticLabel: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  automaticSwitch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  statusIndicator: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export default DeviceControl;
