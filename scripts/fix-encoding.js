#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Mapa de caracteres mal codificados (UTF-8 decodificado como Latin-1)
 */
const encodingMap = [
  // Vocales con tilde
  ['Ã¡', 'á'],
  ['Ã©', 'é'],
  ['Ã­', 'í'],
  ['Ã³', 'ó'],
  ['Ãº', 'ú'],
  ['Ã ', 'à'],
  ['Ã¨', 'è'],
  ['Ã¬', 'ì'],
  ['Ã²', 'ò'],
  ['Ã¹', 'ù'],
  ['Ã±', 'ñ'],
  ['Ã§', 'ç'],
  
  // Caracteres especiales - Em dash y variantes
  ['â€"', '–'],
  ['â€"', '–'],
  ['â€"', '–'],
  ['â€™', '\''],
  ['â€œ', '"'],
  ['â€\x9d', '"'],
  ['â„¢', '™'],
  ['â€¢', '•'],
  ['Â', ''],
  
  // Comillas adicionales
  ['â€˜', '\''],
];

/**
 * Reemplaza todos los caracteres mal codificados en un texto
 */
function fixEncoding(text) {
  let result = text;
  
  for (const [broken, correct] of encodingMap) {
    const regex = new RegExp(broken.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    result = result.replace(regex, correct);
  }
  
  return result;
}

/**
 * Procesa un archivo específico
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const fixed = fixEncoding(content);
    
    if (content !== fixed) {
      fs.writeFileSync(filePath, fixed, 'utf-8');
      console.log(`✅ Corregido: ${path.relative(process.cwd(), filePath)}`);
      return true;
    } else {
      console.log(`ℹ️  Sin cambios: ${path.relative(process.cwd(), filePath)}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error en ${path.relative(process.cwd(), filePath)}:`, error.message);
    return false;
  }
}

/**
 * Busca y procesa todos los archivos HTML, JS con problemas de codificación
 */
function main() {
  const rootDir = path.join(__dirname, '..');
  const filesToProcess = [
    // HTML files
    'index.html',
    'la-calma-de-mama.html',
    'pareja-ideal.html',
    'cancel.html',
    'success.html',
    'mentoria.html',
    
    // Netlify functions
    'netlify/functions/create-checkout-session.js',
    'netlify/functions/send-welcome.js',
    'netlify/functions/send-contact.js',
    'netlify/functions/stripe-webhook.js',
    
    // Other JS
    'js/form-validation.js',
    'flow-field.js',
  ];

  console.log('🔧 Iniciando corrección de codificación UTF-8...\n');
  
  let fixedCount = 0;
  for (const file of filesToProcess) {
    const fullPath = path.join(rootDir, file);
    if (fs.existsSync(fullPath)) {
      if (processFile(fullPath)) {
        fixedCount++;
      }
    } else {
      console.log(`⚠️  No encontrado: ${file}`);
    }
  }
  
  console.log(`\n✨ Proceso completado. ${fixedCount} archivo(s) corregido(s).`);
}

main();
