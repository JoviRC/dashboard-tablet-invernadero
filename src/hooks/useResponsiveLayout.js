import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';

const useResponsiveLayout = () => {
  const [screenData, setScreenData] = useState(Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', (result) => {
      setScreenData(result.window);
    });

    return () => subscription?.remove();
  }, []);

  // Determinar el número de columnas basado en el ancho de pantalla
  const getGridColumns = () => {
    const { width } = screenData;
    
    if (width >= 1200) return 4; // Pantallas muy grandes (desktop)
    if (width >= 900) return 3;  // Tablets en landscape
    if (width >= 600) return 2;  // Tablets en portrait / móviles grandes
    return 1; // Móviles pequeños
  };

  // Determinar el ancho de cada card
  const getCardWidth = () => {
    const columns = getGridColumns();
    const screenWidth = screenData.width;
    const padding = 24; // Padding horizontal total
    const gap = 12; // Gap entre elementos
    const totalGaps = (columns - 1) * gap;
    
    return Math.floor((screenWidth - padding - totalGaps) / columns);
  };

  // Determinar si es una pantalla de tablet
  const isTablet = () => {
    return screenData.width >= 600;
  };

  // Determinar orientación
  const isLandscape = () => {
    return screenData.width > screenData.height;
  };

  return {
    screenData,
    gridColumns: getGridColumns(),
    cardWidth: getCardWidth(),
    isTablet: isTablet(),
    isLandscape: isLandscape(),
  };
};

export default useResponsiveLayout;
