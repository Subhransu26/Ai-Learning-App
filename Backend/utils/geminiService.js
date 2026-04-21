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
export const generateQuiz = async (text, numQuestions = 5) => {
  const prompt = `
      You are an educational quiz generator.

      Generate exactly ${numQuestions} high-quality multiple-choice quiz questions based on the text below.

      Guidelines:
      - Focus on important concepts, definitions, and key ideas.
      - Each question must have exactly 4 options.
      - Only ONE option must be correct.
      - Avoid repeating similar questions.
      - Keep questions clear and suitable for students.
      - Explanations should briefly explain why the correct answer is right.

      Strict Output Format:

      Q: [Clear question]

      Q1: [Option 1]  
      Q2: [Option 2]  
      Q3: [Option 3]  
      Q4: [Option 4]  

      C: [Correct option exactly as written above]  
      E: [Short explanation of the correct answer]  
      D: [Difficulty level: Easy | Medium | Hard]

      Separate each question with:
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

    const questions = [];
    const questionsBlocks = generatedText.split("---").filter((q) => q.trim());

    for (const block of questionsBlocks) {
      const lines = block.trim().split("\n");
      let question = "";
      const options = [];
      let correctAnswer = "";
      let explanation = "";
      let difficulty = "medium"; // default difficulty

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("Q:")) {
          question = trimmed.substring(2).trim();
        } else if (
          trimmed.startsWith("Q1:") ||
          trimmed.startsWith("Q2:") ||
          trimmed.startsWith("Q3:") ||
          trimmed.startsWith("Q4:")
        ) {
          options.push(trimmed.substring(3).trim());
        } else if (trimmed.startsWith("C:")) {
          correctAnswer = trimmed.substring(2).trim();
        } else if (trimmed.startsWith("E:")) {
          explanation = trimmed.substring(2).trim();
        } else if (trimmed.startsWith("D:")) {
          const diff = trimmed.substring(2).trim().toLowerCase();
          if (["easy", "medium", "hard"].includes(diff)) {
            difficulty = diff;
          }
        }
      }
      if (question && options.length === 4 && correctAnswer) {
        questions.push({
          question,
          options,
          correctAnswer,
          explanation,
          difficulty,
        });
      }
    }

    return questions.slice(0, numQuestions); // return only the requested number of questions
  } catch (error) {
    console.error("Error generating quiz questions:", error);
    throw new Error("Failed to generate quiz questions");
  }
};

/**
 * Generate document summary
 * @param {string} text - Document text
 * @returns {Promise<string>} - Generated summary
 */
export const generateSummary = async (text) => {
  const prompt = `
    You are an intelligent study assistant.

    Summarize the following content for students.

    Guidelines:
    - Focus only on the most important ideas.
    - Keep explanations simple and clear.
    - Remove unnecessary details.
    - Preserve key facts, concepts, and definitions.

    Output Format:

    Summary:
    (A short paragraph explaining the core idea)

    Key Concepts:
    • concept 1
    • concept 2
    • concept 3

    Important Details:
    • detail 1
    • detail 2

    Text:
    ${text.substring(0, 20000)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    const generatedText = response.text;
    return generatedText;
  } catch (error) {
    console.error("Error generating summary:", error);
    throw new Error("Failed to generate Summary");
  }
};

/**
 * Chat with document contect
 * @param {string} question - User question
 * @param {Array<Object>} chunks - Relevant document chunks
 * @returns {Promise<string>}
 */
export const chatWithContext = async (question, chunks) => {
  const context = chunks
    .map((c, i) => `[Chunk ${i + 1}]\n${c.content}`)
    .join(`\n\n`);

  const prompt = `
    You are an AI study assistant.

    Answer the user's question based ONLY on the provided context.

    Guidelines:
    - Use simple, clear language suitable for students.
    - Be concise but informative.
    - Do not add information outside the given context.
    - If the answer is not found in the context, respond with:
      "Sorry, I don't know the answer based on the provided information."

    Context:
    ${context}

    Question:
    ${question}

    Answer:
    `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });
    const generatedText = response.text.trim();
    return generatedText.trim();
  } catch (error) {
    console.error("Error in chat with context:", error);
    throw new Error("Failed to process chat request");
  }
};

/**
 * Explain a specific concept from the document
 * @param {string} concept - Concept to explain
 * @param {Array<Object>} context - Relevant context
 * @returns {Promise<string>}
 */
export const explainConcept = async (concept, context) => {
  const prompt = `
    You are an AI study assistant.

    Explain the concept "${concept}" using the context provided below.

    Guidelines:
    - Use simple, clear language suitable for students.
    - Provide a well-structured explanation.
    - Include examples if they help understanding.
    - Do not include information outside the given context.

    Context:
    ${context.substring(0, 10000)}

    Explanation:
    `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });
    const generatedText = response.text.trim();
    return generatedText.trim();
  } catch (error) {
    console.error("Error in explain concept:", error);
    throw new Error("Failed to explain concept");
  }
};
