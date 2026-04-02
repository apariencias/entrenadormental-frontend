// entrenadormental-frontend/js/landing-calma.js

const stripe = Stripe('pk_test_12345678901234567890123456789012');

document.addEventListener('DOMContentLoaded', () => {
    const paymentForm = document.getElementById('inscription-form');

    if (paymentForm) {
        paymentForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const email = document.getElementById('email').value;

            if (!email) {
                alert('Por favor, ingresa tu correo electrónico.');
                return;
            }

            // Mostrar un estado de carga
            const submitButton = paymentForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerText;
            submitButton.disabled = true;
            submitButton.innerText = 'Procesando...';

            try {
                const response = await fetch('/.netlify/functions/create-checkout-session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ customerEmail: email }),
                });

                if (!response.ok) {
                    throw new Error(`Error del servidor: ${response.statusText}`);
                }

                const session = await response.json();
                
                // Redirige al Checkout de Stripe
                window.location.href = session.url;

            } catch (error) {
                console.error('Error al crear la sesión de pago:', error);
                alert('Hubo un problema al procesar tu pago. Por favor, intenta de nuevo más tarde.');
                // Restaurar el botón en caso de error
                submitButton.disabled = false;
                submitButton.innerText = originalButtonText;
            }
        });
    } else {
        console.error('Error: El formulario con id="inscription-form" no fue encontrado en el HTML.');
    }
});