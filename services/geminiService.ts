import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const apiKey = process.env.API_KEY || '';
// Initialize only if key exists to prevent immediate crashes, but UI should handle missing keys gracefully.
const ai = new GoogleGenAI({ apiKey: apiKey });

/**
 * Sends a message to the Gemini chatbot.
 * Uses gemini-3-pro-preview as requested.
 */
export const sendMessageToGemini = async (message: string, history: { role: string, parts: { text: string }[] }[] = []) => {
  try {
    // We construct a new chat instance or use generateContent. 
    // For a simple stateless wrapper, we can use generateContent with history if we managed it manually, 
    // but using the chat helper is cleaner.
    const chat = ai.chats.create({
      model: 'gemini-3-pro-preview',
      history: history.map(h => ({
        role: h.role,
        parts: h.parts
      })),
      config: {
        systemInstruction: "You are a helpful, encouraging, and academic study assistant for college students. Keep answers concise but thorough.",
      }
    });

    const response: GenerateContentResponse = await chat.sendMessage({ message });
    return response.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    throw error;
  }
};

/**
 * Analyzes an image with a prompt.
 * Uses gemini-3-pro-preview as requested.
 */
export const analyzeImageWithGemini = async (base64Image: string, mimeType: string, prompt: string) => {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: prompt || "Analyze this image and explain its educational content.",
          },
        ],
      },
    });
    
    return response.text || "Analysis complete, but no text returned.";
  } catch (error) {
    console.error("Gemini Vision Error:", error);
    throw error;
  }
};