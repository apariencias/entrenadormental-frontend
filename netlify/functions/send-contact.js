// netlify/functions/send-contact.js
// FORMATO HORIZONTAL ORDENADO (Registro -> Datos -> Curso)

import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

export const handler = async (event) => {
  const headers = { "Content-Type": "application/json; charset=utf-8" };
  
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: 'Method Not Allowed' };
  }

  try {
    const payload = JSON.parse(event.body);
    const { name, email, whatsapp, product, answers } = payload;

    if (!name || !email) {
      return { statusCode: 400, headers, body: JSON.stringify({ message: 'Faltan datos básicos.' }) };
    }

    // =========================================================================
    // ZONA DE CONFIGURACIÓN DE CURSO (ACTUALIZA AL ABRIR NUEVO GRUPO)
    // =========================================================================
    const fechaCurso = "Lunes 27 de Abril, 08:00 PM (CDMX)";
    // =========================================================================

    // Obtenemos fecha y hora actual en CDMX
    // Obtenemos Fecha y Hora por separado (CDMX)
    const ahora = new Date();
    const fechaSolo = ahora.toLocaleDateString('es-MX', { 
      timeZone: 'America/Mexico_City',
      weekday: 'long', day: 'numeric', month: 'long'
    });
    const horaSolo = ahora.toLocaleTimeString('es-MX', { 
      timeZone: 'America/Mexico_City',
      hour: '2-digit', minute: '2-digit'
    });

    console.log(`🔥 LEAD: ${name} (${product}) - Curso: ${fechaCurso}`);

    // Diseño de Tabla HORIZONTAL con FECHA y HORA SEPARADAS
    const tablaDatos = `
      <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 12px; color: #333;">
        <thead>
          <tr style="background-color: #f4f4f4; font-weight: bold;">
            <th style="border: 1px solid #ccc; padding: 8px;">Fecha Registro</th>
            <th style="border: 1px solid #ccc; padding: 8px;">Hora Registro</th>
            <th style="border: 1px solid #ccc; padding: 8px;">Nombre</th>
            <th style="border: 1px solid #ccc; padding: 8px;">Email</th>
            <th style="border: 1px solid #ccc; padding: 8px;">WhatsApp</th>
            <th style="border: 1px solid #ccc; padding: 8px;">Producto</th>
            <th style="border: 1px solid #ccc; padding: 8px;">Fecha del Curso</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #ccc; padding: 8px;">${fechaSolo}</td>
            <td style="border: 1px solid #ccc; padding: 8px;">${horaSolo}</td>
            <td style="border: 1px solid #ccc; padding: 8px;">${name}</td>
            <td style="border: 1px solid #ccc; padding: 8px;">${email}</td>
            <td style="border: 1px solid #ccc; padding: 8px;">${whatsapp || 'No proporcionado'}</td>
            <td style="border: 1px solid #ccc; padding: 8px;">${product || 'General'}</td>
            <td style="border: 1px solid #ccc; padding: 8px;">${fechaCurso}</td>
          </tr>
        </tbody>
      </table>
    `;
    const mentoriaAnswers = answers || {
      objetivo: payload.objetivo || '',
      metodos: payload.metodos || payload.metodos_previos || '',
      disposicion: payload.disposicion || '',
      consciencia: payload.consciencia || payload.consciencia_inversion || ''
    };
    const hasMentoriaData = Boolean(
      mentoriaAnswers.objetivo || mentoriaAnswers.metodos || mentoriaAnswers.disposicion || mentoriaAnswers.consciencia
    );
    const mentoriaExtra = hasMentoriaData ? `
      <div style="margin-top:24px;padding:16px;border:1px solid #ddd;border-radius:8px;">
        <h3 style="margin-top:0;">Respuestas de Mentoría</h3>
        <p><strong>Objetivo:</strong> ${mentoriaAnswers.objetivo || "N/A"}</p>
        <p><strong>Métodos previos:</strong> ${mentoriaAnswers.metodos || "N/A"}</p>
        <p><strong>Disposición:</strong> ${mentoriaAnswers.disposicion || "N/A"}</p>
        <p><strong>Consciencia inversión:</strong> ${mentoriaAnswers.consciencia || "N/A"}</p>
        <p><strong>Payload JSON:</strong></p>
        <pre style="white-space:pre-wrap;background:#f7f7f7;padding:10px;border-radius:6px;">${JSON.stringify(payload, null, 2)}</pre>
      </div>
    ` : "";

            // ENVÍO AL ADMIN
    const { data, error } = await resend.emails.send({
      from: 'Sistema de Ventas <hola@entrenadormental.mx>', 
      to: 'mentalentrenador@gmail.com', 
      subject: `[ADMIN] Nuevo Registro: ${name}`,
      replyTo: email, 
      
      // AQUÍ VA EL CONTENIDO REAL (La variable tablaDatos ya contiene la tabla HTML)
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color: #c4a043; border-bottom: 2px solid #eee; padding-bottom: 10px;">Nuevo Registro de Interesado</h2>
          <p>Copia la siguiente tabla y pégala en tu hoja de cálculo:</p>
          
          ${tablaDatos}
          ${mentoriaExtra}

          <p style="font-size: 0.9em; color: #777; margin-top: 30px;">
            <em>El usuario ha sido redirigido a Stripe.</em>
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Error enviando correo:', error);
      return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
    }

    console.log('✅ Admin notificado (Ordenado: Registro -> Curso).');
    return { statusCode: 200, headers, body: JSON.stringify({ message: 'Lead notificado' }) };

  } catch (error) {
    console.error('Error general:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
};