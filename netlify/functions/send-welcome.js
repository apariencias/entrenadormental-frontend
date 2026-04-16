const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

// ZONA DE GESTION EDITABLE
// - Edita aqui asunto, Zoom, fecha/hora y enlaces por cada curso.
const COURSES_DB = {
  "La Calma de Mamá": {
    subject: "Bienvenida a La Calma de Mamá: Tu nueva frecuencia comienza hoy",
    titulo: "Bienvenida a La Calma de Mamá",
    fechaCurso: "Lunes 27 de Abril",
    horaCurso: "08:00 PM (Hora CDMX)",
    zoomLink: "https://us05web.zoom.us/j/123456789?pwd=ejemplo",
    zoomPass: "1234",
    audioLink: "https://entrenadormental.mx/assets/audios/neuro-alineacion-inicial.mp3",
    audioNombre: "Protocolo de Sincronicidad Cerebral",
    guiaNombre: "Guía de Entrenamiento Mental",
  },
  "Sintoniza a tu Pareja Ideal": {
    subject: "Bienvenida a Sintoniza a tu Pareja Ideal: Tu nueva frecuencia comienza hoy",
    titulo: "Bienvenida a Sintoniza a tu Pareja Ideal",
    fechaCurso: "Lunes 27 de Abril",
    horaCurso: "08:00 PM (Hora CDMX)",
    zoomLink: "https://us05web.zoom.us/j/123456789?pwd=ejemplo",
    zoomPass: "1234",
    audioLink: "https://entrenadormental.mx/assets/audios/sincronicidad-inicial.mp3",
    audioNombre: "Audio de Sincronicidad",
    guiaNombre: "Guía de Sintonía",
  },
};

function parejaBody(name, config) {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 680px; margin: 0 auto; color: #333;">
    <div style="background:#0a0a0a;padding:28px;border-bottom:4px solid #c4a043;text-align:center;">
      <h1 style="margin:0;color:#c4a043;font-size:28px;font-weight:500;">${config.titulo}</h1>
    </div>
    <div style="padding:32px 26px;line-height:1.7;">
      <p>Hola <strong>${name}</strong>,</p>
      <p>Tu proceso no comienza en la primera sesión; comenzó en el instante en que decidiste que "esperar" a que el amor suceda ya no es una opción. A partir de hoy, dejamos de buscar afuera para comenzar a seleccionar una nueva configuración interna.</p>
      <p><strong>Aquí tienes tu primer recurso de reprogramación:</strong></p>
      <div style="text-align:center;margin:24px 0;">
        <a href="${config.audioLink}" target="_blank" style="display:inline-block;background:#c4a043;color:#111;padding:13px 24px;text-decoration:none;border-radius:6px;font-weight:700;">
          Descargar Audio de Sincronicidad
        </a>
      </div>
      <h2 style="color:#c4a043;font-size:20px;margin-top:28px;">🎧 Instrucciones para tu Audio de Neuro-Alineación</h2>
      <p>Este audio es una herramienta de ingeniería sonora diseñada para ajustar tu frecuencia vibratoria y preparar tu arquitectura cerebral para la conexión.</p>
      <ul>
        <li><strong>Inmersión:</strong> Busca un lugar donde puedas estar contigo durante 20 minutos sin interrupciones.</li>
        <li><strong>Audífonos Indispensables:</strong> El efecto binaural crea el pulso necesario para inducir el estado alfa donde la reprogramación es posible.</li>
        <li><strong>Entrega:</strong> Cierra los ojos y permite que el sonido guíe tu sistema nervioso hacia la apertura.</li>
        <li><strong>Seguridad:</strong> No escuches este audio mientras conduces o realizas actividades que requieran atención plena.</li>
      </ul>
      <h2 style="color:#c4a043;font-size:20px;margin-top:28px;">📅 Nuestra Cita de Sintonía</h2>
      <table style="width:100%;border-collapse:collapse;margin:14px 0 20px;">
        <tr><td style="border:1px solid #ddd;padding:8px;"><strong>Fecha</strong></td><td style="border:1px solid #ddd;padding:8px;">${config.fechaCurso}</td></tr>
        <tr><td style="border:1px solid #ddd;padding:8px;"><strong>Hora</strong></td><td style="border:1px solid #ddd;padding:8px;">${config.horaCurso}</td></tr>
        <tr><td style="border:1px solid #ddd;padding:8px;"><strong>Acceso</strong></td><td style="border:1px solid #ddd;padding:8px;"><a href="${config.zoomLink}" target="_blank">ENTRAR A LA SESIÓN</a></td></tr>
        <tr><td style="border:1px solid #ddd;padding:8px;"><strong>ID / Clave</strong></td><td style="border:1px solid #ddd;padding:8px;">${config.zoomPass || "Se comparte al ingresar"}</td></tr>
      </table>
      <h2 style="color:#c4a043;font-size:20px;margin-top:28px;">Pautas para tu Proceso de Sincronicidad</h2>
      <ol>
        <li><strong>Correspondencia sobre Esfuerzo:</strong> Tu pareja ideal no es un premio por esfuerzo, es reflejo de tu configuración interna.</li>
        <li><strong>Llega con tu realidad actual:</strong> Si llegas agotado, escéptico o con dudas, llega. El cambio ocurre en la práctica.</li>
        <li><strong>Garantía de Resonancia Total:</strong> Si después de la primera sesión completa sientes que esta frecuencia no resuena contigo, reintegramos el 100% de tu inversión.</li>
      </ol>
      <p>Gracias por confiar en tu capacidad de reprogramación. Durante las próximas 4 semanas, vamos a sintonizar la realidad que ya te pertenece.</p>
      <p><strong>Tu Entrenador Mental.</strong></p>
    </div>
  </div>`;
}

function calmaBody(name, config) {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 680px; margin: 0 auto; color: #333;">
    <div style="background:#0a0a0a;padding:28px;border-bottom:4px solid #c4a043;text-align:center;">
      <h1 style="margin:0;color:#c4a043;font-size:28px;font-weight:500;">${config.titulo}</h1>
    </div>
    <div style="padding:32px 26px;line-height:1.7;">
      <p>Hola <strong>${name}</strong>,</p>
      <p>Tu proceso no comienza en la primera clase; comenzó en el momento en que decidiste iniciar tu transformación interna.</p>
      <div style="text-align:center;margin:24px 0;">
        <a href="${config.audioLink}" target="_blank" style="display:inline-block;background:#c4a043;color:#111;padding:13px 24px;text-decoration:none;border-radius:6px;font-weight:700;">
          Descargar ${config.audioNombre}
        </a>
      </div>
      <h2 style="color:#c4a043;font-size:20px;margin-top:28px;">📅 Nuestra Cita con la Calma</h2>
      <table style="width:100%;border-collapse:collapse;margin:14px 0 20px;">
        <tr><td style="border:1px solid #ddd;padding:8px;"><strong>Fecha</strong></td><td style="border:1px solid #ddd;padding:8px;">${config.fechaCurso}</td></tr>
        <tr><td style="border:1px solid #ddd;padding:8px;"><strong>Hora</strong></td><td style="border:1px solid #ddd;padding:8px;">${config.horaCurso}</td></tr>
        <tr><td style="border:1px solid #ddd;padding:8px;"><strong>Acceso</strong></td><td style="border:1px solid #ddd;padding:8px;"><a href="${config.zoomLink}" target="_blank">ENTRAR A LA SESIÓN</a></td></tr>
        <tr><td style="border:1px solid #ddd;padding:8px;"><strong>ID / Clave</strong></td><td style="border:1px solid #ddd;padding:8px;">${config.zoomPass || "Se comparte al ingresar"}</td></tr>
      </table>
      <p>Recibirás tu ${config.guiaNombre} por correo para acompañar cada sesión.</p>
      <p><strong>Tu Entrenador Mental.</strong></p>
    </div>
  </div>`;
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { name, email, product } = JSON.parse(event.body || "{}");
    if (!name || !email) {
      return { statusCode: 400, body: "Faltan datos" };
    }

    const selectedProduct = COURSES_DB[product] ? product : "La Calma de Mamá";
    const config = COURSES_DB[selectedProduct];
    const html =
      selectedProduct === "Sintoniza a tu Pareja Ideal"
        ? parejaBody(name, config)
        : calmaBody(name, config);

    const { error } = await resend.emails.send({
      from: "Entrenador Mental <hola@entrenadormental.mx>",
      to: email,
      subject: config.subject,
      html,
    });

    if (error) {
      return { statusCode: 500, body: JSON.stringify({ error }) };
    }
    return { statusCode: 200, body: JSON.stringify({ message: "Bienvenida enviada" }) };
  } catch (error) {
    console.error("Error en send-welcome:", error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};