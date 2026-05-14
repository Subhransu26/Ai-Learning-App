import Document from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";
import ChatHistory from "../models/ChatHistory.js";

import * as geminiService from "../utils/geminiService.js";
import { findRelevantChunks } from "../utils/textChunker.js";

// @desc: Generate FlashCards from document
// @route: POST /api/ai/generate-flashcards
// @access: Private
export const generateFlashcards = async (req, res, next) => {
  try {
    const { documentId, count = 10 } = req.body;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: "Document ID is required",
        statusCode: 400,
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      status: "ready",
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found or not ready",
        statusCode: 404,
      });
    }

    // Generate flashcards using Gemini
    const cards = await geminiService.generateFlashcards(
      document.extractedText,
      parseInt(count),
    );

    // save flashcards to database
    const flashcardSet = await Flashcard.create({
      userId: req.user._id,
      documentId: document._id,
      cards: cards.map((card) => ({
        question: card.question,
        answer: card.answer,
        difficulty: card.difficulty,
        reviewCount: 0,
        isStarred: false, //means marked as important / favorite
      })),
    });

    return res.status(201).json({
      success: true,
      data: flashcardSet,
      message: "Flashcards generated successfully",
      statusCode: 201,
    });
  } catch (error) {
    next(error);
  }
};

// @desc: Generate Quiz from document
// @route: POST /api/ai/generate-quiz
// @access: Private
export const generateQuiz = async (req, res, next) => {
  try {
    const { documentId, noOfQuestions = 5, title } = req.body;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: "Document ID is required",
        statusCode: 400,
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      status: "ready",
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found or not ready",
        statusCode: 404,
      });
    }

    // Generate quiz using Gemini
    const questions = await geminiService.generateQuiz(
      document.extractedText,
      parseInt(noOfQuestions),
    );

    // save quiz to database
    const quiz = await Quiz.create({
      userId: req.user._id,
      documentId: document._id,
      title: title || `${document.title} Quiz`,
      questions: questions,
      totalQuestions: questions.length,
      userAnswers: [], // to store user's answers when they take the quiz
      score: 0, // to store user's score after taking the quiz
    });

    return res.status(201).json({
      success: true,
      data: quiz,
      message: "Quiz generated successfully",
      statusCode: 201,
    });
  } catch (error) {
    next(error);
  }
};

// @desc: Generate Summary from document
// @route: POST /api/ai/generate-summary
// @access: Private
export const generateSummary = async (req, res, next) => {
  try {
    const { documentId } = req.body;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: "Document ID is required",
        statusCode: 400,
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      status: "ready",
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found or not ready",
        statusCode: 404,
      });
    }

    // Generate summary using Gemini
    const summary = await geminiService.generateSummary(document.extractedText);
    return res.status(200).json({
      success: true,
      data: {
        documentId: document._id,
        title: document.title,
        summary: summary,
      },
      message: "Summary generated successfully",
      statusCode: 200,
    });
  } catch (error) {
    next(error);
  }
};

// @desc: Chat with AI about document
// @route: POST /api/ai/chat
// @access: Private
export const chat = async (req, res, next) => {
  try {
    const { documentId, question } = req.body;

    if (!documentId || !question) {
      return res.status(400).json({
        success: false,
        error: "Document ID and question are required",
        statusCode: 400,
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      status: "ready",
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found or not ready",
        statusCode: 404,
      });
    }

    // Find relevant chunks of text from the document to provide context for the AI
    const relevantChunks = findRelevantChunks(document.chunks, question, 3);
    const chunkIndices = relevantChunks.map((c) => c.chunkIndex);

    // Get or create chat history for this document
    let chatHistory = await ChatHistory.findOne({
      userId: req.user._id,
      documentId: document._id,
    });

    if (!chatHistory) {
      chatHistory = await ChatHistory.create({
        userId: req.user._id,
        documentId: document._id,
        messages: [],
      });
    }

    // Generate response using GeminiAI
    const answer = await geminiService.chatWithContext(
      question,
      relevantChunks,
    );

    // Save the question and answer to chat history
    chatHistory.messages.push(
      {
        role: "user",
        content: question,
        timestamp: new Date(),
        relevantChunks: [],
      },
      {
        role: "assistant",
        content: answer,
        timestamp: new Date(),
        relevantChunks: chunkIndices,
      },
    );

    await chatHistory.save();

    return res.status(200).json({
      success: true,
      data: {
        question,
        answer,
        relevantChunks: chunkIndices,
        chatHistoryId: chatHistory._id,
      },
      message: "Chat response generated successfully",
      statusCode: 200,
    });
  } catch (error) {
    next(error);
  }
};

// @desc: Explain concept from document
// @route: POST /api/ai/explain-concept
// @access: Private
export const explainConcept = async (req, res, next) => {
  try {
    const { documentId, concept } = req.body;

    if (!documentId || !concept) {
      return res.status(400).json({
        success: false,
        error: "Document ID and concept are required",
        statusCode: 400,
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      status: "ready",
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found or not ready",
        statusCode: 404,
      });
    }

    // Find relevant chunks for the concept
    const relevantChunks = findRelevantChunks(document.chunks, concept, 3);
    const context = relevantChunks.map((c) => c.content).join("\n\n");

    // Generate explanation using GeminiAI
    const explanation = await geminiService.explainConcept(concept, context);

    return res.status(200).json({
      success: true,
      data: {
        concept,
        explanation,
        relevantChunks: relevantChunks.map((c) => c.chunkIndex),
      },
      message: "Concept explanation generated successfully",
      statusCode: 200,
    });
  } catch (error) {
    next(error);
  }
};

// @desc: Get chat history for document
// @route: GET /api/ai/chat-history/:documentId
// @access: Private
export const getChatHistory = async (req, res, next) => {
  try {
    const { documentId } = req.params;

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
        statusCode: 404,
      });
    }

    const chatHistory = await ChatHistory.findOne({
      userId: req.user._id,
      documentId: document._id,
    }).select("messages"); // only retrieve the messsages array

    if (!chatHistory) {
      return res.status(200).json({
        success: true,
        data: [], // return empty array if no chat history found
        message: "No chat history found for this document",
        statusCode: 200,
      });
    }

    return res.status(200).json({
      success: true,
      data: chatHistory.messages,
      message: "Chat history retrieved successfully",
      statusCode: 200,
    });
  } catch (error) {
    next(error);
  }
};
