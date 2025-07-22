import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const ThemeSelector = ({ compact = false, showLabels = true, style = {} }) => {
  const { theme, currentTheme, availableThemes, changeTheme, isSystemTheme, toggleSystemTheme } = useTheme();

  const themeIcons = {
    light: 'sunny',
    dark: 'moon',
    green: 'leaf',
    blue: 'water'
  };

  const themeNames = {
    light: 'Claro',
    dark: 'Oscuro',
    green: 'Verde',
    blue: 'Azul'
  };

  const handleThemeChange = (themeName) => {
    changeTheme(themeName);
  };

  const handleSystemToggle = () => {
    toggleSystemTheme(!isSystemTheme);
  };

  if (compact) {
    return (
      <View style={[styles.compactContainer, { backgroundColor: theme.colors.surface }, style]}>
        <TouchableOpacity
          style={[styles.compactButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => {
            const currentIndex = availableThemes.indexOf(currentTheme);
            const nextIndex = (currentIndex + 1) % availableThemes.length;
            handleThemeChange(availableThemes[nextIndex]);
          }}
        >
          <Ionicons 
            name={themeIcons[currentTheme]} 
            size={16} 
            color={theme.colors.background} 
          />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }, style]}>
      {showLabels && (
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Tema
        </Text>
      )}
      
      <View style={styles.themesRow}>
        {availableThemes.map((themeName) => (
          <TouchableOpacity
            key={themeName}
            style={[
              styles.themeButton,
              { 
                backgroundColor: currentTheme === themeName ? theme.colors.primary : theme.colors.background,
                borderColor: theme.colors.border 
              }
            ]}
            onPress={() => handleThemeChange(themeName)}
          >
            <Ionicons 
              name={themeIcons[themeName]} 
              size={20} 
              color={currentTheme === themeName ? theme.colors.background : theme.colors.text} 
            />
            {showLabels && (
              <Text style={[
                styles.themeText, 
                { 
                  color: currentTheme === themeName ? theme.colors.background : theme.colors.text 
                }
              ]}>
                {themeNames[themeName]}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
      
      <TouchableOpacity
        style={[styles.systemButton, { borderColor: theme.colors.border }]}
        onPress={handleSystemToggle}
      >
        <Ionicons 
          name={isSystemTheme ? "checkmark-circle" : "checkmark-circle-outline"} 
          size={16} 
          color={theme.colors.primary} 
        />
        <Text style={[styles.systemText, { color: theme.colors.onSurfaceVariant }]}>
          Automático
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 8,
    marginVertical: 4,
  },
  compactContainer: {
    borderRadius: 6,
    padding: 4,
  },
  compactButton: {
    padding: 8,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  themesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  themeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    minWidth: 60,
    justifyContent: 'center',
  },
  themeText: {
    fontSize: 12,
    marginLeft: 4,
  },
  systemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderStyle: 'dashed',
    justifyContent: 'center',
  },
  systemText: {
    fontSize: 11,
    marginLeft: 4,
  },
});

export default ThemeSelector;