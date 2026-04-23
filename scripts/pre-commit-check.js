#!/usr/bin/env node

/**
 * Pre-commit hook para verificar codificación UTF-8
 * Evita que se commiteen archivos con caracteres rotos
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Patrones de caracteres rotos que no deben estar en el código
const BROKEN_PATTERNS = [
  /Ã[\w]/g,      // Vocales con tilde mal codificadas
  /â€/g,         // Guiones mal codificados
  /â„/g,         // Comillas mal codificadas
  /â„¢/g,        // Símbolos mal codificados
  /Â/g,          // Espacios mal codificados
  /ðŸ/g,         // Emojis mal codificados
  /âœ/g,         // Checkmarks mal codificados
  /â†/g,         // Flechas mal codificadas
  /\ufeff/g,     // BOM (Byte Order Mark)
];

function checkFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const relativePath = path.relative(process.cwd(), filePath);

    for (const pattern of BROKEN_PATTERNS) {
      if (pattern.test(content)) {
        console.error(`❌ ${relativePath}: Contiene caracteres mal codificados`);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error(`⚠️  Error leyendo ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('🔍 Verificando codificación UTF-8 antes del commit...\n');

  // Obtener archivos staged para commit
  let stagedFiles;
  try {
    stagedFiles = execSync('git diff --cached --name-only', { encoding: 'utf-8' })
      .split('\n')
      .filter(file => file.trim() && 
        (file.endsWith('.html') || file.endsWith('.js') || file.endsWith('.css')) &&
        !file.includes('scripts/') // Excluir scripts de utilidad que contienen patrones de limpieza
      );
  } catch (error) {
    console.error('❌ Error obteniendo archivos staged');
    process.exit(1);
  }

  if (stagedFiles.length === 0) {
    console.log('ℹ️  No hay archivos HTML/JS/CSS para verificar');
    return;
  }

  let allGood = true;
  for (const file of stagedFiles) {
    if (!checkFile(file)) {
      allGood = false;
    }
  }

  if (!allGood) {
    console.error('\n🚫 Commit bloqueado: Corrige los caracteres mal codificados antes de hacer commit');
    console.error('💡 Ejecuta: node scripts/deep-clean-encoding.js');
    process.exit(1);
  }

  console.log('✅ Todos los archivos tienen codificación correcta');
}

// Ejecutar solo si se llama directamente
if (require.main === module) {
  main();
}

module.exports = { checkFile, BROKEN_PATTERNS };