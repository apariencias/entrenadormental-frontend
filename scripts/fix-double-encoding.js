#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Reinterpreta bytes UTF-8 decodificados como Latin-1 de vuelta a UTF-8
 * Esto ocurre cuando un texto UTF-8 se lee como Latin-1
 */
function fixDoubleEncoding(text) {
  // Convertir de vuelta mediante iconv equivalente manual
  // Patrones específicos de double-encoding
  return text
    // Em dashes y guiones
    .replace(/â€"/g, '\u2013')      // en dash (U+2013)
    .replace(/â€"/g, '\u2014')      // em dash (U+2014)
    .replace(/â€"-/g, '\u2013')     // variante
    
    // Comillas y apóstrofes
    .replace(/â€˜/g, '\u2018')      // izquierda
    .replace(/â€™/g, '\u2019')      // derecha
    .replace(/â€œ/g, '\u201c')      // doble izquierda
    .replace(/â€\x9d/g, '\u201d')   // doble derecha
    
    // Símbolos
    .replace(/â€¢/g, '\u2022')      // bullet
    .replace(/â„¢/g, '\u2122')      // trade mark
    .replace(/Â/g, '')              // espacio vacío
    
    // Acentos (ya debería estar hecho, pero por si acaso)
    .replace(/Ã¡/g, 'á')
    .replace(/Ã©/g, 'é')
    .replace(/Ã­/g, 'í')
    .replace(/Ã³/g, 'ó')
    .replace(/Ãº/g, 'ú')
    .replace(/Ã /g, 'à')
    .replace(/Ã¨/g, 'è')
    .replace(/Ã¬/g, 'ì')
    .replace(/Ã²/g, 'ò')
    .replace(/Ã¹/g, 'ù')
    .replace(/Ã±/g, 'ñ')
    .replace(/Ã§/g, 'ç');
}

/**
 * Procesa un archivo
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const fixed = fixDoubleEncoding(content);
    
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

function main() {
  const rootDir = path.join(__dirname, '..');
  const filesToProcess = [
    'index.html',
    'la-calma-de-mama.html',
    'pareja-ideal.html',
    'cancel.html',
    'success.html',
    'mentoria.html',
    'netlify/functions/create-checkout-session.js',
    'netlify/functions/send-welcome.js',
    'netlify/functions/send-contact.js',
    'netlify/functions/stripe-webhook.js',
    'js/form-validation.js',
    'flow-field.js',
    'css/style.css',
  ];

  console.log('🔧 Corrigiendo double-encoding UTF-8...\n');
  
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
