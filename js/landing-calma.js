// js/landing-calma.js (VERSIÓN FINAL LIMPIA)
document.addEventListener('DOMContentLoaded', () => {

    // --- Lógica del Formulario y Stripe ---
    const inscriptionForm = document.getElementById('inscription-form');

    // Verificamos que el formulario exista antes de añadirle el evento
    if (inscriptionForm) {
        inscriptionForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Evitamos que la página se recargue

            // 1. Obtenemos los datos del formulario
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const whatsapp = document.getElementById('whatsapp').value.trim();

            // 2. Validación simple en el frontend
            if (!name || !email || !whatsapp) {
                alert('Por favor, completa todos los campos.');
                return;
            }

            // 3. Mostramos un estado de "cargando" en el botón
            const submitButton = document.getElementById('submit-payment-btn');
            const originalButtonText = submitButton.innerText;
            submitButton.disabled = true;
            submitButton.innerText = 'Procesando pago...';

            // 4. Conectamos con el backend
            try {
                console.log('Enviando datos al servidor:', { name, email, whatsapp });
                
                // >>>>> ¡URL CORRECTA Y BODY CON DATOS! <<<<<
const response = await fetch('https://servidor-pagos.onrender.com/api/create-checkout-session', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        name: name,
        email: email,
        whatsapp: whatsapp,
        priceId: 'price_1SJkrS49pVvXIqagmqSmEOtf' // <--- ¡PEGA AQUÍ TU ID DE PRECIO!
    }),
});

                // 5. Manejamos la respuesta del servidor
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
                submitButton.innerText = originalButtonText;
            }
        });
    }
});