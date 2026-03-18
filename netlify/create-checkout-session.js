// netlify/functions/create-checkout-session.js

// 1. Importa las librerías necesarias
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// 2. Este es el "manejador" de la función. Siempre se llama así.
exports.handler = async (event) => {
  try {
    // 3. Netlify Functions no usan Express. El cuerpo de la petición
    //    viene en el objeto 'event'. Hay que parsearlo manualmente.
    const { priceId, customerEmail } = JSON.parse(event.body);

    if (!priceId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Price ID is required.' }),
      };
    }

    // 4. La lógica de Stripe es casi idéntica.
    const session = await stripe.checkout.sessions.create({
      customer_email: customerEmail,
      billing_address_collection: 'required',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CANCEL_URL}`,
    });

    // 5. Las respuestas de Netlify Functions deben tener este formato.
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Permite llamadas desde cualquier origen
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ url: session.url }),
    };

  } catch (error) {
    console.error('Error creating checkout session:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};