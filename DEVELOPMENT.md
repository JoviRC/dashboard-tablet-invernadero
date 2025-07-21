# Configuración de Desarrollo

## Para ejecutar en diferentes plataformas:

### 📱 Dispositivo Móvil (Recomendado para API)
```bash
# Android
npm run android

# iOS
npm run ios

# O escanear QR con Expo Go
npm start
# Luego escanear el código QR
```

### 🌐 Navegador Web (Cambiar puerto para evitar CORS)
```bash
# Usar puerto diferente para evitar conflicto con API
npm start -- --port 3001
# Presionar 'w' para abrir en web
# Nota: Esto evita conflictos de puerto con tu API en 4201
```

### 🔧 Variables de Entorno

Puedes crear un archivo `.env` para diferentes entornos:

```bash
# .env.development
API_BASE_URL=http://192.168.100.17:4201

# .env.production  
API_BASE_URL=https://tu-servidor-produccion.com
```

### 🚀 Scripts Útiles

```bash
# Limpiar cache
npm start -- --clear

# Ver logs en tiempo real
npx react-native log-android
npx react-native log-ios

# Compilar para producción
npm run build
```

### 📊 Monitoreo y Debug

1. **Metro Bundler**: `http://localhost:8081`
2. **React Native Debugger**: Para debug avanzado
3. **Flipper**: Para debug de red y estado
4. **Console logs**: En la consola de desarrollo

### 🔌 Configuración de Red

Para desarrollo local, asegúrate que:
- El dispositivo esté en la misma red WiFi
- El firewall permita conexiones al puerto 4201
- El servidor esté ejecutándose en `192.168.100.17:4201`
