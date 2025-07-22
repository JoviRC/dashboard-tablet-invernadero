import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

const ConnectionStatus = ({ 
  compact = false, 
  style = {}, 
  onStatusPress = () => {} 
}) => {
  const { theme, isDark } = useTheme();
  
  // Mock connection info for now
  const connectionInfo = {
    isPrimary: true,
    currentUrl: 'localhost:3000',
    isConnected: true,
    status: 'online'
  };

  const handlePress = () => {
    onStatusPress(connectionInfo);
  };

  if (compact) {
    return (
      <TouchableOpacity 
        style={[styles.compactContainer, { backgroundColor: theme.colors.surface }, style]}
        onPress={handlePress}
      >
        <Ionicons 
          name={connectionInfo.isConnected ? "wifi" : "wifi-off"} 
          size={16} 
          color={connectionInfo.isConnected ? theme.colors.success : theme.colors.error} 
        />
        <Text style={[styles.compactText, { color: theme.colors.onSurfaceVariant }]}>
          {connectionInfo.status}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card }, style]}>
      <View style={styles.header}>
        <Ionicons 
          name={connectionInfo.isConnected ? "wifi" : "wifi-off"} 
          size={20} 
          color={connectionInfo.isConnected ? theme.colors.success : theme.colors.error} 
        />
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Estado de Conexión
        </Text>
      </View>
      
      <Text style={[styles.status, { color: theme.colors.onSurfaceVariant }]}>
        {connectionInfo.isConnected ? 'Conectado' : 'Desconectado'}
      </Text>
      
      <Text style={[styles.url, { color: theme.colors.onSurfaceVariant }]}>
        {connectionInfo.currentUrl}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  compactText: {
    fontSize: 12,
    fontWeight: '500',
  },
  status: {
    fontSize: 14,
    marginBottom: 4,
  },
  url: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
});

export default ConnectionStatus;
