// netlify/functions/create-checkout-session.js
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const ALLOWED_PRICE_IDS = ["price_1TB01m49pVvXIqaguJHNWTsQ"];

function jsonResponse(statusCode, payload) {
    return {
        statusCode,
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify(payload),
    };
}

exports.handler = async (event) => {
    if (event.httpMethod !== "POST") {
        return jsonResponse(405, { error: "Método no permitido" });
    }

    let body;
    try {
        body = event.body ? JSON.parse(event.body) : {};
    } catch {
        return jsonResponse(400, { error: "Cuerpo JSON inválido" });
    }

    const customerName = typeof body.customerName === "string" ? body.customerName.trim() : "";
    const customerEmail = typeof body.customerEmail === "string" ? body.customerEmail.trim() : "";
    const customerWhatsapp =
        typeof body.customerWhatsapp === "string" ? body.customerWhatsapp.trim() : "";

    if (!customerName || !customerEmail || !customerWhatsapp) {
        return jsonResponse(400, {
            error: "Faltan datos obligatorios: nombre, correo y WhatsApp son requeridos.",
        });
    }

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail);
    if (!emailOk) {
        return jsonResponse(400, { error: "El correo electrónico no es válido." });
    }

    const priceId = ALLOWED_PRICE_IDS[0];
    if (!priceId) {
        console.error("ALLOWED_PRICE_IDS está vacío");
        return jsonResponse(500, { error: "Configuración del servidor incompleta." });
    }

    const successUrl = process.env.SUCCESS_URL;
    if (!successUrl) {
        console.error("Falta SUCCESS_URL en el entorno");
        return jsonResponse(500, { error: "Configuración del servidor incompleta." });
    }

    const cancelUrl =
        process.env.CANCEL_URL ||
        (process.env.URL ? `${process.env.URL.replace(/\/$/, "")}/cancel.html` : null);
    if (!cancelUrl) {
        console.error("Falta CANCEL_URL y URL (Netlify) para construir la URL de cancelación");
        return jsonResponse(500, { error: "Configuración del servidor incompleta." });
    }

    try {
        const session = await stripe.checkout.sessions.create({
            customer_email: customerEmail,
            payment_method_types: ["card"],
            line_items: [{ price: priceId, quantity: 1 }],
            mode: "payment",
            success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: cancelUrl,
            // Metadatos visibles en Stripe Dashboard → Payment / Checkout Session
            metadata: {
                customerName,
                customerEmail,
                customerWhatsapp,
            },
        });

        return jsonResponse(200, { url: session.url });
    } catch (err) {
        console.error("Error al crear la sesión de Stripe:", err);
        return jsonResponse(500, {
            error: "No se pudo iniciar el pago. Intenta de nuevo más tarde.",
        });
    }
};
