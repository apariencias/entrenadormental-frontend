// netlify/functions/create-checkout-session.js
// VERSIÓN MULTI-PRODUCTO: Soporte para "La Calma de Mamá" y "Sintoniza a tu Pareja Ideal"

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// =============================================================================
// 🔧 ZONA DE CONFIGURACIÓN — SOLO MODIFICA ESTOS VALORES
// =============================================================================
const PRICE_ID_CALMA = process.env.STRIPE_PRICE_ID_CALMA || "price_1TB01m49pVvXIqaguJHNWTsQ";
const PRICE_ID_PAREJA = process.env.STRIPE_PRICE_ID_PAREJA || "price_1TB01m49pVvXIqaguJHNWTsQ";

// Mapeo de ProductName → Price ID
const PRODUCT_PRICE_MAP = {
    "La Calma de Mamá": PRICE_ID_CALMA,
    "Sintoniza a tu Pareja Ideal": PRICE_ID_PAREJA,
    // Puedes agregar más productos aquí en el futuro
};

// Mapeo de ProductName → Slug para URL de cancelación
const PRODUCT_SLUG_MAP = {
    "La Calma de Mamá": "la-calma-de-mama",
    "Sintoniza a tu Pareja Ideal": "pareja-ideal",
};
const PRODUCT_AUDIO_MAP = {
    "La Calma de Mamá": "https://entrenadormental.mx/assets/audios/neuro-alineacion-inicial.mp3",
    "Sintoniza a tu Pareja Ideal": "https://entrenadormental.mx/assets/audios/sincronicidad-inicial.mp3",
};
// =============================================================================

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
    const customerWhatsapp = typeof body.customerWhatsapp === "string" ? body.customerWhatsapp.trim() : "";

    if (!customerName || !customerEmail || !customerWhatsapp) {
        return jsonResponse(400, {
            error: "Faltan datos obligatorios: nombre, correo y WhatsApp son requeridos.",
        });
    }

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail);
    if (!emailOk) {
        return jsonResponse(400, { error: "El correo electrónico no es válido." });
    }

    // =========================================================================
    // SELECCIÓN DINÁMICA DEL PRICE ID SEGÚN EL PRODUCTO
    // =========================================================================
    const productName = typeof body.productName === "string" ? body.productName.trim() : "La Calma de Mamá";
    
    const priceId = PRODUCT_PRICE_MAP[productName];
    if (!priceId) {
        console.error(`Producto no configurado: ${productName}`);
        return jsonResponse(400, { error: `El producto "${productName}" no está disponible para pago.` });
    }

    // =========================================================================
    // CONFIGURACIÓN DE URLS
    // =========================================================================
    const envBaseUrl = process.env.URL || process.env.DEPLOY_PRIME_URL || process.env.DEPLOY_URL;
    const isLocalDev = process.env.NETLIFY_DEV === "true";

    if (!envBaseUrl && !isLocalDev) {
        console.error("Falta URL (o DEPLOY_PRIME_URL / DEPLOY_URL) en el entorno");
        return jsonResponse(500, { error: "Configuración del servidor incompleta." });
    }

    const baseUrl = (envBaseUrl || "http://localhost:8888").replace(/\/$/, "");

    // SUCCESS_URL base (desde variables de entorno)
    let successUrl = process.env.SUCCESS_URL;
    if (!successUrl) {
        console.error("Falta SUCCESS_URL en el entorno");
        return jsonResponse(500, { error: "Configuración del servidor incompleta." });
    }
    if (!successUrl.startsWith('http')) {
        successUrl = `${baseUrl}/${successUrl.replace(/^\//, '')}`;
    }

    // Datos del producto para el audio (puedes personalizar por producto si quieres)
    const productTone = typeof body.productTone === "string" ? body.productTone.trim() : "f";
    const audioLink = PRODUCT_AUDIO_MAP[productName] || PRODUCT_AUDIO_MAP["La Calma de Mamá"];
    const timestamp = Date.now();

    successUrl = `${successUrl}?email=${encodeURIComponent(customerEmail)}&name=${encodeURIComponent(customerName)}&product=${encodeURIComponent(productName)}&tone=${productTone}&audio=${encodeURIComponent(audioLink)}&t=${timestamp}`;

    // CANCEL_URL: usamos el slug mapeado o generamos uno limpio como fallback
    const productSlug = PRODUCT_SLUG_MAP[productName] || productName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/ /g, "-")
        .replace(/[^a-z0-9-]/g, "");

    const cancelUrl = `${baseUrl}/${productSlug}.html?estado=cancelado`;

    // =========================================================================
    // CREACIÓN DE SESIÓN DE STRIPE
    // =========================================================================
    try {
        const metadata = {
            customerName: String(customerName),
            customerEmail: String(customerEmail),
            customerWhatsapp: String(customerWhatsapp),
            productName: String(productName),
        };

        const session = await stripe.checkout.sessions.create({
            customer_email: customerEmail,
            payment_method_types: ["card"],
            line_items: [{ price: priceId, quantity: 1 }],
            mode: "payment",
            success_url: `${successUrl}&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: cancelUrl,
            metadata,
            payment_intent_data: {
                metadata,
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