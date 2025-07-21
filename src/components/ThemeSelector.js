// Componente selector de tema
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

const ThemeSelector = ({ 
  style = {},
  showLabels = true,
  layout = 'row', // 'row' | 'column'
  compact = false,
  onThemeChange = null 
}) => {
  const { 
    themeMode, 
    setThemeMode, 
    cycleTheme, 
    isDark, 
    systemTheme,
    theme 
  } = useTheme();

  const handleThemeChange = (newMode) => {
    setThemeMode(newMode);
    if (onThemeChange) {
      onThemeChange(newMode);
    }
  };

  const getThemeIcon = (mode) => {
    switch (mode) {
      case 'light':
        return 'sunny';
      case 'dark':
        return 'moon';
      case 'auto':
        return 'phone-portrait';
      default:
        return 'help';
    }
  };

  const getThemeLabel = (mode) => {
    switch (mode) {
      case 'light':
        return 'Claro';
      case 'dark':
        return 'Oscuro';
      case 'auto':
        return 'Auto';
      default:
        return 'N/A';
    }
  };

  const getThemeDescription = (mode) => {
    switch (mode) {
      case 'light':
        return 'Tema claro siempre activo';
      case 'dark':
        return 'Tema oscuro siempre activo';
      case 'auto':
        return `Sigue el sistema (${systemTheme === 'dark' ? 'oscuro' : 'claro'})`;
      default:
        return '';
    }
  };

  const themes = ['light', 'dark', 'auto'];

  if (compact) {
    return (
      <TouchableOpacity 
        style={[styles.compactContainer, { backgroundColor: theme.surface }, style]}
        onPress={cycleTheme}
        activeOpacity={0.7}
      >
        <Ionicons 
          name={getThemeIcon(themeMode)} 
          size={20} 
          color={theme.textPrimary} 
        />
        {showLabels && (
          <Text style={[styles.compactLabel, { color: theme.textSecondary }]}>
            {getThemeLabel(themeMode)}
          </Text>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[
      styles.container, 
      layout === 'column' && styles.columnLayout,
      { backgroundColor: theme.surface },
      style
    ]}>
      {showLabels && (
        <Text style={[styles.title, { color: theme.textPrimary }]}>
          Tema de la aplicación
        </Text>
      )}
      
      <View style={[
        styles.optionsContainer,
        layout === 'column' && styles.columnOptions
      ]}>
        {themes.map((mode) => (
          <TouchableOpacity
            key={mode}
            style={[
              styles.themeOption,
              themeMode === mode && styles.activeOption,
              themeMode === mode && { 
                backgroundColor: theme.selected,
                borderColor: theme.primary 
              },
              { borderColor: theme.border }
            ]}
            onPress={() => handleThemeChange(mode)}
            activeOpacity={0.7}
          >
            <View style={styles.optionContent}>
              <Ionicons
                name={getThemeIcon(mode)}
                size={24}
                color={themeMode === mode ? theme.primary : theme.textSecondary}
                style={styles.optionIcon}
              />
              
              {showLabels && (
                <View style={styles.optionText}>
                  <Text style={[
                    styles.optionLabel,
                    { color: themeMode === mode ? theme.primary : theme.textPrimary }
                  ]}>
                    {getThemeLabel(mode)}
                  </Text>
                  
                  <Text style={[
                    styles.optionDescription,
                    { color: theme.textSecondary }
                  ]}>
                    {getThemeDescription(mode)}
                  </Text>
                </View>
              )}
              
              {themeMode === mode && (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={theme.primary}
                  style={styles.checkIcon}
                />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {themeMode === 'auto' && (
        <View style={[styles.autoInfo, { backgroundColor: theme.surfaceVariant }]}>
          <Ionicons 
            name="information-circle" 
            size={16} 
            color={theme.textSecondary} 
          />
          <Text style={[styles.autoInfoText, { color: theme.textSecondary }]}>
            Actualmente usando tema {isDark ? 'oscuro' : 'claro'} del sistema
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  columnLayout: {
    minWidth: 250,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  columnOptions: {
    flexDirection: 'column',
  },
  themeOption: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 8,
    padding: 12,
    minHeight: 60,
  },
  activeOption: {
    borderWidth: 2,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionIcon: {
    marginRight: 4,
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  optionDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  checkIcon: {
    marginLeft: 8,
  },
  autoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    padding: 8,
    borderRadius: 6,
  },
  autoInfoText: {
    fontSize: 12,
    flex: 1,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  compactLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default ThemeSelector;
