/**
 * Form Validation Script
 * Proporciona validaciones estrictas para nombres y teléfonos con intl-tel-input
 * Integración con intl-tel-input CDN
 */

(function() {
  'use strict';

  // =========================================================================
  // CONFIGURACIÓN
  // =========================================================================
  const CONFIG = {
    nameMinLength: 3,
    nameMaxLength: 50,
    nameRegex: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/, // Solo letras, espacios y acentos
    errorColor: '#e53e3e', // Rojo sutil
    errorMessage: {
      name: 'El nombre debe contener solo letras (3-50 caracteres)',
      whatsapp: 'Por favor ingresa un número de teléfono válido'
    }
  };

  // =========================================================================
  // INICIALIZACIÓN
  // =========================================================================
  function initializeFormValidation() {
    const form = document.getElementById('inscription-form');
    
    if (!form) {
      console.warn('Formulario #inscription-form no encontrado');
      return;
    }

    const nameInput = form.querySelector('#name');
    const emailInput = form.querySelector('#email');
    let whatsappInput = form.querySelector('#whatsapp');
    const submitBtn = form.querySelector('#submit-payment-btn');

    if (!nameInput || !emailInput || !whatsappInput) {
      console.warn('Campos de formulario no encontrados');
      return;
    }

    // Inicializar intl-tel-input si está disponible
    if (typeof intlTelInput !== 'undefined') {
      const whatsappIti = initIntlTelInput(whatsappInput);
      whatsappInput = form.querySelector('#whatsapp');
      whatsappInput._iti = whatsappIti;
    } else {
      console.warn('intl-tel-input no cargado. Asegúrate de incluir el CDN.');
    }

    // Event listeners para validación en tiempo real
    nameInput.addEventListener('blur', () => validateName(nameInput));
    nameInput.addEventListener('input', () => {
      sanitizeName(nameInput);
      validateName(nameInput);
    });

    whatsappInput.addEventListener('blur', () => validateWhatsapp(whatsappInput));
    whatsappInput.addEventListener('input', () => validateWhatsapp(whatsappInput));

    // Validar al enviar el formulario
    form.addEventListener('submit', (e) => handleFormSubmit(e, form, nameInput, whatsappInput));
  }

  // =========================================================================
  // INICIALIZACIÓN DE INTL-TEL-INPUT
  // =========================================================================
  function initIntlTelInput(whatsappInput) {
    // Evitar reinicializar si ya está envuelto
    const existingWrapper = whatsappInput.closest('#iti-wrapper');
    if (existingWrapper) {
      return window.intlTelInput(whatsappInput);
    }

    // Crear wrapper para intl-tel-input
    const telInputWrapper = document.createElement('div');
    telInputWrapper.id = 'iti-wrapper';
    
    // Reemplazar el input original
    whatsappInput.parentElement.replaceChild(telInputWrapper, whatsappInput);
    
    // Crear nuevo input dentro del wrapper
    const newInput = document.createElement('input');
    newInput.type = 'tel';
    newInput.id = 'whatsapp';
    newInput.name = 'whatsapp';
    newInput.placeholder = '+52 (555) 000-0000';
    newInput.required = true;
    newInput.autocomplete = 'tel';
    
    // Copiar clases del input original
    newInput.className = whatsappInput.className;
    newInput.setAttribute('aria-label', 'WhatsApp');
    
    telInputWrapper.appendChild(newInput);

    // Inicializar intl-tel-input
    const iti = window.intlTelInput(newInput, {
      initialCountry: 'mx', // México por defecto
      preferredCountries: ['mx', 'us', 'ar', 'co', 'es'],
      allowDropdown: true,
      separateDialCode: true,
      autoHideDialCode: false,
      nationalMode: false,
      dropdownContainer: document.body,
      utilsScript: 'https://cdn.jsdelivr.net/npm/intl-tel-input@24.0.0/build/js/utils.js',
      formatOnDisplay: true,
      autoPlaceholder: 'polite'
    });

    // Detectar país por IP en background (opcional)
    if (typeof fetch !== 'undefined') {
      fetch('https://ipapi.co/json/')
        .then(res => res.json())
        .then(data => {
          if (data.country_code) {
            iti.setCountry(data.country_code.toLowerCase());
          }
        })
        .catch(() => {
          // Silenciosamente fallar si no se puede detectar
          console.debug('No se pudo detectar país por IP');
        });
    }

    // Asegurar que el campo muestre +52 si no hay valor inicial
    if (!newInput.value.trim()) {
      newInput.value = '+52 ';
    }

    // Actualizar el atributo data-country cuando cambia
    newInput.addEventListener('countrychange', () => {
      const countryData = iti.getSelectedCountryData();
      newInput.dataset.country = countryData.iso2;
      newInput.dataset.dialCode = countryData.dialCode;
    });

    return iti;
  }

  // =========================================================================
  // VALIDACIÓN DE NOMBRE
  // =========================================================================
  function sanitizeName(nameInput) {
    let value = nameInput.value;
    
    // Remover números
    value = value.replace(/\d/g, '');
    
    // Remover caracteres especiales (excepto espacios)
    value = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    
    // Limitar espacios múltiples consecutivos
    value = value.replace(/\s+/g, ' ');
    
    // Truncar a máximo de caracteres si es necesario
    if (value.length > CONFIG.nameMaxLength) {
      value = value.substring(0, CONFIG.nameMaxLength);
    }
    
    nameInput.value = value;
  }

  function validateName(nameInput) {
    const value = nameInput.value.trim();
    const errorContainer = getOrCreateErrorContainer(nameInput, 'name-error');

    // Validaciones
    if (value.length === 0) {
      showError(nameInput, errorContainer, 'El nombre es requerido');
      return false;
    }

    if (value.length < CONFIG.nameMinLength) {
      showError(nameInput, errorContainer, `Mínimo ${CONFIG.nameMinLength} caracteres`);
      return false;
    }

    if (value.length > CONFIG.nameMaxLength) {
      showError(nameInput, errorContainer, `Máximo ${CONFIG.nameMaxLength} caracteres`);
      return false;
    }

    if (!CONFIG.nameRegex.test(value)) {
      showError(nameInput, errorContainer, 'Solo se permiten letras y espacios');
      return false;
    }

    if (/\d/.test(value)) {
      showError(nameInput, errorContainer, 'El nombre no puede contener números');
      return false;
    }

    clearError(nameInput, errorContainer);
    return true;
  }

  // =========================================================================
  // VALIDACIÓN DE WHATSAPP
  // =========================================================================
  function validateWhatsapp(whatsappInput) {
    const errorContainer = getOrCreateErrorContainer(whatsappInput, 'whatsapp-error');
    const itiWrapper = document.getElementById('iti-wrapper');
    
    // Si intl-tel-input está inicializado
    if (itiWrapper && typeof intlTelInput !== 'undefined') {
      const existingInstance = window.intlTelInputGlobals && window.intlTelInputGlobals.getInstance
        ? window.intlTelInputGlobals.getInstance(whatsappInput)
        : null;
      const itiInstance = whatsappInput._iti || existingInstance || window.intlTelInput(whatsappInput);
      
      if (!itiInstance || !itiInstance.isValidNumber()) {
        showError(whatsappInput, errorContainer, 'Número de teléfono inválido para el país seleccionado');
        return false;
      }

      // Obtener el número en formato E.164 para enviar a Stripe/Correo
      const internationalNumber = itiInstance.getNumber(intlTelInputUtils.numberFormat.E164);
      whatsappInput.dataset.internationalFormat = internationalNumber;
      
      clearError(whatsappInput, errorContainer);
      return true;
    }

    // Fallback si intl-tel-input no está disponible
    const value = whatsappInput.value.trim();
    if (!value) {
      showError(whatsappInput, errorContainer, 'El teléfono es requerido');
      return false;
    }

    // Validación básica: debe tener entre 10-15 dígitos
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly.length < 10 || digitsOnly.length > 15) {
      showError(whatsappInput, errorContainer, 'El formato de teléfono no es válido');
      return false;
    }

    clearError(whatsappInput, errorContainer);
    return true;
  }

  // =========================================================================
  // MANEJO DE ERRORES VISUALES
  // =========================================================================
  function getOrCreateErrorContainer(input, errorId) {
    let errorContainer = input.nextElementSibling;
    
    if (!errorContainer || !errorContainer.classList.contains('form-error')) {
      errorContainer = document.createElement('div');
      errorContainer.id = errorId;
      errorContainer.className = 'form-error';
      errorContainer.style.cssText = `
        display: none;
        font-size: 0.75rem;
        color: #e53e3e;
        margin-top: 4px;
        font-weight: 500;
        letter-spacing: 0.02em;
      `;
      input.parentElement.appendChild(errorContainer);
    }
    
    return errorContainer;
  }

  function showError(input, errorContainer, message) {
    errorContainer.textContent = message;
    errorContainer.style.display = 'block';
    
    // Añadir clase de error al input
    input.style.borderColor = CONFIG.errorColor;
    input.style.backgroundColor = 'rgba(229, 62, 62, 0.03)';
    
    // Accesibilidad
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', errorContainer.id);
  }

  function clearError(input, errorContainer) {
    errorContainer.style.display = 'none';
    errorContainer.textContent = '';
    
    // Restaurar estilos
    input.style.borderColor = '';
    input.style.backgroundColor = '';
    
    input.removeAttribute('aria-invalid');
    input.removeAttribute('aria-describedby');
  }

  // =========================================================================
  // MANEJO DEL ENVÍO DEL FORMULARIO
  // =========================================================================
  function handleFormSubmit(e, form, nameInput, whatsappInput) {
    // Validar antes de permitir envío
    const isNameValid = validateName(nameInput);
    const isWhatsappValid = validateWhatsapp(whatsappInput);

    if (!isNameValid || !isWhatsappValid) {
      e.preventDefault();
      
      // Scroll hasta el primer error
      const firstError = form.querySelector('[aria-invalid="true"]');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstError.focus();
      }
      
      return false;
    }

    // Si hay número internacional, usarlo para el envío
    const itiWrapper = document.getElementById('iti-wrapper');
    if (itiWrapper && whatsappInput.dataset.internationalFormat) {
      whatsappInput.value = whatsappInput.dataset.internationalFormat;
    }

    // Permitir envío del formulario
    return true;
  }

  // =========================================================================
  // INICIALIZAR AL CARGAR EL DOM
  // =========================================================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeFormValidation);
  } else {
    initializeFormValidation();
  }

  // Exponer función global para reinicializar si es necesario
  window.reinitializeFormValidation = initializeFormValidation;

})();
