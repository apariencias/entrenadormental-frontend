// js/stripe-checkout-v2.js

// Asegúrate de que esta clave pública es la correcta
const stripe = Stripe("***REMOVED******REMOVED***"); 
// ...POR ESTA
const checkoutButton = document.querySelector("#submit-payment-btn");

// Si tu botón tiene otro ID, ajústalo aquí. Por ejemplo: document.querySelector("#boton-pagar")
// Si no estás seguro, muéstrame el HTML de tu botón en index.html

checkoutButton.addEventListener("click", async () => {
  // --- INICIO DE LA MEJORA ---
  // 1. Deshabilitar el botón para evitar clics múltiples
  checkoutButton.disabled = true;
  // 2. Dar feedback inmediato al usuario
  checkoutButton.textContent = "Iniciando...";
  // --- FIN DE LA MEJORA ---

  try {
    // 1. Deshabilitar el botón para evitar clics múltiples
    checkoutButton.disabled = true;
    checkoutButton.textContent = 'Procesando...';

    // 2. Llamar a tu backend
    const response = await fetch("http://localhost:3000/create-checkout-session", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error de red: ${response.statusText}`);
    }

    const session = await response.json();

    // 3. Redirigir a Stripe y esperar el resultado
    const result = await stripe.redirectToCheckout({ sessionId: session.id });

    // 4. Si redirectToCheckout falla, `result.error` no será nulo
    if (result.error) {
      throw new Error(result.error.message);
    }

  } catch (error) {
    // 5. Cualquier error en los pasos anteriores vendrá aquí
    console.error("Error durante el proceso de pago:", error);
    
    // Reactivar el botón para que el usuario pueda reintentar
    checkoutButton.disabled = false;
    checkoutButton.textContent = "Reintentar Pago"; 
    
    alert("Ocurrió un error: " + error.message + ". Por favor, inténtalo de nuevo.");
  }
});