import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

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
  const { theme } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface }] }>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons 
            name={icon} 
            size={24} 
            color={isActive ? theme.colors.success : theme.colors.border} 
          />
          <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
        </View>
        {showControls && (
          <Switch
            value={isActive}
            onValueChange={onToggle}
            trackColor={{ false: theme.colors.disabled, true: theme.colors.successBackground }}
            thumbColor={isActive ? theme.colors.success : theme.colors.border}
          />
        )}
      </View>
      {additionalInfo && (
        <Text style={[styles.info, { color: theme.colors.onSurfaceVariant }]}>{additionalInfo}</Text>
      )}
      {showControls && (
        <View style={styles.automaticContainer}>
          <Text style={[styles.automaticLabel, { color: theme.colors.onSurfaceVariant }]}>Automático</Text>
          <Switch
            value={isAutomatic}
            onValueChange={onAutomaticToggle}
            trackColor={{ false: theme.colors.disabled, true: theme.colors.infoBackground }}
            thumbColor={isAutomatic ? theme.colors.info : theme.colors.border}
            style={styles.automaticSwitch}
          />
        </View>
      )}
      <View style={[styles.statusIndicator, { backgroundColor: isActive ? theme.colors.success : theme.colors.disabled }] }>
        <Text style={[styles.statusText, { color: isActive ? theme.colors.onSuccess : theme.colors.onSurfaceVariant }] }>
          {isActive ? 'ACTIVO' : 'INACTIVO'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    margin: 8,
    elevation: 3,
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
    flex: 1,
  },
  info: {
    fontSize: 12,
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
    color: '#666',
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
