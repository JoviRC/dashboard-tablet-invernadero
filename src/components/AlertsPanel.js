import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

const AlertCard = ({ alert, onDismiss }) => {
  const { theme } = useTheme();
  const getAlertColor = () => {
    switch (alert.type) {
      case 'critical': return theme.colors.error;
      case 'warning': return theme.colors.warning;
      case 'info': return theme.colors.info;
      default: return theme.colors.border;
    }
  };

  const getAlertIcon = () => {
    switch (alert.type) {
      case 'critical': return 'alert-circle';
      case 'warning': return 'warning';
      case 'info': return 'information-circle';
      default: return 'notifications';
    }
  };

  return (
    <View style={[styles.alertCard, { borderLeftColor: getAlertColor() }]}>
      <View style={styles.alertHeader}>
        <Ionicons 
          name={getAlertIcon()} 
          size={20} 
          color={getAlertColor()} 
        />
        <Text style={[styles.alertMessage, { color: theme.colors.text }]}>{alert.message}</Text>
        {alert.isActive && onDismiss && (
          <TouchableOpacity onPress={() => onDismiss(alert.id)}>
            <Ionicons name="close" size={20} color={theme.colors.onSurfaceVariant} />
          </TouchableOpacity>
        )}
      </View>
      <Text style={[styles.alertTimestamp, { color: theme.colors.onSurfaceVariant }]}>{alert.timestamp}</Text>
    </View>
  );
};

const AlertsPanel = ({ alerts, onDismissAlert }) => {
  const { theme } = useTheme();
  const activeAlerts = alerts.filter(alert => alert.isActive);
  if (activeAlerts.length === 0) {
    return (
      <View style={styles.noAlertsContainer}>
        <Ionicons name="checkmark-circle" size={48} color={theme.colors.success} />
        <Text style={[styles.noAlertsText, { color: theme.colors.success }]}>No hay alertas activas</Text>
        <Text style={[styles.noAlertsSubtext, { color: theme.colors.onSurfaceVariant }]}>Todo funciona correctamente</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Alertas Activas ({activeAlerts.length})</Text>
      <FlatList
        data={activeAlerts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <AlertCard alert={item} onDismiss={onDismissAlert} />
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  alertCard: {
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderLeftWidth: 4,
    elevation: 2,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  alertMessage: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginLeft: 8,
  },
  alertTimestamp: {
    fontSize: 12,
    marginLeft: 28,
  },
  noAlertsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  noAlertsText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  noAlertsSubtext: {
    fontSize: 14,
    marginTop: 4,
  },
});

export default AlertsPanel;
