#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Mapa EXHAUSTIVO de todos los problemas de encoding encontrados
 * Incluye patterns UTF-8 mal decodificados y emojis rotos
 */
const ENCODING_FIXES = [
  // Emojis mal codificados
  [/ðŸ[A-Za-z0-9]{2}/g, '*'],  // Emojis UTF-8 decodificados como UTF-16
  [/ðŸ/g, '*'],
  
  // Acentos vowel (estos SÍ funcionan, pero asegurar)
  [/SÃ([^a-z])/g, 'SÍ$1'],
  [/SÃ$/g, 'SÍ'],
  
  // Acentos comunes (UTF-8 decodificados como Latin-1)
  [/Ã¡/g, 'á'],  // á
  [/Ã©/g, 'é'],  // é
  [/Ã­/g, 'í'],  // í
  [/Ã³/g, 'ó'],  // ó
  [/Ãº/g, 'ú'],  // ú
  [/Ã /g, 'à'],  // à
  [/Ã¨/g, 'è'],  // è
  [/Ã¬/g, 'ì'],  // ì
  [/Ã²/g, 'ò'],  // ò
  [/Ã¹/g, 'ù'],  // ù
  [/Ã±/g, 'ñ'],  // ñ
  [/Ã§/g, 'ç'],  // ç
  
  // Mayúsculas con acento
  [/Ã\(/g, 'À'],  // À
  [/ÃŠ/g, 'È'],   // È
  [/Ã\\/g, 'Ì'],  // Ì
  [/ÃŒ/g, 'Ò'],   // Ò
  [/Ã™/g, 'Ù'],   // Ù
  [/Ã‰/g, 'É'],   // É
  
  // TIPOGRAFÍA (específico del archivo)
  [/TIPOGRAFÃA/g, 'TIPOGRAFÍA'],
  
  // Dashes y guiones
  [/â€"/g, '–'],   // en dash
  [/â€"/g, '—'],   // em dash
  [/â€"-/g, '–'],
  
  // Comillas y apóstrofes (usando unicode escapes)
  [/â€˜/g, '\u2018'],   // comilla izquierda
  [/â€™/g, '\u2019'],   // comilla derecha
  [/â€œ/g, '\u201c'],   // doble izquierda
  [/â€\x9d/g, '\u201d'], // doble derecha
  
  // Símbolos
  [/â€¢/g, '•'],   // bullet
  [/â„¢/g, '™'],   // trade mark
  [/â"/g, '–'],
  
  // Espacios raros
  [/Â/g, ''],      // espacio sin break
];

/**
 * Limpia un archivo de todos los errores de encoding
 */
function cleanFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    const originalContent = content;
    
    let changeCount = 0;
    
    for (const [pattern, replacement] of ENCODING_FIXES) {
      const matches = content.match(pattern);
      if (matches) {
        changeCount += matches.length;
        content = content.replace(pattern, replacement);
      }
    }
    
    // Escribir el archivo SIEMPRE como UTF-8 sin BOM
    if (changeCount > 0) {
      fs.writeFileSync(filePath, content, { encoding: 'utf-8' });
      console.log(`✅ ${path.relative(process.cwd(), filePath)}`);
      console.log(`   → ${changeCount} ocurrencia(s) corregida(s)`);
      return true;
    } else {
      console.log(`ℹ️  ${path.relative(process.cwd(), filePath)} - Sin cambios`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error en ${path.relative(process.cwd(), filePath)}:`, error.message);
    return false;
  }
}

function main() {
  const files = [
    'index.html',
    'la-calma-de-mama.html',
    'pareja-ideal.html',
    'cancel.html',
    'success.html',
    'mentoria.html',
    'css/style.css',
  ];

  console.log('🔧 LIMPIEZA EXHAUSTIVA DE ENCODING...\n');
  
  let totalFixed = 0;
  for (const file of files) {
    if (fs.existsSync(file)) {
      if (cleanFile(file)) {
        totalFixed++;
      }
    }
  }
  
  console.log(`\n✨ Proceso completado: ${totalFixed} archivo(s) corregido(s)`);
}

main();
