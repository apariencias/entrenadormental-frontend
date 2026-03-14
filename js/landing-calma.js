// js/landing-calma.js (VERSIÓN CORREGIDA Y DEFINITIVA)
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

            // 4. Conectamos con el backend (Bloque try/catch único y corregido)
            try {
                // Define el priceId aquí (¡ASEGÚRATE DE QUE SEA EL CORRECTO!)
                const priceId = 'price_1TB01m49pVvXIqaguJHNWTsQ';

                // Crea el objeto con todos los datos que se enviarán
                const dataToSend = {
                    name: name,
                    email: email,
                    whatsapp: whatsapp,
                    priceId: priceId // <-- Este es el cambio clave
                };

                console.log('Enviando datos al servidor:', dataToSend);

                // Realiza la llamada al servidor
                const response = await fetch('https://servidor-pagos.onrender.com/api/create-checkout-session', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(dataToSend),
                });

                // Si el servidor responde con un error (400, 500, etc.)
                if (!response.ok) {
                    const errorText = await response.text(); // Leemos el error como texto
                    console.error('Error del servidor (Status:', response.status, '):', errorText);
                    throw new Error('El servidor no pudo procesar el pago. Revisa la consola para más detalles.');
                }

                // Si todo va bien, obtenemos la URL de Stripe
                const session = await response.json();
                console.log("Sesión de Stripe creada. Redirigiendo a:", session.url);

                // Redirigimos al cliente a la página de pago de Stripe
                window.location.href = session.url;

            } catch (error) {
                // Si ocurre cualquier error en el proceso
                console.error('❌ ERROR en el navegador:', error);
                alert(`Hubo un error: ${error.message}. Por favor, intenta de nuevo.`);
                
                // 5. En caso de error, reactivamos el botón
                submitButton.disabled = false;
                submitButton.innerText = originalButtonText;
            }
        });
    }
});