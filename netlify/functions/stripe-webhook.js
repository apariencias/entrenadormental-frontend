// netlify/functions/stripe-webhook.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

exports.handler = async (event) => {
    const sig = event.headers['stripe-signature'];
    let webhookEvent;

    try {
        webhookEvent = stripe.webhooks.constructEvent(event.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.log(`Webhook signature verification failed.`, err.message);
        return { statusCode: 400 };
    }

    if (webhookEvent.type === 'checkout.session.completed') {
        const session = webhookEvent.data.object;

        // CAMBIO CLAVE: Leemos los datos desde los metadatos
        const customerName = session.metadata.customer_name;
        const customerWhatsapp = session.metadata.customer_whatsapp;
        const customerEmail = session.customer_details.email;

        console.log(`¡Pago exitoso para ${customerName} (${customerEmail})!`);
        console.log(`WhatsApp: ${customerWhatsapp}`);

        const mailOptions = {
            from: `"Tu Nombre o Empresa" <${process.env.SMTP_USER}>`,
            to: customerEmail,
            subject: '¡Bienvenido! Tu compra ha sido confirmada',
            text: `Hola ${customerName},\n\nGracias por tu compra. Ya tienes acceso a nuestro producto.\n\nID de la transacción: ${session.id}\n\nNos pondremos en contacto contigo al WhatsApp ${customerWhatsapp} si es necesario.\n\n¡Que lo disfrutes!`,
            html: `<p>Hola <strong>${customerName}</strong>,</p><p>Gracias por tu compra. Ya tienes acceso a nuestro producto.</p><p>ID de la transacción: <em>${session.id}</em></p><p>Nos pondremos en contacto contigo al WhatsApp <strong>${customerWhatsapp}</strong> si es necesario.</p><p>¡Que lo disfrutes!</p>`,
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log('Correo de confirmación enviado a:', customerEmail);
            return { statusCode: 200 };
        } catch (emailError) {
            console.error('Error al enviar el correo:', emailError);
            return { statusCode: 500, body: 'Failed to send email' };
        }
    }

    return { statusCode: 200 };
};