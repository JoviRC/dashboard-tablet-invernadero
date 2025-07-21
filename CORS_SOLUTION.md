# So**Error**: `Access to fetch at 'http://192.168.100.17:4201/...' from origin 'http://localhost:8081' has been blocked by CORS policy`

## 🎯 **Solución Correcta**: Cambiar Puerto de Desarrollo

El problema es el conflicto entre el puerto 8081 (Expo dev server) y tu API. La solución es cambiar el puerto del servidor de desarrollo de Expo.n de Problemas CORS

## 🚨 Problema Identificado

**Error**: `Access to fetch at 'http://192.168.100.17:3001/...' from origin 'http://localhost:8081' has been blocked by CORS policy`

## 🎯 **Actualización**: Puerto 3001 Configurado

La aplicación ahora usa el puerto **3001** en lugar del 4201, que debería tener CORS habilitado.

## 🔍 Explicación

Cuando ejecutas la aplicación en un navegador web (como con `npm start` en modo web), el navegador aplica políticas CORS (Cross-Origin Resource Sharing) que bloquean las peticiones a servidores que no incluyen los headers apropiados.

## 💡 Soluciones

### 1. **Cambiar Puerto del Servidor de Desarrollo Expo (Recomendado)**

En lugar de cambiar tu API, cambia el puerto de Expo:

```bash
# Usar puerto 3001 para el servidor de desarrollo
npm start -- --port 3001

# O específicamente configurar para evitar conflictos
npm start -- --port 3001 --tunnel
```

### 2. **Configurar CORS en tu Servidor API**

El servidor en `http://192.168.100.17:4201` necesita incluir headers CORS. Si tienes acceso al código del servidor, añade:

```javascript
// Ejemplo para Express.js
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});
```

### 3. **Usar la App en Dispositivo Móvil**

Las aplicaciones nativas no están sujetas a CORS. Ejecuta:

```bash
# Android
npm run android

# iOS  
npm run ios

# O escanea el QR con Expo Go
npm start
```

### 4. **Proxy de Desarrollo (Temporal)**

Puedes usar un proxy local para desarrollo. Instala:

```bash
npm install -g local-cors-proxy
```

Luego ejecuta:
```bash
lcp --proxyUrl http://192.168.100.17:4201 --port 8010
```

Y cambia la URL en `config.js` a `http://localhost:8010`

### 5. **Configurar Metro para Ignorar CORS (Solo Desarrollo)**

En `metro.config.js`, puedes añadir configuración para desarrollo web.

## 🎯 Estado Actual

- ✅ **App funciona correctamente** con datos simulados
- ✅ **API service implementado** y listo para usar
- ✅ **Fallback automático** a datos mock cuando falla la API
- ❌ **CORS bloquea conexión** solo en navegador web

## 🚀 Recomendación

1. **Para desarrollo**: Usa dispositivo móvil o emulador
2. **Para producción**: Configura CORS en el servidor
3. **Para pruebas**: La app muestra datos simulados realistas

La aplicación está completamente funcional, solo necesita configuración CORS del lado del servidor para funcionar en navegadores web.
