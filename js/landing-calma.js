// js/landing-calma.js (Versión Corregida y Final)

// INICIO: Esperamos a que toda la página se cargue
document.addEventListener('DOMContentLoaded', () => {

    // --- Lógica del Cuestionario ---
    // (No necesita cambios, los checkboxes funcionan por defecto)

    // --- Lógica del Formulario y Stripe ---
    const inscriptionForm = document.getElementById('inscription-form');
    const submitButton = document.getElementById('submit-payment-btn');

    // Verificamos que los elementos existan antes de usarlos
    if (inscriptionForm && submitButton) {

        // INICIO: Evento principal al enviar el formulario
        inscriptionForm.addEventListener('submit', async (event) => {
            // 1. Prevenimos que la página se recargue
            event.preventDefault();

            // 2. Obtenemos los valores de los campos
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const whatsapp = document.getElementById('whatsapp').value;

            // 3. Validamos que los campos no estén vacíos
            if (!name || !email || !whatsapp) {
                alert('Por favor, completa todos los campos.');
                return; // Detenemos la ejecución si faltan datos
            }

            // 4. Mostramos un estado de "cargando" en el botón
            submitButton.disabled = true;
            submitButton.innerText = 'Procesando pago...';

            // 5. Preparamos y enviamos la petición al backend
            try {
                console.log("Enviando datos al servidor:", { name, email, whatsapp });

                // >>>>> ¡URL CORREGIDA Y BODY SIN ID DE PRODUCTO! <<<<<
                // El backend está configurado para un solo producto, no necesita un ID.
                const response = await fetch('https://servidor-pagos.onrender.com/create-checkout-session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: name,
                        email: email,
                        whatsapp: whatsapp,
                        // items: [{ id: 'la-calma-de-mama' }] // Esta línea se elimina
                    })
                });

                // Si la respuesta no es "ok", lanzamos un error
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Error del servidor al crear la sesión de pago.');
                }

                const session = await response.json();
                console.log("Sesión de Stripe creada. Redirigiendo a:", session.url);

                // 6. Redirigimos al cliente a la página de pago de Stripe
                window.location.href = session.url;

            } catch (error) {
                console.error('❌ ERROR en el navegador:', error);
                alert(`Hubo un error al procesar el pago: ${error.message}. Por favor, intenta de nuevo o contáctanos por WhatsApp.`);
                
                // 7. En caso de error, reactivamos el botón
                submitButton.disabled = false;
                submitButton.innerText = 'Inscribirme y Recibir Bonus';
            }
        }); // FIN del evento 'submit'
    } // FIN del bloque "if"

}); // FIN del evento 'DOMContentLoaded'