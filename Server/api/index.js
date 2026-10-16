import app from "../app.js";
import dbconnect from "../config/mongo.js";

// Inicializa la conexión a la BD (mongoose la reutiliza entre invocaciones serverless)
dbconnect().catch((err) => {
  console.error("Error de conexión a la base de datos al iniciar (serverless):", err);
});

export default app;
