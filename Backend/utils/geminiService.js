import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

if (!process.env.GOOGLE_GENAI_API_KEY) {
  console.error(
    "FATAL ERROR: GOOGLE_GENAI_API_KEY is not defined in environment variables",
  );
  process.exit(1);
}

/**
 * Generate FlashCards from text
 * @param {string} text - Document text to generate flashcards
 * @param {number} count - Number of flashcards to generate
 * @returns {Promise<Array<{question: string, answer: string, difficulty: string}>>}
 */
export const generateFlashcards = async (text, count = 10) => {
  const prompt = `
        You are an educational assistant.

        Generate exactly ${count} high-quality flashcards from the text below.

        Guidelines:
        - Questions must be clear, specific, and useful for studying.
        - Answers must be concise (1–3 sentences).
        - Focus on key concepts, definitions, and important ideas.
        - Avoid repeating similar questions.
        - Use simple language suitable for students.

        Output format (strictly follow this):

        Q: [Question]
        A: [Answer]
        D: [Difficulty: Easy | Medium | Hard]

        Separate each flashcard with:
        ---

        Text:
        ${text.substring(0, 15000)}
    `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    const generatedText = response.text;

    // parse the response to extract flashcards
    const flashcards = [];
    const cards = generatedText.split("---").filter((c) => c.trim());

    for (const card of cards) {
      const lines = card.trim().split("\n");

      let question = "";
      let answer = "";
      let difficulty = "medium"; // default difficulty

      for (const line of lines) {
        if (line.startsWith("Q:")) {
          question = line.substring(2).trim();
        } else if (line.startsWith("A:")) {
          answer = line.substring(2).trim();
        } else if (line.startsWith("D:")) {
          const diff = line.substring(2).trim().toLowerCase();

          if (["easy", "medium", "hard"].includes(diff)) {
            difficulty = diff;
          }
        }
      }

      if (question && answer) {
        flashcards.push({ question, answer, difficulty });
      }
    }

    return flashcards.slice(0, count); // return only the requested number of flashcards
  } catch (error) {
    console.error("Error generating flashcards:", error);
    throw new Error("Failed to generate flashcards");
  }
};

/**
 * Generate Quiz Questions
 * @param {string} text - Document text
 * @param {number} numQuestions - Number of quiz questions to generate
 * @returns {Promise<Array<{question: string, options: Array, CorrectAnswer: string, explanation: string, difficulty: string}>>}
 */

// TODO
