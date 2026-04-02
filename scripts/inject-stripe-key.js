// scripts/inject-stripe-key.js (Versión de Diagnóstico Total)
const fs = require('fs');
const path = require('path');

console.log("🚀 === INICIANDO SCRIPT DE DIAGNÓSTICO TOTAL ===");

// 1. Imprimir el entorno de variables
console.log("\n🔍 1. ENTORNO DE VARIABLES:");
console.log(`   - STRIPE_PUBLISHABLE_KEY está definida?: ${process.env.STRIPE_PUBLISHABLE_KEY ? 'SÍ' : 'NO'}`);
if (process.env.STRIPE_PUBLISHABLE_KEY) {
  console.log(`   - Valor (primeros 10 caracteres): "${process.env.STRIPE_PUBLISHABLE_KEY.substring(0, 10)}..."`);
  console.log(`   - La clave empieza con 'pk_'?: ${process.env.STRIPE_PUBLISHABLE_KEY.startsWith('pk_') ? 'SÍ' : 'NO'}`);
}

// 2. Imprimir la estructura de archivos que ve el script
console.log("\n🔍 2. ESTRUCTURA DE ARCHIVOS:");
const ROOT = path.join(__dirname, '..');
console.log(`   - Directorio raíz del proyecto (ROOT): ${ROOT}`);
try {
  const rootContents = fs.readdirSync(ROOT);
  console.log(`   - Contenido de ROOT: ${rootContents}`);
  if (rootContents.includes('js')) {
    const jsContents = fs.readdirSync(path.join(ROOT, 'js'));
    console.log(`   - Contenido de la carpeta /js: ${jsContents}`);
  } else {
    console.log(`   - ❌ ERROR: La carpeta /js NO existe en el directorio raíz.`);
  }
} catch (e) {
  console.error(`   - ❌ ERROR al leer directorios: ${e.message}`);
}

// 3. Analizar el archivo objetivo
const TARGET_PATH = path.join(ROOT, 'js', 'landing-calma.js');
console.log(`\n🔍 3. ANÁLISIS DEL ARCHIVO OBJETIVO:`);
console.log(`   - Ruta completa del archivo buscado: ${TARGET_PATH}`);
if (!fs.existsSync(TARGET_PATH)) {
  console.error(`   - ❌ ERROR FATAL: El archivo 'landing-calma.js' NO existe en la ruta especificada.`);
  process.exit(2); // Salimos con un código de error específico.
}
console.log(`   - ✅ Archivo 'landing-calma.js' encontrado.`);

// 4. Buscar el marcador DENTRO del archivo
const MARKER = '_STRIPE_PUBLISHABLE_KEY_';
const source = fs.readFileSync(TARGET_PATH, 'utf8');
console.log(`   - ¿El archivo contiene el marcador "${MARKER}"?: ${source.includes(MARKER) ? 'SÍ' : 'NO'}`);
if (!source.includes(MARKER)) {
  console.error(`   - ❌ ERROR FATAL: El marcador NO fue encontrado dentro del archivo.`);
  console.error(`   - Primeros 200 caracteres del archivo para tu revisión:\n---\n${source.substring(0, 200)}\n---`);
  process.exit(3); // Salimos con otro código de error específico.
}

// 5. Si todo lo anterior funcionó, ejecutar la inyección
console.log("\n🚀 === TODAS LAS VERIFICACIONES FUERON EXITOSAS. EJECUTANDO INYECCIÓN ===");
const key = process.env.STRIPE_PUBLISHABLE_KEY?.trim();
if (!key || !key.startsWith('pk_')) {
  // Esto no debería pasar si las verificaciones de arriba funcionaron, pero es un último resguardo.
  console.error(`   - ❌ ERROR INESPERADO: La clave es inválida.`);
  process.exit(1);
}
const newSource = source.replace(MARKER, key);
fs.writeFileSync(TARGET_PATH, newSource, 'utf8');
console.log(`✅ Build OK: Clave de Stripe inyectada correctamente.`);