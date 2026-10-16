import rateLimit from "express-rate-limit";

// Limitador de registros
export const signupLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  message: {
    status: 429,
    error: "Demasiados intentos de registro, inténtalo más tarde",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limitador de inicios de sesión
export const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: {
    status: 429,
    error: "Demasiados intentos de inicio de sesión, inténtalo más tarde",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
