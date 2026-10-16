import { ChatRepository } from "./chat.repository.js";
import groq from "../../config/groq.js";
import { BadRequestError } from "../../utils/errors.js";
import { getDbContext } from "../../helpers/chat.helpers.js";

export const ChatService = {
  getChatHistory: async (userId) => {
    let chat = await ChatRepository.findByUserId(userId);
    if (!chat) {
      chat = await ChatRepository.createChat({ user: userId, messages: [] });
    }
    return chat.messages;
  },

  sendMessage: async (userId, message) => {
    if (!message || message.trim() === "") {
      throw new BadRequestError("El contenido del mensaje es obligatorio");
    }

    let chat = await ChatRepository.findByUserId(userId);
    if (!chat) {
      chat = await ChatRepository.createChat({ user: userId, messages: [] });
    }

    const dbContext = await getDbContext(userId, message);
    const defaultModel = process.env.GROQ_MODEL || "openai/gpt-oss-20b";

    const systemPrompt = `Eres un asistente experto de la botica Nova Salud (Perú).
    Tu nombre es NovaBot. Tu objetivo es ayudar a los clientes a encontrar medicamentos, consultar el estado de sus pedidos, revisar su carrito y dar orientación general.

    Pautas:
    1. Sé siempre amable, servicial, profesional y cordial.
    2. Incluye un descargo médico al responder preguntas de salud: "Nota: soy un asistente de IA. Ante condiciones médicas serias, consulta con un profesional de la salud."
    3. Responde siempre en español. Los precios están en soles (S/).
    4. Mantén tus respuestas concisas, claras y útiles.
    5. Usa el contexto de la base de datos para dar información precisa sobre pedidos, carrito y productos disponibles del usuario. Si pregunta por un pedido o su carrito y aparecen en el contexto, menciónalos. Si el producto no tiene stock o no está en el contexto, sugiere alternativas con amabilidad.
    6. Nunca recomiendes dosis de medicamentos que requieren receta; deriva al químico farmacéutico o al médico.

    Fecha actual: ${new Date().toLocaleDateString("es-PE")}

    [CONTEXTO DE LA BASE DE DATOS]
    ${dbContext}`;

    const recentHistoryLimit = 10;
    const recentMessages = chat.messages
      .slice(-recentHistoryLimit)
      .map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

    const groqMessages = [
      { role: "system", content: systemPrompt },
      ...recentMessages,
      { role: "user", content: message },
    ];

    const response = await groq.chat.completions.create({
      model: defaultModel,
      messages: groqMessages,
      temperature: 0.7,
      max_tokens: 1024,
    });

    const assistantReply = response.choices[0].message.content;

    chat.messages.push({ role: "user", content: message });
    chat.messages.push({ role: "assistant", content: assistantReply });

    await ChatRepository.saveChat(chat);

    return {
      reply: assistantReply,
      history: chat.messages,
    };
  },

  clearChatHistory: async (userId) => {
    const chat = await ChatRepository.findByUserId(userId);
    if (chat) {
      chat.messages = [];
      await ChatRepository.saveChat(chat);
    }
  },
};
