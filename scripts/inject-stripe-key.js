// scripts/inject-stripe-key.js (Versión de Producción Final)

const fs = require('fs');
const path = require('path');

// El archivo HTML que queremos modificar
const htmlFilePath = path.join(__dirname, '..', 'la-calma-de-mama.html');

// El placeholder que buscamos y la variable de entorno que lo reemplazará
const placeholder = '_STRIPE_PUBLISHABLE_KEY_';
const stripeKey = process.env.STRIPE_PUBLISHABLE_KEY;

if (!stripeKey) {
    console.error('ERROR: La variable de entorno STRIPE_PUBLISHABLE_KEY no está definida.');
    process.exit(1);
}

try {
    let htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
    const updatedContent = htmlContent.replace(new RegExp(placeholder, 'g'), stripeKey);
    fs.writeFileSync(htmlFilePath, updatedContent, 'utf8');
    console.log('✅ Clave de Stripe inyectada correctamente en la-calma-de-mama.html');
} catch (error) {
    console.error('ERROR al inyectar la clave de Stripe:', error);
    process.exit(1);
}