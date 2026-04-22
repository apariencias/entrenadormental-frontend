#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Verifica que los archivos estén correctamente codificados en UTF-8
 * y que no contengan caracteres rotos
 */
const brokenPatterns = [
  /Ã¡/g,  // á
  /Ã©/g,  // é
  /Ã­/g,  // í
  /Ã³/g,  // ó
  /Ãº/g,  // ú
  /Ã±/g,  // ñ
  /â€"/g, // en dash
  /â€\x9d/g, // comilla
];

/**
 * Verifica un archivo específico
 */
function verifyFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    let issuesFound = 0;
    
    for (const pattern of brokenPatterns) {
      if (pattern.test(content)) {
        issuesFound++;
      }
    }
    
    if (issuesFound > 0) {
      console.log(`❌ ${path.relative(process.cwd(), filePath)} - ${issuesFound} patrón(es) roto(s) encontrado(s)`);
      return false;
    } else {
      console.log(`✅ ${path.relative(process.cwd(), filePath)}`);
      return true;
    }
  } catch (error) {
    console.error(`⚠️  Error leyendo ${path.relative(process.cwd(), filePath)}:`, error.message);
    return false;
  }
}

/**
 * Verifica que meta charset esté presente en archivos HTML
 */
function verifyMetaCharset(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    if (!content.includes('<meta charset="UTF-8">')) {
      console.log(`⚠️  ${path.relative(process.cwd(), filePath)} - Falta <meta charset="UTF-8">`);
      return false;
    }
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Main
 */
function main() {
  const rootDir = path.join(__dirname, '..');
  const filesToCheck = [
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
  ];

  console.log('🔍 Verificando codificación UTF-8...\n');
  
  let allGood = true;
  
  // Verificar archivos HTML por meta charset
  const htmlFiles = filesToCheck.filter(f => f.endsWith('.html'));
  console.log('📄 Verificando meta charset en HTML:\n');
  for (const file of htmlFiles) {
    const fullPath = path.join(rootDir, file);
    if (fs.existsSync(fullPath)) {
      if (!verifyMetaCharset(fullPath)) {
        allGood = false;
      }
    }
  }
  
  console.log('\n📋 Verificando contenido UTF-8 correcto:\n');
  for (const file of filesToCheck) {
    const fullPath = path.join(rootDir, file);
    if (fs.existsSync(fullPath)) {
      if (!verifyFile(fullPath)) {
        allGood = false;
      }
    }
  }
  
  if (allGood) {
    console.log('\n✨ ¡Todos los archivos están correctamente codificados en UTF-8!');
  } else {
    console.log('\n⚠️  Se encontraron algunos problemas. Por favor, revisa arriba.');
  }
}

main();
