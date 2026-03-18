// entrenadormental-frontend/js/landing-calma.js

// ===================================================================
// PASO 1: PEGA TU CLAVE PÚBLICA DE STRIPE AQUÍ
// Es seguro, esta clave está diseñada para usarse públicamente.
// ===================================================================
const stripe = Stripe('pk_test_51SJJiW49pVvXIqag9YrzkSIeeNbJAPjscrwv66U3SuW8T79HlToatexZNuOwQsbXnfSnNIVCu5Em1i4drDgyYDGB00Md2IPxR0'); // <--- REEMPLAZA ESTO CON TU PK REAL

document.addEventListener('DOMContentLoaded', () => {
    // Este ID ya es correcto en tu código
    const paymentForm = document.getElementById('inscription-form'); 

    if (paymentForm) {
        paymentForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const email = document.getElementById('email').value;

            if (!email) {
                alert('Por favor, ingresa tu correo electrónico.');
                return;
            }

            // ===================================================================
            // PASO 2: ASEGÚRATE DE QUE TU ID DE PRECIO SEA EL CORRECTO
            // ===================================================================
            const PRICE_ID = 'price_1TB01m49pVvXIqaguJHNWTsQ'; // <--- PARECE CORRECTO, VÉRIFICALO

            try {
                // La URL de tu API local
                const response = await fetch('/.netlify/functions/create-checkout-session', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ customer_email: email }),
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
            }
        });
    } else {
        // Mensaje de error corregido para que coincida con el ID real
        console.error('Error: El formulario con id="inscription-form" no fue encontrado en el HTML.');
    }
});