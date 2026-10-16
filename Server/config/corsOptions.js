import { ForbiddenError } from "../utils/errors.js";

// Orígenes permitidos: entorno local y el frontend desplegado (FRONTEND_URL, separados por coma)
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  ...(process.env.FRONTEND_URL || "").split(",").map((o) => o.trim()),
].filter(Boolean);

export const corsOptions = {
  origin: (origin, callback) => {
    // Permite solicitudes sin origen (apps móviles, Postman, etc.)
    if (!origin) return callback(null, true);

    if (
      allowedOrigins.includes(origin) ||
      origin.startsWith("http://localhost:")
    ) {
      return callback(null, true);
    }
    return callback(new ForbiddenError(`Origen no permitido por CORS: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  credentials: true,
};
