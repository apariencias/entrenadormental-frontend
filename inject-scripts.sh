#!/usr/bin/env bash

# Script para inyectar los CDN scripts de intl-tel-input y validación

# Array de archivos HTML a actualizar
files=(
    "c:/Users/new0005/Desktop/entrenadormental-frontend/la-calma-de-mama.html"
    "c:/Users/new0005/Desktop/entrenadormental-frontend/pareja-ideal.html"
)

# Script a inyectar antes del cierre </body>
injection="
    <!-- intl-tel-input CDN -->
    <link rel=\"stylesheet\" href=\"https://cdn.jsdelivr.net/npm/intl-tel-input@24.0.0/build/css/intlTelInput.css\">
    <script src=\"https://cdn.jsdelivr.net/npm/intl-tel-input@24.0.0/build/js/intlTelInput.min.js\"><\/script>

    <!-- Form Validation Script -->
    <script src=\"js/form-validation.js\"><\/script>"

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        # Reemplazar </body> con los scripts + </body>
        sed -i "s|</body>|$injection\n</body>|g" "$file"
        echo "✅ Inyectados scripts en: $file"
    else
        echo "❌ Archivo no encontrado: $file"
    fi
done

echo "Proceso completado."
