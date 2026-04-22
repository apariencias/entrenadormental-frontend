const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

// ZONA DE GESTION EDITABLE
// - Edita aqui asunto, Zoom, fecha/hora y enlaces por cada curso.
const COURSES_DB = {
  "La Calma de Mamá": {
    subject: "Bienvenida a La Calma de Mamá: Tu proceso de reprogramación comienza hoy",
    titulo: "Bienvenida a La Calma de Mamá",
    zoomLink: "https://us06web.zoom.us/j/86468025186?pwd=ektHetJ7bSHT5BMCxavI7nX4iWu9fg.1",
    zoomPass: "464310",
    audioLink: "https://entrenadormental.mx/assets/audios/neuro-alineacion-inicial.mp3",
    audioNombre: "Protocolo de Sincronicidad Cerebral",
    guiaNombre: "Guía de Entrenamiento Mental",
    sessions: [
      { label: "Clase 1", fecha: "Lunes 27 de Abril", hora: "08:00 PM" },
      { label: "Clase 2", fecha: "Lunes 4 de Mayo", hora: "08:00 PM" },
      { label: "Clase 3", fecha: "Lunes 11 de Mayo", hora: "08:00 PM" },
      { label: "Clase 4", fecha: "Lunes 18 de Mayo", hora: "08:00 PM" },
    ],
  },
  "Sintoniza a tu Pareja Ideal": {
    subject: "Bienvenida a Sintoniza a tu Pareja Ideal: Tu nueva frecuencia comienza hoy",
    titulo: "Bienvenida a Sintoniza a tu Pareja Ideal",
    zoomLink: "https://us05web.zoom.us/j/123456789?pwd=ejemplo",
    zoomPass: "1234",
    audioLink: "https://entrenadormental.mx/assets/audios/sincronicidad-inicial.mp3",
    audioNombre: "Audio de Sincronicidad",
    guiaNombre: "Guía de Sintonía",
    sessions: [
      { label: "Clase 1", fecha: "[Fecha]", hora: "08:00 PM" },
      { label: "Clase 2", fecha: "[Fecha]", hora: "08:00 PM" },
      { label: "Clase 3", fecha: "[Fecha]", hora: "08:00 PM" },
      { label: "Clase 4", fecha: "[Fecha]", hora: "08:00 PM" },
    ],
  },
};

function parejaBody(name, config) {
  const agendaRows = (config.sessions || [])
    .map(
      (s) => `
        <tr>
          <td style="border:1px solid #ddd;padding:8px;">${s.label}</td>
          <td style="border:1px solid #ddd;padding:8px;">${s.fecha}</td>
          <td style="border:1px solid #ddd;padding:8px;">${s.hora} (CDMX)</td>
        </tr>`
    )
    .join("");
  return `
  <div style="font-family: Arial, sans-serif; max-width: 680px; margin: 0 auto; color: #333;">
    <div style="background:#0a0a0a;padding:28px;border-bottom:4px solid #c4a043;text-align:center;">
      <h1 style="margin:0;color:#c4a043;font-size:28px;font-weight:500;">${config.titulo}</h1>
    </div>
    <div style="padding:32px 26px;line-height:1.7;">
      <p>Hola <strong>${name}</strong>,</p>
      <p>Tu proceso no comienza en la primera sesión; comenzó en el instante en que decidiste que "esperar" a que el amor sucediera por azar ya no era suficiente. A partir de hoy, dejamos de buscar afuera para enfocarnos en seleccionar una nueva configuración interna.</p>
      <p><strong>Aquí tienes tu primer recurso de reprogramación:</strong></p>
      <div style="text-align:center;margin:24px 0;">
        <a href="${config.audioLink}" target="_blank" style="display:inline-block;background:#c4a043;color:#111;padding:13px 24px;text-decoration:none;border-radius:6px;font-weight:700;">
          Descargar ${config.audioNombre}
        </a>
      </div>
      <h2 style="color:#c4a043;font-size:20px;margin-top:28px;">🎧 Instrucciones para tu Audio de Neuro-Alineación</h2>
      <p>Este audio ajusta tu frecuencia vibratoria y prepara tu "destintoxicación emocional" de relaciones anteriores.</p>
      <ul>
        <li><strong>Inmersión:</strong> 20 minutos de introspección total, sin interrupciones.</li>
        <li><strong>Audífonos Indispensables:</strong> Necesarios para que el efecto binaural induzca el estado alfa donde la reprogramación es posible.</li>
        <li><strong>⚠️ Seguridad:</strong> Debido al estado de relajación profunda, no lo uses mientras conduces.</li>
      </ul>

      <h2 style="color:#c4a043;font-size:20px;margin-top:28px;">📑 Guía de Sintonía</h2>
      <p>Recibirás este documento 48 horas antes de nuestra sesión. Es tu manual de referencia para mantener la coherencia y la alineación entre clases.</p>

      <h2 style="color:#c4a043;font-size:20px;margin-top:28px;">📅 Tu Agenda de Sintonía</h2>
      <table style="width:100%;border-collapse:collapse;margin:14px 0 18px;">
        <tr>
          <th style="border:1px solid #ddd;padding:8px;background:#f7f7f7;text-align:left;">Sesión</th>
          <th style="border:1px solid #ddd;padding:8px;background:#f7f7f7;text-align:left;">Fecha</th>
          <th style="border:1px solid #ddd;padding:8px;background:#f7f7f7;text-align:left;">Hora (CDMX)</th>
        </tr>
        ${agendaRows}
      </table>

      <h2 style="color:#c4a043;font-size:20px;margin-top:28px;">🧠 Pautas para tu Proceso (Neuro-Alineación)</h2>
      <ul>
        <li><strong>Correspondencia sobre Esfuerzo:</strong> Tu pareja ideal no es un premio al esfuerzo, es un reflejo de tu configuración interna. Si cambias la señal, la realidad cambia.</li>
        <li><strong>Llega con tu realidad actual:</strong> No necesitas estar "en paz" para entrar. El cambio ocurre en la práctica, no en la teoría previa.</li>
        <li><strong>Guía por voz:</strong> Trabajaré exclusivamente con mi voz durante las reprogramaciones para que tu atención viaje del análisis mental a la certeza visceral.</li>
        <li><strong>Cámara:</strong> Tienes libertad total. Enciéndela si deseas que calibre los ejercicios según tu lenguaje no verbal, o mantenla apagada si necesitas privacidad.</li>
      </ul>

      <h2 style="color:#c4a043;font-size:20px;margin-top:28px;">🛡️ Tu Pase de Acceso (Zoom)</h2>
      <p>He precargado tu correo en nuestro sistema de seguridad de Zoom para que tu entrada sea fluida y privada.</p>
      <ul>
        <li><strong>Tu Pase VIP:</strong> Recibirás un correo de Zoom Confirmations con tu enlace personal e intransferible.</li>
        <li><strong>Fricción Cero:</strong> Con este enlace entrarás directo a la sesión. No necesitas que te admita en sala de espera, y si tu internet falla, puedes reingresar inmediatamente con el mismo link.</li>
      </ul>

      <div style="margin:16px 0 0;">
        <p style="margin:0;"><strong>Enlace de acceso:</strong> <a href="${config.zoomLink}" target="_blank" rel="noopener">Entrar a Zoom</a></p>
        <p style="margin:6px 0 0;"><strong>ID / Clave:</strong> ${config.zoomPass || "Se comparte al ingresar"}</p>
      </div>

      <p style="margin-top:20px;">Contamos con una <strong>Garantía del 100%</strong> de tu inversión tras la primera sesión si sientes que esta frecuencia no es para ti.</p>
      <p><strong>Tu Entrenador Mental.</strong></p>
    </div>
  </div>`;
}

function calmaBody(name, config) {
  const agendaRows = (config.sessions || [])
    .map(
      (s) => `
        <tr>
          <td style="border:1px solid #ddd;padding:8px;">${s.label}</td>
          <td style="border:1px solid #ddd;padding:8px;">${s.fecha}</td>
          <td style="border:1px solid #ddd;padding:8px;">${s.hora} (CDMX)</td>
        </tr>`
    )
    .join("");
  return `
  <div style="font-family: Arial, sans-serif; max-width: 680px; margin: 0 auto; color: #333;">
    <div style="background:#0a0a0a;padding:28px;border-bottom:4px solid #c4a043;text-align:center;">
      <h1 style="margin:0;color:#c4a043;font-size:28px;font-weight:500;">${config.titulo}</h1>
    </div>
    <div style="padding:32px 26px;line-height:1.7;">
      <p>Hola <strong>${name}</strong>,</p>
      <p>Tu proceso no comienza en la primera clase; comenzó en el segundo en que decidiste que "entender" tu cansancio ya no era suficiente. A partir de hoy, nos enfocaremos en seleccionar una nueva configuración interna.</p>
      <p><strong>Aquí tienes tu primer recurso de reprogramación:</strong></p>
      <div style="text-align:center;margin:24px 0;">
        <a href="${config.audioLink}" target="_blank" style="display:inline-block;background:#c4a043;color:#111;padding:13px 24px;text-decoration:none;border-radius:6px;font-weight:700;">
          Descargar ${config.audioNombre}
        </a>
      </div>

      <h2 style="color:#c4a043;font-size:20px;margin-top:28px;">🎧 Instrucciones para tu Audio de Neuro-Alineación</h2>
      <p>Este audio es una herramienta de ingeniería sonora diseñada para preparar tu arquitectura cerebral.</p>
      <ul>
        <li><strong>Inmersión:</strong> Busca un lugar donde puedas estar contigo misma durante 20 minutos sin interrupciones.</li>
        <li><strong>Audífonos Indispensables:</strong> El efecto binaural requiere que cada oído reciba una frecuencia distinta para que tu cerebro cree el pulso que induce la relajación profunda.</li>
        <li><strong>⚠️ Seguridad:</strong> No escuches este audio mientras conduces o realizas actividades que requieran tu atención plena.</li>
      </ul>

      <h2 style="color:#c4a043;font-size:20px;margin-top:28px;">📑 ${config.guiaNombre}</h2>
      <p>Recibirás este documento en tu correo 48 horas antes de cada sesión. Es tu mapa técnico para anclar los cambios durante la clase en vivo.</p>

      <h2 style="color:#c4a043;font-size:20px;margin-top:28px;">📅 Tu Agenda con la Calma</h2>
      <table style="width:100%;border-collapse:collapse;margin:14px 0 18px;">
        <tr>
          <th style="border:1px solid #ddd;padding:8px;background:#f7f7f7;text-align:left;">Sesión</th>
          <th style="border:1px solid #ddd;padding:8px;background:#f7f7f7;text-align:left;">Fecha</th>
          <th style="border:1px solid #ddd;padding:8px;background:#f7f7f7;text-align:left;">Hora (CDMX)</th>
        </tr>
        ${agendaRows}
      </table>

      <h2 style="color:#c4a043;font-size:20px;margin-top:28px;">Pautas para tu Proceso (Neuro-Alineación)</h2>
      <p>Para que tu mente lógica se relaje y tu sistema nervioso se abra:</p>
      <ul>
        <li><strong>Llega como estés:</strong> No esperes a tener el día perfecto. Si llegas agotada o en medio del caos, llega. El proceso está diseñado para funcionar en tu vida real.</li>
        <li><strong>Abandona la perfección:</strong> Aquí no buscamos "desempeño", sino alivio y consciencia.</li>
        <li><strong>Guía por voz:</strong> Durante las prácticas profundas, trabajaré exclusivamente con mi voz. Esto reduce la carga de estímulos visuales y permite que tu atención baje de los ojos al cuerpo, donde ocurre la transformación.</li>
        <li><strong>Uso de audífonos:</strong> Para las sesiones en vivo, te recomiendo usarlos para mantener tu atención plena dentro del proceso y minimizar distracciones externas.</li>
        <li><strong>Cámara:</strong> Tienes libertad total. Enciéndela si deseas que calibre los ejercicios según tu lenguaje no verbal, o mantenla apagada si necesitas privacidad.</li>
      </ul>

      <h2 style="color:#c4a043;font-size:20px;margin-top:28px;">🛡️ Tu Pase de Acceso (Zoom)</h2>
      <p>Para garantizar la privacidad de nuestras sesiones, hemos autorizado tu correo en nuestra plataforma.</p>
      <ul>
        <li><strong>¿Qué sigue?</strong> Conéctate 5 minutos antes a tu clase en Zoom para asegurar que tu audio funcione correctamente.</li>
        <li><strong>Ten a la mano una libreta y un bolígrafo:</strong> El anclaje físico de tus ideas es parte esencial del proceso.</li>
        <li><strong>Procura usar audífonos durante la clase:</strong> Esto es fundamental para que mi voz guíe tu sistema nervioso sin distracciones externas.</li>
        <li><strong>Acceso Automático:</strong> Ese enlace es único para ti. Al usarlo, entrarás directamente a la sala sin esperas. Si te desconectas, puedes volver a entrar con el mismo link.</li>

      </ul>

      <div style="margin:16px 0 0;">
        <p style="margin:0;"><strong>Enlace de acceso:</strong> <a href="${config.zoomLink}" target="_blank" rel="noopener">Entrar a Zoom</a></p>
        <p style="margin:6px 0 0;"><strong>ID / Clave:</strong> ${config.zoomPass || "Se comparte al ingresar"}</p>
      </div>

      <p style="margin-top:20px;"><strong>Garantía de Confianza:</strong> Recuerda que cuentas con una garantía del 100% si después de vivir la Clase 1 sientes que este proceso no es para ti.</p>
      <p><strong>Tu Entrenador Mental.</strong></p>
    </div>
  </div>`;
}

exports.handler = async (event) => {
  const headers = { "Content-Type": "application/json; charset=utf-8" };
  
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: "Method Not Allowed" };
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
      return { statusCode: 500, headers, body: JSON.stringify({ error }) };
    }
    return { statusCode: 200, headers, body: JSON.stringify({ message: "Bienvenida enviada" }) };
  } catch (error) {
    console.error("Error en send-welcome:", error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
};