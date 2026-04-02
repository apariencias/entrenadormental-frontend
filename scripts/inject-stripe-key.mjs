/**
 * Sustituye el marcador en js/landing-calma.js por STRIPE_PUBLISHABLE_KEY
 * en tiempo de build (Netlify inyecta la variable de entorno).
 * No usar process.env en el bundle del cliente: el navegador no define `process`.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const TARGET = path.join(ROOT, "js", "landing-calma.js");
const MARKER = "_STRIPE_PUBLISHABLE_KEY_";

const key = process.env.STRIPE_PUBLISHABLE_KEY?.trim();
if (!key) {
  console.error(
    "Error de build: falta STRIPE_PUBLISHABLE_KEY. " +
      "Configúrala en Netlify: Site settings → Environment variables (ámbito Build)."
  );
  process.exit(1);
}
if (!key.startsWith("pk_")) {
  console.error(
    "Error de build: STRIPE_PUBLISHABLE_KEY debe ser la clave pública (empieza por pk_)."
  );
  process.exit(1);
}

let source = fs.readFileSync(TARGET, "utf8");
if (!source.includes(MARKER)) {
  console.error(
    `Error de build: no se encontró el marcador ${MARKER} en ${path.relative(ROOT, TARGET)}.`
  );
  process.exit(1);
}

source = source.split(MARKER).join(key);
fs.writeFileSync(TARGET, source, "utf8");
console.log(`OK: clave pública de Stripe inyectada en ${path.relative(ROOT, TARGET)}`);
