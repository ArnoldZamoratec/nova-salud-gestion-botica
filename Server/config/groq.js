import OpenAI from "openai";
import dotenv from "dotenv";
import { ServiceUnavailableError } from "../utils/errors.js";

dotenv.config();

// El chatbot es opcional: sin GROQ_API_KEY el servidor arranca igual
// y solo el endpoint del chat responde 503.
const groq = process.env.GROQ_API_KEY
  ? new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    })
  : {
      chat: {
        completions: {
          create: async () => {
            throw new ServiceUnavailableError(
              "El asistente virtual no está configurado (falta GROQ_API_KEY).",
            );
          },
        },
      },
    };

export default groq;
