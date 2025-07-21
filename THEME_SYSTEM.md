# Sistema de Temas - Dashboard Invernadero

## 📱 Funcionalidades del Sistema de Temas

El sistema de temas implementado incluye soporte completo para:

- **🌞 Tema Claro**: Tema claro con colores brillantes y fondos blancos
- **🌙 Tema Oscuro**: Tema oscuro con colores suaves y fondos negros
- **🔄 Modo Automático**: Sigue automáticamente el tema del sistema operativo

## 🚀 Características Principales

### ✨ Detección Automática del Sistema
- Detecta automáticamente el tema preferido del sistema operativo
- Cambia dinámicamente cuando el usuario cambia el tema del sistema
- Persiste la preferencia del usuario en almacenamiento local

### 🎨 Colores Adaptativos
- Paleta de colores completamente adaptativa
- Colores específicos para sensores, alertas y UI
- Transiciones suaves entre temas
- Mantiene la legibilidad en ambos temas

### 💾 Persistencia de Preferencias
- Guarda automáticamente la preferencia del usuario
- Restaura la configuración al reiniciar la aplicación
- Sincronización con el tema del sistema cuando está en modo "auto"

## 🛠️ Uso del Sistema

### Hook Principal: `useTheme()`
```javascript
import { useTheme } from '../contexts/ThemeContext';

const MyComponent = () => {
  const { 
    theme,           // Colores del tema actual
    themeMode,       // 'light' | 'dark' | 'auto'
    isDark,          // Boolean: es tema oscuro
    isLight,         // Boolean: es tema claro
    setThemeMode,    // Función para cambiar tema
    toggleTheme,     // Alternar entre light/dark
    cycleTheme       // Ciclar: light → dark → auto
  } = useTheme();

  return (
    <View style={{ backgroundColor: theme.background }}>
      <Text style={{ color: theme.textPrimary }}>
        Tema actual: {themeMode}
      </Text>
    </View>
  );
};
```

### Hook de Colores: `useThemeColors()`
```javascript
import { useThemeColors } from '../contexts/ThemeContext';

const MyComponent = () => {
  const colors = useThemeColors();
  
  return (
    <View style={{ backgroundColor: colors.surface }}>
      <Text style={{ color: colors.textPrimary }}>
        Solo los colores del tema
      </Text>
    </View>
  );
};
```

### Componente Selector de Tema
```javascript
import ThemeSelector from '../components/ThemeSelector';

// Selector completo con etiquetas
<ThemeSelector showLabels={true} layout="row" />

// Selector compacto
<ThemeSelector compact={true} showLabels={false} />

// Con callback
<ThemeSelector 
  onThemeChange={(newTheme) => console.log('Tema cambiado:', newTheme)}
/>
```

## 🎨 Paleta de Colores

### Tema Claro
- **Fondo**: `#F8F9FA` (gris muy claro)
- **Superficie**: `#FFFFFF` (blanco)
- **Texto Principal**: `#212121` (negro suave)
- **Texto Secundario**: `#757575` (gris medio)
- **Bordes**: `#E0E0E0` (gris claro)

### Tema Oscuro
- **Fondo**: `#121212` (negro profundo)
- **Superficie**: `#1E1E1E` (gris muy oscuro)
- **Texto Principal**: `#E0E0E0` (blanco suave)
- **Texto Secundario**: `#B0B0B0` (gris claro)
- **Bordes**: `#404040` (gris oscuro)

### Colores de Estado (Ambos Temas)
- **Éxito**: `#27AE60` / `#4CAF50`
- **Advertencia**: `#F39C12` / `#FFA726`
- **Peligro**: `#E74C3C` / `#EF5350`
- **Info**: `#2196F3`

## 🔧 Configuración

### Archivo de Configuración (`config.js`)
```javascript
THEMES: {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto'
},
DEFAULT_THEME: 'auto'  // Tema por defecto
```

### Personalización de Colores (`colors.js`)
```javascript
// Personalizar tema claro
const LightTheme = {
  background: '#CUSTOM_COLOR',
  // ... más colores
};

// Personalizar tema oscuro
const DarkTheme = {
  background: '#CUSTOM_COLOR',
  // ... más colores
};
```

## 📱 Integración en Componentes

### Actualizar StatusBar
```javascript
import { useTheme } from '../contexts/ThemeContext';

const MyScreen = () => {
  const { isDark } = useTheme();
  
  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      {/* Resto del componente */}
    </>
  );
};
```

### Estilos Dinámicos
```javascript
const createStyles = (theme) => StyleSheet.create({
  container: {
    backgroundColor: theme.background,
    borderColor: theme.border,
  },
  text: {
    color: theme.textPrimary,
  },
});

const MyComponent = () => {
  const theme = useThemeColors();
  const styles = createStyles(theme);
  // ...
};
```

## 🎯 Beneficios del Sistema

✅ **Experiencia de Usuario Mejorada**
- Menos fatiga visual en condiciones de poca luz
- Respeta las preferencias del sistema del usuario
- Transiciones suaves y naturales

✅ **Accesibilidad**
- Mejor contraste en ambos temas
- Soporte para usuarios con sensibilidad a la luz
- Cumple con estándares de accesibilidad

✅ **Eficiencia Energética**
- Tema oscuro ahorra batería en pantallas OLED
- Menor emisión de luz azul

✅ **Flexibilidad de Desarrollo**
- Sistema fácil de extender
- Colores centralizados y reutilizables
- Compatibilidad con componentes existentes

## 🔄 Estados del Tema

1. **Light Mode**: Tema claro fijo
2. **Dark Mode**: Tema oscuro fijo  
3. **Auto Mode**: Sigue el sistema operativo
   - Detecta cambios automáticamente
   - Se adapta en tiempo real
   - Respeta horarios del sistema

## 📍 Ubicación de Archivos

```
src/
├── config/
│   ├── config.js         # Configuración de temas
│   └── colors.js         # Definición de paletas
├── contexts/
│   └── ThemeContext.js   # Contexto y lógica de temas
├── components/
│   └── ThemeSelector.js  # Selector de tema UI
└── hooks/
    └── useTheme.js       # (incluido en ThemeContext.js)
```

El sistema está completamente implementado y listo para usar en toda la aplicación.
