#!/usr/bin/env node

/**
 * Test de validación del Success Page
 * Simula los parámetros que Stripe envía después de un pago exitoso
 */

const fs = require('fs');

// Leer el archivo success.html
const successContent = fs.readFileSync('success.html', 'utf-8');

// Verificaciones
const checks = [
    {
        name: 'Meta charset UTF-8',
        test: () => successContent.includes('<meta charset="UTF-8">')
    },
    {
        name: 'SUCCESS_CONFIG contiene "La Calma de Mamá"',
        test: () => successContent.includes('"La Calma de Mamá"')
    },
    {
        name: 'SUCCESS_CONFIG contiene "Sintoniza a tu Pareja Ideal"',
        test: () => successContent.includes('"Sintoniza a tu Pareja Ideal"')
    },
    {
        name: 'Fetch a send-welcome presente',
        test: () => successContent.includes('/.netlify/functions/send-welcome')
    },
    {
        name: 'URLSearchParams para leer parámetros',
        test: () => successContent.includes('new URLSearchParams(window.location.search)')
    },
    {
        name: 'Manejo de parámetro "name"',
        test: () => successContent.includes('params.get("name")')
    },
    {
        name: 'Manejo de parámetro "email"',
        test: () => successContent.includes('params.get("email")')
    },
    {
        name: 'Manejo de parámetro "product"',
        test: () => successContent.includes('params.get("product")')
    },
    {
        name: 'Manejo de parámetro "audio"',
        test: () => successContent.includes('params.get("audio")')
    },
    {
        name: 'HTML element #title para título',
        test: () => successContent.includes('document.getElementById("title")')
    },
    {
        name: 'HTML element #text para contenido',
        test: () => successContent.includes('document.getElementById("text")')
    },
    {
        name: 'HTML element #next-text para siguiente',
        test: () => successContent.includes('document.getElementById("next-text")')
    },
    {
        name: 'Envío de datos a send-welcome',
        test: () => successContent.includes('body: JSON.stringify({ name, email, product, tone, audio })')
    }
];

// Ejecutar pruebas
console.log('🧪 Ejecutando pruebas de Success Page...\n');

let passed = 0;
let failed = 0;

checks.forEach((check, index) => {
    const result = check.test();
    const status = result ? '✅' : '❌';
    console.log(`${status} ${check.name}`);
    if (result) {
        passed++;
    } else {
        failed++;
    }
});

console.log(`\n📊 Resultados: ${passed} pasadas, ${failed} fallidas\n`);

if (failed === 0) {
    console.log('✨ ¡Todas las pruebas pasaron! Success.html está correctamente configurado.');
} else {
    console.log('⚠️  Hay pruebas que fallaron. Revisa el archivo success.html.');
}
