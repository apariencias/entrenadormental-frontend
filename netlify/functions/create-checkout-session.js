// netlify/functions/create-checkoutsession.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const ALLOWED_PRICE_IDS = [
    'price_1TB01m49pVvXIqaguJHNWTsQ' 
];

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // CAMBIO CLAVE: Ahora extraemos todos los datos del body
        const { customerEmail, customerName, customerWhatsapp } = JSON.parse(event.body);

        const priceId = ALLOWED_PRICE_IDS[0];

        const session = await stripe.checkout.sessions.create({
            customer_email: customerEmail,
            payment_method_types: ['card'],
            line_items: [{ price: priceId, quantity: 1 }],
            mode: 'payment',
            success_url: `${process.env.SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,
            // CAMBIO CLAVE: Añadimos los datos a los metadatos
            metadata: {
                customer_name: customerName,
                customer_whatsapp: customerWhatsapp,
            },
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ url: session.url }),
        };

    } catch (error) {
        console.error("Error al crear la sesión de Stripe:", error);
        return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error' }) };
    }
};