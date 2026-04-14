import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.warn("⚠️ VITE_GEMINI_API_KEY is missing in .env. AI features will be disabled.");
}

const genAI = new GoogleGenerativeAI(API_KEY || "");

// Default Generation Config
const generationConfig = {
  temperature: 0.7,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 2048,
};

// System Instruction: Defining the personality and rules for Nexus AI
const systemInstruction = `
You are Nexus AI, the core intelligence of the Nexus Task Management System. 
Your goal is to be a professional, concise, and highly efficient productivity assistant.

RULES:
1. You have access to the user's current activities, events, and vault notes (provided in the prompt context).
2. Use this context to provide personalized advice.
3. If the user wants to create a task or event, you MUST suggest it in a valid JSON format at the end of your message.
   FORMAT: [JSON_START] { "type": "task", "title": "name", "date": "YYYY-MM-DD", "time": "HH:mm" } [JSON_END]
4. Always prioritize clarity. Use Markdown for formatting.
5. You can summarize notes from the Nexus Vault if asked.
6. The current date and time will be provided to you. Use it to resolve relative times like "tomorrow" or "next hour".
`;

export const nexusModel = genAI.getGenerativeModel({
  model: "gemini-3-flash-preview",
  systemInstruction,
});

export const startNexusChat = (history = []) => {
  return nexusModel.startChat({
    generationConfig,
    history,
  });
};
