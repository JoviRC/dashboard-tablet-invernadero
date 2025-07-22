#!/usr/bin/env node

/**
 * Script de prueba para el sistema de control automático del ventilador
 * Ejecutar con: node test-ventilator-control.js
 */

const API_BASE_URL = 'http://192.168.100.17:4201';
const TUYA_API_URL = 'https://px1.tuyaeu.com/homeassistant/skill';

console.log('🌀 === PRUEBA DE CONTROL AUTOMÁTICO DEL VENTILADOR ===');
console.log(`📡 API Base: ${API_BASE_URL}`);
console.log(`🏠 Tuya API: ${TUYA_API_URL}`);
console.log('');

async function testGetDevices() {
  try {
    console.log('1️⃣ Probando obtener dispositivos del usuario...');
    
    const response = await fetch(`${API_BASE_URL}/ControllerDHT11/GetDispositivosForUser?user=1`);
    const data = await response.json();
    
    console.log(`✅ Respuesta recibida: ${data.length} dispositivos`);
    
    const switches = data.filter(device => {
      const deviceName = (device.nombre || device.name || '').toLowerCase();
      return deviceName.includes('switch') || deviceName.includes('ventilador') || deviceName.includes('fan');
    });
    
    console.log(`🔌 Switches encontrados: ${switches.length}`);
    switches.forEach(s => {
      console.log(`   - ${s.nombre || s.name} (ID: ${s.id}, MAC: ${s.macAddress})`);
    });
    
    return switches;
  } catch (error) {
    console.error('❌ Error obteniendo dispositivos:', error.message);
    return [];
  }
}

async function testGetUserToken() {
  try {
    console.log('\\n2️⃣ Probando obtener token del usuario...');
    
    const response = await fetch(`${API_BASE_URL}/ControllerUser/GetUserToken?userId=1`);
    const data = await response.json();
    
    const token = data.accessToken || data.token || data.access_token;
    
    if (token) {
      console.log(`✅ Token obtenido: ${token.substring(0, 10)}...`);
      return token;
    } else {
      console.warn('⚠️ No se encontró token en la respuesta');
      return 'DEV_TOKEN_PLACEHOLDER_REPLACE_WITH_REAL_TOKEN';
    }
  } catch (error) {
    console.error('❌ Error obteniendo token:', error.message);
    console.log('🔄 Usando token de desarrollo');
    return 'DEV_TOKEN_PLACEHOLDER_REPLACE_WITH_REAL_TOKEN';
  }
}

async function testControlTuyaDevice(macAddress, state, token) {
  try {
    console.log(`\\n3️⃣ Probando control Tuya: ${macAddress} -> ${state ? 'ON' : 'OFF'}...`);
    
    const requestBody = {
      header: {
        name: "turnOnOff",
        namespace: "control",
        payloadVersion: 1
      },
      payload: {
        accessToken: token,
        devId: macAddress,
        value: state ? 1 : 0
      }
    };
    
    console.log('📤 Enviando request:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(TUYA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    
    const data = await response.json();
    
    console.log('📥 Respuesta recibida:', JSON.stringify(data, null, 2));
    
    if (data.header && data.header.code === 'SUCCESS') {
      console.log('✅ Control exitoso');
      return true;
    } else {
      console.log('❌ Control falló:', data.header?.code || 'UNKNOWN_ERROR');
      return false;
    }
  } catch (error) {
    console.error('❌ Error en control Tuya:', error.message);
    return false;
  }
}

async function runFullTest() {
  console.log('🚀 Iniciando prueba completa...\\n');
  
  // Paso 1: Obtener dispositivos
  const switches = await testGetDevices();
  
  if (switches.length === 0) {
    console.log('\\n⚠️ No se encontraron switches para probar. Terminando.');
    return;
  }
  
  // Paso 2: Obtener token
  const token = await testGetUserToken();
  
  // Paso 3: Probar control (encender)
  const firstSwitch = switches[0];
  const macAddress = firstSwitch.macAddress || firstSwitch.macaddress || firstSwitch.mac;
  
  if (!macAddress) {
    console.log('\\n❌ El primer switch no tiene macAddress. Terminando.');
    return;
  }
  
  console.log(`\\n🎯 Probando con dispositivo: ${firstSwitch.nombre || firstSwitch.name}`);
  console.log(`📍 MAC Address: ${macAddress}`);
  
  // Encender
  const turnOnResult = await testControlTuyaDevice(macAddress, true, token);
  
  // Esperar un poco
  console.log('\\n⏳ Esperando 3 segundos...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Apagar
  const turnOffResult = await testControlTuyaDevice(macAddress, false, token);
  
  // Resumen
  console.log('\\n📊 === RESUMEN DE PRUEBAS ===');
  console.log(`🔌 Dispositivos encontrados: ${switches.length}`);
  console.log(`🔑 Token obtenido: ${token ? 'Sí' : 'No'}`);
  console.log(`🟢 Encender dispositivo: ${turnOnResult ? 'Exitoso' : 'Falló'}`);
  console.log(`🔴 Apagar dispositivo: ${turnOffResult ? 'Exitoso' : 'Falló'}`);
  
  const allSuccess = switches.length > 0 && token && turnOnResult && turnOffResult;
  console.log(`\\n${allSuccess ? '🎉' : '⚠️'} Estado general: ${allSuccess ? 'TODO EXITOSO' : 'HAY PROBLEMAS'}`);
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runFullTest().catch(error => {
    console.error('💥 Error crítico:', error);
    process.exit(1);
  });
}

module.exports = { testGetDevices, testGetUserToken, testControlTuyaDevice, runFullTest };
