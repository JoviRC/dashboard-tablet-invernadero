import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../contexts/ThemeContext';
import { ColorHelpers } from '../config/colors';

const AlertCard = ({ alert, onDismiss }) => {
  const theme = useThemeColors();
  
  const getAlertColor = () => {
    return ColorHelpers.getAlertColor(alert.type, theme);
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
        <Text style={styles.alertMessage}>{alert.message}</Text>
        {alert.isActive && onDismiss && (
          <TouchableOpacity onPress={() => onDismiss(alert.id)}>
            <Ionicons name="close" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.alertTimestamp}>{alert.timestamp}</Text>
    </View>
  );
};

const AlertsPanel = ({ alerts, onDismissAlert }) => {
  const theme = useThemeColors();
  const styles = getStyles(theme);
  
  const activeAlerts = alerts.filter(alert => alert.isActive);
  
  if (activeAlerts.length === 0) {
    return (
      <View style={styles.noAlertsContainer}>
        <Ionicons name="checkmark-circle" size={48} color={theme.success} />
        <Text style={styles.noAlertsText}>No hay alertas activas</Text>
        <Text style={styles.noAlertsSubtext}>Todo funciona correctamente</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Alertas Activas ({activeAlerts.length})</Text>
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

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  alertCard: {
    backgroundColor: theme.surface,
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderLeftWidth: 4,
    elevation: 2,
    // Removed deprecated shadow* properties
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  alertMessage: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    flex: 1,
    marginLeft: 8,
  },
  alertTimestamp: {
    fontSize: 12,
    color: theme.textSecondary,
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
    color: theme.success,
    marginTop: 16,
  },
  noAlertsSubtext: {
    fontSize: 14,
    color: theme.textSecondary,
    marginTop: 4,
  },
});

export default AlertsPanel;
