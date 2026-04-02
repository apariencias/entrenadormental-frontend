// scripts/inject-stripe-key.js
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const TARGET = path.join(ROOT, 'js', 'landing-calma.js');
const MARKER = '_STRIPE_PUBLISHABLE_KEY_';

const key = process.env.STRIPE_PUBLISHABLE_KEY?.trim();

if (!key) {
  console.error('ERROR CRÍTICO: La variable de entorno STRIPE_PUBLISHABLE_KEY no está definida.');
  process.exit(1);
}

if (!key.startsWith('pk_')) {
  console.error('ERROR CRÍTICO: STRIPE_PUBLISHABLE_KEY debe ser una clave pública (comienza con "pk_").');
  process.exit(1);
}

try {
  let source = fs.readFileSync(TARGET, 'utf8');
  if (!source.includes(MARKER)) {
    console.error(`ERROR CRÍTICO: No se encontró el marcador "${MARKER}" en el archivo ${TARGET}.`);
    process.exit(1);
  }
  source = source.replace(MARKER, key);
  fs.writeFileSync(TARGET, source, 'utf8');
  console.log(`✅ Build OK: Clave de Stripe inyectada correctamente.`);
} catch (error) {
  console.error(`ERROR CRÍTICO al procesar el archivo: ${error.message}`);
  process.exit(1);
}