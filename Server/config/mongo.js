import mongoose from "mongoose";
import { config } from "dotenv";

config();

const dbconnect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB conectado correctamente");
  } catch (err) {
    throw new Error("Falló la conexión a la base de datos: " + err.message, { cause: err });
  }
};
export default dbconnect;
