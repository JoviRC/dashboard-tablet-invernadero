import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import useResponsiveLayout from '../hooks/useResponsiveLayout';

const ResponsiveGrid = ({ children, spacing = 12, style }) => {
  const { gridColumns, cardWidth, isTablet } = useResponsiveLayout();

  const { theme } = useTheme ? useTheme() : { theme: { colors: { surface: '#fff' } } };
  const gridStyle = {
    ...styles.container,
    backgroundColor: theme.colors.surface,
    ...style
  };

  // Para React Native Web, usar CSS Grid cuando esté disponible
  if (Platform.OS === 'web') {
    gridStyle.display = 'grid';
    gridStyle.gridTemplateColumns = `repeat(${gridColumns}, 1fr)`;
    gridStyle.gap = spacing;
  } else {
    // Para React Native nativo, usar marginBottom y marginRight
    gridStyle.gap = undefined;
  }

  // Clonar children para pasar estilos responsivos
  const enhancedChildren = React.Children.map(children, (child, index) => {
    if (!child) return null;
    
    const childStyle = Platform.OS === 'web' 
      ? { width: '100%' } 
      : {
          width: cardWidth,
          marginBottom: spacing,
          marginRight: (index + 1) % gridColumns === 0 ? 0 : spacing,
        };
    
    return React.cloneElement(child, {
      key: child.key || index,
      style: [
        child.props.style,
        childStyle,
        {
          minWidth: isTablet ? 160 : 140,
          maxWidth: Platform.OS === 'web' ? 'none' : cardWidth + 20,
        }
      ]
    });
  });

  return (
    <View style={gridStyle}>
      {enhancedChildren}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    alignItems: 'stretch',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});

export default ResponsiveGrid;
