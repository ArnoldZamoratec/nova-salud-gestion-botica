import { config } from "dotenv";
import app from "./app.js";
import dbconnect from "./config/mongo.js";

config();

const port = process.env.PORT || 3000;
const HOST = process.env.IP || "0.0.0.0";

dbconnect()
  .then(() => {
    app.listen(port, HOST, () =>
      console.log(`Servidor ejecutándose en http://${HOST}:${port}`),
    );
  })
  .catch((err) => {
    console.error("No se pudo conectar a la BD o iniciar el servidor:", err.message);
  });

  
