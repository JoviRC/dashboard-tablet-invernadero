import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

const DataModeBanner = ({ 
  isUsingRealData = false,
  isConnected = false,
  sensorsCount = 0,
  lastUpdate = null,
  onRefresh = () => {},
  apiUrl = ''
}) => {
  const { theme } = useTheme();

  const getStatusIcon = () => {
    if (isUsingRealData && isConnected) return 'checkmark-circle';
    if (isUsingRealData && !isConnected) return 'warning';
    return 'flask';
  };

  const getStatusColor = () => {
    if (isUsingRealData && isConnected) return theme.colors.success;
    if (isUsingRealData && !isConnected) return theme.colors.warning;
    return theme.colors.info;
  };

  const getStatusText = () => {
    if (isUsingRealData && isConnected) return `Datos REALES - ${sensorsCount} sensores conectados`;
    if (isUsingRealData && !isConnected) return 'Conexión perdida - Usando últimos datos';
    return 'Modo demostración - Datos simulados';
  };

  const getLastUpdateText = () => {
    if (!lastUpdate) return '';
    const now = new Date();
    const updateTime = new Date(lastUpdate);
    const diffMinutes = Math.floor((now - updateTime) / (1000 * 60));
    if (diffMinutes < 1) return 'Actualizado ahora';
    if (diffMinutes < 60) return `Actualizado hace ${diffMinutes} min`;
    const diffHours = Math.floor(diffMinutes / 60);
    return `Actualizado hace ${diffHours}h`;
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        padding: 10,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: getStatusColor(),
        boxShadow: '0px 2px 4px rgba(0,0,0,0.1)', // web compatible
        elevation: 2,
      }}
    >
      <Ionicons
        name={getStatusIcon()}
        size={28}
        color={getStatusColor()}
        style={{ marginRight: 10 }}
      />
      <View style={{ flex: 1 }}>
        <Text style={{ color: getStatusColor(), fontWeight: 'bold', fontSize: 15 }}>
          {getStatusText()}
        </Text>
        {(lastUpdate || apiUrl) && (
          <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 12, marginTop: 2 }}>
            {lastUpdate ? getLastUpdateText() : ''}
            {lastUpdate && apiUrl ? '  |  ' : ''}
            {apiUrl ? `API: ${apiUrl}` : ''}
          </Text>
        )}
      </View>
      <TouchableOpacity
        onPress={onRefresh}
        style={{ marginLeft: 10, padding: 8, borderRadius: 16 }}
      >
        <Ionicons name="refresh" size={22} color={theme.colors.primary} />
      </TouchableOpacity>
    </View>
  );
};

export default DataModeBanner;
