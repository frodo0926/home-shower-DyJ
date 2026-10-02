import { SITE_URL } from "../config.js";

export const PLANTILLAS = [
  {
    id: "tarjeta-boda",
    label: "Tarjeta boda (HTML)"
  },
  {
    id: "invitacion-web",
    label: "Invitación web"
  },
  {
    id: "home-shower",
    label: "Home Shower"
  },
  {
    id: "recordatorio",
    label: "Recordatorio RSVP"
  },
  {
    id: "gracias",
    label: "Agradecimiento"
  }
];

export function buildMensaje(plantillaId, { nombres, alias } = {}) {
  const quien = alias || nombres || "querido/a";
  const card = `${SITE_URL}/tarjetas/invitacion-card.html?nombre=${encodeURIComponent(nombres || "")}`;
  const web = `${SITE_URL}/invitacion`;
  const hogar = SITE_URL;

  switch (plantillaId) {
    case "tarjeta-boda":
      return `Hola ${quien} 🤍

Queremos que nos acompañes en este día tan especial. Aquí está tu invitación:

${card}

Jimena & Daniel
Domingo 29 de noviembre 2026 · 3:00 p.m.
Hacienda Bella Luna Campestre, Tibasosa, Boyacá`;
    case "invitacion-web":
      return `Hola ${quien} 🤍

Con inmensa alegría queremos compartir este momento contigo. Confirmá tu asistencia acá:

${web}

Jimena & Daniel · 29 de noviembre 2026`;
    case "home-shower":
      return `Hola ${quien} 🤍

Si querés hacernos un regalito para el hogar, armamos una lista con mucho cariño:

${hogar}

Con amor,
Jimena & Daniel`;
    case "recordatorio":
      return `Hola ${quien},

Un recordatorio con cariño: nos encantaría saber si nos acompañás el 29 de noviembre.

Confirmá acá: ${web}

Jimena & Daniel`;
    case "gracias":
      return `Hola ${quien},

Gracias por estar, por el abrazo y por el detalle. Nos hizo muy felices.

Jimena & Daniel`;
    default:
      return `Hola ${quien} 🤍\n\nJimena & Daniel`;
  }
}
