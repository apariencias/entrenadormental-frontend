// netlify/functions/create-checkout-session.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Lista de precios permitidos para este producto. ¡Esto evita que manipulen el precio!
const ALLOWED_PRICE_IDS = [
    'price_1TB01m49pVvXIqaguJHNWTsQ' // Pega aquí tu ID de precio real
];

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { customerEmail } = JSON.parse(event.body);

        // Usamos el primer (y único) precio de nuestra lista de permitidos.
        const priceId = ALLOWED_PRICE_IDS[0];

        const session = await stripe.checkout.sessions.create({
            customer_email: customerEmail,
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ url: session.url }),
        };

    } catch (error) {
        console.error("Error al crear la sesión de Stripe:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error' }),
        };
    }
};