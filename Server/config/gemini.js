import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: `Eres un asistente de IA que trabaja dentro del sistema de la botica Nova Salud (Perú). Responde siempre en español, de forma breve y clara.`,
});

export default model;